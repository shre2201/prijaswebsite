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
  { label: "About", href: "/#about" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Products", href: "/#products" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Blog", href: "/blog" },
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
        className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-muted/60 transition-colors"
      >
        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">
          {initials}
        </div>
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-border/50 shadow-lg py-1 z-50">
          <div className="px-3 py-2 border-b border-border/40">
            <p className="text-xs font-semibold text-foreground truncate">{name}</p>
          </div>
          {role === "ADMIN" ? (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <ClipboardList className="h-3.5 w-3.5" /> Admin Dashboard
            </Link>
          ) : (
            <Link
              href="/account"
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors"
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

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const { count, openCart } = useCart();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isSignedIn = status === "authenticated";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/96 backdrop-blur-md border-b border-border/40 shadow-[0_1px_12px_rgba(0,0,0,0.06)]"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-5xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="Prijas Skincare"
            width={36}
            height={36}
            className="object-contain"
            priority
          />
          <span className="font-serif text-[15px] font-semibold text-foreground hidden sm:block">
            Prijas
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="px-3 py-1.5 text-[13px] text-foreground/60 hover:text-foreground rounded-lg hover:bg-muted/60 transition-all"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          {/* Cart icon */}
          {isSignedIn && session?.user?.role !== "ADMIN" && (
            <button
              onClick={openCart}
              className="relative p-2 rounded-lg hover:bg-muted/60 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-4.5 w-4.5 text-foreground/70" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
          )}

          {isSignedIn ? (
            <UserMenu name={session?.user?.name ?? "User"} role={session?.user?.role} />
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-[13px] h-8 px-3" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" className="text-[13px] h-8 px-4 rounded-full" asChild>
                <Link href="/#consultation">Book a consultation</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="md:hidden flex items-center gap-1">
          {isSignedIn && session?.user?.role !== "ADMIN" && (
            <button onClick={openCart} className="relative p-2 rounded-lg hover:bg-muted/60 transition-colors">
              <ShoppingBag className="h-4.5 w-4.5 text-foreground/70" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
          )}
          <button
            className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-border/50 px-5 py-5 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-border/40">
            {isSignedIn ? (
              <>
                {session?.user?.role === "ADMIN" ? (
                  <Button variant="outline" size="sm" className="rounded-full" asChild>
                    <Link href="/admin" onClick={() => setOpen(false)}>Admin Dashboard</Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="rounded-full" asChild>
                    <Link href="/account" onClick={() => setOpen(false)}>My Account</Link>
                  </Button>
                )}
                <Button size="sm" className="rounded-full" variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="rounded-full" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" className="rounded-full" asChild>
                  <Link href="/#consultation">Book a consultation</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
