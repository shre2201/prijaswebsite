import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { type ProductCategory, type Role } from "@prisma/client";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string(),
  // Prices aren't shown on the site — every product is made after a consultation.
  price: z.number().min(0).optional().default(0),
  comparePrice: z.number().positive().optional(),
  category: z.enum(["UNIVERSAL", "PERSONALIZED"]).optional().default("PERSONALIZED"),
  stock: z.number().int().min(0).optional().default(0),
  sku: z.string().optional(),
  images: z.array(z.string()),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "12");

  const products = await db.product.findMany({
    where: {
      isActive: true,
      ...(category && { category: category as ProductCategory }),
      ...(featured === "true" && { isFeatured: true }),
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await db.product.count({
    where: {
      isActive: true,
      ...(category && { category: category as ProductCategory }),
    },
  });

  return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if ((session?.user as { role?: Role })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = productSchema.parse(body);

    const product = await db.product.create({ data });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
