import { AppSidebar } from "@/components/layout/app-sidebar";
import { CompanyGuard } from "@/components/layout/company-guard";
import { CompanySwitcher } from "@/components/layout/company-switcher";
import { UserNav } from "@/components/layout/user-nav";
import { AiChatWidget } from "@/components/ai/ai-chat-widget";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <CompanyGuard>
      <div className="mesh-bg relative h-screen overflow-hidden bg-background">
        {/* Dot texture fading toward the bottom */}
        <div
          aria-hidden
          className="bg-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_90%_80%_at_50%_0%,black_30%,transparent_100%)]"
        />

        <div className="relative z-10 flex h-full gap-3 p-3">
          <AppSidebar />

          <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
            <header className="glass z-20 flex h-[68px] shrink-0 items-center justify-between gap-4 rounded-[24px] border border-border/60 px-4 shadow-[0_1px_2px_rgb(16_16_40/0.04),0_12px_32px_-16px_rgb(16_16_40/0.16)] sm:px-5">
              <CompanySwitcher />
              <div className="flex items-center gap-2">
                <UserNav />
              </div>
            </header>

            <main className="min-h-0 flex-1 overflow-y-auto rounded-[24px] border border-white/60 bg-white/55 shadow-[0_1px_2px_rgb(16_16_40/0.04),0_12px_32px_-16px_rgb(16_16_40/0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="w-full px-4 py-5 sm:px-6 sm:py-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
      <AiChatWidget />
    </CompanyGuard>
  );
}
