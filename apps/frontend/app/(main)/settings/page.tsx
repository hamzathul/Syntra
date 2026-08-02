import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { settingsNavItems } from "@/lib/settings-nav";

const settingsCategories = settingsNavItems.filter(
  (item) => item.href !== "/settings",
);

export default function SettingsOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        {settingsCategories.map((cat) => {
          const Icon = cat.icon;
          const content = (
            <Card
              className={
                cat.disabled
                  ? "opacity-60"
                  : "hover:border-primary/50 transition-colors cursor-pointer"
              }
            >
              <CardHeader className="flex flex-row items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{cat.title}</CardTitle>
                    {cat.disabled && (
                      <Badge variant="secondary" className="text-[10px]">
                        Coming soon
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1">
                    {cat.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          );

          if (cat.disabled) {
            return <div key={cat.title}>{content}</div>;
          }

          return (
            <Link key={cat.title} href={cat.href}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
