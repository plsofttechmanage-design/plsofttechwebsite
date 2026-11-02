import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const data = await cartAPI.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated]);

  const addToCart = async (templateId) => {
    if (!isAuthenticated) {
      return { success: false, needAuth: true };
    }
    try {
      const res = await cartAPI.addToCart(templateId);
      if (res.cart) {
        setCart(res.cart);
      } else {
        await fetchCart();
      }
      return { success: true, message: res.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to add item to cart';
      return { success: false, message: msg };
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await cartAPI.removeItem(itemId);
      if (res.cart) {
        setCart(res.cart);
      } else {
        await fetchCart();
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartAPI.clearCart();
      if (res.cart) {
        setCart(res.cart);
      } else {
        await fetchCart();
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const isInCart = (templateId) => {
    if (!cart || !cart.items) return false;
    return cart.items.some((item) => item.template?.id === templateId);
  };

  const value = {
    cart,
    loading,
    itemCount: cart?.total_items || 0,
    totalPrice: cart?.total_price || '0.00',
    fetchCart,
    addToCart,
    removeItem,
    clearCart,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

