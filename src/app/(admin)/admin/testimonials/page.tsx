import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { TestimonialActions } from "@/components/admin/testimonial-actions";

const STATUS_COLOR: Record<string, "warning" | "success" | "destructive" | "secondary"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  FOLLOWUP: "secondary",
};

export default async function TestimonialsAdminPage() {
  const testimonials = await db.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pending = testimonials.filter((t) => t.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[2rem] font-light text-ink">Reviews</h1>
        <p className="text-muted-foreground text-sm mt-1">{pending} pending approval · {testimonials.length} total</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {testimonials.length === 0 && (
            <p className="text-center text-muted-foreground py-10 text-sm">No reviews yet</p>
          )}
          <div className="space-y-4">
            {testimonials.map((t) => (
              <div key={t.id} className="p-4 rounded-xl border border-border/60 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{t.name}</p>
                      <Badge variant={STATUS_COLOR[t.status] ?? "secondary"} className="text-xs">
                        {t.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.email} · {t.concern}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">{formatDate(t.createdAt)}</p>
                </div>

                <p className="text-sm text-foreground/80 italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>

                {t.adminNote && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    Admin note: {t.adminNote}
                  </p>
                )}

                {t.status === "PENDING" && <TestimonialActions id={t.id} />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
