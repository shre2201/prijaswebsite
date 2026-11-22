import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fromDayKey } from "@/lib/calendar";
import { eventSchema } from "@/lib/calendar-schema";

/** Admin: events + bookings between ?from=YYYY-MM-DD and ?to=YYYY-MM-DD (inclusive). */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from"), to = searchParams.get("to");
  if (!from || !to) return NextResponse.json({ error: "from and to are required" }, { status: 400 });
  const range = { gte: fromDayKey(from), lte: fromDayKey(to) };

  const [events, bookings] = await Promise.all([
    db.calendarEvent.findMany({ where: { date: range }, orderBy: [{ date: "asc" }, { startTime: "asc" }] }),
    db.booking.findMany({
      where: { date: range },
      orderBy: { date: "asc" },
      include: { user: { select: { name: true, email: true, phone: true } } },
    }),
  ]);
  return NextResponse.json({ events, bookings });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const d = eventSchema.parse(await req.json());
    const event = await db.calendarEvent.create({
      data: {
        title: d.title,
        date: fromDayKey(d.date),
        allDay: d.allDay,
        startTime: d.allDay ? null : d.startTime ?? null,
        endTime: d.allDay ? null : d.endTime ?? null,
        notes: d.notes || null,
        blocksBookings: d.blocksBookings,
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid" }, { status: 422 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
