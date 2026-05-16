"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  productId: string;
  field: "isActive" | "isFeatured";
  value: boolean;
  labels?: [string, string];
}

export function ProductToggle({ productId, field, value, labels = ["On", "Off"] }: Props) {
  const [current, setCurrent] = useState(value);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    const next = !current;
    setCurrent(next);
    await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: next }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60",
        current ? "bg-primary" : "bg-muted-foreground/30"
      )}
      title={`${labels[current ? 0 : 1]} — click to toggle`}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
          current ? "translate-x-4" : "translate-x-1"
        )}
      />
    </button>
  );
}
