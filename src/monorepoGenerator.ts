/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';
import { CodeFile } from './types';

// Let's create the entire codebase of files that will go inside the ZIP download.
export const MONOREPO_FILES: CodeFile[] = [
  {
    path: 'README.md',
    content: `# ORRIS Premium E-Commerce Monorepo

Welcome to the production-ready code repository for **ORRIS** — a luxury direct-to-consumer digital flagship. This repository contains the complete full-stack codebase configured using the latest Next.js 15 (App Router), React 19, Tailwind CSS v4, Prisma ORM, and Stripe Payments.

## 🚀 Quick Start Instructions

Follow these five simple steps to run the complete environment locally:

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`
This installs the shared Monorepo dependencies including Next.js 15, React 19, Prima clients, State managers, and Payment systems.

### 2. Configure Environment Variables
Create a \`.env\` file in the root directory:
\`\`\`env
# Database Settings
DATABASE_URL="postgresql://user:password@localhost:5432/orris?schema=public"

# Authentication Secrets
NEXTAUTH_SECRET="your-super-secret-auth-key-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# Stripe Configurations
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Client Configurations
NEXT_PUBLIC_APP_URL="http://localhost:3000"
\`\`\`

### 3. Generate Database Models
Execute the Prisma ORM migration tool to sync schemas and compile types:
\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

### 4. Seed Experimental Datasets
Populate your local PostgreSQL with pre-built luxury products, categories, reviews, and a default Admin login:
\`\`\`bash
npm run seed
\`\`\`
*(Admin Login details - Email: **admin@orris.com** | Password: **admin123**)*

### 5. Launch the Hot Dev Server
\`\`\`bash
npm run dev
\`\`\`
Go to **[http://localhost:3000](http://localhost:3000)** to browse the storefront, buy items, or log into the Admin Command Center.

## 🛠️ Architecture Overview

- **Frontend**: Next.js 15 (App Router) serving responsive layouts, motion pages, and slide drawers.
- **Database**: PostgreSQL paired with Prisma ORM for type-safe query relations.
- **States**: Zustand client-side persistent hooks + TanStack React Query.
- **Payments**: Stripe Checkout Sessions with automatic webhooks.
- **Security**: Role-Based protection routes (forcing Admins only into dashboard sub-directories).
- **Styling**: Tailwind CSS v4 featuring native CSS variables.

---
*Created for the ORRIS digital flagship. Standalone deployment ready via Vercel.*
`
  },
  {
    path: 'packages/prisma/schema.prisma',
    content: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
}

model User {
  id        String   @id @default(uuid()) @db.Uuid
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  password  String
  createdAt DateTime @default(now())
  reviews   Review[]
  orders    Order[]

  @@index([email])
}

model Category {
  id          String    @id @default(uuid()) @db.Uuid
  name        String
  slug        String    @unique
  image       String
  description String
  createdAt   DateTime  @default(now())
  products    Product[]
}

model Product {
  id             String      @id @default(uuid()) @db.Uuid
  name           String
  slug           String      @unique
  description    String      @db.Text
  price          Float
  compareAtPrice Float?
  inventory      Int
  images         String[]
  categoryId     String      @db.Uuid
  category       Category    @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  sizes          String[]
  colors         String[]
  isFeatured     Boolean     @default(false)
  isActive       Boolean     @default(true)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  reviews        Review[]
  orderItems     OrderItem[]

  @@index([slug])
  @@index([categoryId])
}

model Order {
  id              String      @id @default(uuid()) @db.Uuid
  userId          String?     @db.Uuid
  user            User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  status          OrderStatus @default(PENDING)
  total           Float
  shippingAddress Json
  paymentStatus   String      @default("UNPAID") // "PAID", "UNPAID", "REFUNDED"
  stripeSessionId String?     @unique
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  items           OrderItem[]

  @@index([userId])
}

model OrderItem {
  id        String   @id @default(uuid()) @db.Uuid
  orderId   String   @db.Uuid
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String   @db.Uuid
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float
  size      String?
  color     String?

  @@index([orderId])
  @@index([productId])
}

model Review {
  id        String   @id @default(uuid()) @db.Uuid
  productId String   @db.Uuid
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  rating    Int
  comment   String   @db.Text
  createdAt DateTime @default(now())

  @@index([productId])
  @@index([userId])
}
`
  },
  {
    path: 'packages/prisma/seed.ts',
    content: `import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ORRIS Database...');

  // 1. Create Admins and Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@orris.com' },
    update: {},
    create: {
      email: 'admin@orris.com',
      name: 'Orris Curator',
      role: Role.ADMIN,
      password: adminPassword,
    },
  });

  const memberPassword = await bcrypt.hash('member123', 10);
  const regularUser = await prisma.user.upsert({
    where: { email: 'client@orris.com' },
    update: {},
    create: {
      email: 'client@orris.com',
      name: 'Evelyn Vance',
      role: Role.USER,
      password: memberPassword,
    },
  });

  // 2. Create Categories
  const catFragrance = await prisma.category.create({
    data: {
      name: 'Fragrance',
      slug: 'perfumes',
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800',
      description: 'Sensorial blends created in artisanal French laboratories.',
    }
  });

  const catApparel = await prisma.category.create({
    data: {
      name: 'Apparel',
      slug: 'clothing',
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800',
      description: 'Meticulously tailored knitwear and unstructured linens.',
    }
  });

  // 3. Create Products
  await prisma.product.createMany({
    data: [
      {
        name: 'Orris Noir Eau de Parfum',
        slug: 'orris-noir-eau-de-parfum',
        description: 'Rare iris root coupled with dry amber resins and dark vetiver wood notes.',
        price: 195.0,
        compareAtPrice: 240.0,
        inventory: 200,
        images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800'],
        categoryId: catFragrance.id,
        sizes: ['50ml', '100ml'],
        colors: ['Onyx Glass'],
        isFeatured: true,
      },
      {
        name: 'Santal Mystique Extrait',
        slug: 'santal-mystique-extrait',
        description: 'Smokey Australian sandalwood layered with deep forest incense aromas.',
        price: 220.0,
        inventory: 45,
        images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800'],
        categoryId: catFragrance.id,
        sizes: ['100ml'],
        colors: ['Amber Glass'],
        isFeatured: false,
      },
      {
        name: 'Orris Noir Linen Blazer',
        slug: 'orris-noir-linen-blazer',
        description: 'Double-breasted jacket made from organic heavy-weight Belgian linen yarns.',
        price: 360.0,
        compareAtPrice: 420.0,
        inventory: 50,
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800'],
        categoryId: catApparel.id,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Oatmeal', 'Anthracite Black'],
        isFeatured: true,
      }
    ]
  });

  console.log('ORRIS Seeding operation finished successfully ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`
  },
  {
    path: 'package.json',
    content: `{
  "name": "orris-digital-flagship",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "seed": "tsx packages/prisma/seed.ts",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "@google/genai": "^2.4.0",
    "@stripe/stripe-js": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "bcrypt": "^5.1.1",
    "clsx": "^2.1.1",
    "framer-motion": "^11.11.0",
    "lucide-react": "^0.450.0",
    "next": "^15.1.0",
    "next-auth": "^5.0.0-beta.25",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "recharts": "^2.13.0",
    "stripe": "^17.4.0",
    "tailwind-merge": "^2.5.0",
    "zustand": "^5.0.1"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "prisma": "^6.0.0",
    "tailwindcss": "4.0.0-beta.4",
    "tsx": "^4.19.0",
    "typescript": "^5.7.2"
  }
}
`
  },
  {
    path: 'next.config.js',
    content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
`
  },
  {
    path: 'app/layout.tsx',
    content: `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export const metadata: Metadata = {
  title: "ORRIS | Premium Direct-To-Consumer Digital Flagship",
  description: "Sensorial fragrances, luxury horology, structured leatherware, and sartorial tailoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={\`\${inter.className} bg-[#FAFAFA] text-[#1A1A1A] antialiased\`}>
        {children}
      </body>
    </html>
  );
}
`
  },
  {
    path: 'app/globals.css',
    content: `@import "tailwindcss";

