import { SettingsNav } from "@/components/settings/settings-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] sm:text-[24px]">
          Settings
        </h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Manage your account and application preferences.
        </p>
      </div>
      <SettingsNav />
      <div>{children}</div>
    </div>
  );
}
