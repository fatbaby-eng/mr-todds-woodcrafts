import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const IMAGE_BASE = "";

const PRODUCTS = [
  {
    name: "Cherry Spoon",
    slug: "cherry-spoon",
    description: "A graceful everyday spoon carved from a single piece of American cherry. The warm reddish grain deepens beautifully with use and food-safe oil.",
    price: 3800,
    woodType: "CHERRY",
    category: "SPOON",
    status: "IN_STOCK",
    quantity: 6,
    featured: true,
    images: JSON.stringify(["/manus-storage/product-cherry-spoon_420596a4.jpg"]),
    dimensions: '12" × 2" × 0.5"',
    careInstructions: "Hand wash only. Re-oil monthly with food-safe mineral oil.",
    leadTimeDays: null,
  },
  {
    name: "Walnut Spreader",
    slug: "walnut-spreader",
    description: "An elegant butter and cheese spreader in rich black walnut. The wide paddle and tapered handle make it as functional as it is beautiful.",
    price: 2800,
    woodType: "WALNUT",
    category: "KNIFE",
    status: "IN_STOCK",
    quantity: 8,
    featured: true,
    images: JSON.stringify(["/manus-storage/product-walnut-spreader_5cab500e.jpg"]),
    dimensions: '8" × 1.5" × 0.4"',
    careInstructions: "Hand wash only. Dry immediately.",
    leadTimeDays: null,
  },
  {
    name: "Maple Scoop",
    slug: "maple-scoop",
    description: "A deep-bowled scoop perfect for coffee, flour, or spices. Carved from hard maple with a smooth finish that resists staining.",
    price: 3200,
    woodType: "MAPLE",
    category: "SCOOP",
    status: "IN_STOCK",
    quantity: 4,
    featured: true,
    images: JSON.stringify(["/manus-storage/product-maple-scoop_7a14113f.jpg"]),
    dimensions: '9" × 2.5" × 1.5"',
    careInstructions: "Hand wash only. Avoid soaking.",
    leadTimeDays: null,
  },
  {
    name: "Walnut Serving Board",
    slug: "walnut-serving-board",
    description: "A generous charcuterie and serving board in figured black walnut. The live edge and natural grain make every board a one-of-a-kind centerpiece.",
    price: 12500,
    woodType: "WALNUT",
    category: "SERVING",
    status: "IN_STOCK",
    quantity: 2,
    featured: true,
    images: JSON.stringify(["/manus-storage/product-serving-board_10ae6fcc.jpg"]),
    dimensions: '18" × 10" × 0.75"',
    careInstructions: "Hand wash only. Oil regularly with cutting board oil.",
    leadTimeDays: null,
  },
  {
    name: "Spoon Set of Three",
    slug: "spoon-set-of-three",
    description: "A curated set of three hand-carved cooking spoons in cherry, walnut, and maple — a perfect housewarming or wedding gift.",
    price: 9800,
    woodType: "MIXED",
    category: "SPOON",
    status: "IN_STOCK",
    quantity: 3,
    featured: true,
    images: JSON.stringify(["/manus-storage/product-spoon-set_e3b96193.jpg"]),
    dimensions: '12"–14" × 2"',
    careInstructions: "Hand wash only. Re-oil monthly.",
    leadTimeDays: null,
  },
  {
    name: "Custom Knife Handle",
    slug: "custom-knife-handle",
    description: "Bring your own blade or choose from our blanks — we'll carve a handle in your choice of wood species, shaped to fit your hand perfectly.",
    price: 8500,
    woodType: "CHERRY",
    category: "KNIFE",
    status: "MADE_TO_ORDER",
    quantity: 0,
    featured: false,
    images: JSON.stringify(["/manus-storage/product-custom-knife_87e24ce5.jpg"]),
    dimensions: "Custom",
    careInstructions: "Hand wash only. Oil as needed.",
    leadTimeDays: 21,
  },
  {
    name: "Walnut Salad Bowl",
    slug: "walnut-salad-bowl",
    description: "A wide, shallow salad bowl turned on the lathe from a single walnut blank. The natural grain swirls create a stunning visual centerpiece.",
    price: 16500,
    woodType: "WALNUT",
    category: "SERVING",
    status: "IN_STOCK",
    quantity: 1,
    featured: true,
    images: JSON.stringify(["/manus-storage/product-walnut-bowl_86905109.jpg"]),
    dimensions: '14" diameter × 4" deep',
    careInstructions: "Hand wash only. Oil regularly with food-safe mineral oil.",
    leadTimeDays: null,
  },
];

const TRADE_SHOWS = [
  {
    name: "Nebraska Craft Fair",
    location: "Omaha, NE",
    address: "1804 Capitol Ave, Omaha, NE 68102",
    boothNumber: "42",
    startDate: new Date("2026-06-14"),
    endDate: new Date("2026-06-15"),
    isActive: true,
    notes: "Our biggest show of the year. Bring the full collection.",
  },
  {
    name: "Lincoln Artisan Market",
    location: "Lincoln, NE",
    address: "200 N 11th St, Lincoln, NE 68508",
    boothNumber: "C-7",
    startDate: new Date("2026-07-19"),
    endDate: new Date("2026-07-20"),
    isActive: true,
    notes: null,
  },
  {
    name: "Kansas City Makers Expo",
    location: "Kansas City, MO",
    address: "301 W 13th St, Kansas City, MO 64105",
    boothNumber: "B-12",
    startDate: new Date("2026-09-05"),
    endDate: new Date("2026-09-07"),
    isActive: true,
    notes: "Three-day show. Plan extra inventory.",
  },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  console.log("Seeding products…");
  for (const p of PRODUCTS) {
    try {
      await connection.execute(
        `INSERT IGNORE INTO products (name, slug, description, price, woodType, category, status, quantity, featured, images, dimensions, careInstructions, leadTimeDays)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.name, p.slug, p.description, p.price, p.woodType, p.category, p.status, p.quantity, p.featured ? 1 : 0, p.images, p.dimensions, p.careInstructions, p.leadTimeDays]
      );
      console.log(`  ✓ ${p.name}`);
    } catch (err) {
      console.log(`  ⚠ ${p.name}: ${err.message}`);
    }
  }

  console.log("Seeding trade shows…");
  for (const s of TRADE_SHOWS) {
    try {
      await connection.execute(
        `INSERT IGNORE INTO trade_shows (name, location, address, boothNumber, startDate, endDate, isActive, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.name, s.location, s.address, s.boothNumber, s.startDate, s.endDate, s.isActive ? 1 : 0, s.notes]
      );
      console.log(`  ✓ ${s.name}`);
    } catch (err) {
      console.log(`  ⚠ ${s.name}: ${err.message}`);
    }
  }

  await connection.end();
  console.log("Seed complete.");
}

seed().catch(console.error);
