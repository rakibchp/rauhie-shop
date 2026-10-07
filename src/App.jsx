import { Accessibility, ArrowDownUp, Eye, History as HistoryIcon, LogOut, Search, Star, UserRound, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import './App.css'
import brandLogo from './assets/logo.png'
import AdminProductsPage from './components/AdminProductsPage.jsx'

const API_BASE = 'https://api.escuelajs.co/api/v1'

function readSavedCart() {
  try {
    return JSON.parse(localStorage.getItem('shop-cart') || '{}')
  } catch {
    return {}
  }
}

function readSavedReviews() {
  try {
    return JSON.parse(localStorage.getItem('shop-product-reviews') || '{}')
  } catch {
    return {}
  }
}

function readSavedSession() {
  try {
    return JSON.parse(localStorage.getItem('shop-session') || 'null')
  } catch {
    return null
  }
}

function readSavedOrders() {
  try {
    return JSON.parse(localStorage.getItem('shop-order-history') || '[]')
  } catch {
    return []
  }
}

function readSavedStock() {
  try {
    return JSON.parse(localStorage.getItem('shop-product-stock') || '{}')
  } catch {
    return {}
  }
}

function readAccessibilitySettings() {
  try {
    return JSON.parse(localStorage.getItem('shop-accessibility') || '{"largeText":false,"highContrast":false,"reduceMotion":false}')
  } catch {
    return { largeText: false, highContrast: false, reduceMotion: false }
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', currencyDisplay: 'narrowSymbol' }).format(price)
}

function getReviewAverage(reviews) {
  return reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : null
}

function StockIndicator({ product, stock, className = '' }) {
  const quantity = stock?.[product.id] ?? product.stock
  return (
    <span className={`stock-indicator ${quantity == null ? 'stock-unavailable' : ''} ${className}`}>
      Stock {quantity == null ? 'not supplied' : quantity}
    </span>
  )
}

function TopRatedBadge({ reviews }) {
  const average = getReviewAverage(reviews)
  if (reviews.length < 2 || average < 4.5) return null
  return <span className="top-rated-badge"><Star size={12} fill="currentColor" aria-hidden="true" />Top rated</span>
}

function ProductImage({ src, alt, className = '' }) {
  return (
    <div className={`product-image ${className}`}>
      {src && <img src={src} alt={alt} loading="lazy" onError={(event) => {
        event.currentTarget.style.display = 'none'
        event.currentTarget.nextElementSibling?.classList.add('is-visible')
      }} />}
      <span className={`image-fallback ${src ? '' : 'is-visible'}`} aria-hidden="true">Object / daily</span>
    </div>
  )
}

function AccessibilityControls() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState(readAccessibilitySettings)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('a11y-large-text', settings.largeText)
    root.classList.toggle('a11y-high-contrast', settings.highContrast)
    root.classList.toggle('a11y-reduced-motion', settings.reduceMotion)
    localStorage.setItem('shop-accessibility', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <div className="accessibility-control">
      <button className="icon-button accessibility-trigger" type="button" aria-label="Accessibility settings" aria-expanded={open} aria-controls="accessibility-panel" title="Accessibility settings" onClick={() => setOpen((current) => !current)}>
        <Accessibility size={19} aria-hidden="true" />
      </button>
      {open && <section className="accessibility-panel" id="accessibility-panel" aria-label="Accessibility settings">
        <h2>Accessibility</h2>
        <label><input type="checkbox" checked={settings.largeText} onChange={(event) => setSettings((current) => ({ ...current, largeText: event.target.checked }))} />Larger text</label>
        <label><input type="checkbox" checked={settings.highContrast} onChange={(event) => setSettings((current) => ({ ...current, highContrast: event.target.checked }))} />Higher contrast</label>
        <label><input type="checkbox" checked={settings.reduceMotion} onChange={(event) => setSettings((current) => ({ ...current, reduceMotion: event.target.checked }))} />Reduce motion</label>
        <button className="text-button accessibility-reset" type="button" onClick={() => setSettings({ largeText: false, highContrast: false, reduceMotion: false })}>Reset settings</button>
      </section>}
    </div>
  )
}

function Header({ itemCount, user }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="wordmark" to="/" aria-label="Rauhie Shop home"><img className="brand-logo" src={brandLogo} alt="" />Rauhie Shop</Link>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end>Shop</NavLink>
          <a href="/#new-arrivals">New arrivals</a>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink className="account-nav-link" to={user ? '/account' : '/login'}><UserRound size={14} aria-hidden="true" />{user ? 'Account' : 'Sign in'}</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin/products">Manage products</NavLink>}
        </nav>
        <div className="header-actions">
          <AccessibilityControls />
          <Link className="bag-link" to="/cart" aria-label={`Shopping bag, ${itemCount} items`}>
            Bag <span className="bag-count">{itemCount}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer" id="our-note">
      <div className="footer-brand">
        <Link className="wordmark footer-wordmark" to="/"><img className="brand-logo" src={brandLogo} alt="" />Rauhie Shop</Link>
        <p>Gadgets, Toys, Beauty, gifts, everyday essentials, and more.</p>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        <Link to="/">Shop</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/history">Order history</Link>
      </nav>
      <address className="footer-address">21 Sukrabad, Dhanmondi 32,<br />Dhaka-1205</address>
    </footer>
  )
}

