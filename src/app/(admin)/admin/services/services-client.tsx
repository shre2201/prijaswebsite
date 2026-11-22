"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ServiceRow { id: string; name: string; description: string; price: number; duration: number; isActive: boolean; }

const schema = z.object({
  name: z.string().min(2, "Name required"),
  description: z.string().min(5, "Description required"),
  isActive: z.boolean(),
});
type FormData = z.infer<typeof schema>;

function ServiceModal({ service, onClose }: { service?: ServiceRow; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!service;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: service
      ? { name: service.name, description: service.description, isActive: service.isActive }
      : { isActive: true },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError("");
    try {
      const url = isEdit ? `/api/services/${service!.id}` : "/api/services";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { setError((await res.json()).error ?? "Failed"); return; }
      router.refresh();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">{isEdit ? "Edit Treatment" : "Add New Treatment"}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {error && <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</div>}

          <div>
            <label className="text-xs font-medium mb-1.5 block">Treatment name *</label>
            <Input {...register("name")} placeholder="e.g. Deep Cleansing Facial" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block">Description *</label>
            <Textarea {...register("description")} rows={3} placeholder="What this service includes, who it's for…" />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-gray-300 text-primary" />
            <span className="text-sm font-medium">Active (visible on website)</span>
          </label>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : isEdit ? "Save Changes" : "Add Treatment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ServicesClient({ services }: { services: ServiceRow[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState<ServiceRow | undefined>();

  return (
    <>
      {(showModal || editService) && (
        <ServiceModal service={editService} onClose={() => { setShowModal(false); setEditService(undefined); }} />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[2rem] font-light text-ink">Treatments</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {services.filter((s) => s.isActive).length} shown on the website · {services.length} total. Prices aren’t shown publicly.
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Treatment
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All treatments</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No services yet — click &ldquo;Add Treatment&rdquo; to get started</p>
              </div>
            )}
            <div className="space-y-3">
              {services.map((svc) => (
                <div key={svc.id} className={cn("flex items-center gap-4 p-4 rounded-xl border transition-colors", svc.isActive ? "border-border/60 hover:bg-muted/20" : "border-border/30 bg-muted/10 opacity-60")}>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-sm truncate">{svc.name}</p>
                      {!svc.isActive && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Inactive</span>}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{svc.description}</p>
                  </div>
                  <button onClick={() => setEditService(svc)} className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0">
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
