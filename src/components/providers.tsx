"use client";
import { SessionProvider } from "next-auth/react";
import { MotionConfig } from "framer-motion";
import { CartProvider } from "@/lib/cart-context";
import { CartDrawer } from "@/components/layout/cart-drawer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Honour the OS "reduce motion" setting for every framer-motion animation */}
      <MotionConfig reducedMotion="user">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </MotionConfig>
    </SessionProvider>
  );
}
