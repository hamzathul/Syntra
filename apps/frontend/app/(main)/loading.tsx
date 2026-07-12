import { DashboardSkeleton } from "@/components/ui/error-boundary";

export default function MainLoading() {
  return (
    <div className="h-full p-6">
      <DashboardSkeleton />
    </div>
  );
}
