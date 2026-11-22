"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";
import type { Product } from "@prisma/client";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  slug: z.string().min(2, "Slug required"),
  description: z.string().min(10, "Description required"),
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
          isActive: product.isActive,
          isFeatured: product.isFeatured,
        }
      : { isActive: true, isFeatured: false },
  });

  const name = watch("name");

  useEffect(() => {
    if (!isEdit && name) setValue("slug", slugify(name), { shouldValidate: false });
  }, [name, isEdit, setValue]);

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
              <p className="text-[11px] text-muted-foreground mt-1.5">Best: a transparent PNG/WebP cut-out of the product with its natural ingredient (like the existing ones) · max 5 MB</p>
            </div>

            {/* Name + Slug */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block">Product Name *</label>
                <Input {...register("name")} placeholder="Kasturi Turmeric Moisturiser" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Slug *</label>
                <Input {...register("slug")} placeholder="kasturi-turmeric-moisturiser" />
                {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">Description *</label>
              <Textarea {...register("description")} rows={3} placeholder="Describe the product, its benefits, and how to use it..." />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
            </div>

            <p className="text-xs text-muted-foreground">
              Prices and stock aren’t shown on the website — every product is made after a consultation.
            </p>

            {/* Flags */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Show on website</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" {...register("isFeatured")} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Show first</span>
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
