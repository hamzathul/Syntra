import { Loader2Icon } from "lucide-react";

export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
