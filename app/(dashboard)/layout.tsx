import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { ManualRefreshProvider } from "@/lib/contexts/manual-refresh-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ManualRefreshProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopBar />
          <div className="flex-1 overflow-x-hidden p-4 sm:p-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </ManualRefreshProvider>
  );
}