function RatingSummary({ reviews = [] }) {
  const average = getReviewAverage(reviews)

  return (
    <span className="product-rating" aria-label={average ? `${average.toFixed(1)} out of 5 from ${reviews.length} reviews` : 'No reviews yet'}>
      <Star size={13} fill={average ? 'currentColor' : 'none'} aria-hidden="true" />
      <span>{average ? average.toFixed(1) : 'New'}</span>
      <span>({reviews.length})</span>
    </span>
  )
}

function ProductCard({ product, onAdd, onQuickView, reviews, stock }) {
  const category = product.category?.name || 'Everyday'
  return (
    <article className="product-card">
      <TopRatedBadge reviews={reviews} />
      <button className="quick-view-button" type="button" aria-label={`Quick view ${product.title}`} title={`Quick view ${product.title}`} onClick={() => onQuickView(product)}>
        <Eye size={17} aria-hidden="true" />
      </button>
      <StockIndicator product={product} stock={stock} />
      <Link className="product-card-link" to={`/products/${product.id}`}>
        <ProductImage src={product.images?.[0]} alt={product.title} />
        <div className="product-meta"><span>{category}</span><span>{formatPrice(product.price)}</span></div>
        <h3>{product.title}</h3>
      </Link>
      <RatingSummary reviews={reviews} />
      <button className="quick-add" type="button" onClick={() => onAdd(product)}>Add to bag <span aria-hidden="true">+</span></button>
    </article>
  )
}

