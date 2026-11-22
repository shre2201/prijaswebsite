import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendBookingConfirmation, sendBookingNotification } from "@/lib/email";
import { sendBookingSMS, sendBookingWhatsApp } from "@/lib/sms";
import { z } from "zod";
import { formatDate } from "@/lib/utils";
import { eventCoversSlot, fromDayKey } from "@/lib/calendar";
import { rateLimit } from "@/lib/rate-limit";

const bookingSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(10).max(20),
  notes: z.string().trim().max(2000).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().min(1),
  mode: z.enum(["VIDEO", "PHONE", "IN_PERSON"]),
  concerns: z.array(z.string()).max(20),
  images: z.array(z.string()).optional().default([]),
});

// Anyone can book a consultation. If the visitor is signed in, the booking is
// also linked to their account so it shows up under "My account".
export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(req, "booking", 5, 10 * 60_000)) {
      return NextResponse.json({ error: "Too many requests — please try again in a few minutes." }, { status: 429 });
    }
    const session = await auth();

    const body = await req.json();
    // Honeypot: a hidden field real people never fill in. Pretend success for bots.
    if (typeof body?.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ id: "ok" }, { status: 201 });
    }
    const data = bookingSchema.parse(body);

    // Refuse a slot that's already booked or blocked by one of Harsheen's events.
    const day = fromDayKey(data.date);
    const [clash, events] = await Promise.all([
      db.booking.findFirst({ where: { date: day, timeSlot: data.timeSlot, status: { not: "CANCELLED" } }, select: { id: true } }),
      db.calendarEvent.findMany({ where: { date: day, blocksBookings: true }, select: { allDay: true, startTime: true, endTime: true } }),
    ]);
    if (clash || events.some((e) => eventCoversSlot(e, data.timeSlot))) {
      return NextResponse.json({ error: "slot_taken" }, { status: 409 });
    }

    const booking = await db.booking.create({
      data: {
        userId: session?.user?.id ?? null,
        name: data.name,
        email: data.email,
        phone: data.phone,
        notes: data.notes || null,
        date: day,
        timeSlot: data.timeSlot,
        mode: data.mode,
        concerns: data.concerns,
        images: data.images,
      },
    });

    const notifPayload = {
      name: data.name,
      date: formatDate(booking.date),
      timeSlot: booking.timeSlot,
    };

    const mail = { to: data.email, name: data.name, date: notifPayload.date, timeSlot: booking.timeSlot, mode: booking.mode };
    await Promise.allSettled([
      sendBookingConfirmation(mail),
      sendBookingNotification({ ...mail, phone: data.phone, concerns: data.concerns, notes: data.notes }),
      sendBookingSMS({ to: data.phone, ...notifPayload }),
      sendBookingWhatsApp({ to: data.phone, ...notifPayload }),
    ]);

    return NextResponse.json({ id: booking.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = 10;

    const where =
      session.user.role === "ADMIN"
        ? {}
        : { userId: session.user.id };

    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where,
        include: { user: { select: { name: true, email: true, phone: true } } },
        orderBy: { date: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.booking.count({ where }),
    ]);

    return NextResponse.json({ bookings, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

