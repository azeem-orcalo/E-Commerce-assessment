'use client';

import { CartProvider } from '@/lib/CartContext';
import CartDrawer from '@/components/CartDrawer';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
