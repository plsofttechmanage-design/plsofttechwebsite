import React, { useState } from 'react';
import { Layers, ShieldCheck, Zap, Code, Heart, Send, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { BrandLogo } from './BrandLogo';
import { useToast } from './Toast';

export const Footer = () => {
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { addToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    addToast('Thank you for subscribing to new template drops!', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-slate-950 border-t border-white/5 text-slate-400 text-xs mt-auto relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-40 bg-indigo-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-14">
          {/* Brand Info (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 overflow-hidden">
                <BrandLogo logoUrl={settings?.logo_url} logoIcon={settings?.logo_icon} className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold text-white">
                {settings?.company_name || 'Craftr'}<span className="text-indigo-400">.</span>
                {settings?.logo_text && (
                  <span className="ml-1.5 text-[11px] font-bold uppercase text-indigo-400 tracking-wider">
                    {settings.logo_text}
                  </span>
                )}
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {settings?.footer_description || 'The premier digital template marketplace inspired by WordPress. Discover curated themes, tweak settings in our live visual theme studio, and download production packages with verified licenses.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>API & Studio Operational</span>
              </div>
            </div>
          </div>

          {/* Marketplace Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Catalogue</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/templates?category=saas-landing" className="hover:text-indigo-400 transition-colors">SaaS & Tech Landing</Link></li>
              <li><Link to="/templates?category=ecommerce" className="hover:text-indigo-400 transition-colors">E-Commerce Stores</Link></li>
              <li><Link to="/templates?category=portfolio" className="hover:text-indigo-400 transition-colors">Creative Portfolios</Link></li>
              <li><Link to="/templates?category=corporate" className="hover:text-indigo-400 transition-colors">Corporate & Agency</Link></li>
              <li><Link to="/templates?category=blog-editorial" className="hover:text-indigo-400 transition-colors">Modern Blogs</Link></li>
            </ul>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/studio" className="hover:text-cyan-400 transition-colors flex items-center gap-1">Theme Studio <span className="text-[9px] px-1 rounded bg-cyan-500/20 text-cyan-300">Live</span></Link></li>
              <li><Link to="/downloads" className="hover:text-indigo-400 transition-colors">Verified Downloads</Link></li>
              <li><a href="/api/docs/" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">Swagger OpenAPI 3.0</a></li>
              <li><a href="/api/redoc/" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">ReDoc API Specs</a></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Stay Ahead</h4>
            <p className="text-[11px] text-slate-400">
              Receive notifications when new design systems and templates drop.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@work.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Subscribed successfully!
                </span>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>{settings?.footer_copyright || '© 2026 Craftr Studio & Marketplace. All rights reserved.'}</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors">Terms of Licence</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors">Security Verification</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
