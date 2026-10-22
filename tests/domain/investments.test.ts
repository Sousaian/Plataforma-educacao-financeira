import { describe, expect, it } from "vitest"
import {
  confirmInvestment,
  getInvestmentSnapshots,
  MS_DAY,
  MS_MONTH,
  simulateReturn,
  withdrawMatured,
  withdrawXp,
  type User,
} from "@/lib/domain"
import { asset, assets, ctxAt, idGenerator, makeUser, T0 } from "../helpers"

// Valores calculados com a implementação original de lib/mock-db.ts (main @ a5213a5)
const GOLDEN: Array<[assetId: string, months: number, principal: number, expectedFinal: number]> = [
  ["SABER", 1, 100, 104.22],
  ["SABER", 3, 200, 226.46870930880002],
  ["SABER", 6, 1000, 1283.309375403683],
  ["BOLSA", 1, 100, 106.78],
  ["BOLSA", 3, 200, 243.7057110224],
  ["BOLSA", 6, 1000, 1488.5683897353279],
  ["CRIPTO", 1, 100, 113.75999999999999],
  ["CRIPTO", 3, 200, 295.0627885056],
  ["CRIPTO", 6, 1000, 2190.3462356461105],
  ["EMP", 1, 100, 105.38673960613947],
  ["EMP", 3, 200, 237.29999096064455],
  ["EMP", 6, 1000, 1335.379663171112],
]

describe("simulateReturn", () => {
  it.each(GOLDEN)("%s por %i meses com %i moedas → %f", (id, months, principal, expectedFinal) => {
    const res = simulateReturn(asset(id), months, principal, T0)
    expect(res.ok).toBe(true)
    expect(res.expectedFinal).toBeCloseTo(expectedFinal, 10)
    expect(res.expectedYield).toBeCloseTo(expectedFinal - principal, 10)
    expect(res.monthlyRate).toBe(asset(id).monthlyRate)
  })

  it("gera uma série mensal a partir de start e calcula o vencimento", () => {
    const res = simulateReturn(asset("SABER"), 3, 200, T0)
    expect(res.series.map((p) => p.t)).toEqual([T0, T0 + MS_MONTH, T0 + 2 * MS_MONTH, T0 + 3 * MS_MONTH])
    expect(res.series[0].v).toBe(200)
    expect(res.series.at(-1)!.v).toBe(res.expectedFinal)
    expect(res.maturity).toBe(T0 + 90 * MS_DAY)
  })

  it("é determinística (independe do instante inicial)", () => {
    const a = simulateReturn(asset("EMP"), 6, 500, T0)
    const b = simulateReturn(asset("EMP"), 6, 500, T0 + 12345678)
    expect(a.expectedFinal).toBe(b.expectedFinal)
  })

  it("rejeita ativo inexistente, prazo e valor inválidos", () => {
    expect(simulateReturn(undefined, 3, 100, T0)).toMatchObject({ ok: false, message: "Ativo inexistente" })
    expect(simulateReturn(asset("SABER"), 0, 100, T0)).toMatchObject({ ok: false, message: "Prazo inválido" })
    expect(simulateReturn(asset("SABER"), Number.NaN, 100, T0)).toMatchObject({ ok: false, message: "Prazo inválido" })
    expect(simulateReturn(asset("SABER"), 3, 0, T0)).toMatchObject({ ok: false, message: "Valor inválido" })
    expect(simulateReturn(asset("SABER"), 3, -5, T0)).toMatchObject({ ok: false, monthlyRate: 0.04, series: [] })
  })
})

const investmentIds = idGenerator("inv")

function invest(user: User, assetId: string, months: number, principal: number, now = T0) {
  const input = { assetId, assetName: asset(assetId).name, months, principal }
  const res = confirmInvestment(user, assets, input, ctxAt(now, investmentIds))
  if (!res.ok) throw new Error(res.error)
  return res
}

