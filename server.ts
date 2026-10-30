import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { PRODUCTS, CATEGORIES } from './src/data/catalog.js';
import { generalApiLimiter, authRateLimiter, aiRateLimiter } from './src/server/middleware/rateLimiter.js';
import { ENDPOINTS_DOCS, generateSwaggerHtml } from './src/server/docsHtml.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

// Rate Limiting Middlewares (protect backend API, authentication, and AI quota)
app.use('/api', generalApiLimiter);
app.use('/api/auth', authRateLimiter);
app.use('/api/ai', aiRateLimiter);

// In-memory persistent stores with initial catalog
let productsDb = [...PRODUCTS];
let categoriesDb = [...CATEGORIES];
let ordersDb: any[] = [
  {
    id: 'ord-seed-1',
    orderNumber: 'RH-20261028-A492F',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    customerName: 'Samira Rahman',
    customerEmail: 'samira@example.com',
    customerPhone: '+8801711223344',
    shippingAddress: {
      addressLine: 'House 14, Road 5, Dhanmondi',
      city: 'Dhaka',
      postalCode: '1205',
      country: 'Bangladesh'
    },
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    paymentMethod: 'BKASH',
    items: [
      {
        id: 'item-1',
        productId: 'prod-002-silk-hijab',
        name: 'Pure Mulberry Silk Hijab — Rose Quartz',
        price: 2450,
        quantity: 1,
        total: 2450,
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 2450,
    shippingFee: 60,
    discount: 0,
    totalAmount: 2510,
    notes: 'bKash TrxID: 9MK29104LA'
  }
];
let reviewsDb: Record<string, any[]> = {};

// Server-side Gemini AI client initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// --- REST API ENDPOINTS ---

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'operational',
    service: 'Rauhie Shop Unified Production API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    catalogSize: productsDb.length,
    ordersCount: ordersDb.length,
    aiAvailable: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Swagger Interactive API Documentation
app.get('/api/docs', (req: Request, res: Response) => {
  const format = req.query.format as string;
  const acceptHeader = req.headers.accept || '';

  if (format === 'json' || acceptHeader.includes('application/json')) {
    const paths: Record<string, any> = {};

    for (const ep of ENDPOINTS_DOCS) {
      if (!paths[ep.path]) paths[ep.path] = {};

      const methodLower = ep.method.toLowerCase();
      paths[ep.path][methodLower] = {
        summary: ep.desc,
        tags: [ep.tag],
        parameters: ep.parameters?.map((p: any) => ({
          name: p.name,
          in: p.in,
          required: p.in === 'path',
          schema: { type: 'string' },
          description: p.desc,
        })) || [],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  example: ep.sampleResponse || { success: true },
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

    res.json({
      openapi: '3.0.0',
      info: {
        title: 'Rauhie Shop REST API Specification',
        version: '2.0.0',
        description: 'Complete OpenAPI 3.0 documentation for Rauhie Shop boutique e-commerce backend with rate limiting & Gemini AI.',
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Unified Full-Stack Express Server' },
      ],
      paths,
    });
    return;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(generateSwaggerHtml());
});

// Categories
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json({ success: true, data: categoriesDb });
});

// Products List with Search, Filter & Sort
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, sortBy } = req.query as Record<string, string>;

  let list = [...productsDb];

  if (category && category !== 'All') {
    list = list.filter(
      (p) =>
        p.category?.name?.toLowerCase() === category.toLowerCase() ||
        p.category?.slug?.toLowerCase() === category.toLowerCase() ||
        p.categoryId?.toLowerCase() === category.toLowerCase()
    );
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q) ||
        p.tags?.some((t: string) => t.toLowerCase().includes(q))
    );
  }

  if (sortBy === 'price_asc' || sortBy === 'low-to-high') {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc' || sortBy === 'high-to-low') {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === 'newest') {
    list.reverse();
  }

  res.json({ success: true, count: list.length, data: list });
});

// Product by ID
app.get('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const product = productsDb.find((p) => p.id === id || p.slug === id);
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }
  res.json({ success: true, data: product });
});

