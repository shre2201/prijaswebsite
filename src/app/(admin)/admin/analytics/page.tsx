import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, Users, CalendarCheck, Repeat2 } from "lucide-react";

async function getAnalytics() {
  const [
    bookingsByStatus,
    ordersByStatus,
    revenueResult,
    totalCustomers,
    repeatCustomers,
    topProducts,
  ] = await Promise.all([
    db.booking.groupBy({ by: ["status"], _count: { _all: true } }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    db.order.aggregate({ _sum: { total: true }, where: { status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] } } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.user.count({ where: { role: "CUSTOMER", orders: { some: {} }, bookings: { some: {} } } }),
    db.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  return { bookingsByStatus, ordersByStatus, revenue: Number(revenueResult._sum.total ?? 0), totalCustomers, repeatCustomers, topProducts };
}

export default async function AnalyticsPage() {
  const data = await getAnalytics();

  const bookingTotal = data.bookingsByStatus.reduce((s, b) => s + b._count._all, 0);
  const conversionRate = bookingTotal > 0
    ? Math.round(((data.ordersByStatus.find(o => o.status === "CONFIRMED")?._count._all ?? 0) / bookingTotal) * 100)
    : 0;

  const METRICS = [
    { label: "Total Revenue", value: formatPrice(data.revenue), icon: TrendingUp, sub: "All confirmed orders" },
    { label: "Total Customers", value: data.totalCustomers, icon: Users, sub: "Registered accounts" },
    { label: "Consultation → Order Rate", value: `${conversionRate}%`, icon: CalendarCheck, sub: "Conversion rate" },
    { label: "Repeat Customers", value: data.repeatCustomers, icon: Repeat2, sub: "Booked + ordered" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Business performance overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {METRICS.map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <m.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bookings by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.bookingsByStatus.map((b) => (
                <div key={b.status} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-foreground">{b.status.toLowerCase()}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: bookingTotal > 0 ? `${(b._count._all / bookingTotal) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-6 text-right">{b._count._all}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {data.ordersByStatus.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-6">No orders yet</p>
            )}
            <div className="space-y-3">
              {data.ordersByStatus.map((o) => {
                const orderTotal = data.ordersByStatus.reduce((s, x) => s + x._count._all, 0);
                return (
                  <div key={o.status} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{o.status.toLowerCase()}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: orderTotal > 0 ? `${(o._count._all / orderTotal) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-6 text-right">{o._count._all}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
