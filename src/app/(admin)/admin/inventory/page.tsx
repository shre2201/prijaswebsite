import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";
import { AddMaterialForm } from "@/components/admin/add-material-form";

export default async function InventoryPage() {
  const materials = await db.rawMaterial.findMany({ orderBy: { name: "asc" } });
  const lowStock = materials.filter((m) => Number(m.stock) <= Number(m.lowStockThreshold));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {materials.length} raw materials · {lowStock.length} low stock
          </p>
        </div>
        <AddMaterialForm />
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800">
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm">Low stock alert</p>
            <p className="text-xs mt-0.5">
              {lowStock.map((m) => m.name).join(", ")} — reorder soon.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Raw Materials</CardTitle>
        </CardHeader>
        <CardContent>
          {materials.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No materials added yet</p>
            </div>
          )}
          <div className="space-y-3">
            {materials.map((material) => {
              const isLow = Number(material.stock) <= Number(material.lowStockThreshold);

              return (
                <div key={material.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{material.name}</p>
                      {material.supplier && (
                        <p className="text-xs text-muted-foreground">{material.supplier}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {Number(material.stock).toFixed(1)} {material.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        min: {Number(material.lowStockThreshold).toFixed(1)} {material.unit}
                      </p>
                    </div>
                    <Badge variant={isLow ? "warning" : "success"}>
                      {isLow ? "Low" : "OK"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
