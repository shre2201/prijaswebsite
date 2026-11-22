-- Harsheen's own calendar entries (leave, personal appointments, workshops…).
-- Stored like bookings: a calendar date plus local "HH:MM" times, so no timezone drift.
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "blocksBookings" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CalendarEvent_date_idx" ON "CalendarEvent"("date");
