"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function TestimonialActions({ id }: { id: string }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [showNote, setShowNote] = useState(false);
  const router = useRouter();

  async function update(status: string) {
    setLoading(status);
    await fetch(`/api/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote: note || undefined }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {showNote && (
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add an internal note (optional)..."
          rows={2}
          className="text-xs"
        />
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-green-600 border-green-200 hover:bg-green-50 text-xs h-7"
          onClick={() => update("APPROVED")}
          disabled={!!loading}
        >
          {loading === "APPROVED" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-amber-600 border-amber-200 hover:bg-amber-50 text-xs h-7"
          onClick={() => { setShowNote(!showNote); }}
          disabled={!!loading}
        >
          <MessageCircle className="h-3 w-3 mr-1" />
          Follow up
        </Button>
        {showNote && (
          <Button
            size="sm"
            variant="outline"
            className="text-amber-600 border-amber-200 hover:bg-amber-50 text-xs h-7"
            onClick={() => update("FOLLOWUP")}
            disabled={!!loading}
          >
            {loading === "FOLLOWUP" ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            Send email & mark follow-up
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-7"
          onClick={() => update("REJECTED")}
          disabled={!!loading}
        >
          {loading === "REJECTED" ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3 mr-1" />}
          Reject
        </Button>
      </div>
    </div>
  );
}
