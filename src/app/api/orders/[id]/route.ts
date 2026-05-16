import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { type OrderStatus, type PaymentStatus } from "@prisma/client";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  adminNote: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = schema.parse(await req.json());
    const order = await db.order.update({
      where: { id: params.id },
      data: {
        ...(data.status && { status: data.status as OrderStatus }),
        ...(data.paymentStatus && { paymentStatus: data.paymentStatus as PaymentStatus }),
      },
      include: { user: { select: { name: true, email: true } } },
    });
    return NextResponse.json(order);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 422 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
