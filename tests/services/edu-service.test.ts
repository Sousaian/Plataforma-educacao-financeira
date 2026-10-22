import { beforeEach, describe, expect, it, vi } from "vitest"
import { MS_MONTH } from "@/lib/domain"
import { createStorageRepository, STORAGE_KEYS } from "@/lib/data/repository"
import { createMemoryStorage } from "@/lib/data/storage"
import { createEduService, type EduService } from "@/lib/services/edu-service"
import { idGenerator, T0 } from "../helpers"

let storage: ReturnType<typeof createMemoryStorage>
let clock: number
let service: EduService

function setup(initial: Record<string, string> = {}) {
  storage = createMemoryStorage(initial)
  clock = T0
  service = createEduService({ repository: createStorageRepository(storage), now: () => clock, newId: idGenerator() })
}

const stored = <T>(key: string): T => JSON.parse(storage.getItem(key)!) as T

beforeEach(() => setup())

describe("seed e persistência", () => {
  it("grava o seed demo nas chaves edu:* na primeira leitura", () => {
    expect(service.getCurrentUser()).toBeNull()
    expect(Object.keys(storage.dump()).sort()).toEqual(["edu:assets", "edu:tick", "edu:users"])
    const users = stored<Array<{ email: string; balance: number; xp: number }>>(STORAGE_KEYS.users)
    expect(users.map((u) => [u.email, u.balance, u.xp])).toEqual([
      ["ana@escola.com", 620, 520],
      ["bruno@escola.com", 890, 980],
      ["carla@escola.com", 300, 260],
      ["diego@escola.com", 1200, 1400],
    ])
    expect(stored<Array<{ id: string }>>(STORAGE_KEYS.assets).map((a) => a.id)).toEqual(["SABER", "BOLSA", "CRIPTO", "EMP"])
    expect(stored<number>(STORAGE_KEYS.tick)).toBe(T0)
  })

  it("não sobrescreve dados existentes e migra campos ausentes", () => {
    const legacy = [{ id: "old", name: "Antigo", email: "a@a", password: "1", balance: 5, xp: 0 }]
    setup({ "edu:users": JSON.stringify(legacy), "edu:current": JSON.stringify("old") })
    const user = service.getCurrentUser()!
    expect(user).toMatchObject({ id: "old", balance: 5, investments: [], inventory: [] })
    expect(user.missions).toHaveLength(5)
    // migração persistida → ids de missões estáveis entre leituras
    expect(service.getCurrentUser()!.missions[0].id).toBe(user.missions[0].id)
  })
})

describe("login / signup / logout", () => {
  it("login com credenciais do seed", () => {
    expect(service.login("ana@escola.com", "errada")).toBe(false)
    expect(service.login("ana@escola.com", "1234")).toBe(true)
    expect(service.getCurrentUser()?.name).toBe("Ana Silva")
  })

  it("signup loga o novo usuário e rejeita e-mail duplicado", () => {
    const input = { name: "Nova", email: "nova@escola.com", classroom: "2ºA", school: "X", password: "abcd", avatarId: "av4" }
    expect(service.signup(input)).toBe(true)
    expect(service.getCurrentUser()).toMatchObject({ email: "nova@escola.com", balance: 100 })
    expect(service.signup(input)).toBe(false)
    expect(service.signup({ ...input, email: "ana@escola.com" })).toBe(false)
    expect(stored<unknown[]>(STORAGE_KEYS.users)).toHaveLength(5)
  })

  it("logout grava string vazia em edu:current", () => {
    service.login("ana@escola.com", "1234")
    service.logout()
    expect(storage.getItem(STORAGE_KEYS.current)).toBe('""')
    expect(service.getCurrentUser()).toBeNull()
  })

  it("ações sem usuário logado retornam 'Não autenticado'", () => {
    expect(service.completeMission("x")).toEqual({ ok: false, error: "Não autenticado" })
    expect(service.buyItem("st-livro")).toEqual({ ok: false, error: "Não autenticado" })
  })
})

