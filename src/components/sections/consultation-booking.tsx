"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Video, Phone, MapPin, CheckCircle2, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, generateTimeSlots } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

const TIME_SLOTS = generateTimeSlots();

export function ConsultationBookingSection() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { mode: "VIDEO", concerns: [] },
  });

  const selectedMode = watch("mode");
  const selectedConcerns = watch("concerns") ?? [];
  const selectedTime = watch("timeSlot");

  function toggleConcern(concern: string) {
    const next = selectedConcerns.includes(concern)
      ? selectedConcerns.filter((c) => c !== concern)
      : [...selectedConcerns, concern];
    setValue("concerns", next, { shouldValidate: true });
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // handle gracefully
    } finally {
      setLoading(false);
    }
  }

  if (status !== "loading" && !session) {
    return (
      <section id="consultation" className="bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-md mx-auto space-y-4">
            <div className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Get Started</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              Book your free consultation
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              30 minutes. No cost. Sign in or create a free account to book your personalized skincare consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="rounded-full gap-2" asChild>
                <Link href="/login"><LogIn className="h-4 w-4" /> Sign in to Book</Link>
              </Button>
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/register">Create Free Account</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  if (submitted) {
    return (
      <section id="consultation" className="bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20 flex items-center justify-center min-h-[500px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 max-w-md"
          >
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
            <h3 className="font-serif text-2xl font-semibold">Consultation booked!</h3>
            <p className="text-muted-foreground">
              We&apos;ve sent a confirmation to your email. We&apos;ll reach out with joining details 24 hours before your session.
            </p>
            <Button onClick={() => { setSubmitted(false); setStep(1); }}>Book Another</Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="consultation" className="bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Get Started</div>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">
            Book your free consultation
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            30 minutes. No cost. Just a conversation about your skin — and what it actually needs.
          </p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>{s}</div>
              {s < 3 && <div className={cn("w-12 h-0.5 transition-all", step > s ? "bg-primary" : "bg-border")} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-w-2xl mx-auto">
            {/* Step 1 — Personal info */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h3 className="font-semibold text-lg">Your details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                    <Input {...register("name")} placeholder="Priya Sharma" />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email</label>
                    <Input {...register("email")} type="email" placeholder="priya@example.com" />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
                  <Input {...register("phone")} type="tel" placeholder="+91 98765 43210" />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Consultation Mode</label>
                  <div className="grid grid-cols-3 gap-3">
                    {MODES.map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setValue("mode", mode.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all",
                          selectedMode === mode.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        <mode.icon className="h-5 w-5" />
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="button" className="w-full" onClick={async () => {
                  const valid = await trigger(["name", "email", "phone"]);
                  if (valid) setStep(2);
                }}>
                  Next → Choose Date & Time
                </Button>
              </motion.div>
            )}

            {/* Step 2 — Date & time */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h3 className="font-semibold text-lg">Pick a date & time</h3>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Date</label>
                  <Input
                    {...register("date")}
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Available Time Slots</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.slice(0, 16).map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setValue("timeSlot", slot, { shouldValidate: true })}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                          selectedTime === slot
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {errors.timeSlot && <p className="text-xs text-destructive mt-1">{errors.timeSlot.message}</p>}
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                  <Button type="button" className="flex-1" onClick={async () => {
                    const valid = await trigger(["date", "timeSlot"]);
                    if (valid) setStep(3);
                  }}>Next → Skin Concerns</Button>
                </div>
              </motion.div>
            )}

            {/* Step 3 — Skin concerns */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h3 className="font-semibold text-lg">Your skin concerns</h3>
                <div>
                  <label className="text-sm font-medium mb-3 block">Select all that apply</label>
                  <div className="flex flex-wrap gap-2">
                    {CONCERNS.map((concern) => (
                      <button
                        key={concern}
                        type="button"
                        onClick={() => toggleConcern(concern)}
                        className={cn(
                          "px-4 py-2 rounded-full border text-sm font-medium transition-all",
                          selectedConcerns.includes(concern)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        {concern}
                      </button>
                    ))}
                  </div>
                  {errors.concerns && <p className="text-xs text-destructive mt-1">{errors.concerns.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Anything else to share? (optional)</label>
                  <Textarea
                    {...register("notes")}
                    placeholder="Any allergies, medications, or previous reactions you want us to know about..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Booking...</> : "Confirm Booking"}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
