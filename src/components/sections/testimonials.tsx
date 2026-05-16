"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Plus, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const SEED_TESTIMONIALS = [
  { name: "Priya", concern: "Acne-prone skin", quote: "Night cream from Prijas Organic skincare feels like magic on my skin. My face feels tighter, fresh, and super soft. My tan has reduced a lot and my skin looks brighter now. Really loving how my skin feels these days.", rating: 5 },
  { name: "Ananya", concern: "", quote: "A perfect place for all your skin care needs. They are highly knowledgeable & professional and give customised solutions. Highly recommended!", rating: 5 },
  { name: "Shelly", concern: "", quote: "Beautiful packaging and such a lovely initiative! Hope your products reach great heights.", rating: 5 },
  { name: "Ruchi", concern: "", quote: "It’s been almost a month and I can already see a visible difference — my skin is glowing and the tanning has reduced significantly. Thank you so much!", rating: 5 },
  { name: "Priti", concern: "", quote: "I have been using her products for 3 years and always recommend them to my friends. Would highly recommend!", rating: 5 },
  { name: "Nikki", concern: "", quote: "Harsheen is gentle, warm, and her treatment room is comfortable, relaxing, and impeccably clean. My skin is clearer, more hydrated, and glowing. I highly recommend her to anyone looking for a knowledgeable and caring esthetician.", rating: 5 },
];

const AVATAR_COLORS = [
  "bg-rose-100 text-rose-600",
  "bg-violet-100 text-violet-600",
  "bg-teal-100 text-teal-600",
  "bg-amber-100 text-amber-600",
  "bg-sky-100 text-sky-600",
  "bg-orange-100 text-orange-600",
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

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
        body: JSON.stringify(data),
      });
      if (res.ok) onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-3">
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
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star className={cn("h-6 w-6 transition-colors", (hover || rating) >= star ? "fill-amber-400 text-amber-400" : "fill-none text-muted-foreground/30")} />
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

      <Button type="submit" className="w-full rounded-full" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : "Submit Review"}
      </Button>
      <p className="text-[11px] text-center text-muted-foreground">Reviews appear publicly after admin approval.</p>
    </form>
  );
}

export function TestimonialsSection({ dbTestimonials = [] }: { dbTestimonials?: DBTestimonial[] }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const source = dbTestimonials.length > 0 ? dbTestimonials : SEED_TESTIMONIALS;
  const testimonials = source.map((t, i) => ({
    ...t,
    initials: initials(t.name),
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
  }));

  return (
    <section id="testimonials" className="bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">Real Results</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-3">
              What our customers say
            </h2>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[13px] text-muted-foreground">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span>4.9 · 500+ reviews</span>
            </div>
          </div>

          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSubmitted(false); }}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1.5 text-[13px] font-medium text-primary border border-primary/30 hover:bg-primary/5 px-3.5 py-1.5 rounded-full transition-colors self-start sm:self-auto shrink-0">
                <Plus className="h-3.5 w-3.5" />
                Write a review
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Share your experience</DialogTitle>
              </DialogHeader>
              {submitted ? (
                <div className="p-6 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
                  <h3 className="font-semibold">Thank you!</h3>
                  <p className="text-sm text-muted-foreground">Your review will appear after admin approval.</p>
                  <Button variant="outline" size="sm" onClick={() => { setOpen(false); setSubmitted(false); }}>Close</Button>
                </div>
              ) : (
                <ReviewForm onSuccess={() => setSubmitted(true)} />
              )}
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="bg-cream/40 border border-border/30 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-[13px] text-foreground/80 leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-2.5 pt-1 border-t border-border/30">
                <div className={`h-8 w-8 rounded-full ${t.color} flex items-center justify-center text-[11px] font-bold flex-shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground leading-none">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{t.concern}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
