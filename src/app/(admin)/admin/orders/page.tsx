import { db } from "@/lib/db";
import { OrdersClient } from "./orders-client";

export default async function AdminOrdersPage() {
  const [orders, customers] = await Promise.all([
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    db.user.findMany({
      where: { role: "CUSTOMER" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serialized = orders.map((o) => ({ ...o, total: Number(o.total) }));
  return <OrdersClient orders={serialized} customers={customers} />;
}