// Create Product (Admin)
app.post('/api/products', (req: Request, res: Response) => {
  const payload = req.body;
  if (!payload.name || payload.price === undefined) {
    res.status(400).json({ success: false, error: 'Name and price are required' });
    return;
  }

  const categoryObj = categoriesDb.find((c) => c.id === payload.categoryId) || {
    id: payload.categoryId || 'cat-general',
    name: 'General',
    slug: 'general',
  };

  const newProduct = {
    ...payload,
    id: `prod-${Date.now()}`,
    slug: (payload.name || 'product').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    price: Number(payload.price),
    compareAtPrice: payload.compareAtPrice ? Number(payload.compareAtPrice) : null,
    stock: Number(payload.stock ?? 20),
    sku: payload.sku || `RH-${Date.now().toString(36).toUpperCase()}`,
    category: categoryObj,
    categoryId: categoryObj.id,
    images: Array.isArray(payload.images) && payload.images.length > 0
      ? payload.images
      : [payload.imageUrl || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'],
    rating: 5.0,
    reviewCount: 0,
    isFeatured: Boolean(payload.isFeatured),
  };

  productsDb.unshift(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

// Update Product
app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = productsDb.findIndex((p) => p.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }

  productsDb[idx] = {
    ...productsDb[idx],
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : productsDb[idx].price,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : productsDb[idx].stock,
  };

  res.json({ success: true, data: productsDb[idx] });
});

// Delete Product
app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  productsDb = productsDb.filter((p) => p.id !== id);
  res.json({ success: true, message: 'Product removed' });
});

// Auth Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalized = (email || '').toLowerCase().trim();

  if (normalized === 'admin@rauhie.com' || normalized === 'superadmin@rauhieshop.com') {
    res.json({
      success: true,
      data: {
        user: {
          id: 'admin-super-id',
          name: 'Rauhie SuperAdmin',
          email: normalized,
          role: 'ADMIN',
          phone: '+8801710659435',
          address: '21 Sukrabad, Dhanmondi 32, Dhaka-1205',
        },
        token: `jwt-rauhie-admin-${Date.now()}`,
      },
    });
    return;
  }

  res.json({
    success: true,
    data: {
      user: {
        id: `user-${Date.now()}`,
        name: normalized.split('@')[0] || 'Valued Customer',
        email: normalized,
        role: 'CUSTOMER',
        phone: '+8801700000000',
        address: 'Dhaka, Bangladesh',
      },
      token: `jwt-rauhie-cust-${Date.now()}`,
    },
  });
});

// Auth Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, address } = req.body;
  res.status(201).json({
    success: true,
    data: {
      user: {
        id: `user-${Date.now()}`,
        name: name || 'Valued Customer',
        email: (email || '').toLowerCase().trim(),
        role: 'CUSTOMER',
        phone: phone || '',
        address: address || '',
      },
      token: `jwt-rauhie-cust-${Date.now()}`,
    },
  });
});

// Orders Placement
app.post('/api/orders', (req: Request, res: Response) => {
  const { customerName, customerEmail, customerPhone, shippingAddress, items, paymentMethod, shippingFee = 60, discount = 0, notes = '' } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, error: 'Cart items are required' });
    return;
  }

  // Stock deduction
  for (const item of items) {
    const prod = productsDb.find((p) => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, (prod.stock || 0) - item.quantity);
    }
  }

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  const orderNumber = `RH-${dateStr}-${randomStr}`;

  const subtotal = items.reduce((sum: number, it: any) => {
    const p = productsDb.find((prod) => prod.id === it.productId);
    return sum + (p ? p.price : it.price || 0) * it.quantity;
  }, 0);

  const totalAmount = Math.max(0, subtotal + Number(shippingFee) - Number(discount));

  const newOrder = {
    id: `ord-${Date.now()}`,
    orderNumber,
    createdAt: new Date().toISOString(),
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'UNPAID' : 'PAID',
    status: 'PROCESSING',
    items: items.map((i: any) => {
      const p = productsDb.find((prod) => prod.id === i.productId);
      return {
        id: `item-${Date.now()}-${i.productId}`,
        productId: i.productId,
        name: p ? p.name : i.name || 'Rauhie Item',
        price: p ? p.price : i.price || 0,
        quantity: i.quantity,
        total: (p ? p.price : i.price || 0) * i.quantity,
        image: p?.images?.[0] || i.image,
      };
    }),
    subtotal,
    shippingFee: Number(shippingFee),
    discount: Number(discount),
    totalAmount,
    notes,
  };

  ordersDb.unshift(newOrder);
  res.status(201).json({ success: true, data: newOrder });
});

// Orders List
app.get('/api/orders', (_req: Request, res: Response) => {
  res.json({ success: true, data: ordersDb });
});

// Update Order Status
app.patch('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;
  const order = ordersDb.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  if (status) order.status = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  res.json({ success: true, data: order });
});

