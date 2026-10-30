import React from 'react';

const endpoints = [
  { method: 'GET', path: '/api/health', desc: 'System and database health check', auth: 'Public' },
  { method: 'POST', path: '/api/auth/register', desc: 'Register new customer or admin', auth: 'Public' },
  { method: 'POST', path: '/api/auth/login', desc: 'Authenticate user & receive JWT token', auth: 'Public' },
  { method: 'GET', path: '/api/auth/me', desc: 'Get authenticated user profile', auth: 'Bearer Token' },
  { method: 'GET', path: '/api/categories', desc: 'List all categories with product counts', auth: 'Public' },
  { method: 'POST', path: '/api/categories', desc: 'Create a new category', auth: 'Admin' },
  { method: 'GET', path: '/api/products', desc: 'List products (search, filter, sort, paginate)', auth: 'Public' },
  { method: 'POST', path: '/api/products', desc: 'Create new product with images and stock', auth: 'Admin' },
  { method: 'GET', path: '/api/products/:id', desc: 'Get product details by ID or slug', auth: 'Public' },
  { method: 'PUT', path: '/api/products/:id', desc: 'Update product information and inventory', auth: 'Admin' },
  { method: 'DELETE', path: '/api/products/:id', desc: 'Delete product', auth: 'Admin' },
  { method: 'GET', path: '/api/orders', desc: 'List user orders (or all orders for admin)', auth: 'Bearer Token' },
  { method: 'POST', path: '/api/orders', desc: 'Place new order (calculates totals & checks stock)', auth: 'Public / User' },
  { method: 'GET', path: '/api/orders/:id', desc: 'Get order details by ID or order number', auth: 'Customer / Admin' },
  { method: 'PATCH', path: '/api/orders/:id', desc: 'Update order status or payment status', auth: 'Admin' },
  { method: 'POST', path: '/api/payments', desc: 'Verify and process gateway payments (bKash, Nagad, Card)', auth: 'Public' },
  { method: 'POST', path: '/api/reviews', desc: 'Submit customer ratings and reviews for products', auth: 'Customer / Guest' },
  { method: 'GET', path: '/api/admin/stats', desc: 'SuperAdmin KPI analytics (revenue, orders, stock alerts)', auth: 'Admin' },
  { method: 'GET', path: '/api/cart', desc: 'Get active user shopping cart', auth: 'Bearer Token' },
  { method: 'POST', path: '/api/cart', desc: 'Add or update item quantity in cart', auth: 'Bearer Token' },
  { method: 'DELETE', path: '/api/cart', desc: 'Remove item or clear user cart', auth: 'Bearer Token' },
];

export default function HomePage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ marginBottom: '40px', borderBottom: '1px solid #1e293b', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0', color: '#f1f5f9' }}>
              Rauhie Shop — Backend API Engine
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '15px' }}>
              Next.js 15 Serverless REST API with Prisma ORM &amp; Neon PostgreSQL (Vercel-ready)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ backgroundColor: '#10b98120', color: '#34d399', padding: '6px 12px', borderRadius: '9999px', fontSize: '13px', fontWeight: 600 }}>
              ● Operational
            </span>
            <a
              href="/api/health"
              target="_blank"
              rel="noreferrer"
              style={{ backgroundColor: '#e6388c', color: '#ffffff', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}
            >
              Test /api/health
            </a>
          </div>
        </div>
      </header>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#cbd5e1', marginBottom: '16px' }}>
          Configured Tech Stack
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Framework</div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px', color: '#f8fafc' }}>Next.js 15 (App Router)</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Serverless Route Handlers on Vercel</div>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Database &amp; ORM</div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px', color: '#f8fafc' }}>Neon PostgreSQL + Prisma</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>100% Free Forever Connection Pooling</div>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Authentication</div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px', color: '#f8fafc' }}>JWT + Bcrypt (jose)</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Edge and Serverless compatible</div>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Gateways</div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px', color: '#f8fafc' }}>bKash · Nagad · Stripe · COD</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Live TrxID validation &amp; fulfillment</div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#cbd5e1', marginBottom: '16px' }}>
          Available REST Endpoints ({endpoints.length})
        </h2>
        <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '12px 16px', color: '#94a3b8', fontWeight: 600, width: '90px' }}>Method</th>
                  <th style={{ padding: '12px 16px', color: '#94a3b8', fontWeight: 600 }}>Endpoint</th>
                  <th style={{ padding: '12px 16px', color: '#94a3b8', fontWeight: 600 }}>Description</th>
                  <th style={{ padding: '12px 16px', color: '#94a3b8', fontWeight: 600, width: '130px' }}>Auth</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((ep, idx) => (
                  <tr key={idx} style={{ borderBottom: idx < endpoints.length - 1 ? '1px solid #334155' : 'none' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor:
                            ep.method === 'GET'
                              ? '#0284c725'
                              : ep.method === 'POST'
                              ? '#16a34a25'
                              : ep.method === 'PUT' || ep.method === 'PATCH'
                              ? '#d9770625'
                              : '#dc262625',
                          color:
                            ep.method === 'GET'
                              ? '#38bdf8'
                              : ep.method === 'POST'
                              ? '#4ade80'
                              : ep.method === 'PUT' || ep.method === 'PATCH'
                              ? '#fbbf24'
                              : '#f87171',
                        }}
                      >
                        {ep.method}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#e2e8f0', fontWeight: 500 }}>
                      {ep.path}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{ep.desc}</td>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1', fontSize: '12px' }}>{ep.auth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
