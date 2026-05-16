"use client";
import { useState } from "react";
import { formatDate, formatPrice } from "@/lib/utils";
import { ShoppingBag, CalendarDays, User, Package, Video, Phone, MapPin, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Order, Booking, ConsultationMode, BookingStatus, OrderStatus } from "@prisma/client";

interface CartItem { name: string; price: number; quantity: number; emoji?: string; }
interface ShippingAddress { name: string; phone: string; address: string; city: string; state: string; pincode: string; cartItems?: CartItem[]; }

type Tab = "orders" | "bookings" | "profile";

const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-sky-100 text-sky-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const BOOKING_STATUS_STYLE: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  RESCHEDULED: "bg-purple-100 text-purple-700",
};

const MODE_ICONS: Record<ConsultationMode, React.ElementType> = {
  VIDEO: Video,
  PHONE: Phone,
  IN_PERSON: MapPin,
};

function StatusBadge({ label, className }: { label: string; className: string }) {
  return (
    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", className)}>
      {label.replace(/_/g, " ")}
    </span>
  );
}

export function AccountClient({
  orders,
  bookings,
  user,
}: {
  orders: Order[];
  bookings: Booking[];
  user: { id: string; name: string; email: string; phone: string | null; createdAt: Date };
}) {
  const [tab, setTab] = useState<Tab>("orders");

  const tabs = [
    { id: "orders" as Tab, label: "Orders", icon: ShoppingBag, count: orders.length },
    { id: "bookings" as Tab, label: "Bookings", icon: CalendarDays, count: bookings.length },
    { id: "profile" as Tab, label: "Profile", icon: User },
  ];

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">My Account</p>
        <h1 className="font-serif text-2xl font-semibold">Welcome back, {user.name.split(" ")[0]}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-7 border-b border-border/40">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors",
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="bg-muted text-muted-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders Tab */}
      {tab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-border/40">
              <Package className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
              <Button asChild className="rounded-full mt-4" size="sm">
                <Link href="/#products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            orders.map((order) => {
              const addr = order.shippingAddress as ShippingAddress | null;
              const cartItems = addr?.cartItems ?? [];
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-border/40 overflow-hidden">
                  {/* Order header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border/30 bg-muted/10">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Order</p>
                        <p className="font-mono text-sm font-semibold">#{order.id.slice(-8).toUpperCase()}</p>
                      </div>
                      <StatusBadge label={order.status} className={ORDER_STATUS_STYLE[order.status]} />
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Placed on</p>
                        <p className="text-[13px] font-medium">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-[13px] font-bold text-foreground">{formatPrice(Number(order.total))}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-5 py-4 space-y-2">
                    {cartItems.length > 0 ? (
                      cartItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cream to-green-50 flex items-center justify-center text-base flex-shrink-0">
                            {item.emoji ?? "🌿"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-foreground leading-snug">{item.name}</p>
                            <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <span className="text-[13px] font-semibold text-foreground">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[13px] text-muted-foreground italic">Item details not recorded.</p>
                    )}
                  </div>

                  {/* Shipping address */}
                  {addr && (
                    <div className="px-5 pb-4">
                      <p className="text-[11px] text-muted-foreground">
                        Delivering to: {addr.name}, {addr.address}, {addr.city} – {addr.pincode} · {addr.phone}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {tab === "bookings" && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-border/40">
              <CalendarDays className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No consultations booked yet</p>
              <Button asChild className="rounded-full mt-4" size="sm">
                <Link href="/#consultation">Book a Consultation</Link>
              </Button>
            </div>
          ) : (
            bookings.map((booking) => {
              const ModeIcon = MODE_ICONS[booking.mode];
              const isPast = new Date(booking.date) < new Date();
              return (
                <div key={booking.id} className="bg-white rounded-2xl border border-border/40 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0", isPast ? "bg-muted" : "bg-primary/10")}>
                        <ModeIcon className={cn("h-4 w-4", isPast ? "text-muted-foreground" : "text-primary")} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[13px] font-semibold">{booking.mode.replace("_", " ")} Consultation</p>
                          <StatusBadge label={booking.status} className={BOOKING_STATUS_STYLE[booking.status]} />
                        </div>
                        <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(booking.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {booking.timeSlot}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {booking.concerns.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/30">
                      {booking.concerns.map((c) => (
                        <span key={c} className="text-[11px] bg-primary/8 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {booking.adminNotes && (
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <p className="text-[12px] text-muted-foreground">
                        <span className="font-medium text-foreground">Note from Prijas:</span> {booking.adminNotes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Profile Tab */}
      {tab === "profile" && (
        <div className="bg-white rounded-2xl border border-border/40 p-6 max-w-md space-y-5">
          <h2 className="font-semibold text-base">Your Information</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Full Name</label>
              <p className="text-sm font-medium text-foreground">{user.name}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
              <p className="text-sm font-medium text-foreground">{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Phone</label>
                <p className="text-sm font-medium text-foreground">{user.phone}</p>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Member Since</label>
              <p className="text-sm font-medium text-foreground">{formatDate(user.createdAt)}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-border/40 space-y-2">
            <div className="flex items-start gap-2 text-[12px] text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              Order history is updated in real time
            </div>
            <div className="flex items-start gap-2 text-[12px] text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              Booking confirmations are sent to your email
            </div>
            <div className="flex items-start gap-2 text-[12px] text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              To update your details, email us at prijasskincare@gmail.com
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
