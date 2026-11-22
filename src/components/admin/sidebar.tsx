"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarCheck, CalendarDays, ShoppingBag, Package, Users, FileText, LogOut, Settings, Star, Sparkles, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

// Orders and Analytics (revenue) are no longer linked: nothing is sold online —
// every product is made after a consultation. The pages still exist if needed.
const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/services", label: "Treatments", icon: Sparkles },
  { href: "/admin/testimonials", label: "Reviews", icon: Star },
  { href: "/admin/customers", label: "Clients", icon: Users },
  { href: "/admin/inventory", label: "Ingredients", icon: Package },
  { href: "/admin/blog", label: "Journal", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen bg-ink text-paper flex flex-col sticky top-0 shrink-0">
      <div className="px-4 py-5 border-b border-paper/10">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-paper">
            <Image src="/logo.png" alt="" width={28} height={27} className="object-contain" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[1.35rem]">Prijas</span>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-paper/50 mt-1">Studio admin</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-[0.9rem] transition-colors border-l-2",
                active
                  ? "bg-paper/10 text-paper border-clay"
                  : "text-paper/65 border-transparent hover:bg-paper/5 hover:text-paper"
              )}
            >
              <link.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-paper/10 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[0.9rem] text-paper/65 hover:bg-paper/5 hover:text-paper transition-colors"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={1.5} /> View website
        </Link>
        <Link
          href="/admin/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-md text-[0.9rem] transition-colors",
            pathname === "/admin/settings"
              ? "bg-paper/10 text-paper"
              : "text-paper/65 hover:bg-paper/5 hover:text-paper"
          )}
        >
          <Settings className="h-4 w-4" strokeWidth={1.5} /> Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[0.9rem] text-paper/65 hover:bg-paper/5 hover:text-paper transition-colors"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} /> Sign out
        </button>
      </div>
    </aside>
  );
}
