# Agent: Integration Agent

## Role
Specialist in bridging the Next.js 14 frontend with the NestJS backend API. Responsible for:
- Refresh token rotation via httpOnly cookies
- Cart synchronisation between client state and server DB
- Typed API response contracts shared across the boundary
- Analytics data fetching and chart-ready transformation
- Error boundary and retry logic across the stack

---

## The Auth Cookie Contract

The backend sets `refresh_token` as an httpOnly, SameSite=Lax cookie on every auth response.
The frontend **never reads or writes this cookie directly** — it exists only to be sent automatically
by the browser on requests to the same origin.

```
Backend cookie config:
  Name:     refresh_token
  HttpOnly: true
  Secure:   true (production), false (dev)
  SameSite: lax
  MaxAge:   7 * 24 * 60 * 60 * 1000 ms (7 days)
  Path:     /

Frontend must:
  fetch(..., { credentials: 'include' })  ← required for cross-origin cookie in dev
```

If `NEXT_PUBLIC_API_URL` points to `localhost:3001` while the app runs on `localhost:3000`,
both same-site and `credentials: 'include'` must be set. CORS on the backend must whitelist
`FRONTEND_URL` with `credentials: true`.

---

## Token Refresh Interceptor

Centralise retry logic in `lib/api-client.ts`:

```ts
export async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  let res = await rawFetch(path, opts);

  if (res.status === 401 && !opts._retry) {
    // Attempt silent refresh — cookie is sent automatically
    const refreshRes = await rawFetch('/auth/refresh', { method: 'POST' });
    if (refreshRes.ok) {
      const { accessToken } = await refreshRes.json();
      opts.token = accessToken;
      opts._retry = true;
      // Notify AuthContext to update its token
      window.dispatchEvent(new CustomEvent('token:refreshed', { detail: accessToken }));
      res = await rawFetch(path, opts);
    } else {
      // Refresh failed — session is expired, redirect to login
      window.dispatchEvent(new CustomEvent('auth:expired'));
      throw new ApiError(401, 'Session expired');
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}
```

`AuthContext` listens for `token:refreshed` to update in-memory accessToken.
`AuthContext` listens for `auth:expired` to clear state and redirect to `/login`.

---

## Cart Sync Strategy

The server is the source of truth. Client mirrors server state optimistically:

```
On mount (CartProvider):
  1. If user is authenticated, GET /api/cart
  2. Hydrate local cart state from response
  3. Show cart item count in nav immediately

On ADD_ITEM action:
  1. Optimistically update local state (instant UI)
  2. POST /api/cart/items { productId, quantity }
  3. On success: update local state with server response (reconcile)
  4. On failure: roll back local state, show toast error

On tab visibility change (visibilitychange event):
  - Re-fetch cart when tab becomes visible (handles multi-tab edits)
```

**Never** derive cart totals client-side from product.price — use server response totals.
Server returns cart with `items[].product.price` (current) for display, but checkout uses
`priceAtPurchase` which is snapshotted server-side.

---

## Shared API Types (lib/types.ts)

Keep a single types file that mirrors the backend's response shapes:

```ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;           // Decimal → JSON string from Prisma
  imageUrl: string | null;
  stock: number;
  material: string | null;
  variants: { sizes: string[]; colors: string[] } | null;
  category: { id: string; name: string };
  createdAt: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  product: Pick<Product, 'id' | 'name' | 'price' | 'imageUrl' | 'stock' | 'variants'>;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface Order {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: string;  // Decimal string
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    priceAtPurchase: string;
    product: Pick<Product, 'id' | 'name' | 'imageUrl'>;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}
```

---

## Analytics Data Transformation

The dashboard stats endpoint returns:
```json
{
  "data": {
    "totalRevenue": "12453.50",
    "ordersByStatus": { "PENDING": 12, "PROCESSING": 8, "SHIPPED": 5, "DELIVERED": 34, "CANCELLED": 3 },
    "topProducts": [{ "productId": "...", "name": "...", "unitsSold": 47 }]
  }
}
```

Transform for Recharts `<PieChart>` (order status distribution):
```ts
const pieData = Object.entries(stats.ordersByStatus).map(([status, count]) => ({
  name: status,
  value: count,
}));

const PIE_COLORS = {
  PENDING: '#FBBF24',
  PROCESSING: '#60A5FA',
  SHIPPED: '#A78BFA',
  DELIVERED: '#34D399',
  CANCELLED: '#F87171',
};
```

Transform for Recharts `<BarChart>` (top products):
```ts
const barData = stats.topProducts.map(p => ({
  name: p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name,
  units: p.unitsSold,
}));
```

---

## Environment Variable Contract

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Backend (.env)
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
PORT=3001
NODE_ENV=development
```

In Next.js, only `NEXT_PUBLIC_*` vars are exposed to the browser.
Server-side API calls (in Server Components or route handlers) can use `process.env.API_URL`
without the `NEXT_PUBLIC_` prefix for added security.

---

## Product Query String Building

Product catalog page builds query params from filter state:

```ts
function buildProductQuery(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  if (filters.search)     params.set('search', filters.search);
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.minPrice)   params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice)   params.set('maxPrice', String(filters.maxPrice));
  if (filters.sortBy)     params.set('sortBy', filters.sortBy);
  if (filters.order)      params.set('order', filters.order);
  params.set('page',  String(filters.page ?? 1));
  params.set('limit', String(filters.limit ?? 12));
  return params.toString();
}

// Usage
const products = await apiFetch<PaginatedResponse<Product>>(
  `/products?${buildProductQuery(filters)}`,
);
```

---

## Error Boundary Pattern

Wrap all async data fetches in try/catch with typed error handling:

```ts
try {
  const result = await apiFetch('/orders/checkout', { method: 'POST', ... });
  router.push(`/orders/${result.data.id}?confirmed=true`);
} catch (err) {
  if (err instanceof ApiError) {
    if (err.status === 422) setError('One or more items are out of stock.');
    else if (err.status === 401) router.push('/login');
    else setError('Checkout failed. Please try again.');
  }
}
```

Never swallow errors silently. Every user-visible action must have a loading state and error state.
