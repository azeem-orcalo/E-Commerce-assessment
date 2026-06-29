'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  cartApi,
  getStoredUser,
  type CartItem,
  type AddCartItemPayload,
} from './api';

export type AddItemResult = 'success' | 'auth_required' | 'error';

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  total: number;
  loading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (payload: AddCartItemPayload) => Promise<AddItemResult>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  resetCartState: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + item.quantity * parseFloat(item.product.price),
    0,
  );

  const refreshCart = useCallback(async () => {
    if (!getStoredUser()) return;
    try {
      const res = await cartApi.get();
      setItems(res.data.items ?? []);
    } catch {
      // silently ignore 401 / network errors
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const resetCartState = useCallback(() => {
    setItems([]);
    setIsOpen(false);
  }, []);

  const addItem = useCallback(
    async (payload: AddCartItemPayload): Promise<AddItemResult> => {
      if (!getStoredUser()) return 'auth_required';
      setLoading(true);
      try {
        await cartApi.addItem(payload);
        await refreshCart();
        return 'success';
      } catch {
        return 'error';
      } finally {
        setLoading(false);
      }
    },
    [refreshCart],
  );

  const removeItem = useCallback(async (itemId: string) => {
    setLoading(true);
    try {
      await cartApi.removeItem(itemId);
      await refreshCart();
    } catch {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        return removeItem(itemId);
      }
      setLoading(true);
      try {
        await cartApi.updateItem(itemId, quantity);
        await refreshCart();
      } catch {
        setItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
        );
      } finally {
        setLoading(false);
      }
    },
    [removeItem, refreshCart],
  );

  const clearCart = useCallback(async () => {
    try {
      await cartApi.clear();
    } catch {
      // ignore
    }
    setItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        itemCount,
        total,
        loading,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart,
        resetCartState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
