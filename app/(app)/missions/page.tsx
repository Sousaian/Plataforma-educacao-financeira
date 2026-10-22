"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Coins, ChevronDown, ChevronUp, Calendar, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { eduService } from "@/lib/services"
import { useCurrentUser } from "@/hooks/use-edu"
import { useToast } from "@/hooks/use-toast"

export default function MissionsPage() {
  const { toast } = useToast()
  const [expandedMission, setExpandedMission] = useState<string | null>(null)
  const user = useCurrentUser()

  if (!user) return null
  const missions = user.missions

  const toggleExpanded = (missionId: string) => {
    setExpandedMission(expandedMission === missionId ? null : missionId)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Missões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {missions.map((m) => {
            const isExpanded = expandedMission === m.id
            return (
              <div key={m.id} className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(m.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {m.completed ? (
                      <CheckCircle2 className="text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{m.title}</p>
                        {m.mandatory && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Obrigatória
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{m.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm flex items-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      {m.reward}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 border-t bg-gray-50/50">
                    <div className="pt-3 space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Detalhes da Missão</h4>
                        <p className="text-sm text-muted-foreground">{m.description}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Data de Entrega</p>
                            <p className="text-sm font-medium">{m.dueDate || "Sem prazo definido"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Tipo</p>
                            <p className="text-sm font-medium">{m.mandatory ? "Obrigatória" : "Opcional"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          size="sm"
                          variant={m.completed ? "secondary" : "default"}
                          style={!m.completed ? { backgroundColor: "#0A2540", color: "#FFFFFF" } : undefined}
                          disabled={m.completed}
                          onClick={(e) => {
                            e.stopPropagation()
                            const res = eduService.completeMission(m.id)
                            if (res.ok) {
                              toast({ title: "Missão concluída!", description: `+${m.reward} moedas` })
                            } else {
                              toast({
                                variant: "destructive",
                                title: "Ops",
                                description: res.error ?? "Não foi possível completar.",
                              })
                            }
                          }}
                        >
                          {m.completed ? "Concluída" : "Completar"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
