"use client";
import { useCart } from "@/lib/cart-context";
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, count, total, isOpen, closeCart, removeItem, updateQty } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Your Cart</span>
            {count > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Your cart is empty</p>
              <button onClick={closeCart} className="mt-3 text-xs text-primary hover:underline">
                Continue shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-border/40 bg-cream/20">
                <div className="h-14 w-14 rounded-[2px] bg-travertine flex items-center justify-center text-2xl flex-shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground leading-snug line-clamp-2">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-foreground">{formatPrice(item.price)}</span>
                    {item.comparePrice && (
                      <span className="text-[11px] text-muted-foreground line-through">{formatPrice(item.comparePrice)}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => removeItem(item.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex items-center gap-1 border border-border/60 rounded-lg">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-muted transition-colors rounded-l-lg">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-medium w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-muted transition-colors rounded-r-lg">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border/40 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-bold text-foreground">{formatPrice(total)}</span>
            </div>
            <p className="text-[11px] text-muted-foreground bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-2">
              Delivery charges applicable as per Porter service rates at checkout.
            </p>
            <Button className="w-full rounded-full" asChild onClick={closeCart}>
              <Link href="/checkout" className="gap-2">
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <button onClick={closeCart} className="w-full text-xs text-center text-muted-foreground hover:underline">
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
