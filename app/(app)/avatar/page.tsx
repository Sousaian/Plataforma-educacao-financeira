"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentUser, listAvatarOptions, equipAvatar, subscribeDB } from "@/lib/mock-db"
import { Badge } from "@/components/ui/badge"
import { getPatent } from "@/lib/patents"

export default function AvatarPage() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const unsub = subscribeDB(() => setTick((t) => t + 1))
    return () => unsub()
  }, [])
  const user = getCurrentUser()
  const patent = getPatent(user?.xp ?? 0)
  const avatars = useMemo(() => listAvatarOptions(), [])

  if (!user) return null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Personalizar Avatar</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="border rounded-lg p-3 bg-[#F1F1F1]">
            <p className="text-sm text-muted-foreground mb-2">Preview</p>
            <Image src={user.avatarUrl || "/placeholder.svg"} alt="Avatar atual" width={300} height={300} className="w-full h-auto rounded-md border" />
            <p className="text-sm mt-2">
              Patente:{" "}
              <Badge variant="outline" style={{ backgroundColor: patent.bg, color: patent.fg, borderColor: patent.border }}>
                {patent.name}
              </Badge>
            </p>
          </div>
          <div className="lg:col-span-2">
            <p className="text-sm mb-2 text-muted-foreground">Avatares disponíveis</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {avatars.map((a) => {
                const owned = user.inventory.includes(a.id) || a.free
                const locked = !owned && a.requiredPatentIndex !== undefined
                return (
                  <div key={a.id} className={`border rounded-md p-2 ${locked ? "opacity-70" : ""}`}>
                    <Image src={a.src || "/placeholder.svg"} alt={a.name} width={240} height={240} className="w-full h-auto rounded-md" />
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm font-medium">{a.name}</div>
                      {locked && <Badge variant="outline">Patente: {a.requiredPatentName}</Badge>}
                    </div>
                    <Button
                      className="mt-2 w-full"
                      variant="secondary"
                      disabled={!owned}
                      onClick={() => equipAvatar(a.id)}
                    >
                      {owned ? (user.avatarId === a.id ? "Equipado" : "Equipar") : "Bloqueado"}
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
