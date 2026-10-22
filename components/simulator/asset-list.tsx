"use client"

import { BadgeInfo, GraduationCap, LineChartIcon as ChartLine, ShieldAlert, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { eduService } from "@/lib/services"
import type { SimAsset } from "@/lib/domain"
import { InfoRow } from "./info-row"
import { daysForMonths, formatCoins, formatSignedCoins, yieldClass } from "./format"

export function AssetList({ assets, onSimulate }: { assets: SimAsset[]; onSimulate: (asset: SimAsset) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      {assets.map((a) => (
        <AssetCard key={a.id} asset={a} onSimulate={() => onSimulate(a)} />
      ))}
    </div>
  )
}

function AssetCard({ asset: a, onSimulate }: { asset: SimAsset; onSimulate: () => void }) {
  const defaultMonths = a.defaultMonths ?? 3
  const minInvest = a.minInvest ?? 100
  const sim = eduService.simulateReturn(a, defaultMonths, minInvest)
  const estYield = sim.ok ? sim.expectedYield : 0
  const leftBorder = a.borderColor || a.color || "#0A2540"
  const indexation = a.indexation ?? (a.risk === "Variável" ? "Variável" : "Fixado")

  return (
    <Card
      className="group relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 bg-white"
      style={{ borderLeftWidth: 4, borderLeftColor: leftBorder }}
    >
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex flex-col gap-1.5 sm:gap-2">
          <span className="font-semibold text-sm sm:text-base lg:text-lg leading-tight" style={{ color: "#0A2540" }}>
            {a.name}
          </span>
          <div className="flex flex-wrap gap-1">
            {a.safe && (
              <Badge variant="secondary" className="gap-1 text-xs h-5">
                <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                <span className="hidden sm:inline">Seguro</span>
                <span className="sm:hidden">S</span>
              </Badge>
            )}
            {a.risk === "Variável" && (
              <Badge variant="outline" className="gap-1 text-xs h-5">
                <ShieldAlert className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-600" />
                <span className="hidden sm:inline">Variável</span>
                <span className="sm:hidden">V</span>
              </Badge>
            )}
            {a.hasCourse && (
              <Badge variant="outline" className="gap-1 text-xs h-5">
                <GraduationCap className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline">Curso</span>
                <span className="sm:hidden">C</span>
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Rendimento:</span>
              <span className="font-semibold text-green-600 text-xs sm:text-sm">
                {a.yieldLabel ?? `+${Math.round((a.monthlyRate ?? 0) * 100)}% ao mês`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Indexação:</span>
              <span className="font-medium text-xs">{indexation}</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{a.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-2 text-xs bg-gray-50 p-2 sm:p-3 rounded-lg">
          <InfoRow label="Mínimo" value={`${formatCoins(minInvest)} MOEDAS`} />
          <InfoRow label="Vencimento" value={`${daysForMonths(defaultMonths)} dias`} />
          <InfoRow label="Resgate" value={a.redemption ?? "Ao final"} />
          <InfoRow label="Rentabilidade" value={`${formatSignedCoins(estYield)} moedas`} valueClass={yieldClass(estYield)} />
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <BadgeInfo className="h-3 w-3" />
            <span>Simulação educacional</span>
          </div>
          <Button
            onClick={onSimulate}
            className="w-full px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
            style={{ backgroundColor: "#0A2540", color: "#FFFFFF" }}
          >
            <ChartLine className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
            Simular
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