function HomePage({ onAdd, reviews, stock }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [priceOrder, setPriceOrder] = useState('featured')
  const [quickProduct, setQuickProduct] = useState(null)
  const [status, setStatus] = useState('loading')
  const quickViewRef = useRef(null)

  useEffect(() => {
    if (quickProduct && quickViewRef.current && !quickViewRef.current.open) {
      quickViewRef.current.showModal()
    }
  }, [quickProduct])

  useEffect(() => {
    let active = true
    Promise.all([
      fetch(`${API_BASE}/products?offset=0&limit=50`).then((response) => {
        if (!response.ok) throw new Error('Products could not be loaded')
        return response.json()
      }),
      fetch(`${API_BASE}/categories`).then((response) => response.ok ? response.json() : []),
    ]).then(([productData, categoryData]) => {
      if (!active) return
      setProducts(Array.isArray(productData) ? productData : [])
      const productCategoryIds = new Set(productData.map((product) => product.category?.id))
      setCategories(Array.isArray(categoryData) ? categoryData.filter((category) => productCategoryIds.has(category.id)) : [])
      setStatus('ready')
    }).catch(() => {
      if (active) setStatus('error')
    })
    return () => { active = false }
  }, [])

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category?.name === activeCategory
    const searchableText = `${product.title} ${product.description} ${product.category?.name || ''}`.toLowerCase()
    return matchesCategory && (!normalizedSearch || searchableText.includes(normalizedSearch))
  })
  const visibleProducts = [...filteredProducts].sort((first, second) => {
    if (priceOrder === 'low-to-high') return first.price - second.price
    if (priceOrder === 'high-to-low') return second.price - first.price
    return 0
  })
  const heroProduct = products[0]

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Gadgets · Toys · Beauty · Gifts · More</p>
          <h1>Find your<br /><em>next favorite.</em></h1>
          <p className="hero-description">Gadgets, Toys, Beauty, gifts, everyday essentials, and more.</p>
          <a className="primary-button" href="#new-arrivals">Explore products <span aria-hidden="true">↘</span></a>
          <div className="hero-note"><span>RAUHIE SHOP</span><span>More choice, every day</span></div>
        </div>
        <div className="hero-visual">
          <div className="hero-sunburst" aria-hidden="true">✳</div>
          {heroProduct ? (
            <Link to={`/products/${heroProduct.id}`} className="hero-product">
              <ProductImage src={heroProduct.images?.[0]} alt={heroProduct.title} />
              <span className="hero-product-label">A good find<br />for your day <b>↗</b></span>
            </Link>
          ) : <div className="hero-placeholder">A good find<br />for your day <span>↗</span></div>}
          <span className="hero-side-note">EXPLORE WHAT YOU LOVE</span>
        </div>
      </section>

      <section className="benefit-strip" aria-label="Shopping benefits">
        <span>Quality products</span><span>Perfect for gifts</span><span>Trendy and affordable</span><span>Trusted service</span>
      </section>

      <section className="catalog section-wrap" id="new-arrivals">
        <div className="section-heading">
          <div><p className="eyebrow">Shop across categories</p><h2>Find what you need.</h2></div>
          <p>Browse gadgets, toys, clothing, beauty products, home finds, gifts, and more.</p>
        </div>
        <div className="catalog-toolbar">
          <label className="catalog-search">
            <Search size={17} aria-hidden="true" />
            <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search gadgets, clothing, beauty..." aria-label="Search products" />
          </label>
          <label className="catalog-sort">
            <ArrowDownUp size={16} aria-hidden="true" />
            <select aria-label="Sort products by price" value={priceOrder} onChange={(event) => setPriceOrder(event.target.value)}>
              <option value="featured">Featured</option>
              <option value="low-to-high">Price: low to high</option>
              <option value="high-to-low">Price: high to low</option>
            </select>
          </label>
        </div>
        <div className="category-list" aria-label="Filter by category">
          <button className={activeCategory === 'All' ? 'category-chip active' : 'category-chip'} onClick={() => setActiveCategory('All')} type="button">Everything</button>
          {categories.map((category) => (
            <button className={activeCategory === category.name ? 'category-chip active' : 'category-chip'} key={category.id} onClick={() => setActiveCategory(category.name)} type="button">{category.name}</button>
          ))}
        </div>
        {status === 'loading' && <div className="catalog-message">Finding your next favorite<span className="loading-dots">...</span></div>}
        {status === 'error' && <div className="catalog-message error-message">We couldn’t reach the shop just now. Check your connection and refresh to try again.</div>}
        {status === 'ready' && visibleProducts.length > 0 && <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} onQuickView={setQuickProduct} reviews={reviews[product.id] || []} stock={stock} />)}</div>}
        {status === 'ready' && visibleProducts.length === 0 && <div className="catalog-message">No products match your search.</div>}
      </section>
      {quickProduct && (
        <dialog className="quick-view-modal" ref={quickViewRef} onCancel={(event) => {
          event.preventDefault()
          quickViewRef.current?.close()
        }} onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            quickViewRef.current?.close()
          }
        }} onClose={() => setQuickProduct(null)} onClick={(event) => {
          if (event.target === quickViewRef.current) quickViewRef.current.close()
        }}>
          <div className="quick-view-content">
            <button className="icon-button modal-close" type="button" aria-label="Close product details" onClick={() => quickViewRef.current?.close()}><X size={19} /></button>
            <div className="quick-view-image"><ProductImage src={quickProduct.images?.[0]} alt={quickProduct.title} /></div>
            <div className="quick-view-copy">
              <p className="eyebrow">{quickProduct.category?.name || 'Everyday find'}</p>
              <h2>{quickProduct.title}</h2>
              <TopRatedBadge reviews={reviews[quickProduct.id] || []} />
              <RatingSummary reviews={reviews[quickProduct.id] || []} />
              <StockIndicator product={quickProduct} stock={stock} />
              <p className="quick-view-price">{formatPrice(quickProduct.price)}</p>
              <p>{quickProduct.description}</p>
              <div className="quick-view-actions">
                <button className="primary-button" type="button" onClick={() => onAdd(quickProduct)}>Add to bag <span aria-hidden="true">+</span></button>
                <Link className="text-link" to={`/products/${quickProduct.id}`} onClick={() => quickViewRef.current?.close()}>Full details <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </main>
  )
}

