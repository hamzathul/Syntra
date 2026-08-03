import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PurchasesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
        <p className="text-muted-foreground">
          Manage purchase orders and suppliers
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No purchase orders yet. Purchase management coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
