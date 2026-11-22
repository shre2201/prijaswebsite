"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Pencil, Loader2, Video, Phone, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { dayKey, hhmmToMinutes, minutesToLabel, slotToMinutes } from "@/lib/calendar";

interface CalEvent {
  id: string; title: string; date: string; allDay: boolean;
  startTime: string | null; endTime: string | null; notes: string | null; blocksBookings: boolean;
}
interface CalBooking {
  id: string; date: string; timeSlot: string; mode: "VIDEO" | "PHONE" | "IN_PERSON"; status: string;
  name: string | null; email: string | null; phone: string | null; notes: string | null; concerns: string[];
  user: { name: string; email: string; phone: string | null } | null;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MODE_ICON = { VIDEO: Video, PHONE: Phone, IN_PERSON: MapPin } as const;
const MODE_LABEL = { VIDEO: "Video", PHONE: "Phone", IN_PERSON: "In person" } as const;
const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-moss/10 text-moss",
  COMPLETED: "bg-ink/5 text-stone",
  CANCELLED: "bg-destructive/10 text-destructive line-through",
  RESCHEDULED: "bg-ink/5 text-stone",
};

// 30-minute steps for the event form, 7 AM – 10 PM
const TIMES = Array.from({ length: 31 }, (_, i) => {
  const m = 7 * 60 + i * 30;
  return { value: `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`, label: minutesToLabel(m) };
});

