import { z } from "zod";

const hhmm = z.string().regex(/^\d{2}:\d{2}$/);

/** Shape of a calendar event sent from the admin calendar. */
export const eventSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    allDay: z.boolean().default(false),
    startTime: hhmm.nullable().optional(),
    endTime: hhmm.nullable().optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
    blocksBookings: z.boolean().default(true),
  })
  .refine((e) => e.allDay || (e.startTime && e.endTime && e.endTime > e.startTime), {
    message: "Give a start and end time (end after start), or mark it all-day",
    path: ["endTime"],
  });
