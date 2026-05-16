import { db } from "@/lib/db";
import { CalendarCheck, Package, Users, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

async function getStats() {
  const [
    totalBookings,
    pendingBookings,
    totalOrders,
    revenueResult,
    totalCustomers,
    recentBookings,
    recentOrders,
  ] = await Promise.all([
    db.booking.count(),
    db.booking.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "CONFIRMED" } }),
    db.order.aggregate({ _sum: { total: true }, where: { status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] } } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
  ]);

  return { totalBookings, pendingBookings, totalOrders, revenue: Number(revenueResult._sum.total ?? 0), totalCustomers, recentBookings, recentOrders };
}

const STATUS_COLORS: Record<string, "default" | "warning" | "success" | "destructive" | "secondary"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

export default async function AdminDashboard() {
  const stats = await getStats();

  const STAT_CARDS = [
    { title: "Total Bookings", value: stats.totalBookings, icon: CalendarCheck, sub: `${stats.pendingBookings} pending` },
    { title: "Confirmed Orders", value: stats.totalOrders, icon: Package, sub: "This month" },
    { title: "Total Revenue", value: formatPrice(stats.revenue), icon: TrendingUp, sub: "All time" },
    { title: "Customers", value: stats.totalCustomers, icon: Users, sub: "Registered" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back — here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {STAT_CARDS.map((card) => (
          <Card key={card.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <card.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentBookings.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No bookings yet</p>
              )}
              {stats.recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                      {b.user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{b.user.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDate(b.date)} · {b.timeSlot}
                      </p>
                    </div>
                  </div>
                  <Badge variant={STATUS_COLORS[b.status] ?? "secondary"}>{b.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentOrders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
              )}
              {stats.recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-sage/20 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                      {o.user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{o.user.name}</p>
                      <p className="text-xs text-muted-foreground">#{o.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatPrice(Number(o.total))}</p>
                    <Badge variant={STATUS_COLORS[o.status] ?? "secondary"} className="text-xs">{o.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
