import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Rauhie Shop Database with production catalog & admin...');

  // 1. Create SuperAdmin User
  const adminPasswordHash = await bcrypt.hash('Admin@Rauhie2026', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rauhie.com' },
    update: {
      role: 'ADMIN',
      passwordHash: adminPasswordHash,
    },
    create: {
      name: 'Rauhie SuperAdmin',
      email: 'admin@rauhie.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      phone: '+8801710659435',
      address: '21 Sukrabad, Dhanmondi 32, Dhaka-1205',
    },
  });
  console.log('✓ SuperAdmin verified:', admin.email);

  // 2. Create Sample Customer User
  const customerPasswordHash = await bcrypt.hash('Customer@123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'shopper@rauhie.com' },
    update: {},
    create: {
      name: 'Ayesha Rahman',
      email: 'shopper@rauhie.com',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      phone: '+8801711223344',
      address: 'House 14, Road 5, Dhanmondi, Dhaka',
    },
  });
  console.log('✓ Customer verified:', customer.email);

  // 3. Create Categories
  const categoriesData = [
    {
      name: 'Jewelry & Accessories',
      slug: 'jewelry-accessories',
      description: 'Elegant handcrafted jewelry, delicate earrings, and statement necklaces.',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Modest Wear & Hijabs',
      slug: 'modest-wear-hijabs',
      description: 'Premium silk and chiffon scarves, abayas, and contemporary modest fashion.',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Luxury Handbags',
      slug: 'luxury-handbags',
      description: 'Chic shoulder bags, minimalist totes, and everyday clutches.',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Fragrance & Beauty',
      slug: 'fragrance-beauty',
      description: 'Subtle artisan perfumes, body mists, and clean beauty essentials.',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Smart Gadgets',
      slug: 'smart-gadgets',
      description: 'High performance wireless accessories, charging docks, and modern tech.',
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Toys & Thoughtful Gifts',
      slug: 'toys-thoughtful-gifts',
      description: 'Curated gift hampers, keepsake boxes, puzzles, and plush toys.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const categoryMap = new Map();
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap.set(cat.slug, c);
  }
  console.log(`✓ Created ${categoryMap.size} categories`);

  // 4. Create Real Products
  const productsData = [
    {
      name: 'Gilded Freshwater Pearl Drop Earrings',
      slug: 'gilded-freshwater-pearl-drop-earrings',
      description: '18K gold-plated handcrafted freshwater baroque pearl drop earrings. Delicate, luminous, and hypoallergenic for daily elegance.',
      price: 1850,
      compareAtPrice: 2400,
      sku: 'RH-JW-001',
      stock: 24,
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      ],
      categoryId: categoryMap.get('jewelry-accessories').id,
      isFeatured: true,
    },
    {
      name: 'Pure Mulberry Silk Hijab — Rose Quartz',
      slug: 'pure-mulberry-silk-hijab-rose-quartz',
      description: '100% natural Grade 6A pure mulberry silk scarf with hand-rolled edges. Breathable, featherlight, and gentle on sensitive hair.',
      price: 2450,
      compareAtPrice: 2950,
      sku: 'RH-MW-002',
      stock: 35,
      images: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
      ],
      categoryId: categoryMap.get('modest-wear-hijabs').id,
      isFeatured: true,
    },
    {
      name: 'Structured Latte Baguette Shoulder Bag',
      slug: 'structured-latte-baguette-shoulder-bag',
      description: 'Crafted from premium vegan saffiano leather with polished brushed-gold hardware and adjustable shoulder strap. Includes interior zipped pocket.',
      price: 3650,
      compareAtPrice: 4500,
      sku: 'RH-HB-003',
      stock: 12,
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      ],
      categoryId: categoryMap.get('luxury-handbags').id,
      isFeatured: true,
    },
    {
      name: 'Fleur Silencieuse Eau de Parfum (50ml)',
      slug: 'fleur-silencieuse-eau-de-parfum-50ml',
      description: 'Artisan fragrance with blooming white jasmine, crisp bergamot, velvet Bulgarian rose, and a base of warm cashmere amber.',
      price: 3950,
      compareAtPrice: 4800,
      sku: 'RH-FR-004',
      stock: 18,
      images: [
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      ],
      categoryId: categoryMap.get('fragrance-beauty').id,
      isFeatured: true,
    },
    {
      name: 'AuraFast 3-in-1 Magnetic Charging Station',
      slug: 'aurafast-3-in-1-magnetic-charging-station',
      description: 'Sleek aluminum folding charging dock for smartphone, earbuds, and smartwatch with intelligent heat dispersion and ambient LED indicator.',
      price: 2850,
      compareAtPrice: 3500,
      sku: 'RH-GD-005',
      stock: 16,
      images: [
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80',
      ],
      categoryId: categoryMap.get('smart-gadgets').id,
      isFeatured: false,
    },
    {
      name: 'Blushing Blossom Keepsake Gift Hamper',
      slug: 'blushing-blossom-keepsake-gift-hamper',
      description: 'Curated gift bundle containing scented soy wax candle, rose quartz facial roller, artisanal bath salts, and a handwritten calligraphy gift card.',
      price: 3200,
      compareAtPrice: 3800,
      sku: 'RH-GF-006',
      stock: 9,
      images: [
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      ],
      categoryId: categoryMap.get('toys-thoughtful-gifts').id,
      isFeatured: true,
    },
  ];

  const createdProducts = [];
  for (const prod of productsData) {
    const p = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: prod,
      create: prod,
    });
    createdProducts.push(p);
  }
  console.log(`✓ Created ${createdProducts.length} products`);

  // 5. Create Sample Initial Verified Order
  const firstProd = createdProducts[0];
  const orderNumber = 'RH-20261028-A492F';
  const existingOrder = await prisma.order.findUnique({
    where: { orderNumber },
  });

  if (!existingOrder && firstProd) {
    await prisma.order.create({
      data: {
        orderNumber,
        userId: customer.id,
        customerName: 'Samira Rahman',
        customerEmail: 'samira@example.com',
        customerPhone: '+8801711223344',
        shippingAddress: {
          addressLine: 'House 14, Road 5, Dhanmondi',
          city: 'Dhaka',
          country: 'Bangladesh',
        },
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        paymentMethod: 'BKASH',
        subtotal: firstProd.price,
        shippingFee: 60,
        discount: 0,
        totalAmount: firstProd.price + 60,
        notes: 'bKash TrxID: 9MK29104LA',
        items: {
          create: [
            {
              productId: firstProd.id,
              name: firstProd.name,
              price: firstProd.price,
              quantity: 1,
              total: firstProd.price,
            },
          ],
        },
      },
    });
    console.log('✓ Created initial verified sample order:', orderNumber);
  }

  // 6. Create Initial Reviews
  if (firstProd) {
    await prisma.review.createMany({
      data: [
        {
          userId: customer.id,
          productId: firstProd.id,
          rating: 5,
          comment: 'Absolutely stunning pearl drop earrings! Beautiful luster and arrived within 24 hours in Dhaka.',
        },
      ],
      skipDuplicates: true,
    });
    console.log('✓ Created verified reviews');
  }

  console.log('✓ Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
