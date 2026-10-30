# Rauhie Shop — Backend API

Production-ready e-commerce backend built with **Next.js 15 (App Router Route Handlers)**, **Prisma ORM**, and **PostgreSQL** (designed natively for **Vercel Postgres** / **Neon Serverless**).

---

## 🚀 Features

- **Framework**: Next.js 15 App Router API Route Handlers (Serverless on Vercel)
- **Database & ORM**: PostgreSQL with Prisma ORM (Zero-config connection pooling for serverless)
- **Authentication**: JWT tokens signed with `jose` (Edge-compatible) and secure password hashing with `bcryptjs`
- **Role-Based Access**: Role management (`CUSTOMER` & `ADMIN`)
- **Data Validation**: Strict schema validation using `Zod`
- **E-Commerce Modules**:
  - **Products**: Full catalog, pagination, keyword search, price range filtering, featured products, category filters, and inventory control.
  - **Categories**: Category listing and management with dynamic product counts.
  - **Orders**: Multi-item order placement, transaction-safe stock deductions, guest checkout & authenticated checkout, status tracking (`PENDING`, `PROCESSING`, `SHIPPED`, etc.).
  - **Cart**: User persistent cart management (add, update quantity, remove, clear).
  - **Health Check**: Server and database connection diagnostics (`/api/health`).

---

## 📁 Directory Structure

```
backend/
├── prisma/
│   └── schema.prisma         # PostgreSQL schema (Users, Products, Categories, Orders, Cart, Reviews)
├── scripts/
│   └── seed.mjs              # Database seed script for initial categories and sample products
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/         # Register, Login, Me
│   │   │   ├── cart/         # Shopping cart operations
│   │   │   ├── categories/   # Category CRUD
│   │   │   ├── health/       # Health check
│   │   │   ├── orders/       # Order creation, order tracking, admin status updates
│   │   │   └── products/     # Product catalog, filtering, admin management
│   │   ├── layout.tsx
│   │   └── page.tsx          # API dashboard and interactive documentation
│   └── lib/
│       ├── auth.ts           # Token verification & password utilities
│       ├── prisma.ts         # Global singleton Prisma client
│       ├── response.ts       # Standardized API response formatters
│       └── validations/      # Zod validation schemas
├── .env.example
├── next.config.mjs
├── package.json
└── tsconfig.json
```

---

## 🛠️ Getting Started

### 1. Configure Database Connection

Create or edit `backend/.env`:

```env
# Database connection string (Neon, Vercel Postgres, Supabase, or local Postgres)
DATABASE_URL="postgresql://user:password@ep-sample-12345.region.aws.neon.tech/neondb?sslmode=require"

# JWT Secret
JWT_SECRET="your_secure_random_secret_string"
JWT_EXPIRES_IN="7d"

# Server Port (default: 4000)
PORT=4000
```

### 2. Push Schema & Generate Prisma Client

```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

### 3. Seed Initial Products & Categories

To populate the database with default categories (Jewelry, Modest Wear, Handbags, Fragrances) and sample products:

```bash
npm run seed
```

Default seeded admin credentials:
- **Email**: `admin@rauhie.com`
- **Password**: `Admin@Rauhie2026`

### 4. Run Development Server

```bash
npm run dev
```

The API dashboard will be live at `http://localhost:4000`.

---

## ☁️ Deploying to Vercel

1. **Option A: Vercel CLI**
   ```bash
   cd backend
   npx vercel
   ```

2. **Option B: GitHub / Git Push**
   - Push your repository to GitHub / GitLab.
   - Import the project into Vercel and set the **Root Directory** to `backend`.
   - In the Vercel dashboard:
     - Go to the **Storage** tab and click **Create Database** -> **Postgres** (Powered by Neon).
     - Link the database to your project. Vercel will automatically inject `DATABASE_URL` / `POSTGRES_PRISMA_URL`.
     - In the project's **Settings > Environment Variables**, add `JWT_SECRET`.
   - Vercel automatically runs `prisma generate && next build` on deploy!

---

## 📡 API Reference

### Health Check
- `GET /api/health`: System status, uptime, and database connectivity.

### Authentication
- `POST /api/auth/register`: Register new user (`name`, `email`, `password`, `phone`, `address`).
- `POST /api/auth/login`: Authenticate user (`email`, `password`) -> Returns JWT token.
- `GET /api/auth/me`: Get current user profile (`Authorization: Bearer <token>`).

### Products
- `GET /api/products`: Query products.
  - Query params: `page`, `limit`, `search`, `categoryId`, `minPrice`, `maxPrice`, `isFeatured`, `sortBy` (`newest`, `price_asc`, `price_desc`, `name_asc`).
- `GET /api/products/:id`: Get product details by UUID or slug.
- `POST /api/products`: Create product (Admin only).
- `PUT /api/products/:id`: Update product (Admin only).
- `DELETE /api/products/:id`: Delete product (Admin only).

### Categories
- `GET /api/categories`: List all categories with product counts.
- `POST /api/categories`: Create category (Admin only).

### Orders
- `GET /api/orders`: List orders (Customer sees their own, Admin sees all).
- `POST /api/orders`: Create an order with items, shipping info, and payment method. Automatically validates and decrements stock.
- `GET /api/orders/:id`: Get order details by ID or order number (`RH-YYYYMMDD-XXXXX`).
- `PATCH /api/orders/:id`: Update order status or payment status (Admin only).

### Shopping Cart
- `GET /api/cart`: Get authenticated user's cart.
- `POST /api/cart`: Add or update product quantity (`productId`, `quantity`).
- `DELETE /api/cart`: Remove product from cart (`?productId=...`) or clear cart.

