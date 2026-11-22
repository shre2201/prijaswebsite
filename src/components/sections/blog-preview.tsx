import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
  // Nothing published yet — leave the section out rather than show an empty shelf.
  if (posts.length === 0) return null;

  return (
    <section id="blog" className="bg-paper">
      <div className="shell py-20 sm:py-24 lg:py-32">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="eyebrow mb-5">Journal</p>
            <h2 className="display-lg text-ink text-balance">Notes on skin, food and routine.</h2>
          </div>
          <Link href="/blog" className="text-link text-[0.92rem] text-ink self-start sm:self-auto py-2">
            All articles
          </Link>
        </div>

        <ul className="border-t border-ink/15">
          {posts.map((post) => (
            <li key={post.id} className="border-b border-ink/15">
              <Link
                href={`/blog/${post.slug}`}
                className="group grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-2 py-8 sm:py-10"
              >
                <p className="md:col-span-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-stone pt-1.5">
                  {post.publishedAt ? formatDate(post.publishedAt) : ""}
                  {post.tags[0] ? <span className="text-clay"> · {post.tags[0]}</span> : null}
                </p>
                <div className="md:col-span-8">
                  <h3 className="font-display text-[1.45rem] sm:text-[1.7rem] leading-tight text-ink group-hover:text-clay transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-3 text-[0.98rem] leading-[1.7] text-stone line-clamp-2 max-w-[40rem]">{post.excerpt}</p>
                  )}
                </div>
                <ArrowUpRight
                  className="hidden md:block md:col-span-1 justify-self-end h-5 w-5 text-ink/40 group-hover:text-clay transition-colors mt-2"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
