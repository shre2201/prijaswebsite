import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function BlogPage() {
  const posts = await db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, slug: true, excerpt: true, tags: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-14">
        {/* Hero */}
        <div className="bg-gradient-to-br from-cream to-green-50/40 py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 text-center">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">Learn</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              Skincare, explained simply
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto text-[15px] leading-relaxed">
              Guides, ingredient breakdowns, myth-busting — everything you need to build a routine that works.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-12">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No articles published yet.</p>
              <p className="text-xs mt-1">
                Check back soon, or{" "}
                <Link href="/admin/blog" className="text-primary underline">add posts from the admin panel</Link>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl border border-border/40 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="aspect-video bg-gradient-to-br from-cream to-green-50 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-primary/30" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      {post.tags[0] && (
                        <span className="text-[11px] font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                          {post.tags[0]}
                        </span>
                      )}
                      {post.publishedAt && (
                        <span className="text-[11px] text-muted-foreground">{formatDate(post.publishedAt)}</span>
                      )}
                    </div>
                    <h2 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug text-[14px]">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
