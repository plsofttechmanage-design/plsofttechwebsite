import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Globe,
  Layers,
  Sparkles,
  Tag,
  Save,
  RotateCcw,
  CheckCircle2,
  FileText,
  Mail,
  Eye,
  Compass,
  Upload,
  Trash2,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { settingsAPI } from '../../api/settings';
import { BrandLogo, ICON_PRESETS } from '../../components/BrandLogo';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';

export const AdminSiteSettings = () => {
  const { settings, updateSettings, refreshSettings } = useSiteSettings();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ ...settings });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false); // branding, hero, metrics, promo, footer

  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image file size must be less than 5MB.', 'error');
      return;
    }

    setUploadingLogo(true);
    // 1. Instant local preview via FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange('logo_url', event.target?.result);
    };
    reader.readAsDataURL(file);

    // 2. Upload to backend
    try {
      const res = await settingsAPI.uploadLogo(file);
      if (res.success && res.logo_url) {
        handleChange('logo_url', res.logo_url);
        addToast('Logo uploaded and saved successfully!', 'success');
        refreshSettings();
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to upload logo file to server.', 'error');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    handleChange('logo_url', '');
    addToast('Custom logo image removed. Preset icon active.', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(formData);
      addToast('Website branding and landing page settings saved successfully!', 'success');
      refreshSettings();
    } catch (err) {
      addToast(
        err.response?.data?.message || err.response?.data?.detail || 'Failed to save settings.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setConfirmResetOpen(true);
  };

  const handleConfirmReset = () => {
    const defaults = {
      company_name: 'Craftr',
      company_tagline: 'WordPress & Modern Templates',
      logo_text: 'Studio',
      logo_url: '',
      logo_icon: 'layers',
      contact_email: 'support@craftr.studio',
      hero_badge: 'WordPress-Inspired Template Marketplace & Live Studio',
      hero_title: 'Discover, Customize & Launch',
      hero_title_highlight: 'High-Converting Templates',
      hero_subtitle:
        'Browse our curated catalogue of responsive website templates. Tune color palettes, typography, and content in our live browser studio before downloading clean, verified packages.',
      cta_primary_text: 'Explore Catalogue',
      cta_secondary_text: 'Open Live Theme Studio',
      metric_1_value: '500+',
      metric_1_label: 'Production Components',
      metric_2_value: '100%',
      metric_2_label: 'Clean Verified Code',
      metric_3_value: 'Real-Time',
      metric_3_label: 'Theme Studio Editor',
      metric_4_value: '4.9 / 5.0',
      metric_4_label: 'Customer Rating Score',
      promo_banner_active: true,
      promo_banner_title: 'Get 20% Off Any Template Today',
      promo_banner_text:
        'Apply promo code at checkout to unlock immediate savings across our entire catalogue.',
      promo_coupon_code: 'WELCOME20',
      footer_description:
        'The premier digital template marketplace inspired by WordPress. Discover curated themes, tweak settings in our live visual theme studio, and download production packages with verified licenses.',
      footer_copyright: '© 2026 Craftr Studio & Marketplace. All rights reserved.',
    };
    setFormData(defaults);
    setConfirmResetOpen(false);
    addToast('Defaults restored in form. Click Save Changes to commit.', 'info');
  };

  const tabs = [
    { id: 'branding', label: 'Branding & Logo', icon: Globe },
    { id: 'hero', label: 'Landing Page Hero', icon: Sparkles },
    { id: 'metrics', label: 'Stats & Trust Strip', icon: Layers },
    { id: 'promo', label: 'Promo Banner', icon: Tag },
    { id: 'footer', label: 'Footer & Legal', icon: FileText },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Website & Landing Page Editor
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Customize the platform company name, logo badge, hero headline, promotional announcements, and copy.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-2xl glass-panel hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || uploadingLogo}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="p-6 rounded-3xl glass-card border border-indigo-500/30 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Live Real-Time Simulation Preview</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Updates live in simulation</span>
        </div>

        {/* Simulated Navbar Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                <BrandLogo logoUrl={formData.logo_url} logoIcon={formData.logo_icon} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-white">
                  {formData.company_name || 'Craftr'}
                  <span className="text-indigo-400">.</span>
                </span>
                {formData.logo_text && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    {formData.logo_text}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {formData.company_tagline || 'WordPress & Modern Templates'}
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 font-medium">
            <span className="text-indigo-400 font-bold">Marketplace</span>
            <span>•</span>
            <span>Theme Studio</span>
          </div>
        </div>

        {/* Simulated Hero Snippet */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/5 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-[11px] font-semibold">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{formData.hero_badge}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            {formData.hero_title}{' '}
            <span className="text-gradient-purple">{formData.hero_title_highlight}</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto line-clamp-2">
            {formData.hero_subtitle}
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-[11px] font-bold">
              {formData.cta_primary_text}
            </span>
            <span className="px-3 py-1 rounded-xl glass-panel text-slate-300 text-[11px] font-bold">
              {formData.cta_secondary_text}
            </span>
          </div>
        </div>
      </div>

      {/* Main Settings Form Container */}
      <div className="rounded-3xl glass-card overflow-hidden border border-white/10 shadow-2xl">
        {/* Navigation Tabs */}
        <div className="flex items-center overflow-x-auto border-b border-white/10 bg-slate-950/60 p-2 gap-1.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* TAB 1: Branding & Identity */}
          {activeTab === 'branding' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-bold text-white">Brand Name & Identity</h3>
                <p className="text-xs text-slate-400">Controls the company title and logo text throughout the website header and footer.</p>
              </div>

              {/* LOGO CUSTOMIZER SUITE */}
              <div className="p-6 rounded-3xl glass-panel border border-indigo-500/20 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-indigo-400" />
                      Website Brand Logo
                    </h4>
                    <p className="text-xs text-slate-400">
                      Upload an image file from your computer, choose a brand icon, or paste a custom URL.
                    </p>
                  </div>

                  {formData.logo_url && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold border border-rose-500/30 transition-colors self-start sm:self-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove Custom Image
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Active Logo Visual Box */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-white/10 text-center space-y-3">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-xl shadow-indigo-600/30">
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden p-2">
                          <BrandLogo
                            logoUrl={formData.logo_url}
                            logoIcon={formData.logo_icon}
                            className="w-8 h-8 text-indigo-400"
                            imgClassName="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-white block">
                        {formData.logo_url ? 'Custom Image Active' : `Preset Icon: ${formData.logo_icon || 'layers'}`}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Rendered on header and footer
                      </span>
                    </div>
                  </div>

                  {/* Upload Actions & Direct Input */}
                  <div className="md:col-span-8 space-y-4">
                    {/* File Upload Trigger */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Option 1: Upload Image File (PNG, SVG, JPG, WebP)
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png, image/jpeg, image/svg+xml, image/webp, image/gif"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="logo-file-input"
                      />
                      <label
                        htmlFor="logo-file-input"
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold cursor-pointer transition-all shadow-md"
                      >
                        {uploadingLogo ? (
                          <div className="w-4 h-4 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Choose Logo File from Device
                          </>
                        )}
                      </label>
                      <span className="text-[10px] text-slate-500 mt-1 block">Maximum file size: 5MB. Transparent PNG or SVG recommended.</span>
                    </div>

                    {/* External or Data URL input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Option 2: Direct Image URL or Data URI
                      </label>
                      <input
                        type="text"
                        value={formData.logo_url || ''}
                        onChange={(e) => handleChange('logo_url', e.target.value)}
                        placeholder="e.g. https://domain.com/logo.png or /media/logos/..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Icon Selector */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">
                      Option 3: Or Choose a Built-In Brand Icon Preset
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Click icon to select</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {ICON_PRESETS.map((preset) => {
                      const IconComp = preset.icon;
                      const isSelected = formData.logo_icon === preset.id && !formData.logo_url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            handleChange('logo_icon', preset.id);
                            // Also clear logo_url so icon shows immediately
                            handleChange('logo_url', '');
                          }}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 scale-[1.02]'
                              : 'glass-panel text-slate-300 hover:text-white hover:bg-white/10 border-white/10'
                          }`}
                        >
                          <IconComp className="w-4 h-4 shrink-0 text-cyan-400" />
                          <span className="truncate text-[11px]">{preset.label}</span>
                          {isSelected && <Check className="w-3 h-3 ml-auto shrink-0 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* COMPANY NAME & SLOGAN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Company Name / Brand
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    placeholder="e.g. Craftr"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Displayed in navigation brand header and page titles.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Logo Sub-Badge / Text
                  </label>
                  <input
                    type="text"
                    value={formData.logo_text}
                    onChange={(e) => handleChange('logo_text', e.target.value)}
                    placeholder="e.g. Studio, Hub, Marketplace"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">The highlighted badge next to the company name.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Company Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.company_tagline}
                    onChange={(e) => handleChange('company_tagline', e.target.value)}
                    placeholder="e.g. WordPress & Modern Templates"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Platform Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    placeholder="e.g. support@craftr.studio"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Landing Page Hero & Copy */}
          {activeTab === 'hero' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-bold text-white">Landing Page Hero Banner</h3>
                <p className="text-xs text-slate-400">Controls the main headline, description, and primary call-to-action buttons on the homepage.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Hero Top Pill Badge
                </label>
                <input
                  type="text"
                  value={formData.hero_badge}
                  onChange={(e) => handleChange('hero_badge', e.target.value)}
                  placeholder="e.g. WordPress-Inspired Template Marketplace & Live Studio"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Primary Headline
                  </label>
                  <input
                    type="text"
                    value={formData.hero_title}
                    onChange={(e) => handleChange('hero_title', e.target.value)}
                    placeholder="e.g. Discover, Customize & Launch"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Gradient Highlighted Text
                  </label>
                  <input
                    type="text"
                    value={formData.hero_title_highlight}
                    onChange={(e) => handleChange('hero_title_highlight', e.target.value)}
                    placeholder="e.g. High-Converting Templates"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Hero Subtitle Paragraph
                </label>
                <textarea
                  rows={3}
                  value={formData.hero_subtitle}
                  onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.cta_primary_text}
                    onChange={(e) => handleChange('cta_primary_text', e.target.value)}
                    placeholder="e.g. Explore Catalogue"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Secondary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.cta_secondary_text}
                    onChange={(e) => handleChange('cta_secondary_text', e.target.value)}
                    placeholder="e.g. Open Live Theme Studio"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Metrics & Trust Strip */}
          {activeTab === 'metrics' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-bold text-white">Trust & Performance Strip</h3>
                <p className="text-xs text-slate-400">Controls the four live statistics cards shown directly beneath the homepage hero.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-4 rounded-2xl glass-panel space-y-3">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase">Stat Card 1</span>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Value</label>
                    <input
                      type="text"
                      value={formData.metric_1_value}
                      onChange={(e) => handleChange('metric_1_value', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Label</label>
                    <input
                      type="text"
                      value={formData.metric_1_label}
                      onChange={(e) => handleChange('metric_1_label', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl glass-panel space-y-3">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase">Stat Card 2</span>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Value</label>
                    <input
                      type="text"
                      value={formData.metric_2_value}
                      onChange={(e) => handleChange('metric_2_label', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Label</label>
                    <input
                      type="text"
                      value={formData.metric_2_label}
                      onChange={(e) => handleChange('metric_2_label', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl glass-panel space-y-3">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase">Stat Card 3</span>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Value</label>
                    <input
                      type="text"
                      value={formData.metric_3_value}
                      onChange={(e) => handleChange('metric_3_value', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Label</label>
                    <input
                      type="text"
                      value={formData.metric_3_label}
                      onChange={(e) => handleChange('metric_3_label', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl glass-panel space-y-3">
                  <span className="text-[11px] font-bold text-amber-400 uppercase">Stat Card 4</span>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Value</label>
                    <input
                      type="text"
                      value={formData.metric_4_value}
                      onChange={(e) => handleChange('metric_4_value', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Label</label>
                    <input
                      type="text"
                      value={formData.metric_4_label}
                      onChange={(e) => handleChange('metric_4_label', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Promotional Banner */}
          {activeTab === 'promo' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-bold text-white">Promotional Discount Callout Banner</h3>
                <p className="text-xs text-slate-400">Controls the bottom promotional banner callout on the homepage.</p>
              </div>

              <div>
                <label className="flex items-center gap-3 p-3.5 rounded-2xl glass-panel cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.promo_banner_active}
                    onChange={(e) => handleChange('promo_banner_active', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Display Promotional Banner on Homepage</span>
                    <span className="text-[11px] text-slate-400">Toggle whether this announcement strip is visible to visitors.</span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    value={formData.promo_banner_title}
                    onChange={(e) => handleChange('promo_banner_title', e.target.value)}
                    placeholder="e.g. Get 20% Off Any Template Today"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Featured Coupon Code
                  </label>
                  <input
                    type="text"
                    value={formData.promo_coupon_code}
                    onChange={(e) => handleChange('promo_coupon_code', e.target.value)}
                    placeholder="e.g. WELCOME20"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Banner Text / Details
                </label>
                <textarea
                  rows={2}
                  value={formData.promo_banner_text}
                  onChange={(e) => handleChange('promo_banner_text', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 5: Footer & Legal */}
          {activeTab === 'footer' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-bold text-white">Footer & Legal Notice</h3>
                <p className="text-xs text-slate-400">Controls the bottom footer statement and copyright text.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Footer Description
                </label>
                <textarea
                  rows={3}
                  value={formData.footer_description}
                  onChange={(e) => handleChange('footer_description', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={formData.footer_copyright}
                  onChange={(e) => handleChange('footer_copyright', e.target.value)}
                  placeholder="© 2026 Craftr Studio & Marketplace. All rights reserved."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Submit Action Bar */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Changes update the website navigation, landing page, and footer immediately upon saving.
            </span>
            <button
              type="submit"
              disabled={saving || uploadingLogo}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01]"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Website Settings
                </>
              )}
            </button>
          </div>
        </form>
        <ConfirmModal
          isOpen={confirmResetOpen}
          onClose={() => setConfirmResetOpen(false)}
          onConfirm={handleConfirmReset}
          title="Restore Factory Defaults?"
          message="Are you sure you want to reset all branding copy, slogan, hero headlines, promotional banners, and metrics to default values? This action cannot be undone."
          confirmText="Yes, Restore Defaults"
          variant="warning"
        />
      </div>
    </div>
  );
};
