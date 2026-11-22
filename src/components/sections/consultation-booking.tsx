"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Video, Phone, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { BOOKING_SLOTS } from "@/lib/calendar";
import { useSession } from "next-auth/react";

const MODES = [
  { value: "VIDEO", label: "Video Call", icon: Video },
  { value: "PHONE", label: "Phone Call", icon: Phone },
  { value: "IN_PERSON", label: "In Person", icon: MapPin },
] as const;

const CONCERNS = [
  "Acne / Breakouts", "Hyperpigmentation", "Dryness", "Oiliness",
  "Sensitivity", "Anti-aging", "Uneven texture", "Dark circles",
];

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Phone number required"),
  date: z.string().min(1, "Date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  mode: z.enum(["VIDEO", "PHONE", "IN_PERSON"]),
  concerns: z.array(z.string()).min(1, "Select at least one concern"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const TIME_SLOTS = BOOKING_SLOTS;

const STEP_TITLES = ["Your details", "Date & time", "Your skin"];

const label = "block text-[0.85rem] text-ink mb-2";
const errorText = "text-[0.8rem] text-destructive mt-1.5";

function chip(active: boolean) {
  return cn(
    "min-h-11 px-4 rounded-full border text-[0.88rem] transition-colors",
    active ? "border-moss bg-moss text-paper" : "border-ink/20 text-ink hover:border-ink/50"
  );
}

/** The left column: what the consultation actually covers. */
function Intro() {
  return (
    <div className="lg:col-span-5">
      <p className="eyebrow mb-5">Consultation</p>
      <h2 className="display-lg text-ink text-balance">Half an hour, spent entirely on your skin.</h2>
      <p className="mt-6 text-[1rem] leading-[1.7] text-stone max-w-[28rem]">
        This is where your formula begins. Nothing is mixed until we’ve talked, and there’s no
        obligation to buy anything afterwards.
      </p>
    </div>
  );
}

// Defined at module level so the form isn't remounted on every keystroke.
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section id="consultation" className="bg-travertine">
      <div className="shell grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-12 py-20 sm:py-24 lg:py-32">
        <Intro />
        <div className="lg:col-span-7">{children}</div>
      </div>
    </section>
  );
}

const card = "bg-card border border-border rounded-[2px] p-6 sm:p-10";