function ProductPage({ onAdd, reviews, onAddReview, stock }) {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true
    fetch(`${API_BASE}/products/${id}`).then((response) => {
      if (!response.ok) throw new Error('Product could not be loaded')
      return response.json()
    }).then((data) => {
      if (active) { setProduct(data); setStatus('ready') }
    }).catch(() => { if (active) setStatus('error') })
    return () => { active = false }
  }, [id])

  if (status === 'loading') return <main className="route-message">Loading this good thing...</main>
  if (status === 'error' || !product) return <main className="route-message">That product isn’t available right now. <Link to="/">Back to the shop</Link></main>

  return (
    <main className="product-page">
      <section className="detail-layout section-wrap">
      <div className="detail-image"><ProductImage src={product.images?.[0]} alt={product.title} /></div>
      <div className="detail-copy">
        <Link className="back-link" to="/">← Back to the edit</Link>
        <p className="eyebrow">{product.category?.name || 'Everyday object'}</p>
        <h1>{product.title}</h1>
        <TopRatedBadge reviews={reviews[product.id] || []} />
        <StockIndicator product={product} stock={stock} />
        <p className="detail-price">{formatPrice(product.price)}</p>
        <p className="detail-description">{product.description}</p>
        <button className="primary-button detail-add" type="button" onClick={() => onAdd(product)}>Add to bag <span aria-hidden="true">↗</span></button>
        <p className="detail-footnote">A considered pick for your everyday. Delivery details are confirmed at checkout.</p>
      </div>
      </section>
      <ProductReviews productId={product.id} reviews={reviews[product.id] || []} onAddReview={onAddReview} />
    </main>
  )
}

