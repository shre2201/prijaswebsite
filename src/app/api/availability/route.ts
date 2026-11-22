import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BOOKING_SLOTS, eventCoversSlot, fromDayKey } from "@/lib/calendar";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Public: which booking slots are taken on ?date=YYYY-MM-DD.
 * Returns only slot labels — never who booked or what the event is.
 */
export async function GET(req: NextRequest) {
  if (!rateLimit(req, "availability", 60, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const date = new URL(req.url).searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date=YYYY-MM-DD required" }, { status: 400 });
  }
  const day = fromDayKey(date);
  const [bookings, events] = await Promise.all([
    db.booking.findMany({ where: { date: day, status: { not: "CANCELLED" } }, select: { timeSlot: true } }),
    db.calendarEvent.findMany({ where: { date: day, blocksBookings: true }, select: { allDay: true, startTime: true, endTime: true } }),
  ]);
  const taken = new Set(bookings.map((b) => b.timeSlot));
  for (const slot of BOOKING_SLOTS) if (events.some((e) => eventCoversSlot(e, slot))) taken.add(slot);
  return NextResponse.json({ taken: Array.from(taken) });
}
