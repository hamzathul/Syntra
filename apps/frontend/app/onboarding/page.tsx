import { CompanyForm } from "@/components/onboarding/company-form";
import { Building2, Check } from "lucide-react";

const steps = ["Company", "Sales", "Purchases", "Inventory"];

export default function OnboardingPage() {
  return (
    <div className="mesh-bg flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-page-in">
        <div className="mb-8 text-center">
          <div className="brand-gradient mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white">
            S
          </div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
            Set up your company
          </h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            One step away from your new workspace.
          </p>
        </div>

        {/* Progress */}
        <ol className="mb-5 flex items-center justify-center gap-1.5">
          {steps.map((label, index) => (
            <li key={label} className="flex items-center gap-1.5">
              <span
                className={
                  index === 0
                    ? "flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground"
                    : "flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                }
              >
                {index === 0 ? (
                  <Building2 className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3 opacity-40" />
                )}
                {label}
              </span>
              {index < steps.length - 1 && (
                <span className="h-px w-3 bg-border" aria-hidden />
              )}
            </li>
          ))}
        </ol>

        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-soft sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" strokeWidth={1.9} />
            </div>
            <div>
              <p className="text-[14px] font-semibold tracking-tight">
                Company details
              </p>
              <p className="text-[12.5px] text-muted-foreground">
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
