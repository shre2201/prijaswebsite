import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingBag, CalendarCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function CustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      profile: true,
      _count: { select: { bookings: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-muted-foreground text-sm mt-1">{customers.length} registered customers</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Customer CRM</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No customers yet</p>
            </div>
          )}
          <div className="space-y-3">
            {customers.map((customer) => (
              <div key={customer.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {customer.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.email}</p>
                    {customer.profile?.skinType && (
                      <Badge variant="secondary" className="text-xs mt-1">{customer.profile.skinType}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-5 text-sm text-muted-foreground flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <CalendarCheck className="h-4 w-4" />
                    <span className="font-medium text-foreground">{customer._count.bookings}</span> bookings
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="font-medium text-foreground">{customer._count.orders}</span> orders
                  </div>
                  <p className="text-xs">Joined {formatDate(customer.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
