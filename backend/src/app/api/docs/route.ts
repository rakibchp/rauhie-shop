import { NextResponse } from 'next/server';
import { ENDPOINTS_DATA } from './page';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');

  // Return OpenAPI 3.0.0 JSON specification
  if (format === 'json' || request.headers.get('accept')?.includes('application/json')) {
    const paths: Record<string, any> = {};

    for (const ep of ENDPOINTS_DATA) {
      if (!paths[ep.path]) paths[ep.path] = {};

      const methodLower = ep.method.toLowerCase();
      paths[ep.path][methodLower] = {
        summary: ep.desc,
        tags: [ep.tag],
        parameters: ep.parameters?.map((p) => ({
          name: p.name,
          in: p.in,
          required: p.required,
          schema: { type: p.type },
          description: p.desc,
        })) || [],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  example: ep.sampleResponse,
                },
              },
            },
          },
          '429': {
            description: 'Too Many Requests - Rate limit exceeded',
          },
        },
      };

      if (ep.requestBody) {
        paths[ep.path][methodLower].requestBody = {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                example: ep.requestBody,
              },
            },
          },
        };
      }
    }

    return NextResponse.json({
      openapi: '3.0.0',
      info: {
        title: 'Rauhie Shop REST API Engine',
        version: '2.0.0',
        description: 'Comprehensive Swagger/OpenAPI documentation for Rauhie Shop serverless endpoints.',
      },
      servers: [
        { url: '/', description: 'Current Environment' },
      ],
      paths,
    });
  }

  // Redirect or serve HTML documentation
  return new Response(generateSwaggerHtml(), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function generateSwaggerHtml() {
  const jsonEndpoints = JSON.stringify(ENDPOINTS_DATA);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rauhie Shop API Docs — Swagger Interface</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; }
    header { background: #1e293b; border-bottom: 1px solid #334155; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 20px; font-weight: 800; color: #e6388c; }
    .container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
    h1 { font-size: 28px; margin-bottom: 8px; color: #f8fafc; }
    p { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
    .tag-filter { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .tag-btn { background: #1e293b; border: 1px solid #334155; color: #cbd5e1; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .tag-btn.active, .tag-btn:hover { background: #e6388c; border-color: #e6388c; color: #fff; }
    .endpoint-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
    .endpoint-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; cursor: pointer; }
    .endpoint-title { display: flex; align-items: center; gap: 12px; }
    .badge { padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 800; color: #fff; }
    .GET { background: #0284c7; }
    .POST { background: #16a34a; }
    .PUT { background: #d97706; }
    .PATCH { background: #0d9488; }
    .DELETE { background: #dc2626; }
    .path { font-family: monospace; font-size: 14px; font-weight: 600; }
    .desc { color: #94a3b8; font-size: 13px; }
    .auth-badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #0f172a; color: #cbd5e1; }
    .endpoint-body { padding: 20px; border-top: 1px solid #334155; background: #0f172a50; display: none; }
    .endpoint-body.open { display: block; }
    .btn-try { background: #e6388c; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; margin-top: 12px; }
    .btn-copy { background: #0f172a; border: 1px solid #334155; color: #cbd5e1; padding: 4px 10px; border-radius: 5px; font-size: 11px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: all .15s ease; user-select: none; }
    .btn-copy:hover { background: #1e293b; border-color: #e6388c; color: #fff; }
    .btn-copy.copied { background: rgba(34, 197, 94, 0.15); border-color: #22c55e; color: #4ade80; }
    pre { background: #0f172a; padding: 12px; border-radius: 6px; border: 1px solid #334155; font-size: 12px; overflow-x: auto; color: #38bdf8; margin-top: 8px; }
  </style>
</head>
<body>
  <header>
    <div class="brand">Rauhie Shop REST API</div>
    <div>
      <a href="?format=json" target="_blank" style="color: #cbd5e1; text-decoration: none; font-size: 13px; font-weight: 600; padding: 6px 12px; background: #334155; border-radius: 6px;">OpenAPI JSON ↗</a>
    </div>
  </header>
  <div class="container">
    <h1>API Specification &amp; Interactive Explorer</h1>
    <p>Live interactive Swagger-like interface documenting all 24 backend endpoints including rate limiting, products, authentication, orders, and Gemini AI shopping concierge.</p>

    <div id="endpoint-list"></div>
  </div>

  <script>
    const endpoints = ${jsonEndpoints};
    const list = document.getElementById('endpoint-list');

    endpoints.forEach((ep, idx) => {
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
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Sample Response:</div>
            <button type="button" id="copy-sample-\${idx}" class="btn-copy" onclick="copySnippet('pre-sample-\${idx}', 'copy-sample-\${idx}')" title="Copy response JSON to clipboard" aria-label="Copy sample JSON">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span>Copy Response</span>
            </button>
          </div>
          <pre id="pre-sample-\${idx}">\${JSON.stringify(ep.sampleResponse || {}, null, 2)}</pre>
          <button class="btn-try" onclick="testEndpoint('\${ep.method}', '\${ep.path}', \${idx})">⚡ Execute Live Test</button>
          <div id="result-\${idx}" style="margin-top: 12px; display: none;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
              <div style="font-size: 12px; color: #4ade80; font-weight: 600;">Live Response:</div>
              <button type="button" id="copy-live-\${idx}" class="btn-copy" onclick="copySnippet('pre-\${idx}', 'copy-live-\${idx}')" title="Copy response JSON to clipboard" aria-label="Copy live JSON">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                <span>Copy Response</span>
              </button>
            </div>
            <pre id="pre-\${idx}"></pre>
          </div>
        </div>
      \`;
      list.appendChild(card);
    });

    function toggle(idx) {
      const el = document.getElementById('body-' + idx);
      el.classList.toggle('open');
    }

    async function testEndpoint(method, path, idx) {
      const resultDiv = document.getElementById('result-' + idx);
      const pre = document.getElementById('pre-' + idx);
      resultDiv.style.display = 'block';
      pre.textContent = 'Loading...';
      try {
        const testPath = path.replace(':id', 'prod-001-pearl-earrings');
        const res = await fetch(testPath, { method });
        const json = await res.json().catch(() => ({ status: res.status }));
        pre.textContent = JSON.stringify(json, null, 2);
      } catch (err) {
        pre.textContent = 'Error: ' + err.message;
      }
    }

    function copySnippet(preId, btnId) {
      const pre = document.getElementById(preId);
      const btn = document.getElementById(btnId);
      if (!pre || !btn) return;
      const text = pre.textContent || '';
      const onDone = () => {
        btn.classList.add('copied');
        btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Copied!</span>';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>Copy Response</span>';
        }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onDone).catch(() => fallbackCopy(text, onDone));
      } else {
        fallbackCopy(text, onDone);
      }
    }

    function fallbackCopy(text, cb) {
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
  </script>
</body>
</html>`;
}
