import { db } from "@/lib/db";
import { ProductsClient } from "./products-client";

export default async function ProductsPage() {
  const products = await db.product.findMany({
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  const activeCount = products.filter((p) => p.isActive).length;

  return (
    <ProductsClient
      products={products}
      stats={{ activeCount }}
    />
  );
}
