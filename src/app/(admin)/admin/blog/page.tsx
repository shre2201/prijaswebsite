import { db } from "@/lib/db";
import { BlogAdminClient } from "./blog-admin-client";

export default async function AdminBlogPage() {
  const posts = await db.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return <BlogAdminClient posts={posts} />;
}
