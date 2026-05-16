import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  concern: z.string().min(2),
  quote: z.string().min(10).max(500),
  rating: z.number().int().min(1).max(5),
});

export async function GET() {
  const testimonials = await db.testimonial.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, concern: true, quote: true, rating: true, createdAt: true },
  });
  return NextResponse.json(testimonials);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const data = schema.parse(body);

    const testimonial = await db.testimonial.create({
      data: {
        ...data,
        userId: session?.user?.id ?? null,
      },
    });
    return NextResponse.json(testimonial, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
