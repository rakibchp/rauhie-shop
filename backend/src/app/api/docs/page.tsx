'use client';

import React, { useState, useMemo } from 'react';

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  desc: string;
  auth: 'Public' | 'Bearer Token' | 'Admin' | 'Customer / Admin' | 'Public / User' | 'Customer / Guest';
  tag: string;
  parameters?: { name: string; in: 'path' | 'query'; required: boolean; type: string; desc: string; default?: string }[];
  requestBody?: Record<string, any>;
  sampleResponse?: Record<string, any>;
}

export const ENDPOINTS_DATA: EndpointDoc[] = [
  // System Health
  {
    method: 'GET',
    path: '/api/health',
    desc: 'System and database health check',
    auth: 'Public',
    tag: 'System',
    sampleResponse: { status: 'operational', service: 'Rauhie Shop Unified Production API', catalogSize: 10, aiAvailable: true },
  },
  // Authentication
  {
    method: 'POST',
    path: '/api/auth/register',
    desc: 'Register new customer or admin',
    auth: 'Public',
    tag: 'Authentication',
    requestBody: {
      name: 'Samira Rahman',
      email: 'customer@rauhieshop.com',
      password: 'SecurePassword123!',
      phone: '+8801711223344',
      address: '21 Sukrabad, Dhanmondi, Dhaka',
    },
    sampleResponse: { success: true, data: { user: { id: 'usr-101', name: 'Samira', role: 'CUSTOMER' }, token: 'jwt-...' } },
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    desc: 'Authenticate user & receive JWT token',
    auth: 'Public',
    tag: 'Authentication',
    requestBody: {
      email: 'admin@rauhie.com',
      password: 'Admin@Rauhie2026',
    },
    sampleResponse: { success: true, data: { user: { email: 'admin@rauhie.com', role: 'ADMIN' }, token: 'jwt-admin-...' } },
  },
  {
    method: 'GET',
    path: '/api/auth/me',
    desc: 'Get authenticated user profile',
    auth: 'Bearer Token',
    tag: 'Authentication',
    sampleResponse: { success: true, data: { id: 'usr-101', email: 'customer@rauhieshop.com', role: 'CUSTOMER' } },
  },
  // Categories
  {
    method: 'GET',
    path: '/api/categories',
    desc: 'List all categories with product counts',
    auth: 'Public',
    tag: 'Categories',
    sampleResponse: { success: true, data: [{ id: 'cat-jewelry', name: 'Jewelry & Accessories', count: 2 }] },
  },
  {
    method: 'POST',
    path: '/api/categories',
    desc: 'Create a new category',
    auth: 'Admin',
    tag: 'Categories',
    requestBody: { name: 'Artisan Shawls', slug: 'artisan-shawls' },
    sampleResponse: { success: true, data: { id: 'cat-new', name: 'Artisan Shawls' } },
  },
  // Products
  {
    method: 'GET',
    path: '/api/products',
    desc: 'List products (search, filter, sort, paginate)',
    auth: 'Public',
    tag: 'Products',
    parameters: [
      { name: 'category', in: 'query', required: false, type: 'string', desc: 'Category slug or name (e.g. "Jewelry & Accessories")' },
      { name: 'search', in: 'query', required: false, type: 'string', desc: 'Search keyword matching title, description or tags' },
      { name: 'sortBy', in: 'query', required: false, type: 'string', desc: 'Sorting mode: "featured", "price_asc", "price_desc", "rating"', default: 'featured' },
    ],
    sampleResponse: { success: true, count: 10, data: [{ id: 'prod-001', name: 'Gilded Freshwater Pearl Drop Earrings', price: 1850 }] },
  },
  {
    method: 'POST',
    path: '/api/products',
    desc: 'Create new product with images and stock',
    auth: 'Admin',
    tag: 'Products',
    requestBody: {
      name: 'Rose Gold Floral Bangle',
      price: 2150,
      compareAtPrice: 2800,
      categoryId: 'cat-jewelry',
      stock: 15,
      description: 'Handcrafted floral filigree bangle plated in 18K rose gold.',
      imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    },
    sampleResponse: { success: true, data: { id: 'prod-new', name: 'Rose Gold Floral Bangle', price: 2150 } },
  },
  {
    method: 'GET',
    path: '/api/products/:id',
    desc: 'Get product details by ID or slug',
    auth: 'Public',
    tag: 'Products',
    parameters: [
      { name: 'id', in: 'path', required: true, type: 'string', desc: 'Product unique ID or URL slug' },
    ],
    sampleResponse: { success: true, data: { id: 'prod-001-pearl-earrings', name: 'Gilded Freshwater Pearl Drop Earrings' } },
  },
  {
    method: 'PUT',
    path: '/api/products/:id',
    desc: 'Update product information and inventory',
    auth: 'Admin',
    tag: 'Products',
    parameters: [
      { name: 'id', in: 'path', required: true, type: 'string', desc: 'Product unique ID to update' },
    ],
    requestBody: { price: 1950, stock: 30 },
    sampleResponse: { success: true, data: { id: 'prod-001-pearl-earrings', price: 1950, stock: 30 } },
  },
  {
    method: 'DELETE',
    path: '/api/products/:id',
    desc: 'Delete product',
    auth: 'Admin',
    tag: 'Products',
    parameters: [
      { name: 'id', in: 'path', required: true, type: 'string', desc: 'Product unique ID to delete' },
    ],
    sampleResponse: { success: true, message: 'Product removed' },
  },
  // Orders
  {
    method: 'GET',
    path: '/api/orders',
    desc: 'List user orders (or all orders for admin)',
    auth: 'Bearer Token',
    tag: 'Orders',
    sampleResponse: { success: true, data: [{ id: 'ord-1', orderNumber: 'RH-20261028-A492F', status: 'DELIVERED' }] },
  },
  {
    method: 'POST',
    path: '/api/orders',
    desc: 'Place new order (calculates totals & checks stock)',
    auth: 'Public / User',
    tag: 'Orders',
    requestBody: {
      customerName: 'Ayesha Siddiqua',
      customerEmail: 'ayesha@example.com',
      customerPhone: '+8801710998877',
      shippingAddress: {
        addressLine: 'House 5, Road 11, Banani',
        city: 'Dhaka',
        country: 'Bangladesh',
      },
      paymentMethod: 'BKASH',
      shippingFee: 60,
      discount: 150,
      notes: 'bKash TrxID: 9MK29104LA',
      items: [
        { productId: 'prod-001-pearl-earrings', quantity: 1 },
      ],
    },
    sampleResponse: { success: true, data: { orderNumber: 'RH-20261030-XYZ', totalAmount: 1760, status: 'PROCESSING' } },
  },
  {
    method: 'GET',
    path: '/api/orders/:id',
    desc: 'Get order details by ID or order number',
    auth: 'Customer / Admin',
    tag: 'Orders',
    parameters: [
      { name: 'id', in: 'path', required: true, type: 'string', desc: 'Order ID or RH order number' },
    ],
    sampleResponse: { success: true, data: { id: 'ord-seed-1', status: 'DELIVERED', totalAmount: 2510 } },
  },
  {
    method: 'PATCH',
    path: '/api/orders/:id',
    desc: 'Update order status or payment status',
    auth: 'Admin',
    tag: 'Orders',
    parameters: [
      { name: 'id', in: 'path', required: true, type: 'string', desc: 'Order ID or order number' },
    ],
    requestBody: { status: 'SHIPPED', paymentStatus: 'PAID' },
    sampleResponse: { success: true, data: { id: 'ord-1', status: 'SHIPPED', paymentStatus: 'PAID' } },
  },
  // Payments
  {
    method: 'POST',
    path: '/api/payments',
    desc: 'Verify and process gateway payments (bKash, Nagad, Card)',
    auth: 'Public',
    tag: 'Payments',
    requestBody: {
      orderId: 'ord-seed-1',
      paymentMethod: 'BKASH',
      transactionId: '9MK29104LA',
      amount: 2510,
    },
    sampleResponse: { success: true, status: 'PAID', verified: true },
  },
  // Reviews
  {
    method: 'POST',
    path: '/api/reviews',
    desc: 'Submit customer ratings and reviews for products',
    auth: 'Customer / Guest',
    tag: 'Reviews',
    requestBody: {
      productId: 'prod-001-pearl-earrings',
      rating: 5,
      comment: 'Absolutely stunning baroque pearl luster! Exceeded my expectations.',
      author: 'Nabila H.',
    },
    sampleResponse: { success: true, data: { id: 'rev-101', rating: 5, comment: '...' } },
  },
  // Admin Analytics
  {
    method: 'GET',
    path: '/api/admin/stats',
    desc: 'SuperAdmin KPI analytics (revenue, orders, stock alerts)',
    auth: 'Admin',
    tag: 'Admin',
    sampleResponse: {
      success: true,
      data: {
        metrics: { totalRevenue: 184500, totalOrders: 42, totalProducts: 10, totalCustomers: 148 },
        lowStockProducts: [],
      },
    },
  },
  // Cart
  {
    method: 'GET',
    path: '/api/cart',
    desc: 'Get active user shopping cart',
    auth: 'Bearer Token',
    tag: 'Cart',
    sampleResponse: { success: true, items: [] },
  },
  {
    method: 'POST',
    path: '/api/cart',
    desc: 'Add or update item quantity in cart',
    auth: 'Bearer Token',
    tag: 'Cart',
    requestBody: { productId: 'prod-001-pearl-earrings', quantity: 2 },
    sampleResponse: { success: true, cart: { count: 2 } },
  },
  {
    method: 'DELETE',
    path: '/api/cart',
    desc: 'Remove item or clear user cart',
    auth: 'Bearer Token',
    tag: 'Cart',
    sampleResponse: { success: true, message: 'Cart cleared' },
  },
  // AI Intelligence Endpoints
  {
    method: 'POST',
    path: '/api/ai/gift-advisor',
    desc: 'AI-curated personal gift recommendations (Gemini 3.8 Flash)',
    auth: 'Public',
    tag: 'AI Intelligence',
    requestBody: {
      recipient: 'Sister',
      occasion: 'Birthday',
      budget: 3500,
      interests: 'Jewelry and floral scents',
      styleNotes: 'Loves freshwater baroque pearls and delicate tones',
    },
    sampleResponse: {
      success: true,
      data: {
        greeting: 'Welcome! Here are exquisite gift ideas...',
        recommendations: [],
        customGiftCardMessage: 'May this token of affection bring radiant joy...',
      },
      poweredBy: 'Gemini 3.8 Flash',
    },
  },
  {
    method: 'POST',
    path: '/api/ai/style-match',
    desc: 'AI ensemble coordinator and look matcher',
    auth: 'Public',
    tag: 'AI Intelligence',
    requestBody: {
      productId: 'prod-002-silk-hijab',
      styleVibe: 'Festive Celebration',
    },
    sampleResponse: {
      success: true,
      data: {
        lookTitle: 'The Signature Rauhie Palette',
        pairedProducts: [],
      },
    },
  },
  {
    method: 'POST',
    path: '/api/ai/smart-search',
    desc: 'Semantic natural language discovery search',
    auth: 'Public',
    tag: 'AI Intelligence',
    requestBody: {
      query: 'Thoughtful anniversary gift for wife under 3000 BDT',
    },
    sampleResponse: {
      success: true,
      interpretation: 'Anniversary gift recommendation under ৳3,000 BDT',
      matches: [],
    },
  },
];

