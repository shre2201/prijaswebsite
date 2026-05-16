import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendBookingConfirmation } from "@/lib/email";
import { sendBookingSMS, sendBookingWhatsApp } from "@/lib/sms";
import { z } from "zod";
import { formatDate } from "@/lib/utils";

const bookingSchema = z.object({
  date: z.string(),
  timeSlot: z.string(),
  mode: z.enum(["VIDEO", "PHONE", "IN_PERSON"]),
  concerns: z.array(z.string()),
  images: z.array(z.string()).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = bookingSchema.parse(body);

    const booking = await db.booking.create({
      data: {
        userId: session.user.id,
        date: new Date(data.date),
        timeSlot: data.timeSlot,
        mode: data.mode,
        concerns: data.concerns,
        images: data.images,
      },
      include: { user: { select: { name: true, email: true, phone: true } } },
    });

    const notifPayload = {
      name: booking.user.name,
      date: formatDate(booking.date),
      timeSlot: booking.timeSlot,
    };

    await Promise.allSettled([
      sendBookingConfirmation({ to: booking.user.email, mode: booking.mode, ...notifPayload }),
      booking.user.phone
        ? sendBookingSMS({ to: booking.user.phone, ...notifPayload })
        : Promise.resolve(),
      booking.user.phone
        ? sendBookingWhatsApp({ to: booking.user.phone, ...notifPayload })
        : Promise.resolve(),
    ]);

    return NextResponse.json(booking, { status: 201 });
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

