import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalBookings,
      pendingBookings,
      totalOrders,
      revenueResult,
      totalCustomers,
      lowStockItems,
    ] = await Promise.all([
      db.booking.count(),
      db.booking.count({ where: { status: "PENDING" } }),
      db.order.count({ where: { status: "CONFIRMED" } }),
      db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.rawMaterial.count({ where: { stock: { lte: db.rawMaterial.fields.lowStockThreshold } } }),
    ]);

    return NextResponse.json({
      totalBookings,
      pendingBookings,
      totalOrders,
      revenue: Number(revenueResult._sum.total ?? 0),
      totalCustomers,
      lowStockItems,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

