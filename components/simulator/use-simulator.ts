"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useEduSnapshot } from "@/hooks/use-edu"
import { eduService } from "@/lib/services"
import { MS_MONTH, type InvestmentSnapshot, type SimAsset } from "@/lib/domain"
import { formatCoins, parseAmount } from "./format"

export type SimulationState = {
  open: boolean
  asset: SimAsset | null
  amountInput: string
  months: number
  simOk: boolean
  expectedFinal: number
  expectedYield: number
  series: { t: number; v: number }[]
  maturity: number
}

export type DetailState = {
  open: boolean
  investment: InvestmentSnapshot | null
}

function simulate(asset: SimAsset | null, amountInput: string, months: number) {
  const amount = parseAmount(amountInput)
  const res = asset && amount !== null ? eduService.simulateReturn(asset, months, amount) : null
  return {
    simOk: !!res?.ok,
    expectedFinal: res?.ok ? res.expectedFinal : 0,
    expectedYield: res?.ok ? res.expectedYield : 0,
    series: res?.ok ? res.series : [],
    maturity: res?.ok ? res.maturity : Date.now() + months * MS_MONTH,
  }
}

/** Estado e ações da página de investimentos. */
export function useSimulator() {
  const router = useRouter()
  const { toast } = useToast()
  const { currentUser: user, assets } = useEduSnapshot()

  const { active, closed } = useMemo(
    () => (user ? eduService.getInvestmentSnapshots(user, assets) : { active: [], closed: [] }),
    [user, assets],
  )

  const [simulation, setSimulation] = useState<SimulationState>(() => ({
    open: false,
    asset: null,
    amountInput: "",
    months: 3,
    simOk: false,
    expectedFinal: 0,
    expectedYield: 0,
    series: [],
    maturity: Date.now(),
  }))
  const [detail, setDetail] = useState<DetailState>({ open: false, investment: null })

  useEffect(() => {
    if (!eduService.getCurrentUser()) router.replace("/login")
  }, [router])

  const openSimulation = (asset: SimAsset) => {
    const months = asset.defaultMonths ?? 3
    const amountInput = String(asset.minInvest ?? 100)
    setSimulation({ open: true, asset, amountInput, months, ...simulate(asset, amountInput, months) })
  }

  const updateSimulation = (next: { amountInput?: string; months?: number }) => {
    setSimulation((prev) => {
      const amountInput = next.amountInput ?? prev.amountInput
      const months = next.months ?? prev.months
      return { ...prev, amountInput, months, ...simulate(prev.asset, amountInput, months) }
    })
  }

  const setSimulationOpen = (open: boolean) => setSimulation((p) => ({ ...p, open }))

  const confirm = () => {
    if (!simulation.asset) return
    const amount = parseAmount(simulation.amountInput)
    if (amount === null) {
      toast({ variant: "destructive", title: "Valor inválido", description: "Informe um valor maior que zero." })
      return
    }
    const res = eduService.confirmInvestment({
      assetId: simulation.asset.id,
      assetName: simulation.asset.name,
      months: simulation.months,
      principal: amount,
    })
    if (res.ok) {
      toast({
        title: "Investimento confirmado!",
        description: `Aplicado ${formatCoins(amount)} moedas em ${simulation.asset.name}.`,
      })
      setSimulationOpen(false)
    } else {
      toast({ variant: "destructive", title: "Não foi possível investir", description: res.error || "Tente novamente." })
    }
  }

  const withdraw = (investmentId: string) => {
    const res = eduService.withdrawMatured(investmentId)
    if (res.ok) {
      toast({ title: "Resgate realizado!", description: `Você recebeu ${formatCoins(res.finalValue)} moedas.` })
      setDetail({ open: false, investment: null })
    } else {
      toast({ variant: "destructive", title: "Não foi possível resgatar", description: res.error || "Tente novamente." })
    }
  }

  return {
    user,
    assets,
    activeInvestments: active,
    closedInvestments: closed,
    simulation,
    openSimulation,
    updateSimulation,
    setSimulationOpen,
    confirm,
    detail,
    openDetail: (investment: InvestmentSnapshot) => setDetail({ open: true, investment }),
    closeDetail: () => setDetail({ open: false, investment: null }),
    withdraw,
  }
}
