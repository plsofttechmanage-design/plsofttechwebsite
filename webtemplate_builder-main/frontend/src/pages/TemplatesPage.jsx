import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Sliders,
  ArrowUpDown,
  Compass,
  Filter,
  X,
  Layers,
  ArrowRight,
  LayoutGrid,
} from 'lucide-react';
import { catalogAPI } from '../api/catalog';
import { TemplateCard } from '../components/TemplateCard';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const TemplatesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings } = useSiteSettings();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state from URL or defaults
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '-is_featured,-created_at');

  // Load categories and tags once
  useEffect(() => {
    Promise.all([catalogAPI.getCategories(), catalogAPI.getTags()])
      .then(([catsData, tagsData]) => {
        setCategories(catsData.results || catsData || []);
        setTags(tagsData.results || tagsData || []);
      })
      .catch((err) => console.error('Failed to load categories/tags', err));
  }, []);

  // Fetch templates when filters change
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (selectedCategory) params.category__slug = selectedCategory;
    if (ordering) params.ordering = ordering;

    catalogAPI
      .getTemplates(params)
      .then((data) => {
        setTemplates(data.results || data || []);
      })
      .catch((err) => console.error('Failed to load templates', err))
      .finally(() => setLoading(false));

    // Keep URL query params synchronized
    const newParams = {};
    if (search) newParams.search = search;
    if (selectedCategory) newParams.category = selectedCategory;
    if (ordering && ordering !== '-is_featured,-created_at') newParams.ordering = ordering;
    setSearchParams(newParams, { replace: true });
  }, [search, selectedCategory, ordering]);

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setOrdering('-is_featured,-created_at');
  };

  const currentCategoryName = categories.find((c) => c.slug === selectedCategory)?.name;

  return (
    <div className="min-h-screen pb-24">
      {/* Header Banner */}
      <section className="relative overflow-hidden pt-10 sm:pt-14 pb-12 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-slate-950/60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-56 bg-indigo-600/10 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel text-[11px] font-bold text-indigo-300 mb-2">
                <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
                <span>Complete Website Library</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                All Website Templates
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
                Explore our full catalogue of responsive website designs. Preview interactive live demos, customize settings in the theme studio, and download production-ready code packages.
              </p>
            </div>

            <Link
              to="/studio"
              className="px-5 py-2.5 rounded-2xl glass-panel hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/15 transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              Open Live Theme Studio
            </Link>
          </div>

          {/* Search Box */}
          <div className="pt-4 max-w-3xl">
            <div className="relative flex items-center glass-panel rounded-2xl p-1.5 shadow-2xl">
              <Search className="w-5 h-5 text-indigo-400 ml-3.5 pointer-events-none shrink-0" />
              <input
                type="text"
                placeholder="Search by title, keyword, tech stack (e.g. SaaS, Minimalist, Portfolio, E-Commerce)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent px-3.5 py-2.5 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Listing Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Category Filter & Sort Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === ''
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'glass-panel text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id || cat.slug}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'glass-panel text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.name}
                {cat.template_count !== undefined && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-white/10 text-slate-300">
                    {cat.template_count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sort:</span>
            </div>
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="bg-slate-900 border border-white/10 text-slate-200 text-xs font-semibold rounded-2xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="-is_featured,-created_at">Featured & Newest</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pill Bar & Results Count */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 font-medium flex items-center gap-2">
            <span>
              Showing <strong className="text-white">{templates.length}</strong> website templates
            </span>
            {(selectedCategory || search) && (
              <span className="text-slate-600">•</span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-[11px] font-semibold">
                Category: {currentCategoryName || selectedCategory}
                <button onClick={() => setSelectedCategory('')} className="hover:text-white cursor-pointer ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 text-[11px] font-semibold">
                Keyword: "{search}"
                <button onClick={() => setSearch('')} className="hover:text-white cursor-pointer ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {(selectedCategory || search) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Templates Grid */}
        <div className="pt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-3xl glass-card p-5 space-y-4 animate-pulse">
                  <div className="aspect-[16/10] bg-slate-800 rounded-2xl" />
                  <div className="h-5 bg-slate-800 rounded-lg w-2/3" />
                  <div className="h-4 bg-slate-800 rounded-lg w-full" />
                  <div className="h-10 bg-slate-800 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : templates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {templates.map((tpl) => (
                <TemplateCard key={tpl.id} template={tpl} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-card rounded-3xl p-8 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No templates found</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                We couldn't find any templates matching your search criteria. Try adjusting your query or resetting category filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

