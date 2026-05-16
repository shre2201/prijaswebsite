"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, slugify } from "@/lib/utils";
import type { BlogPost } from "@prisma/client";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().optional(),
  content: z.string().min(10),
  tags: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

type FormData = z.infer<typeof schema>;

interface Props {
  posts: (BlogPost & { author: { name: string } })[];
}

export function BlogAdminClient({ posts }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "DRAFT" },
  });

  

  async function onSubmit(data: FormData) {
    setLoading(true);
    const tags = data.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const url = editPost ? `/api/blog/${editPost.id}` : "/api/blog";
    const method = editPost ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, tags }),
    });
    setLoading(false);
    reset();
    setShowForm(false);
    setEditPost(null);
    router.refresh();
  }

  function openEdit(post: BlogPost) {
    setEditPost(post);
    setValue("title", post.title);
    setValue("slug", post.slug);
    setValue("excerpt", post.excerpt ?? "");
    setValue("content", post.content);
    setValue("tags", post.tags.join(", "));
    setValue("status", post.status);
    setShowForm(true);
  }

  return (
    <>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editPost ? "Edit Post" : "New Blog Post"}</h2>
              <button onClick={() => { setShowForm(false); setEditPost(null); reset(); }}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium mb-1.5 block">Title *</label>
                  <Input
                    {...register("title")}
                    placeholder="Article title"
                    onChange={(e) => {
                      setValue("title", e.target.value);
                      if (!editPost) setValue("slug", slugify(e.target.value));
                    }}
                  />
                  {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium mb-1.5 block">Slug</label>
                  <Input {...register("slug")} placeholder="url-friendly-slug" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block">Excerpt</label>
                <Input {...register("excerpt")} placeholder="Short description shown in listing" />
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block">Content (HTML supported) *</label>
                <Textarea {...register("content")} rows={10} placeholder="Write your article content here..." className="font-mono text-xs" />
                {errors.content && <p className="text-xs text-destructive mt-1">{errors.content.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Tags (comma-separated)</label>
                  <Input {...register("tags")} placeholder="Guide, Ingredients, Education" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Status</label>
                  <div className="flex gap-2">
                    {(["DRAFT", "PUBLISHED"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setValue("status", s)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                          watch("status") === s
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {s === "DRAFT" ? "Draft" : "Publish"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditPost(null); reset(); }}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : editPost ? "Save Changes" : "Create Post"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Blog</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {posts.filter(p => p.status === "PUBLISHED").length} published · {posts.filter(p => p.status === "DRAFT").length} drafts
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Post
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No posts yet — click &ldquo;New Post&rdquo; to get started</p>
            </div>
          )}
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/60 hover:bg-muted/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{post.title}</p>
                    <Badge variant={post.status === "PUBLISHED" ? "success" : "secondary"} className="text-xs shrink-0">
                      {post.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {post.author.name} · {formatDate(post.createdAt)}
                    {post.tags.length > 0 && ` · ${post.tags.join(", ")}`}
                  </p>
                </div>
                <button onClick={() => openEdit(post)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
