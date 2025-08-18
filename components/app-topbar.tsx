"use client"

import Image from "next/image"
import { Coins, LogOut, PanelLeft, Medal } from 'lucide-react'
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { getCurrentUser, logout, subscribeDB } from "@/lib/mock-db"
import { useEffect, useState } from "react"
import { getPatent } from "@/lib/patents"
import { cn } from "@/lib/utils"

export function AppTopbar() {
  const router = useRouter()
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const unsub = subscribeDB(() => setTick((t) => t + 1))
    return () => unsub()
  }, [])
  const user = getCurrentUser()
  const patent = getPatent(user?.xp ?? 0)

  return (
    <header className="sticky top-0 z-10 bg-white border-b">
      <div className="flex items-center justify-between px-3 md:px-4 py-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <PanelLeft className="hidden md:inline-block h-5 w-5 text-muted-foreground" aria-hidden />
          <h1 className="font-semibold" style={{ color: "#0A2540" }}>
            Olá{user ? `, ${user.name.split(' ')[0]}` : ""}!
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span>{user.balance}</span>
              </div>
              <Badge
                className={cn("gap-1")}
                style={{ backgroundColor: patent.bg, color: patent.fg, borderColor: patent.border }}
                variant="outline"
              >
                <Medal className="h-3.5 w-3.5" />
                {patent.name}
              </Badge>
              <Image src={user.avatarUrl || "/placeholder.svg"} alt="Avatar do aluno" width={32} height={32} className="rounded-full border" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout()
                  router.replace("/login")
                }}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sair
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
