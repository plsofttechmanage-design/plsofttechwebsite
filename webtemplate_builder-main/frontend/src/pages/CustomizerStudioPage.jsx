import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Sliders,
  Palette,
  Type,
  Layout,
  Save,
  ShoppingBag,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  CheckCircle2,
  Lock,
  Layers,
  FileDown,
  Share2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { catalogAPI } from '../api/catalog';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

export const CustomizerStudioPage = () => {
  const [searchParams] = useSearchParams();
  const [confirmResetStudioOpen, setConfirmResetStudioOpen] = useState(false);
  const navigate = useNavigate();
  const templateIdParam = searchParams.get('template');
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deviceView, setDeviceView] = useState('desktop'); // desktop, tablet, mobile
  const [saving, setSaving] = useState(false);
  const [existingDraftId, setExistingDraftId] = useState(null);

  // Editable configuration state
  const [draftName, setDraftName] = useState('My Custom Theme Draft');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [fontFamily, setFontFamily] = useState('Inter, sans-serif');
  const [heroTitle, setHeroTitle] = useState('Launch Your Vision 10x Faster');
  const [heroSubtitle, setHeroSubtitle] = useState('The modern WordPress-inspired template for startups and creatives.');
  const [ctaText, setCtaText] = useState('Get Started Today');
  const [showFeatures, setShowFeatures] = useState(true);
  const [showPricing, setShowPricing] = useState(true);
  const [showTestimonials, setShowTestimonials] = useState(true);

  // Load published templates for selection
  useEffect(() => {
    catalogAPI.getTemplates().then((data) => {
      const list = data.results || data || [];
      setTemplates(list);

      // Select initial template
      let target = null;
      if (templateIdParam) {
        target = list.find((t) => t.id === parseInt(templateIdParam, 10));
      }
      if (!target && list.length > 0) {
        target = list[0];
      }

      if (target) {
        applyTemplateConfig(target);
      }
    });
  }, [templateIdParam]);

  const applyTemplateConfig = (template) => {
    setSelectedTemplate(template);
    const defaults = template.default_config || {};
    setPrimaryColor(defaults.primaryColor || '#6366f1');
    setFontFamily(defaults.fontFamily || 'Inter, sans-serif');
    setHeroTitle(defaults.heroTitle || template.title);
    setHeroSubtitle(defaults.heroSubtitle || template.short_description || 'Customized with Template Studio');
    setCtaText(defaults.ctaText || 'Get Started Now');
    setShowPricing(defaults.showPricing !== undefined ? defaults.showPricing : true);
    setDraftName(`${template.title} Customization`);
  };

  const handleTemplateChange = (e) => {
    const tId = parseInt(e.target.value, 10);
    const found = templates.find((t) => t.id === tId);
    if (found) {
      applyTemplateConfig(found);
      setExistingDraftId(null);
    }
  };

  const handleSaveDraft = async () => {
    if (!isAuthenticated) {
      addToast('Please sign in to save customization drafts to your account.', 'info');
      navigate('/login');
      return;
    }
    if (!selectedTemplate) return;

    setSaving(true);
    const payload = {
      template: selectedTemplate.id,
      name: draftName,
      config_data: {
        primaryColor,
        fontFamily,
        heroTitle,
        heroSubtitle,
        ctaText,
        showFeatures,
        showPricing,
        showTestimonials,
      },
    };

    try {
      if (existingDraftId) {
        await catalogAPI.updateCustomization(existingDraftId, payload);
        addToast('Customization draft updated successfully!', 'success');
      } else {
        const res = await catalogAPI.saveCustomization(payload);
        setExistingDraftId(res.id);
        addToast('Customization draft saved to your account!', 'success');
      }
    } catch (err) {
      addToast('Failed to save customization draft.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedTemplate) return;
    const res = await addToCart(selectedTemplate.id);
    if (res.needAuth) {
      addToast('Please sign in to complete checkout.', 'info');
      navigate('/login');
      return;
    }
    if (res.success) {
      addToast(`${selectedTemplate.title} added to cart!`, 'success');
      navigate('/cart');
    } else {
      addToast(res.message, 'error');
    }
  };

  const handleExportConfig = () => {
    const config = {
      template: {
        id: selectedTemplate?.id,
        title: selectedTemplate?.title,
        version: selectedTemplate?.current_version,
      },
      branding: {
        primaryColor,
        fontFamily,
      },
      content: {
        heroTitle,
        heroSubtitle,
        ctaText,
      },
      layout: {
        showFeatures,
        showPricing,
        showTestimonials,
      },
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate?.slug || 'template'}-theme.json`;
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    addToast('theme-config.json downloaded successfully!', 'success');
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/studio?template=${selectedTemplate?.id || ''}`;
    navigator.clipboard.writeText(shareUrl);
    addToast('Studio preview link copied to clipboard!', 'info');
  };

  const colorPresets = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  const fontOptions = [
    { label: 'Plus Jakarta Sans (Default)', value: 'Plus Jakarta Sans, sans-serif' },
    { label: 'Inter Sans', value: 'Inter, sans-serif' },
    { label: 'Editorial Serif (Playfair)', value: 'Playfair Display, serif' },
    { label: 'Corporate Clean (Roboto)', value: 'Roboto, sans-serif' },
  ];

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row bg-[#080c15] overflow-hidden">
      {/* Left Control Panel (Sidebar) */}
      <aside className="w-full md:w-96 glass-panel border-r border-white/10 flex flex-col shrink-0 overflow-y-auto z-20">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sliders className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Visual Theme Studio</h2>
              <span className="text-[10px] text-slate-400">Live Browser Customizer</span>
            </div>
          </div>
          <button
            onClick={() => setConfirmResetStudioOpen(true)}
            className="p-1.5 rounded-xl glass-panel text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset to Template Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Template Selector */}
        <div className="p-4 border-b border-white/5 space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Template to Edit</label>
          <select
            value={selectedTemplate?.id || ''}
            onChange={handleTemplateChange}
            className="w-full py-2.5 px-3 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
          >
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.title} (${tpl.price})
              </option>
            ))}
          </select>
        </div>

        {/* Customization Controls Form */}
        <div className="p-4 space-y-5 flex-1">
          {/* Draft Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Customization Preset Title</label>
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="w-full py-2 px-3 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Theme Colors */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Palette className="w-4 h-4 text-indigo-400" />
              <span>Brand Primary Accent</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-8 h-8 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-white/10">
                {primaryColor}
              </span>
              <div className="flex items-center gap-1.5 ml-auto">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    onClick={() => setPrimaryColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                      primaryColor === color ? 'border-white scale-125 shadow-md' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Type className="w-4 h-4 text-cyan-400" />
              <span>Typography Styling</span>
            </div>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full py-2 px-3 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              {fontOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Hero Content Settings */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Hero Section Copy
            </span>
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400">Headline</label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full py-2 px-3 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400">Subtitle</label>
              <textarea
                rows={2}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full py-2 px-3 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400">Call-to-Action Label</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full py-2 px-3 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section Toggles */}
          <div className="space-y-2.5 pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Layout className="w-4 h-4 text-emerald-400" />
              <span>Section Visibility</span>
            </div>
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-xl glass-panel cursor-pointer hover:bg-white/5 transition-colors">
                <span className="text-slate-300 font-medium">Feature Highlights Grid</span>
                <input
                  type="checkbox"
                  checked={showFeatures}
                  onChange={(e) => setShowFeatures(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>
              <label className="flex items-center justify-between p-2.5 rounded-xl glass-panel cursor-pointer hover:bg-white/5 transition-colors">
                <span className="text-slate-300 font-medium">Pricing Matrix</span>
                <input
                  type="checkbox"
                  checked={showPricing}
                  onChange={(e) => setShowPricing(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>
              <label className="flex items-center justify-between p-2.5 rounded-xl glass-panel cursor-pointer hover:bg-white/5 transition-colors">
                <span className="text-slate-300 font-medium">Customer Reviews / Quotes</span>
                <input
                  type="checkbox"
                  checked={showTestimonials}
                  onChange={(e) => setShowTestimonials(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 glass-panel space-y-2.5">
          <div className="flex gap-2">
            <button
              onClick={handleExportConfig}
              className="flex-1 py-2 px-2.5 rounded-xl glass-panel hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              title="Download theme configuration JSON"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              Export JSON
            </button>
            <button
              onClick={handleShareLink}
              className="flex-1 py-2 px-2.5 rounded-xl glass-panel hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              title="Copy shareable studio link"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              Share Link
            </button>
          </div>

          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="w-full py-2.5 px-3 rounded-xl glass-panel hover:bg-white/10 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-indigo-400" />
            {saving ? 'Saving...' : 'Save Draft Configuration'}
          </button>
          <button
            onClick={handleAddToCart}
            className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add Template to Cart (${selectedTemplate?.price || 0})
          </button>
        </div>
      </aside>

      {/* Right Canvas: Live Interactive Preview */}
      <main className="flex-1 flex flex-col bg-[#090d16] overflow-hidden relative">
        {/* Preview Topbar with Device Emulation */}
        <div className="h-16 px-6 glass-panel border-b border-white/5 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Previewing:</span>
            <span className="text-xs font-extrabold text-white">{selectedTemplate?.title}</span>
          </div>

          {/* Viewport switchers */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setDeviceView('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                deviceView === 'desktop' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDeviceView('tablet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                deviceView === 'tablet' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                deviceView === 'mobile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Interactive Studio Preview</span>
          </div>
        </div>

        {/* Canvas Area with Device Bezel */}
        <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center bg-dot-pattern">
          <div
            style={{ fontFamily: fontFamily }}
            className={`transition-all duration-300 bg-slate-950 border border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col relative ${
              deviceView === 'desktop'
                ? 'w-full h-full max-w-5xl'
                : deviceView === 'tablet'
                ? 'w-[680px] h-[850px] ring-8 ring-slate-800'
                : 'w-[375px] h-[720px] ring-8 ring-slate-800'
            }`}
          >
            {/* Watermark Banner */}
            <div className="bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-indigo-950/80 border-b border-indigo-900/60 px-4 py-1.5 text-center text-[10px] font-mono text-indigo-300 tracking-wider">
              CRAFTR LIVE STUDIO PREVIEW • PURCHASE UNLOCKS PRODUCTION READY ZIP PACKAGE
            </div>

            {/* Simulated Live Rendered Template Page */}
            <div className="flex-1 overflow-y-auto">
              {/* Simulated Navigation Bar */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: primaryColor }}
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md"
                  >
                    C
                  </div>
                  <span className="font-extrabold text-white text-sm">
                    {selectedTemplate?.title?.split(' ')[0] || 'Brand'}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-5 text-xs text-slate-300 font-medium">
                  <span className="hover:text-white cursor-pointer">Home</span>
                  <span className="hover:text-white cursor-pointer">Features</span>
                  <span className="hover:text-white cursor-pointer">Pricing</span>
                </div>
                <button
                  style={{ backgroundColor: primaryColor }}
                  className="px-3.5 py-1.5 rounded-xl text-white text-xs font-bold shadow"
                >
                  Contact
                </button>
              </div>

              {/* Simulated Hero Section */}
              <div className="py-14 px-6 text-center space-y-4 max-w-2xl mx-auto">
                <span
                  style={{ color: primaryColor }}
                  className="text-xs font-bold tracking-widest uppercase"
                >
                  {selectedTemplate?.category?.name || 'Exclusive Release'}
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {heroTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  {heroSubtitle}
                </p>
                <div className="pt-3 flex items-center justify-center gap-3">
                  <button
                    style={{ backgroundColor: primaryColor }}
                    className="px-6 py-3 rounded-2xl text-white font-bold text-xs shadow-xl transition-transform hover:scale-105"
                  >
                    {ctaText}
                  </button>
                  <button className="px-6 py-3 rounded-2xl bg-white/5 text-slate-200 hover:text-white font-semibold text-xs border border-white/10">
                    Explore Features
                  </button>
                </div>
              </div>

              {/* Features Section */}
              {showFeatures && (
                <div className="py-10 px-6 border-t border-white/5 bg-white/[0.01]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { title: 'Lightning Fast', desc: 'Optimized bundle size and near-instant load performance.' },
                      { title: 'Responsive Grids', desc: 'Pixel-perfect rendering on desktop, tablet, and mobile.' },
                      { title: 'Clean Architecture', desc: 'Production-ready React code, standard CSS, and zero bloat.' },
                    ].map((f, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl glass-card space-y-2"
                      >
                        <div
                          style={{ color: primaryColor }}
                          className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center font-bold text-sm"
                        >
                          ✓
                        </div>
                        <h4 className="text-xs font-bold text-white">{f.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-snug">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Section */}
              {showPricing && (
                <div className="py-12 px-6 border-t border-white/5 text-center space-y-6">
                  <h3 className="text-lg font-bold text-white">Simple, Transparent Pricing</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                    <div className="p-6 rounded-3xl glass-card text-left space-y-3">
                      <h4 className="text-xs font-bold text-slate-300">Single Site Licence</h4>
                      <p className="text-3xl font-extrabold text-white">${selectedTemplate?.price || 49}</p>
                      <button
                        style={{ backgroundColor: primaryColor }}
                        className="w-full py-2.5 rounded-xl text-white font-bold text-xs"
                      >
                        Buy Template
                      </button>
                    </div>
                    <div className="p-6 rounded-3xl glass-card border-indigo-500/40 text-left space-y-3">
                      <h4 className="text-xs font-bold text-indigo-300">Unlimited Multi-Site</h4>
                      <p className="text-3xl font-extrabold text-white">${(selectedTemplate?.price || 49) * 2}</p>
                      <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs">
                        Extended Licence
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Testimonials */}
              {showTestimonials && (
                <div className="py-10 px-6 border-t border-white/5 bg-white/[0.01] text-center">
                  <p className="text-xs italic text-slate-300 max-w-md mx-auto leading-relaxed">
                    "This template cut our launch time from 3 weeks to under 2 days. The customization workflow is clean and developer-friendly."
                  </p>
                  <span className="block mt-2.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    — Tech Lead at Horizon AI
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={confirmResetStudioOpen}
        onClose={() => setConfirmResetStudioOpen(false)}
        onConfirm={() => {
          if (selectedTemplate) {
            applyTemplateConfig(selectedTemplate);
            addToast('Template settings restored to defaults.', 'info');
          }
          setConfirmResetStudioOpen(false);
        }}
        title="Reset Customizer to Defaults?"
        message="Are you sure you want to revert all custom colors, typography, headline copy, and layout options back to this template's original configuration?"
        confirmText="Yes, Reset Settings"
        variant="warning"
      />
    </div>
  );
};
