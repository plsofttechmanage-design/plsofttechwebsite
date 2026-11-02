import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Sliders, ExternalLink, Check, Sparkles, Star, ArrowUpRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';

export const TemplateCard = ({ template }) => {
  const { toggleWishlist, isSaved } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [addingCart, setAddingCart] = useState(false);

  const saved = isSaved(template.id);
  const alreadyInCart = isInCart(template.id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await toggleWishlist(template.id, template);
    if (res.success) {
      addToast(res.message, res.saved ? 'success' : 'info');
    } else {
      addToast(res.message || 'Could not update favorites.', 'error');
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (alreadyInCart) {
      navigate('/cart');
      return;
    }
    setAddingCart(true);
    const res = await addToCart(template.id);
    setAddingCart(false);
    if (res.needAuth) {
      addToast('Please sign in to add templates to your cart.', 'info');
      navigate('/login');
      return;
    }
    if (res.success) {
      addToast(`${template.title} added to cart!`, 'success');
    } else {
      addToast(res.message, 'error');
    }
  };

  // Format clean display URL
  const displayUrl = template.preview_url
    ? template.preview_url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : `preview.craftr/${template.slug}`;

  return (
    <div className="group rounded-3xl glass-card transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 hover:border-indigo-500/30">
      {/* Mock Browser Header with clickable address link */}
      <div className="px-4 py-2.5 bg-slate-950/90 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
        </div>

        {/* Address Bar - Clickable if preview_url or links to details */}
        {template.preview_url ? (
          <a
            href={template.preview_url}
            target="_blank"
            rel="noreferrer"
            title={`Open Live Demo: ${template.preview_url}`}
            className="px-2.5 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-[10px] text-indigo-300 hover:text-white font-mono flex items-center gap-1 transition-colors border border-white/5 hover:border-indigo-500/30 truncate max-w-[190px] sm:max-w-[210px]"
          >
            <span className="truncate">{displayUrl}</span>
            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
          </a>
        ) : (
          <Link
            to={`/templates/${template.slug}`}
            className="px-2.5 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-slate-200 font-mono flex items-center gap-1 transition-colors truncate max-w-[190px] sm:max-w-[210px]"
          >
            <span className="truncate">{displayUrl}</span>
          </Link>
        )}

        {/* Wishlist / Heart Like Button */}
        <button
          onClick={handleWishlist}
          title={saved ? 'Remove from Saved Favorites' : 'Save to Favorites'}
          className={`p-1.5 rounded-lg transition-all duration-200 shrink-0 ${
            saved
              ? 'text-pink-500 bg-pink-500/10 hover:bg-pink-500/20 scale-105'
              : 'text-slate-400 hover:text-pink-400 hover:bg-white/5'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-200 ${
              saved ? 'fill-pink-500 text-pink-500 scale-110' : ''
            }`}
          />
        </button>
      </div>

      {/* Preview / Thumbnail Canvas */}
      <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-900 text-slate-500 p-6 text-center">
            <span className="text-3xl font-extrabold tracking-tight text-indigo-400/30 mb-1">
              {template.title.split(' ')[0]}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">v{template.current_version} • Responsive Ready</span>
          </div>
        )}

        {/* Ambient Gradient Scrim on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none" />

        {/* Badges Top Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          {template.is_featured && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500/20 to-amber-600/30 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-md">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Featured
            </span>
          )}
          {template.category && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-900/85 text-slate-300 border border-white/10 backdrop-blur-md">
              {template.category.name}
            </span>
          )}
        </div>

        {/* Live Demo Quick Badge/Button */}
        {template.preview_url && (
          <a
            href={template.preview_url}
            target="_blank"
            rel="noreferrer"
            title="Open Live Demo Link in New Tab"
            className="absolute bottom-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/15 hover:border-indigo-400/50 shadow-xl backdrop-blur-md transition-all group/btn hover:scale-105"
          >
            <span>Live Demo</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400 group-hover/btn:text-white transition-colors" />
          </a>
        )}
      </div>

      {/* Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <Link
              to={`/templates/${template.slug}`}
              className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 flex items-center gap-1"
            >
              <span>{template.title}</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 shrink-0" />
            </Link>
            <div className="px-2.5 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-sm font-extrabold shrink-0">
              ${template.price}
            </div>
          </div>

          {/* Ratings Pill */}
          <div className="flex items-center gap-2 mb-2.5">
            {template.review_count > 0 ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{template.average_rating}</span>
                <span className="text-slate-500 font-normal">({template.review_count} reviews)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Verified Release</span>
              </div>
            )}
            <span className="text-slate-600">•</span>
            <span className="text-[11px] font-mono text-slate-400">v{template.current_version}</span>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {template.short_description || template.description}
          </p>

          {/* Tag Chips */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {template.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id || tag.slug}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 text-slate-400 border border-white/5"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Dual Actions */}
        <div className="pt-4 border-t border-white/5 flex items-center gap-2.5">
          {/* Customizer Studio Action */}
          <Link
            to={`/studio?template=${template.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/25 text-xs font-bold transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Theme Studio
          </Link>

          {/* Add to Cart Action */}
          <button
            onClick={handleAddToCart}
            disabled={addingCart}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
              alreadyInCart
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30'
            }`}
          >
            {alreadyInCart ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                In Cart
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
