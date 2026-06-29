'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccessToken, favoritesApi, type ApiProduct } from './api';

const STORAGE_KEY = 'ba_favorites';

function load(): ApiProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(items: ApiProduct[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<ApiProduct[]>([]);

  // On mount: load from API if authenticated, else fall back to localStorage
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      favoritesApi
        .list()
        .then((res) => {
          const items = res.data.data as ApiProduct[];
          setFavorites(items);
          persist(items);
        })
        .catch(() => setFavorites(load()));
    } else {
      setFavorites(load());
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setFavorites(load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = useCallback((product: ApiProduct) => {
    // Optimistic update first for instant UI feedback
    setFavorites((prev) => {
      const next = prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product];
      persist(next);
      return next;
    });

    // Background sync with backend when authenticated
    const token = getAccessToken();
    if (token) {
      favoritesApi.toggle(product.id).catch(() => {
        // Revert optimistic update on failure
        setFavorites((prev) => {
          const reverted = prev.some((p) => p.id === product.id)
            ? prev.filter((p) => p.id !== product.id)
            : [...prev, product];
          persist(reverted);
          return reverted;
        });
      });
    }
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some((p) => p.id === id),
    [favorites],
  );

  const syncFromApi = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const res = await favoritesApi.list();
      const items = res.data.data as ApiProduct[];
      setFavorites(items);
      persist(items);
    } catch {
      // keep current state on error
    }
  }, []);

  const clear = useCallback(() => {
    setFavorites([]);
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { favorites, toggle, isFavorite, clear, syncFromApi };
}