// Admin Stats
app.get('/api/admin/stats', (_req: Request, res: Response) => {
  const totalRevenue = ordersDb
    .filter((o) => o.status !== 'CANCELLED' && o.paymentStatus !== 'REFUNDED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const lowStockProducts = productsDb.filter((p) => (p.stock || 0) <= 5);

  res.json({
    success: true,
    data: {
      metrics: {
        totalRevenue,
        totalOrders: ordersDb.length,
        totalProducts: productsDb.length,
        totalCustomers: 148,
        pendingOrders: ordersDb.filter((o) => o.status === 'PENDING').length,
        processingOrders: ordersDb.filter((o) => o.status === 'PROCESSING').length,
        deliveredOrders: ordersDb.filter((o) => o.status === 'DELIVERED').length,
      },
      lowStockProducts,
      recentOrders: ordersDb.slice(0, 5),
    },
  });
});

// Reviews
app.post('/api/reviews', (req: Request, res: Response) => {
  const { productId, rating, comment, author = 'Shopper' } = req.body;
  if (!productId || !comment) {
    res.status(400).json({ success: false, error: 'Product ID and comment are required' });
    return;
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    productId,
    author,
    rating: Number(rating || 5),
    comment,
    createdAt: new Date().toISOString(),
  };

  if (!reviewsDb[productId]) reviewsDb[productId] = [];
  reviewsDb[productId].unshift(newReview);

  // Update product review count
  const prod = productsDb.find((p) => p.id === productId);
  if (prod) {
    prod.reviewCount = (prod.reviewCount || 0) + 1;
  }

  res.status(201).json({ success: true, data: newReview });
});

// --- AI INTELLIGENCE ENDPOINTS (Powered by Gemini 3.8 Flash) ---

// 1. AI Gift Advisor
app.post('/api/ai/gift-advisor', async (req: Request, res: Response) => {
  const { recipient, occasion, budget, interests, styleNotes } = req.body;

  const catalogSummary = productsDb.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category.name,
    price: p.price,
    stock: p.stock,
    description: p.description,
    tags: p.tags,
  }));

  try {
    if (process.env.GEMINI_API_KEY) {
      const prompt = `You are the Lead Personal Luxury Concierge at Rauhie Shop (a high-end Bangladeshi boutique specializing in handcrafted jewelry, pure mulberry silk hijabs, luxury vegan leather handbags, artisan perfumes, and thoughtful gift sets).
A client wants a curated gift recommendation with the following preferences:
- Recipient: ${recipient || 'Loved one'}
- Occasion: ${occasion || 'Celebration'}
- Target Budget: ৳${budget || 'Flexible'} BDT
- Interests & Hobbies: ${interests || 'Elegance, fashion, accessories'}
- Special Vibe / Notes: ${styleNotes || 'Refined and thoughtful'}

Available Catalog:
${JSON.stringify(catalogSummary, null, 2)}

Provide recommendations from this catalog. Return ONLY valid JSON (no markdown formatting, no code blocks):
{
  "greeting": "Warm, personalized opening greeting for the shopper",
  "occasionInsight": "1-2 sentences explaining why this curated gift combination fits the occasion perfectly",
  "recommendations": [
    {
      "productId": "id from catalog",
      "whyItFits": "Compelling luxury styling reason",
      "curatorTip": "How to present or style this gift",
      "complimentaryItem": "Optional complementary product ID or suggestion"
    }
  ],
  "customGiftCardMessage": "A touching 2-line handwritten greeting card message suitable for the recipient and occasion",
  "giftWrappingSuggestion": "A sophisticated packaging detail (e.g., velvet pouch with rose gold ribbon, satin keepsake box)"
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      // Enrich recommendations with actual product details
      if (Array.isArray(parsed.recommendations)) {
        parsed.recommendations = parsed.recommendations.map((rec: any) => {
          const product = productsDb.find((p) => p.id === rec.productId);
          return { ...rec, product: product || productsDb[0] };
        });
      }

      res.json({ success: true, data: parsed, poweredBy: 'Gemini 3.8 Flash' });
      return;
    }
  } catch (err) {
    console.warn('Gemini AI fallback active:', err);
  }

  // Graceful rule-based fallback if Gemini API key is not yet set
  const filtered = productsDb.filter((p) => {
    if (budget && p.price > Number(budget) * 1.2) return false;
    return true;
  });

  const primary = filtered[0] || productsDb[0];
  const secondary = filtered[1] || productsDb[1];

  res.json({
    success: true,
    data: {
      greeting: `Welcome! Here are exquisite gift ideas handpicked for ${recipient || 'your loved one'}.`,
      occasionInsight: `For ${occasion || 'this special moment'}, timeless elegance and tactile luxury leave a lasting impression.`,
      recommendations: [
        {
          productId: primary.id,
          product: primary,
          whyItFits: `The ${primary.name} embodies graceful sophistication, perfect for commemorating ${occasion || 'cherished occasions'}.`,
          curatorTip: 'Pair with handwritten notes in our signature blush and gold keepsake box.',
        },
        {
          productId: secondary.id,
          product: secondary,
          whyItFits: `The ${secondary.name} offers premium daily versatility with standout craftsmanship.`,
          curatorTip: 'Lightly mist with our Fleur Silencieuse eau de parfum before gifting.',
        },
      ],
      customGiftCardMessage: `May this token of affection bring as much radiance and joy to your life as you bring to everyone around you.`,
      giftWrappingSuggestion: 'Blush silk ribbon tied around a deep purple velvet presentation box.',
    },
    poweredBy: 'Rauhie Curated Concierge',
  });
});

// 2. AI Style Matcher
app.post('/api/ai/style-match', async (req: Request, res: Response) => {
  const { productId, styleVibe } = req.body;
  const currentProduct = productsDb.find((p) => p.id === productId) || productsDb[0];

  const otherProducts = productsDb
    .filter((p) => p.id !== currentProduct.id)
    .map((p) => ({ id: p.id, name: p.name, category: p.category.name, price: p.price, description: p.description }));

  try {
    if (process.env.GEMINI_API_KEY) {
      const prompt = `You are a high-fashion stylist for Rauhie Shop Bangladesh.
The customer is viewing: "${currentProduct.name}" (${currentProduct.category.name}, ৳${currentProduct.price}).
Desired aesthetic/vibe: "${styleVibe || 'Elegance & Modern Modest Chic'}".

Available items for pairing:
${JSON.stringify(otherProducts, null, 2)}

Create an outfit ensemble. Return ONLY valid JSON:
{
  "lookTitle": "Evocative editorial name for the look (e.g., 'Sunset Tea in Gulshan' or 'Golden Hour Baroque')",
  "stylingPhilosophy": "2 sentences describing the color harmony and visual balance",
  "pairedProductIds": ["id1", "id2", "id3"],
  "fashionAdvice": "Practical styling advice on how to wear this ensemble together"
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      const pairedProducts = (parsed.pairedProductIds || [])
        .map((id: string) => productsDb.find((p) => p.id === id))
        .filter(Boolean);

      res.json({
        success: true,
        data: {
          lookTitle: parsed.lookTitle || 'The Signature Rauhie Silhouette',
          stylingPhilosophy: parsed.stylingPhilosophy,
          fashionAdvice: parsed.fashionAdvice,
          baseProduct: currentProduct,
          pairedProducts,
        },
      });
      return;
    }
  } catch (err) {
    console.warn('AI Style Matcher fallback:', err);
  }

  // Fallback pairing
  const complementary = productsDb.filter((p) => p.categoryId !== currentProduct.categoryId).slice(0, 3);
  res.json({
    success: true,
    data: {
      lookTitle: 'The Signature Rauhie Palette',
      stylingPhilosophy: 'Balancing muted blush tones with warm gold accents creates a cohesive, effortlessly polished statement.',
      fashionAdvice: `Wear the ${currentProduct.name} as the centerpiece, elevated with harmonious textures from our jewelry and modest fashion collections.`,
      baseProduct: currentProduct,
      pairedProducts: complementary,
    },
  });
});

