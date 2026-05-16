"use client";
import { useState } from "react";
import { Plus, Search, ShoppingBag, Star, Eye, EyeOff, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductFormModal } from "@/components/admin/product-form-modal";
import { ProductPriceEditor } from "@/components/admin/product-price-editor";
import { ProductToggle } from "@/components/admin/product-toggle";
import { cn } from "@/lib/utils";
import type { Product } from "@prisma/client";

interface Props {
  products: Product[];
  stats: { universalCount: number; personalizedCount: number; activeCount: number };
}

type Filter = "all" | "UNIVERSAL" | "PERSONALIZED" | "inactive";

export function ProductsClient({ products, stats }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "inactive"
        ? !p.isActive
        : p.category === filter;
    const matchesSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: products.length },
    { key: "UNIVERSAL", label: "Universal", count: stats.universalCount },
    { key: "PERSONALIZED", label: "Personalized", count: stats.personalizedCount },
    { key: "inactive", label: "Inactive", count: products.length - stats.activeCount },
  ];

  return (
    <>
      {(showModal || editProduct) && (
        <ProductFormModal
          product={editProduct ?? undefined}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Products</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {stats.activeCount} active · {products.length} total
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </Button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">Universal</p>
              <p className="text-2xl font-bold mt-1">{stats.universalCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">Personalized</p>
              <p className="text-2xl font-bold mt-1">{stats.personalizedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-2xl font-bold mt-1">{stats.activeCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters + search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  filter === f.key
                    ? "bg-white shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
                <span className="ml-1.5 text-muted-foreground">({f.count})</span>
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {/* Product table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No products found</p>
                <p className="text-xs mt-1">Try changing the filter or add a new product</p>
                <Button className="mt-4" onClick={() => setShowModal(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add First Product
                </Button>
              </div>
            )}

            <div className="space-y-2">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                    product.isActive ? "border-border/60 hover:bg-muted/20" : "border-border/30 bg-muted/10 opacity-60"
                  )}
                >
                  {/* Product image placeholder */}
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-sage/10 flex items-center justify-center flex-shrink-0 text-2xl">
                    {product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0]} alt="" className="h-full w-full object-cover rounded-xl" />
                    ) : "🧴"}
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      {product.isFeatured && (
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                      )}
                      <Badge
                        variant={product.category === "UNIVERSAL" ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {product.category === "UNIVERSAL" ? "Universal" : "Personalized"}
                      </Badge>
                    </div>
                    {product.sku && (
                      <p className="text-xs text-muted-foreground mt-0.5">SKU: {product.sku}</p>
                    )}
                  </div>

                  {/* Price editor — hover to edit inline */}
                  <div className="hidden sm:block">
                    <ProductPriceEditor
                      productId={product.id}
                      price={Number(product.price)}
                      comparePrice={product.comparePrice ? Number(product.comparePrice) : null}
                      stock={product.stock}
                    />
                  </div>

                  {/* Toggles */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {product.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      <ProductToggle productId={product.id} field="isActive" value={product.isActive} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Star className="h-3.5 w-3.5" />
                      <ProductToggle productId={product.id} field="isFeatured" value={product.isFeatured} />
                    </div>
                  </div>

                  {/* Edit button */}
                  <button
                    onClick={() => setEditProduct(product)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                    title="Edit product"
                  >
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
