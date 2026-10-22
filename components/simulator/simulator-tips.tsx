import { Coins, Info, ShieldCheck, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tip } from "./info-row"

export function SimulatorTips() {
  return (
    <Card className="border-0 shadow-sm bg-gray-50 mt-6">
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Tip
            icon={<ShieldCheck className="h-4 w-4 text-green-600" />}
            title="Invista com responsabilidade"
            text="Escolha valores que caibam no seu saldo de moedas."
          />
          <Tip
            icon={<Info className="h-4 w-4 text-blue-600" />}
            title="Rentabilidade é simulada"
            text="Os números representam um ambiente educativo."
          />
          <Tip
            icon={<Coins className="h-4 w-4 text-yellow-500" />}
            title="Use seu saldo escolar"
            text="Sem dinheiro real. Apenas moedas da plataforma."
          />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 flex items-center gap-2">
          <Star className="h-3.5 w-3.5" />
          Esta é uma simulação educacional, sem relação com dinheiro real.
        </div>
      </CardContent>
    </Card>
  )
}
