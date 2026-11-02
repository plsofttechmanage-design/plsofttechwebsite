import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { TemplateCard } from '../components/TemplateCard';

export const WishlistPage = () => {
  const { wishlist, loading } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
          Saved Wishlist
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review and quickly access templates you have bookmarked for future projects.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-24 glass-card rounded-3xl p-8 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Your wishlist is currently empty</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Explore our templates and click the heart icon on any template card to save it for later.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 transition-all"
            >
              Browse Catalogue
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {wishlist.map((item) => (
            <TemplateCard key={item.id || item.template?.id} template={item.template || item} />
          ))}
        </div>
      )}
    </div>
  );
};
