"use client"

import {
  LayoutDashboard,
  ListTodo,
  ShoppingBag,
  LineChartIcon as ChartLine,
  Trophy,
  UserCircle2,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarRail,
} from "@/components/ui/sidebar"

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Missões", url: "/missions", icon: ListTodo },
  { title: "Loja", url: "/store", icon: ShoppingBag },
  { title: "Investimentos", url: "/simulator", icon: ChartLine },
  { title: "Oportunidades", url: "/opportunities", icon: Briefcase },
  { title: "Ranking", url: "/ranking", icon: Trophy },
  { title: "Perfil", url: "/profile", icon: UserCircle2 },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md" style={{ backgroundColor: "#0A2540" }} aria-hidden />
          <span className="font-semibold">EduInvest</span>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
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
      <SidebarFooter className="text-xs text-muted-foreground px-3 pb-3">DLJ3 • MVP</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

// This shell uses the shadcn Sidebar primitives recommended for collapsible app navigation [^3].
