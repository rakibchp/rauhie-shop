import { Accessibility, ArrowDownUp, Eye, History as HistoryIcon, LogOut, Search, Star, UserRound, X, ShieldCheck, Sparkles, Menu, Check, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import brandLogo from './assets/logo.png';
import CheckoutModal from './components/CheckoutModal.jsx';
import SuperAdminDashboard from './components/SuperAdminDashboard.jsx';
import OrderHistoryView from './components/OrderHistoryView.jsx';
import Toast from './components/Toast.jsx';
import AIGiftAdvisorModal from './components/AIGiftAdvisorModal.jsx';
import AIStyleMatchModal from './components/AIStyleMatchModal.jsx';
import AISmartSearchModal from './components/AISmartSearchModal.jsx';
import { api, INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './services/api.js';

function formatPrice(price) {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', currencyDisplay: 'narrowSymbol' }).format(price);
}

function StockIndicator({ stock, className = '' }) {
  if (stock === undefined || stock === null) return null;
  if (stock <= 0) {
    return <span className={`stock-indicator stock-unavailable ${className}`}>Out of stock</span>;
  }
  if (stock <= 5) {
    return <span className={`stock-indicator bg-rose-50 text-rose-700 border border-rose-200 font-bold ${className}`}>Only {stock} left!</span>;
  }
  return <span className={`stock-indicator ${className}`}>In Stock ({stock})</span>;
}

function TopRatedBadge({ rating }) {
  if (!rating || rating < 4.8) return null;
  return (
    <span className="top-rated-badge">
      <Star size={11} fill="currentColor" aria-hidden="true" /> Top rated
    </span>
  );
}

function ProductImage({ src, alt, className = '' }) {
  return (
    <div className={`product-image ${className}`}>
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.add('is-visible');
          }}
        />
      )}
      <span className={`image-fallback ${src ? '' : 'is-visible'}`} aria-hidden="true">
        Rauhie Collection
      </span>
    </div>
  );
}

function AccessibilityControls() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shop-accessibility') || '{"largeText":false,"highContrast":false,"reduceMotion":false}');
    } catch {
      return { largeText: false, highContrast: false, reduceMotion: false };
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('a11y-large-text', settings.largeText);
    root.classList.toggle('a11y-high-contrast', settings.highContrast);
    root.classList.toggle('a11y-reduced-motion', settings.reduceMotion);
    localStorage.setItem('shop-accessibility', JSON.stringify(settings));
  }, [settings]);

  return (
    <div className="accessibility-control">
      <button
        className="icon-button accessibility-trigger"
        type="button"
        aria-label="Accessibility settings"
        onClick={() => setOpen((c) => !c)}
      >
        <Accessibility size={18} aria-hidden="true" />
      </button>
      {open && (
        <section className="accessibility-panel" aria-label="Accessibility settings">
          <div className="flex items-center justify-between pb-1 border-b">
            <h2>Accessibility</h2>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">
              <X size={16} />
            </button>
          </div>
          <label>
            <input
              type="checkbox"
              checked={settings.largeText}
              onChange={(e) => setSettings((c) => ({ ...c, largeText: e.target.checked }))}
            />
            Larger text
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(e) => setSettings((c) => ({ ...c, highContrast: e.target.checked }))}
            />
            Higher contrast
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.reduceMotion}
              onChange={(e) => setSettings((c) => ({ ...c, reduceMotion: e.target.checked }))}
            />
            Reduce motion
          </label>
          <button
            className="text-button accessibility-reset"
            type="button"
            onClick={() => setSettings({ largeText: false, highContrast: false, reduceMotion: false })}
          >
            Reset settings
          </button>
        </section>
      )}
    </div>
  );
}

