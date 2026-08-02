import { SettingsSidebar } from "@/components/settings/settings-sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-8">
      <div className="sticky top-6 self-start">
        <SettingsSidebar />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
