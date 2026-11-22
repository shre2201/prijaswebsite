"use client";
import { useState } from "react";
import { Star, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { REVIEWS, LEAD_REVIEW, CONCERNS, type Concern, type Review } from "@/data/reviews";

// Earlier written reviews (from the previous site), shortened to their key line.
const SEED_TESTIMONIALS = [
  { name: "Priya", concern: "tan", quote: "The night cream feels like magic. My tan has reduced a lot and my skin looks brighter now.", rating: 5 },
  { name: "Ananya", concern: "", quote: "Highly knowledgeable and professional, with customised solutions. Highly recommended!", rating: 5 },
  { name: "Shelly", concern: "", quote: "Beautiful packaging and such a lovely initiative!", rating: 5 },
  { name: "Ruchi", concern: "tan", quote: "Almost a month in — my skin is glowing and the tanning has reduced significantly.", rating: 5 },
  { name: "Priti", concern: "", quote: "I have been using her products for 3 years and always recommend them to my friends.", rating: 5 },
  { name: "Nikki", concern: "facial", quote: "Gentle and warm, and her treatment room is impeccably clean. My skin is clearer, more hydrated and glowing.", rating: 5 },
];

export interface DBTestimonial {
  id: string;
  name: string;
  concern: string;
  quote: string;
  rating: number;
}

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  concern: z.string().min(2, "What was your skin concern?"),
  quote: z.string().min(10, "Please share at least a sentence").max(500),
  rating: z.number().int().min(1, "Please select a rating").max(5),
});

type FormData = z.infer<typeof schema>;

function ReviewForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(0);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0 },
  });

  const rating = watch("rating");

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          website: (document.querySelector('[role="dialog"] input[name="website"]') as HTMLInputElement | null)?.value ?? "",
        }),
      });
      if (res.ok) onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 relative">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium mb-1.5 block">Your Name</label>
          <Input {...register("name")} placeholder="Priya S." />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium mb-1.5 block">Email (private)</label>
          <Input {...register("email")} type="email" placeholder="priya@example.com" />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium mb-1.5 block">Your skin concern</label>
        <Input {...register("concern")} placeholder="e.g. Acne, hyperpigmentation, dryness" />
        {errors.concern && <p className="text-xs text-destructive mt-1">{errors.concern.message}</p>}
      </div>

      <div>
        <label className="text-xs font-medium mb-2 block">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setValue("rating", star, { shouldValidate: true })}
              className="p-1.5 -m-1 transition-transform hover:scale-110"
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              aria-pressed={rating === star}
            >
              <Star strokeWidth={1.5} className={cn("h-6 w-6 transition-colors", (hover || rating) >= star ? "fill-clay text-clay" : "fill-none text-stone/40")} />
            </button>
          ))}
        </div>
        {errors.rating && <p className="text-xs text-destructive mt-1">{errors.rating.message}</p>}
      </div>

      <div>
        <label className="text-xs font-medium mb-1.5 block">Your review</label>
        <Textarea {...register("quote")} rows={3} placeholder="Share your experience — what changed, what product helped..." />
        <p className="text-[11px] text-muted-foreground mt-1">{watch("quote")?.length ?? 0}/500</p>
        {errors.quote && <p className="text-xs text-destructive mt-1">{errors.quote.message}</p>}
      </div>

      <Button type="submit" className="w-full h-12" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : "Submit Review"}
      </Button>
      <p className="text-[11px] text-center text-muted-foreground">Reviews appear publicly after admin approval.</p>
    </form>
  );
}

type WallItem = Review & { key: string };

const INITIAL = 9;

