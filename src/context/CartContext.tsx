// src/context/CartContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  id: string; // unique cart item id
  productId: string;
  variantId: string;
  title: string;
  description: string;
  image: string;
  options: Record<string, string>;
  quantity: number;
  price: number;
  compareAtPrice?: number;
  vendor?: string;
  productType?: string;
  sku?: string;
  availableForSale: boolean;
  quantityAvailable?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("verseandme_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("verseandme_cart", JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (item: Omit<CartItem, "id">) => {
    setCart((prevCart) => {
      // Check if item with same variant and options already exists
      const existingItemIndex = prevCart.findIndex(
        (cartItem) =>
          cartItem.variantId === item.variantId &&
          JSON.stringify(cartItem.options) === JSON.stringify(item.options)
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + item.quantity,
        };
        return updatedCart;
      } else {
        // Add new item
        return [
          ...prevCart,
          {
            ...item,
            id: `${item.variantId}-${Date.now()}`,
          },
        ];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}