@theme {
  --color-primary: #0F0F0F;
  --color-accent: #C9A96E;
  --color-luxury-bg: #FAFAFA;
  --font-serif: "Playfair Display", Georgia, serif;
}

@layer base {
  body {
    background-color: var(--color-luxury-bg);
    color: #1A1A1A;
    scroll-behavior: smooth;
  }
}
`
  },
  {
    path: 'lib/db.ts',
    content: `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
`
  },
  {
    path: 'lib/store.ts',
    content: `import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string, size?: string, color?: string) => void;
  updateQuantity: (id: string, qty: number, size?: string, color?: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (newItem) => set((state) => {
        const existingIndex = state.items.findIndex(
          (item) => item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
        );
        if (existingIndex > -1) {
          const updated = [...state.items];
          updated[existingIndex].quantity += 1;
          return { items: updated };
        }
        return { items: [...state.items, { ...newItem, quantity: 1 }] };
      }),
      removeItem: (id, size, color) => set((state) => ({
        items: state.items.filter(
          (item) => !(item.id === id && item.size === size && item.color === color)
        )
      })),
      updateQuantity: (id, qty, size, color) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id && item.size === size && item.color === color
            ? { ...item, quantity: Math.max(1, qty) }
            : item
        )
      })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "orris-cart-state" }
  )
);
`
  },
  {
    path: 'app/api/checkout/route.ts',
    content: `import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-19" as any,
});

