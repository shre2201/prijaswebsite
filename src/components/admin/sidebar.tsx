"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarCheck, ShoppingBag, Package, Users, BarChart3, FileText, LogOut, Settings, Star, Sparkles, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/services", label: "Services", icon: Sparkles },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/testimonials", label: "Reviews", icon: Star },
  { href: "/admin/blog", label: "Blog", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-foreground text-background flex flex-col sticky top-0">
      <div className="p-4 border-b border-background/10">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Prijas" width={36} height={36} className="object-contain brightness-0 invert" />
          <span className="font-serif text-base font-semibold text-primary">Admin</span>
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-background/60 hover:bg-background/10 hover:text-background"
              )}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-background/10 space-y-0.5">
        <Link
          href="/admin/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname === "/admin/settings"
              ? "bg-primary text-primary-foreground"
              : "text-background/60 hover:bg-background/10 hover:text-background"
          )}
        >
          <Settings className="h-4 w-4" /> Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-background/60 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