describe("confirmInvestment", () => {
  it("debita o saldo, cria investimento ativo e registra transação", () => {
    const { user } = invest(makeUser({ balance: 500 }), "SABER", 3, 200)
    expect(user.balance).toBe(300)
    expect(user.investments).toHaveLength(1)
    expect(user.investments[0]).toMatchObject({
      assetId: "SABER",
      status: "active",
      startAt: T0,
      months: 3,
      principal: 200,
      risk: "Baixo",
      monthlyRate: 0.04,
    })
    expect(user.transactions[0]).toMatchObject({ amount: -200, description: "Investimento em Fundo Saber+", at: T0 })
  })

  it("concede first_investment e proj_gain_10 apenas uma vez", () => {
    const first = invest(makeUser(), "SABER", 3, 200)
    expect(first.achievements).toEqual(["first_investment", "proj_gain_10"])
    const second = invest(first.user, "SABER", 3, 200)
    expect(second.achievements).toEqual([])
    expect(second.user.achievements).toEqual(["first_investment", "proj_gain_10"])
  })

  it("não concede proj_gain_10 quando a projeção fica abaixo de 10%", () => {
    expect(invest(makeUser(), "SABER", 1, 100).achievements).toEqual(["first_investment"])
  })

  it("valida valor, saldo e ativo", () => {
    const user = makeUser({ balance: 100 })
    const input = { assetId: "SABER", assetName: "x", months: 3 }
    expect(confirmInvestment(user, assets, { ...input, principal: 0 }, ctxAt(T0))).toEqual({ ok: false, error: "Valor inválido" })
    expect(confirmInvestment(user, assets, { ...input, principal: 101 }, ctxAt(T0))).toEqual({ ok: false, error: "Saldo insuficiente" })
    expect(confirmInvestment(user, assets, { ...input, assetId: "X", principal: 50 }, ctxAt(T0))).toEqual({
      ok: false,
      error: "Ativo não encontrado",
    })
  })
})

describe("withdrawMatured (resgate/maturidade)", () => {
  const maturity = T0 + 3 * MS_MONTH

  it("bloqueia resgate antes do vencimento", () => {
    const { user } = invest(makeUser(), "SABER", 3, 200)
    const res = withdrawMatured(user, assets, user.investments[0].id, ctxAt(maturity - 1))
    expect(res).toEqual({ ok: false, error: "Ainda não chegou o vencimento" })
  })

  it("no vencimento credita o valor final, fecha o investimento e dá XP", () => {
    const { user } = invest(makeUser({ balance: 500 }), "SABER", 3, 200)
    const res = withdrawMatured(user, assets, user.investments[0].id, ctxAt(maturity))
    if (!res.ok) throw new Error(res.error)
    expect(res.finalValue).toBeCloseTo(226.46870930880002, 10)
    expect(res.user.balance).toBeCloseTo(300 + 226.46870930880002, 10)
    expect(res.user.investments[0]).toMatchObject({ status: "closed" })
    expect(res.user.investments[0].finalYield).toBeCloseTo(26.46870930880002, 10)
    expect(res.user.xp).toBe(5) // max(5, round(2.6) + 0)
    expect(res.user.transactions[0]).toMatchObject({ description: "Resgate: Fundo Saber+", at: maturity })
    expect(res.achievements).toEqual(["yield_10_plus"])
  })

  it("não permite resgatar duas vezes", () => {
    const { user } = invest(makeUser(), "SABER", 3, 200)
    const once = withdrawMatured(user, assets, user.investments[0].id, ctxAt(maturity))
    if (!once.ok) throw new Error(once.error)
    expect(withdrawMatured(once.user, assets, user.investments[0].id, ctxAt(maturity))).toEqual({
      ok: false,
      error: "Já encerrado",
    })
  })

  it("investimento inexistente", () => {
    expect(withdrawMatured(makeUser(), assets, "nope", ctxAt(T0))).toEqual({ ok: false, error: "Investimento não encontrado" })
  })

  it("XP do resgate considera a patente atual", () => {
    expect(withdrawXp(95.06, 0)).toBe(10)
    expect(withdrawXp(95.06, 520)).toBe(16) // Ouro (índice 3) → +6
    expect(withdrawXp(1, 0)).toBe(5)
  })
})

