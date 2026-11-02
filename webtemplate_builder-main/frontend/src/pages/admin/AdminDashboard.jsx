import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Layers,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ordersAPI } from '../../api/orders';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI
      .getAdminDashboardSummary()
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to load dashboard summary', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentOrders = data?.recent_orders || [];
  const chartData = data?.chart_data || [];

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 100);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Administrator Overview</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Real-time summary of marketplace revenue, active catalogue themes, order fulfillment, and client accounts.
        </p>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Settled Revenue</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white tracking-tight">
              ${metrics.total_revenue?.toFixed(2) || '0.00'}
            </span>
            <span className="block text-[11px] text-slate-400 mt-1 font-mono">
              USD Verified Settlements
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {metrics.total_orders || 0}
            </span>
            <span className="block text-[11px] text-emerald-400 mt-1 font-semibold">
              {metrics.paid_orders || 0} Paid & Fulfilled
            </span>
          </div>
        </div>

        {/* Published Templates */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Templates</span>
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {metrics.published_templates || 0}
            </span>
            <span className="block text-[11px] text-slate-400 mt-1">
              Out of {metrics.total_templates || 0} in Catalogue
            </span>
          </div>
        </div>

        {/* Registered Customers */}
        <div className="p-6 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Customer Accounts</span>
            <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {metrics.total_customers || 0}
            </span>
            <span className="block text-[11px] text-slate-400 mt-1">
              Active Registered Clients
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Revenue & Growth Analytics */}
      <div className="rounded-3xl glass-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Monthly Revenue & Volume Trend</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Historical digital assets turnover and completed orders.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-indigo-500 inline-block"></span>
              <span>Revenue ($ USD)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-cyan-400 inline-block"></span>
              <span>Volume</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="grid grid-cols-6 gap-3 sm:gap-6 pt-6 pb-2 items-end h-56 border-b border-white/5">
          {chartData.map((item, idx) => {
            const heightPercent = Math.min(100, Math.round((item.revenue / maxRevenue) * 100));
            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[11px] font-bold text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  ${item.revenue}
                </div>
                <div className="w-full max-w-[48px] bg-slate-800/80 rounded-t-2xl overflow-hidden flex flex-col justify-end p-1 transition-all duration-300 group-hover:bg-slate-800" style={{ height: `${Math.max(15, heightPercent)}%` }}>
                  <div className="w-full bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 rounded-xl flex-1 shadow-inner"></div>
                </div>
                <div className="text-center">
                  <span className="block text-xs font-semibold text-slate-300">{item.month}</span>
                  <span className="block text-[10px] text-slate-500 font-mono">{item.orders} ord</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-3xl glass-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Recent Transactions</h2>
            <p className="text-xs text-slate-400 mt-0.5">Most recent order attempts and settlements.</p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
          >
            View All Orders
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="glass-panel text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Order Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4 rounded-r-xl">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {ord.order_number}
                    </td>
                    <td className="py-3.5 px-4">{ord.customer_email}</td>
                    <td className="py-3.5 px-4 font-extrabold text-white">
                      ${ord.total_amount} {ord.currency}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === 'PAID'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : ord.status === 'PENDING'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {ord.payment_method}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
