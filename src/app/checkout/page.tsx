"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CheckCircle2, Loader2, Package, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (items.length === 0 && !orderId) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-cream/20 pt-14">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground text-sm mb-6">Add some products before checking out.</p>
            <Button asChild className="rounded-full">
              <Link href="/#products">Browse Products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (orderId) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-cream/20 pt-14">
          <div className="max-w-md mx-auto px-5 sm:px-8 py-20 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
            <h2 className="font-serif text-2xl font-semibold">Order placed!</h2>
            <p className="text-muted-foreground text-sm">
              Your order <span className="font-mono font-medium text-foreground">{orderId.slice(-8).toUpperCase()}</span> has been received.
              We&apos;ll confirm it and get in touch with delivery details shortly.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/account">View Orders</Link>
              </Button>
              <Button className="rounded-full" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity, emoji: i.emoji })),
          shippingAddress: data,
          total,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      clearCart();
      setOrderId(json.id);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream/20 pt-14">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
          <h1 className="font-serif text-2xl font-semibold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Address form */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-2xl border border-border/40 p-6">
                <h2 className="font-semibold text-base mb-5">Delivery Address</h2>
                <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Full Name</label>
                      <Input {...register("name")} placeholder="Priya Sharma" />
                      {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Phone Number</label>
                      <Input {...register("phone")} type="tel" placeholder="+91 98765 43210" />
                      {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Address</label>
                    <Input {...register("address")} placeholder="Flat / House No., Street, Area" />
                    {errors.address && <p className="text-xs text-destructive mt-1">{errors.address.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">City</label>
                      <Input {...register("city")} placeholder="Mumbai" />
                      {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">State</label>
                      <Input {...register("state")} placeholder="Maharashtra" />
                      {errors.state && <p className="text-xs text-destructive mt-1">{errors.state.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Pincode</label>
                      <Input {...register("pincode")} placeholder="400001" maxLength={6} />
                      {errors.pincode && <p className="text-xs text-destructive mt-1">{errors.pincode.message}</p>}
                    </div>
                  </div>
                </form>
              </div>

              {/* Porter delivery note */}
              <div className="flex gap-3 items-start bg-amber-50 border border-amber-200/70 rounded-xl px-4 py-3">
                <Truck className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[13px] text-amber-800 leading-relaxed">
                  <span className="font-medium">Delivery via Porter.</span> Charges are calculated based on your delivery location and will be communicated before dispatch. We&apos;ll confirm your order total (including delivery) over WhatsApp or phone.
                </p>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-border/40 p-6 sticky top-20">
                <h2 className="font-semibold text-base mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cream to-green-50 flex items-center justify-center text-lg flex-shrink-0">
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-foreground leading-snug line-clamp-1">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-[13px] font-semibold text-foreground shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/40 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-amber-600 text-xs font-medium">As per Porter</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-border/40 pt-2 mt-1">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</div>
                )}

                <Button
                  type="submit"
                  form="checkout-form"
                  className="w-full rounded-full mt-5"
                  disabled={loading}
                >
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing order...</> : "Place Order"}
                </Button>

                <p className="text-[11px] text-center text-muted-foreground mt-3">
                  Payment will be collected on confirmation via UPI / bank transfer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