describe("getInvestmentSnapshots", () => {
  it("rotula andamento/vencimento e libera resgate só no vencimento", () => {
    const { user } = invest(makeUser(), "SABER", 3, 200)
    const at = (days: number) => getInvestmentSnapshots(user, assets, T0 + days * MS_DAY).active[0]
    expect(at(1)).toMatchObject({ statusLabel: "Em andamento", canWithdraw: false, maturityAt: T0 + 90 * MS_DAY })
    expect(at(84)).toMatchObject({ statusLabel: "Em vencimento", canWithdraw: false })
    expect(at(90)).toMatchObject({ statusLabel: "Em vencimento", canWithdraw: true })
  })

  it("em andamento: valor atual = último ponto decorrido da série (2 de 3 meses)", () => {
    const { user } = invest(makeUser(), "CRIPTO", 3, 200)
    const series = simulateReturn(asset("CRIPTO"), 3, 200, T0).series
    const snap = getInvestmentSnapshots(user, assets, T0 + 2 * MS_MONTH + 5 * MS_DAY).active[0]
    expect(snap.series).toEqual(series.slice(0, 3))
    expect(snap.currentValue).toBe(series[2].v)
    expect(snap.currentYield).toBeCloseTo(series[2].v - 200, 10)
    expect(snap.currentYield).not.toBe(0)
  })

  it("antes de completar o 1º mês o valor atual é o principal", () => {
    const { user } = invest(makeUser(), "CRIPTO", 3, 200)
    const snap = getInvestmentSnapshots(user, assets, T0 + 10 * MS_DAY).active[0]
    expect(snap.currentValue).toBe(200)
    expect(snap.currentYield).toBe(0)
  })

  it("projeta a partir de startAt mesmo para investimentos feitos depois de T0", () => {
    const start = T0 + 7 * MS_DAY
    const { user } = invest(makeUser(), "BOLSA", 3, 100, start)
    const snap = getInvestmentSnapshots(user, assets, start + MS_MONTH).active[0]
    expect(snap.series.map((p) => p.t)).toEqual([start, start + MS_MONTH])
    expect(snap.currentValue).toBe(simulateReturn(asset("BOLSA"), 3, 100, start).series[1].v)
  })

  it("no vencimento o valor exibido bate com o valor creditado no resgate", () => {
    const { user } = invest(makeUser(), "EMP", 3, 200)
    const maturity = T0 + 3 * MS_MONTH
    const snap = getInvestmentSnapshots(user, assets, maturity).active[0]
    const res = withdrawMatured(user, assets, user.investments[0].id, ctxAt(maturity))
    if (!res.ok) throw new Error(res.error)
    expect(snap.canWithdraw).toBe(true)
    expect(snap.currentValue).toBe(res.finalValue)
    // após o vencimento o valor exibido fica no valor final
    expect(getInvestmentSnapshots(user, assets, maturity + 40 * MS_DAY).active[0].currentValue).toBe(res.finalValue)
  })

  it("resgate tardio credita o mesmo valor (volatilidade independe do instante inicial)", () => {
    const { user } = invest(makeUser(), "EMP", 3, 200)
    const onTime = withdrawMatured(user, assets, user.investments[0].id, ctxAt(T0 + 3 * MS_MONTH))
    const late = withdrawMatured(user, assets, user.investments[0].id, ctxAt(T0 + 9 * MS_MONTH))
    if (!onTime.ok || !late.ok) throw new Error("resgate falhou")
    expect(late.finalValue).toBe(onTime.finalValue)
    expect(onTime.finalValue).toBe(simulateReturn(asset("EMP"), 3, 200, T0 + 12345).expectedFinal)
  })

  it("encerrado: usa finalValue/finalYield gravados no resgate", () => {
    const { user } = invest(makeUser(), "SABER", 3, 200)
    const res = withdrawMatured(user, assets, user.investments[0].id, ctxAt(T0 + 3 * MS_MONTH))
    if (!res.ok) throw new Error(res.error)
    const snap = getInvestmentSnapshots(res.user, assets, T0 + 4 * MS_MONTH).closed[0]
    expect(snap.currentValue).toBeCloseTo(226.46870930880002, 10)
    expect(snap.currentYield).toBeCloseTo(26.46870930880002, 10)

    // valores gravados prevalecem sobre a projeção
    const stored: User = {
      ...res.user,
      investments: res.user.investments.map((i) => ({ ...i, finalValue: 250, finalYield: 50 })),
    }
    const closed = getInvestmentSnapshots(stored, assets, T0 + 4 * MS_MONTH).closed[0]
    expect(closed).toMatchObject({ currentValue: 250, currentYield: 50, statusLabel: "Finalizado" })
    expect(closed.series).toHaveLength(4)
  })

  it("separa ativos e encerrados", () => {
    const first = invest(makeUser(), "SABER", 1, 100)
    const second = invest(first.user, "BOLSA", 3, 100)
    const res = withdrawMatured(second.user, assets, first.user.investments[0].id, ctxAt(T0 + MS_MONTH))
    if (!res.ok) throw new Error(res.error)
    const { active, closed } = getInvestmentSnapshots(res.user, assets, T0 + MS_MONTH)
    expect(active.map((s) => s.assetName)).toEqual(["Bolsa da Educação"])
    expect(closed.map((s) => [s.assetName, s.statusLabel, s.canWithdraw])).toEqual([["Fundo Saber+", "Finalizado", false]])
  })
})
