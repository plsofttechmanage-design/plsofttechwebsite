import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, ArrowLeft, Lock, Tag, Check, X, Zap, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../api/orders';
import { PaymentModal } from '../components/PaymentModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useToast } from '../components/Toast';

export const CartPage = () => {
  const { cart, loading, removeItem, clearCart, itemCount, totalPrice } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [clearCartModalOpen, setClearCartModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    try {
      const res = await ordersAPI.applyCoupon(couponCode.trim());
      if (res.valid) {
        setAppliedCoupon(res);
        addToast(res.message, 'success');
      } else {
        addToast(res.error || 'Invalid coupon.', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Invalid or expired coupon code.', 'error');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    addToast('Coupon removed.', 'info');
  };

  const finalPrice = appliedCoupon
    ? appliedCoupon.final_total
    : totalPrice;

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;
    setCheckoutLoading(true);

    try {
      const res = await ordersAPI.checkout('MOCK', appliedCoupon ? appliedCoupon.code : '');
      if (res.success) {
        setOrderDetails(res.payment_details);
        setModalOpen(true);
      } else {
        addToast(res.message || 'Failed to initiate checkout', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Server error during checkout validation.', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePaymentSuccess = (paidOrder) => {
    addToast('Payment verified! Your template download has been unlocked.', 'success');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 flex justify-center">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
        {itemCount > 0 && (
          <button
            onClick={() => setClearCartModalOpen(true)}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
          >
            Clear Entire Cart
          </button>
        )}
      </div>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Shopping Cart {itemCount > 0 && <span className="text-slate-400 text-lg font-normal">({itemCount} items)</span>}
        </h1>
        <span className="text-xs text-indigo-400 font-mono">Guaranteed Safe 256-Bit SSL Checkout</span>
      </div>

      {itemCount === 0 ? (
        <div className="text-center py-24 glass-card rounded-3xl p-8 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Your cart is currently empty</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Explore our curated catalogue to discover responsive templates for your next website project.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 transition-all"
            >
              Browse Catalogue
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-3xl glass-card flex flex-col sm:flex-row items-center justify-between gap-5"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-24 h-18 rounded-2xl bg-slate-950 shrink-0 overflow-hidden border border-white/10 flex items-center justify-center shadow-md">
                    {item.template.thumbnail ? (
                      <img
                        src={item.template.thumbnail}
                        alt={item.template.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-indigo-400">
                        {item.template.title.split(' ')[0]}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Link
                      to={`/templates/${item.template.slug}`}
                      className="text-sm font-bold text-white hover:text-indigo-300 transition-colors"
                    >
                      {item.template.title}
                    </Link>
                    <p className="text-xs text-slate-400">
                      {item.template.category?.name || 'Template'} • Single-Use Commercial Licence
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded-md bg-white/5">
                        v{item.template.current_version}
                      </span>
                      <Link
                        to={`/studio?template=${item.template.id}`}
                        className="text-[11px] font-bold text-cyan-400 hover:underline"
                      >
                        Customize Theme Settings →
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-white">
                      ${item.current_price}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono">USD</span>
                  </div>
                  <button
                    onClick={() => setItemToRemove(item)}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Promo Code Input Card */}
            <div className="p-6 rounded-3xl glass-card space-y-3.5 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Tag className="w-4 h-4 text-indigo-400" />
                  <span>Have a Promotional Discount Coupon?</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Try: WELCOME20</span>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>
                      Coupon <strong>{appliedCoupon.code}</strong> applied: -${appliedCoupon.discount_amount} USD discount
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-emerald-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="Enter promo coupon (e.g. WELCOME20, SAVE10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 py-2.5 px-4 bg-slate-900 border border-white/10 text-xs text-white rounded-2xl focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase font-mono tracking-wider"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="py-2.5 px-5 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold border border-indigo-500/40 transition-all"
                  >
                    {applyingCoupon ? 'Validating...' : 'Apply Coupon'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Order Summary (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 rounded-3xl glass-card p-6 sm:p-8 space-y-6 shadow-2xl border border-white/10">
              <h3 className="text-base font-bold text-white border-b border-white/10 pb-4">
                Order Summary
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Cart Subtotal ({itemCount} items)</span>
                  <span className="font-semibold text-slate-200">${totalPrice}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-${appliedCoupon.discount_amount} USD</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>Digital Delivery</span>
                  <span className="text-emerald-400 font-bold">Instant Download</span>
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-between items-baseline text-sm font-extrabold text-white">
                  <span>Total Amount Due</span>
                  <span className="text-2xl font-black text-indigo-400">${finalPrice} <span className="text-xs font-mono font-normal text-slate-400">USD</span></span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Complete Purchase (${finalPrice})
                  </>
                )}
              </button>

              {/* Guarantees Strip */}
              <div className="space-y-2.5 pt-4 border-t border-white/5 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified Clean Source Code & Entitlements</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Instant Package (.ZIP) Download Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        orderDetails={orderDetails}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Clear Cart Confirmation Modal */}
      <ConfirmModal
        isOpen={clearCartModalOpen}
        onClose={() => setClearCartModalOpen(false)}
        onConfirm={async () => {
          await clearCart();
          setClearCartModalOpen(false);
          addToast('Your cart has been cleared.', 'info');
        }}
        title="Clear Entire Cart?"
        message="Are you sure you want to remove all templates from your shopping cart? You can add them again anytime."
        confirmText="Yes, Clear Cart"
        variant="danger"
      />

      {/* Remove Single Item Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToRemove)}
        onClose={() => setItemToRemove(null)}
        onConfirm={async () => {
          if (itemToRemove) {
            await removeItem(itemToRemove.id);
            addToast(`"${itemToRemove.template?.title}" removed from cart.`, 'info');
            setItemToRemove(null);
          }
        }}
        title="Remove Item from Cart?"
        message={`Are you sure you want to remove "${itemToRemove?.template?.title}" from your cart?`}
        confirmText="Remove Item"
        variant="danger"
      />
    </div>
  );
};
