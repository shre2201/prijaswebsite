import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  items: z.array(z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number().int().min(1),
    emoji: z.string().optional(),
  })),
  shippingAddress: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
  }),
  total: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please sign in to place an order" }, { status: 401 });
    }

    const body = await req.json();
    const { items, shippingAddress, total } = schema.parse(body);

    // Store cart items inside shippingAddress JSON (products are hardcoded frontend-side,
    // no FK-safe productIds available yet).
    const order = await db.order.create({
      data: {
        userId: session.user.id,
        total,
        status: "PENDING",
        paymentStatus: "PENDING",
        shippingAddress: { ...shippingAddress, cartItems: items },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
