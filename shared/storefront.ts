import type { Product } from "../drizzle/schema";

export const SITE_CONFIG = {
  brandName: "Mr. Todd's Woodcrafts",
  domain: "mrtoddsworkshop.com",
  location: "Omaha, Nebraska",
  contactEmail: "todd@mrtodds.com",
  freeShippingThresholdCents: 7500,
  responseTime: "within 24 hours",
  madeToOrderLeadTime: "2-4 weeks",
  inStockShippingWindow: "3-7 business days",
  acceptedPaymentLabel: "Venmo accepted",
  venmoHandle: "" as string,
  venmoInstructions:
    "Place your order online and Todd will follow up with Venmo payment details.",
} as const;

type ProductQuery = {
  category?: string;
  woodType?: string;
  status?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
};

const DEFAULT_CARE =
  "Hand wash only. Dry promptly. Refresh with food-safe mineral oil as needed.";

const fallbackTimestamp = new Date("2026-05-18T10:00:00.000Z");

function makeProduct(
  product: Omit<Product, "createdAt" | "updatedAt"> & {
    createdAt?: Date;
    updatedAt?: Date;
  },
): Product {
  return {
    ...product,
    createdAt: product.createdAt ?? fallbackTimestamp,
    updatedAt: product.updatedAt ?? fallbackTimestamp,
  };
}

export const FALLBACK_PRODUCTS: Product[] = [
  makeProduct({
    id: 1001,
    name: "Lilac Wood Spiral Spoon",
    slug: "lilac-spiral-spoon",
    description:
      "A short, hand-carved spoon from lilac wood with a spiral beaded handle. Sized for honey, salt, or a small scoop of anything worth savoring.",
    price: 3200,
    woodType: "OTHER",
    category: "SPOON",
    status: "IN_STOCK",
    quantity: 1,
    leadTimeDays: null,
    featured: true,
    images: ["/manus-storage/real-lilac-spoon_ec3a4c5e.jpg"],
    dimensions: "5 inches length",
    careInstructions: DEFAULT_CARE,
    weight: null,
  }),
  makeProduct({
    id: 1002,
    name: "Cherry Wood Coffee Scoop with Ring Handle",
    slug: "cherry-coffee-scoop-ring",
    description:
      "A hand-carved cherry wood coffee scoop with a carved ring handle and a deep round bowl sized for a standard tablespoon scoop.",
    price: 4200,
    woodType: "CHERRY",
    category: "SCOOP",
    status: "IN_STOCK",
    quantity: 1,
    leadTimeDays: null,
    featured: true,
    images: ["/manus-storage/real-cherry-scoop_3715bf4e.jpg"],
    dimensions: "8 inches length",
    careInstructions: DEFAULT_CARE,
    weight: null,
  }),
  makeProduct({
    id: 1003,
    name: "Cherry Wood Wave Sculpture",
    slug: "cherry-wave-sculpture",
    description:
      "A one-of-a-kind carved cherry wood object with a smooth sphere at one end and a flowing S-curve through the body. The kind of piece people pick up and do not put down.",
    price: 5500,
    woodType: "CHERRY",
    category: "CUSTOM",
    status: "IN_STOCK",
    quantity: 1,
    leadTimeDays: null,
    featured: true,
    images: ["/manus-storage/real-cherry-wave_57614cda.jpg"],
    dimensions: "7 inches length",
    careInstructions: "Dust with a soft cloth. Re-wax lightly if the sheen fades.",
    weight: null,
  }),
  makeProduct({
    id: 1004,
    name: "Hand-Carved Cherry Wood Bowl",
    slug: "cherry-hand-carved-bowl",
    description:
      "A low, wide, hand-carved cherry bowl with preserved natural contours and a swirling interior grain. Works equally well for fruit, bread, or display.",
    price: 6800,
    woodType: "CHERRY",
    category: "SERVING",
    status: "IN_STOCK",
    quantity: 1,
    leadTimeDays: null,
    featured: true,
    images: [
      "/manus-storage/real-cherry-bowl-side_43ab19f8.jpg",
      "/manus-storage/real-cherry-bowl-top_cb2b8f24.jpg",
      "/manus-storage/real-cherry-bowl-ext_124dd3bd.jpg",
    ],
    dimensions: "10 x 7 x 2 inches",
    careInstructions: DEFAULT_CARE,
    weight: null,
  }),
  makeProduct({
    id: 1005,
    name: "Walnut Serving Board",
    slug: "walnut-serving-board",
    description:
      "A made-to-order walnut serving board carved for everyday hosting. Each board is shaped to the grain, finished by hand, and built for years of use.",
    price: 9500,
    woodType: "WALNUT",
    category: "SERVING",
    status: "MADE_TO_ORDER",
    quantity: 3,
    leadTimeDays: 14,
    featured: false,
    images: ["/manus-storage/real-cherry-bowl-top_cb2b8f24.jpg"],
    dimensions: "Approx. 15 x 8 inches",
    careInstructions: DEFAULT_CARE,
    weight: null,
  }),
];

export function getFallbackProducts(query: ProductQuery = {}): Product[] {
  const searchTerm = query.search?.trim().toLowerCase();

  const filtered = FALLBACK_PRODUCTS.filter((product) => {
    if (query.category && product.category !== query.category) return false;
    if (query.woodType && product.woodType !== query.woodType) return false;
    if (query.status && product.status !== query.status) return false;
    if (query.featured !== undefined && product.featured !== query.featured) {
      return false;
    }

    if (!query.status && product.status === "RETIRED") return false;

    if (searchTerm) {
      const haystack = `${product.name} ${product.description ?? ""}`.toLowerCase();
      if (!haystack.includes(searchTerm)) return false;
    }

    return true;
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const offset = query.offset ?? 0;
  const limit = query.limit ?? filtered.length;

  return filtered.slice(offset, offset + limit);
}

export function getFallbackProductBySlug(slug: string): Product | undefined {
  return FALLBACK_PRODUCTS.find((product) => product.slug === slug);
}

export function getFallbackProductById(id: number): Product | undefined {
  return FALLBACK_PRODUCTS.find((product) => product.id === id);
}
