import axios, { AxiosError } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_KEY = 'ba_access_token';
const USER_KEY = 'ba_user';

let accessToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAccessToken() {
  return accessToken;
}

export function setStoredUser(user: { id: string; email: string; firstName: string; lastName: string; role: string } | null) {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): { id: string; email: string; firstName: string; lastName: string; role: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        setAccessToken(data.accessToken);
        if (original) {
          original.headers = original.headers ?? {};
          original.headers['Authorization'] = `Bearer ${data.data.accessToken}`;
          return api(original);
        }
      } catch {
        setAccessToken(null);
        setStoredUser(null);
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload),

  refresh: () =>
    api.post<AuthResponse>('/auth/refresh'),

  logout: () =>
    api.post('/auth/logout'),
};

// ─── Products & Categories ───────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string | null;
  stock: number;
  categoryId: string;
  category: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ProductsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductsResponse {
  data: ApiProduct[];
  meta: ProductsMeta;
}

export interface ProductsQueryParams {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'featured' | 'best_seller' | 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}

export const productsApi = {
  list: (params?: ProductsQueryParams) =>
    api.get<ProductsResponse>('/products', { params }),
  getOne: (id: string) =>
    api.get<ApiProduct>(`/products/${id}`),
};

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories'),
};

// ─── Favorites ───────────────────────────────────────────────────────────────

export interface FavoriteToggleResponse {
  productId: string;
  favorited: boolean;
}

export interface FavoritesListResponse {
  data: (ApiProduct & { favorited: boolean })[];
}

export const favoritesApi = {
  /** Toggle on/off — returns { productId, favorited: boolean } */
  toggle: (productId: string) =>
    api.post<FavoriteToggleResponse>(`/favorites/${productId}`),

  /** Check a single product's favorite status */
  check: (productId: string) =>
    api.get<FavoriteToggleResponse>(`/favorites/${productId}`),

  /** List all favorited products */
  list: () => api.get<FavoritesListResponse>('/favorites'),
};

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItemProduct {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
  stock: number;
  category: { id: string; name: string };
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  chosenColor?: string | null;
  chosenSize?: string | null;
  product: CartItemProduct;
}

export interface CartData {
  id: string;
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface CartApiResponse extends CartData {
  total?: string;
}

export interface AddCartItemPayload {
  productId: string;
  quantity: number;
  chosenColor?: string;
  chosenSize?: string;
}

export const cartApi = {
  get: () =>
    api.get<CartApiResponse>('/cart'),
  addItem: (payload: AddCartItemPayload) =>
    api.post<CartApiResponse>('/cart/items', payload),
  updateItem: (productId: string, quantity: number) =>
    api.patch<CartApiResponse>(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId: string) =>
    api.delete<CartApiResponse>(`/cart/items/${productId}`),
  clear: () =>
    api.delete('/cart'),
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export type PaymentMethod = 'COD' | 'CARD';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtPurchase: string;
  product: { id: string; name: string; imageUrl: string | null; price: string };
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount: string;
  stripePaymentIntentId?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutPayload {
  paymentMethod: PaymentMethod;
}

export interface CheckoutResponse {
  orderId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount: string;
  clientSecret?: string;
  items: OrderItem[];
}

export const ordersApi = {
  checkout: (payload: CheckoutPayload) =>
    api.post<CheckoutResponse>('/orders/checkout', payload),
  list: () => api.get<Order[]>('/orders'),
  getOne: (id: string) => api.get<Order>(`/orders/${id}`),
};

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

export interface CreateReviewPayload {
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
}

export interface ReviewCheckResponse {
  reviewed: boolean;
  review: Review | null;
}

export const reviewsApi = {
  create: (payload: CreateReviewPayload) =>
    api.post<Review>('/reviews', payload),
  findByProduct: (productId: string) =>
    api.get<Review[]>('/reviews/product', { params: { productId } }),
  check: (productId: string, orderId: string) =>
    api.get<ReviewCheckResponse>('/reviews/check', { params: { productId, orderId } }),
};

// ─── Utilities ───────────────────────────────────────────────────────────────

export function extractApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(' ');
    if (typeof msg === 'string') return msg;
    return error.message;
  }
  return 'An unexpected error occurred.';
}
