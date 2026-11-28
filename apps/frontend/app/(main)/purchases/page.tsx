import { Clock, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export default function PurchasesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchases"
        description="Purchase orders and supplier bills."
      />

      <div className="rounded-xl border border-border/80 bg-card">
        <EmptyState
          icon={ShoppingCart}
          title="Purchases are on the way"
          description="Create purchase orders, receive stock and track supplier payments — without the clutter."
          actions={
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              Coming soon
            </Badge>
          }
        />
      </div>
    </div>
  );
}
