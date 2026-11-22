/**
 * Shared calendar helpers.
 *
 * Dates: bookings and events store `date` as UTC midnight of the calendar day
 * (that's what `new Date("2026-12-01")` produces). Always read them back with the
 * UTC getters / `dayKey()` so a day never shifts in Indian time.
 * Times: bookings use slot labels like "09:30 AM"; events use "HH:MM" (24h).
 */
import { generateTimeSlots } from "@/lib/utils";

export const SLOT_MINUTES = 30;
export const BOOKING_SLOTS = generateTimeSlots().slice(0, 16); // what the booking form offers

/** "2026-12-01" for a stored date. */
export function dayKey(d: Date | string) {
  return new Date(d).toISOString().slice(0, 10);
}

/** Stored date for a "YYYY-MM-DD" string (UTC midnight). */
export function fromDayKey(key: string) {
  return new Date(`${key}T00:00:00.000Z`);
}

/** "09:30 AM" → 570 */
export function slotToMinutes(slot: string) {
  const m = slot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2]);
}

/** "14:30" → 870 */
export function hhmmToMinutes(t: string) {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** 870 → "2:30 PM" */
export function minutesToLabel(min: number) {
  const h = Math.floor(min / 60), m = min % 60;
  const suffix = h < 12 ? "AM" : "PM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

interface BlockingEvent { allDay: boolean; startTime: string | null; endTime: string | null }

/** Does a 30-minute booking slot overlap this event? */
export function eventCoversSlot(ev: BlockingEvent, slot: string) {
  if (ev.allDay) return true;
  const s = slotToMinutes(slot);
  const a = ev.startTime ? hhmmToMinutes(ev.startTime) : null;
  const b = ev.endTime ? hhmmToMinutes(ev.endTime) : null;
  if (s === null || a === null) return false;
  const end = b ?? a + SLOT_MINUTES;
  return s < end && s + SLOT_MINUTES > a;
}
