import { CompanyGuard } from "@/components/layout/company-guard";
import { AiChatWidget } from "@/components/ai/ai-chat-widget";
import { AppShell } from "@/components/layout/app-shell";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <CompanyGuard>
      <AppShell>{children}</AppShell>
      <AiChatWidget />
    </CompanyGuard>
  );
}
