import { getPatent } from "./patents"
import { addTransaction } from "./users"
import type { DomainContext, Investment, Result, Risk, SeriesPoint, SimAsset, User } from "./types"

export const MS_DAY = 24 * 60 * 60 * 1000
export const MS_MONTH = 30 * MS_DAY

export type SimulationResult = {
  ok: boolean
  series: SeriesPoint[]
  expectedFinal: number
  expectedYield: number
  monthlyRate: number
  maturity: number
  message?: string
}

export type InvestmentSnapshot = {
  id: string
  assetName: string
  risk: Risk
  months: number
  startAt: number
  maturityAt: number
  principal: number
  monthlyRate: number
  currentValue: number
  currentYield: number
  statusLabel: "Em andamento" | "Em vencimento" | "Finalizado"
  canWithdraw: boolean
  series: SeriesPoint[]
}

const VOLATILITY_AMPLITUDE: Record<Risk, number> = { Baixo: 0.01, Médio: 0.03, Alto: 0.08, Variável: 0.05 }

/** Ruído determinístico por ativo/mês, em [-amp/2, +amp/2). */
export function monthVolatility(assetId: string, monthIndex: number, risk: Risk): number {
  const charSum = Array.from(`${assetId}:${monthIndex}`).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const baseNoise = (charSum % 100) / 100 - 0.5
  return baseNoise * VOLATILITY_AMPLITUDE[risk]
}

/** Ajuste senoidal (±2%) aplicado a ativos de risco "Variável". */
export function variableAdjustment(monthIndex: number): number {
  return Math.sin(monthIndex / 1.5) * 0.02
}

export function maturityOf(inv: Pick<Investment, "startAt" | "months">): number {
  return inv.startAt + inv.months * MS_MONTH
}

/** Projeção com juros compostos mês a mês, a partir de `start`. */
export function simulateReturn(
  asset: SimAsset | undefined,
  months: number,
  principal: number,
  start: number,
): SimulationResult {
  const fail = (message: string, monthlyRate = 0): SimulationResult => ({
    ok: false,
    series: [],
    expectedFinal: 0,
    expectedYield: 0,
    monthlyRate,
    maturity: start,
    message,
  })
  if (!asset) return fail("Ativo inexistente")
  if (!months || months <= 0) return fail("Prazo inválido", asset.monthlyRate)
  if (principal <= 0) return fail("Valor inválido", asset.monthlyRate)

  let value = principal
  const series: SeriesPoint[] = [{ t: start, v: value }]
  for (let m = 1; m <= months; m++) {
    let rate = asset.monthlyRate + monthVolatility(asset.id, m, asset.risk)
    if (asset.risk === "Variável") rate += variableAdjustment(m)
    value = value * (1 + rate)
    series.push({ t: start + m * MS_MONTH, v: value })
  }

  return {
    ok: true,
    series,
    expectedFinal: value,
    expectedYield: value - principal,
    monthlyRate: asset.monthlyRate,
    maturity: start + months * MS_MONTH,
  }
}

function grantAchievement(user: User, id: string, granted: string[]): User {
  if (user.achievements.includes(id)) return user
  granted.push(id)
  return { ...user, achievements: [...user.achievements, id] }
}

export type InvestInput = { assetId: string; assetName: string; months: number; principal: number }

export function confirmInvestment(
  user: User,
  assets: SimAsset[],
  input: InvestInput,
  ctx: DomainContext,
): Result<{ user: User; achievements: string[] }> {
  const { assetId, assetName, months, principal } = input
  if (principal <= 0) return { ok: false, error: "Valor inválido" }
  if (user.balance < principal) return { ok: false, error: "Saldo insuficiente" }
  const asset = assets.find((a) => a.id === assetId)
  if (!asset) return { ok: false, error: "Ativo não encontrado" }

  const inv: Investment = {
    id: ctx.newId(),
    assetId,
    assetName,
    risk: asset.risk,
    monthlyRate: asset.monthlyRate,
    startAt: ctx.now,
    months,
    principal,
    status: "active",
  }
  let updated: User = { ...user, balance: user.balance - principal, investments: [inv, ...user.investments] }
  updated = addTransaction(updated, -principal, `Investimento em ${asset.name}`, ctx)

  const achievements: string[] = []
  updated = grantAchievement(updated, "first_investment", achievements)
  const sim = simulateReturn(asset, months, principal, ctx.now)
  const projGainPct = sim.ok ? sim.expectedYield / principal : 0
  if (projGainPct >= 0.1) updated = grantAchievement(updated, "proj_gain_10", achievements)

  return { ok: true, user: updated, achievements }
}

