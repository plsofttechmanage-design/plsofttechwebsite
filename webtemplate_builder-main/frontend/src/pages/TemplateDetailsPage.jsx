import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Sliders,
  ShoppingBag,
  ExternalLink,
  Heart,
  Download,
  ShieldCheck,
  Code,
  Sparkles,
  Star,
  MessageSquare,
  Send,
  Check,
  Share2,
  Tag,
  Zap,
} from 'lucide-react';
import { catalogAPI } from '../api/catalog';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const TemplateDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [template, setTemplate] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isSaved } = useWishlist();
  const { addToast } = useToast();

  // Review form state
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchTemplate = () => {
    setLoading(true);
    catalogAPI
      .getTemplateDetails(slug)
      .then((data) => {
        setTemplate(data);
        setReviews(data.reviews || []);
      })
      .catch((err) => console.error('Failed to load template', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTemplate();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 flex justify-center items-center">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
          <ArrowLeft className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Template Not Found</h2>
        <p className="text-xs text-slate-400">The template you are looking for does not exist or has been archived.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold">
          <ArrowLeft className="w-4 h-4" />
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const saved = isSaved(template.id);
  const alreadyInCart = isInCart(template.id);

  const handleAddToCart = async () => {
    if (alreadyInCart) {
      navigate('/cart');
      return;
    }
    const res = await addToCart(template.id);
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

  const handleWishlist = async () => {
    const res = await toggleWishlist(template.id, template);
    if (res.success) {
      addToast(res.message, res.saved ? 'success' : 'info');
    } else {
      addToast(res.message || 'Could not update favorites.', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please sign in to leave a review.', 'info');
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      await catalogAPI.postTemplateReview(template.slug, {
        rating,
        title: reviewTitle,
        comment: reviewComment,
      });
      addToast('Thank you! Your verified review has been published.', 'success');
      setReviewTitle('');
      setReviewComment('');
      fetchTemplate();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumbs Toolbar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
        <div className="flex items-center gap-2">
          {template.category && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {template.category.name}
            </span>
          )}
          <span className="px-3 py-1 rounded-full text-xs font-mono text-slate-400 glass-panel">
            v{template.current_version}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            {template.status}
          </span>
        </div>
      </div>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Visual Showcase & Description & Reviews (7 Cols) */}
        <div className="lg:col-span-7 space-y-10">
          {/* Mock Browser Container */}
          <div className="rounded-3xl glass-card overflow-hidden shadow-2xl">
            {/* Browser topbar */}
            <div className="px-4 py-3 bg-slate-950/80 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              </div>
              {template.preview_url ? (
                <a
                  href={template.preview_url}
                  target="_blank"
                  rel="noreferrer"
                  title={`Open Live Demo: ${template.preview_url}`}
                  className="px-3 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-xs text-indigo-300 hover:text-white font-mono flex items-center gap-1.5 transition-colors border border-white/5 truncate max-w-xs"
                >
                  <span className="truncate">{template.preview_url.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-3 h-3 text-cyan-400 shrink-0" />
                </a>
              ) : (
                <div className="px-3 py-0.5 rounded-full bg-slate-900 text-xs text-slate-400 font-mono">
                  https://craftr.studio/preview/{template.slug}
                </div>
              )}
              <div className="w-12"></div>
            </div>

            {/* Thumbnail Canvas */}
            <div className="relative bg-slate-950">
              {template.thumbnail ? (
                <img
                  src={template.thumbnail}
                  alt={template.title}
                  className="w-full h-auto object-cover max-h-[500px]"
                />
              ) : (
                <div className="aspect-[16/10] bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-900 flex flex-col items-center justify-center p-12 text-center">
                  <span className="text-4xl font-extrabold text-indigo-400/30 tracking-tight mb-2">
                    {template.title}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {template.compatibility}
                  </span>
                </div>
              )}

              {/* Live Demo Overlay bar */}
              {template.preview_url && (
                <div className="p-4 glass-panel border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">Test interactive responsiveness and components:</span>
                  <a
                    href={template.preview_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 shadow-lg transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    Open Live Demo
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Quick Specifications Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-3xl glass-panel">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Compatibility</span>
              <p className="text-xs font-bold text-white">{template.compatibility || 'React 19+, Tailwind v4'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Licence</span>
              <p className="text-xs font-bold text-white">{template.licence_type || 'Single Commercial'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Downloads</span>
              <p className="text-xs font-bold text-emerald-400">{template.total_downloads || 0} purchases</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customizer Support</span>
              <p className="text-xs font-bold text-cyan-400">Supported (Live Studio)</p>
            </div>
          </div>

          {/* Description & Overview */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Template Description & Features</h2>
            <div className="prose prose-invert prose-sm text-slate-300 max-w-none leading-relaxed">
              <p>{template.description}</p>
            </div>

            {template.features && template.features.length > 0 && (
              <div className="pt-4 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Key Inclusions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {template.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl glass-panel text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews & Ratings Section */}
          <div className="pt-8 border-t border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  Customer Ratings & Verified Reviews
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Average score: <span className="font-bold text-white">{template.average_rating || '5.0'}</span> / 5.0 across {reviews.length} reviews.
                </p>
              </div>
            </div>

            {/* Submit Review Card */}
            <div className="p-6 rounded-3xl glass-card space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Leave a Verified Review
              </h4>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Rating (1 to 5 Stars)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setRating(starVal)}
                        className="p-1 text-slate-600 hover:text-amber-400 transition-colors"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            starVal <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-400 ml-2">{rating} Star{rating > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Review Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Exceptional design quality and clean components!"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Feedback</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Share your experience with the template's responsiveness, typography, or ease of customization..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingReview ? 'Publishing...' : 'Publish Review'}
                </button>
              </form>
            </div>

            {/* Existing Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="p-8 text-center rounded-2xl glass-panel text-xs text-slate-500">
                  No customer reviews yet. Be the first to share your thoughts on this template!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-5 rounded-2xl glass-panel space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs">
                          {rev.customer_name?.charAt(0) || 'C'}
                        </div>
                        <span className="text-xs font-bold text-white">{rev.customer_name}</span>
                        {rev.is_verified_buyer && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <h5 className="text-xs font-bold text-slate-200">{rev.title}</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Purchase Box (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-28 space-y-6">
            {/* Purchase Card */}
            <div className="rounded-3xl glass-card p-6 sm:p-8 space-y-6 shadow-2xl border border-white/10">
              <div className="space-y-2">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                  Verified Template Licence
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {template.title}
                </h1>
                <div className="flex items-baseline gap-3 pt-2">
                  <span className="text-4xl font-extrabold text-white">
                    ${template.price}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">USD one-time</span>
                </div>
              </div>

              {/* Promo Hint */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
                <Tag className="w-4 h-4 text-indigo-400 shrink-0" />
                <p className="text-xs text-indigo-200">
                  Save 20% on checkout with code <span className="font-mono font-bold text-white bg-indigo-500/30 px-1.5 py-0.5 rounded">WELCOME20</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all ${
                    alreadyInCart
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/30 hover:scale-[1.01]'
                  }`}
                >
                  {alreadyInCart ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      Already in Cart — View Checkout
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart — ${template.price}
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/studio?template=${template.id}`}
                    className="flex-1 py-3 px-4 rounded-2xl glass-panel hover:bg-white/10 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-white/10 transition-colors"
                  >
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Customize in Studio
                  </Link>

                  <button
                    onClick={handleWishlist}
                    className={`p-3 rounded-2xl border transition-colors ${
                      saved
                        ? 'bg-pink-500/20 text-pink-400 border-pink-500/40'
                        : 'glass-panel text-slate-400 hover:text-white border-white/10'
                    }`}
                    title={saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${saved ? 'fill-pink-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Guarantees List */}
              <div className="space-y-3 pt-6 border-t border-white/10 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Instant Package Download upon Payment</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Commercial & Personal Use Authorised</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Code className="w-4 h-4 text-cyan-400" />
                  <span>Full Source Code with Documentation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