export function TestimonialsSection({ dbTestimonials = [] }: { dbTestimonials?: DBTestimonial[] }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState<Concern | "All">("All");
  const [expanded, setExpanded] = useState(false);

  // Instagram messages first, then approved website reviews and earlier written reviews.
  const items: WallItem[] = [
    ...REVIEWS.map((r, i) => ({ ...r, key: `ig-${i}` })),
    ...[...dbTestimonials, ...SEED_TESTIMONIALS].map((t, i) => ({
      quote: t.quote,
      name: t.name,
      concern: guessConcern(t.concern + " " + t.quote),
      key: `w-${i}-${t.name}`,
    })),
  ];

  const counts = Object.fromEntries(CONCERNS.map((c) => [c, items.filter((r) => r.concern === c).length]));
  const filtered = filter === "All" ? interleave(items) : items.filter((r) => r.concern === filter);
  const visible = expanded ? filtered : filtered.slice(0, INITIAL);

  return (
    <section id="testimonials" className="bg-paper">
      <div className="shell py-20 sm:py-24 lg:py-32">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-8 mb-14 items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-5">Reviews</p>
            <h2 className="display-lg text-ink text-balance">What clients write back.</h2>
            <p className="mt-6 text-[1rem] leading-[1.7] text-stone max-w-[32rem]">
              Taken from messages clients have sent Harsheen, shared in the feedback highlight on
              our Instagram.
            </p>
          </div>

        </div>

        {/* Lead message */}
        <figure className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 pb-14 mb-12 border-b border-ink/15">
          <span className="lg:col-span-1 font-display text-[5rem] leading-[0.7] text-clay select-none" aria-hidden="true">“</span>
          <blockquote className="lg:col-span-10 font-display font-light text-[1.35rem] sm:text-[1.7rem] lg:text-[1.95rem] leading-[1.38] tracking-[-0.01em] text-ink text-pretty">
            {LEAD_REVIEW.quote}
          </blockquote>
          <figcaption className="lg:col-start-2 lg:col-span-10 mt-6 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-stone">
            Client · {LEAD_REVIEW.concern}
          </figcaption>
        </figure>

        {/* Filter + write a review */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10">
          <div role="tablist" aria-label="Filter reviews by concern" className="flex flex-wrap gap-2">
            {(["All", ...CONCERNS] as const).map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={filter === c}
                onClick={() => { setFilter(c); setExpanded(false); }}
                className={cn(
                  "min-h-10 px-4 rounded-full border text-[0.85rem] transition-colors",
                  filter === c ? "bg-ink text-paper border-ink" : "border-ink/20 text-ink hover:border-ink/50"
                )}
              >
                {c}
                <span className={cn("ml-1.5 font-mono text-[0.72rem]", filter === c ? "text-paper/60" : "text-stone")}>
                  {c === "All" ? items.length : counts[c]}
                </span>
              </button>
            ))}
          </div>

          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSubmitted(false); }}>
            <DialogTrigger asChild>
              <button className="text-link text-[0.92rem] text-ink self-start md:self-auto py-2 shrink-0">
                Used Prijas? Leave a review
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display font-normal text-[1.5rem]">Share your experience</DialogTitle>
              </DialogHeader>
              {submitted ? (
                <div className="p-6 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-moss mx-auto" strokeWidth={1.5} />
                  <h3 className="font-display text-[1.3rem]">Thank you.</h3>
                  <p className="text-sm text-stone">Your review will appear once it’s been approved.</p>
                  <Button variant="outline" size="sm" onClick={() => { setOpen(false); setSubmitted(false); }}>Close</Button>
                </div>
              ) : (
                <ReviewForm onSuccess={() => setSubmitted(true)} />
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Reviews */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {visible.map((r) => (
            <li key={r.key} className="flex flex-col bg-card border border-border rounded-[2px] p-6">
              <p className="font-display text-[1.12rem] leading-[1.45] text-ink flex-1">“{r.quote}”</p>
              {r.translation && <p className="mt-2 text-[0.88rem] italic text-stone">{r.translation}</p>}
              <p className="mt-5 pt-4 border-t border-border flex justify-between gap-3 font-mono text-[0.68rem] uppercase tracking-[0.12em]">
                <span className="text-ink">{r.name ?? "Client"}</span>
                <span className="text-clay text-right">{r.concern}</span>
              </p>
            </li>
          ))}
        </ul>

        {filtered.length > INITIAL && (
          <div className="mt-10 flex justify-center">
            <Button variant="outline" className="h-12 px-7" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
              {expanded ? "Show fewer" : `Show ${filtered.length - INITIAL} more reviews`}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

/** Mix concerns in the "All" view so it doesn't open on a run of one topic. */
function interleave(list: WallItem[]): WallItem[] {
  const groups = CONCERNS.map((c) => list.filter((r) => r.concern === c));
  const out: WallItem[] = [];
  for (let i = 0; out.length < list.length; i++) {
    for (const g of groups) if (g[i]) out.push(g[i]);
  }
  return out;
}

/** Rough concern tag for reviews submitted through the website form. */
function guessConcern(text: string): Concern {
  const t = text.toLowerCase();
  if (/hair|scalp|dandruff/.test(t)) return "Hair";
  if (/acne|pimple|breakout/.test(t)) return "Acne";
  if (/pigment|dark spot|spots|\btan/.test(t)) return "Pigmentation & tan";
  if (/facial|treatment|esthetician/.test(t)) return "Facials";
  return "Glow";
}