export function ConsultationBookingSection() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, getValues, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { mode: "VIDEO", concerns: [] },
  });

  // Signed-in visitors: fill in what we already know (they can still edit it).
  useEffect(() => {
    if (session?.user?.name && !getValues("name")) setValue("name", session.user.name);
    if (session?.user?.email && !getValues("email")) setValue("email", session.user.email);
  }, [session, getValues, setValue]);

  const selectedMode = watch("mode");
  const selectedConcerns = watch("concerns") ?? [];
  const selectedTime = watch("timeSlot");
  const selectedDate = watch("date");
  const [taken, setTaken] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);

  // Grey out slots already booked, or blocked in Harsheen's calendar, for the chosen day.
  useEffect(() => {
    if (!selectedDate) { setTaken([]); return; }
    let cancelled = false;
    setChecking(true);
    fetch(`/api/availability?date=${selectedDate}`)
      .then((r) => (r.ok ? r.json() : { taken: [] }))
      .then((j: { taken: string[] }) => {
        if (cancelled) return;
        setTaken(j.taken);
        if (getValues("timeSlot") && j.taken.includes(getValues("timeSlot"))) setValue("timeSlot", "");
      })
      .catch(() => {})
      .finally(() => !cancelled && setChecking(false));
    return () => { cancelled = true; };
  }, [selectedDate, getValues, setValue]);

  function toggleConcern(concern: string) {
    const next = selectedConcerns.includes(concern)
      ? selectedConcerns.filter((c) => c !== concern)
      : [...selectedConcerns, concern];
    setValue("concerns", next, { shouldValidate: true });
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          website: (document.querySelector('#consultation input[name="website"]') as HTMLInputElement | null)?.value ?? "",
        }),
      });
      if (res.ok) setSubmitted(true);
      else if (res.status === 429) setError("Too many attempts — please wait a few minutes and try again.");
      else if (res.status === 409) {
        setError("Sorry — that time was just taken. Please go back and pick another slot.");
        setTaken((t) => [...t, data.timeSlot]);
      } else setError("Something went wrong and your booking didn’t go through. Please try again, or call us on +91 70218 27174.");
    } catch {
      setError("We couldn’t reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Shell>
        <div className={cn(card, "text-left")} role="status">
          <CheckCircle2 className="h-9 w-9 text-moss" strokeWidth={1.5} />
          <h3 className="mt-5 font-display text-[1.75rem] text-ink">Request received.</h3>
          <p className="mt-3 text-[0.98rem] leading-[1.7] text-stone max-w-[30rem]">
            We’ve emailed you the details. Harsheen will confirm your time shortly, and you’ll get the call link or studio address before your session.
          </p>
          <Button variant="outline" className="mt-8" onClick={() => { setSubmitted(false); setStep(1); }}>
            Book another
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <form onSubmit={handleSubmit(onSubmit)} className={cn(card, "relative")} noValidate>
        {/* Honeypot — hidden from people, bots fill it in */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

        {/* Progress */}
        <div className="flex items-baseline justify-between mb-8">
          <h3 className="font-display text-[1.5rem] text-ink">{STEP_TITLES[step - 1]}</h3>
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-stone">Step {step} of 3</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mb-10" aria-hidden="true">
          {[1, 2, 3].map((s) => (
            <div key={s} className={cn("h-[3px] rounded-full transition-colors", step >= s ? "bg-moss" : "bg-ink/10")} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="bk-name" className={label}>Full name</label>
                <Input id="bk-name" {...register("name")} autoComplete="name" placeholder="Priya Sharma" />
                {errors.name && <p className={errorText}>{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="bk-email" className={label}>Email</label>
                <Input id="bk-email" {...register("email")} type="email" autoComplete="email" placeholder="priya@example.com" />
                {errors.email && <p className={errorText}>{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="bk-phone" className={label}>Phone</label>
              <Input id="bk-phone" {...register("phone")} type="tel" autoComplete="tel" placeholder="+91 98765 43210" />
              {errors.phone && <p className={errorText}>{errors.phone.message}</p>}
            </div>

            <fieldset>
              <legend className={label}>How would you like to talk?</legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setValue("mode", mode.value)}
                    aria-pressed={selectedMode === mode.value}
                    className={cn(
                      "flex items-center gap-2.5 h-12 px-4 rounded-md border text-[0.9rem] transition-colors",
                      selectedMode === mode.value
                        ? "border-moss bg-moss/[0.06] text-ink"
                        : "border-ink/20 text-ink hover:border-ink/50"
                    )}
                  >
                    <mode.icon className={cn("h-4 w-4", selectedMode === mode.value ? "text-moss" : "text-stone")} strokeWidth={1.5} />
                    {mode.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <Button type="button" className="w-full h-12" onClick={async () => {
              const valid = await trigger(["name", "email", "phone"]);
              if (valid) setStep(2);
            }}>
              Continue to date &amp; time
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="bk-date" className={label}>Date</label>
              <Input id="bk-date" {...register("date")} type="date" min={new Date().toISOString().split("T")[0]} />
              {errors.date && <p className={errorText}>{errors.date.message}</p>}
            </div>

            <fieldset>
              <legend className={label}>Time</legend>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const unavailable = taken.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={unavailable || !selectedDate}
                      onClick={() => setValue("timeSlot", slot, { shouldValidate: true })}
                      aria-pressed={selectedTime === slot}
                      title={unavailable ? "Not available" : undefined}
                      className={cn(
                        chip(selectedTime === slot),
                        "px-2 rounded-md text-[0.82rem] font-mono disabled:cursor-not-allowed disabled:opacity-35 disabled:line-through disabled:hover:border-ink/20"
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[0.8rem] text-stone" aria-live="polite">
                {!selectedDate ? "Pick a date first to see open times." : checking ? "Checking availability…" : taken.length >= TIME_SLOTS.length ? "This day is fully booked — please try another date." : null}
              </p>
              {errors.timeSlot && <p className={errorText}>{errors.timeSlot.message}</p>}
            </fieldset>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>Back</Button>
              <Button type="button" className="flex-[2] h-12" onClick={async () => {
                const valid = await trigger(["date", "timeSlot"]);
                if (valid) setStep(3);
              }}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <fieldset>
              <legend className={label}>What would you like help with? Choose any.</legend>
              <div className="flex flex-wrap gap-2">
                {CONCERNS.map((concern) => (
                  <button
                    key={concern}
                    type="button"
                    onClick={() => toggleConcern(concern)}
                    aria-pressed={selectedConcerns.includes(concern)}
                    className={chip(selectedConcerns.includes(concern))}
                  >
                    {concern}
                  </button>
                ))}
              </div>
              {errors.concerns && <p className={errorText}>{errors.concerns.message}</p>}
            </fieldset>

            <div>
              <label htmlFor="bk-notes" className={label}>Anything else we should know? <span className="text-stone">(optional)</span></label>
              <Textarea
                id="bk-notes"
                {...register("notes")}
                placeholder="Allergies, medication, or reactions you’ve had to products before"
                rows={3}
              />
            </div>

            {error && <p role="alert" className="text-[0.88rem] text-destructive">{error}</p>}

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setStep(2)}>Back</Button>
              <Button type="submit" className="flex-[2] h-12" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Booking…</> : "Confirm booking"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Shell>
  );
}
