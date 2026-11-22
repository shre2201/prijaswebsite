import { NextRequest, NextResponse } from "next/server";
import { ONLINE_ORDERS_ENABLED } from "@/lib/features";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";
import { formatPrice } from "@/lib/utils";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  // Online ordering is switched off (see src/lib/features.ts).
  if (!ONLINE_ORDERS_ENABLED) {
    return NextResponse.json({ error: "Online ordering is not available. Please book a consultation." }, { status: 410 });
  }
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        paymentId: razorpayPaymentId,
      },
      include: { user: { select: { name: true, email: true } } },
    });

    await sendOrderConfirmation({
      to: order.user.email,
      name: order.user.name,
      orderId: order.id,
      total: formatPrice(Number(order.total)),
    }).catch(() => {});

    return NextResponse.json({ success: true, order });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

