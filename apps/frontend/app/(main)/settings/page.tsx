import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { settingsNavItems } from "@/lib/settings-nav";

const settingsCategories = settingsNavItems.filter(
  (item) => item.href !== "/settings",
);

export default function SettingsOverviewPage() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {settingsCategories.map((cat) => {
        const Icon = cat.icon;
        const content = (
          <div
            className={
              cat.disabled
                ? "h-full rounded-xl border border-border/80 bg-card p-5 opacity-55"
                : "group h-full rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-[0_1px_2px_rgb(16_16_40/0.05),0_12px_32px_-16px_rgb(16_16_40/0.16)]"
            }
          >
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              {cat.disabled ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Soon
                </span>
              ) : (
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/35 transition-colors group-hover:text-primary" />
              )}
            </div>
            <p className="mt-3 text-[14px] font-semibold tracking-tight">
              {cat.title}
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
              {cat.description}
            </p>
          </div>
        );

        if (cat.disabled) {
          return <div key={cat.title}>{content}</div>;
        }

        return (
          <Link key={cat.title} href={cat.href} className="block">
            {content}
          </Link>
        );
      })}
    </div>
  );
}
