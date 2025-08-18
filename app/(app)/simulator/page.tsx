"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  BadgeInfo,
  Coins,
  GraduationCap,
  LineChartIcon as ChartLine,
  ShieldCheck,
  ShieldAlert,
  Info,
  Star,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { InvestmentChart } from "@/components/investment-chart"
import { getCurrentUser, listSimAssets, simulateReturn, confirmInvestment, type SimAsset } from "@/lib/mock-db"
import { formatDate } from "@/lib/format-date"

const MS_MONTH = 30 * 24 * 60 * 60 * 1000

type ModalState = {
  open: boolean
  asset: SimAsset | null
  amountInput: string // keep string to allow empty values while typing
  months: number
  simOk: boolean
  expectedFinal: number
  expectedYield: number
  series: { t: number; v: number }[]
  maturity: number
}

export default function InvestmentsCatalogPage() {
  const router = useRouter()
  const { toast } = useToast()
  const user = getCurrentUser()
  const assets = useMemo(() => listSimAssets(), [])
  const [modal, setModal] = useState<ModalState>({
    open: false,
    asset: null,
    amountInput: "",
    months: 3,
    simOk: false,
    expectedFinal: 0,
    expectedYield: 0,
    series: [],
    maturity: Date.now(),
  })

  useEffect(() => {
    if (!user) router.replace("/login")
  }, [user, router])

  if (!user) return null

  // Helpers
  const formatCoins = (n: number) => {
    const val = Number.isFinite(n) ? Math.round(n) : 0
    return val.toLocaleString("pt-BR")
  }
  const daysForMonths = (m: number) => m * 30

  const onOpenModal = (asset: SimAsset) => {
    const months = asset.defaultMonths ?? 3
    const amount = asset.minInvest ?? 100
    const res = simulateReturn(asset.id, months, amount)
    setModal({
      open: true,
      asset,
      amountInput: String(amount),
      months,
      simOk: !!res.ok,
      expectedFinal: res.ok ? res.expectedFinal : 0,
      expectedYield: res.ok ? res.expectedYield : 0,
      series: res.ok ? res.series : [],
      maturity: res.ok ? res.maturity : Date.now() + months * MS_MONTH,
    })
  }

  const recalcSimulation = (nextAmountInput?: string, nextMonths?: number) => {
    setModal((prev) => {
      const amountStr = nextAmountInput ?? prev.amountInput
      const months = nextMonths ?? prev.months
      const amount = Number.parseFloat(amountStr.replace(",", "."))
      const valid = Number.isFinite(amount) && amount > 0
      if (!prev.asset || !valid) {
        return {
          ...prev,
          amountInput: amountStr,
          months,
          simOk: false,
          expectedFinal: 0,
          expectedYield: 0,
          series: [],
          maturity: Date.now() + months * MS_MONTH,
        }
      }
      const res = simulateReturn(prev.asset.id, months, amount)
      return {
        ...prev,
        amountInput: amountStr,
        months,
        simOk: !!res.ok,
        expectedFinal: res.ok ? res.expectedFinal : 0,
        expectedYield: res.ok ? res.expectedYield : 0,
        series: res.ok ? res.series : [],
        maturity: res.ok ? res.maturity : Date.now() + months * MS_MONTH,
      }
    })
  }

  const onConfirm = () => {
    if (!modal.asset) return
    const amount = Number.parseFloat(modal.amountInput.replace(",", "."))
    const valid = Number.isFinite(amount) && amount > 0
    if (!valid) {
      toast({ variant: "destructive", title: "Valor inválido", description: "Informe um valor maior que zero." })
      return
    }
    const res = confirmInvestment({
      assetId: modal.asset.id,
      assetName: modal.asset.name,
      months: modal.months,
      principal: amount,
    })
    if ("ok" in res && res.ok) {
      toast({
        title: "Investimento confirmado!",
        description: `Aplicado ${formatCoins(amount)} moedas em ${modal.asset.name}.`,
      })
      setModal((p) => ({ ...p, open: false }))
    } else {
      toast({
        variant: "destructive",
        title: "Não foi possível investir",
        description: (res as any)?.error ?? "Tente novamente.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="shrink-0 bg-transparent">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Voltar</span>
              </Link>
            </Button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold truncate" style={{ color: "#0A2540" }}>
              Investimentos Disponíveis
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg shrink-0">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="text-gray-600">Saldo:</span>
            <span className="font-semibold text-gray-900">{formatCoins(user.balance)} MOEDAS</span>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {assets.map((a) => {
            const defaultMonths = a.defaultMonths ?? 3
            const minInvest = a.minInvest ?? 100
            const sim = simulateReturn(a.id, defaultMonths, minInvest)
            const estYield = sim.ok ? sim.expectedYield : 0
            const leftBorder = a.borderColor || a.color || "#0A2540"
            const indexation = a.indexation ?? (a.risk === "Variável" ? "Variável" : "Fixado")

            return (
              <Card
                key={a.id}
                className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white"
                style={{ borderLeftWidth: 4, borderLeftColor: leftBorder }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex flex-col gap-2">
                    <span className="font-semibold text-base sm:text-lg leading-tight" style={{ color: "#0A2540" }}>
                      {a.name}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {a.safe && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <ShieldCheck className="h-3 w-3 text-green-600" />
                          <span className="hidden sm:inline">Seguro Educacional</span>
                          <span className="sm:hidden">Seguro</span>
                        </Badge>
                      )}
                      {a.risk === "Variável" && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <ShieldAlert className="h-3 w-3 text-amber-600" />
                          <span className="hidden sm:inline">Risco Variável</span>
                          <span className="sm:hidden">Variável</span>
                        </Badge>
                      )}
                      {a.hasCourse && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <GraduationCap className="h-3 w-3" />
                          <span className="hidden sm:inline">Curso vinculado</span>
                          <span className="sm:hidden">Curso</span>
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Rendimento:</span>
                        <span className="font-semibold text-green-600 text-sm">
                          {a.yieldLabel ?? `+${Math.round((a.monthlyRate ?? 0) * 100)}% ao mês`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Indexação:</span>
                        <span className="font-medium text-xs">{indexation}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{a.subtitle}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded-lg">
                    <InfoRow label="Investimento mínimo" value={`${formatCoins(minInvest)} MOEDAS`} />
                    <InfoRow label="Vencimento" value={`Em ${daysForMonths(defaultMonths)} dias`} />
                    <InfoRow label="Resgate" value={a.redemption ?? "Ao final do prazo"} />
                    <InfoRow
                      label="Rentabilidade acumulada"
                      value={`${estYield >= 0 ? "+" : ""}${formatCoins(estYield)} moedas`}
                      valueClass={estYield >= 0 ? "text-green-600" : "text-red-600"}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <BadgeInfo className="h-3.5 w-3.5" />
                      <span>Simulação educacional</span>
                    </div>
                    <Button
                      onClick={() => onOpenModal(a)}
                      className="w-full sm:w-auto px-6 py-2.5 font-medium transition-all duration-200 hover:scale-105"
                      style={{ backgroundColor: "#0A2540", color: "#FFFFFF" }}
                    >
                      <ChartLine className="h-4 w-4 mr-2" />
                      Simular
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="border-0 shadow-sm bg-gray-50">
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
      </div>

      <Dialog open={modal.open} onOpenChange={(o) => setModal((p) => ({ ...p, open: o }))}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-lg font-semibold">{modal.asset?.name}</span>
              <div className="flex flex-wrap gap-1.5">
                {modal.asset?.safe && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <ShieldCheck className="h-3 w-3 text-green-600" />
                    Seguro
                  </Badge>
                )}
                {modal.asset?.risk === "Variável" && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <ShieldAlert className="h-3 w-3 text-amber-600" />
                    Variável
                  </Badge>
                )}
              </div>
            </DialogTitle>
            <DialogDescription className="text-sm">
              Defina o valor e o prazo para ver a projeção de rendimento.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Valor a investir
              </label>
              <Input
                id="amount"
                inputMode="decimal"
                placeholder={modal.asset ? String(modal.asset.minInvest ?? 100) : "0"}
                value={modal.amountInput}
                onChange={(e) => recalcSimulation(e.target.value, undefined)}
                className="text-base"
              />
              <p className="text-xs text-gray-500">Mínimo: {formatCoins(modal.asset?.minInvest ?? 100)} MOEDAS</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prazo</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 3, 6].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => recalcSimulation(undefined, m)}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                      modal.months === m
                        ? "bg-[#0A2540] text-white border-[#0A2540] shadow-sm"
                        : "bg-white hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    {m} {m === 1 ? "mês" : "meses"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">Vencimento: {formatDate(modal.maturity)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">Projeção de rendimento</p>
              {modal.simOk ? (
                <div className="space-y-3">
                  <InvestmentChart data={modal.series} height={200} />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Você está aplicando {formatCoins(Number.parseFloat(modal.amountInput))} moedas por {modal.months}{" "}
                    {modal.months === 1 ? "mês" : "meses"} com retorno simulado de{" "}
                    {Math.round((modal.asset?.monthlyRate ?? 0) * 100)}% ao mês.
                  </p>
                </div>
              ) : (
                <div className="text-sm text-gray-500 py-8 text-center">Informe um valor válido para simular.</div>
              )}
            </div>
            <div className="space-y-3 bg-white border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Resumo do investimento</h3>
              <InfoRow label="Valor investido" value={`${formatCoins(Number.parseFloat(modal.amountInput))} moedas`} />
              <InfoRow
                label="Rentabilidade estimada"
                value={`${modal.expectedYield >= 0 ? "+" : ""}${formatCoins(modal.expectedYield)} moedas`}
                valueClass={modal.expectedYield >= 0 ? "text-green-600" : "text-red-600"}
              />
              <InfoRow label="Data de vencimento" value={formatDate(modal.maturity)} />
              <InfoRow label="Total esperado ao final" value={`${formatCoins(modal.expectedFinal)} moedas`} />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setModal((p) => ({ ...p, open: false }))}
              className="w-full sm:w-auto"
            >
              Fechar
            </Button>
            <Button
              onClick={onConfirm}
              style={{ backgroundColor: "#0A2540", color: "#FFFFFF" }}
              disabled={!modal.simOk}
              className="w-full sm:w-auto font-medium"
            >
              Confirmar investimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Tip({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-sm font-medium" style={{ color: "#0A2540" }}>
          {title}
        </div>
        <div className="text-sm text-muted-foreground">{text}</div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-sm font-medium ${valueClass ?? ""}`}>{value}</div>
    </div>
  )
}
