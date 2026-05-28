import "dotenv/config";
import { getDb } from "./server/db";
import { siteContent } from "./drizzle/schema";
import { eq } from "drizzle-orm";

const story = `Mr. Todd's Workshop started with trees that died in a yard in southeast Omaha. Two cherry and two apricot, planted by my mother-in-law about 35 years ago, taken down slowly by a nearby walnut. When the trees finally came down I could not bring myself to haul the wood off as firewood.

I have cut down three of the four. The last apricot is still standing, dead, waiting.

The first piece was a cane for her. The second was a baby toy. After that the work just kept going.

Hand tools mostly. Food-safe oil finishes. The grain decides as much as the maker does. No two pieces come out the same, and they aren't meant to be.

Run out of a workshop in Omaha, Nebraska, by Todd Boswell. Designer by trade, carver by accident.`;

async function run() {
  const db = await getDb();
  await db.update(siteContent).set({ value: "Started with\nFour Trees" }).where(eq(siteContent.key, "about_story_title"));
  await db.update(siteContent).set({ value: story }).where(eq(siteContent.key, "about_story_text"));
  console.log("DB Updated!");
  process.exit(0);
}

run();
