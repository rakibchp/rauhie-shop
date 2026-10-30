import { useState } from 'react';
import { X, CheckCircle, ShieldCheck, CreditCard, Banknote, Smartphone, ArrowRight, Printer } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, cart, user, onOrderSuccess }) {
  const [step, setStep] = useState('details'); // 'details' | 'payment' | 'confirmed'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Shipping form fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [addressLine, setAddressLine] = useState(user?.address || '');
  const [deliveryArea, setDeliveryArea] = useState('dhaka'); // 'dhaka' (60) | 'outside' (120)
  const [notes, setNotes] = useState('');

  // Coupon code
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('BKASH'); // 'BKASH' | 'NAGAD' | 'CARD' | 'COD'
  const [transactionId, setTransactionId] = useState('');
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Placed Order details
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  if (!isOpen) return null;

  const items = Object.values(cart);
  const subtotal = items.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);
  const shippingFee = deliveryArea === 'dhaka' ? 60 : 120;
  const totalAmount = Math.max(0, subtotal + shippingFee - discount);

  function applyCoupon(e) {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'RAUHIE10') {
      const discountVal = Math.round(subtotal * 0.1);
      setDiscount(discountVal);
      setCouponMessage('Promo code applied: 10% off (৳' + discountVal + ')');
    } else if (code === 'WELCOME') {
      setDiscount(150);
      setCouponMessage('Welcome voucher applied: ৳150 off');
    } else {
      setDiscount(0);
      setCouponMessage('Invalid promo code. Try "RAUHIE10"');
    }
  }

  function handleProceedToPayment(e) {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone || !addressLine) {
      setError('Please fill in all required shipping fields.');
      return;
    }
    setError('');
    setStep('payment');
  }

  async function handleFinalCheckout(e) {
    e.preventDefault();
    setError('');

    if ((paymentMethod === 'BKASH' || paymentMethod === 'NAGAD') && !transactionId.trim()) {
      setError(`Please enter the ${paymentMethod} Transaction ID (TrxID) after sending payment.`);
      return;
    }

    if (paymentMethod === 'CARD') {
      if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
        setError('Please complete all credit/debit card fields.');
        return;
      }
    }

    setLoading(true);

    try {
      const orderPayload = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: {
          addressLine,
          city: deliveryArea === 'dhaka' ? 'Dhaka' : 'Outside Dhaka',
          country: 'Bangladesh',
        },
        paymentMethod,
        shippingFee,
        discount,
        notes: (paymentMethod === 'BKASH' || paymentMethod === 'NAGAD')
          ? `TrxID: ${transactionId.trim()} | ${notes}`
          : notes,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      const orderResult = await onOrderSuccess(orderPayload);
      setConfirmedOrder(orderResult);
      setStep('confirmed');
    } catch (err) {
      setError(err.message || 'Failed to place your order. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#eadde8] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eadde8] bg-gradient-to-r from-[#35104f] to-[#4a166e] text-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e6388c] animate-pulse" />
            <h2 className="text-lg font-serif italic font-bold tracking-wide text-white">
              {step === 'details' && 'Secure Checkout — Shipping Details'}
              {step === 'payment' && 'Select Payment Gateway'}
              {step === 'confirmed' && 'Order Confirmed! Thank You'}
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          {/* STEP 1: Shipping Details */}
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#35104f] mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ayesha Rahman"
                    className="w-full px-3.5 py-2.5 border border-[#eadde8] rounded-lg focus:border-[#e6388c] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#35104f] mb-1">
                    Phone Number (for SMS & Courier) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +880 1710 659435"
                    className="w-full px-3.5 py-2.5 border border-[#eadde8] rounded-lg focus:border-[#e6388c] focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#35104f] mb-1">
                  Email Address (for Digital Receipt) *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 border border-[#eadde8] rounded-lg focus:border-[#e6388c] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#35104f] mb-1">
                  Delivery Address (House, Road, Area) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="House #, Flat #, Street address, Landmark..."
                  className="w-full px-3.5 py-2 border border-[#eadde8] rounded-lg focus:border-[#e6388c] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#35104f] mb-1">
                  Delivery Region *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition ${deliveryArea === 'dhaka' ? 'border-[#e6388c] bg-[#f8e8f1]/30 font-medium' : 'border-[#eadde8] hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="deliveryArea"
                        checked={deliveryArea === 'dhaka'}
                        onChange={() => setDeliveryArea('dhaka')}
                        className="accent-[#e6388c]"
                      />
                      <span className="text-sm">Inside Dhaka</span>
                    </div>
                    <span className="text-xs font-bold text-[#35104f]">৳60 (24-48 hrs)</span>
                  </label>

                  <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition ${deliveryArea === 'outside' ? 'border-[#e6388c] bg-[#f8e8f1]/30 font-medium' : 'border-[#eadde8] hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="deliveryArea"
                        checked={deliveryArea === 'outside'}
                        onChange={() => setDeliveryArea('outside')}
                        className="accent-[#e6388c]"
                      />
                      <span className="text-sm">Outside Dhaka</span>
                    </div>
                    <span className="text-xs font-bold text-[#35104f]">৳120 (3-5 days)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#35104f] mb-1">
                  Order Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special delivery instructions, gate code, timing..."
                  className="w-full px-3.5 py-2 border border-[#eadde8] rounded-lg focus:border-[#e6388c] focus:outline-none text-sm"
                />
              </div>

              {/* Promo code voucher */}
              <div className="pt-2 border-t border-[#eadde8]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon (e.g. RAUHIE10)"
                    className="flex-1 px-3 py-2 text-xs border border-[#eadde8] rounded-lg uppercase"
                  />
                  <button
                    onClick={applyCoupon}
                    type="button"
                    className="px-4 py-2 text-xs font-semibold bg-[#35104f] text-white rounded-lg hover:bg-[#e6388c] transition"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-xs mt-1.5 ${discount > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Order total preview */}
              <div className="p-3.5 bg-[#fdf2f8] rounded-xl text-xs space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-semibold">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>৳{shippingFee}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount Voucher</span>
                    <span>-৳{discount}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1.5 border-t border-pink-200 text-sm font-bold text-[#35104f]">
                  <span>Total Payable</span>
                  <span className="text-[#e6388c]">৳{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#35104f] text-white font-semibold rounded-xl hover:bg-[#e6388c] transition shadow-md"
              >
                Continue to Payment <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Payment Gateway Selection */}
          {step === 'payment' && (
            <form onSubmit={handleFinalCheckout} className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#35104f] mb-2">
                  Choose Payment Gateway
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* bKash */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BKASH')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${paymentMethod === 'BKASH' ? 'border-[#e2136e] bg-[#e2136e]/10 ring-2 ring-[#e2136e]' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <Smartphone className="w-5 h-5 text-[#e2136e] mb-1" />
                    <span className="text-xs font-bold text-[#e2136e]">bKash</span>
                    <span className="text-[10px] text-slate-500">Mobile Wallet</span>
                  </button>

                  {/* Nagad */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NAGAD')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${paymentMethod === 'NAGAD' ? 'border-[#f7921e] bg-[#f7921e]/10 ring-2 ring-[#f7921e]' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <Smartphone className="w-5 h-5 text-[#f7921e] mb-1" />
                    <span className="text-xs font-bold text-[#f7921e]">Nagad</span>
                    <span className="text-[10px] text-slate-500">Post Office</span>
                  </button>

                  {/* Visa/Mastercard */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${paymentMethod === 'CARD' ? 'border-[#35104f] bg-[#35104f]/10 ring-2 ring-[#35104f]' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <CreditCard className="w-5 h-5 text-[#35104f] mb-1" />
                    <span className="text-xs font-bold text-[#35104f]">Card / Stripe</span>
                    <span className="text-[10px] text-slate-500">Debit / Credit</span>
                  </button>

                  {/* Cash on Delivery */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${paymentMethod === 'COD' ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600 mb-1" />
                    <span className="text-xs font-bold text-emerald-700">Cash on Del.</span>
                    <span className="text-[10px] text-slate-500">Pay at Door</span>
                  </button>
                </div>
              </div>

              {/* bKash instructions */}
              {paymentMethod === 'BKASH' && (
                <div className="p-4 bg-pink-50 border border-pink-200 rounded-xl space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2 text-pink-700 font-bold text-sm">
                    <Smartphone className="w-4 h-4" /> bKash Merchant Payment Steps
                  </div>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Go to your bKash Mobile App or dial <code className="bg-pink-100 px-1 py-0.5 rounded font-mono">*247#</code></li>
                    <li>Choose <strong>"Make Payment"</strong> (or "Send Money")</li>
                    <li>Enter Rauhie Shop Merchant Number: <strong className="text-[#35104f] font-mono select-all">01710659435</strong></li>
                    <li>Enter Amount: <strong className="text-[#e6388c]">৳{totalAmount.toLocaleString()}</strong></li>
                    <li>Enter Reference: <span className="font-mono">RAUHIE</span></li>
                    <li>Complete the transaction and copy the <strong>TrxID</strong> below:</li>
                  </ol>
                  <div>
                    <label className="block font-semibold text-[#35104f] mb-1">
                      bKash Transaction ID (TrxID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                      placeholder="e.g. 9MK29104LA"
                      className="w-full px-3 py-2 font-mono text-sm uppercase bg-white border border-pink-300 rounded-lg focus:outline-none focus:border-[#e2136e]"
                    />
                  </div>
                </div>
              )}

              {/* Nagad instructions */}
              {paymentMethod === 'NAGAD' && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2 text-orange-700 font-bold text-sm">
                    <Smartphone className="w-4 h-4" /> Nagad Merchant Payment Steps
                  </div>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Open Nagad App or dial <code className="bg-orange-100 px-1 py-0.5 rounded font-mono">*167#</code></li>
                    <li>Select <strong>"Merchant Pay"</strong></li>
                    <li>Enter Merchant Number: <strong className="text-[#35104f] font-mono select-all">01710659435</strong></li>
                    <li>Amount: <strong className="text-[#f7921e]">৳{totalAmount.toLocaleString()}</strong></li>
                    <li>Enter Reference: <span className="font-mono">RAUHIE</span></li>
                    <li>Enter the received 8-character <strong>Transaction ID</strong> below:</li>
                  </ol>
                  <div>
                    <label className="block font-semibold text-[#35104f] mb-1">
                      Nagad Transaction ID (TrxID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                      placeholder="e.g. 7NJ9482Q"
                      className="w-full px-3 py-2 font-mono text-sm uppercase bg-white border border-orange-300 rounded-lg focus:outline-none focus:border-[#f7921e]"
                    />
                  </div>
                </div>
              )}

              {/* Card / Stripe mock */}
              {paymentMethod === 'CARD' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-[#35104f] font-bold text-sm">
                    <CreditCard className="w-4 h-4" /> Credit / Debit Card (Stripe Gateway)
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="e.g. Ayesha Rahman"
                      className="w-full px-3 py-2 border rounded-lg bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className="w-full px-3 py-2 border rounded-lg bg-white font-mono text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Expires (MM/YY)</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full px-3 py-2 border rounded-lg bg-white font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">CVC / CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3 py-2 border rounded-lg bg-white font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] pt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    256-bit SSL encrypted PCI-DSS compliant checkout
                  </div>
                </div>
              )}

              {/* COD note */}
              {paymentMethod === 'COD' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                  <p className="font-bold">Cash on Delivery selected</p>
                  <p>You can inspect your package and pay the delivery courier <strong>৳{totalAmount.toLocaleString()}</strong> in cash upon receipt at your doorstep.</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-4 py-2.5 border border-[#eadde8] text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[#35104f] text-white font-semibold rounded-xl hover:bg-[#e6388c] transition text-sm shadow-md disabled:opacity-50"
                >
                  {loading ? 'Processing Order...' : `Pay & Place Order (৳${totalAmount.toLocaleString()})`}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Order Confirmed Screen */}
          {step === 'confirmed' && confirmedOrder && (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold font-serif text-[#35104f]">
                Order Confirmed!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you, <strong>{confirmedOrder.customerName}</strong>. Your order has been registered in the system.
              </p>

              <div className="p-4 bg-[#fffbfd] border border-[#eadde8] rounded-2xl text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between border-b pb-2 font-mono">
                  <span className="text-slate-500">Order Number</span>
                  <span className="font-bold text-[#35104f]">{confirmedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Gateway</span>
                  <span className="font-semibold uppercase">{confirmedOrder.paymentMethod} ({confirmedOrder.paymentStatus})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery To</span>
                  <span className="font-semibold text-right max-w-[200px] truncate">{confirmedOrder.shippingAddress?.addressLine}</span>
                </div>
                <div className="flex justify-between pt-2 border-t text-sm font-bold text-[#35104f]">
                  <span>Total Paid</span>
                  <span className="text-[#e6388c]">৳{confirmedOrder.totalAmount?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#eadde8] rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                >
                  <Printer className="w-4 h-4" /> Print Invoice
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-[#35104f] text-white rounded-xl text-xs font-semibold hover:bg-[#e6388c] transition"
                >
                  Done & Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

