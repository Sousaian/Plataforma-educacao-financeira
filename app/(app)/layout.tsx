"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppTopbar } from "@/components/app-topbar"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { eduService } from "@/lib/services"

// Authenticated app shell with shadcn Sidebar [^3]
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  useEffect(() => {
    const u = eduService.getCurrentUser()
    if (!u) {
      router.replace("/login")
    }
  }, [router, pathname])
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#FFFFFF]">
        <AppTopbar />
        <div className="p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
