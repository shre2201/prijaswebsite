/**
 * Adds (or refreshes) the products taken from the @prijas.skincare Instagram posts.
 * Images live in /public/products/catalog — transparent cut-outs, framed identically.
 *
 *   npm run import:catalog
 *
 * Safe to re-run: products are matched by slug. For existing products only the name,
 * description and image are refreshed; price, stock and visibility are left alone.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

// Descriptions are condensed from the Instagram captions. Shared with scripts/setup.mjs.
import CATALOG from "./catalog.json";

async function main() {
  for (const p of CATALOG) {
    const image = `/products/catalog/${p.slug}.webp`;
    await db.product.upsert({
      where: { slug: p.slug },
      update: { name: p.name, description: p.description, images: [image] },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        images: [image],
        price: 0, // not shown on the site; set it in the admin panel if you start selling online
        category: "PERSONALIZED",
        stock: 0,
        isActive: true,
      },
    });
    console.log("✔", p.name);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
