"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

export interface PublicProduct {
  id: string;
  name: string;
  price: number;
  comparePrice: number | null;
  category: "UNIVERSAL" | "PERSONALIZED";
  isFeatured: boolean;
  stock: number;
  images: string[];
}

type Filter = "All" | "Universal" | "Personalized";

const CATEGORY_EMOJI: Record<string, string> = {
  UNIVERSAL: "🌿",
  PERSONALIZED: "✨",
};

const TAG_STYLE: Record<string, string> = {
  Featured: "bg-amber-100 text-amber-700",
};

export function ProductsSection({ products }: { products: PublicProduct[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [added, setAdded] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCart();

  const filtered = products.filter((p) => {
    if (filter === "Universal") return p.category === "UNIVERSAL";
    if (filter === "Personalized") return p.category === "PERSONALIZED";
    return true;
  });

  function handleAddToCart(product: PublicProduct) {
    if (!session) {
      router.push(`/login?from=cart&product=${product.id}`);
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      comparePrice: product.comparePrice,
      emoji: CATEGORY_EMOJI[product.category] ?? "🌿",
    });
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500);
  }

  return (
    <section id="products" className="bg-cream/25">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        >
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">Shop</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">Our Products</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs sm:text-right leading-relaxed">
            Universal products ship immediately. Personalized blends are crafted after your consultation.
          </p>
        </motion.div>

        {/* Filter tabs */}
        {products.length > 0 && (
          <div className="flex gap-2 mb-7">
            {(["All", "Universal", "Personalized"] as Filter[]).map((tab) => {
              const count = tab === "All"
                ? products.length
                : products.filter((p) => p.category === tab.toUpperCase()).length;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    filter === tab
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {tab}
                  <span className="ml-1.5 opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {products.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No products yet.</p>
            <p className="text-xs mt-1">
              Add products from the{" "}
              <Link href="/admin/products" className="text-primary underline">admin panel</Link>.
            </p>
          </div>
        )}

        {/* Product grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((product, i) => {
                const emoji = CATEGORY_EMOJI[product.category] ?? "🌿";
                const discount = product.comparePrice
                  ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                  : null;

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                    className="group bg-white rounded-xl border border-border/40 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Image area */}
                    <div className="relative h-36 sm:h-40 bg-gradient-to-br from-cream to-green-50 flex items-center justify-center overflow-hidden">
                      {product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                          {emoji}
                        </span>
                      )}

                      {product.isFeatured && (
                        <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${TAG_STYLE.Featured}`}>
                          Featured
                        </span>
                      )}

                      {discount && (
                        <span className="absolute bottom-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                          {discount}% off
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="text-[13px] font-medium text-foreground leading-snug line-clamp-2 mb-2.5">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-1.5 mb-2.5">
                        <span className="text-sm font-bold text-foreground">{formatPrice(product.price)}</span>
                        {product.comparePrice && (
                          <span className="text-[11px] text-muted-foreground line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className={`w-full flex items-center justify-center gap-1.5 text-[12px] font-medium py-1.5 rounded-lg transition-all duration-200 ${
                          product.stock === 0
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : added === product.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary"
                        }`}
                      >
                        <ShoppingBag className="h-3 w-3" />
                        {product.stock === 0 ? "Out of stock" : added === product.id ? "Added!" : "Add to cart"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* No results for current filter */}
        {products.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No {filter.toLowerCase()} products yet.
          </div>
        )}
      </div>
    </section>
  );
}
