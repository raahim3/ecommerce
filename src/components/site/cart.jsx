import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const CartContext = createContext(null);

const PROMO_CODES = {
  ATELIER10: { rate: 0.1, label: "10% off entire order" },
  WELCOME20: { rate: 0.2, label: "20% welcome discount" },
  VIP15: { rate: 0.15, label: "15% VIP member discount" },
};

const STORAGE_KEYS = {
  CART: "atelier_cart_items_v1",
  WISHLIST: "atelier_wishlist_items_v1",
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CART);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage", e);
    }
  }, [wishlist]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const addItem = useCallback((product, quantity = 1, openSidebar = false) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + quantity } : i,
        );
      }
      return [...prev, { ...product, qty: quantity }];
    });
    setPulse((n) => n + 1);
    toast.success("Added to bag", {
      description: `${product.name} (x${quantity})`,
      action: {
        label: "View Bag",
        onClick: () => setIsCartOpen(true),
      },
    });
    if (openSidebar) {
      setIsCartOpen(true);
    }
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === productId);
      if (item) {
        toast.info("Removed from bag", { description: item.name });
      }
      return prev.filter((i) => i.id !== productId);
    });
  }, []);

  const updateQuantity = useCallback((productId, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, qty } : i)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedPromo(null);
    setPromoCode("");
  }, []);

  const applyPromoCode = useCallback((code) => {
    const trimmed = code.trim().toUpperCase();
    if (PROMO_CODES[trimmed]) {
      setAppliedPromo({ code: trimmed, ...PROMO_CODES[trimmed] });
      toast.success("Promo code applied!", {
        description: `${trimmed}: ${PROMO_CODES[trimmed].label}`,
      });
      return true;
    } else {
      toast.error("Invalid promo code", {
        description: "Try 'ATELIER10' or 'WELCOME20'",
      });
      return false;
    }
  }, []);

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
    setPromoCode("");
    toast.info("Promo code removed");
  }, []);

  const toggleWish = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        toast.info("Removed from wishlist", { description: product.name });
        return prev.filter((id) => id !== product.id);
      } else {
        toast.success("Saved to wishlist", { description: product.name });
        return [...prev, product.id];
      }
    });
  }, []);

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items],
  );

  const discountRate = appliedPromo ? appliedPromo.rate : 0;
  const discountAmount = subtotal * discountRate;
  const freeShippingThreshold = 100;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 15;
  const total = Math.max(0, subtotal - discountAmount + (subtotal > 0 ? shipping : 0));
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100),
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      discountAmount,
      shipping,
      total,
      appliedPromo,
      promoCode,
      setPromoCode,
      applyPromoCode,
      removePromoCode,
      freeShippingThreshold,
      freeShippingRemaining,
      freeShippingProgress,
      isCartOpen,
      setIsCartOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      wishlist,
      toggleWish,
      pulse,
    }),
    [
      items,
      count,
      subtotal,
      discountAmount,
      shipping,
      total,
      appliedPromo,
      promoCode,
      applyPromoCode,
      removePromoCode,
      freeShippingRemaining,
      freeShippingProgress,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      wishlist,
      toggleWish,
      pulse,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