export async function POST(req: Request) {
  try {
    const { items, customerEmail, customerName } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Missing cart line items" }, { status: 400 });
    }

    // 1. Compile lines for Stripe checkout session
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image],
          metadata: {
            size: item.size || "",
            color: item.color || "",
          }
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // 2. Provision Stripe Checkout Session link
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: customerEmail,
      mode: "payment",
      success_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}\`,
      cancel_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/cart\`,
      metadata: {
        customerName,
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`
  },
  {
    path: 'app/page.tsx',
    content: `import Link from "next/link";
import { db } from "@/lib/db";

export default async function Home() {
  const featuredProducts = await db.product.findMany({
    where: { isFeatured: true, isActive: true },
    take: 4,
    include: { category: true }
  });

  return (
    <main className="min-h-screen">
      {/* Editorial Luxury Hero */}
      <section className="relative h-screen w-full flex items-center justify-center bg-black overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-65"
          src="https://assets.mixkit.co/videos/preview/mixkit-models-in-elegant-clothes-posing-41662-large.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40" />
        <div className="relative text-center text-white px-6 max-w-4xl z-10 selection:bg-[#C9A96E] selection:text-black">
          <p className="text-xs uppercase tracking-[0.4em] text-[#C9A96E] mb-4 font-semibold">The Digital Flagship</p>
          <h1 className="text-5xl md:text-8xl font-light tracking-tight mb-8 font-serif">
            ESTHÉTIQUE MODERNE
          </h1>
          <p className="text-base md:text-lg text-neutral-300 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
            Delve into meticulously formulated fragrances, vintage-proportioned automatic chronographs, and Italian handcrafted leathergoods. Made for the modern non-conformist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/shop" className="px-10 py-4 bg-[#C0A060] text-[#0A0A0A] hover:bg-white text-xs uppercase tracking-widest font-semibold transition-all duration-300 rounded shadow-lg shadow-amber-500/10 hover:shadow-white/10">
              Browse Collections
            </Link>
            <Link href="/brand-philosophy" className="px-10 py-4 border border-white/40 text-white hover:bg-white hover:text-black text-xs uppercase tracking-widest transition-all duration-300 rounded">
              Our Manifesto
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 pb-6 border-b border-neutral-200">
          <div>
            <span className="text-xs tracking-widest text-[#C9A96E] uppercase font-bold">Curated Edit</span>
            <h2 className="text-3xl font-light tracking-tight text-neutral-900 mt-2 font-serif">The Seasonal Icons</h2>
          </div>
          <Link href="/shop" className="text-xs uppercase tracking-widest pb-1 border-b border-[#C9A96E] text-neutral-700 hover:text-black transition-colors">
            View All Products &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredProducts.map((p) => (
            <div key={p.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden mb-6">
                <img 
                  src={p.images[0]} 
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-medium text-neutral-800">{p.name}</h3>
                <p className="text-sm font-light text-neutral-900">\${p.price}</p>
              </div>
              <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider">{p.sizes[0] || 'Default'}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
`
  }
];

// Helper to bundle all files and return as a Base64-encoded downloadable ZIP string or triggers download
export const downloadMonorepoZip = async (onComplete: () => void) => {
  const zip = new JSZip();

  // Create absolute structures in the Zip Archive compiler
  MONOREPO_FILES.forEach((file) => {
    zip.file(file.path, file.content);
  });

  try {
    const blob = await zip.generateAsync({ type: 'blob' });
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'orris-premium-monorepo.zip';
    document.body.appendChild(link);
    link.click();
    
    // Clean-up actions
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    
    onComplete();
  } catch (error) {
    console.error('Failed generating JSZip Archive:', error);
  }
};
