import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@prijas.in";
  const password = process.env.ADMIN_PASSWORD ?? "prijas@admin123";
  if (process.env.NODE_ENV === "production" && (!process.env.ADMIN_PASSWORD || password.length < 10)) {
    throw new Error("Set a strong ADMIN_PASSWORD (10+ characters) before seeding a production database.");
  }
  const name = process.env.ADMIN_NAME ?? "Prijas Admin";

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "ADMIN") {
      await db.user.update({ where: { email }, data: { role: "ADMIN" } });
      console.log(`✔ Upgraded ${email} to ADMIN`);
    } else {
      console.log(`✔ Admin account already exists: ${email}`);
    }
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await db.user.create({
    data: { name, email, password: hashed, role: "ADMIN" },
  });

  console.log(`✔ Admin account created:`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`\n  → Change the password after first login!`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
