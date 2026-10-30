import { useState, useEffect } from 'react';
import { X, Sparkles, Wand2, ShoppingBag, Check, Layers } from 'lucide-react';
import { api } from '../services/api';

const VIBE_TAGS = ['Festive Celebration', 'Evening Gala', 'Modern Modest Chic', 'Daytime High Tea', 'Executive Elegance'];

export default function AIStyleMatchModal({ isOpen, onClose, product, onAddToCart, onAddBundle }) {
  const [selectedVibe, setSelectedVibe] = useState('Festive Celebration');
  const [loading, setLoading] = useState(true);
  const [ensemble, setEnsemble] = useState(null);
  const [bundleAdded, setBundleAdded] = useState(false);

  useEffect(() => {
    if (!isOpen || !product) return;
    let ignore = false;

    api.getStyleMatch({
      productId: product.id,
      styleVibe: selectedVibe,
    }).then((data) => {
      if (!ignore) {
        setEnsemble(data);
        setLoading(false);
      }
    }).catch((e) => {
      console.error('Style match failed', e);
      if (!ignore) {
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [isOpen, product, selectedVibe]);

  if (!isOpen || !product) return null;

  function handleVibeChange(newVibe) {
    setSelectedVibe(newVibe);
    setLoading(true);
    setBundleAdded(false);
  }

  const allItems = [product, ...(ensemble?.pairedProducts || [])];
  const totalBundlePrice = allItems.reduce((sum, item) => sum + (item?.price || 0), 0);
  const bundleDiscount = Math.round(totalBundlePrice * 0.1); // 10% bundle saving
  const discountedTotal = totalBundlePrice - bundleDiscount;

  function handleAddAllBundle() {
    if (onAddBundle) {
      onAddBundle(allItems);
    } else {
      allItems.forEach((it) => onAddToCart(it));
    }
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 3000);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="style-match-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#230a34]/60 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl border border-[#eadde8] shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#35104f] to-[#4a166e] text-white rounded-t-2xl border-b border-pink-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e6388c]/25 border border-[#e6388c]/40 flex items-center justify-center text-[#e6388c]">
              <Layers className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 id="style-match-title" className="text-base font-serif italic font-bold text-white tracking-wide">
                AI Wardrobe Stylist &amp; Ensemble Matcher
              </h2>
              <span className="text-[11px] text-pink-200/80">
                Powered by Gemini 3.8 Flash · Coordinating Rauhie Collection
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

        <div className="p-6 space-y-6">
          {/* Base Product Spot */}
          <div className="flex items-center gap-4 p-4 bg-[#fffbfd] rounded-xl border border-[#eadde8]">
            <img
              src={product.images?.[0]}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg border border-[#eadde8]"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#e6388c]">
                Styling Centerpiece
              </span>
              <h3 className="font-serif font-bold text-sm text-[#35104f] truncate">
                {product.name}
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                ৳{product.price} · {product.category?.name}
              </span>
            </div>
          </div>

          {/* Vibe Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#35104f] mb-2">
              Select Desired Aesthetic or Occasion
            </label>
            <div className="flex flex-wrap gap-2">
              {VIBE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleVibeChange(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    selectedVibe === tag
                      ? 'bg-[#35104f] text-white shadow-xs'
                      : 'bg-[#faf5f9] text-slate-700 hover:bg-[#eadde8]/60 border border-[#eadde8]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center space-y-3">
              <Wand2 className="w-8 h-8 mx-auto text-[#e6388c] animate-spin" />
              <p className="text-xs font-medium text-slate-600">
                Our Gemini AI Stylist is harmonizing textures, palette, and silhouettes...
              </p>
            </div>
          ) : ensemble ? (
            <div className="space-y-5 animate-fade-in">
              {/* Editorial Look Title */}
              <div className="p-4 bg-gradient-to-br from-[#faf5f9] to-[#f8e8f1] rounded-xl border border-pink-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e6388c]">
                  Curated Look
                </span>
                <h4 className="font-serif font-bold text-base text-[#35104f] mt-0.5">
                  "{ensemble.lookTitle}"
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {ensemble.stylingPhilosophy || ensemble.fashionAdvice}
                </p>
              </div>

              {/* Paired Pieces */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#35104f] mb-3">
                  Complementary Coordinated Pieces ({ensemble.pairedProducts?.length || 0})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(ensemble.pairedProducts || []).map((paired, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-[#eadde8] flex flex-col justify-between space-y-2 hover:border-[#e6388c]/40 transition shadow-xs"
                    >
                      <div className="space-y-1.5">
                        <div className="aspect-square rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
                          <img
                            src={paired.images?.[0]}
                            alt={paired.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h5 className="font-serif font-bold text-xs text-[#35104f] line-clamp-1">
                          {paired.name}
                        </h5>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">{paired.category?.name}</span>
                          <span className="font-bold text-[#e6388c]">৳{paired.price}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onAddToCart(paired)}
                        className="w-full py-1.5 text-[11px] font-semibold bg-[#faf5f9] hover:bg-[#35104f] hover:text-white text-[#35104f] rounded-lg border border-[#eadde8] transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <ShoppingBag className="w-3 h-3" /> Add Item
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete Ensemble Bundle Card */}
              <div className="p-4 bg-[#35104f] text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-pink-300 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Complete 4-Piece Ensemble Bundle</span>
                  </div>
                  <div className="flex items-baseline justify-center sm:justify-start gap-2">
                    <span className="text-lg font-bold text-white">৳{discountedTotal}</span>
                    <span className="text-xs text-slate-300 line-through">৳{totalBundlePrice}</span>
                    <span className="text-[11px] font-bold text-[#e6388c] bg-white px-2 py-0.5 rounded-full">
                      Save ৳{bundleDiscount} (10% off)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddAllBundle}
                  className={`w-full sm:w-auto py-2.5 px-5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    bundleAdded
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#e6388c] hover:bg-pink-600 text-white'
                  }`}
                >
                  {bundleAdded ? (
                    <>
                      <Check className="w-4 h-4" /> Full Ensemble Added!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add Complete Look to Bag
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
