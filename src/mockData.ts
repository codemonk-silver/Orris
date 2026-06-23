/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Product, Order, Citizen, MaisonSettings } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-clothing',
    name: 'Apparel',
    slug: 'clothing',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop',
    description: 'Impeccably tailored garments crafted from premium cashmere, raw silk, and fine European linen.'
  },
  {
    id: 'cat-shoes',
    name: 'Footwear',
    slug: 'shoes',
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop',
    description: 'Handcrafted leather boots, polished oxfords, and timeless loafers constructed by Italian artisans.'
  },
  {
    id: 'cat-perfumes',
    name: 'Fragrance',
    slug: 'perfumes',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop',
    description: 'Olfactory masterpieces, blending private reserve vetiver, smoked wood resins, and pure iris concrete.'
  },
  {
    id: 'cat-wristwatches',
    name: 'Horology',
    slug: 'wristwatches',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop',
    description: 'Micro-engineered automatic timepieces designed with polished steel cases and sapphire displays.'
  },
  {
    id: 'cat-leather-goods',
    name: 'Leather Goods',
    slug: 'leather-goods',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
    description: 'Premium calfskin satchels, structured briefcases, and minimal card wallets.'
  },
  {
    id: 'cat-eyewear',
    name: 'Eyewear',
    slug: 'eyewear',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
    description: 'Custom Japanese acetate frames fitted with polarized mineral glass lenses.'
  },
  {
    id: 'cat-jewelry',
    name: 'Atelier Jewelry',
    slug: 'jewelry',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    description: 'Sculptural rings, raw-cut diamond pendants, and solid 18k gold chain cuffs.'
  },
  {
    id: 'cat-home',
    name: 'Home Aroma',
    slug: 'home-fragrance',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop',
    description: 'Therapeutic soy candles and brutalist brass diffusers for sensorial interiors.'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Fragrances (4 items)
  {
    id: 'prod-orris-noir',
    name: 'Orris Noir Eau de Parfum',
    slug: 'orris-noir-eau-de-parfum',
    description: 'Our signature olfactory statement. Built around extremely rare iris root (orris concrete), layered with dark vetiver, crushed black pepper, and warm amber resin. Housed in a heavy black glass flacon with a magnetic brass cap.',
    price: 195,
    compareAtPrice: 240,
    inventory: 45,
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-perfumes',
    sizes: ['50ml', '100ml'],
    colors: ['Obsidian Black'],
    isFeatured: true,
    isActive: true,
    reviews: [
      { id: 'rev-1', productId: 'prod-orris-noir', userId: 'user-1', userName: 'Eleanor Vance', rating: 5, comment: 'Sensational and deeply complex. It develops on the skin in an incredibly rich way. Absolute masterpiece!', createdAt: '2026-05-10T12:00:00Z' },
      { id: 'rev-2', productId: 'prod-orris-noir', userId: 'user-2', userName: 'Marcus Sterling', rating: 4, comment: 'A heavy, sensual fragrance. Best suited for cold evenings. Longevity is incredible (8-10 hours).', createdAt: '2026-06-02T15:30:00Z' }
    ],
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'prod-santal-mystique',
    name: 'Santal Mystique Extrait',
    slug: 'santal-mystique-extrait',
    description: 'A pure concentration of creamy Australian sandalwood, sacred cedarwood, and dried cardamom pods. Infused with a rare smoked incense note that lingers like a velvet shadow.',
    price: 220,
    inventory: 23,
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-perfumes',
    sizes: ['100ml'],
    colors: ['Amber Glass'],
    isFeatured: true,
    isActive: true,
    reviews: [
      { id: 'rev-3', productId: 'prod-santal-mystique', userId: 'user-3', userName: 'Julian Reed', rating: 5, comment: 'The sandalwood here is extremely pure. It feels like stepping into an ancient temple in the forest.', createdAt: '2026-05-20T09:15:00Z' }
    ],
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'prod-ambre-imperial',
    name: 'Ambre Impérial Private Blend',
    slug: 'ambre-imperial-private-blend',
    description: 'An luxurious accord of gold Baltic amber, crushed Madagascar vanilla bean, scorched sugar, and warm tonka. Sweeter and softer than Orris Noir, offering an intimate skin scent.',
    price: 185,
    compareAtPrice: 210,
    inventory: 3, // Low stock!
    images: [
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-perfumes',
    sizes: ['50ml', '100ml'],
    colors: ['Gold Tint'],
    isFeatured: false,
    isActive: true,
    reviews: [],
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z'
  },
  {
    id: 'prod-verde-epice',
    name: 'Verde Épice Cologne',
    slug: 'verde-epice-cologne',
    description: 'A bracing, botanical burst of hand-pressed bergamot, green cypress leaves, wild basil, and white musk. Evocative of sunrise over a coastal cliff in southern Italy.',
    price: 155,
    inventory: 60,
    images: [
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-perfumes',
    sizes: ['100ml', '200ml'],
    colors: ['Verde Teal'],
    isFeatured: false,
    isActive: true,
    reviews: [],
    createdAt: '2026-02-14T00:00:00Z',
    updatedAt: '2026-02-14T00:00:00Z'
  },

  // Apparel (4 items)
  {
    id: 'prod-linen-blazer',
    name: 'Orris Noir Linen Blazer',
    slug: 'orris-noir-linen-blazer',
    description: 'Unstructured double-breasted sport coat handcrafted from heavy Belgian flax linen. Perfect drape, featuring hand-carved horn buttons, peak lapels, and patch pockets.',
    price: 360,
    compareAtPrice: 420,
    inventory: 18,
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-clothing',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Oatmeal', 'Noir Black'],
    isFeatured: true,
    isActive: true,
    reviews: [
      { id: 'rev-4', productId: 'prod-linen-blazer', userId: 'user-4', userName: 'Pierre Dupont', rating: 5, comment: 'The cut is relaxed yet extremely tailored. It fits like a tailored glove and the flax fabric is satisfyingly heavy.', createdAt: '2026-05-25T14:40:00Z' }
    ],
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z'
  },
  {
    id: 'prod-cashmere-knit',
    name: 'Monarch Oversized Cashmere Knit',
    slug: 'monarch-oversized-cashmere-knit',
    description: 'An architectural knit sweater ethically sourced from Mongolian goat fibers. Features a warm high-neck mock mock, dropped shoulder seams, and dense ribbed borders that maintain shape.',
    price: 295,
    inventory: 12,
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-clothing',
    sizes: ['S', 'M', 'L'],
    colors: ['Sandstone', 'Sage Green', 'Chalk White'],
    isFeatured: true,
    isActive: true,
    reviews: [],
    createdAt: '2026-01-25T00:00:00Z',
    updatedAt: '2026-01-25T00:00:00Z'
  },
  {
    id: 'prod-silk-trousers',
    name: 'Sartorial Silk Pleated Trousers',
    slug: 'sartorial-silk-pleated-trousers',
    description: 'Flowing, tailored trousers made from a thick silk-wool blend. Finished with a double pleat front, side tab adjusters details, and an unfinished hem for precise custom-tailoring.',
    price: 245,
    inventory: 15,
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-clothing',
    sizes: ['30', '32', '34', '36'],
    colors: ['Charcoal', 'Navy Blue'],
    isFeatured: false,
    isActive: true,
    reviews: [],
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z'
  },
  {
    id: 'prod-trench-coat',
    name: 'Atelier Heavy Trench Coat',
    slug: 'atelier-heavy-trench-coat',
    description: 'A structural double-breasted storm coat. Woven from waterproof cotton gabardine with a removable wool liner, leather-wrapped buckles, and a modular throat latch. Classic British military styling.',
    price: 495,
    compareAtPrice: 580,
    inventory: 8,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-clothing',
    sizes: ['M', 'L', 'XL'],
    colors: ['Traditional Khaki', 'Obsidian Black'],
    isFeatured: false,
    isActive: true,
    reviews: [],
    createdAt: '2026-02-28T00:00:00Z',
    updatedAt: '2026-02-28T00:00:00Z'
  },

  // Footwear (4 items)
  {
    id: 'prod-velvet-oxford',
    name: 'Velvet Oxford Dress Shoes',
    slug: 'velvet-oxford-dress-shoes',
    description: 'Elegant formal shoes made from deep Italian cotton velvet with a patent leather toe cap and trim. Fitted with custom stacked leather heels and Blake-stitched hard soles.',
    price: 380,
    compareAtPrice: 420,
    inventory: 14,
    images: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-shoes',
    sizes: ['8', '9', '10', '11', '12'],
    colors: ['Ruby Bordeaux', 'Deep Onyx'],
    isFeatured: true,
    isActive: true,
    reviews: [
      { id: 'rev-5', productId: 'prod-velvet-oxford', userId: 'user-5', userName: 'Devon Hunt', rating: 5, comment: 'The velvet is extremely deep. Photographed brilliantly for my black-tie gala. Surprisingly comfortable right out of the box.', createdAt: '2026-06-01T18:10:00Z' }
    ],
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z'
  },
  {
    id: 'prod-chelsea-boots',
    name: 'Suede Chelsea Boots Noir',
    slug: 'suede-chelsea-boots-noir',
    description: 'Sleek, slim Chelsea boots sculpted from water-repellent Italian reverse suede. Features custom webbing pull tabs, flexible Goodyear-welted dynamic soles, and tone-on-tone elastic panels.',
    price: 340,
    inventory: 20,
    images: [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-shoes',
    sizes: ['8', '9', '10', '11'],
    colors: ['Onyx Charcoal', 'Silt Brown'],
    isFeatured: true,
    isActive: true,
    reviews: [],
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-01-18T00:00:00Z'
  },
  {
    id: 'prod-calfskin-sneakers',
    name: 'Minimalist Calfskin Sneakers',
    slug: 'minimalist-calfskin-sneakers',
    description: 'Premium low-top sneakers in a clean, raw-edge aesthetic. Structured from top-grain calfskin leather with dynamic Margom outsoles and waxed athletic cotton laces.',
    price: 260,
    inventory: 35,
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-shoes',
    sizes: ['8', '9', '10', '11', '12'],
    colors: ['Albino White', 'Desaturated Gray'],
    isFeatured: false,
    isActive: true,
    reviews: [],
    createdAt: '2026-02-05T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z'
  },
  {
    id: 'prod-artisanal-loafers',
    name: 'Artisanal Loafers Cognac',
    slug: 'artisanal-loafers-cognac',
    description: 'A traditional penny loafer woven and burnished completely by hand. Sourced from full-grain French box calf leather that takes on a rich individual patina with wear.',
    price: 390,
    inventory: 5,
    images: [
      'https://images.unsplash.com/photo-1614252329309-8d6bdba733ec?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-shoes',
    sizes: ['9', '10', '11'],
    colors: ['Vintage Cognac', 'Chestnut Brown'],
    isFeatured: false,
    isActive: true,
    reviews: [],
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  },

  // Horology (4 items)
  {
    id: 'prod-chrono-watch',
    name: 'Minimalist Chronograph Watch',
    slug: 'minimalist-chronograph-watch',
    description: 'A 38mm bauhaus-inspired chronograph dial under highly double-domed sapphire glass. Powered by a hybrid watch caliber, detailed with sweeping second subdials, in a case of marine-grade surgical steel.',
    price: 450,
    compareAtPrice: 520,
    inventory: 10,
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-wristwatches',
    sizes: ['38mm Leather Band'],
    colors: ['Polished Silver & Black Suede', 'Rose Gold & Caramel Leather'],
    isFeatured: true,
    isActive: true,
    reviews: [
      { id: 'rev-6', productId: 'prod-chrono-watch', userId: 'user-6', userName: 'Ethan Hawke', rating: 5, comment: 'The typography of the dial is absolutely exquisite. Extremely understated elegance.', createdAt: '2026-05-30T10:14:00Z' }
    ],
    createdAt: '2026-01-08T00:00:00Z',
    updatedAt: '2026-01-08T00:00:00Z'
  },
  {
    id: 'prod-skeleton-watch',
    name: 'Atelier Automatic Skeleton Watch',
    slug: 'atelier-automatic-skeleton-watch',
    description: 'An open-heart automatic watch displaying the handcrafted mechanics. Hand-wound with a 60-hour reserve, and bordered by a hand-stitched matte alligator scale strap.',
    price: 890,
    inventory: 4,
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-wristwatches',
    sizes: ['40mm Alligator'],
    colors: ['Smoked Platinum', 'Vermeil Gold'],
    isFeatured: true,
    isActive: true,
    reviews: [],
    createdAt: '2026-02-12T00:00:00Z',
    updatedAt: '2026-02-12T00:00:00Z'
  },
  {
    id: 'prod-classic-steel',
    name: 'Classic Steel Dress Watch',
    slug: 'classic-steel-dress-watch',
    description: 'A sleek, vintage-proportioned 35mm dress watch featuring structural silver hands and hand-painted Roman typography indices. Finished with a flat micro-beaded steel metal link band.',
    price: 320,
    inventory: 15,
    images: [
      'https://images.unsplash.com/photo-1539874754764-5a96559165b0?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-wristwatches',
    sizes: ['35mm Steel Link'],
    colors: ['Opaline Silver', 'Midnight Sun Blue'],
    isFeatured: false,
    isActive: true,
    reviews: [],
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z'
  },

  // Leather Goods (3 items)
  {
    id: 'prod-leather-satchel',
    name: 'Atelier Calfskin Satchel Bag',
    slug: 'atelier-calfskin-satchel-bag',
    description: 'A structural double-zipper duffel bag sized for overnight travel. Cut from premium full-grain Italian calfskin with solid brass buckles and a deep raw suede interior.',
    price: 420,
    inventory: 8,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-leather-goods',
    sizes: ['One Size'],
    colors: ['Espresso Brown', 'Full Grain Black'],
    isFeatured: false,
    isActive: true,
    reviews: [],
    createdAt: '2026-02-20T00:00:00Z',
    updatedAt: '2026-02-20T00:00:00Z'
  },
  {
    id: 'prod-minimal-wallet',
    name: 'Origami Fold Card Wallet',
    slug: 'origami-fold-card-wallet',
    description: 'Constructed from a single, seamless fold of vegetable-dyed horween shell cordovan. Features three internal credit sleeves that expand naturally with up to 12 cards.',
    price: 95,
    inventory: 40,
    images: [
      'https://images.unsplash.com/photo-1627124118304-0294d71950a4?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-leather-goods',
    sizes: ['One Size'],
    colors: ['Natural Tan', 'Forest Green', 'Nero Black'],
    isFeatured: false,
    isActive: true,
    reviews: [],
    createdAt: '2026-02-24T00:00:00Z',
    updatedAt: '2026-02-24T00:00:00Z'
  },
  {
    id: 'prod-classic-belt',
    name: 'Atelier Suede Calfskin Belt',
    slug: 'atelier-suede-calfskin-belt',
    description: 'A minimalist belt cut from water-repellent Italian velvet suede, backed with smooth veg-tan calfskin, and secured by a hand-polished solid brass buckle.',
    price: 110,
    inventory: 25,
    images: [
      'https://images.unsplash.com/photo-1624224971170-2f84fed5eb5e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-leather-goods',
    sizes: ['32', '34', '36', '38'],
    colors: ['Silt Brown', 'Onyx Black'],
    isFeatured: false,
    isActive: true,
    reviews: [],
    createdAt: '2026-02-28T00:00:00Z',
    updatedAt: '2026-02-28T00:00:00Z'
  },

  // Eyewear (2 items)
  {
    id: 'prod-monolith-sunglasses',
    name: 'Monolith Acetate Sunglasses',
    slug: 'monolith-acetate-sunglasses',
    description: 'A bold, square D-frame sunglass crafted from hand-polished 8mm Japanese block acetate. Seamlessly fitted with signature brass rivets and premium olive-green polarized mineral lenses.',
    price: 210,
    inventory: 15,
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-eyewear',
    sizes: ['Standard Fit'],
    colors: ['Tortoise Shell', 'Smokey Sage', 'Champagne Amber'],
    isFeatured: true,
    isActive: true,
    reviews: [],
    createdAt: '2026-03-05T00:00:00Z',
    updatedAt: '2026-03-05T00:00:00Z'
  },
  {
    id: 'prod-aviator-glasses',
    name: 'Sartorial Aviator Sunglasses',
    slug: 'sartorial-aviator-sunglasses',
    description: 'Sleek double-bridged titanium aviator frames fitted with ultra-thin polarized mineral glass lenses in historical G15 green, offering lightweight wear and absolute protection.',
    price: 285,
    inventory: 12,
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582142407894-ec85a1261a4a?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-eyewear',
    sizes: ['Standard Fit'],
    colors: ['Polished Gold', 'Matte Black'],
    isFeatured: false,
    isActive: true,
    reviews: [],
    createdAt: '2026-03-08T00:00:00Z',
    updatedAt: '2026-03-08T00:00:00Z'
  },

  // Jewelry (2 items)
  {
    id: 'prod-brass-ring',
    name: 'Sculptural Solid Gold Band',
    slug: 'sculptural-solid-gold-band',
    description: 'An organic, heavily textured hand-cast ring in solid 18k yellow gold. Gently sandblasted internally for an incredibly smooth finish, leaving a rugged brutalist outer facade.',
    price: 540,
    compareAtPrice: 650,
    inventory: 6,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-jewelry',
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['18k Yellow Gold', 'White Gold'],
    isFeatured: true,
    isActive: true,
    reviews: [],
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z'
  },
  {
    id: 'prod-gold-necklace',
    name: 'Atelier Gold Rope Chain',
    slug: 'atelier-gold-rope-chain',
    description: 'A classic 18k solid gold diamond-cut rope chain with a subtle brushed finish. Secured with a custom industrial lobster clasp and detailed with a discrete hallmark plaque.',
    price: 780,
    inventory: 4,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-jewelry',
    sizes: ['50cm', '60cm'],
    colors: ['18k Yellow Gold'],
    isFeatured: false,
    isActive: true,
    reviews: [],
    createdAt: '2026-03-12T00:00:00Z',
    updatedAt: '2026-03-12T00:00:00Z'
  },

  // Home Aroma (2 items)
  {
    id: 'prod-amber-candle',
    name: 'Tulum Copal Soy Candle',
    slug: 'tulum-copal-soy-candle',
    description: 'Hand-poured slow-burning organic soy wax infused with sacred Mayan white copal resin, black tea leaves, and wild verbena. Nested inside a custom brutalist hand-thrown matte stoneware cup.',
    price: 65,
    inventory: 45,
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-home',
    sizes: ['250g'],
    colors: ['Stoneware Gray'],
    isFeatured: false,
    isActive: true,
    reviews: [],
    createdAt: '2026-03-15T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z'
  },
  {
    id: 'prod-ceramic-incense',
    name: 'Kyoto Hinoki Incense Chamber',
    slug: 'kyoto-hinoki-incense-chamber',
    description: 'An architectural ceramic incense holder made of raw black stoneware. Includes 20 cones of pure Hinoki cypress oil and Japanese cedarwood.',
    price: 85,
    inventory: 15,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1612160691541-2c09cb3a7008?q=80&w=800&auto=format&fit=crop'
    ],
    categoryId: 'cat-home',
    sizes: ['One Size'],
    colors: ['Raw Stoneware Black'],
    isFeatured: false,
    isActive: true,
    reviews: [],
    createdAt: '2026-03-18T00:00:00Z',
    updatedAt: '2026-03-18T00:00:00Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    userId: 'user-7',
    customerName: 'Marcus Aurelius',
    customerEmail: 'marcus@philosopher.org',
    status: 'DELIVERED',
    total: 390.0,
    shippingAddress: {
      line1: '1 Villa of Meditations',
      city: 'Rome',
      state: 'Lazio',
      postalCode: '00100',
      country: 'Italy'
    },
    paymentStatus: 'PAID',
    stripeSessionId: 'cs_test_b18EAr828Bshdh298asdf',
    items: [
      {
        id: 'oi-1',
        productId: 'prod-orris-noir',
        productName: 'Orris Noir Eau de Parfum',
        productPrice: 195,
        productImage: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop',
        quantity: 2,
        size: '100ml',
        color: 'Obsidian Black'
      }
    ],
    createdAt: '2026-06-10T14:22:00Z'
  },
  {
    id: 'ord-1002',
    userId: 'guest_100',
    customerName: 'Sophia Loren',
    customerEmail: 'sophia@vintage.it',
    status: 'SHIPPED',
    total: 360.0,
    shippingAddress: {
      line1: '9 Cinecittà Blvd',
      city: 'Rome',
      state: 'Lazio',
      postalCode: '00118',
      country: 'Italy'
    },
    paymentStatus: 'PAID',
    stripeSessionId: 'cs_test_c91FAh291Jasdkj1823ha',
    items: [
      {
        id: 'oi-2',
        productId: 'prod-linen-blazer',
        productName: 'Orris Noir Linen Blazer',
        productPrice: 360,
        productImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
        quantity: 1,
        size: 'M',
        color: 'Oatmeal'
      }
    ],
    createdAt: '2026-06-16T11:45:00Z'
  },
  {
    id: 'ord-1003',
    userId: 'user-8',
    customerName: 'David Hockney',
    customerEmail: 'david@atelier.co.uk',
    status: 'PROCESSING',
    total: 540.0,
    shippingAddress: {
      line1: '12 Swimming Pool Lane',
      city: 'London',
      state: 'Greater London',
      postalCode: 'W1A 1AA',
      country: 'United Kingdom'
    },
    paymentStatus: 'PAID',
    stripeSessionId: 'cs_test_d38FJ1283hshd8dja72',
    items: [
      {
        id: 'oi-3',
        productId: 'prod-brass-ring',
        productName: 'Sculptural Solid Gold Band',
        productPrice: 540,
        productImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
        quantity: 1,
        size: '8',
        color: '18k Yellow Gold'
      }
    ],
    createdAt: '2026-06-17T09:30:00Z'
  }
];

export const INITIAL_CITIZENS: Citizen[] = [
  { id: 'usr-1', name: 'Eleanor Vance', email: 'eleanor@vance.com', role: 'USER', phone: '+1 (555) 700-1122', location: 'Geneva, Switzerland', VIPLevel: 'Gold VIP Member', spend: '$12,400', status: 'Online', createdAt: '2026-03-01T12:00:00Z' },
  { id: 'usr-2', name: 'Marcus Sterling', email: 'marcus@sterling.co', role: 'USER', phone: '+44 20 7946 0991', location: 'London, UK', VIPLevel: 'Atelier Collector Elite', spend: '$24,500', status: 'Online', createdAt: '2026-04-12T14:15:00Z' },
  { id: 'usr-3', name: 'Orris Curator', email: 'admin@orris.com', role: 'ADMIN', phone: '+33 1 42 27 78 56', location: 'Paris, France', VIPLevel: 'Chief System Curator', spend: '$0 (Atelier Staff)', status: 'Root Administration', createdAt: '2026-01-01T08:00:00Z' },
  { id: 'usr-4', name: 'Julian Reed', email: 'julian@reed.co.uk', role: 'USER', phone: '+44 1632 960882', location: 'Edinburgh, Scotland', VIPLevel: 'Silver VIP Member', spend: '$4,150', status: 'Away', createdAt: '2026-05-18T16:45:00Z' }
];

export const INITIAL_SETTINGS: MaisonSettings = {
  brandName: 'ORRIS',
  announcementBarText: 'Complimentary private express courier delivery on orders exceeding $150',
  isAnnouncementBarActive: true,
  freeShippingThreshold: 150,
  taxRatePercentage: 0,
  currencySymbol: '$',
  currencyName: 'USD',
  chiefCuratorEmail: 'curator@orris.com',
  isSignatureSeriesActive: true
};
