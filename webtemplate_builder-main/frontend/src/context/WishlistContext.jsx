import React, { createContext, useContext, useState, useEffect } from 'react';
import { catalogAPI } from '../api/catalog';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      try {
        const local = JSON.parse(localStorage.getItem('craftr_guest_wishlist') || '[]');
        setWishlist(local);
        const ids = new Set(local.map((item) => Number(item.template?.id || item.id)).filter(Boolean));
        setSavedIds(ids);
      } catch (e) {
        setWishlist([]);
        setSavedIds(new Set());
      }
      return;
    }

    setLoading(true);
    try {
      const data = await catalogAPI.getWishlist();
      const results = data.results || data || [];
      setWishlist(results);
      const ids = new Set(results.map((item) => Number(item.template?.id || item.id)).filter(Boolean));
      setSavedIds(ids);
    } catch (err) {
      console.error('Failed to load wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // If user just logged in and had guest wishlist items, sync them to backend!
      try {
        const guestItems = JSON.parse(localStorage.getItem('craftr_guest_wishlist') || '[]');
        if (guestItems.length > 0) {
          Promise.all(
            guestItems.map((item) => {
              const tid = Number(item.template?.id || item.id);
              return tid ? catalogAPI.toggleWishlist(tid).catch(() => {}) : Promise.resolve();
            })
          ).finally(() => {
            localStorage.removeItem('craftr_guest_wishlist');
            fetchWishlist();
          });
        } else {
          fetchWishlist();
        }
      } catch {
        fetchWishlist();
      }
    } else {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const toggleWishlist = async (templateId, templateObj = null) => {
    const numId = Number(templateId);
    if (!numId) return { success: false, message: 'Invalid template ID.' };

    if (!isAuthenticated) {
      // Guest local wishlist handling
      try {
        let local = JSON.parse(localStorage.getItem('craftr_guest_wishlist') || '[]');
        const exists = local.some((item) => Number(item.template?.id || item.id) === numId);

        if (exists) {
          local = local.filter((item) => Number(item.template?.id || item.id) !== numId);
          localStorage.setItem('craftr_guest_wishlist', JSON.stringify(local));
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(numId);
            return next;
          });
          setWishlist(local);
          return { success: true, saved: false, message: 'Removed from saved wishlist.' };
        } else {
          const itemPayload = {
            id: `guest-${numId}`,
            template: templateObj || { id: numId, title: 'Saved Template' },
            created_at: new Date().toISOString(),
          };
          local.unshift(itemPayload);
          localStorage.setItem('craftr_guest_wishlist', JSON.stringify(local));
          setSavedIds((prev) => new Set([...prev, numId]));
          setWishlist(local);
          return { success: true, saved: true, message: 'Added to your saved wishlist!' };
        }
      } catch (err) {
        console.error('Failed to update local wishlist', err);
        return { success: false, message: 'Could not save item.' };
      }
    }

    // Authenticated API toggle
    try {
      const res = await catalogAPI.toggleWishlist(numId);
      if (res.saved) {
        setSavedIds((prev) => new Set([...prev, numId]));
      } else {
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(numId);
          return next;
        });
      }
      fetchWishlist();
      return { success: true, saved: res.saved, message: res.message };
    } catch (err) {
      console.error('Wishlist toggle API error', err);
      return { success: false, error: err, message: 'Failed to update wishlist on server.' };
    }
  };

  const isSaved = (templateId) => savedIds.has(Number(templateId));

  const value = {
    wishlist,
    savedIds,
    loading,
    fetchWishlist,
    toggleWishlist,
    isSaved,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
