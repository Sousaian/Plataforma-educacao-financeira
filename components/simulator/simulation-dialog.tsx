"use client"

import { ShieldAlert, ShieldCheck } from "lucide-react"
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
import { InvestmentChart } from "@/components/investment-chart"
import { formatDate } from "@/lib/format-date"
import { InfoRow } from "./info-row"
import { formatCoins, formatSignedCoins, monthsLabel, yieldClass } from "./format"
import type { SimulationState } from "./use-simulator"

const TERM_OPTIONS = [1, 3, 6]

type Props = {
  state: SimulationState
  onOpenChange: (open: boolean) => void
  onChange: (next: { amountInput?: string; months?: number }) => void
  onConfirm: () => void
}

export function SimulationDialog({ state, onOpenChange, onChange, onConfirm }: Props) {
  const { asset, amountInput, months } = state
  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base sm:text-lg">
            <span className="font-semibold">{asset?.name}</span>
            <div className="flex flex-wrap gap-1">
              {asset?.safe && (
                <Badge variant="secondary" className="gap-1 text-xs h-5">
                  <ShieldCheck className="h-3 w-3 text-green-600" />
                  Seguro
                </Badge>
              )}
              {asset?.risk === "Variável" && (
                <Badge variant="outline" className="gap-1 text-xs h-5">
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
              placeholder={asset ? String(asset.minInvest ?? 100) : "0"}
              value={amountInput}
              onChange={(e) => onChange({ amountInput: e.target.value })}
              className="text-base"
            />
            <p className="text-xs text-gray-500">Mínimo: {formatCoins(asset?.minInvest ?? 100)} MOEDAS</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Prazo</label>
            <div className="grid grid-cols-3 gap-2">
              {TERM_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChange({ months: m })}
                  className={`px-2 sm:px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all duration-200 ${
                    months === m
                      ? "bg-[#0A2540] text-white border-[#0A2540] shadow-sm"
                      : "bg-white hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  {m} {monthsLabel(m)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">Vencimento: {formatDate(state.maturity)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="xl:col-span-2 border rounded-lg p-3 sm:p-4 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-3">Projeção de rendimento</p>
            {state.simOk ? (
              <div className="space-y-3">
                <InvestmentChart data={state.series} height={180} />
                <p className="text-xs text-gray-600 leading-relaxed">
                  Você está aplicando {formatCoins(Number.parseFloat(amountInput))} moedas por {months}{" "}
                  {monthsLabel(months)} com retorno simulado de {Math.round((asset?.monthlyRate ?? 0) * 100)}% ao mês.
                </p>
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-8 text-center">Informe um valor válido para simular.</div>
            )}
          </div>
          <div className="space-y-3 bg-white border rounded-lg p-3 sm:p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Resumo do investimento</h3>
            <InfoRow label="Valor investido" value={`${formatCoins(Number.parseFloat(amountInput))} moedas`} />
            <InfoRow
              label="Rentabilidade estimada"
              value={`${formatSignedCoins(state.expectedYield)} moedas`}
              valueClass={yieldClass(state.expectedYield)}
            />
            <InfoRow label="Data de vencimento" value={formatDate(state.maturity)} />
            <InfoRow label="Total esperado ao final" value={`${formatCoins(state.expectedFinal)} moedas`} />
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Fechar
          </Button>
          <Button
            onClick={onConfirm}
            style={{ backgroundColor: "#0A2540", color: "#FFFFFF" }}
            disabled={!state.simOk}
            className="w-full sm:w-auto font-medium"
          >
            Confirmar investimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
