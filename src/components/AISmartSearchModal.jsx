import { useState } from 'react';
import { Search, X, Sparkles, ArrowRight, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const PROMPT_SUGGESTIONS = [
  'Gift for sister under ৳3,000',
  'Baroque pearl jewelry for a wedding reception',
  'Breathable pure mulberry silk scarf',
  'Sleek vegan leather baguette shoulder bag',
  'Long-lasting blooming jasmine perfume',
  'Wireless 3-in-1 desktop charging station'
];

export default function AISmartSearchModal({ isOpen, onClose, onQuickView }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  if (!isOpen) return null;

  async function handleSearch(searchQuery) {
    const textToSearch = searchQuery !== undefined ? searchQuery : query;
    if (!textToSearch.trim()) return;

    setLoading(true);
    try {
      const data = await api.searchWithAI(textToSearch);
      setResults(data);
    } catch (e) {
      console.error('Smart search error', e);
    } finally {
      setLoading(false);
    }
  }

  function handlePromptClick(prompt) {
    setQuery(prompt);
    handleSearch(prompt);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-search-title"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-[#230a34]/60 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#eadde8] shadow-2xl overflow-hidden my-6">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 border-b border-[#eadde8] bg-[#fffbfd]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#e6388c] animate-pulse" />
              <h3 id="smart-search-title" className="text-xs font-serif italic font-bold uppercase tracking-wider brand-title-gradient">
                AI Semantic Discovery
              </h3>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1 text-slate-400 hover:text-slate-700 transition"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-[#eadde8] shadow-xs focus-within:border-[#e6388c] focus-within:ring-2 focus-within:ring-pink-100 transition"
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you want (e.g. 'thoughtful birthday gift for my sister under 3000')..."
              className="w-full text-xs text-[#35104f] placeholder:text-slate-400 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-3.5 py-1.5 bg-[#35104f] hover:bg-[#e6388c] text-white text-xs font-semibold rounded-lg transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {loading ? (
                <Wand2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>Search <ArrowRight className="w-3 h-3" /></>
              )}
            </button>
          </form>

          {/* Quick prompts */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400 mr-1">
              Popular prompts:
            </span>
            {PROMPT_SUGGESTIONS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePromptClick(prompt)}
                className="text-[11px] text-[#35104f] bg-[#faf5f9] hover:bg-[#eadde8] px-2.5 py-1 rounded-md border border-[#eadde8] transition cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <Wand2 className="w-7 h-7 mx-auto text-[#e6388c] animate-spin" />
              <p className="text-xs text-slate-600">
                Interpreting nuances and finding the best items in Rauhie catalog...
              </p>
            </div>
          ) : results ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600 border-b pb-2">
                <span>
                  <strong>Interpretation:</strong> {results.interpretation}
                </span>
                <span className="text-pink-600 font-semibold text-[11px]">
                  {results.matches?.length || 0} items found
                </span>
              </div>

              {results.helpfulTip && (
                <p className="text-[11px] text-[#35104f] bg-pink-50 p-2.5 rounded-lg border border-pink-100">
                  💡 {results.helpfulTip}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(results.matches || []).map((product) => (
                  <div
                    key={product.id}
                    className="p-3 bg-white rounded-xl border border-[#eadde8] hover:border-[#e6388c]/40 transition flex gap-3 shadow-xs"
                  >
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg bg-slate-50 border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          {product.category?.name}
                        </span>
                        <h4 className="font-serif font-bold text-xs text-[#35104f] truncate">
                          {product.name}
                        </h4>
                        <span className="text-xs font-bold text-[#e6388c]">
                          ৳{product.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onQuickView(product);
                            onClose();
                          }}
                          className="text-[10px] font-semibold text-[#35104f] hover:text-[#e6388c] underline cursor-pointer"
                        >
                          Quick View
                        </button>
                        <span className="text-slate-300">·</span>
                        <Link
                          to={`/products/${product.id}`}
                          onClick={onClose}
                          className="text-[10px] font-semibold text-[#35104f] hover:text-[#e6388c] underline"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center space-y-2 text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto text-[#e6388c]/50" />
              <p className="text-xs">
                Search in natural language. Try mentioning budgets, aesthetics, or recipients!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
