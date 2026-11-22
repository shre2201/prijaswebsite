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

// Descriptions are condensed from the Instagram captions.
const CATALOG = [
  { slug: "vitamin-c-moisturiser", name: "Vitamin C Moisturiser", description: "Antioxidant and anti-inflammatory. Supports collagen to help keep skin firm." },
  { slug: "kasturi-turmeric-moisturiser", name: "Kasturi Turmeric Moisturiser", description: "For tanning and dull skin. Helps fade dark spots and boosts healing." },
  { slug: "skin-treatment-cream", name: "Skin Treatment Cream", description: "Brightens and evens skin tone. Helps with acne scars and dark spots." },
  { slug: "calendula-avocado-soap", name: "Calendula + Avocado Soap", description: "Soothes and nourishes. Calms redness and irritated skin." },
  { slug: "all-purpose-face-pack", name: "All Purpose Face Pack", description: "Over 25 ingredients, including sandalwood, green tea and brahmi." },
  { slug: "coffee-scrub", name: "Coffee Scrub", description: "A homemade scrub made with ground coffee." },
  { slug: "hydration-gel", name: "Hydration Gel", description: "Vitamin B6, vitamin E and niacinamide — made for hot summers." },
  { slug: "hair-oil", name: "Hair Oil", description: "Nourishes hair, controls frizz and helps prevent hair fall." },
  { slug: "nourishing-hair-mask", name: "Organic Nourishing Hair Mask", description: "For dry, damaged hair and a scalp prone to hair fall." },
  { slug: "calamine-spf-50", name: "Calamine SPF 50", description: "Everyday sun protection with the soothing goodness of calamine." },
  { slug: "cc-cream", name: "CC Cream", description: "Medium-to-full coverage colour correction, with hydrating ingredients." },
  { slug: "tinted-lip-balm", name: "Tinted Lip Balm", description: "A small-batch tinted balm for soft lips." },
];

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
