import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Sliders,
  Compass,
  Zap,
  ShieldCheck,
  Code,
  Tag,
  Copy,
  Check,
  ArrowRight,
  Star,
  CheckCircle2,
  LayoutGrid,
  ChevronRight,
} from 'lucide-react';
import { catalogAPI } from '../api/catalog';
import { TemplateCard } from '../components/TemplateCard';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useToast } from '../components/Toast';

export const HomePage = () => {
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    setLoading(true);
    // Fetch templates prioritizing featured ones
    catalogAPI
      .getTemplates({ ordering: '-is_featured,-created_at' })
      .then((data) => {
        const results = data.results || data || [];
        setTotalCount(data.count || results.length);
        // Show only a curated slice (e.g. 3 or at most 6) on the landing page
        setFeaturedTemplates(results.slice(0, 3));
      })
      .catch((err) => console.error('Failed to load featured templates', err))
      .finally(() => setLoading(false));
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/templates?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/templates');
    }
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    addToast(`Coupon code ${code} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-dot-pattern">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute -top-10 right-10 w-72 h-72 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel text-indigo-300 text-xs font-bold shadow-lg shadow-indigo-950/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{settings?.hero_badge || 'WordPress-Inspired Template Marketplace & Live Studio'}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08]">
            {settings?.hero_title || 'Discover, Customize & Launch'} <br />
            <span className="text-gradient-purple">
              {settings?.hero_title_highlight || 'High-Converting Templates'}
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            {settings?.hero_subtitle ||
              'Browse our curated catalogue of responsive website templates. Tune color palettes, typography, and content in our live browser studio before downloading clean, verified packages.'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              to="/templates"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs sm:text-sm font-bold shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              {settings?.cta_primary_text || 'Explore All Templates'}
            </Link>
            <Link
              to="/studio"
              className="px-6 py-3.5 rounded-2xl glass-panel hover:bg-white/10 text-slate-200 text-xs sm:text-sm font-bold border border-white/15 transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              {settings?.cta_secondary_text || 'Open Live Theme Studio'}
            </Link>
          </div>

          {/* Search Box that routes to /templates */}
          <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto pt-4">
            <div className="relative flex items-center glass-panel rounded-2xl p-1.5 shadow-2xl">
              <Search className="w-5 h-5 text-indigo-400 ml-3.5 pointer-events-none shrink-0" />
              <input
                type="text"
                placeholder="Search templates (e.g. SaaS, Portfolio, Dark Mode, E-Commerce)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-3.5 py-3 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>

            {/* Quick search tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-400">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Popular:</span>
              {['SaaS Landing', 'Minimal Portfolio', 'E-Commerce Store', 'Modern Blog'].map((keyword) => (
                <Link
                  key={keyword}
                  to={`/templates?search=${encodeURIComponent(keyword)}`}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-medium transition-colors"
                >
                  {keyword}
                </Link>
              ))}
            </div>
          </form>
        </div>

        {/* Live Metrics Trust Strip */}
        <div className="max-w-6xl mx-auto mt-16 pt-10 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {settings?.metric_1_value || '500+'}
            </span>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
              {settings?.metric_1_label || 'Production Components'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400">
              {settings?.metric_2_value || '100%'}
            </span>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
              {settings?.metric_2_label || 'Clean Verified Code'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400">
              {settings?.metric_3_value || 'Real-Time'}
            </span>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
              {settings?.metric_3_label || 'Theme Studio Editor'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {settings?.metric_4_value || '4.9 / 5.0'}
            </span>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
              {settings?.metric_4_label || 'Customer Rating Score'}
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* FEATURED TEMPLATES SHOWCASE ("SHOW ONLY SOME" ON LANDING) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-white/5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold border border-indigo-500/25">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Handpicked Showcase</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Featured Website Designs
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              A curated selection of our top-rated, high-converting templates. Test live demos and customize in Theme Studio.
            </p>
          </div>

          <Link
            to="/templates"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all self-start sm:self-auto group"
          >
            <span>View All Website Templates</span>
            {totalCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px]">
                {totalCount}
              </span>
            )}
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Selected 3 Featured Templates */}
        <div className="pt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl glass-card p-5 space-y-4 animate-pulse">
                  <div className="aspect-[16/10] bg-slate-800 rounded-2xl" />
                  <div className="h-5 bg-slate-800 rounded-lg w-2/3" />
                  <div className="h-4 bg-slate-800 rounded-lg w-full" />
                  <div className="h-10 bg-slate-800 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : featuredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredTemplates.map((tpl) => (
                <TemplateCard key={tpl.id} template={tpl} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card rounded-3xl p-8 max-w-md mx-auto text-slate-400 text-xs">
              No featured templates published yet.
            </div>
          )}
        </div>

        {/* Full Catalogue Callout Banner */}
        <div className="mt-12 p-8 sm:p-10 rounded-3xl glass-panel border border-indigo-500/20 bg-gradient-to-r from-slate-900/90 via-indigo-950/30 to-slate-900/90 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Looking for more styles & categories?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Explore our full directory of templates with category filtering, keyword search, and price sorting.
            </p>
          </div>

          <Link
            to="/templates"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs sm:text-sm font-bold shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0 hover:scale-[1.02]"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Browse Full Catalogue ({totalCount})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Value Proposition Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            Engineered For Speed & Quality
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why Creators & Agencies Choose Craftr Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Every template is meticulously built with enterprise security, clean component structure, and real-time customizability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl glass-card space-y-4 hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Sliders className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Live In-Browser Theme Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tweak color palettes, typography, responsive device frames, and preview copy in real time before checkout. Export your custom <code className="text-indigo-300">theme.json</code> config anytime.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl glass-card space-y-4 hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Code className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Production-Ready Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No bloated dependencies or fragile scripts. Built with modern React, Tailwind CSS, clean semantic HTML, and full cross-browser responsiveness.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl glass-card space-y-4 hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Verified Downloads & Entitlements</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cryptographically verified downloads, quota enforcement, and permanent license entitlements linked securely to your authenticated account.
            </p>
          </div>
        </div>
      </section>

      {/* Promotional Discount Callout Strip */}
      {settings?.promo_banner_active !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/30 p-8 sm:p-12 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                  <Tag className="w-3.5 h-3.5" />
                  Limited Time Promotion
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {settings?.promo_banner_title || 'Get 20% Off Any Template Today'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                  {settings?.promo_banner_text ||
                    'Apply promo code at checkout to unlock immediate savings across our entire catalogue of premium templates.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-950/80 border border-indigo-500/40">
                  <span className="font-mono text-sm font-extrabold text-white tracking-wider">
                    {settings?.promo_coupon_code || 'WELCOME20'}
                  </span>
                  <button
                    onClick={() => handleCopyCoupon(settings?.promo_coupon_code || 'WELCOME20')}
                    title="Copy Coupon"
                    className="p-1 rounded-lg hover:bg-white/10 text-indigo-300 transition-colors cursor-pointer"
                  >
                    {copiedCoupon ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <Link
                  to="/templates"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  Browse Templates
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
