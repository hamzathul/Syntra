import { CompanyForm } from "@/components/onboarding/company-form";
import { Building2, Package, ShoppingCart, TrendingUp } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background blob */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-125 w-125 rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, hsl(258 88% 63%), transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-lg shadow-primary/25">
            S
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Set up your company
          </h1>
          <p className="mt-2 text-muted-foreground">
            You&apos;re one step away from your ERP dashboard.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
              <Building2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="font-medium">Company details</p>
              <p className="text-sm text-muted-foreground">
                This can be changed later in settings
              </p>
            </div>
          </div>
          <CompanyForm />
        </div>

        {/* Feature hints */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: TrendingUp, label: "Sales tracking" },
            { icon: ShoppingCart, label: "Purchases" },
            { icon: Package, label: "Inventory" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 rounded-xl border bg-card p-3 text-center"
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
