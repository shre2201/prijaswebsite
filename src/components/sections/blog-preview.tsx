"use client";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export interface PreviewPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  tags: string[];
  publishedAt: Date | null;
}

export function BlogPreviewSection({ posts }: { posts: PreviewPost[] }) {
  return (
    <section id="blog" className="bg-cream/30">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12"
        >
          <div>
            <div className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Learn</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground">
              Skincare, explained simply
            </h2>
          </div>
          <Button variant="outline" asChild>
            <Link href="/blog" className="flex items-center gap-2">
              All Articles <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No articles published yet.</p>
            <p className="text-xs mt-1">
              Add posts from the{" "}
              <Link href="/admin/blog" className="text-primary underline">admin panel</Link>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-2xl overflow-hidden border border-border/40 hover:shadow-lg transition-all duration-300"
              >
                <Link href={`/blog/${post.slug}`}>
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
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug text-[14px]">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
