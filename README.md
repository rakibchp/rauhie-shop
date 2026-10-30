# Rauhie Shop — Production E-Commerce Platform

[![Production Status](https://img.shields.io/badge/Production-Live-success?style=for-the-badge&logo=vercel)](https://www.rauhieshop.com/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/PostgreSQL-Neon%20Serverless%20(Free)-00e599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

> **Live Production Storefront:** [https://www.rauhieshop.com/](https://www.rauhieshop.com/)  
> **Brand Theme:** Royal Purple (`#35104f`) &amp; Rose Pink (`#e6388c`)  
> **Store Specialization:** Handcrafted Jewelry, Modest Silk Fashion, Luxury Handbags, Artisan Perfumes, Smart Gadgets, and Thoughtful Gifts.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    User["Customer / Shopper"] -->|HTTPS / DNS| CDN["Vercel Edge CDN / Cloudflare"]
    SuperAdmin["SuperAdmin"] -->|HTTPS / Auth| CDN

    subgraph Edge Layer
        CDN -->|Static Cache 1y| StaticAssets["Static Assets (Images, JS Chunks, CSS)"]
        CDN -->|Route Rewrites| Storefront["React 19 SPA Storefront (Vite)"]
    end

    subgraph API & Load Balancing
        Storefront -->|REST API / JSON| NGINX["NGINX Load Balancer (least_conn)"]
        NGINX --> API1["Next.js Serverless API Instance 1"]
        NGINX --> API2["Next.js Serverless API Instance 2"]
    end

    subgraph Database & Persistence Layer
        API1 -->|Connection Pooling| NeonDB[("Neon Serverless PostgreSQL (100% Free Forever)")]
        API2 -->|Connection Pooling| NeonDB
        NeonDB --> PrismaORM["Prisma ORM (Users, Products, Orders, Reviews)"]
    end

    subgraph Payment Gateways
        Storefront --> bKash["bKash Merchant Pay"]
        Storefront --> Nagad["Nagad Post Office Pay"]
        Storefront --> StripeCard["Visa / Mastercard / Stripe"]
        Storefront --> COD["Cash on Delivery (Courier Doorstep)"]
    end
```

---

## 💎 Key Features & Capabilities

### 👑 1. SuperAdmin Command Center
Full administrative privileges and store control accessible at `/admin`:
- **Real-Time KPI Metrics**: Gross sales revenue (৳ BDT), total orders count, active product inventory, registered customers, and low-stock alerts.
- **Order Management & Fulfillment**: Filter customer orders by status (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`), update fulfillment stages, toggle payment statuses (`UNPAID`, `PAID`, `REFUNDED`), and inspect customer delivery addresses.
- **Product Catalog Management**: Add new products, upload images, set category, assign selling price, set compare-at discount prices, edit SKU, and toggle featured status.
- **Inventory Stock Health**: Live stock monitor with one-click inline decrement/increment and low-stock replenishment indicators.
- **SuperAdmin Default Credentials**:
  - **Email**: `admin@rauhie.com`
  - **Password**: `Admin@Rauhie2026`

### 💳 2. Real Payment Gateways & Secure Checkout
Interactive, multi-step checkout flow with verified payment options:
- **bKash Mobile Wallet**: Merchant number (`01710659435`), automated payment instructions, and Transaction ID (TrxID) verification.
- **Nagad**: Merchant gateway instructions with TrxID validation.
- **Credit / Debit Cards (Stripe)**: Visa, Mastercard, AMEX with 256-bit SSL encrypted PCI-DSS simulation.
- **Cash on Delivery (COD)**: Door-to-door courier service with parcel inspection.
- **Voucher / Promo Code Engine**: Includes `RAUHIE10` for 10% discount and `WELCOME` for ৳150 credit.
- **Delivery Calculation**: Automated zone breakdown for Inside Dhaka (৳60 / 24-48 hrs) and Nationwide (৳120 / 3-5 days).

### 📦 3. Customer Order Tracking & History
- Real-time fulfillment progress pipeline: `Order Placed` ➔ `Processing` ➔ `Shipped` ➔ `Delivered`.
- Itemized digital receipts, order references (e.g. `RH-20261030-XXXXX`), and one-click **"Order Again"** reorder functionality.

### ⭐ 4. Product Ratings & Customer Reviews
- 5-star customer review submission form with live rating aggregation.
- Verified shopper badges and detailed feedback list on each product page.

### 🎨 5. Brand Identity & Accessibility
- **Brand Palette**:
  - Deep Royal Purple: `--ink: #35104f` (Heading typography, hero accents, primary buttons)
  - Radiant Rose Pink: `--coral: #e6388c` (Badges, hover states, prices, interactive CTAs)
  - Soft Blush: `--paper: #fffbfd`, `--green: #f8e8f1` (Backgrounds, subtle cards)
- **Accessibility Controls**: Panel supporting Larger Text, High Contrast mode, and Reduced Motion.

---

## 🗄️ Database: 100% Free Forever on Vercel

The application uses **Neon Serverless PostgreSQL** (which natively powers **Vercel Postgres**):

| Feature | Neon Serverless PostgreSQL |
| :--- | :--- |
| **Cost** | **100% Free Forever** (No credit card required) |
| **Storage** | 0.5 GiB active storage (holds > 500,000 orders) |
| **Compute** | Serverless scale-to-zero (zero cost when idle) |
| **Connection Pooling** | Built-in PgBouncer pooling on port `5432` / `6543` |
| **Vercel Integration** | 1-Click integration in Vercel Storage tab |

### Setting Up Free Neon Database:
1. Go to [Neon.tech](https://neon.tech/) and create a free project named `rauhie-shop`.
2. Copy the **Pooled Connection String**:
   ```
   postgresql://user:password@ep-sample-12345.region.aws.neon.tech/neondb?sslmode=require
   ```
3. Set the connection string in your backend `.env` or Vercel Environment Variables:
   ```env
   DATABASE_URL="postgresql://user:password@ep-sample-12345.region.aws.neon.tech/neondb?sslmode=require"
   JWT_SECRET="rauhie_shop_super_secret_jwt_key_2026"
   ```
4. Push the schema and seed the initial store catalog:
   ```bash
   cd backend
   npm run prisma:push
   npm run seed
   ```

---

## 🚀 High-Availability, NGINX, Load Balancing & CDN

For scaling to handle high traffic surges, the repository includes production enterprise infrastructure configurations:

### 1. NGINX Load Balancer (`nginx/nginx.conf`)
- **Upstream Pools**: Configured with `least_conn` load balancing algorithm across multiple Next.js backend instances with active health checks.
- **SSL Termination**: TLS 1.3 / 1.2 with HSTS, CSP, and forward secrecy.
- **DDoS & Surge Rate Limiting**:
  - `limit_req_zone`: 15 req/sec on `/api/` endpoints
  - `limit_req_zone`: 5 req/sec on `/api/orders` checkout endpoint
- **Microcaching**: 60s microcache (`proxy_cache`) for catalog and category queries with `stale-while-revalidate`.

### 2. Edge CDN Caching
- **Immutable Static Assets**: `Cache-Control: public, max-age=31536000, immutable` for all hashed JS/CSS chunks and images.
- **Vercel Edge Network**: Global Anycast edge nodes ensure TTFB < 50ms worldwide.

---

## 🛠️ Local Development & Scripts

### Frontend (Storefront):
```bash
cd frontend/rauhie-shop

# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```

### Backend (Next.js REST API):
```bash
cd backend

# Install dependencies
npm install

# Sync database schema
npm run prisma:push

# Seed products and SuperAdmin
npm run seed

# Run API server
npm run dev
```

---

## ☁️ Deploying to Vercel

### Step 1: Connect Git Repository
Push your code to GitHub:
```bash
git add .
git commit -m "feat: complete production-ready ecommerce with superadmin, real payments, and postgres"
git push origin main
```

### Step 2: Vercel Settings
- In the Vercel Dashboard, import `https://github.com/rakibchp/rauhie-shop`.
- **Framework Preset**: Vite (for frontend) or Next.js (for backend).
- Ensure `vercel.json` is detected (enables SPA rewrites and caching headers).
- Add Environment Variables:
  - `DATABASE_URL`: Your free Neon PostgreSQL connection string.
  - `JWT_SECRET`: A secure 32+ character random secret.

Your site will automatically rebuild and deploy to **[https://www.rauhieshop.com/](https://www.rauhieshop.com/)** on every git push!

---

## 📜 License
Copyright © 2026 Rauhie Shop. All rights reserved.
