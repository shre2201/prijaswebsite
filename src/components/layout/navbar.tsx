"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ShoppingBag, User, LogOut, ClipboardList, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/lib/cart-context";

const NAV_LINKS = [
  { label: "Harsheen", href: "/#about" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Shop", href: "/#products" },
  { label: "Treatments", href: "/#services" },
  { label: "Journal", href: "/blog" },
];

function UserMenu({ name, role }: { name: string; role?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-ink/5 transition-colors" aria-label="Account menu" aria-expanded={open}
      >
        <div className="h-8 w-8 rounded-full bg-moss text-paper font-mono text-[11px] flex items-center justify-center">
          {initials}
        </div>
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-card rounded-md border border-border py-1 z-50 shadow-[0_12px_32px_-12px_rgba(37,32,27,0.25)]">
          <div className="px-3 py-2 border-b border-border/40">
            <p className="text-xs font-semibold text-foreground truncate">{name}</p>
          </div>
          {role === "ADMIN" ? (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-foreground/70 hover:text-foreground hover:bg-ink/5 transition-colors"
              onClick={() => setOpen(false)}
            >
              <ClipboardList className="h-3.5 w-3.5" /> Admin Dashboard
            </Link>
          ) : (
            <Link
              href="/account"
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-foreground/70 hover:text-foreground hover:bg-ink/5 transition-colors"
              onClick={() => setOpen(false)}
            >
              <User className="h-3.5 w-3.5" /> My Account
            </Link>
          )}
          <button
            onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-destructive hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function CartButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative h-11 w-11 flex items-center justify-center rounded-full hover:bg-ink/5 transition-colors"
      aria-label={`Open bag${count ? `, ${count} item${count > 1 ? "s" : ""}` : ""}`}
    >
      <ShoppingBag className="h-[18px] w-[18px] text-ink" strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute top-1.5 right-1 min-w-4 h-4 px-1 rounded-full bg-clay text-paper font-mono text-[9px] flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const { count, openCart } = useCart();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isSignedIn = status === "authenticated";
  const showCart = isSignedIn && session?.user?.role !== "ADMIN";

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-colors duration-300",
        scrolled || open ? "bg-paper border-b border-border" : "bg-transparent border-b border-transparent"
      )}
    >
      <nav className="shell flex items-center justify-between h-16" aria-label="Main">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <Image src="/logo.png" alt="" width={34} height={33} className="object-contain" priority />
          <span className="font-display text-[1.35rem] leading-none tracking-[-0.01em] text-ink">Prijas</span>
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-[0.9rem] text-ink/75 hover:text-ink transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          {showCart && <CartButton count={count} onClick={openCart} />}
          {isSignedIn ? (
            <UserMenu name={session?.user?.name ?? "User"} role={session?.user?.role} />
          ) : (
            <Link href="/login" className="text-[0.9rem] text-ink/75 hover:text-ink transition-colors px-2">
              Sign in
            </Link>
          )}
          <Button size="sm" className="h-10 px-5 text-[0.85rem]" asChild>
            <Link href="/#consultation">Book a consultation</Link>
          </Button>
        </div>

        <div className="lg:hidden flex items-center">
          {showCart && <CartButton count={count} onClick={openCart} />}
          <button
            className="h-11 w-11 flex items-center justify-center rounded-full hover:bg-ink/5 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-paper overflow-y-auto">
          <div className="shell flex flex-col pt-6 pb-10 min-h-full">
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.href} className="border-b border-border">
                  <Link
                    href={link.href}
                    className="flex items-center justify-between py-4 font-display text-[1.6rem] font-light text-ink"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-10 flex flex-col gap-3">
              <Button className="w-full h-12" asChild>
                <Link href="/#consultation" onClick={() => setOpen(false)}>Book a consultation</Link>
              </Button>
              {isSignedIn ? (
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-12" asChild>
                    <Link href={session?.user?.role === "ADMIN" ? "/admin" : "/account"} onClick={() => setOpen(false)}>
                      {session?.user?.role === "ADMIN" ? "Admin" : "My account"}
                    </Link>
                  </Button>
                  <Button variant="ghost" className="flex-1 h-12" onClick={() => signOut({ callbackUrl: "/" })}>
                    Sign out
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full h-12" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