function ProductReviews({ productId, reviews, onAddReview }) {
  const [rating, setRating] = useState('5')
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedComment = comment.trim()
    if (!trimmedComment) return
    onAddReview(productId, { rating: Number(rating), comment: trimmedComment })
    setComment('')
    setMessage('Your review has been saved in this browser.')
  }

  return (
    <section className="reviews-section section-wrap" aria-labelledby="reviews-title">
      <div className="reviews-heading">
        <div><p className="eyebrow">From the community</p><h2 id="reviews-title">Ratings &amp; comments</h2></div>
        <RatingSummary reviews={reviews} />
      </div>
      <form className="review-form" onSubmit={handleSubmit}>
        <label>Rating<select value={rating} onChange={(event) => setRating(event.target.value)}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} {value === 1 ? 'star' : 'stars'}</option>)}</select></label>
        <label className="review-comment">Your comment<textarea required minLength={5} maxLength={600} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What did you think of this product?" /></label>
        <button className="primary-button" type="submit">Post review <span aria-hidden="true">↗</span></button>
        {message && <p className="review-feedback" role="status">{message}</p>}
      </form>
      <div className="review-list">
        {reviews.length === 0 ? <p className="empty-reviews">No reviews yet. Be the first to share a thought.</p> : [...reviews].reverse().map((review) => (
          <article className="review-entry" key={review.id}>
            <div className="review-entry-heading"><strong>{review.author || 'Shopper'}</strong><span>{new Date(review.createdAt).toLocaleDateString()}</span></div>
            <RatingSummary reviews={[review]} />
            <p>{review.comment}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function CartPage({ cart, onQuantity, onRemove, onCheckout }) {
  const navigate = useNavigate()
  const items = Object.values(cart)
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <main className="cart-page section-wrap">
      <div className="section-heading cart-heading"><div><p className="eyebrow">Your good things</p><h1>Your bag<span className="title-period">.</span></h1></div><span>{items.reduce((sum, item) => sum + item.quantity, 0)} items</span></div>
      {items.length === 0 ? (
        <div className="empty-cart"><p>Your bag is taking a little breather.</p><Link className="primary-button" to="/">Find something lovely <span aria-hidden="true">↗</span></Link></div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">{items.map(({ product, quantity }) => (
            <article className="cart-item" key={product.id}>
              <Link to={`/products/${product.id}`} className="cart-thumb"><ProductImage src={product.images?.[0]} alt={product.title} /></Link>
              <div className="cart-item-info"><Link to={`/products/${product.id}`}><h2>{product.title}</h2></Link><span>{product.category?.name || 'Everyday'}</span><button className="text-button remove-button" type="button" onClick={() => onRemove(product.id)}>Remove</button></div>
              <label className="quantity-control">Qty <select aria-label={`Quantity for ${product.title}`} value={quantity} onChange={(event) => onQuantity(product.id, Number(event.target.value))}>{[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <strong>{formatPrice(product.price * quantity)}</strong>
            </article>
          ))}</div>
          <aside className="order-summary"><h2>Little recap</h2><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div><span>Shipping</span><span>Calculated at checkout</span></div><p>Demo checkout saves this order to your browser history.</p><button className="primary-button checkout-button" type="button" onClick={onCheckout}>Place demo order <span aria-hidden="true">↗</span></button><button className="text-button continue-button" type="button" onClick={() => navigate('/')}>Keep browsing</button></aside>
        </div>
      )}
    </main>
  )
}

function AboutPage() {
  return (
    <main className="brand-page section-wrap">
      <header className="brand-page-heading">
        <p className="eyebrow">About Rauhie Shop</p>
        <h1>Useful finds for<br /><em>every kind of day.</em></h1>
        <p>Rauhie Shop brings together gadgets, toys, clothing, beauty, gifts, everyday essentials, and more.</p>
      </header>
      <section className="about-values" aria-label="What we bring together">
        <article><span>01</span><h2>Explore more</h2><p>Discover products across categories, with new finds to browse as the collection grows.</p></article>
        <article><span>02</span><h2>Everyday useful</h2><p>From handy tech to home and lifestyle picks, find things that fit the way you live.</p></article>
        <article><span>03</span><h2>Made for choice</h2><p>Compare different kinds of products in one shop and choose what works for you.</p></article>
      </section>
      <section className="about-location">
        <div><p className="eyebrow">Find us in Dhaka</p><h2>Rauhie Shop</h2></div>
        <address>21 Sukrabad, Dhanmondi 32,<br />Dhaka-1205</address>
        <Link className="text-link" to="/contact">Get in touch <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  )
}

function ContactPage() {
  return (
    <main className="brand-page contact-page section-wrap">
      <header className="brand-page-heading">
        <p className="eyebrow">Contact Rauhie Shop</p>
        <h1>We’re easy<br /><em>to reach.</em></h1>
        <p>Questions about a product or your order? Reach out by phone or email, or find our address below.</p>
      </header>
      <section className="contact-details" aria-label="Contact details">
        <a href="tel:+8801710659435"><span>Call us</span><strong>+88 01710659435</strong><span className="contact-arrow" aria-hidden="true">↗</span></a>
        <a href="mailto:rakibchp@gmail.com"><span>Email us</span><strong>rakibchp@gmail.com</strong><span className="contact-arrow" aria-hidden="true">↗</span></a>
        <a href="https://maps.google.com/?q=21+Sukrabad,+Dhanmondi+32,+Dhaka-1205" target="_blank" rel="noreferrer"><span>Visit us</span><strong>21 Sukrabad, Dhanmondi 32,<br />Dhaka-1205</strong><span className="contact-arrow" aria-hidden="true">↗</span></a>
      </section>
    </main>
  )
}

function AuthPage({ isRegister = false, session, onSignIn }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const notice = location.state?.notice || ''

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (isRegister && password !== confirmation) {
      setError('Your passwords do not match.')
      return
    }

    setPending(true)
    try {
      if (isRegister) {
        const response = await fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, avatar: 'https://i.pravatar.cc/300' }),
        })
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(Array.isArray(result.message) ? result.message.join(', ') : result.message || 'Could not create your account.')
        navigate('/login', { replace: true, state: { notice: 'Your account is ready. Sign in to continue.' } })
      } else {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const tokens = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(Array.isArray(tokens.message) ? tokens.message.join(', ') : tokens.message || 'Email or password was not accepted.')
        const profileResponse = await fetch(`${API_BASE}/auth/profile`, { headers: { Authorization: `Bearer ${tokens.access_token}` } })
        const user = profileResponse.ok ? await profileResponse.json() : { email, name: email.split('@')[0] }
        onSignIn({ ...tokens, user })
        navigate('/account', { replace: true })
      }
    } catch (requestError) {
      setError(requestError.message || 'Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  if (session) {
    return <main className="account-page section-wrap"><p className="eyebrow">Rauhie Shop account</p><h1>You’re already signed in.</h1><Link className="primary-button" to="/account">Go to your account <span aria-hidden="true">↗</span></Link></main>
  }

  return (
    <main className="account-page section-wrap">
      <div className="account-form-wrap">
        <p className="eyebrow">{isRegister ? 'Join Rauhie Shop' : 'Welcome back'}</p>
        <h1>{isRegister ? 'Create your account.' : 'Sign in.'}</h1>
        <p className="account-intro">{isRegister ? 'Create an account to keep your shopping in one place.' : 'Sign in to access your account.'}</p>
        {notice && <p className="form-notice" role="status">{notice}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <form className="account-form" onSubmit={handleSubmit}>
          {isRegister && <label>Full name<input autoComplete="name" minLength={2} required value={name} onChange={(event) => setName(event.target.value)} /></label>}
          <label>Email address<input autoComplete="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input autoComplete={isRegister ? 'new-password' : 'current-password'} type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {isRegister && <label>Confirm password<input autoComplete="new-password" type="password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>}
          <button className="primary-button" type="submit" disabled={pending}>{pending ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'} <span aria-hidden="true">↗</span></button>
        </form>
        <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to Rauhie Shop?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
      </div>
    </main>
  )
}

function AccountPage({ session, onSignOut }) {
  const navigate = useNavigate()
  if (!session) {
    return <main className="account-page section-wrap"><p className="eyebrow">Rauhie Shop account</p><h1>Sign in to your account.</h1><Link className="primary-button" to="/login">Sign in <span aria-hidden="true">↗</span></Link></main>
  }

  const user = session.user || {}
  return (
    <main className="account-page section-wrap">
      <p className="eyebrow">Your Rauhie Shop account</p>
      <h1>Welcome, {user.name || 'shopper'}.</h1>
      <p className="account-intro">{user.email}</p>
      <div className="account-profile">
        {user.avatar && <img className="profile-avatar" src={user.avatar} alt={`${user.name || 'Account'} profile`} />}
        <div><span className="profile-label">Account role</span><strong className={`role-badge ${user.role === 'admin' ? 'admin-role' : ''}`}>{user.role || 'customer'}</strong></div>
      </div>
      <div className="account-actions">
        <Link className="account-action-link" to="/history"><HistoryIcon size={19} aria-hidden="true" />Order history <span aria-hidden="true">↗</span></Link>
        {user.role === 'admin' && <Link className="account-action-link" to="/admin/products">Manage products <span aria-hidden="true">↗</span></Link>}
        <button className="text-button sign-out-button" type="button" onClick={() => { onSignOut(); navigate('/') }}><LogOut size={17} aria-hidden="true" />Sign out</button>
      </div>
    </main>
  )
}

function OrderHistoryPage({ orders }) {
  return (
    <main className="history-page section-wrap">
      <div className="section-heading"><div><p className="eyebrow">Saved on this device</p><h1>Order history<span className="title-period">.</span></h1></div><span>{orders.length} orders</span></div>
      {orders.length === 0 ? (
        <div className="empty-cart"><p>No demo orders yet.</p><Link className="primary-button" to="/">Browse products <span aria-hidden="true">↗</span></Link></div>
      ) : (
        <div className="order-history-list">{orders.map((order) => (
          <article className="order-history-item" key={order.id}>
            <header><div><span>Order</span><h2>{order.id}</h2></div><time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleDateString()}</time></header>
            <ul>{order.items.map((item) => <li key={item.id}><span>{item.quantity} × {item.title}</span><strong>{formatPrice(item.price * item.quantity)}</strong></li>)}</ul>
            <footer><span>Demo order</span><strong>Total {formatPrice(order.total)}</strong></footer>
          </article>
        ))}</div>
      )}
    </main>
  )
}

