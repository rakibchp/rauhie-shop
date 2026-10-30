import React from 'react';
import { Package, Truck, CheckCircle2, Clock, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OrderHistoryView({ orders = [], onReorder }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16 px-4 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#fdf2f8] text-[#e6388c] flex items-center justify-center">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#35104f]">
          No orders yet
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          When you place an order with Rauhie Shop, you can track fulfillment status, courier dispatch, and digital invoices right here.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#35104f] text-white font-semibold text-xs rounded-xl hover:bg-[#e6388c] transition shadow-md"
        >
          Explore Collection <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const statusSteps = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

  function getStepIndex(status) {
    const idx = statusSteps.indexOf(status);
    return idx === -1 ? 1 : idx;
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const stepIndex = getStepIndex(order.status);
        const isCancelled = order.status === 'CANCELLED';

        return (
          <article
            key={order.id}
            className="p-6 bg-white rounded-2xl border border-[#eadde8] shadow-sm hover:shadow-md transition space-y-5"
          >
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eadde8]/60 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Reference</span>
                <h3 className="font-mono font-bold text-base text-[#35104f]">{order.orderNumber}</h3>
                <span className="text-xs text-slate-500">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#f8e8f1] text-[#35104f]">
                  {order.paymentMethod} · {order.paymentStatus}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.status === 'DELIVERED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.status === 'SHIPPED'
                      ? 'bg-purple-100 text-purple-800'
                      : order.status === 'CANCELLED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            {/* Delivery Progress Bar (only if not cancelled) */}
            {!isCancelled && (
              <div className="py-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
                  <span className={stepIndex >= 0 ? 'text-[#e6388c]' : ''}>1. Placed</span>
                  <span className={stepIndex >= 1 ? 'text-[#e6388c]' : ''}>2. Processing</span>
                  <span className={stepIndex >= 2 ? 'text-[#e6388c]' : ''}>3. Shipped</span>
                  <span className={stepIndex >= 3 ? 'text-emerald-700' : ''}>4. Delivered</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#35104f] to-[#e6388c] transition-all duration-500"
                    style={{ width: `${((stepIndex + 1) / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items Ordered List */}
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover border border-[#eadde8]"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-slate-800">{item.name}</h4>
                      <span className="text-[11px] text-slate-500">Qty: {item.quantity} × ৳{item.price?.toLocaleString()}</span>
                    </div>
                  </div>
                  <strong className="font-semibold text-[#35104f]">৳{(item.total || item.price * item.quantity).toLocaleString()}</strong>
                </div>
              ))}
            </div>

            {/* Footer Summary */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#eadde8]/60 text-xs">
              <div className="text-slate-500">
                <span>Shipping to: </span>
                <strong className="text-slate-700">{order.shippingAddress?.addressLine}, {order.shippingAddress?.city}</strong>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <span className="text-slate-400 mr-2">Total Amount:</span>
                  <strong className="text-base text-[#e6388c] font-bold">
                    ৳{order.totalAmount?.toLocaleString()}
                  </strong>
                </div>

                {onReorder && (
                  <button
                    onClick={() => onReorder(order)}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fdf2f8] hover:bg-[#f8e8f1] text-[#35104f] font-semibold rounded-lg transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Order Again
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