/** XP de bônus ao resgatar: 10% do rendimento + 2 por nível de patente, mínimo 5. */
export function withdrawXp(finalYield: number, xp: number): number {
  return Math.max(5, Math.round(finalYield * 0.1) + getPatent(xp).index * 2)
}

export function withdrawMatured(
  user: User,
  assets: SimAsset[],
  investmentId: string,
  ctx: DomainContext,
): Result<{ user: User; finalValue: number; achievements: string[] }> {
  const inv = user.investments.find((i) => i.id === investmentId)
  if (!inv) return { ok: false, error: "Investimento não encontrado" }
  if (ctx.now < maturityOf(inv)) return { ok: false, error: "Ainda não chegou o vencimento" }
  if (inv.status === "closed") return { ok: false, error: "Já encerrado" }

  const asset = assets.find((a) => a.id === inv.assetId)
  const sim = simulateReturn(asset, inv.months, inv.principal, ctx.now)
  const finalValue = sim.ok ? sim.expectedFinal : inv.principal
  const finalYield = finalValue - inv.principal
  const closed: Investment = { ...inv, status: "closed", finalValue, finalYield }

  let updated: User = {
    ...user,
    balance: user.balance + finalValue,
    xp: user.xp + withdrawXp(finalYield, user.xp),
    investments: user.investments.map((i) => (i.id === inv.id ? closed : i)),
  }
  updated = addTransaction(updated, finalValue, `Resgate: ${inv.assetName}`, ctx)

  const achievements: string[] = []
  if (finalYield / inv.principal >= 0.1) updated = grantAchievement(updated, "yield_10_plus", achievements)

  return { ok: true, user: updated, finalValue, achievements }
}

/**
 * Visão dos investimentos para a carteira/histórico.
 *
 * Comportamento legado preservado: a curva é projetada a partir de `now` (e não de `startAt`),
 * então `currentValue` sempre equivale ao principal e `currentYield` a 0. O valor real do
 * resgate é calculado em `withdrawMatured`. Corrigir isso muda o que é exibido hoje.
 */
export function getInvestmentSnapshots(
  user: User,
  assets: SimAsset[],
  now: number,
): { active: InvestmentSnapshot[]; closed: InvestmentSnapshot[] } {
  const active: InvestmentSnapshot[] = []
  const closed: InvestmentSnapshot[] = []
  for (const inv of user.investments) {
    const maturityAt = maturityOf(inv)
    const asset = assets.find((a) => a.id === inv.assetId)
    const projection = simulateReturn(asset, inv.months, inv.principal, now)
    const cutoff = Math.min(now, maturityAt)
    const elapsed = projection.ok ? projection.series.filter((p) => p.t <= cutoff) : []
    const currentValue = elapsed.length > 0 ? elapsed[elapsed.length - 1].v : inv.principal
    const base = {
      id: inv.id,
      assetName: inv.assetName,
      risk: inv.risk,
      months: inv.months,
      startAt: inv.startAt,
      maturityAt,
      principal: inv.principal,
      monthlyRate: inv.monthlyRate,
      currentValue,
      currentYield: currentValue - inv.principal,
    }

    if (inv.status === "closed") {
      closed.push({ ...base, statusLabel: "Finalizado", canWithdraw: false, series: projection.ok ? projection.series : [] })
    } else {
      const daysToMaturity = Math.ceil((maturityAt - now) / MS_DAY)
      active.push({
        ...base,
        statusLabel: daysToMaturity <= 7 ? "Em vencimento" : "Em andamento",
        canWithdraw: now >= maturityAt,
        series: elapsed,
      })
    }
  }
  return { active, closed }
}