describe("snapshot / assinatura", () => {
  it("retorna a mesma referência até haver mudança e notifica assinantes", () => {
    service.login("ana@escola.com", "1234")
    const listener = vi.fn()
    const unsubscribe = service.subscribe(listener)
    const a = service.getSnapshot()
    expect(service.getSnapshot()).toBe(a)

    service.addCoinsDemo(25)
    expect(listener).toHaveBeenCalledTimes(1)
    const b = service.getSnapshot()
    expect(b).not.toBe(a)
    expect(b.currentUser?.balance).toBe(645)
    expect(service.getSnapshot()).toBe(b)

    unsubscribe()
    service.addCoinsDemo(1)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("falhas de regra não notificam nem alteram o snapshot", () => {
    service.login("carla@escola.com", "1234")
    const snap = service.getSnapshot()
    const listener = vi.fn()
    service.subscribe(listener)
    expect(service.buyItem("st-pele-ouro")).toEqual({ ok: false, error: "Requer patente Ouro" })
    expect(listener).not.toHaveBeenCalled()
    expect(service.getSnapshot()).toBe(snap)
  })
})

describe("fluxo completo: login → missão → loja → investir → resgatar", () => {
  it("atualiza saldo, XP, inventário, carteira e histórico", () => {
    expect(service.login("ana@escola.com", "1234")).toBe(true)
    const ana = () => service.getCurrentUser()!
    expect(ana()).toMatchObject({ balance: 620, xp: 520 })

    // Missão: Prova de Matemática (+50 moedas, +40 XP)
    const mission = ana().missions.find((m) => m.title === "Prova de Matemática")!
    expect(service.completeMission(mission.id)).toEqual({ ok: true })
    expect(service.completeMission(mission.id)).toEqual({ ok: false, error: "Já concluída" })
    expect(ana()).toMatchObject({ balance: 670, xp: 560 })

    // Loja: Capacete de Bombeiro (90, patente Ouro)
    expect(service.buyItem("st-pele-ouro")).toEqual({ ok: true })
    expect(service.buyItem("st-pele-ouro")).toEqual({ ok: false, error: "Já adquirido" })
    expect(ana().balance).toBe(580)
    expect(ana().inventory).toContain("st-pele-ouro")

    // Investir 200 no Fundo Saber+ por 3 meses
    const inv = service.confirmInvestment({ assetId: "SABER", assetName: "Fundo Saber+", months: 3, principal: 200 })
    expect(inv).toEqual({ ok: true, achievements: ["first_investment", "proj_gain_10"] })
    expect(ana().balance).toBe(380)
    const investmentId = ana().investments[0].id

    // Antes do vencimento
    clock = T0 + 3 * MS_MONTH - 1
    expect(service.withdrawMatured(investmentId)).toEqual({ ok: false, error: "Ainda não chegou o vencimento" })
    expect(service.getInvestmentSnapshots(ana(), service.listSimAssets()).active[0].canWithdraw).toBe(false)

    // No vencimento
    clock = T0 + 3 * MS_MONTH
    const snaps = service.getInvestmentSnapshots(ana(), service.listSimAssets())
    expect(snaps.active[0]).toMatchObject({ canWithdraw: true, statusLabel: "Em vencimento" })
    const res = service.withdrawMatured(investmentId)
    if (!res.ok) throw new Error(res.error)
    expect(res.finalValue).toBeCloseTo(226.4687093088, 8)
    expect(snaps.active[0].currentValue).toBe(res.finalValue)
    expect(res.achievements).toEqual(["yield_10_plus"])

    const final = ana()
    expect(final.balance).toBeCloseTo(380 + 226.4687093088, 8)
    expect(final.xp).toBe(569) // 560 + max(5, round(2.65) + Ouro(3) * 2)
    expect(final.achievements).toEqual(["first_investment", "proj_gain_10", "yield_10_plus"])
    expect(final.transactions.map((t) => t.description)).toEqual([
      "Resgate: Fundo Saber+",
      "Investimento em Fundo Saber+",
      "Compra: Capacete de Bombeiro",
      "Missão: Prova de Matemática",
    ])
    const after = service.getInvestmentSnapshots(final, service.listSimAssets())
    expect(after.active).toHaveLength(0)
    expect(after.closed).toHaveLength(1)

    // Persistido no storage com as mesmas chaves
    const persisted = stored<Array<{ email: string; balance: number }>>(STORAGE_KEYS.users).find(
      (u) => u.email === "ana@escola.com",
    )!
    expect(persisted.balance).toBeCloseTo(final.balance, 8)

    // Ranking da turma 2ºA da escola demo: só a Ana
    expect(service.getRanking().map((r) => r.name)).toEqual(["Ana Silva"])
  })
})
