import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
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
      <main className="min-h-screen bg-paper">
        <header className="shell pt-32 sm:pt-40 pb-14 grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-6 items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-5">Journal</p>
            <h1 className="display-xl text-ink text-balance">Notes on skin, food and routine.</h1>
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-[1rem] leading-[1.7] text-stone">
            Ingredient notes, myths worth dropping, and the small habits that change how your skin behaves.
          </p>
        </header>

        <div className="shell pb-24 sm:pb-32">
          {posts.length === 0 ? (
            <p className="border-t border-ink/15 pt-10 text-stone max-w-md">
              The first entries are being written. Until then, the best place to ask a skin question is a{" "}
              <Link href="/#consultation" className="text-link text-ink">consultation</Link>.
            </p>
          ) : (
            <ul className="border-t border-ink/15">
              {posts.map((post) => (
                <li key={post.id} className="border-b border-ink/15">
                  <Link href={`/blog/${post.slug}`} className="group grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-2 py-8 sm:py-10">
                    <p className="md:col-span-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-stone pt-1.5">
                      {post.publishedAt ? formatDate(post.publishedAt) : ""}
                      {post.tags[0] ? <span className="text-clay"> · {post.tags[0]}</span> : null}
                    </p>
                    <div className="md:col-span-9">
                      <h2 className="font-display text-[1.45rem] sm:text-[1.8rem] leading-tight text-ink group-hover:text-clay transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-3 text-[0.98rem] leading-[1.7] text-stone line-clamp-2 max-w-[42rem]">{post.excerpt}</p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
