"use client"

import { Calendar, Eye, TrendingUp, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { InvestmentSnapshot } from "@/lib/domain"
import { formatDate } from "@/lib/format-date"
import { InfoRow } from "./info-row"
import { formatCoins, formatSignedCoins, yieldClass } from "./format"

function EmptyState({ icon: Icon, title, text }: { icon: typeof Calendar; title: string; text: string }) {
  return (
    <Card className="border-0 shadow-sm bg-gray-50">
      <CardContent className="p-6 sm:p-8 text-center">
        <Icon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{text}</p>
      </CardContent>
    </Card>
  )
}

export function ActiveInvestments({
  investments,
  onDetails,
  onWithdraw,
}: {
  investments: InvestmentSnapshot[]
  onDetails: (inv: InvestmentSnapshot) => void
  onWithdraw: (id: string) => void
}) {
  if (investments.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Nenhum investimento ativo"
        text="Que tal começar seu primeiro investimento?"
      />
    )
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {investments.map((inv) => (
        <Card key={inv.id} className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base font-semibold" style={{ color: "#0A2540" }}>
                  {inv.assetName}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={inv.statusLabel === "Em vencimento" ? "destructive" : "secondary"} className="text-xs">
                    {inv.statusLabel}
                  </Badge>
                  <span className="text-xs text-gray-500">Risco: {inv.risk}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => onDetails(inv)} className="shrink-0">
                <Eye className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Detalhes</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="Investido" value={`${formatCoins(inv.principal)} moedas`} />
              <InfoRow
                label="Rendimento atual"
                value={`${formatSignedCoins(inv.currentYield)} moedas`}
                valueClass={yieldClass(inv.currentYield)}
              />
              <InfoRow label="Valor atual" value={`${formatCoins(inv.currentValue)} moedas`} />
              <InfoRow label="Vencimento" value={formatDate(inv.maturityAt)} />
            </div>
            {inv.canWithdraw && (
              <Button
                onClick={() => onWithdraw(inv.id)}
                className="w-full mt-3"
                style={{ backgroundColor: "#0A2540", color: "#FFFFFF" }}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Resgatar
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function InvestmentHistory({ investments }: { investments: InvestmentSnapshot[] }) {
  if (investments.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Nenhum histórico ainda"
        text="Seus investimentos finalizados aparecerão aqui."
      />
    )
  }
  return (
    <div className="space-y-3">
      {investments.map((inv) => (
        <Card key={inv.id} className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm" style={{ color: "#0A2540" }}>
                  {inv.assetName}
                </h4>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                  <span>Início: {formatDate(inv.startAt)}</span>
                  <span>Fim: {formatDate(inv.maturityAt)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {formatCoins(inv.principal)} → {formatCoins(inv.currentValue)}
                </div>
                <div className={`text-xs ${yieldClass(inv.currentYield)}`}>
                  {inv.currentYield >= 0 ? "+" : ""}
                  {formatCoins(inv.currentYield)} moedas
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
