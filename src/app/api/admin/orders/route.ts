import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  items: z.array(z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    quantity: z.number().int().min(1),
  })).min(1, "Add at least one item"),
  total: z.number().positive(),
  paymentStatus: z.enum(["PENDING", "PAID"]).default("PENDING"),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = schema.parse(await req.json());

    const customer = await db.user.findUnique({ where: { id: data.customerId, role: "CUSTOMER" } });
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const order = await db.order.create({
      data: {
        userId: data.customerId,
        total: data.total,
        status: "CONFIRMED",
        paymentStatus: data.paymentStatus,
        shippingAddress: {
          adminPlaced: true,
          note: data.note ?? "",
          cartItems: data.items,
        },
      },
    });
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 422 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
