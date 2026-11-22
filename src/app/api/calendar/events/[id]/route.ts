import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fromDayKey } from "@/lib/calendar";
import { eventSchema } from "@/lib/calendar-schema";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const d = eventSchema.parse(await req.json());
    const event = await db.calendarEvent.update({
      where: { id: params.id },
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
    return NextResponse.json(event);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid" }, { status: 422 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await db.calendarEvent.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
