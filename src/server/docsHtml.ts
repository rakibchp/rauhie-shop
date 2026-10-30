export const ENDPOINTS_DOCS = [
  { method: 'GET', path: '/api/health', desc: 'System and database health check', auth: 'Public', tag: 'System', sampleResponse: { status: 'operational', catalogSize: 10, aiAvailable: true } },
  { method: 'POST', path: '/api/auth/register', desc: 'Register new customer or admin', auth: 'Public', tag: 'Authentication', requestBody: { name: 'Customer Name', email: 'user@example.com', password: 'Password123' }, sampleResponse: { success: true, data: { user: { id: 'usr-1', email: 'user@example.com' } } } },
  { method: 'POST', path: '/api/auth/login', desc: 'Authenticate user & receive JWT token', auth: 'Public', tag: 'Authentication', requestBody: { email: 'admin@rauhie.com', password: 'Admin@Rauhie2026' }, sampleResponse: { success: true, data: { token: 'jwt-...' } } },
  { method: 'GET', path: '/api/auth/me', desc: 'Get authenticated user profile', auth: 'Bearer Token', tag: 'Authentication', sampleResponse: { success: true, user: { role: 'CUSTOMER' } } },
  { method: 'GET', path: '/api/categories', desc: 'List all categories with product counts', auth: 'Public', tag: 'Categories', sampleResponse: { success: true, data: [] } },
  { method: 'POST', path: '/api/categories', desc: 'Create a new category', auth: 'Admin', tag: 'Categories', requestBody: { name: 'Artisan Shawls', slug: 'artisan-shawls' } },
  { method: 'GET', path: '/api/products', desc: 'List products (search, filter, sort, paginate)', auth: 'Public', tag: 'Products', parameters: [{ name: 'category', in: 'query', desc: 'Filter by category' }, { name: 'search', in: 'query', desc: 'Search term' }, { name: 'sortBy', in: 'query', desc: 'featured, price_asc, price_desc, rating' }] },
  { method: 'POST', path: '/api/products', desc: 'Create new product with images and stock', auth: 'Admin', tag: 'Products', requestBody: { name: 'Pearl Earrings', price: 1850, stock: 20, categoryId: 'cat-jewelry' } },
  { method: 'GET', path: '/api/products/:id', desc: 'Get product details by ID or slug', auth: 'Public', tag: 'Products', parameters: [{ name: 'id', in: 'path', desc: 'Product ID or slug', default: 'prod-001-pearl-earrings' }] },
  { method: 'PUT', path: '/api/products/:id', desc: 'Update product information and inventory', auth: 'Admin', tag: 'Products', parameters: [{ name: 'id', in: 'path', desc: 'Product ID to update', default: 'prod-001-pearl-earrings' }], requestBody: { price: 1900, stock: 25 } },
  { method: 'DELETE', path: '/api/products/:id', desc: 'Delete product', auth: 'Admin', tag: 'Products', parameters: [{ name: 'id', in: 'path', desc: 'Product ID to delete', default: 'prod-001-pearl-earrings' }] },
  { method: 'GET', path: '/api/orders', desc: 'List user orders (or all orders for admin)', auth: 'Bearer Token', tag: 'Orders' },
  { method: 'POST', path: '/api/orders', desc: 'Place new order (calculates totals & checks stock)', auth: 'Public / User', tag: 'Orders', requestBody: { customerName: 'Customer', customerEmail: 'cust@example.com', customerPhone: '+8801700000000', shippingAddress: { addressLine: 'Dhanmondi, Dhaka' }, paymentMethod: 'BKASH', items: [{ productId: 'prod-001-pearl-earrings', quantity: 1 }] } },
  { method: 'GET', path: '/api/orders/:id', desc: 'Get order details by ID or order number', auth: 'Customer / Admin', tag: 'Orders', parameters: [{ name: 'id', in: 'path', desc: 'Order ID', default: 'ord-seed-1' }] },
  { method: 'PATCH', path: '/api/orders/:id', desc: 'Update order status or payment status', auth: 'Admin', tag: 'Orders', parameters: [{ name: 'id', in: 'path', desc: 'Order ID', default: 'ord-seed-1' }], requestBody: { status: 'SHIPPED', paymentStatus: 'PAID' } },
  { method: 'POST', path: '/api/payments', desc: 'Verify and process gateway payments (bKash, Nagad, Card)', auth: 'Public', tag: 'Payments', requestBody: { orderId: 'ord-seed-1', paymentMethod: 'BKASH', transactionId: '9MK29104LA' } },
  { method: 'POST', path: '/api/reviews', desc: 'Submit customer ratings and reviews for products', auth: 'Customer / Guest', tag: 'Reviews', requestBody: { productId: 'prod-001-pearl-earrings', rating: 5, comment: 'Exquisite luster!' } },
  { method: 'GET', path: '/api/admin/stats', desc: 'SuperAdmin KPI analytics (revenue, orders, stock alerts)', auth: 'Admin', tag: 'Admin' },
  { method: 'GET', path: '/api/cart', desc: 'Get active user shopping cart', auth: 'Bearer Token', tag: 'Cart' },
  { method: 'POST', path: '/api/cart', desc: 'Add or update item quantity in cart', auth: 'Bearer Token', tag: 'Cart', requestBody: { productId: 'prod-001-pearl-earrings', quantity: 1 } },
  { method: 'DELETE', path: '/api/cart', desc: 'Remove item or clear user cart', auth: 'Bearer Token', tag: 'Cart' },
  { method: 'POST', path: '/api/ai/gift-advisor', desc: 'AI-curated personal gift recommendations (Gemini 3.8 Flash)', auth: 'Public', tag: 'AI Intelligence', requestBody: { recipient: 'Sister', occasion: 'Birthday', budget: 3500 } },
  { method: 'POST', path: '/api/ai/style-match', desc: 'AI ensemble coordinator and look matcher', auth: 'Public', tag: 'AI Intelligence', requestBody: { productId: 'prod-002-silk-hijab', styleVibe: 'Festive' } },
  { method: 'POST', path: '/api/ai/smart-search', desc: 'Semantic natural language discovery search', auth: 'Public', tag: 'AI Intelligence', requestBody: { query: 'Pearl necklace under 2000' } },
];

