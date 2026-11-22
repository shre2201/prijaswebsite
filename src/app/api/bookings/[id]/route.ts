import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { sendBookingStatusUpdate } from "@/lib/email";
import { formatDate } from "@/lib/utils";

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "RESCHEDULED"]).optional(),
  adminNotes: z.string().optional(),
  followUpAt: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = updateSchema.parse(body);

    const before = await db.booking.findUnique({ where: { id: params.id }, select: { status: true } });

    const booking = await db.booking.update({
      where: { id: params.id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.adminNotes !== undefined && { adminNotes: data.adminNotes }),
        ...(data.followUpAt && { followUpAt: new Date(data.followUpAt) }),
      },
      include: { user: { select: { name: true, email: true } } },
    });

    // Tell the client when Harsheen confirms or cancels (only on an actual change).
    if (data.status && data.status !== before?.status && (data.status === "CONFIRMED" || data.status === "CANCELLED")) {
      const to = booking.email ?? booking.user?.email;
      if (to) {
        await sendBookingStatusUpdate({
          to,
          name: booking.name ?? booking.user?.name ?? "there",
          date: formatDate(booking.date),
          timeSlot: booking.timeSlot,
          mode: booking.mode,
          status: data.status,
        });
      }
    }

    return NextResponse.json(booking);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: { user: { select: { name: true, email: true, phone: true, profile: true } } },
    });

    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = booking.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json(booking);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
