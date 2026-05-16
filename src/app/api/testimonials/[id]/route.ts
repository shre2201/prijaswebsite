import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendTestimonialApproved, sendTestimonialFollowUp } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "FOLLOWUP"]),
  adminNote: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { status, adminNote } = schema.parse(body);

    const testimonial = await db.testimonial.update({
      where: { id: params.id },
      data: { status, adminNote },
    });

    if (status === "APPROVED") {
      await sendTestimonialApproved({ to: testimonial.email, name: testimonial.name }).catch(() => {});
    } else if (status === "FOLLOWUP") {
      await sendTestimonialFollowUp({ to: testimonial.email, name: testimonial.name }).catch(() => {});
    }

    return NextResponse.json(testimonial);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
