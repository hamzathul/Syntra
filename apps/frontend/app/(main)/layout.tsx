import { AppSidebar } from "@/components/layout/app-sidebar";
import { CompanyGuard } from "@/components/layout/company-guard";
import { CompanySwitcher } from "@/components/layout/company-switcher";
import { UserNav } from "@/components/layout/user-nav";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <CompanyGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar />

        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur px-5 gap-4">
            <CompanySwitcher />
            <div className="flex items-center gap-2">
              <UserNav />
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="h-full p-6">{children}</div>
          </main>
        </div>
      </div>
    </CompanyGuard>
  );
}
