"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Pencil } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Props {
  productId: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
}

export function ProductPriceEditor({ productId, price, comparePrice, stock }: Props) {
  const [editing, setEditing] = useState(false);
  const [newPrice, setNewPrice] = useState(String(price));
  const [newCompare, setNewCompare] = useState(comparePrice ? String(comparePrice) : "");
  const [newStock, setNewStock] = useState(String(stock));
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function save() {
    setSaving(true);
    await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: parseFloat(newPrice),
        comparePrice: newCompare ? parseFloat(newCompare) : null,
        stock: parseInt(newStock, 10),
      }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  const discount =
    newCompare && parseFloat(newCompare) > parseFloat(newPrice)
      ? Math.round(((parseFloat(newCompare) - parseFloat(newPrice)) / parseFloat(newCompare)) * 100)
      : 0;

  if (!editing) {
    return (
      <div className="flex items-center gap-2 group">
        <div>
          <p className="font-semibold text-sm">{formatPrice(price)}</p>
          {comparePrice && comparePrice > price ? (
            <p className="text-xs text-muted-foreground">
              <span className="line-through">{formatPrice(comparePrice)}</span>
              {" "}<span className="text-green-600 font-medium">
                {Math.round(((comparePrice - price) / comparePrice) * 100)}% off
              </span>
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">Stock: {stock}</p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
          title="Edit price"
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 min-w-[180px]">
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground w-16 shrink-0">Price ₹</span>
        <input
          type="number"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          className="h-7 w-20 rounded border border-input px-2 text-xs"
          step="0.01"
        />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground w-16 shrink-0">Was ₹</span>
        <input
          type="number"
          value={newCompare}
          onChange={(e) => setNewCompare(e.target.value)}
          className="h-7 w-20 rounded border border-input px-2 text-xs"
          step="0.01"
          placeholder="—"
        />
        {discount > 0 && (
          <span className="text-xs text-green-600 font-semibold">{discount}% off</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground w-16 shrink-0">Stock</span>
        <input
          type="number"
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          className="h-7 w-20 rounded border border-input px-2 text-xs"
          min="0"
        />
      </div>
      <div className="flex gap-1 pt-0.5">
        <button
          onClick={save}
          disabled={saving}
          className="h-6 px-2 rounded bg-primary text-primary-foreground text-xs flex items-center gap-1 hover:bg-primary/90 disabled:opacity-50"
        >
          <Check className="h-3 w-3" /> Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="h-6 px-2 rounded border text-xs flex items-center gap-1 hover:bg-muted"
        >
          <X className="h-3 w-3" /> Cancel
        </button>
      </div>
    </div>
  );
}
