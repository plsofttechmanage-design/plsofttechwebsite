import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Users,
  CreditCard,
  Tag,
  FileText,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Overview Metrics', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Template Catalogue', path: '/admin/templates', icon: Layers },
    { label: 'Customer Accounts', path: '/admin/customers', icon: Users },
    { label: 'Orders & Payments', path: '/admin/orders', icon: CreditCard },
    { label: 'Promo Coupons', path: '/admin/coupons', icon: Tag },
    { label: 'Website & Landing Page', path: '/admin/settings', icon: Globe },
    { label: 'Audit Trail', path: '/admin/audit', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080c15]">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 glass-panel border-r border-white/10 p-6 flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto z-40">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Craftr Console</h3>
                <span className="text-[10px] text-cyan-400 font-mono font-semibold">Administrator Ops</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Back to Marketplace */}
        <div className="pt-6 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Marketplace
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
