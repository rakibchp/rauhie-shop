import { useState } from 'react';
import { X, Sparkles, Gift, Heart, Check, ShoppingBag, Wand2 } from 'lucide-react';
import { api } from '../services/api';

const RECIPIENT_OPTIONS = ['Mother', 'Sister', 'Partner / Wife', 'Best Friend', 'Bride / Groom', 'Colleague', 'Self Care'];
const OCCASION_OPTIONS = ['Birthday', 'Anniversary', 'Wedding', 'Eid / Festivity', 'Graduation', 'Thank You'];
const BUDGET_OPTIONS = [
  { label: 'Under ৳2,000', value: 2000 },
  { label: '৳2,000 – ৳3,500', value: 3500 },
  { label: '৳3,500 – ৳5,000', value: 5000 },
  { label: 'Luxury (৳5,000+)', value: 8000 },
];
const VIBE_OPTIONS = ['Timeless Luxury', 'Minimalist Chic', 'Modest Grace', 'Romantic Rose', 'Smart Tech'];

export default function AIGiftAdvisorModal({ isOpen, onClose, onAddToCart }) {
  const [recipient, setRecipient] = useState('Sister');
  const [occasion, setOccasion] = useState('Birthday');
  const [budget, setBudget] = useState(3500);
  const [vibe, setVibe] = useState('Timeless Luxury');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [addedItemIds, setAddedItemIds] = useState([]);

  if (!isOpen) return null;

  async function handleFindGifts(e) {
    e?.preventDefault();
    setLoading(true);
    try {
      const data = await api.getGiftRecommendations({
        recipient,
        occasion,
        budget,
        interests: vibe,
        styleNotes: notes,
      });
      setResult(data);
    } catch (err) {
      console.error('AI Gift Finder error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleAddRecommendation(product) {
    if (!product) return;
    onAddToCart(product);
    setAddedItemIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== product.id));
    }, 2500);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-gift-advisor-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#230a34]/60 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl border border-[#eadde8] shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#35104f] to-[#4a166e] text-white rounded-t-2xl border-b border-pink-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e6388c]/25 border border-[#e6388c]/40 flex items-center justify-center text-[#e6388c]">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 id="ai-gift-advisor-title" className="text-base font-serif italic font-bold text-white tracking-wide">
                AI Personal Gift Concierge
              </h2>
              <span className="text-[11px] text-pink-200/80">
                Powered by Gemini 3.8 Flash · Curated for Rauhie Shop
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          {!result ? (
            <form onSubmit={handleFindGifts} className="space-y-5">
              <div className="bg-[#fffbfd] p-4 rounded-xl border border-[#eadde8] text-xs text-[#35104f] leading-relaxed">
                Tell our AI Concierge about the lucky recipient. We will analyze our boutique collection to craft the most thoughtful, elegant gift pairing.
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#35104f] mb-2">
                  Who are you shopping for?
                </label>
                <div className="flex flex-wrap gap-2">
                  {RECIPIENT_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRecipient(item)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        recipient === item
                          ? 'bg-[#35104f] text-white shadow-xs'
                          : 'bg-[#faf5f9] text-slate-700 hover:bg-[#eadde8]/60 border border-[#eadde8]'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#35104f] mb-2">
                  What is the occasion?
                </label>
                <div className="flex flex-wrap gap-2">
                  {OCCASION_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setOccasion(item)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        occasion === item
                          ? 'bg-[#35104f] text-white shadow-xs'
                          : 'bg-[#faf5f9] text-slate-700 hover:bg-[#eadde8]/60 border border-[#eadde8]'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#35104f] mb-2">
                  Target Budget (BDT)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BUDGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBudget(opt.value)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                        budget === opt.value
                          ? 'bg-[#e6388c] text-white shadow-xs'
                          : 'bg-[#faf5f9] text-slate-700 border border-[#eadde8] hover:bg-[#eadde8]/60'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aesthetic Vibe */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#35104f] mb-2">
                  Aesthetic Style &amp; Preference
                </label>
                <div className="flex flex-wrap gap-2">
                  {VIBE_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setVibe(item)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        vibe === item
                          ? 'bg-[#35104f] text-white shadow-xs'
                          : 'bg-[#faf5f9] text-slate-700 hover:bg-[#eadde8]/60 border border-[#eadde8]'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#35104f] mb-1">
                  Special Notes or Tastes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Loves pearl jewelry, prefers pastel hues, sensitive skin..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#eadde8] focus:border-[#e6388c] focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#35104f] via-[#4a166e] to-[#e6388c] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Wand2 className="w-4 h-4 animate-spin text-pink-200" />
                    <span>Curating Gift Portfolio with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-pink-200" />
                    <span>Generate Personalized Gift Recommendation</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Insight Banner */}
              <div className="p-4 bg-[#fffbfd] rounded-xl border border-[#eadde8] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#e6388c] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Curated Concierge Insight
                </div>
                <p className="text-sm font-serif font-medium text-[#35104f]">
                  "{result.greeting}"
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {result.occasionInsight}
                </p>
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#35104f]">
                  Handpicked Luxury Selections
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(result.recommendations || []).map((rec, idx) => {
                    const prod = rec.product;
                    const isAdded = prod && addedItemIds.includes(prod.id);
                    if (!prod) return null;

                    return (
                      <div
                        key={idx}
                        className="p-4 bg-white rounded-xl border border-[#eadde8] shadow-xs flex flex-col justify-between space-y-3 hover:border-[#e6388c]/40 transition"
                      >
                        <div className="space-y-2.5">
                          <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-50 border border-[#eadde8]/50">
                            <img
                              src={prod.images?.[0]}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#35104f]/90 text-white text-[10px] font-semibold rounded-md backdrop-blur-xs">
                              {prod.category?.name || 'Exclusive'}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-serif font-bold text-sm text-[#35104f] line-clamp-1">
                              {prod.name}
                            </h4>
                            <span className="font-bold text-xs text-[#e6388c] shrink-0">
                              ৳{prod.price}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 line-clamp-2">
                            {rec.whyItFits}
                          </p>

                          {rec.curatorTip && (
                            <div className="text-[10px] text-pink-900 bg-pink-50/70 p-2 rounded-lg border border-pink-100 flex items-start gap-1.5">
                              <Heart className="w-3 h-3 text-[#e6388c] shrink-0 mt-0.5" />
                              <span>{rec.curatorTip}</span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddRecommendation(prod)}
                          className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#35104f] hover:bg-[#e6388c] text-white shadow-xs'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Added to Shopping Bag
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" /> Add to Shopping Bag
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Greeting Card Message */}
              {result.customGiftCardMessage && (
                <div className="p-4 bg-gradient-to-br from-[#faf5f9] to-[#f8e8f1] rounded-xl border border-pink-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#e6388c]">
                    Complimentary Handwritten Gift Card Note
                  </span>
                  <p className="text-xs font-serif italic text-[#35104f] leading-relaxed">
                    "{result.customGiftCardMessage}"
                  </p>
                </div>
              )}

              {/* Packaging Tip */}
              {result.giftWrappingSuggestion && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Gift className="w-4 h-4 text-[#e6388c] shrink-0" />
                  <span>
                    <strong>Presentation recommendation:</strong> {result.giftWrappingSuggestion}
                  </span>
                </div>
              )}

              {/* Reset Button */}
              <div className="pt-2 flex justify-between items-center border-t border-[#eadde8]">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="text-xs font-semibold text-[#35104f] hover:text-[#e6388c] transition cursor-pointer"
                >
                  ← Adjust preferences &amp; regenerate
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-[#35104f] text-white text-xs font-semibold rounded-xl hover:bg-[#e6388c] transition cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
