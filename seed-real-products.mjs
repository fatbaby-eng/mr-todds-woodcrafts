import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const products = [
  {
    name: "Lilac Wood Spiral Spoon",
    slug: "lilac-spiral-spoon",
    description: `A short, hand-carved spoon from lilac wood — a wood most people never get to hold. The handle is carved in a spiral beaded pattern, each segment shaped by hand. The bowl is wide and shallow, sized for honey, salt, or a small scoop of anything worth savoring.

Lilac is a rare carving wood. It doesn't grow large, so pieces like this come from branches, not boards. The grain runs warm amber and the wood has a subtle natural fragrance that lingers even after finishing.

Finished with food-safe mineral oil. Ready to use.

Approximate length: 5 inches.`,
    price: 3200,
    category: "SPOON",
    woodType: "OTHER",
    dimensions: "5 inches length",
    quantity: 1,
    featured: true,
    images: JSON.stringify(["/products/lilac-spiral-spoon.jpg"]),
  },
  {
    name: "Cherry Wood Coffee Scoop with Ring Handle",
    slug: "cherry-coffee-scoop-ring",
    description: `A hand-carved cherry wood coffee scoop with a carved ring at the end of the handle. The bowl is deep and round — sized for a standard tablespoon scoop. The ring handle is carved from the same piece of wood, no joints, no glue.

Cherry darkens beautifully with age and use. The grain on this piece has natural figure that catches the light differently depending on the angle.

Finished with food-safe mineral oil. Hangs from a hook or sits on the counter. Either way it's the nicest thing near your coffee.

Approximate length: 8 inches.`,
    price: 4200,
    category: "SCOOP",
    woodType: "CHERRY",
    dimensions: "8 inches length",
    quantity: 1,
    featured: true,
    images: JSON.stringify(["/products/cherry-coffee-scoop-ring.jpg"]),
  },
  {
    name: "Cherry Wood Wave Sculpture",
    slug: "cherry-wave-sculpture",
    description: `This is not a spoon. It's not a tool. It's a carved cherry wood object — a smooth sphere at one end, a flowing S-curve wave through the body, tapering to a point. Carved from a single piece of cherry, no cuts, no joints.

It lives on a desk. It sits in your hand while you think. It's the kind of thing people pick up and don't put down.

The cherry grain flows through the curves in a way that only happens when you carve with the wood instead of against it. Finished with beeswax and mineral oil until it feels like something that's been held for years.

One of a kind.`,
    price: 5500,
    category: "CUSTOM",
    woodType: "CHERRY",
    dimensions: "7 inches length",
    quantity: 1,
    featured: true,
    images: JSON.stringify(["/products/cherry-wave-sculpture.jpg"]),
  },
  {
    name: "Hand-Carved Cherry Wood Bowl",
    slug: "cherry-hand-carved-bowl",
    description: `A low, wide, hand-carved bowl in cherry. Oval form, shallow depth, carved entirely by hand. The grain swirls through the interior like water — no two pieces of cherry look the same, and this one earned its character.

The exterior shows the natural surface of the wood with its original contours preserved. A few small knots and marks remain where the tree left them. That's not a flaw. That's the record of a living thing.

Use it for fruit, bread, keys, jewelry, or just set it on a table and let it be what it is.

Finished with food-safe mineral oil. Approximately 10 × 7 inches, 2 inches tall.`,
    price: 6800,
    category: "SERVING",
    woodType: "CHERRY",
    dimensions: "10 × 7 × 2 inches",
    quantity: 1,
    featured: true,
    images: JSON.stringify([
      "/products/cherry-bowl-side.jpg",
      "/products/cherry-bowl-top.jpg",
      "/products/cherry-bowl-ext.jpg",
    ]),
  },
];

console.log("Adding real products to database...");

for (const product of products) {
  try {
    await connection.execute(
      `INSERT INTO products (name, slug, description, price, category, woodType, dimensions, quantity, featured, images, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         description = VALUES(description),
         price = VALUES(price),
         images = VALUES(images),
         featured = VALUES(featured),
         updatedAt = NOW()`,
      [
        product.name,
        product.slug,
        product.description,
        product.price,
        product.category,
        product.woodType,
        product.dimensions,
        product.quantity,
        product.featured ? 1 : 0,
        product.images,
      ]
    );
    console.log(`✓ ${product.name}`);
  } catch (err) {
    console.error(`✗ ${product.name}:`, err.message);
  }
}

await connection.end();
console.log("Done.");
