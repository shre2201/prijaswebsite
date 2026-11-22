"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, X, Truck, CheckCircle, Package, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus, User } from "@prisma/client";

type OrderRow = Omit<Order, "total"> & { total: number; user: Pick<User, "id" | "name" | "email"> };

interface CartItem { name: string; price: number; quantity: number; emoji?: string; }
interface ShippingAddress { name?: string; phone?: string; address?: string; city?: string; pincode?: string; cartItems?: CartItem[]; adminPlaced?: boolean; note?: string; }

const STATUS_BADGE: Record<OrderStatus, "warning" | "success" | "secondary" | "destructive" | "default"> = {
  PENDING: "warning", CONFIRMED: "success", PROCESSING: "default",
  SHIPPED: "default", DELIVERED: "secondary", CANCELLED: "destructive", REFUNDED: "secondary",
};

const NEXT_STATUS: Partial<Record<OrderStatus, { label: string; status: OrderStatus; icon: React.ElementType }>> = {
  PENDING: { label: "Confirm", status: "CONFIRMED", icon: CheckCircle },
  CONFIRMED: { label: "Mark Shipped", status: "SHIPPED", icon: Truck },
  SHIPPED: { label: "Mark Delivered", status: "DELIVERED", icon: Package },
};

const formSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  paymentStatus: z.enum(["PENDING", "PAID"]),
  note: z.string().optional(),
  items: z.array(z.object({
    name: z.string().min(1, "Item name required"),
    price: z.number().positive("Price required"),
    quantity: z.number().int().min(1),
  })).min(1, "Add at least one item"),
});
type FormData = z.infer<typeof formSchema>;

function PlaceOrderModal({ customers, onClose }: { customers: Pick<User, "id" | "name" | "email">[]; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { paymentStatus: "PENDING", items: [{ name: "", price: 0, quantity: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const total = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, total }),
      });
      const json = await res.json();
      if (!res.ok) { setError(typeof json.error === "string" ? json.error : "Failed to place order"); return; }
      router.refresh();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">Place Order for Customer</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</div>}

          <div>
            <label className="text-xs font-medium mb-1.5 block">Customer *</label>
            <select {...register("customerId")} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
              ))}
            </select>
            {errors.customerId && <p className="text-xs text-destructive mt-1">{errors.customerId.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium">Items *</label>
              <button type="button" onClick={() => append({ name: "", price: 0, quantity: 1 })} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Plus className="h-3 w-3" /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-[1fr_80px_50px_24px] gap-2 items-start">
                  <div>
                    <Input {...register(`items.${i}.name`)} placeholder="Item name" className="h-8 text-xs" />
                    {errors.items?.[i]?.name && <p className="text-[10px] text-destructive mt-0.5">{errors.items[i]?.name?.message}</p>}
                  </div>
                  <Input {...register(`items.${i}.price`, { valueAsNumber: true })} type="number" step="0.01" placeholder="₹" className="h-8 text-xs" />
                  <Input {...register(`items.${i}.quantity`, { valueAsNumber: true })} type="number" min="1" placeholder="Qty" className="h-8 text-xs" />
                  <button type="button" onClick={() => remove(i)} className="h-8 flex items-center justify-center text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {errors.items?.root && <p className="text-xs text-destructive mt-1">{errors.items.root.message}</p>}
          </div>

          <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
            <span className="text-sm font-medium">Total</span>
            <span className="font-bold text-foreground">{formatPrice(total)}</span>
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block">Payment Status</label>
            <div className="flex gap-2">
              {(["PENDING", "PAID"] as const).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register("paymentStatus")} value={s} className="text-primary" />
                  <span className="text-sm">{s === "PAID" ? "Paid" : "Payment Pending"}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block">Note (optional)</label>
            <Input {...register("note")} placeholder="Custom order note, delivery instructions…" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing…</> : "Place Order"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderActions({ order }: { order: OrderRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function update(status: OrderStatus) {
    setLoading(status);
    try {
      await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  const next = NEXT_STATUS[order.status];

  return (
    <div className="flex gap-2">
      {next && (
        <Button size="sm" variant="outline" onClick={() => update(next.status)} disabled={!!loading} className="text-xs h-7">
          {loading === next.status ? <Loader2 className="h-3 w-3 animate-spin" /> : <next.icon className="h-3 w-3 mr-1" />}
          {next.label}
        </Button>
      )}
      {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
        <Button size="sm" variant="outline" onClick={() => update("CANCELLED")} disabled={!!loading} className="text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/5">
          {loading === "CANCELLED" ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
          Cancel
        </Button>
      )}
    </div>
  );
}

export function OrdersClient({ orders, customers }: { orders: OrderRow[]; customers: Pick<User, "id" | "name" | "email">[] }) {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const pending = orders.filter((o) => o.status === "PENDING").length;
  const revenue = orders
    .filter((o) => ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(o.status))
    .reduce((s, o) => s + o.total, 0);

  const FILTERS: { key: OrderStatus | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "PENDING", label: "Pending" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "DELIVERED", label: "Delivered" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <>
      {showModal && <PlaceOrderModal customers={customers} onClose={() => setShowModal(false)} />}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[2rem] font-light text-ink">Orders</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {pending} pending · {formatPrice(revenue)} confirmed revenue
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> Place Order
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1 bg-muted/50 rounded-xl p-1 w-fit">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", filter === f.key ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {f.label}
              <span className="ml-1 opacity-60">({f.key === "all" ? orders.length : orders.filter((o) => o.status === f.key).length})</span>
            </button>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{filtered.length} order{filtered.length !== 1 ? "s" : ""}</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-10">No orders found</p>
            )}
            <div className="space-y-3">
              {filtered.map((order) => {
                const addr = order.shippingAddress as ShippingAddress | null;
                const items = addr?.cartItems ?? [];
                return (
                  <div key={order.id} className="rounded-xl border border-border/60 overflow-hidden">
                    {/* Header row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-muted/20 border-b border-border/30">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {order.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{order.user.name}</p>
                          <p className="text-xs text-muted-foreground">{order.user.email} · #{order.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <Badge variant={STATUS_BADGE[order.status]}>{order.status}</Badge>
                        {addr?.adminPlaced && <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">Admin placed</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                          <p className="font-bold text-sm">{formatPrice(order.total)}</p>
                        </div>
                        <OrderActions order={order} />
                      </div>
                    </div>
                    {/* Items */}
                    {items.length > 0 && (
                      <div className="px-4 py-2.5 flex flex-wrap gap-x-4 gap-y-1">
                        {items.map((item, i) => (
                          <span key={i} className="text-xs text-muted-foreground">
                            {item.emoji} {item.name} × {item.quantity} — {formatPrice(item.price * item.quantity)}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Delivery info */}
                    {addr && !addr.adminPlaced && addr.name && (
                      <div className="px-4 pb-2.5">
                        <p className="text-[11px] text-muted-foreground">
                          Ship to: {addr.name}, {addr.address}, {addr.city} {addr.pincode} · {addr.phone}
                        </p>
                      </div>
                    )}
                    {addr?.note && (
                      <div className="px-4 pb-2.5">
                        <p className="text-[11px] text-muted-foreground">Note: {addr.note}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