function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateVisibility = () => setIsVisible(window.scrollY > 320)

    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
    return () => window.removeEventListener('scroll', updateVisibility)
  }, [])

  if (!isVisible) return null

  function scrollToTop() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const accessibilityReducedMotion = document.documentElement.classList.contains('a11y-reduced-motion')
    const behavior = prefersReducedMotion || accessibilityReducedMotion ? 'instant' : 'smooth'
    window.scrollTo({ top: 0, behavior })
  }

  return (
    <button
      className="fixed bottom-4 right-4 z-50 grid size-12 place-items-center rounded-full bg-[#35104f] text-2xl text-white shadow-lg transition duration-200 ease-out hover:-translate-y-1 hover:bg-[#e6388c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e6388c] motion-reduce:transition-none sm:bottom-6 sm:right-6"
      type="button"
      aria-label="Back to top"
      title="Back to top"
      onClick={scrollToTop}
    >
      <span aria-hidden="true">↑</span>
    </button>
  )
}

function App() {
  const [cart, setCart] = useState(readSavedCart)
  const [reviews, setReviews] = useState(readSavedReviews)
  const [session, setSession] = useState(readSavedSession)
  const [orders, setOrders] = useState(readSavedOrders)
  const [stock, setStock] = useState(readSavedStock)
  const itemCount = useMemo(() => Object.values(cart).reduce((sum, item) => sum + item.quantity, 0), [cart])
  const navigate = useNavigate()

  useEffect(() => { localStorage.setItem('shop-cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => { localStorage.setItem('shop-product-reviews', JSON.stringify(reviews)) }, [reviews])
  useEffect(() => {
    if (session) localStorage.setItem('shop-session', JSON.stringify(session))
    else localStorage.removeItem('shop-session')
  }, [session])
  useEffect(() => { localStorage.setItem('shop-order-history', JSON.stringify(orders)) }, [orders])
  useEffect(() => { localStorage.setItem('shop-product-stock', JSON.stringify(stock)) }, [stock])

  function addToCart(product) {
    setCart((current) => ({
      ...current,
      [product.id]: { product, quantity: (current[product.id]?.quantity || 0) + 1 },
    }))
  }

  function updateQuantity(productId, quantity) {
    setCart((current) => ({ ...current, [productId]: { ...current[productId], quantity } }))
  }

  function removeFromCart(productId) {
    setCart((current) => Object.fromEntries(Object.entries(current).filter(([id]) => id !== String(productId))))
  }

  function updateProductStock(productId, quantity) {
    setStock((current) => {
      const next = { ...current }
      if (quantity == null) delete next[productId]
      else next[productId] = quantity
      return next
    })
  }

  function addReview(productId, review) {
    const savedReview = { ...review, id: Date.now(), author: 'Shopper', createdAt: new Date().toISOString() }
    setReviews((current) => ({
      ...current,
      [productId]: [...(current[productId] || []), savedReview],
    }))
  }

  function signOut() {
    setSession(null)
  }

  function placeDemoOrder() {
    const items = Object.values(cart)
    if (items.length === 0) return
    const order = {
      id: `RS-${Date.now()}`,
      createdAt: new Date().toISOString(),
      items: items.map(({ product, quantity }) => ({ id: product.id, title: product.title, price: product.price, quantity })),
      total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    }
    setOrders((current) => [order, ...current])
    setCart({})
    navigate('/history')
  }

  return (
    <>
    <div className="app-shell">
      <div className="announcement">A little more joy in the everyday <span aria-hidden="true">✳</span> Delivery details at checkout</div>
      <Header itemCount={itemCount} user={session?.user} />
      <Routes>
        <Route path="/" element={<HomePage onAdd={addToCart} reviews={reviews} stock={stock} />} />
        <Route path="/products/:id" element={<ProductPage onAdd={addToCart} reviews={reviews} onAddReview={addReview} stock={stock} />} />
        <Route path="/cart" element={<CartPage cart={cart} onQuantity={updateQuantity} onRemove={removeFromCart} onCheckout={placeDemoOrder} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<AuthPage session={session} onSignIn={setSession} />} />
        <Route path="/register" element={<AuthPage isRegister session={session} onSignIn={setSession} />} />
        <Route path="/account" element={<AccountPage session={session} onSignOut={signOut} />} />
        <Route path="/history" element={<OrderHistoryPage orders={orders} />} />
        <Route path="/admin/products" element={<AdminProductsPage session={session} stock={stock} onStockChange={updateProductStock} formatPrice={formatPrice} />} />
        <Route path="*" element={<main className="route-message">Page not found. <Link to="/">Back to the shop</Link></main>} />
      </Routes>
      <Footer />
    </div>
    <BackToTop />
    </>
  )
}

export default App
