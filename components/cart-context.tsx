'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';

interface CartItem {
  productoId: string;
  cantidad: number;
}

interface CartContextType {
  items: CartItem[];
  updateQuantity: (productoId: string, cantidad: number) => void;
  removeFromCart: (productoId: string) => void;
  clearCart: () => void;
  totalItems: number;
  cartAnimation: boolean;
  triggerCartAnimation: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'joyeria_bella_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [cartAnimation, setCartAnimation] = useState(false);
  const [prevTotal, setPrevTotal] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      } catch (e) {
        console.warn('Error parsing cart from localStorage');
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const updateQuantity = useCallback((productoId: string, cantidad: number) => {
    const oldTotal = items.reduce((sum, item) => sum + item.cantidad, 0);
    
    if (cantidad <= 0) {
      setItems(prev => prev.filter(item => item.productoId !== productoId));
    } else {
      setItems(prev => {
        const exists = prev.find(item => item.productoId === productoId);
        if (exists) {
          return prev.map(item =>
            item.productoId === productoId ? { ...item, cantidad } : item
          );
        }
        return [...prev, { productoId, cantidad }];
      });
    }
    
    const newTotal = oldTotal + (cantidad > 0 ? 1 : 0);
    if (cantidad > 0 && newTotal > oldTotal) {
      setPrevTotal(oldTotal);
      setCartAnimation(true);
      setTimeout(() => setCartAnimation(false), 500);
    }
  }, [items]);

  const removeFromCart = useCallback((productoId: string) => {
    setItems(prev => prev.filter(item => item.productoId !== productoId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const triggerCartAnimation = useCallback(() => {
    setCartAnimation(true);
    setTimeout(() => setCartAnimation(false), 500);
  }, []);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.cantidad, 0), [items]);

  const contextValue = useMemo(() => ({
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    cartAnimation,
    triggerCartAnimation,
  }), [items, updateQuantity, removeFromCart, clearCart, totalItems, cartAnimation, triggerCartAnimation]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
