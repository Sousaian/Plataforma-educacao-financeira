"use client"

import { TrendingUp, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InvestmentChart } from "@/components/investment-chart"
import { formatDate } from "@/lib/format-date"
import { InfoRow } from "./info-row"
import { formatCoins, formatSignedCoins, yieldClass } from "./format"
import type { DetailState } from "./use-simulator"

type Props = {
  state: DetailState
  onClose: () => void
  onWithdraw: (id: string) => void
}

export function InvestmentDetailDialog({ state, onClose, onWithdraw }: Props) {
  const inv = state.investment
  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {inv?.assetName}
          </DialogTitle>
          <DialogDescription>Acompanhe o desempenho do seu investimento em tempo real.</DialogDescription>
        </DialogHeader>

        {inv && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <InfoRow label="Status" value={inv.statusLabel} />
              <InfoRow label="Risco" value={inv.risk} />
              <InfoRow label="Prazo" value={`${inv.months} meses`} />
              <InfoRow label="Taxa mensal" value={`${Math.round(inv.monthlyRate * 100)}%`} />
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Evolução do investimento</h4>
              <InvestmentChart data={inv.series} height={200} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <InfoRow label="Valor investido" value={`${formatCoins(inv.principal)} moedas`} />
              <InfoRow
                label="Rendimento atual"
                value={`${formatSignedCoins(inv.currentYield)} moedas`}
                valueClass={yieldClass(inv.currentYield)}
              />
              <InfoRow label="Valor atual" value={`${formatCoins(inv.currentValue)} moedas`} />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">Vencimento: {formatDate(inv.maturityAt)}</div>
              {inv.canWithdraw && (
                <Button onClick={() => onWithdraw(inv.id)} style={{ backgroundColor: "#0A2540", color: "#FFFFFF" }}>
                  <Wallet className="h-4 w-4 mr-2" />
                  Resgatar
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
