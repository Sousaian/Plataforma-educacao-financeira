"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentUser, subscribeDB } from "@/lib/mock-db"
import { getPatent } from "@/lib/patents"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, TrendingUp } from "lucide-react"

const ACHIEVEMENT_DEFINITIONS = {
  first_investment: {
    name: "Primeiro Investimento",
    description: "Fez seu primeiro investimento",
    icon: Target,
    color: "#10B981", // green
  },
  proj_gain_10: {
    name: "Projeção 10%+",
    description: "Investimento com projeção de ganho acima de 10%",
    icon: TrendingUp,
    color: "#3B82F6", // blue
  },
  yield_10_plus: {
    name: "Rendimento 10%+",
    description: "Obteve rendimento real acima de 10%",
    icon: Trophy,
    color: "#F59E0B", // gold
  },
}

export default function ProfilePage() {
  const [tick, setTick] = useState(0)
  const [showAllHistory, setShowAllHistory] = useState(false)

  useEffect(() => {
    const unsub = subscribeDB(() => setTick((t) => t + 1))
    return () => unsub()
  }, [])

  const user = getCurrentUser()
  if (!user) return null
  const p = getPatent(user.xp)

  const displayedTransactions = showAllHistory ? user.transactions : user.transactions.slice(0, 5)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Perfil do Aluno</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="border rounded-md p-3 bg-[#F1F1F1]">
            <Image
              src={user.avatarUrl || "/placeholder.svg"}
              alt="Avatar atual"
              width={240}
              height={240}
              className="rounded-md border w-full h-auto"
            />
            <div className="mt-3">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">Turma: {user.classroom}</p>
              <div className="mt-2">
                <Badge variant="outline" style={{ backgroundColor: p.bg, color: p.fg, borderColor: p.border }}>
                  {p.name}
                </Badge>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Conquistas</h3>
              {!user.achievements || user.achievements.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Conquistas serão desbloqueadas conforme você progride.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {user.achievements.map((achievementId) => {
                    const achievement = ACHIEVEMENT_DEFINITIONS[achievementId as keyof typeof ACHIEVEMENT_DEFINITIONS]
                    if (!achievement) return null

                    const IconComponent = achievement.icon

                    return (
                      <div
                        key={achievementId}
                        className="flex flex-col items-center p-4 border rounded-lg bg-gradient-to-b from-white to-gray-50 hover:shadow-md transition-shadow"
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm"
                          style={{ backgroundColor: achievement.color }}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-medium text-sm text-center text-[#0A2540]">{achievement.name}</h4>
                        <p className="text-xs text-muted-foreground text-center mt-1">{achievement.description}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Histórico de Moedas</h3>
                {user.transactions.length > 5 && (
                  <Button variant="outline" size="sm" onClick={() => setShowAllHistory(!showAllHistory)}>
                    {showAllHistory ? "Ver menos" : `Ver todos (${user.transactions.length})`}
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {displayedTransactions.length === 0 && (
                  <p className="text-sm text-muted-foreground">Sem transações por enquanto.</p>
                )}
                {displayedTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between border rounded-md p-2 text-sm">
                    <span className="truncate">{t.description}</span>
                    <span className={t.amount >= 0 ? "text-green-600" : "text-red-600"}>
                      {t.amount >= 0 ? "+" : ""}
                      {t.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
