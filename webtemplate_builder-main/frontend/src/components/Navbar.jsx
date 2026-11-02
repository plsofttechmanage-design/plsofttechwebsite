import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Layers,
  Sliders,
  ShoppingBag,
  Heart,
  Download,
  User,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Sparkles,
  Search,
  Compass,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { BrandLogo } from './BrandLogo';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, totalPrice } = useCart();
  const { savedIds } = useWishlist();
  const { settings } = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 glass-panel border-b border-white/10 shadow-lg shadow-black/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                    <BrandLogo logoUrl={settings?.logo_url} logoIcon={settings?.logo_icon} />
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                    {settings?.company_name || 'Craftr'}<span className="text-indigo-400">.</span>
                  </span>
                  {settings?.logo_text && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 tracking-wide uppercase">
                      {settings.logo_text}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium text-slate-400 hidden sm:block">
                  {settings?.company_tagline || 'WordPress & Modern Templates'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-900/60 border border-white/5">
              <Link
                to="/"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive('/')
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Home
              </Link>
              <Link
                to="/templates"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  location.pathname.startsWith('/templates')
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Compass className="w-4 h-4" />
                All Templates
              </Link>
              <Link
                to="/studio"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive('/studio')
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
                Theme Studio
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Live
                </span>
              </Link>
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {savedIds.size > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-pink-600 to-rose-400 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/40 animate-pulse">
                  {savedIds.size}
                </span>
              )}
            </Link>

            {/* Shopping Cart Pill */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-indigo-500/40 transition-all group"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md shadow-indigo-600/50">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold">
                ${totalPrice ? Number(totalPrice).toFixed(2) : '0.00'}
              </span>
            </Link>

            {/* User Dropdown / Auth CTA */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-indigo-500/40 transition-all"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white leading-tight">
                      {user?.first_name || user?.username || user?.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-mono">
                      {user?.role || 'Customer'}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-indigo-600/20">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-3 w-60 rounded-2xl glass-panel shadow-2xl p-2 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-3.5 py-3 border-b border-white/10 mb-1">
                      <p className="font-semibold text-white truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {user?.role === 'ADMIN' ? 'Administrator' : 'Verified Member'}
                      </span>
                    </div>

                    <Link
                      to="/downloads"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <Download className="w-3.5 h-3.5" />
                      </div>
                      My Downloads & Licences
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      Account Settings
                    </Link>

                    {isAdmin && (
                      <>
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-indigo-300 hover:text-white hover:bg-indigo-600/20 transition-colors font-medium border-t border-white/5 mt-1"
                        >
                          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                          Admin Console
                        </Link>
                        <Link
                          to="/admin/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-cyan-300 hover:text-white hover:bg-cyan-600/20 transition-colors font-medium"
                        >
                          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                            <Sliders className="w-3.5 h-3.5" />
                          </div>
                          Edit Website & Landing
                        </Link>
                      </>
                    )}

                    <div className="border-t border-white/10 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 md:hidden">
            <Link to="/cart" className="relative p-2 text-slate-300">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-3 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                isActive('/') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              Home
            </Link>
            <Link
              to="/templates"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                location.pathname.startsWith('/templates') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4" />
              All Templates
            </Link>
            <Link
              to="/studio"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                isActive('/studio') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              Theme Studio
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5"
            >
              <Heart className="w-4 h-4 text-pink-400" />
              Saved Templates ({savedIds.size})
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/downloads"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  My Downloads
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5"
                >
                  <User className="w-4 h-4 text-sky-400" />
                  Account Profile
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-indigo-400 hover:bg-white/5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Console
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-slate-200 bg-slate-900 border border-white/10 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-indigo-600 rounded-xl"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
