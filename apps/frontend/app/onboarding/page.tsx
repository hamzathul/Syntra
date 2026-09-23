import { CompanyForm } from "@/components/onboarding/company-form";
import {
  Building2,
  Check,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

const steps = [
  { icon: Building2, label: "Company" },
  { icon: TrendingUp, label: "Sales" },
  { icon: ShoppingCart, label: "Purchases" },
  { icon: Package, label: "Inventory" },
];

export default function OnboardingPage() {
  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="relative z-10 w-full max-w-lg animate-fade-up">
        {/* Header */}
        <div className="mb-7 text-center">
          <div className="brand-gradient mb-4 inline-flex h-14 w-14 items-center justify-center rounded-[20px] text-2xl font-bold text-white shadow-[0_10px_24px_-6px_hsl(var(--primary)/0.6)]">
            S
          </div>
          <h1 className="text-[30px] font-semibold tracking-tight">
            Set up your company
          </h1>
          <p className="mt-1.5 text-[15px] text-muted-foreground">
            You&apos;re one step away from your calm new workspace.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-5 flex items-center justify-center gap-2">
          {steps.map(({ icon: Icon, label }, index) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  index === 0
                    ? "bg-primary text-primary-foreground shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.55)]"
                    : "border border-border/70 bg-card text-muted-foreground"
                }`}
              >
                {index === 0 ? (
                  <Icon className="h-3.5 w-3.5" />
                ) : (
                  <Check className="h-3.5 w-3.5 opacity-50" />
                )}
                {label}
              </span>
              {index < steps.length - 1 && (
                <span className="h-px w-4 bg-border" />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="rounded-[28px] border border-border/60 bg-card p-7 shadow-[0_2px_4px_rgb(16_16_40/0.05),0_16px_40px_-16px_rgb(16_16_40/0.2)] sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/[0.09] text-primary">
              <Building2 className="h-5 w-5" strokeWidth={1.9} />
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight">
                Company details
              </p>
              <p className="text-[13px] text-muted-foreground">
                This can be changed later in settings
              </p>
            </div>
          </div>
          <CompanyForm />
        </div>
      </div>
    </div>
  );
}
