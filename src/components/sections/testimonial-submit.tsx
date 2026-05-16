"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Star, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  concern: z.string().min(2, "What was your skin concern?"),
  quote: z.string().min(10, "Please share at least a sentence").max(500, "Keep it under 500 characters"),
  rating: z.number().int().min(1).max(5),
});

type FormData = z.infer<typeof schema>;

export function TestimonialSubmitSection() {
  const [submitted, setSubmitted] = useState(false);
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
      if (res.ok) setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-cream/30 border-t border-border/30">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">Share Your Story</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-3">
              How has Prijas worked for you?
            </h2>
            <p className="text-[14px] text-muted-foreground">
              Your review helps others make the right choice — and it means a lot to us. All reviews are shown after approval.
            </p>
          </motion.div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-3"
            >
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
              <h3 className="font-semibold text-lg">Thank you!</h3>
              <p className="text-sm text-muted-foreground">
                Your review has been submitted and will appear on the website after approval.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white rounded-2xl border border-border/40 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Your Name</label>
                  <Input {...register("name")} placeholder="Priya S." />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Email (not shown publicly)</label>
                  <Input {...register("email")} type="email" placeholder="priya@example.com" />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block">Your skin concern</label>
                <Input {...register("concern")} placeholder="e.g. Acne, hyperpigmentation, dryness" />
                {errors.concern && <p className="text-xs text-destructive mt-1">{errors.concern.message}</p>}
              </div>

              {/* Star rating */}
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
                      <Star
                        className={cn(
                          "h-7 w-7 transition-colors",
                          (hover || rating) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "fill-none text-muted-foreground/30"
                        )}
                      />
                    </button>
                  ))}
                </div>
                {errors.rating && <p className="text-xs text-destructive mt-1">Please select a rating</p>}
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block">Your review</label>
                <Textarea
                  {...register("quote")}
                  rows={4}
                  placeholder="Share your experience — what changed, how long it took, what product made the difference..."
                />
                <p className="text-[11px] text-muted-foreground mt-1">{watch("quote")?.length ?? 0}/500</p>
                {errors.quote && <p className="text-xs text-destructive mt-1">{errors.quote.message}</p>}
              </div>

              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : "Submit Review"}
              </Button>

              <p className="text-[11px] text-center text-muted-foreground">
                Reviews appear publicly after admin approval. If we notice any concerns, we may reach out.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