export default function ApiDocsPage() {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [bearerToken, setBearerToken] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Live Testing State (by endpoint path + method)
  const [paramInputs, setParamInputs] = useState<Record<string, Record<string, string>>>({});
  const [bodyInputs, setBodyInputs] = useState<Record<string, string>>({});
  const [responses, setResponses] = useState<Record<string, { status: number; timeMs: number; data: any; error?: string }>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function handleCopyResponse(key: string, content: string) {
    const onSuccess = () => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(content).then(onSuccess).catch(() => {
        fallbackCopy(content, onSuccess);
      });
    } else {
      fallbackCopy(content, onSuccess);
    }
  }

  function fallbackCopy(text: string, cb?: () => void) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      if (cb) cb();
    } catch (e) {
      console.error('Fallback copy failed', e);
    }
    document.body.removeChild(ta);
  }

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    ENDPOINTS_DATA.forEach((ep) => tags.add(ep.tag));
    return ['All', ...Array.from(tags)];
  }, []);

  const filteredEndpoints = useMemo(() => {
    return ENDPOINTS_DATA.filter((ep) => {
      const matchTag = selectedTag === 'All' || ep.tag === selectedTag;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        ep.path.toLowerCase().includes(q) ||
        ep.desc.toLowerCase().includes(q) ||
        ep.method.toLowerCase().includes(q) ||
        ep.tag.toLowerCase().includes(q);
      return matchTag && matchSearch;
    });
  }, [selectedTag, searchQuery]);

  function getEndpointKey(ep: EndpointDoc) {
    return `${ep.method}-${ep.path}`;
  }

  function handleParamChange(key: string, paramName: string, value: string) {
    setParamInputs((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [paramName]: value,
      },
    }));
  }

  function handleBodyChange(key: string, value: string) {
    setBodyInputs((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function executeTest(ep: EndpointDoc) {
    const key = getEndpointKey(ep);
    setLoadingMap((prev) => ({ ...prev, [key]: true }));

    let requestUrl = ep.path;
    const currentParams = paramInputs[key] || {};

    // Substitute path params (e.g. :id)
    if (ep.parameters) {
      for (const p of ep.parameters) {
        if (p.in === 'path') {
          const val = currentParams[p.name] || (p.name === 'id' ? 'prod-001-pearl-earrings' : '1');
          requestUrl = requestUrl.replace(`:${p.name}`, encodeURIComponent(val));
        }
      }

      // Append query params
      const queryList = ep.parameters.filter((p) => p.in === 'query');
      if (queryList.length > 0) {
        const queryParams = new URLSearchParams();
        for (const q of queryList) {
          const val = currentParams[q.name] || q.default;
          if (val) queryParams.set(q.name, val);
        }
        const qs = queryParams.toString();
        if (qs) requestUrl += `?${qs}`;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken.trim()}`;
    }

    const startTime = Date.now();
    try {
      let body: string | undefined = undefined;
      if (ep.method !== 'GET') {
        const bodyText = bodyInputs[key] ?? JSON.stringify(ep.requestBody || {}, null, 2);
        body = bodyText;
      }

      const res = await fetch(requestUrl, {
        method: ep.method,
        headers,
        body,
      });

      const timeMs = Date.now() - startTime;
      const json = await res.json().catch(() => ({ message: 'Non-JSON response' }));

      setResponses((prev) => ({
        ...prev,
        [key]: {
          status: res.status,
          timeMs,
          data: json,
        },
      }));
    } catch (err: any) {
      const timeMs = Date.now() - startTime;
      setResponses((prev) => ({
        ...prev,
        [key]: {
          status: 0,
          timeMs,
          data: null,
          error: err.message || 'Network request failed',
        },
      }));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [key]: false }));
    }
  }

  const methodColors: Record<string, { bg: string; text: string; border: string }> = {
    GET: { bg: '#0284c715', text: '#0284c7', border: '#0284c740' },
    POST: { bg: '#16a34a15', text: '#16a34a', border: '#16a34a40' },
    PUT: { bg: '#d9770615', text: '#d97706', border: '#d9770640' },
    PATCH: { bg: '#0d948815', text: '#0d9488', border: '#0d948840' },
    DELETE: { bg: '#dc262615', text: '#dc2626', border: '#dc262640' },
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Swagger Navbar */}
      <nav style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#e6388c', letterSpacing: '-0.02em' }}>
            Rauhie API Docs
          </span>
          <span style={{ backgroundColor: '#334155', color: '#cbd5e1', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
            OAS 3.0
          </span>
          <span style={{ color: '#64748b', fontSize: '13px' }}>v2.0.0</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: bearerToken ? '#16a34a' : 'transparent',
              border: '1px solid ' + (bearerToken ? '#16a34a' : '#e6388c'),
              color: bearerToken ? '#fff' : '#e6388c',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🔓 {bearerToken ? 'Authorized' : 'Authorize (Bearer Token)'}
          </button>
          <a
            href="/api/health"
            target="_blank"
            rel="noreferrer"
            style={{ backgroundColor: '#334155', color: '#f8fafc', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
          >
            Health Status ↗
          </a>
        </div>
      </nav>

      {/* Hero Header */}
      <header style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 20px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', color: '#f8fafc' }}>
          Rauhie Shop REST API Specification
        </h1>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
          Comprehensive documentation of all serverless endpoints supporting storefront browsing, checkout, authentication, order fulfillment, rate limiting, and Gemini AI shopping assistance.
        </p>

        {/* Search & Tag Filter Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid ' + (selectedTag === tag ? '#e6388c' : '#334155'),
                  backgroundColor: selectedTag === tag ? '#e6388c' : '#1e293b',
                  color: selectedTag === tag ? '#fff' : '#cbd5e1',
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by endpoint path, method, or keyword..."
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #334155',
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              fontSize: '12px',
              width: '280px',
              outline: 'none',
            }}
          />
        </div>
      </header>

      {/* Endpoint List */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 24px 60px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredEndpoints.map((ep, idx) => {
            const isExpanded = expandedIndex === idx;
            const colors = methodColors[ep.method] || methodColors.GET;
            const key = getEndpointKey(ep);
            const responseData = responses[key];
            const isLoading = loadingMap[key];

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: `1px solid ${isExpanded ? colors.border : '#334155'}`,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
              >
                {/* Accordion Summary Row */}
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    backgroundColor: isExpanded ? colors.bg : 'transparent',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 800,
                        backgroundColor: colors.text,
                        color: '#fff',
                        minWidth: '65px',
                        textAlign: 'center',
                      }}
                    >
                      {ep.method}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
                      {ep.path}
                    </span>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                      — {ep.desc}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#cbd5e1', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#0f172a' }}>
                      {ep.auth}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Expanded Playground Panel */}
                {isExpanded && (
                  <div style={{ padding: '20px', borderTop: '1px solid #334155', backgroundColor: '#0f172a20' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                      {/* Left: Request Parameters / Body */}
                      <div>
                        {ep.parameters && ep.parameters.length > 0 && (
                          <div style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>
                              Parameters
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {ep.parameters.map((p) => (
                                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                  <span style={{ fontFamily: 'monospace', color: '#38bdf8', minWidth: '80px' }}>{p.name}</span>
                                  <span style={{ color: '#64748b', fontSize: '11px' }}>({p.in})</span>
                                  <input
                                    type="text"
                                    placeholder={p.desc}
                                    defaultValue={p.default || ''}
                                    onChange={(e) => handleParamChange(key, p.name, e.target.value)}
                                    style={{
                                      flex: 1,
                                      padding: '5px 10px',
                                      borderRadius: '4px',
                                      border: '1px solid #334155',
                                      backgroundColor: '#1e293b',
                                      color: '#f8fafc',
                                      fontSize: '12px',
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {ep.method !== 'GET' && (
                          <div>
                            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>
                              Request Body (JSON)
                            </h4>
                            <textarea
                              rows={7}
                              value={bodyInputs[key] ?? JSON.stringify(ep.requestBody || {}, null, 2)}
                              onChange={(e) => handleBodyChange(key, e.target.value)}
                              style={{
                                width: '100%',
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                padding: '10px',
                                backgroundColor: '#0f172a',
                                color: '#38bdf8',
                                border: '1px solid #334155',
                                borderRadius: '6px',
                                boxSizing: 'border-box',
                                outline: 'none',
                              }}
                            />
                          </div>
                        )}

                        <div style={{ marginTop: '16px' }}>
                          <button
                            disabled={isLoading}
                            onClick={() => executeTest(ep)}
                            style={{
                              backgroundColor: colors.text,
                              color: '#fff',
                              border: 'none',
                              padding: '8px 18px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            {isLoading ? 'Executing...' : '⚡ Try It Out (Execute)'}
                          </button>
                        </div>
                      </div>

                      {/* Right: Live Response Viewer */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                          <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', margin: 0, letterSpacing: '0.05em' }}>
                            {responseData ? `Response Status: ${responseData.status} (${responseData.timeMs}ms)` : 'Sample Response Schema'}
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              const text = responseData
                                ? JSON.stringify(responseData.data ?? responseData.error, null, 2)
                                : JSON.stringify(ep.sampleResponse || {}, null, 2);
                              handleCopyResponse(key, text);
                            }}
                            title="Copy response JSON to clipboard"
                            aria-label="Copy JSON Response"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '5px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: copiedKey === key ? 'rgba(34, 197, 94, 0.15)' : '#0f172a',
                              border: `1px solid ${copiedKey === key ? '#22c55e' : '#334155'}`,
                              color: copiedKey === key ? '#4ade80' : '#cbd5e1',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              userSelect: 'none',
                            }}
                          >
                            {copiedKey === key ? (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                <span>Copy Response</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div style={{ position: 'relative' }}>
                          <pre
                            style={{
                              backgroundColor: '#0f172a',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid #334155',
                              color: responseData?.status === 200 || responseData?.status === 201 ? '#4ade80' : '#e2e8f0',
                              fontSize: '12px',
                              fontFamily: 'monospace',
                              overflowX: 'auto',
                              maxHeight: '220px',
                              margin: 0,
                            }}
                          >
                            {responseData
                              ? JSON.stringify(responseData.data || responseData.error, null, 2)
                              : JSON.stringify(ep.sampleResponse, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Authorize Modal */}
      {isAuthModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', maxWidth: '480px', width: '100%', padding: '24px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#f8fafc' }}>
              Authorize Requests
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#94a3b8' }}>
              Enter a Bearer JWT Token or test admin token. All subsequent API test requests will automatically include the <code>Authorization: Bearer &lt;token&gt;</code> header.
            </p>
            <input
              type="text"
              value={bearerToken}
              onChange={(e) => setBearerToken(e.target.value)}
              placeholder="Paste token or enter 'jwt-rauhie-admin'..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #334155',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                fontSize: '13px',
                marginBottom: '16px',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setBearerToken('')}
                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
              >
                Clear
              </button>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', backgroundColor: '#e6388c', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
