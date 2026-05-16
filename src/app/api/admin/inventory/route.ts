import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const materialSchema = z.object({
  name: z.string().min(2),
  stock: z.number().positive(),
  unit: z.string(),
  lowStockThreshold: z.number().positive(),
  supplier: z.string().optional(),
  costPerUnit: z.number().positive().optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
}

export async function GET() {
  try {
    await requireAdmin();
    const materials = await db.rawMaterial.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(materials);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = materialSchema.parse(body);
    const material = await db.rawMaterial.create({ data });
    return NextResponse.json(material, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Forbidden or server error" }, { status: 403 });
  }
}

