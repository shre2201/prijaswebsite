"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingActions } from "@/components/admin/booking-actions";
import { formatDate } from "@/lib/utils";
import { CalendarDays, List, Clock, Video, Phone, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Booking, User } from "@prisma/client";

type BookingWithUser = Booking & { user: Pick<User, "name" | "email" | "phone"> | null };

// Guest bookings carry their own contact details; older bookings only have the linked account.
function contact(b: BookingWithUser) {
  return {
    name: b.name ?? b.user?.name ?? "Guest",
    email: b.email ?? b.user?.email ?? "",
    phone: b.phone ?? b.user?.phone ?? "",
  };
}

const STATUS_COLORS: Record<string, "default" | "warning" | "success" | "destructive" | "secondary"> = {
  PENDING: "warning", CONFIRMED: "success", COMPLETED: "secondary", CANCELLED: "destructive", RESCHEDULED: "secondary",
};
const MODE_ICONS: Record<string, React.ElementType> = {
  VIDEO: Video, PHONE: Phone, IN_PERSON: MapPin,
};

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  return { first, days };
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function BookingsClient({ bookings }: { bookings: BookingWithUser[] }) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  const pending = bookings.filter((b) => b.status === "PENDING");
  const upcoming = bookings.filter((b) => b.status === "CONFIRMED" && b.date >= today);

  const { first, days } = getMonthDays(calYear, calMonth);

  function bookingsOnDay(day: number) {
    return bookings.filter((b) => {
      const d = new Date(b.date);
      return d.getFullYear() === calYear && d.getMonth() === calMonth && d.getDate() === day;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[2rem] font-light text-ink">Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {pending.length} pending · {upcoming.length} upcoming
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
          <button
            onClick={() => setView("list")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all", view === "list" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground")}
          >
            <List className="h-3.5 w-3.5" /> List
          </button>
          <button
            onClick={() => setView("calendar")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all", view === "calendar" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground")}
          >
            <CalendarDays className="h-3.5 w-3.5" /> Calendar
          </button>
        </div>
      </div>

      {view === "calendar" ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{MONTHS[calMonth]} {calYear}</CardTitle>
              <div className="flex gap-1">
                <button
                  onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {[...Array(first)].map((_, i) => <div key={`empty-${i}`} />)}
              {[...Array(days)].map((_, i) => {
                const day = i + 1;
                const dayBookings = bookingsOnDay(day);
                const isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && day === today.getDate();
                return (
                  <div
                    key={day}
                    className={cn(
                      "min-h-[60px] p-1.5 rounded-lg border border-transparent text-[11px] transition-colors",
                      dayBookings.length > 0 ? "bg-primary/5 border-primary/20" : "hover:bg-muted/30",
                      isToday && "ring-2 ring-primary ring-offset-1"
                    )}
                  >
                    <span className={cn("font-medium", isToday ? "text-primary" : "text-muted-foreground")}>{day}</span>
                    {dayBookings.map((b) => {
                      const ModeIcon = MODE_ICONS[b.mode] ?? Clock;
                      return (
                        <div key={b.id} className={cn(
                          "mt-0.5 px-1 py-0.5 rounded text-[9px] font-medium truncate flex items-center gap-0.5",
                          b.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                          b.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                          "bg-muted text-muted-foreground"
                        )}>
                          <ModeIcon className="h-2 w-2 shrink-0" />
                          {contact(b).name.split(" ")[0]} {b.timeSlot}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">No bookings yet</p>
            )}
            <div className="space-y-3">
              {bookings.map((booking) => {
                const ModeIcon = MODE_ICONS[booking.mode] ?? Clock;
                return (
                  <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                        {contact(booking).name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {contact(booking).name}
                          {!booking.userId && <span className="ml-2 text-[10px] font-normal text-muted-foreground uppercase tracking-wide">guest</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {contact(booking).email}{contact(booking).phone ? ` · ${contact(booking).phone}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(booking.date)} · {booking.timeSlot}
                          <ModeIcon className="h-3 w-3 ml-1" />
                          {booking.mode}
                        </p>
                        {booking.concerns.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {booking.concerns.slice(0, 3).map((c) => (
                              <span key={c} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{c}</span>
                            ))}
                            {booking.concerns.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">+{booking.concerns.length - 3}</span>
                            )}
                          </div>
                        )}
                        {booking.notes && (
                          <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-2">“{booking.notes}”</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant={STATUS_COLORS[booking.status] ?? "secondary"}>{booking.status}</Badge>
                      <BookingActions bookingId={booking.id} currentStatus={booking.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