export function generateSwaggerHtml(): string {
  const jsonEndpoints = JSON.stringify(ENDPOINTS_DOCS);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rauhie Shop REST API — Dynamic Swagger Interface</title>
  <link rel="icon" type="image/png" href="/src/assets/logo.png">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; }
    header { background: #1e293b; border-bottom: 1px solid #334155; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    .brand { font-size: 19px; font-weight: 800; color: #e6388c; display: flex; align-items: center; gap: 8px; }
    .container { max-width: 1240px; margin: 0 auto; padding: 32px 24px 80px; }
    h1 { font-size: 26px; font-weight: 800; margin-bottom: 6px; }
    p.subtitle { color: #94a3b8; font-size: 14px; margin-bottom: 24px; line-height: 1.6; }
    .toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
    .tag-filter { display: flex; gap: 6px; flex-wrap: wrap; }
    .tag-btn { background: #1e293b; border: 1px solid #334155; color: #cbd5e1; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; }
    .tag-btn.active, .tag-btn:hover { background: #e6388c; border-color: #e6388c; color: #fff; }
    .search-input { background: #1e293b; border: 1px solid #334155; color: #fff; padding: 8px 14px; border-radius: 6px; font-size: 12px; width: 280px; outline: none; }
    .endpoint-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; margin-bottom: 10px; overflow: hidden; transition: border-color .15s; }
    .endpoint-card:hover { border-color: #475569; }
    .endpoint-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; cursor: pointer; flex-wrap: wrap; gap: 12px; }
    .endpoint-title { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .badge { padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 800; color: #fff; min-width: 65px; text-align: center; }
    .GET { background: #0284c7; }
    .POST { background: #16a34a; }
    .PUT { background: #d97706; }
    .PATCH { background: #0d9488; }
    .DELETE { background: #dc2626; }
    .path { font-family: monospace; font-size: 14px; font-weight: 600; color: #f1f5f9; }
    .desc { color: #94a3b8; font-size: 13px; }
    .auth-badge { font-size: 11px; padding: 3px 8px; border-radius: 4px; background: #0f172a; color: #cbd5e1; }
    .endpoint-body { padding: 20px; border-top: 1px solid #334155; background: #0b1120; display: none; }
    .endpoint-body.open { display: block; }
    .grid-play { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
    .section-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: .05em; margin-bottom: 8px; }
    textarea { width: 100%; font-family: monospace; font-size: 12px; padding: 10px; background: #0f172a; color: #38bdf8; border: 1px solid #334155; border-radius: 6px; box-sizing: border-box; }
    .param-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 12px; }
    .param-name { font-family: monospace; color: #38bdf8; min-width: 90px; }
    .param-input { flex: 1; padding: 6px 10px; background: #0f172a; border: 1px solid #334155; border-radius: 4px; color: #fff; font-size: 12px; }
    .btn-exec { background: #e6388c; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px; margin-top: 12px; display: inline-flex; align-items: center; gap: 6px; }
    pre { background: #0f172a; padding: 12px; border-radius: 6px; border: 1px solid #334155; font-size: 12px; overflow-x: auto; color: #4ade80; max-height: 250px; }
    .btn-copy { background: #0f172a; border: 1px solid #334155; color: #cbd5e1; padding: 4px 10px; border-radius: 5px; font-size: 11px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: all .15s ease; user-select: none; }
    .btn-copy:hover { background: #1e293b; border-color: #e6388c; color: #fff; }
    .btn-copy.copied { background: rgba(34, 197, 94, 0.15); border-color: #22c55e; color: #4ade80; }
    .auth-btn { background: transparent; border: 1px solid #e6388c; color: #e6388c; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .auth-btn.active { background: #16a34a; border-color: #16a34a; color: #fff; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span>Rauhie Shop API Docs</span>
      <span style="background:#334155;color:#cbd5e1;font-size:10px;padding:2px 6px;border-radius:4px;">OAS 3.0</span>
      <span style="font-size:12px;color:#64748b;font-weight:400;">v2.0.0</span>
    </div>
    <div style="display:flex;gap:10px;align-items:center;">
      <button id="auth-btn" class="auth-btn" onclick="toggleAuthModal()">🔓 Authorize</button>
      <a href="/api/health" target="_blank" style="color:#f8fafc;font-size:12px;font-weight:600;padding:6px 12px;background:#334155;border-radius:6px;text-decoration:none;">Health Status ↗</a>
      <a href="?format=json" target="_blank" style="color:#cbd5e1;font-size:12px;font-weight:600;padding:6px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;text-decoration:none;">JSON Spec</a>
    </div>
  </header>

  <div class="container">
    <h1>Rauhie Shop REST API Specification</h1>
    <p class="subtitle">Dynamic Swagger-like interactive documentation for all 24 backend endpoints listed in page.tsx, including rate limiting, products, authentication, orders, and Gemini 3.8 Flash AI concierge.</p>

    <div class="toolbar">
      <div id="tag-filter" class="tag-filter"></div>
      <input type="text" id="search-input" class="search-input" placeholder="Filter by endpoint path, method or tag...">
    </div>

    <div id="endpoint-list"></div>
  </div>

  <!-- Auth Modal -->
  <div id="auth-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);align-items:center;justify-content:center;z-index:999;padding:20px;">
    <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;max-width:480px;width:100%;padding:24px;">
      <h3 style="margin-bottom:8px;">Authorize Requests</h3>
      <p style="font-size:12px;color:#94a3b8;margin-bottom:16px;">Enter Bearer Token. All subsequent API test requests will include <code>Authorization: Bearer &lt;token&gt;</code>.</p>
      <input id="token-input" type="text" placeholder="jwt-rauhie-admin..." style="width:100%;padding:10px;background:#0f172a;border:1px solid #334155;border-radius:6px;color:#fff;font-size:13px;margin-bottom:16px;">
      <div style="display:flex;justify-content:flex-end;gap:8px;">
        <button onclick="clearToken()" style="padding:6px 12px;background:transparent;border:1px solid #334155;color:#cbd5e1;border-radius:6px;cursor:pointer;">Clear</button>
        <button onclick="saveToken()" style="padding:6px 16px;background:#e6388c;border:none;color:#fff;font-weight:600;border-radius:6px;cursor:pointer;">Save</button>
      </div>
    </div>
  </div>

  <script>
    const endpoints = ${jsonEndpoints};
    let currentTag = 'All';
    let searchQuery = '';
    let bearerToken = localStorage.getItem('swagger_token') || '';

    updateAuthButton();

    // Render Tag Filters
    const tags = ['All', ...new Set(endpoints.map(e => e.tag))];
    const tagFilterDiv = document.getElementById('tag-filter');
    tags.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'tag-btn' + (t === 'All' ? ' active' : '');
      btn.textContent = t;
      btn.onclick = () => {
        document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTag = t;
        renderList();
      };
      tagFilterDiv.appendChild(btn);
    });

    document.getElementById('search-input').oninput = (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderList();
    };

    function renderList() {
      const list = document.getElementById('endpoint-list');
      list.innerHTML = '';

      const filtered = endpoints.filter(ep => {
        const matchTag = currentTag === 'All' || ep.tag === currentTag;
        const matchSearch = !searchQuery || ep.path.toLowerCase().includes(searchQuery) || ep.desc.toLowerCase().includes(searchQuery) || ep.method.toLowerCase().includes(searchQuery);
        return matchTag && matchSearch;
      });

      filtered.forEach((ep, idx) => {
        const card = document.createElement('div');
        card.className = 'endpoint-card';
        card.innerHTML = \`
          <div class="endpoint-header" onclick="toggle(\${idx})">
            <div class="endpoint-title">
              <span class="badge \${ep.method}">\${ep.method}</span>
              <span class="path">\${ep.path}</span>
              <span class="desc">— \${ep.desc}</span>
            </div>
            <span class="auth-badge">\${ep.auth}</span>
          </div>
          <div id="body-\${idx}" class="endpoint-body">
            <div class="grid-play">
              <div>
                \${ep.parameters ? \`
                  <div class="section-label">Parameters</div>
                  \${ep.parameters.map(p => \`
                    <div class="param-row">
                      <span class="param-name">\${p.name} (\${p.in})</span>
                      <input id="param-\${idx}-\${p.name}" class="param-input" placeholder="\${p.desc}" value="\${p.default || ''}">
                    </div>
                  \`).join('')}
                \` : ''}

                \${ep.method !== 'GET' ? \`
                  <div class="section-label">Request Body (JSON)</div>
                  <textarea id="body-text-\${idx}" rows="6">\${JSON.stringify(ep.requestBody || {}, null, 2)}</textarea>
                \` : ''}

                <button class="btn-exec" onclick="testEndpoint('\${ep.method}', '\${ep.path}', \${idx})">⚡ Execute Live Test</button>
              </div>

              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span class="section-label" id="status-label-\${idx}" style="margin-bottom:0;">Response (Live or Sample Schema)</span>
                  <button type="button" id="copy-btn-\${idx}" class="btn-copy" onclick="copyResponse(\${idx})" title="Copy response JSON to clipboard" aria-label="Copy response JSON">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    <span>Copy Response</span>
                  </button>
                </div>
                <pre id="pre-\${idx}">\${JSON.stringify(ep.sampleResponse || {}, null, 2)}</pre>
              </div>
            </div>
          </div>
        \`;
        list.appendChild(card);
      });
    }

    renderList();

    function toggle(idx) {
      const el = document.getElementById('body-' + idx);
      el.classList.toggle('open');
    }

    async function testEndpoint(method, path, idx) {
      const pre = document.getElementById('pre-' + idx);
      const statusLabel = document.getElementById('status-label-' + idx);
      statusLabel.textContent = 'Executing...';
      pre.textContent = 'Sending request...';

      let url = path;
      const inputs = document.querySelectorAll('[id^="param-' + idx + '-"]');
      const queryParams = new URLSearchParams();

      inputs.forEach(input => {
        const pName = input.id.replace('param-' + idx + '-', '');
        const val = input.value;
        if (url.includes(':' + pName)) {
          url = url.replace(':' + pName, encodeURIComponent(val || 'prod-001-pearl-earrings'));
        } else if (val) {
          queryParams.set(pName, val);
        }
      });

      if (queryParams.toString()) {
        url += '?' + queryParams.toString();
      }

      const headers = { 'Content-Type': 'application/json' };
      if (bearerToken) headers['Authorization'] = 'Bearer ' + bearerToken;

      let body = undefined;
      const bodyTextarea = document.getElementById('body-text-' + idx);
      if (bodyTextarea && method !== 'GET') {
        body = bodyTextarea.value;
      }

      const start = Date.now();
      try {
        const res = await fetch(url, { method, headers, body });
        const time = Date.now() - start;
        const json = await res.json().catch(() => ({ status: res.status }));

        statusLabel.textContent = 'Status: ' + res.status + ' (' + time + 'ms)';
        statusLabel.style.color = res.status >= 200 && res.status < 300 ? '#4ade80' : '#f87171';
        pre.textContent = JSON.stringify(json, null, 2);
      } catch (e) {
        statusLabel.textContent = 'Error: Failed to fetch';
        statusLabel.style.color = '#f87171';
        pre.textContent = e.message;
      }
    }

    function copyResponse(idx) {
      const pre = document.getElementById('pre-' + idx);
      const btn = document.getElementById('copy-btn-' + idx);
      if (!pre || !btn) return;
      const text = pre.textContent || '';

      const handleSuccess = () => {
        btn.classList.add('copied');
        btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Copied!</span>';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>Copy Response</span>';
        }, 2000);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(handleSuccess).catch(() => {
          fallbackCopy(text, handleSuccess);
        });
      } else {
        fallbackCopy(text, handleSuccess);
      }
    }

    function fallbackCopy(text, callback) {
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
        if (callback) callback();
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(ta);
    }

    function toggleAuthModal() {
      const m = document.getElementById('auth-modal');
      m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
      if (m.style.display === 'flex') {
        document.getElementById('token-input').value = bearerToken;
      }
    }

    function saveToken() {
      bearerToken = document.getElementById('token-input').value.trim();
      localStorage.setItem('swagger_token', bearerToken);
      updateAuthButton();
      toggleAuthModal();
    }

    function clearToken() {
      bearerToken = '';
      localStorage.removeItem('swagger_token');
      document.getElementById('token-input').value = '';
      updateAuthButton();
      toggleAuthModal();
    }

    function updateAuthButton() {
      const b = document.getElementById('auth-btn');
      if (bearerToken) {
        b.textContent = '🔓 Authorized';
        b.classList.add('active');
      } else {
        b.textContent = '🔓 Authorize';
        b.classList.remove('active');
      }
    }
  </script>
</body>
</html>`;
}
