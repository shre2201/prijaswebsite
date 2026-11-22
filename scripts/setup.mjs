/**
 * Runs on every production start (after `prisma migrate deploy`). Safe to repeat:
 *  - creates the admin account once, from ADMIN_EMAIL / ADMIN_PASSWORD
 *  - adds any of the 12 catalogue products that are missing (never overwrites edits)
 */
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

async function ensureAdmin() {
  const admins = await db.user.count({ where: { role: "ADMIN" } });
  if (admins > 0) return console.log("[setup] admin account present");

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 10) {
    return console.warn("[setup] No admin yet — set ADMIN_EMAIL and ADMIN_PASSWORD (10+ characters) and redeploy.");
  }
  await db.user.create({
    data: { email, name: process.env.ADMIN_NAME || "Prijas Admin", password: await bcrypt.hash(password, 12), role: "ADMIN" },
  });
  console.log(`[setup] admin account created for ${email}`);
}

async function ensureCatalog() {
  const catalog = JSON.parse(readFileSync(new URL("../prisma/catalog.json", import.meta.url), "utf8"));
  let added = 0;
  for (const p of catalog) {
    const exists = await db.product.findUnique({ where: { slug: p.slug }, select: { id: true } });
    if (exists) continue;
    await db.product.create({
      data: {
        slug: p.slug, name: p.name, description: p.description,
        images: [`/products/catalog/${p.slug}.webp`],
        price: 0, stock: 0, category: "PERSONALIZED", isActive: true,
      },
    });
    added++;
  }
  console.log(`[setup] catalogue: ${added} product(s) added, ${catalog.length - added} already present`);
}

try {
  await ensureAdmin();
  await ensureCatalog();
} catch (e) {
  // Never block the site from starting because of setup.
  console.error("[setup] failed:", e);
} finally {
  await db.$disconnect();
  await pool.end();
}
