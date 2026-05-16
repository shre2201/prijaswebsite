import { db } from "@/lib/db";
import { BookingsClient } from "./bookings-client";

export default async function BookingsPage() {
  const bookings = await db.booking.findMany({
    orderBy: { date: "asc" },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });

  return <BookingsClient bookings={bookings} />;
}
