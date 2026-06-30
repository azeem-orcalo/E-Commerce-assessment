'use client';

import { useEffect, useState } from 'react';
import { CartProvider } from '@/lib/CartContext';
import CartDrawer from '@/components/CartDrawer';
import AuthModals from '@/components/AuthModals';
import { subscribeLoginModal } from '@/lib/authEvents';
export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);

  useEffect(() => {
    // CartDrawer calls openLoginModal() when a guest tries to checkout
    const unsub = subscribeLoginModal(() => setAuthModal('login'));
    return unsub;
  }, []);

  return (
    <CartProvider>
      {children}
      <CartDrawer />
      {/* Global auth modal — opened by CartDrawer for guest checkout */}
      <AuthModals
        mode={authModal}
        onClose={() => setAuthModal(null)}
        onSwitch={(to) => setAuthModal(to)}
      />
    </CartProvider>
  );
}
