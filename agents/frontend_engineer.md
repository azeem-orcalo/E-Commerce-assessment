# Agent: Frontend Engineer

## Role
Specialist in Next.js 14 (App Router), Tailwind CSS, React state management for shopping carts,
server/client component boundaries, and building clean customer-facing storefronts and admin panels
for the ThreadCo clothing e-commerce platform.

---

## Technology Anchors

| Concern | Implementation |
|---|---|
| Framework | Next.js 14 — App Router (`app/` directory), not Pages Router |
| Styling | Tailwind CSS utility classes — no CSS modules, no styled-components |
| Data fetching | Server Components for catalog pages; `fetch` with `cache: 'no-store'` for dynamic data |
| State | React Context + `useReducer` for cart state; `zustand` if complexity warrants |
| Auth | `accessToken` in React state/memory; `refresh_token` in httpOnly cookie (set by server) |
| Charts | Recharts — works inside `'use client'` components; import only named exports |
| Forms | Native `<form>` with React hooks; `react-hook-form` + `zod` for complex flows |
| Image | `next/image` for product images; `unoptimized` prop for external Unsplash URLs |

---

## Route Structure (app/)

```
app/
  (storefront)/
    page.tsx               # Home — hero + featured products + suggestions row
    products/
      page.tsx             # Catalog — filter sidebar + product grid
      [id]/
        page.tsx           # Product detail — image, info, variant selector, add-to-cart
    layout.tsx             # Storefront shell: nav, footer
  (auth)/
    login/page.tsx
    signup/page.tsx
  (account)/               # Protected — requires access token
    cart/page.tsx
    checkout/page.tsx
    orders/page.tsx
    orders/[id]/page.tsx
  admin/                   # Protected — requires ADMIN role
    layout.tsx             # Admin shell: sidebar nav
    page.tsx               # Dashboard — stats cards + order-status chart
    products/page.tsx      # Product table + create/edit modal
    orders/page.tsx        # Order management table + status update
  layout.tsx               # Root layout: AuthProvider, CartProvider
```

---

## Server vs Client Component Rules

**Server Components (default)** — no `'use client'` needed:
- Product catalog page (reads from API on server)
- Product detail page (SSR for SEO)
- Order history page

**Client Components** — must add `'use client'`:
- Any component using `useState`, `useEffect`, `useContext`
- Cart button, quantity selector
- Checkout form
- Admin forms (product create/edit)
- Recharts wrappers

Marking a component `'use client'` makes all its imports client-side too.
Keep client boundary as low in the tree as possible.

---

## API Client Pattern

All API calls go through a typed client in `lib/api-client.ts`:

```ts
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options?.headers,
    },
    credentials: 'include',   // sends refresh_token cookie automatically
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, err.message);
  }
  return res.json();
}
```

---

## Auth Flow (Client Side)

```
1. User submits login form
2. POST /api/auth/login → { user, accessToken } + sets refresh_token cookie (httpOnly)
3. Store accessToken in AuthContext (React state, not localStorage)
4. On 401 response → call POST /api/auth/refresh (cookie sent automatically)
5. On refresh success → update accessToken in context; retry original request
6. On logout → POST /api/auth/logout (server clears cookie) + clear context
```

Protected routes use a `withAuth` wrapper or `middleware.ts`:
```ts
// middleware.ts — runs on edge, redirects if no token in cookie
export { default } from 'next-auth/middleware'  // OR custom redirect logic
```

---

## Cart State Pattern

Cart is server-persisted (DB). The client maintains a local mirror for instant UI updates:

```ts
// CartContext
const [cart, dispatch] = useReducer(cartReducer, initialCart);

// Optimistic update: update local state immediately, then sync with API
dispatch({ type: 'ADD_ITEM', item });
await apiFetch('/cart/items', { method: 'POST', body: JSON.stringify(item), token });
// On API error: roll back local state
```

Cart is fetched fresh on mount via `GET /api/cart` (authenticated).
Guest users see "Login to add to cart" — no guest cart.

---

## Product Variants UI

Product detail page renders variant selectors from `product.variants` JSONB:

```tsx
// Sizes — rendered as button grid
{product.variants?.sizes.map(size => (
  <button
    key={size}
    onClick={() => setSelectedSize(size)}
    className={`px-3 py-1 border rounded ${selectedSize === size ? 'bg-black text-white' : 'border-gray-300'}`}
  >
    {size}
  </button>
))}

// Colors — rendered as swatches
{product.variants?.colors.map(color => (
  <button key={color} aria-label={color} title={color}
    className={`w-6 h-6 rounded-full border-2 ${selectedColor === color ? 'ring-2 ring-offset-1 ring-black' : ''}`}
    style={{ backgroundColor: colorMap[color] ?? color }}
    onClick={() => setSelectedColor(color)}
  />
))}
```

---

## Admin Panel Conventions

- All admin routes live under `app/admin/` — guarded by checking `user.role === 'ADMIN'` in layout
- Admin layout has a persistent left sidebar with nav links
- Product table: paginated `<table>` with edit/delete actions per row
- Order table: status badge color-coded by `OrderStatus` enum value
- Dashboard chart: Recharts `<PieChart>` or `<BarChart>` for order status distribution

```tsx
// Status badge colors
const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED:    'bg-purple-100 text-purple-800',
  DELIVERED:  'bg-green-100 text-green-800',
  CANCELLED:  'bg-red-100 text-red-800',
};
```

---

## Tailwind Conventions

- Color palette: slate/zinc for neutrals, `black`/`white` for primary actions
- Typography scale: `text-sm` for table cells, `text-lg`/`text-xl` for headings
- Card pattern: `bg-white rounded-lg shadow-sm border border-gray-100 p-6`
- Button primary: `bg-black text-white hover:bg-gray-800 rounded-md px-4 py-2`
- Button secondary: `border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md px-4 py-2`
- Grid for catalog: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`

---

## Price Display Rule

Prices come from the API as strings (Prisma `Decimal` → JSON string). Always parse and format:

```ts
const formatPrice = (price: string | number) =>
  `$${parseFloat(String(price)).toFixed(2)}`;
```

Never use `price.toFixed(2)` directly on a string — always `parseFloat(String(price))` first.
