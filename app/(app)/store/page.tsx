"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, ShieldCheck, Coins } from 'lucide-react'
import { buyItem, getCurrentUser, listStoreItems, subscribeDB } from "@/lib/mock-db"
import { useToast } from "@/hooks/use-toast"
import { getPatent } from "@/lib/patents"

const categories = [
  { id: "physical", label: "Prêmios físicos" },
  { id: "immaterial", label: "Prêmios imateriais" },
  { id: "avatar", label: "Personalização" },
] as const

export default function StorePage() {
  const { toast } = useToast()
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const unsub = subscribeDB(() => setTick((t) => t + 1))
    return () => unsub()
  }, [])
  const user = getCurrentUser()
  const items = listStoreItems()
  const patent = getPatent(user?.xp ?? 0)

  const grouped = useMemo(
    () => ({
      physical: items.filter((i) => i.category === "physical"),
      immaterial: items.filter((i) => i.category === "immaterial"),
      avatar: items.filter((i) => i.category === "avatar"),
    }),
    [items],
  )

  if (!user) return null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Loja</CardTitle>
          <div className="text-sm flex items-center gap-2">
            <Coins className="h-4 w-4 text-yellow-500" />
            Saldo: <span className="font-semibold">{user.balance}</span>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="physical">
            <TabsList className="grid grid-cols-3 w-full">
              {categories.map((c) => (
                <TabsTrigger key={c.id} value={c.id}>
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((c) => (
              <TabsContent key={c.id} value={c.id} className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[c.id].map((item) => {
                  const owned = user.inventory.includes(item.id)
                  const locked = item.requiredPatentIndex !== undefined && (patent.index < item.requiredPatentIndex)
                  return (
                    <Card key={item.id} className={locked ? "opacity-70" : ""}>
                      <CardContent className="p-3">
                        <Image
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.name}
                          width={400}
                          height={240}
                          className="w-full h-40 object-cover rounded-md border"
                        />
                        <div className="mt-3 flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="secondary" className="gap-1">
                                <Coins className="h-3 w-3 text-yellow-500" />
                                {item.price}
                              </Badge>
                              {item.requiredPatentIndex !== undefined && (
                                <Badge variant="outline" className="gap-1">
                                  <ShieldCheck className="h-3 w-3" />
                                  Patente: {item.requiredPatentName}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Button
                              size="sm"
                              disabled={owned || locked || user.balance < item.price}
                              onClick={() => {
                                const res = buyItem(item.id)
                                if (res.ok) {
                                  toast({ title: "Compra realizada!", description: `Você comprou ${item.name}.` })
                                } else {
                                  toast({ variant: "destructive", title: "Não foi possível comprar", description: res.error ?? "Tente novamente." })
                                }
                              }}
                              style={{ backgroundColor: "#0A2540", color: "#FFFFFF" }}
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              {owned ? "Comprado" : locked ? "Bloqueado" : "Comprar"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