function key(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function todayKey() {
  const n = new Date();
  return key(n.getFullYear(), n.getMonth(), n.getDate());
}
/** "02:00 PM" → "2pm", "09:30 AM" → "9:30am" */
function shortTime(slot: string) {
  const m = slotToMinutes(slot);
  return m === null ? slot : minutesToLabel(m).replace(":00", "").replace(" ", "").toLowerCase();
}
function bookingName(b: CalBooking) {
  return b.name ?? b.user?.name ?? "Guest";
}
function eventTime(e: CalEvent) {
  if (e.allDay) return "All day";
  const a = e.startTime ? hhmmToMinutes(e.startTime) : null, b = e.endTime ? hhmmToMinutes(e.endTime) : null;
  return a !== null ? `${minutesToLabel(a)}${b !== null ? ` – ${minutesToLabel(b)}` : ""}` : "";
}
function sortMinutes(item: { kind: "booking"; b: CalBooking } | { kind: "event"; e: CalEvent }) {
  if (item.kind === "booking") return slotToMinutes(item.b.timeSlot) ?? 0;
  return item.e.allDay ? -1 : hhmmToMinutes(item.e.startTime ?? "00:00") ?? 0;
}

export function CalendarClient() {
  const now = new Date();
  const [month, setMonth] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(todayKey());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [bookings, setBookings] = useState<CalBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CalEvent | "new" | null>(null);

  // Grid: Monday-first weeks covering the month
  const cells = useMemo(() => {
    const first = new Date(month.y, month.m, 1);
    const offset = (first.getDay() + 6) % 7;
    const days = new Date(month.y, month.m + 1, 0).getDate();
    const out: { k: string; d: number; inMonth: boolean }[] = [];
    for (let i = 0; i < offset; i++) {
      const d = new Date(month.y, month.m, i - offset + 1);
      out.push({ k: key(d.getFullYear(), d.getMonth(), d.getDate()), d: d.getDate(), inMonth: false });
    }
    for (let d = 1; d <= days; d++) out.push({ k: key(month.y, month.m, d), d, inMonth: true });
    while (out.length % 7) {
      const d = new Date(month.y, month.m, days + (out.length - offset - days) + 1);
      out.push({ k: key(d.getFullYear(), d.getMonth(), d.getDate()), d: d.getDate(), inMonth: false });
    }
    return out;
  }, [month]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar/events?from=${cells[0].k}&to=${cells[cells.length - 1].k}`);
      if (res.ok) {
        const j = await res.json();
        setEvents(j.events);
        setBookings(j.bookings);
      }
    } finally {
      setLoading(false);
    }
  }, [cells]);

  useEffect(() => { load(); }, [load]);

  const byDay = useMemo(() => {
    const map = new Map<string, ({ kind: "booking"; b: CalBooking } | { kind: "event"; e: CalEvent })[]>();
    for (const b of bookings) {
      const k = dayKey(b.date);
      map.set(k, [...(map.get(k) ?? []), { kind: "booking", b }]);
    }
    for (const e of events) {
      const k = dayKey(e.date);
      map.set(k, [...(map.get(k) ?? []), { kind: "event", e }]);
    }
    map.forEach((list) => list.sort((x, y) => sortMinutes(x) - sortMinutes(y)));
    return map;
  }, [bookings, events]);

  const dayItems = byDay.get(selected) ?? [];
  const monthLabel = new Date(month.y, month.m, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const selectedLabel = new Date(`${selected}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  function shift(delta: number) {
    setMonth(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  async function removeEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    const res = await fetch(`/api/calendar/events/${id}`, { method: "DELETE" });
    if (res.ok) setEvents((list) => list.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[2rem] font-light text-ink">Calendar</h1>
          <p className="text-sm text-stone mt-1">
            Consultations booked on the website, plus your own events. Events can block those times from being booked.
          </p>
        </div>
        <Button onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Add event
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_22rem] gap-6 items-start">
        {/* Month */}
        <div className="bg-card border border-border rounded-md">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-1">
              <button onClick={() => shift(-1)} className="h-9 w-9 rounded-full hover:bg-ink/5 flex items-center justify-center" aria-label="Previous month">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => shift(1)} className="h-9 w-9 rounded-full hover:bg-ink/5 flex items-center justify-center" aria-label="Next month">
                <ChevronRight className="h-4 w-4" />
              </button>
              <h2 className="ml-2 font-display text-[1.3rem] text-ink">{monthLabel}</h2>
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-stone" />}
            </div>
            <button
              onClick={() => { setMonth({ y: now.getFullYear(), m: now.getMonth() }); setSelected(todayKey()); }}
              className="text-sm text-ink border border-ink/20 rounded-full px-3 h-8 hover:border-ink/50"
            >
              Today
            </button>
          </div>

          <div className="grid grid-cols-7 border-b border-border">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2 py-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-stone">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((c, i) => {
              const items = byDay.get(c.k) ?? [];
              const isToday = c.k === todayKey();
              return (
                <button
                  key={c.k}
                  onClick={() => setSelected(c.k)}
                  className={cn(
                    "min-h-[5.5rem] sm:min-h-[7rem] p-1.5 text-left border-border align-top flex flex-col gap-1 transition-colors",
                    i % 7 !== 6 && "border-r",
                    i < cells.length - 7 && "border-b",
                    !c.inMonth && "bg-paper/60 text-stone",
                    selected === c.k ? "bg-clay/[0.06] ring-1 ring-inset ring-clay/40" : "hover:bg-ink/[0.03]"
                  )}
                >
                  <span className={cn(
                    "text-[0.8rem] w-6 h-6 flex items-center justify-center rounded-full",
                    isToday && "bg-moss text-paper"
                  )}>{c.d}</span>
                  {items.slice(0, 3).map((it) =>
                    it.kind === "booking" ? (
                      <span key={it.b.id} className={cn(
                        "truncate rounded-sm px-1.5 py-0.5 text-[0.68rem] leading-tight",
                        it.b.status === "CANCELLED" ? "bg-ink/5 text-stone line-through" : "bg-moss text-paper"
                      )}>
                        <span className="hidden sm:inline">{shortTime(it.b.timeSlot)} </span>{bookingName(it.b)}
                      </span>
                    ) : (
                      <span key={it.e.id} className="truncate rounded-sm px-1.5 py-0.5 text-[0.68rem] leading-tight bg-clay/10 text-ink border-l-2 border-clay">
                        {it.e.title}
                      </span>
                    )
                  )}
                  {items.length > 3 && <span className="text-[0.66rem] text-stone px-1">+{items.length - 3} more</span>}
                </button>
              );
            })}
          </div>

          <div className="flex gap-5 px-4 py-3 border-t border-border text-[0.75rem] text-stone">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-moss" /> Consultation</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-clay/30 border border-clay/40" /> Your event</span>
          </div>
        </div>

        {/* Day agenda */}
        <aside className="bg-card border border-border rounded-md">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="font-display text-[1.2rem] text-ink">{selectedLabel}</h2>
            <button onClick={() => setEditing("new")} className="text-sm text-clay hover:underline underline-offset-4">+ Event</button>
          </div>
          <div className="p-4 space-y-3">
            {dayItems.length === 0 && <p className="text-sm text-stone py-6 text-center">Nothing on this day.</p>}
            {dayItems.map((it) => {
              if (it.kind === "booking") {
                const b = it.b, Icon = MODE_ICON[b.mode];
                return (
                  <div key={b.id} className="border-l-2 border-moss pl-3 py-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-[0.72rem] text-stone">{b.timeSlot}</p>
                      <span className={cn("text-[0.65rem] px-2 py-0.5 rounded-full", STATUS_STYLE[b.status] ?? "bg-ink/5")}>{b.status.toLowerCase()}</span>
                    </div>
                    <p className="text-[0.95rem] text-ink font-medium mt-0.5">{bookingName(b)}</p>
                    <p className="text-[0.8rem] text-stone flex items-center gap-1.5 mt-0.5">
                      <Icon className="h-3.5 w-3.5" /> {MODE_LABEL[b.mode]} consultation
                    </p>
                    {(b.phone ?? b.user?.phone) && (
                      <a href={`tel:${b.phone ?? b.user?.phone}`} className="text-[0.8rem] text-ink underline underline-offset-2 mt-1 inline-block">
                        {b.phone ?? b.user?.phone}
                      </a>
                    )}
                    {b.concerns.length > 0 && <p className="text-[0.78rem] text-stone mt-1">{b.concerns.join(", ")}</p>}
                    {b.notes && <p className="text-[0.78rem] text-stone italic mt-1">“{b.notes}”</p>}
                  </div>
                );
              }
              const e = it.e;
              return (
                <div key={e.id} className="border-l-2 border-clay pl-3 py-1 group">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[0.72rem] text-stone">{eventTime(e)}</p>
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(e)} className="h-7 w-7 rounded-full hover:bg-ink/5 flex items-center justify-center" aria-label="Edit event">
                        <Pencil className="h-3.5 w-3.5 text-stone" />
                      </button>
                      <button onClick={() => removeEvent(e.id)} className="h-7 w-7 rounded-full hover:bg-destructive/10 flex items-center justify-center" aria-label="Delete event">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[0.95rem] text-ink font-medium mt-0.5">{e.title}</p>
                  {e.notes && <p className="text-[0.8rem] text-stone mt-0.5">{e.notes}</p>}
                  <p className="text-[0.72rem] text-stone mt-1">{e.blocksBookings ? "Bookings blocked during this time" : "Doesn’t block bookings"}</p>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {editing && (
        <EventModal
          event={editing === "new" ? null : editing}
          defaultDate={selected}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setEvents((list) => [...list.filter((e) => e.id !== saved.id), saved]);
            setSelected(dayKey(saved.date));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function EventModal({
  event, defaultDate, onClose, onSaved,
}: { event: CalEvent | null; defaultDate: string; onClose: () => void; onSaved: (e: CalEvent) => void }) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [date, setDate] = useState(event ? dayKey(event.date) : defaultDate);
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [startTime, setStartTime] = useState(event?.startTime ?? "10:00");
  const [endTime, setEndTime] = useState(event?.endTime ?? "11:00");
  const [notes, setNotes] = useState(event?.notes ?? "");
  const [blocks, setBlocks] = useState(event?.blocksBookings ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(event ? `/api/calendar/events/${event.id}` : "/api/calendar/events", {
        method: event ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, allDay, startTime: allDay ? null : startTime, endTime: allDay ? null : endTime, notes, blocksBookings: blocks }),
      });
      const j = await res.json();
      if (!res.ok) { setError(typeof j.error === "string" ? j.error : "Couldn’t save the event"); return; }
      onSaved(j);
    } finally {
      setSaving(false);
    }
  }

  const label = "block text-[0.8rem] text-ink mb-1.5";
  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="ev-title">
      <form onSubmit={save} className="bg-card w-full max-w-md rounded-md border border-border shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 id="ev-title" className="font-display text-[1.3rem] text-ink">{event ? "Edit event" : "New event"}</h2>
          <button type="button" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-ink/5 flex items-center justify-center" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}
          <div>
            <label htmlFor="ev-name" className={label}>Title</label>
            <Input id="ev-name" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Studio closed, Workshop, Personal" required autoFocus />
          </div>
          <div>
            <label htmlFor="ev-date" className={label}>Date</label>
            <Input id="ev-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer">
            <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--moss))]" />
            All day
          </label>
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ev-start" className={label}>From</label>
                <select id="ev-start" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm">
                  {TIMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="ev-end" className={label}>To</label>
                <select id="ev-end" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm">
                  {TIMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
          )}
          <div>
            <label htmlFor="ev-notes" className={label}>Notes <span className="text-stone">(optional)</span></label>
            <Textarea id="ev-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <label className="flex items-start gap-2.5 text-sm text-ink cursor-pointer">
            <input type="checkbox" checked={blocks} onChange={(e) => setBlocks(e.target.checked)} className="h-4 w-4 mt-0.5 accent-[hsl(var(--moss))]" />
            <span>Block consultation bookings during this time<br /><span className="text-stone text-[0.8rem]">Clients won’t be able to pick these slots on the website.</span></span>
          </label>
        </div>
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save event"}</Button>
        </div>
      </form>
    </div>
  );
}
