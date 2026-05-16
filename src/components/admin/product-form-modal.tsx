"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X, Percent, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, slugify, formatPrice } from "@/lib/utils";
import type { Product, ProductCategory } from "@prisma/client";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  slug: z.string().min(2, "Slug required"),
  description: z.string().min(10, "Description required"),
  category: z.enum(["UNIVERSAL", "PERSONALIZED"]),
  price: z.number().positive("Price must be positive"),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().min(0),
  sku: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  product?: Product;
  onClose: () => void;
}

export function ProductFormModal({ product, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isEdit = !!product;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description,
          category: product.category,
          price: Number(product.price),
          comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
          stock: product.stock,
          sku: product.sku ?? "",
          isActive: product.isActive,
          isFeatured: product.isFeatured,
        }
      : { category: "UNIVERSAL", isActive: true, isFeatured: false, stock: 0 },
  });

  const name = watch("name");
  const price = watch("price");
  const comparePrice = watch("comparePrice");
  const selectedCategory = watch("category");

  useEffect(() => {
    if (!isEdit && name) setValue("slug", slugify(name), { shouldValidate: false });
  }, [name, isEdit, setValue]);

  const discount =
    comparePrice && comparePrice > 0 && price > 0 && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Upload failed"); return; }
      setImages((prev) => [...prev, json.url]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError("");
    try {
      const url = isEdit ? `/api/products/${product!.id}` : "/api/products";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, images }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Something went wrong");
        return;
      }
      router.refresh();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</div>
            )}

            {/* Image upload */}
            <div>
              <label className="text-xs font-medium mb-2 block">Product Image</label>
              <div className="flex flex-wrap gap-3 items-center">
                {images.map((url) => (
                  <div key={url} className="relative group h-20 w-20 rounded-xl overflow-hidden border border-border/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="h-20 w-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-[10px] font-medium">Upload</span>
                    </>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">JPG, PNG, WebP or GIF · max 5 MB</p>
            </div>

            {/* Name + Slug */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block">Product Name *</label>
                <Input {...register("name")} placeholder="Neem & Turmeric Face Wash" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Slug *</label>
                <Input {...register("slug")} placeholder="neem-turmeric-face-wash" />
                {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">Description *</label>
              <Textarea {...register("description")} rows={3} placeholder="Describe the product, its benefits, and how to use it..." />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium mb-2 block">Category *</label>
              <div className="grid grid-cols-2 gap-3">
                {(["UNIVERSAL", "PERSONALIZED"] as ProductCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setValue("category", cat)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-sm font-medium text-left transition-all",
                      selectedCategory === cat
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <p className="font-semibold">{cat === "UNIVERSAL" ? "Universal" : "Personalized"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-normal">
                      {cat === "UNIVERSAL" ? "Ready-to-ship" : "Customized per customer"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-xl border border-border p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Pricing & Discount</span>
                {discount > 0 && (
                  <span className="ml-auto text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                    {discount}% off
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Selling Price (₹) *</label>
                  <Input {...register("price", { valueAsNumber: true })} type="number" step="0.01" placeholder="799" />
                  {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Original Price (₹) — strike-through</label>
                  <Input {...register("comparePrice", { valueAsNumber: true })} type="number" step="0.01" placeholder="999" />
                  <p className="text-xs text-muted-foreground mt-1">Leave blank if no discount</p>
                </div>
              </div>
              {discount > 0 && price > 0 && (
                <div className="bg-green-50 rounded-lg px-3 py-2 text-sm">
                  Customer sees: <strong>{formatPrice(price)}</strong>{" "}
                  <span className="line-through text-muted-foreground">{formatPrice(comparePrice!)}</span>{" "}
                  <span className="text-green-700 font-semibold">Save {formatPrice(comparePrice! - price)} ({discount}% off)</span>
                </div>
              )}
            </div>

            {/* Stock + SKU */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block">Stock Quantity *</label>
                <Input {...register("stock", { valueAsNumber: true })} type="number" min="0" placeholder="50" />
                {errors.stock && <p className="text-xs text-destructive mt-1">{errors.stock.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">SKU (optional)</label>
                <Input {...register("sku")} placeholder="PRJ-001" />
              </div>
            </div>

            {/* Flags */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Active (visible on store)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" {...register("isFeatured")} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Featured (shown first)</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/20 rounded-b-2xl">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : isEdit ? "Save Changes" : "Add Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
