import Link from "next/link";
import { db } from "@/lib/db";
import { ArrowRight, Video, Phone, MapPin } from "lucide-react";
import { dayKey, fromDayKey, hhmmToMinutes, minutesToLabel, slotToMinutes } from "@/lib/calendar";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MODE_ICON = { VIDEO: Video, PHONE: Phone, IN_PERSON: MapPin } as const;

function todayKeyIST() {
  // The studio works in Indian time; compute "today" there, not in the server's timezone.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

function fmtDay(d: Date) {
  return new Date(`${dayKey(d)}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

async function getData() {
  const today = fromDayKey(todayKeyIST());
  const [upcoming, pending, pendingReviews, productsShown, events] = await Promise.all([
    db.booking.findMany({
      where: { date: { gte: today }, status: { in: ["PENDING", "CONFIRMED"] } },
      orderBy: { date: "asc" },
      take: 30,
      include: { user: { select: { name: true, phone: true } } },
    }),
    db.booking.count({ where: { status: "PENDING", date: { gte: today } } }),
    db.testimonial.count({ where: { status: "PENDING" } }),
    db.product.count({ where: { isActive: true } }),
    db.calendarEvent.findMany({ where: { date: { gte: today } }, orderBy: [{ date: "asc" }, { startTime: "asc" }], take: 5 }),
  ]);
  // same-day ordering by time slot
  upcoming.sort((a, b) => a.date.getTime() - b.date.getTime() || (slotToMinutes(a.timeSlot) ?? 0) - (slotToMinutes(b.timeSlot) ?? 0));
  const todayCount = upcoming.filter((b) => dayKey(b.date) === dayKey(today)).length;
  return { upcoming: upcoming.slice(0, 8), upcomingTotal: upcoming.length, todayCount, pending, pendingReviews, productsShown, events };
}

export default async function AdminDashboard() {
  const d = await getData();

  const STATS = [
    { label: "Consultations today", value: d.todayCount, href: "/admin/calendar" },
    { label: "Upcoming consultations", value: d.upcomingTotal, href: "/admin/bookings" },
    { label: "Requests to confirm", value: d.pending, href: "/admin/bookings", accent: d.pending > 0 },
    { label: "Reviews to approve", value: d.pendingReviews, href: "/admin/testimonials", accent: d.pendingReviews > 0 },
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-clay">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" })}
        </p>
        <h1 className="font-display text-[2.2rem] font-light text-ink mt-2">Good to see you, Harsheen.</h1>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 border-t border-l border-border">
        {STATS.map((s) => (
          <Link key={s.label} href={s.href} className="border-r border-b border-border bg-card px-5 py-5 hover:bg-paper transition-colors">
            <p className={cn("font-display text-[2.4rem] leading-none", s.accent ? "text-clay" : "text-ink")}>{s.value}</p>
            <p className="mt-2 text-[0.85rem] text-stone">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-8">
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-[1.4rem] text-ink">Coming up</h2>
            <Link href="/admin/calendar" className="text-sm text-ink underline underline-offset-4 decoration-ink/30 hover:decoration-ink">Open calendar</Link>
          </div>
          <ul className="border-t border-border">
            {d.upcoming.length === 0 && <li className="py-8 text-sm text-stone">No consultations booked yet.</li>}
            {d.upcoming.map((b) => {
              const Icon = MODE_ICON[b.mode];
              const phone = b.phone ?? b.user?.phone;
              return (
                <li key={b.id} className="py-3.5 border-b border-border grid grid-cols-[7.5rem_1fr_auto] gap-4 items-center">
                  <div>
                    <p className="text-[0.85rem] text-ink">{fmtDay(b.date)}</p>
                    <p className="font-mono text-[0.72rem] text-stone">{b.timeSlot}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.95rem] text-ink truncate">{b.name ?? b.user?.name ?? "Guest"}</p>
                    <p className="text-[0.78rem] text-stone flex items-center gap-1.5 truncate">
                      <Icon className="h-3.5 w-3.5 shrink-0" /> {b.concerns.slice(0, 2).join(", ") || "Consultation"}
                      {phone ? ` · ${phone}` : ""}
                    </p>
                  </div>
                  <span className={cn(
                    "text-[0.68rem] px-2 py-0.5 rounded-full",
                    b.status === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-moss/10 text-moss"
                  )}>
                    {b.status === "PENDING" ? "to confirm" : "confirmed"}
                  </span>
                </li>
              );
            })}
          </ul>
          {d.upcomingTotal > d.upcoming.length && (
            <Link href="/admin/bookings" className="mt-3 inline-flex items-center gap-1 text-sm text-ink">
              All {d.upcomingTotal} upcoming <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </section>

        <aside className="space-y-8">
          <section>
            <h2 className="font-display text-[1.2rem] text-ink mb-3">Your next events</h2>
            <ul className="border-t border-border">
              {d.events.length === 0 && (
                <li className="py-4 text-sm text-stone">
                  Nothing yet. <Link href="/admin/calendar" className="underline underline-offset-4">Add one in the calendar</Link>.
                </li>
              )}
              {d.events.map((e) => {
                const s = e.startTime ? hhmmToMinutes(e.startTime) : null;
                return (
                  <li key={e.id} className="py-3 border-b border-border border-l-2 border-l-clay pl-3">
                    <p className="font-mono text-[0.7rem] text-stone">
                      {fmtDay(e.date)} · {e.allDay ? "All day" : s !== null ? minutesToLabel(s) : ""}
                    </p>
                    <p className="text-[0.92rem] text-ink">{e.title}</p>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="bg-card border border-border p-5">
            <p className="font-display text-[2rem] leading-none text-ink">{d.productsShown}</p>
            <p className="text-[0.85rem] text-stone mt-1.5">products shown on the website</p>
            <Link href="/admin/products" className="mt-3 inline-block text-sm text-ink underline underline-offset-4 decoration-ink/30">Manage products</Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
