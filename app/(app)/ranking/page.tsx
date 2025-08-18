"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRanking, subscribeDB, getCurrentUser } from "@/lib/mock-db"
import { getPatent } from "@/lib/patents"

export default function RankingPage() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const unsub = subscribeDB(() => setTick((t) => t + 1))
    return () => unsub()
  }, [])
  const top = getRanking()
  const currentUser = getCurrentUser()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Ranking dos Melhores Investidores</CardTitle>
          {currentUser && (
            <p className="text-sm text-muted-foreground">
              {currentUser.school} - Turma {currentUser.classroom}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {top.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum aluno encontrado na sua turma ainda.</p>
          ) : (
            top.map((u, i) => {
              const p = getPatent(u.xp)
              return (
                <div key={u.id} className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold w-6 text-right">{i + 1}</span>
                    <Image
                      src={u.avatarUrl || "/placeholder.svg"}
                      alt={`Avatar de ${u.name}`}
                      width={40}
                      height={40}
                      className="rounded-full border"
                    />
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.classroom}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <span className="font-semibold">Saldo:</span> {u.balance}
                    </div>
                    <div
                      className="text-xs rounded px-2 py-1 border"
                      style={{ backgroundColor: p.bg, color: p.fg, borderColor: p.border }}
                    >
                      {p.name}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