function Header({ itemCount, session, onOpenAdmin, onOpenGiftAdvisor, onOpenSmartSearch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <header className="site-header sticky top-0 z-40 bg-[#fffbfd]/95 backdrop-blur-md border-b border-[#eadde8]/80 shadow-xs">
      <div className="header-inner max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-[#35104f] hover:text-[#e6388c] transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link className="flex items-center gap-2.5 group" to="/" aria-label="Rauhie Shop home">
            <img className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-contain ring-2 ring-[#e6388c]/20 group-hover:ring-[#e6388c] transition" src={brandLogo} alt="Rauhie Shop Logo" />
            <div className="flex flex-col">
              <span className="brand-title-gradient text-base sm:text-xl tracking-tight leading-none group-hover:opacity-90 transition-opacity">
                Rauhie Shop
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-[#e6388c] mt-0.5">
                Luxury &amp; Gifts
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-8" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => `text-xs font-semibold uppercase tracking-wider transition ${isActive ? 'text-[#e6388c] border-b-2 border-[#e6388c] pb-1' : 'text-[#35104f]/80 hover:text-[#e6388c]'}`}>
            Collection
          </NavLink>
          <a href="/#new-arrivals" className="text-xs font-semibold uppercase tracking-wider text-[#35104f]/80 hover:text-[#e6388c] transition">
            New Arrivals
          </a>
          <NavLink to="/history" className={({ isActive }) => `text-xs font-semibold uppercase tracking-wider transition ${isActive ? 'text-[#e6388c] border-b-2 border-[#e6388c] pb-1' : 'text-[#35104f]/80 hover:text-[#e6388c]'}`}>
            Track Orders
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `text-xs font-semibold uppercase tracking-wider transition ${isActive ? 'text-[#e6388c] border-b-2 border-[#e6388c] pb-1' : 'text-[#35104f]/80 hover:text-[#e6388c]'}`}>
            Our Heritage
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `text-xs font-semibold uppercase tracking-wider transition ${isActive ? 'text-[#e6388c] border-b-2 border-[#e6388c] pb-1' : 'text-[#35104f]/80 hover:text-[#e6388c]'}`}>
            Concierge
          </NavLink>
          {isAdmin ? (
            <NavLink to="/admin" className="text-xs font-bold uppercase tracking-wider text-[#e6388c] bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
              ★ SuperAdmin
            </NavLink>
          ) : (
            <button
              onClick={onOpenAdmin}
              type="button"
              className="text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-[#e6388c] transition cursor-pointer"
            >
              Admin Portal
            </button>
          )}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* AI Smart Search trigger button */}
          <button
            type="button"
            onClick={onOpenSmartSearch}
            className="p-2 text-[#35104f] hover:text-[#e6388c] hover:bg-[#faf5f9] rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="AI Smart Search"
            aria-label="Open AI smart search"
          >
            <Search size={18} />
            <span className="hidden xl:inline text-xs font-medium text-slate-600">Smart Search</span>
          </button>

          {/* AI Gift Concierge Trigger Button */}
          <button
            type="button"
            onClick={onOpenGiftAdvisor}
            className="hidden sm:flex relative px-3 py-1.5 bg-gradient-to-r from-[#35104f] to-[#e6388c] text-white text-xs font-semibold rounded-xl shadow-xs hover:opacity-95 transition cursor-pointer items-center gap-1.5"
            aria-label="Open AI Gift Concierge"
          >
            <Sparkles size={14} className="text-pink-200 animate-pulse" />
            <span className="hidden md:inline">AI Gift Concierge</span>
            <span className="md:hidden">AI Gifts</span>
          </button>

          <AccessibilityControls />

          {/* User Account */}
          <NavLink
            className="p-2 text-[#35104f] hover:text-[#e6388c] hover:bg-[#faf5f9] rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
            to={session ? '/account' : '/login'}
            aria-label={session ? 'My Account' : 'Sign In'}
          >
            <UserRound size={17} aria-hidden="true" />
            <span className="hidden lg:inline text-xs">{session ? (session.user?.name?.split(' ')[0] || 'Account') : 'Sign In'}</span>
          </NavLink>

          {/* Shopping Bag with Badge */}
          <Link
            className="relative p-2 text-[#35104f] hover:text-[#e6388c] hover:bg-[#faf5f9] rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
            to="/cart"
            aria-label={`Shopping bag, ${itemCount} items`}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            <span className="hidden sm:inline text-xs font-bold">Bag</span>
            <span className="w-5 h-5 rounded-full bg-[#e6388c] text-white text-[10px] font-bold flex items-center justify-center">
              {itemCount}
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#eadde8] px-5 py-4 space-y-3 animate-fade-in shadow-xl">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            <button
              onClick={() => {
                onOpenGiftAdvisor();
                setMobileMenuOpen(false);
              }}
              type="button"
              className="py-2.5 px-3 bg-gradient-to-r from-[#35104f] to-[#e6388c] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} className="text-pink-200" /> AI Gift Concierge
            </button>
            <button
              onClick={() => {
                onOpenSmartSearch();
                setMobileMenuOpen(false);
              }}
              type="button"
              className="py-2.5 px-3 bg-[#faf5f9] text-[#35104f] border border-[#eadde8] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search size={13} className="text-[#e6388c]" /> Smart Search
            </button>
          </div>

          <div className="flex flex-col space-y-2 text-sm font-semibold text-[#35104f]">
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#e6388c] border-b border-slate-50">
              Shop All Collections
            </NavLink>
            <NavLink to="/history" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#e6388c] border-b border-slate-50">
              Track Customer Orders
            </NavLink>
            <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#e6388c] border-b border-slate-50">
              About Rauhie Heritage
            </NavLink>
            <NavLink to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#e6388c] border-b border-slate-50">
              Customer Support &amp; Showroom
            </NavLink>
            {isAdmin ? (
              <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#e6388c] font-bold">
                ★ SuperAdmin Command Center
              </NavLink>
            ) : (
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-left text-xs text-slate-500 hover:text-[#e6388c] cursor-pointer"
              >
                SuperAdmin Portal
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);

  function handleNewsletterSubmit(e) {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSent(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSent(false);
    }, 4000);
  }

  return (
    <footer className="site-footer bg-gradient-to-b from-[#fffbfd] via-[#fbf3fa] to-[#f6ecf4] text-[#35104f] border-t border-[#eadde8] pt-14 pb-12" id="our-note">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Top Section: Brand + Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-[#eadde8]">
          <div className="lg:col-span-5 space-y-3.5">
            <Link className="inline-flex items-center gap-3 group" to="/">
              <img className="w-12 h-12 rounded-full object-contain ring-2 ring-[#e6388c]/30 group-hover:ring-[#e6388c] transition" src={brandLogo} alt="Rauhie Shop" />
              <div>
                <span className="brand-title-gradient text-2xl tracking-tight leading-none">Rauhie Shop</span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-[#e6388c] mt-0.5">Bangladeshi Luxury &amp; Gifts</span>
              </div>
            </Link>
            <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
              Curating authentic handcrafted baroque pearl jewelry, Grade 6A mulberry silk hijabs, vegan leather handbags, artisan perfumes, and bespoke gift hampers.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#e6388c] shrink-0" />
              <span>100% Guaranteed Authenticity · Fast Insured Shipping</span>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-7 bg-white/90 border border-[#eadde8] rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#e6388c]">The Rauhie Circle</span>
              <h3 className="brand-title-gradient text-lg mt-0.5">
                Join our Private VIP Newsletter
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Receive private showcase invitations, early access to festive drops, and an instant ৳150 welcome voucher code.
              </p>
            </div>
            {newsletterSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <Check size={16} className="text-emerald-600" /> Welcome to the Rauhie Circle! Check your inbox for voucher "RAUHIE10".
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#faf5f9] border border-[#eadde8] text-xs text-[#35104f] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#e6388c]"
                />
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-gradient-to-r from-[#35104f] to-[#e6388c] hover:opacity-95 text-white text-xs font-semibold rounded-xl transition shadow-xs shrink-0 cursor-pointer"
                >
                  Join Circle ↗
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Middle Section: 4 Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[#35104f] text-[11px]">Boutique Collections</h4>
            <ul className="space-y-2 text-slate-600">
              <li><Link to="/" className="hover:text-[#e6388c] transition">Jewelry &amp; Accessories</Link></li>
              <li><Link to="/" className="hover:text-[#e6388c] transition">Modest Wear &amp; Pure Silk</Link></li>
              <li><Link to="/" className="hover:text-[#e6388c] transition">Luxury Vegan Handbags</Link></li>
              <li><Link to="/" className="hover:text-[#e6388c] transition">Artisan Fragrance &amp; Beauty</Link></li>
              <li><Link to="/" className="hover:text-[#e6388c] transition">Curated Keepsake Hampers</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[#35104f] text-[11px]">Customer Concierge</h4>
            <ul className="space-y-2 text-slate-600">
              <li><Link to="/history" className="hover:text-[#e6388c] transition">Track Live Order</Link></li>
              <li><Link to="/contact" className="hover:text-[#e6388c] transition">Delivery &amp; Shipping Rates</Link></li>
              <li><Link to="/contact" className="hover:text-[#e6388c] transition">7-Day Exchange Policy</Link></li>
              <li><Link to="/account" className="hover:text-[#e6388c] transition">Customer Account</Link></li>
              <li><Link to="/contact" className="hover:text-[#e6388c] transition">Bespoke Gift Packaging</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[#35104f] text-[11px]">Company &amp; Ethics</h4>
            <ul className="space-y-2 text-slate-600">
              <li><Link to="/about" className="hover:text-[#e6388c] transition">About Rauhie</Link></li>
              <li><Link to="/about" className="hover:text-[#e6388c] transition">Artisanal Sourcing</Link></li>
              <li><Link to="/contact" className="hover:text-[#e6388c] transition">Corporate Gifting</Link></li>
              <li><Link to="/admin" className="hover:text-[#e6388c] transition">SuperAdmin Command</Link></li>
              <li><a href="/api/docs" target="_blank" rel="noreferrer" className="text-[#e6388c] font-semibold hover:underline inline-flex items-center gap-1">Swagger API Docs ↗</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[#35104f] text-[11px]">Boutique Showroom HQ</h4>
            <address className="not-italic text-slate-600 space-y-1.5 leading-relaxed">
              <p>21 Sukrabad, Dhanmondi 32,</p>
              <p>Dhaka-1205, Bangladesh</p>
              <p className="pt-1 text-[#e6388c] font-semibold">
                Hotline: +88 01710659435
              </p>
              <p className="text-[11px] text-slate-500">
                Email: support@rauhieshop.com
              </p>
            </address>
          </div>
        </div>

        {/* Bottom Section: Payment Badges & Copyright */}
        <div className="pt-6 border-t border-[#eadde8] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Rauhie Shop Bangladesh. All rights reserved. Registered Trade Entity.
          </div>

          {/* Payment gateway tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Accepted Payments:</span>
            <span className="px-2.5 py-1 bg-white border border-[#eadde8] rounded-md text-[11px] font-semibold text-slate-700 shadow-2xs">bKash</span>
            <span className="px-2.5 py-1 bg-white border border-[#eadde8] rounded-md text-[11px] font-semibold text-slate-700 shadow-2xs">Nagad</span>
            <span className="px-2.5 py-1 bg-white border border-[#eadde8] rounded-md text-[11px] font-semibold text-slate-700 shadow-2xs">Visa</span>
            <span className="px-2.5 py-1 bg-white border border-[#eadde8] rounded-md text-[11px] font-semibold text-slate-700 shadow-2xs">Mastercard</span>
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-[11px] font-semibold text-emerald-800">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function RatingSummary({ rating = 4.9, reviewCount = 12 }) {
  return (
    <span className="product-rating" aria-label={`${rating} out of 5 stars`}>
      <Star size={13} fill="currentColor" aria-hidden="true" className="text-amber-400" />
      <span>{Number(rating).toFixed(1)}</span>
      <span>({reviewCount})</span>
    </span>
  );
}

function ProductCard({ product, onAdd, onQuickView }) {
  const categoryName = product.category?.name || 'Everyday';
  const isOutOfStock = product.stock <= 0;

  return (
    <article className="product-card group">
      <TopRatedBadge rating={product.rating} />
      <button
        className="quick-view-button"
        type="button"
        aria-label={`Quick view ${product.name}`}
        title={`Quick view ${product.name}`}
        onClick={() => onQuickView(product)}
      >
        <Eye size={17} aria-hidden="true" />
      </button>
      <StockIndicator stock={product.stock} />
      <Link className="product-card-link" to={`/products/${product.id}`}>
        <ProductImage src={product.images?.[0]} alt={product.name} />
        <div className="product-meta">
          <span>{categoryName}</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-[#e6388c]">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-[11px] text-slate-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
        <h3 className="group-hover:text-[#e6388c] transition-colors">{product.name}</h3>
      </Link>
      <RatingSummary rating={product.rating} reviewCount={product.reviewCount} />
      <button
        className={`quick-add ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
        type="button"
        disabled={isOutOfStock}
        onClick={() => onAdd(product)}
      >
        {isOutOfStock ? 'Sold out' : 'Add to bag'} <span aria-hidden="true">+</span>
      </button>
    </article>
  );
}

function HomePage({ onAdd, onQuickView, onOpenGiftAdvisor, onOpenSmartSearch }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    Promise.all([
      api.getProducts({ category: activeCategory, search: searchTerm, sortBy }),
      api.getCategories(),
    ])
      .then(([prods, cats]) => {
        if (!active) return;
        setProducts(prods);
        setCategories(cats);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('ready');
      });
    return () => {
      active = false;
    };
  }, [activeCategory, searchTerm, sortBy]);

  const heroProduct = products[0];

  return (
    <main>
      {/* Hero Showcase */}
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-dot" /> Authentic Lifestyle &amp; Fashion
          </p>
          <h1>
            <span className="brand-title-gradient">Discover your</span><br className="hidden sm:inline" />{' '}
            <em className="brand-title-gradient">next favorite.</em>
          </h1>
          <p className="hero-description">
            Handcrafted jewelry, modest silk fashion, luxury handbags, niche perfumes, and smart lifestyle essentials curated with care.
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <a className="primary-button" href="#new-arrivals">
              Explore Collection <span aria-hidden="true">↘</span>
            </a>
            <button
              type="button"
              onClick={onOpenGiftAdvisor}
              className="py-3 px-4 bg-gradient-to-r from-[#35104f] to-[#e6388c] text-white text-xs font-semibold hover:opacity-95 transition flex items-center gap-2 cursor-pointer shadow-md rounded-xl"
            >
              <Sparkles size={14} className="text-pink-200 animate-pulse" />
              <span>AI Gift Concierge</span>
            </button>
          </div>
          <div className="mt-3 text-xs font-semibold text-[#e6388c]">
            Use code <strong className="font-mono bg-pink-50 px-2 py-0.5 rounded border border-pink-200">RAUHIE10</strong> for 10% off launch orders
          </div>
          <div className="hero-note">
            <span>RAUHIE SHOP</span>
            <span>Premium Selection · Fast Delivery</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-sunburst" aria-hidden="true">✳</div>
          {heroProduct ? (
            <Link to={`/products/${heroProduct.id}`} className="hero-product group">
              <ProductImage src={heroProduct.images?.[0]} alt={heroProduct.name} />
              <span className="hero-product-label">
                Featured Pick<br />
                <b>{heroProduct.name} ↗</b>
              </span>
            </Link>
          ) : (
            <div className="hero-placeholder">Rauhie Edit <span>↗</span></div>
          )}
          <span className="hero-side-note">EXPLORE PREMIUM EDITIONS</span>
        </div>
      </section>

      {/* Trust benefit strip */}
      <section className="benefit-strip" aria-label="Shopping benefits">
        <span>✓ 100% Authentic Quality</span>
        <span>✓ Cash on Delivery &amp; bKash</span>
        <span>✓ 24-48h Delivery in Dhaka</span>
        <span>✓ Hassle-Free Exchange</span>
      </section>

      {/* Catalog Section */}
      <section className="catalog section-wrap" id="new-arrivals">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The Catalog</p>
            <h2 className="brand-title-gradient">Explore by Category.</h2>
          </div>
          <p>Carefully inspected products with authentic quality and competitive pricing.</p>
        </div>

        {/* Search & Sort Toolbar */}
        <div className="catalog-toolbar">
          <label className="catalog-search flex-1">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jewelry, silk hijabs, perfume, bags..."
              aria-label="Search products"
            />
          </label>
          <button
            type="button"
            onClick={onOpenSmartSearch}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-[#35104f] to-[#e6388c] text-white text-xs font-semibold rounded-lg hover:opacity-95 transition cursor-pointer shrink-0"
          >
            <Sparkles size={14} className="text-pink-200" />
            <span className="hidden sm:inline">Ask AI Search</span>
            <span className="sm:hidden">AI Search</span>
          </button>
          <label className="catalog-sort">
            <ArrowDownUp size={16} aria-hidden="true" />
            <select
              aria-label="Sort products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured Picks</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </label>
        </div>

        {/* Category Filter Pills */}
        <div className="category-list" aria-label="Filter by category">
          <button
            className={activeCategory === 'All' ? 'category-chip active' : 'category-chip'}
            onClick={() => setActiveCategory('All')}
            type="button"
          >
            All Items
          </button>
          {categories.map((category) => (
            <button
              className={activeCategory === category.name ? 'category-chip active' : 'category-chip'}
              key={category.id}
              onClick={() => setActiveCategory(category.name)}
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>

        {status === 'loading' ? (
          <div className="catalog-message">Loading authentic collection<span className="loading-dots">...</span></div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={onAdd}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        ) : (
          <div className="catalog-message">No items match your search. Try adjusting keywords.</div>
        )}
      </section>
    </main>
  );
}

function ProductPage({ onAdd, onNotify, onOpenStyleMatch }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState('5');
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');

  useEffect(() => {
    let active = true;
    api.getProductById(id)
      .then((data) => {
        if (!active) return;
        setProduct(data);
        setReviews(api.getReviews(data.id));
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => { active = false; };
  }, [id]);

  async function handleAddReview(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const savedReview = await api.submitReview({
        productId: product.id,
        rating: Number(newRating),
        comment: newComment.trim(),
        author: reviewerName.trim() || 'Verified Shopper',
      });
      setReviews((cur) => [savedReview, ...cur]);
      setNewComment('');
      setReviewerName('');
      onNotify('Thank you! Your review has been published.');
    } catch {
      onNotify('Could not submit review. Please try again.');
    }
  }

  if (status === 'loading') {
    return <main className="route-message">Loading product details...</main>;
  }

  if (status === 'error' || !product) {
    return (
      <main className="route-message">
        Product not found or unavailable. <Link to="/">Return to catalog</Link>
      </main>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <main className="product-page">
      <section className="detail-layout section-wrap">
        {/* Images */}
        <div className="detail-gallery space-y-3">
          <div className="detail-image border border-[#eadde8] rounded-2xl overflow-hidden bg-white shadow-xs">
            <ProductImage
              src={product.images?.[selectedImage] || product.images?.[0]}
              alt={product.name}
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                    selectedImage === idx ? 'border-[#e6388c]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Copy & Actions */}
        <div className="detail-copy">
          <Link className="back-link" to="/">← Back to the edit</Link>
          <p className="eyebrow">{product.category?.name || 'Everyday object'}</p>
          <h1 className="brand-title-gradient">{product.name}</h1>
          <div className="flex items-center gap-3 pt-1">
            <RatingSummary rating={product.rating} reviewCount={product.reviewCount || reviews.length} />
            <StockIndicator stock={product.stock} />
          </div>

          <div className="flex items-baseline gap-3 pt-2">
            <p className="detail-price text-2xl font-bold text-[#e6388c]">
              {formatPrice(product.price)}
            </p>
            {product.compareAtPrice && (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="detail-description">{product.description}</p>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#35104f]">
              Quantity:
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="px-2.5 py-1.5 border rounded-lg bg-white"
              >
                {[1, 2, 3, 4, 5].map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </label>
            <button
              className={`primary-button detail-add ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onAdd(product, quantity)}
            >
              {isOutOfStock ? 'Out of stock' : `Add ${quantity} to Bag`} <span aria-hidden="true">↗</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onOpenStyleMatch && onOpenStyleMatch(product)}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#35104f] via-[#4a166e] to-[#e6388c] text-white text-xs font-semibold rounded-xl hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles size={14} className="text-pink-200 animate-pulse" />
              <span>Style with AI — Coordinate Complete Look &amp; Save 10%</span>
            </button>
          </div>

          <div className="pt-4 border-t border-[#eadde8] text-xs text-slate-500 space-y-1">
            <p>✓ SKU: <span className="font-mono">{product.sku || 'RH-PROD'}</span></p>
            <p>✓ Available for Cash on Delivery, bKash, and Card payments.</p>
            <p>✓ Express delivery inside Dhaka: 24 to 48 hours.</p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section section-wrap">
        <div className="reviews-heading">
          <div>
            <p className="eyebrow">Customer Feedback</p>
            <h2 className="brand-title-gradient">Ratings &amp; Reviews</h2>
          </div>
          <RatingSummary rating={product.rating} reviewCount={reviews.length} />
        </div>

        {/* Add Review Form */}
        <form className="review-form" onSubmit={handleAddReview}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label>
              Your Name
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="e.g. Farhana S."
              />
            </label>
            <label>
              Rating
              <select value={newRating} onChange={(e) => setNewRating(e.target.value)}>
                <option value="5">★★★★★ (5 Stars - Excellent)</option>
                <option value="4">★★★★☆ (4 Stars - Very Good)</option>
                <option value="3">★★★☆☆ (3 Stars - Average)</option>
                <option value="2">★★☆☆☆ (2 Stars - Below Average)</option>
                <option value="1">★☆☆☆☆ (1 Star - Poor)</option>
              </select>
            </label>
          </div>
          <label className="review-comment">
            Your Review
            <textarea
              required
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What did you love most about this product?"
            />
          </label>
          <button className="primary-button" type="submit">
            Submit Review <span aria-hidden="true">↗</span>
          </button>
        </form>

        {/* Existing reviews */}
        <div className="review-list">
          {reviews.length === 0 ? (
            <p className="empty-reviews">No reviews posted yet. Be the first to share your thoughts!</p>
          ) : (
            reviews.map((rev) => (
              <article className="review-entry" key={rev.id}>
                <div className="review-entry-heading">
                  <strong>{rev.author}</strong>
                  <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  {'★'.repeat(rev.rating)}
                  {'☆'.repeat(5 - rev.rating)}
                </div>
                <p>{rev.comment}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function CartPage({ cart, onQuantity, onRemove, onOpenCheckout }) {
  const navigate = useNavigate();
  const items = Object.values(cart);
  const subtotal = items.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);

  return (
    <main className="cart-page section-wrap">
      <div className="section-heading cart-heading">
        <div>
          <p className="eyebrow">Your Selection</p>
          <h1 className="brand-title-gradient">Shopping Bag<span className="text-[#e6388c]">.</span></h1>
        </div>
        <span>{items.reduce((sum, i) => sum + i.quantity, 0)} items</span>
      </div>

      {items.length === 0 ? (
        <div className="empty-cart">
          <p>Your shopping bag is currently empty.</p>
          <Link className="primary-button" to="/">
            Explore Products <span aria-hidden="true">↗</span>
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map(({ product, quantity }) => (
              <article className="cart-item" key={product.id}>
                <Link to={`/products/${product.id}`} className="cart-thumb">
                  <ProductImage src={product.images?.[0]} alt={product.name} />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/products/${product.id}`}>
                    <h2>{product.name}</h2>
                  </Link>
                  <span>{product.category?.name || 'Everyday'}</span>
                  <button
                    className="text-button remove-button"
                    type="button"
                    onClick={() => onRemove(product.id)}
                  >
                    Remove
                  </button>
                </div>
                <label className="quantity-control">
                  Qty
                  <select
                    value={quantity}
                    onChange={(e) => onQuantity(product.id, Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </label>
                <strong>{formatPrice((product.price || 0) * quantity)}</strong>
              </article>
            ))}
          </div>

          <aside className="order-summary">
            <h2>Order Summary</h2>
            <div>
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <span>Calculated at checkout (৳60 / ৳120)</span>
            </div>
            <p className="text-xs text-slate-500">
              Payment methods supported: bKash, Nagad, Visa, Mastercard, and Cash on Delivery.
            </p>
            <button
              className="primary-button checkout-button"
              type="button"
              onClick={onOpenCheckout}
            >
              Proceed to Checkout <span aria-hidden="true">↗</span>
            </button>
            <button
              className="text-button continue-button"
              type="button"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}

function AboutPage() {
  return (
    <main className="brand-page section-wrap">
      <header className="brand-page-heading">
        <p className="eyebrow">About Rauhie Shop</p>
        <h1>
          <span className="brand-title-gradient">Useful finds for</span><br className="hidden sm:inline" />{' '}
          <em className="brand-title-gradient">every kind of day.</em>
        </h1>
        <p>Rauhie Shop curates refined jewelry, modest silk fashion, artisanal fragrances, handbags, smart gadgets, and memorable gifts.</p>
      </header>
      <section className="about-values" aria-label="Values">
        <article>
          <span>01</span>
          <h2>Thoughtful Quality</h2>
          <p>Every piece is chosen with attention to materials, craftsmanship, and longevity.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Direct Delivery</h2>
          <p>Swift dispatch across Dhaka and nationwide courier fulfillment with tracking.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Customer First</h2>
          <p>Transparent pricing, authentic products, responsive helpline, and easy returns.</p>
        </article>
      </section>
      <section className="about-location">
        <div>
          <p className="eyebrow">Visit Our Showroom</p>
          <h2 className="brand-title-gradient">Rauhie Shop</h2>
        </div>
        <address>
          21 Sukrabad, Dhanmondi 32,<br />
          Dhaka-1205, Bangladesh
        </address>
        <Link className="text-link" to="/contact">Get in touch <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}

function ContactPage() {
  return (
    <main className="brand-page contact-page section-wrap">
      <header className="brand-page-heading">
        <p className="eyebrow">Contact Rauhie Shop</p>
        <h1>
          <span className="brand-title-gradient">We’re always</span><br className="hidden sm:inline" />{' '}
          <em className="brand-title-gradient">easy to reach.</em>
        </h1>
        <p>Reach out for product inquiries, wholesale requests, or delivery updates.</p>
      </header>
      <section className="contact-details" aria-label="Contact options">
        <a href="tel:+8801710659435">
          <span>Call or WhatsApp</span>
          <strong>+88 01710659435</strong>
          <span className="contact-arrow" aria-hidden="true">↗</span>
        </a>
        <a href="mailto:rakibchp@gmail.com">
          <span>Email Support</span>
          <strong>rakibchp@gmail.com</strong>
          <span className="contact-arrow" aria-hidden="true">↗</span>
        </a>
        <a href="https://maps.google.com/?q=21+Sukrabad,+Dhanmondi+32,+Dhaka-1205" target="_blank" rel="noreferrer">
          <span>Location</span>
          <strong>21 Sukrabad, Dhanmondi 32, Dhaka</strong>
          <span className="contact-arrow" aria-hidden="true">↗</span>
        </a>
      </section>
    </main>
  );
}

function AuthPage({ isRegister = false, session, onSignIn }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setPending(true);

    try {
      if (isRegister) {
        const res = await api.register({ name, email, password, phone });
        onSignIn(res);
        navigate('/account', { replace: true });
      } else {
        const res = await api.login(email, password);
        onSignIn(res);
        navigate('/account', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setPending(false);
    }
  }

  if (session) {
    return (
      <main className="account-page section-wrap">
        <p className="eyebrow">Account</p>
        <h1>You are signed in as {session.user?.name || session.user?.email}.</h1>
        <Link className="primary-button" to="/account">View Account <span aria-hidden="true">↗</span></Link>
      </main>
    );
  }

  return (
    <main className="account-page section-wrap">
      <div className="account-form-wrap">
        <p className="eyebrow">{isRegister ? 'Join Rauhie Shop' : 'Welcome back'}</p>
        <h1 className="brand-title-gradient">{isRegister ? 'Create your account.' : 'Sign in.'}</h1>
        <p className="account-intro">
          {isRegister ? 'Register to track orders and save your delivery addresses.' : 'Sign in to access your profile and order history.'}
        </p>

        {error && <p className="form-error" role="alert">{error}</p>}

        <form className="account-form" onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label>
                Full Name
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ayesha Rahman"
                />
              </label>
              <label>
                Phone Number
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+8801710659435"
                />
              </label>
            </>
          )}

          <label>
            Email Address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button className="primary-button" type="submit" disabled={pending}>
            {pending ? 'Verifying...' : isRegister ? 'Create Account' : 'Sign In'} <span aria-hidden="true">↗</span>
          </button>
        </form>

        <div className="pt-4 border-t mt-4 text-xs text-slate-500">
          <p>
            {isRegister ? 'Already registered?' : 'New shopper?'}{' '}
            <Link to={isRegister ? '/login' : '/register'} className="text-[#e6388c] font-semibold">
              {isRegister ? 'Sign In' : 'Create an Account'}
            </Link>
          </p>
          <div className="mt-3 p-3 bg-pink-50 rounded-xl border border-pink-200">
            <span className="font-bold text-[#35104f]">SuperAdmin Credentials:</span>
            <div className="font-mono text-[11px] text-slate-600 mt-0.5">
              Email: <strong>admin@rauhie.com</strong><br />
              Password: <strong>Admin@Rauhie2026</strong>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function AccountPage({ session, onSignOut }) {
  const navigate = useNavigate();
  if (!session) {
    return (
      <main className="account-page section-wrap">
        <p className="eyebrow">Rauhie Shop Account</p>
        <h1 className="brand-title-gradient">Sign in to your account.</h1>
        <Link className="primary-button" to="/login">Sign In <span aria-hidden="true">↗</span></Link>
      </main>
    );
  }

  const user = session.user || {};
  const isAdmin = user.role === 'ADMIN';

  return (
    <main className="account-page section-wrap">
      <p className="eyebrow">Your Profile</p>
      <h1 className="brand-title-gradient">Welcome back, {user.name || 'Shopper'}.</h1>
      <p className="account-intro">{user.email}</p>

      <div className="account-profile">
        <div>
          <span className="profile-label">Account Role</span>
          <strong className={`role-badge ${isAdmin ? 'admin-role' : ''}`}>
            {user.role || 'CUSTOMER'}
          </strong>
        </div>
      </div>

      <div className="account-actions">
        <Link className="account-action-link" to="/history">
          <HistoryIcon size={19} aria-hidden="true" />
          <span>Order History &amp; Tracking</span> <span aria-hidden="true">↗</span>
        </Link>
        {isAdmin && (
          <Link className="account-action-link text-[#e6388c] font-bold" to="/admin">
            <span>★ SuperAdmin Dashboard</span> <span aria-hidden="true">↗</span>
          </Link>
        )}
        <button
          className="text-button sign-out-button"
          type="button"
          onClick={() => {
            onSignOut();
            navigate('/');
          }}
        >
          <LogOut size={17} aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </main>
  );
}

function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      type="button"
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#35104f] text-white shadow-xl hover:bg-[#e6388c] transition duration-200"
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}

export default function App() {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rauhie_cart_v2') || '{}');
    } catch {
      return {};
    }
  });

  const [session, setSession] = useState(() => api.getSession());
  const [orders, setOrders] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [quickProduct, setQuickProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isGiftAdvisorOpen, setIsGiftAdvisorOpen] = useState(false);
  const [isSmartSearchOpen, setIsSmartSearchOpen] = useState(false);
  const [styleMatchProduct, setStyleMatchProduct] = useState(null);

  const itemCount = useMemo(
    () => Object.values(cart).reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  useEffect(() => {
    localStorage.setItem('rauhie_cart_v2', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    api.getOrders(session?.token).then(setOrders);
  }, [session]);

  function showToast(msg) {
    setToastMessage(msg);
  }

  function addToCart(product, qty = 1) {
    if (product.stock <= 0) {
      showToast('Sorry, this product is sold out.');
      return;
    }
    setCart((current) => {
      const existing = current[product.id]?.quantity || 0;
      const nextQuantity = Math.min(product.stock, existing + qty);
      return {
        ...current,
        [product.id]: { product, quantity: nextQuantity },
      };
    });
    showToast(`Added "${product.name}" to your bag!`);
  }

  function updateQuantity(productId, quantity) {
    setCart((current) => ({
      ...current,
      [productId]: { ...current[productId], quantity },
    }));
  }

  function removeFromCart(productId) {
    setCart((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
    showToast('Item removed from bag');
  }

  function clearCart() {
    setCart({});
  }

  async function handleOrderSuccess(orderPayload) {
    const placedOrder = await api.placeOrder(orderPayload, session?.token);
    setOrders((current) => [placedOrder, ...current]);
    clearCart();
    showToast(`Order ${placedOrder.orderNumber} placed successfully!`);
    return placedOrder;
  }

  function handleReorder(pastOrder) {
    pastOrder.items?.forEach((item) => {
      api.getProductById(item.productId).then((prod) => {
        if (prod) addToCart(prod, item.quantity);
      }).catch(() => {});
    });
    showToast('Items from previous order added to your bag!');
  }

  function handleAuthenticateAdmin() {
    api.login('admin@rauhie.com', 'Admin@Rauhie2026').then((sess) => {
      setSession(sess);
      showToast('Authenticated as SuperAdmin (admin@rauhie.com)');
    });
  }

  return (
    <>
      <div className="app-shell">
        {/* Top Announcement Bar */}
        <div className="announcement" role="region" aria-label="Announcement">
          <span>A little more joy in the everyday</span>
          <span className="hidden md:inline" aria-hidden="true">✳</span>
          <span>Special Launch: Use voucher code <strong>RAUHIE10</strong> for 10% off</span>
          <span className="hidden sm:inline" aria-hidden="true">✳</span>
          <span className="hidden sm:inline">Express delivery across Bangladesh</span>
        </div>

        <Header
          itemCount={itemCount}
          session={session}
          onOpenAdmin={handleAuthenticateAdmin}
          onOpenGiftAdvisor={() => setIsGiftAdvisorOpen(true)}
          onOpenSmartSearch={() => setIsSmartSearchOpen(true)}
        />

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onAdd={addToCart}
                onQuickView={setQuickProduct}
                onOpenGiftAdvisor={() => setIsGiftAdvisorOpen(true)}
                onOpenSmartSearch={() => setIsSmartSearchOpen(true)}
              />
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProductPage
                onAdd={addToCart}
                onNotify={showToast}
                onOpenStyleMatch={(prod) => setStyleMatchProduct(prod)}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <CartPage
                cart={cart}
                onQuantity={updateQuantity}
                onRemove={removeFromCart}
                onOpenCheckout={() => setIsCheckoutOpen(true)}
              />
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/login"
            element={<AuthPage session={session} onSignIn={setSession} />}
          />
          <Route
            path="/register"
            element={<AuthPage isRegister session={session} onSignIn={setSession} />}
          />
          <Route
            path="/account"
            element={
              <AccountPage
                session={session}
                onSignOut={() => {
                  api.logout();
                  setSession(null);
                  showToast('Signed out of account');
                }}
              />
            }
          />
          <Route
            path="/history"
            element={
              <main className="history-page section-wrap">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Your Customer Orders</p>
                    <h1 className="brand-title-gradient">Order History &amp; Tracking<span className="text-[#e6388c]">.</span></h1>
                  </div>
                  <span>{orders.length} orders</span>
                </div>
                <OrderHistoryView orders={orders} onReorder={handleReorder} />
              </main>
            }
          />
          <Route
            path="/admin"
            element={
              <SuperAdminDashboard
                session={session}
                onSignInAdmin={handleAuthenticateAdmin}
              />
            }
          />
          <Route
            path="/admin/products"
            element={
              <SuperAdminDashboard
                session={session}
                onSignInAdmin={handleAuthenticateAdmin}
              />
            }
          />
          <Route
            path="*"
            element={
              <main className="route-message">
                Page not found. <Link to="/">Return to catalog</Link>
              </main>
            }
          />
        </Routes>

        <Footer />
      </div>

      {/* Quick View Modal */}
      {quickProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#eadde8] overflow-hidden p-6">
            <button
              onClick={() => setQuickProduct(null)}
              type="button"
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-800"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-1/2 h-56 rounded-xl overflow-hidden border">
                <img
                  src={quickProduct.images?.[0]}
                  alt={quickProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full sm:w-1/2 space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#e6388c]">
                  {quickProduct.category?.name || 'Item'}
                </span>
                <h3 className="text-lg font-serif italic font-bold brand-title-gradient">{quickProduct.name}</h3>
                <div className="flex items-center gap-2">
                  <StockIndicator stock={quickProduct.stock} />
                </div>
                <div className="text-xl font-bold text-[#e6388c]">
                  {formatPrice(quickProduct.price)}
                </div>
                <p className="text-xs text-slate-600 line-clamp-3">{quickProduct.description}</p>
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      addToCart(quickProduct);
                      setQuickProduct(null);
                    }}
                    type="button"
                    className="flex-1 py-2.5 bg-[#35104f] text-white text-xs font-semibold rounded-xl hover:bg-[#e6388c] transition"
                  >
                    Add to Bag +
                  </button>
                  <Link
                    to={`/products/${quickProduct.id}`}
                    onClick={() => setQuickProduct(null)}
                    className="px-3 py-2.5 border rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Details ↗
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Gift Advisor Modal */}
      <AIGiftAdvisorModal
        isOpen={isGiftAdvisorOpen}
        onClose={() => setIsGiftAdvisorOpen(false)}
        onAddToCart={addToCart}
      />

      {/* AI Style Match Modal */}
      <AIStyleMatchModal
        isOpen={Boolean(styleMatchProduct)}
        onClose={() => setStyleMatchProduct(null)}
        product={styleMatchProduct}
        onAddToCart={addToCart}
        onAddBundle={(items) => {
          items.forEach((item) => addToCart(item));
          showToast('Complete look added to your bag!');
        }}
      />

      {/* AI Smart Search Modal */}
      <AISmartSearchModal
        isOpen={isSmartSearchOpen}
        onClose={() => setIsSmartSearchOpen(false)}
        onQuickView={setQuickProduct}
      />

      {/* Checkout Modal with Payment Gateways */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        user={session?.user}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Global Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      <BackToTop />
    </>
  );
}
