import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

async function main() {
  try {
    await db.execute(`
      INSERT INTO products (id, name, slug, description, price, category, wood_type, dimensions, quantity, status, images, featured)
      VALUES (UUID(), 'Apricot Apple Board', 'apricot-apple-board', 'A hand-carved apricot serving board shaped like an apple, complete with a carved leaf detail. Carved from a local Omaha apricot tree. Perfect for cutting, serving, or simply displaying as a kitchen centerpiece. One of one.', 8500, 'SERVING', 'APRICOT', '6.25" X 11" X 0.875"', 1, 'IN_STOCK', '["/images/products/apricot-apple-board.jpg"]', true)
    `);
    console.log("Inserted Apricot Apple Board successfully!");
  } catch (error) {
    console.error("Failed to insert:", error);
  } finally {
    process.exit(0);
  }
}

main();
