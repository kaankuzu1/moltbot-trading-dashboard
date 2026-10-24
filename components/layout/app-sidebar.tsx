"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Wallet, ArrowLeftRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarWalletCard } from "@/components/layout/sidebar-wallet-card";
import { ClawdMascot } from "@/components/ui/clawd-mascot";

const navItems = [
  {
    title: "Istatistikler",
    href: "/statistics",
    icon: BarChart3,
  },
  {
    title: "Varliklar",
    href: "/varliklar",
    icon: Wallet,
  },
  {
    title: "Islemler",
    href: "/islemler",
    icon: ArrowLeftRight,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold tracking-tight leading-normal">MoltBot Trading Dashboard</span>
          <ClawdMascot className="h-6 w-6 shrink-0" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link
                      href={item.href}
                      onClick={() => { if (isMobile) setOpenMobile(false); }}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarWalletCard />
      </SidebarFooter>
    </Sidebar>
  );
}
