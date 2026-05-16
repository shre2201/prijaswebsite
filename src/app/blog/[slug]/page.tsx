import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await db.blogPost.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
    include: { author: { select: { name: true } } },
  });

  if (!post) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-14">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12">
          {/* Back */}
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {post.tags.map((tag) => (
                <span key={tag} className="text-[11px] font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
              {post.publishedAt && (
                <span className="text-[12px] text-muted-foreground">{formatDate(post.publishedAt)}</span>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground leading-snug mb-4">
              {post.title}
            </h1>
            <p className="text-[13px] text-muted-foreground">
              By {post.author.name}
            </p>
          </div>

          {/* Cover */}
          <div className="aspect-video rounded-2xl overflow-hidden mb-8">
            {post.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cream via-green-50 to-primary/10 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="font-serif text-4xl text-primary/30 font-semibold">Prijas</p>
                  {post.tags[0] && (
                    <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {post.tags[0]}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div
            className="prose prose-sm sm:prose max-w-none prose-headings:font-serif prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
