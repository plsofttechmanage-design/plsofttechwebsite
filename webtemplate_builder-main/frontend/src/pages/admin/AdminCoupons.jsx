import React, { useState, useEffect } from 'react';
import { Tag, Plus, CheckCircle2, XCircle, X } from 'lucide-react';
import { ordersAPI } from '../../api/orders';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [couponToDeactivate, setCouponToDeactivate] = useState(null);
  const { addToast } = useToast();

  // Create coupon form
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('20.00');
  const [minOrder, setMinOrder] = useState('0.00');
  const [maxUses, setMaxUses] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = () => {
    setLoading(true);
    ordersAPI
      .getAdminCoupons()
      .then((data) => setCoupons(data.results || data || []))
      .catch((err) => console.error('Failed to load coupons', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (coupon) => {
    if (coupon.is_active) {
      setCouponToDeactivate(coupon);
      return;
    }
    // Directly activate
    try {
      await ordersAPI.updateAdminCoupon(coupon.id, { is_active: true });
      addToast(`Coupon "${coupon.code}" activated!`, 'success');
      fetchCoupons();
    } catch {
      addToast('Failed to activate coupon.', 'error');
    }
  };

  const handleConfirmDeactivateCoupon = async () => {
    if (!couponToDeactivate) return;
    try {
      await ordersAPI.updateAdminCoupon(couponToDeactivate.id, { is_active: false });
      addToast(`Coupon "${couponToDeactivate.code}" deactivated.`, 'success');
      setCouponToDeactivate(null);
      fetchCoupons();
    } catch {
      addToast('Failed to deactivate coupon.', 'error');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code) return;
    setSubmitting(true);

    const payload = {
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: discountValue,
      min_order_amount: minOrder || '0.00',
      max_uses: maxUses ? parseInt(maxUses, 10) : null,
      is_active: true,
    };

    try {
      await ordersAPI.createAdminCoupon(payload);
      addToast(`Promo coupon "${payload.code}" created!`, 'success');
      setModalOpen(false);
      setCode('');
      fetchCoupons();
    } catch (err) {
      addToast(err.response?.data?.code?.[0] || 'Failed to create coupon.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Promotional Coupons & Discounts</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create discount codes, set percentage or fixed discounts, and track usage.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Code</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Min Spend</th>
                <th className="py-3.5 px-4">Times Used</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No promo coupons created yet.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30">
                    <td className="py-4 px-5 font-mono font-bold text-white text-sm">
                      {c.code}
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      {c.discount_type === 'PERCENTAGE' ? 'Percentage' : 'Fixed USD'}
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-400 text-sm">
                      {c.discount_type === 'PERCENTAGE' ? `${c.discount_value}% OFF` : `$${c.discount_value} OFF`}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-400">
                      ${c.min_order_amount}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-300">
                      {c.times_used} {c.max_uses ? `/ ${c.max_uses}` : ''}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.is_active
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {c.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`py-1 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                          c.is_active
                            ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/40'
                            : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/40'
                        }`}
                      >
                        {c.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Promotional Coupon</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH30"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Min Spend ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20"
                >
                  {submitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(couponToDeactivate)}
        onClose={() => setCouponToDeactivate(null)}
        onConfirm={handleConfirmDeactivateCoupon}
        title={`Deactivate Coupon "${couponToDeactivate?.code}"?`}
        message="Are you sure you want to deactivate this promotional code? Customers will no longer be able to apply it at checkout."
        confirmText="Yes, Deactivate Coupon"
        variant="warning"
      />
    </div>
  );
};

