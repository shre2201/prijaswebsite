"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  name: z.string().min(2),
  stock: z.number().positive(),
  unit: z.string().min(1),
  lowStockThreshold: z.number().positive(),
  supplier: z.string().optional(),
  costPerUnit: z.number().positive().optional(),
});

type FormData = z.infer<typeof schema>;

export function AddMaterialForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        reset();
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        Add Material
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Add Raw Material</h3>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium mb-1 block">Material Name</label>
              <Input {...register("name")} placeholder="e.g. Rose Hip Oil" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Current Stock</label>
              <Input {...register("stock", { valueAsNumber: true })} type="number" step="0.01" placeholder="500" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Unit</label>
              <Input {...register("unit")} placeholder="ml / g / pcs" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Low Stock Alert at</label>
              <Input {...register("lowStockThreshold", { valueAsNumber: true })} type="number" step="0.01" placeholder="100" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Cost / Unit (₹)</label>
              <Input {...register("costPerUnit", { valueAsNumber: true })} type="number" step="0.01" placeholder="50" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium mb-1 block">Supplier (optional)</label>
              <Input {...register("supplier")} placeholder="Supplier name" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Material"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
