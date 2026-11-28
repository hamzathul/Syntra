import { BarChart3, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Analytics and business insights."
      />

      <div className="rounded-xl border border-border/80 bg-card">
        <EmptyState
          icon={BarChart3}
          title="Reports are on the way"
          description="Sales trends, profit summaries and party ledgers will live here — glanceable and shareable."
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
