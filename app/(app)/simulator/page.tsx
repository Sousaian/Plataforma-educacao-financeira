"use client"

import Link from "next/link"
import { ArrowLeft, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssetList } from "@/components/simulator/asset-list"
import { ActiveInvestments, InvestmentHistory } from "@/components/simulator/portfolio"
import { SimulationDialog } from "@/components/simulator/simulation-dialog"
import { InvestmentDetailDialog } from "@/components/simulator/investment-detail-dialog"
import { SimulatorTips } from "@/components/simulator/simulator-tips"
import { formatCoins } from "@/components/simulator/format"
import { useSimulator } from "@/components/simulator/use-simulator"

export default function InvestmentsCatalogPage() {
  const sim = useSimulator()
  const { user } = sim

  if (!user) return null

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="outline" size="sm" className="shrink-0 bg-transparent h-8 sm:h-9">
              <Link href="/dashboard">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="text-xs sm:text-sm">Voltar</span>
              </Link>
            </Button>
            <h1 className="text-base sm:text-lg lg:text-xl font-semibold truncate" style={{ color: "#0A2540" }}>
              Investimentos
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shrink-0">
            <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
            <span className="text-gray-600">Saldo:</span>
            <span className="font-semibold text-gray-900">{formatCoins(user.balance)} MOEDAS</span>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-6 py-4 sm:py-6">
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="available" className="text-xs sm:text-sm">
              Disponíveis
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">
              Ativos ({sim.activeInvestments.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-6">
            <AssetList assets={sim.assets} onSimulate={sim.openSimulation} />
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <ActiveInvestments
              investments={sim.activeInvestments}
              onDetails={sim.openDetail}
              onWithdraw={sim.withdraw}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <InvestmentHistory investments={sim.closedInvestments} />
          </TabsContent>
        </Tabs>

        <SimulatorTips />
      </div>

      <SimulationDialog
        state={sim.simulation}
        onOpenChange={sim.setSimulationOpen}
        onChange={sim.updateSimulation}
        onConfirm={sim.confirm}
      />
      <InvestmentDetailDialog state={sim.detail} onClose={sim.closeDetail} onWithdraw={sim.withdraw} />
    </div>
  )
}
