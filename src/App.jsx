import { Accessibility, ArrowDownUp, Eye, History as HistoryIcon, LogOut, Search, Star, UserRound, X, ShoppingBag, ShieldCheck, Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import brandLogo from './assets/logo.png';
import CheckoutModal from './components/CheckoutModal.jsx';
import SuperAdminDashboard from './components/SuperAdminDashboard.jsx';
import OrderHistoryView from './components/OrderHistoryView.jsx';
import Toast from './components/Toast.jsx';
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

function Header({ itemCount, session, onOpenAdmin }) {
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <header className="site-header sticky top-0 z-40 bg-[#fffbfd]/95 backdrop-blur-md shadow-xs">
      <div className="header-inner">
        <Link className="wordmark" to="/" aria-label="Rauhie Shop home">
          <img className="brand-logo" src={brandLogo} alt="Rauhie Shop Logo" />
          <span>Rauhie Shop</span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end>Shop</NavLink>
          <a href="/#new-arrivals">New arrivals</a>
          <NavLink to="/history">Orders</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          {isAdmin ? (
            <NavLink to="/admin" className="text-[#e6388c] font-bold">
              ★ SuperAdmin
            </NavLink>
          ) : (
            <button
              onClick={onOpenAdmin}
              type="button"
              className="text-[11px] font-semibold text-[#e6388c] hover:underline cursor-pointer"
            >
              Admin Portal
            </button>
          )}
        </nav>
        <div className="header-actions">
          <AccessibilityControls />
          <NavLink className="account-nav-link" to={session ? '/account' : '/login'}>
            <UserRound size={14} aria-hidden="true" />
            <span>{session ? (session.user?.name || 'Account') : 'Sign in'}</span>
          </NavLink>
          <Link className="bag-link" to="/cart" aria-label={`Shopping bag, ${itemCount} items`}>
            Bag <span className="bag-count">{itemCount}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer" id="our-note">
      <div className="footer-brand">
        <Link className="wordmark footer-wordmark" to="/">
          <img className="brand-logo" src={brandLogo} alt="" />
          Rauhie Shop
        </Link>
        <p>Premium jewelry, modest fashion, luxury handbags, beauty, gadgets, and thoughtful gifts.</p>
        <div className="flex items-center gap-2 pt-2 text-[11px] text-pink-300">
          <ShieldCheck className="w-4 h-4 text-[#e6388c]" />
          <span>100% Authentic Products · Verified Bangladeshi eCommerce</span>
        </div>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        <Link to="/">Shop Collection</Link>
        <Link to="/about">About Rauhie</Link>
        <Link to="/contact">Customer Support</Link>
        <Link to="/history">Order Tracking &amp; History</Link>
        <Link to="/admin">SuperAdmin Portal</Link>
      </nav>
      <address className="footer-address">
        <strong>Rauhie Shop HQ</strong><br />
        21 Sukrabad, Dhanmondi 32,<br />
        Dhaka-1205, Bangladesh<br />
        <span className="text-[11px] text-[#e6388c]">Helpline: +88 01710659435</span>
      </address>
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

function HomePage({ onAdd, onQuickView }) {
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
            Discover your<br />
            <em>next favorite.</em>
          </h1>
          <p className="hero-description">
            Handcrafted jewelry, modest silk fashion, luxury handbags, niche perfumes, and smart lifestyle essentials curated with care.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <a className="primary-button" href="#new-arrivals">
              Explore Collection <span aria-hidden="true">↘</span>
            </a>
            <span className="text-xs font-semibold text-[#e6388c]">
              Use code <strong className="font-mono bg-pink-50 px-2 py-1 rounded border border-pink-200">RAUHIE10</strong> for 10% off
            </span>
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
            <h2>Explore by Category.</h2>
          </div>
          <p>Carefully inspected products with authentic quality and competitive pricing.</p>
        </div>

        {/* Search & Sort Toolbar */}
        <div className="catalog-toolbar">
          <label className="catalog-search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jewelry, silk hijabs, perfume, bags..."
              aria-label="Search products"
            />
          </label>
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

function ProductPage({ onAdd, onNotify }) {
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
          <h1>{product.name}</h1>
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
            <h2>Ratings &amp; Reviews</h2>
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
          <h1>Shopping Bag<span className="title-period">.</span></h1>
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
        <h1>Useful finds for<br /><em>every kind of day.</em></h1>
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
          <h2>Rauhie Shop</h2>
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
        <h1>We’re always<br /><em>easy to reach.</em></h1>
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
        <h1>{isRegister ? 'Create your account.' : 'Sign in.'}</h1>
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
        <h1>Sign in to your account.</h1>
        <Link className="primary-button" to="/login">Sign In <span aria-hidden="true">↗</span></Link>
      </main>
    );
  }

  const user = session.user || {};
  const isAdmin = user.role === 'ADMIN';

  return (
    <main className="account-page section-wrap">
      <p className="eyebrow">Your Profile</p>
      <h1>Welcome back, {user.name || 'Shopper'}.</h1>
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
        <div className="announcement">
          A little more joy in the everyday <span aria-hidden="true">✳</span>
          Special Launch: Use voucher code <strong>RAUHIE10</strong> for 10% off <span aria-hidden="true">✳</span>
          Express delivery across Bangladesh
        </div>

        <Header
          itemCount={itemCount}
          session={session}
          onOpenAdmin={handleAuthenticateAdmin}
        />

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onAdd={addToCart}
                onQuickView={setQuickProduct}
              />
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProductPage
                onAdd={addToCart}
                onNotify={showToast}
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
                    <h1>Order History &amp; Tracking<span className="title-period">.</span></h1>
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
                <h3 className="text-lg font-serif font-bold text-[#35104f]">{quickProduct.name}</h3>
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
