/**
 * Rauhie Shop — Authentic Product Catalog & Categories
 * Central data source shared across Client and Serverless Backend
 */

export const CATEGORIES = [
  { id: 'cat-jewelry', name: 'Jewelry & Accessories', slug: 'jewelry-accessories', icon: 'Sparkles', count: 2 },
  { id: 'cat-modest', name: 'Modest Wear & Hijabs', slug: 'modest-wear-hijabs', icon: 'Layers', count: 2 },
  { id: 'cat-handbags', name: 'Luxury Handbags', slug: 'luxury-handbags', icon: 'ShoppingBag', count: 2 },
  { id: 'cat-beauty', name: 'Fragrance & Beauty', slug: 'fragrance-beauty', icon: 'Heart', count: 2 },
  { id: 'cat-gadgets', name: 'Smart Gadgets', slug: 'smart-gadgets', icon: 'Smartphone', count: 1 },
  { id: 'cat-gifts', name: 'Toys & Thoughtful Gifts', slug: 'toys-thoughtful-gifts', icon: 'Gift', count: 2 },
];

export const PRODUCTS = [
  {
    id: 'prod-001-pearl-earrings',
    name: 'Gilded Freshwater Pearl Drop Earrings',
    slug: 'gilded-freshwater-pearl-drop-earrings',
    category: { id: 'cat-jewelry', name: 'Jewelry & Accessories', slug: 'jewelry-accessories' },
    categoryId: 'cat-jewelry',
    price: 1850,
    compareAtPrice: 2400,
    sku: 'RH-JW-001',
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
    ],
    description: '18K gold-plated handcrafted freshwater baroque pearl drop earrings. Delicate, luminous, and hypoallergenic for daily elegance.',
    isFeatured: true,
    rating: 4.9,
    reviewCount: 18,
    tags: ['pearl', 'gold', 'earrings', 'jewelry', 'handmade', 'gift', 'luxury']
  },
  {
    id: 'prod-002-silk-hijab',
    name: 'Pure Mulberry Silk Hijab — Rose Quartz',
    slug: 'pure-mulberry-silk-hijab-rose-quartz',
    category: { id: 'cat-modest', name: 'Modest Wear & Hijabs', slug: 'modest-wear-hijabs' },
    categoryId: 'cat-modest',
    price: 2450,
    compareAtPrice: 2950,
    sku: 'RH-MW-002',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80'
    ],
    description: '100% natural Grade 6A pure mulberry silk scarf with hand-rolled edges. Breathable, featherlight, and gentle on sensitive hair.',
    isFeatured: true,
    rating: 5.0,
    reviewCount: 32,
    tags: ['silk', 'hijab', 'modest', 'rose', 'accessories', 'luxury']
  },
  {
    id: 'prod-003-baguette-bag',
    name: 'Structured Latte Baguette Shoulder Bag',
    slug: 'structured-latte-baguette-shoulder-bag',
    category: { id: 'cat-handbags', name: 'Luxury Handbags', slug: 'luxury-handbags' },
    categoryId: 'cat-handbags',
    price: 3650,
    compareAtPrice: 4500,
    sku: 'RH-HB-003',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Crafted from premium vegan saffiano leather with polished brushed-gold hardware and adjustable shoulder strap. Includes interior zipped pocket.',
    isFeatured: true,
    rating: 4.8,
    reviewCount: 14,
    tags: ['handbag', 'baguette', 'vegan leather', 'latte', 'fashion']
  },
  {
    id: 'prod-004-perfume',
    name: 'Fleur Silencieuse Eau de Parfum (50ml)',
    slug: 'fleur-silencieuse-eau-de-parfum-50ml',
    category: { id: 'cat-beauty', name: 'Fragrance & Beauty', slug: 'fragrance-beauty' },
    categoryId: 'cat-beauty',
    price: 3950,
    compareAtPrice: 4800,
    sku: 'RH-FR-004',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Artisan fragrance with blooming white jasmine, crisp bergamot, velvet Bulgarian rose, and a base of warm cashmere amber.',
    isFeatured: true,
    rating: 4.9,
    reviewCount: 27,
    tags: ['perfume', 'fragrance', 'jasmine', 'rose', 'gift', 'beauty']
  },
  {
    id: 'prod-005-wireless-charger',
    name: 'AuraFast 3-in-1 Magnetic Charging Station',
    slug: 'aurafast-3-in-1-magnetic-charging-station',
    category: { id: 'cat-gadgets', name: 'Smart Gadgets', slug: 'smart-gadgets' },
    categoryId: 'cat-gadgets',
    price: 2850,
    compareAtPrice: 3500,
    sku: 'RH-GD-005',
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597359-bb43b819f077?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Sleek aluminum folding charging dock for smartphone, earbuds, and smartwatch with intelligent heat dispersion and ambient LED indicator.',
    isFeatured: false,
    rating: 4.7,
    reviewCount: 19,
    tags: ['gadgets', 'charger', 'tech', 'wireless', 'desk', 'gift']
  },
  {
    id: 'prod-006-gift-box',
    name: 'Blushing Blossom Keepsake Gift Hamper',
    slug: 'blushing-blossom-keepsake-gift-hamper',
    category: { id: 'cat-gifts', name: 'Toys & Thoughtful Gifts', slug: 'toys-thoughtful-gifts' },
    categoryId: 'cat-gifts',
    price: 3200,
    compareAtPrice: 3800,
    sku: 'RH-GF-006',
    stock: 9,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Curated gift bundle containing scented soy wax candle, rose quartz facial roller, artisanal bath salts, and a handwritten calligraphy gift card.',
    isFeatured: true,
    rating: 5.0,
    reviewCount: 41,
    tags: ['hamper', 'gift set', 'candle', 'rose quartz', 'keepsake', 'anniversary']
  },
  {
    id: 'prod-007-choker-necklace',
    name: 'Celestial Starlight Pendant Necklace',
    slug: 'celestial-starlight-pendant-necklace',
    category: { id: 'cat-jewelry', name: 'Jewelry & Accessories', slug: 'jewelry-accessories' },
    categoryId: 'cat-jewelry',
    price: 1650,
    compareAtPrice: 2100,
    sku: 'RH-JW-007',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Dainty cubic zirconia starburst pendant suspended from an 18K gold-vermeil cable chain. Tarnish-free water-resistant coating.',
    isFeatured: false,
    rating: 4.8,
    reviewCount: 11,
    tags: ['necklace', 'gold', 'jewelry', 'starburst', 'pendant']
  },
  {
    id: 'prod-008-mini-crossbody',
    name: 'Petite Quilted Crossbody Bag — Blush Pink',
    slug: 'petite-quilted-crossbody-bag-blush-pink',
    category: { id: 'cat-handbags', name: 'Luxury Handbags', slug: 'luxury-handbags' },
    categoryId: 'cat-handbags',
    price: 2950,
    compareAtPrice: 3600,
    sku: 'RH-HB-008',
    stock: 4,
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Quilted micro-crossbody with golden chain strap, turn-lock clasp, and soft microfiber lining. Fits phones and essentials comfortably.',
    isFeatured: false,
    rating: 4.6,
    reviewCount: 8,
    tags: ['handbag', 'crossbody', 'quilted', 'pink', 'fashion']
  },
  {
    id: 'prod-009-velvet-matte-lipstick-set',
    name: 'Velvet Rosebud Lip Duo & Tint',
    slug: 'velvet-rosebud-lip-duo-and-tint',
    category: { id: 'cat-beauty', name: 'Fragrance & Beauty', slug: 'fragrance-beauty' },
    categoryId: 'cat-beauty',
    price: 1450,
    compareAtPrice: 1850,
    sku: 'RH-BT-009',
    stock: 19,
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Hydrating botanical matte lipstick infused with jojoba oil and vitamin E, paired with an ultra-dewy rose cheek & lip tint.',
    isFeatured: true,
    rating: 4.9,
    reviewCount: 15,
    tags: ['lipstick', 'beauty', 'makeup', 'rose', 'tint', 'cosmetics']
  },
  {
    id: 'prod-010-chiffon-hijab-crepe',
    name: 'Textured Georgette Chiffon Scarf — Lilac Mist',
    slug: 'textured-georgette-chiffon-scarf-lilac-mist',
    category: { id: 'cat-modest', name: 'Modest Wear & Hijabs', slug: 'modest-wear-hijabs' },
    categoryId: 'cat-modest',
    price: 1250,
    compareAtPrice: 1600,
    sku: 'RH-MW-010',
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Non-slip premium georgette chiffon scarf in gentle lilac mist. Lightweight, opaque when folded, and durable for all-day draping.',
    isFeatured: false,
    rating: 4.8,
    reviewCount: 21,
    tags: ['hijab', 'chiffon', 'modest', 'lilac', 'scarf']
  }
];
