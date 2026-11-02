import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { ordersAPI } from '../api/orders';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export const PaymentModal = ({ isOpen, onClose, orderDetails, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('MOCK');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  if (!isOpen || !orderDetails) return null;

  const handleSimulatePayment = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await ordersAPI.verifyPayment({
        order_number: orderDetails.order_number,
        transaction_id: orderDetails.transaction_id || `TXN-CLIENT-${Date.now()}`,
        provider: provider,
        status: 'SUCCESS',
        payload: {
          simulated_at: new Date().toISOString(),
          payment_method: provider,
          card_last4: '4242',
        },
      });

      if (res.success) {
        setIsSuccess(true);
        await fetchCart();
        if (onPaymentSuccess) {
          onPaymentSuccess(res.order);
        }
      } else {
        setErrorMsg(res.message || 'Payment verification failed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Payment processing error. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Secure Checkout</h3>
              <p className="text-xs text-slate-400 font-mono">Ref: {orderDetails.order_number}</p>
            </div>
          </div>
          {!isSuccess && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {isSuccess ? (
          /* Payment Success State */
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Payment Verified & Complete!</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Your purchase has been recorded and the protected template packages are unlocked for download.
              </p>
            </div>
            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/downloads');
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-colors"
              >
                Access My Downloads
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form State */
          <div className="py-5 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Total Amount Box */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <span className="text-sm text-slate-300">Total Due</span>
              <span className="text-xl font-extrabold text-indigo-400">
                ${orderDetails.amount} {orderDetails.currency}
              </span>
            </div>

            {/* Gateway Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['MOCK', 'STRIPE', 'RAZORPAY'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setProvider(m)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                      provider === m
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {m === 'MOCK' ? '⚡ Instant Mock' : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Card Preview */}
            <div className="p-4 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-950 border border-indigo-500/20 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <span className="text-[11px] font-mono tracking-widest text-slate-400">TEST MODE</span>
              </div>
              <div className="text-sm font-mono tracking-widest text-slate-200">
                •••• •••• •••• 4242
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>EXP: 12/28</span>
                <span>CVC: •••</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>256-bit encrypted SSL checkout verification</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  `Pay $${orderDetails.amount}`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