// 3. AI Smart Natural-Language Search
app.post('/api/ai/smart-search', async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query || !query.trim()) {
    res.json({ success: true, matches: productsDb });
    return;
  }

  try {
    if (process.env.GEMINI_API_KEY) {
      const prompt = `A shopper entered the natural language search: "${query}".
Evaluate the catalog below and rank the most relevant products (up to 6 items).
Catalog:
${JSON.stringify(productsDb.map((p) => ({ id: p.id, name: p.name, category: p.category.name, price: p.price, description: p.description, tags: p.tags })))}

Return ONLY valid JSON:
{
  "interpretation": "Short phrase summarizing what the user is looking for",
  "matchedIds": ["id1", "id2"],
  "helpfulTip": "Helpful tip for the shopper"
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      const matches = (parsed.matchedIds || [])
        .map((id: string) => productsDb.find((p) => p.id === id))
        .filter(Boolean);

      res.json({
        success: true,
        interpretation: parsed.interpretation,
        helpfulTip: parsed.helpfulTip,
        matches: matches.length > 0 ? matches : productsDb.slice(0, 4),
      });
      return;
    }
  } catch (e) {
    console.warn('Smart search fallback:', e);
  }

  // Fast text matching fallback
  const q = query.toLowerCase();
  const matched = productsDb.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags?.some((t: string) => t.toLowerCase().includes(q))
  );

  res.json({
    success: true,
    interpretation: `Results for "${query}"`,
    matches: matched.length > 0 ? matched : productsDb,
  });
});

// --- VITE DEV MIDDLEWARE & PRODUCTION STATIC SERVING ---
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Only listen when executed directly (not when required/imported as serverless function)
  if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Rauhie Shop] Production full-stack server running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

export default app;
