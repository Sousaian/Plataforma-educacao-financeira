import { describe, expect, it } from "vitest"
import {
  addDemoCoins,
  buyItem,
  completeMission,
  computeRanking,
  equipAvatar,
  getNextPatentProgress,
  getPatent,
  isLockedByPatent,
  listStoreItems,
  needsNormalization,
  normalizeUser,
  signupUser,
} from "@/lib/domain"
import { ctxAt, idGenerator, makeUser, T0 } from "../helpers"

const item = (id: string) => listStoreItems().find((i) => i.id === id)!

describe("patentes / XP", () => {
  it.each([
    [0, "Bronze"],
    [99, "Bronze"],
    [100, "Cobre"],
    [250, "Prata"],
    [520, "Ouro"],
    [900, "Diamante"],
    [1400, "Platina"],
    [99999, "Platina"],
  ])("%i XP → %s", (xp, name) => {
    expect(getPatent(xp).name).toBe(name)
  })

  it("progresso até a próxima patente", () => {
    expect(getNextPatentProgress(520)).toMatchObject({ current: 20, target: 400, percent: 5 })
    expect(getNextPatentProgress(1500)).toMatchObject({ percent: 100, next: undefined })
  })
})

describe("missões", () => {
  it("credita recompensa, 80% em XP e registra transação", () => {
    const user = makeUser({ balance: 100, xp: 0 })
    const mission = user.missions[0] // Prova de Matemática, 50
    const res = completeMission(user, mission.id, ctxAt(T0))
    if (!res.ok) throw new Error(res.error)
    expect(res.user.balance).toBe(150)
    expect(res.user.xp).toBe(40)
    expect(res.user.missions[0].completed).toBe(true)
    expect(res.user.transactions[0]).toMatchObject({ amount: 50, description: "Missão: Prova de Matemática", at: T0 })
    expect(user.missions[0].completed).toBe(false) // função pura: não altera a entrada
  })

  it("não completa a mesma missão duas vezes", () => {
    const user = makeUser()
    const once = completeMission(user, user.missions[1].id, ctxAt(T0))
    if (!once.ok) throw new Error(once.error)
    expect(completeMission(once.user, user.missions[1].id, ctxAt(T0))).toEqual({ ok: false, error: "Já concluída" })
  })

  it("missão inexistente", () => {
    expect(completeMission(makeUser(), "x", ctxAt(T0))).toEqual({ ok: false, error: "Missão não encontrada" })
  })

  it("bônus demo: +moedas e 50% em XP", () => {
    const user = addDemoCoins(makeUser({ balance: 10, xp: 3 }), 25, ctxAt(T0))
    expect(user).toMatchObject({ balance: 35, xp: 16 })
    expect(user.transactions[0]).toMatchObject({ amount: 25, description: "Bônus demo" })
  })
})

describe("loja", () => {
  it("compra debita saldo, adiciona ao inventário e registra transação", () => {
    const res = buyItem(makeUser({ balance: 200 }), item("st-livro"), ctxAt(T0))
    if (!res.ok) throw new Error(res.error)
    expect(res.user.balance).toBe(80)
    expect(res.user.inventory).toContain("st-livro")
    expect(res.user.transactions[0]).toMatchObject({ amount: -120, description: "Compra: Conjunto de Livros" })
  })

  it("saldo insuficiente", () => {
    expect(buyItem(makeUser({ balance: 119 }), item("st-livro"), ctxAt(T0))).toEqual({ ok: false, error: "Saldo insuficiente" })
  })

  it("exige patente mínima", () => {
    const rich = makeUser({ balance: 10_000, xp: 249 })
    expect(isLockedByPatent(item("st-notebook"), 249)).toBe(true)
    expect(buyItem(rich, item("st-notebook"), ctxAt(T0))).toEqual({ ok: false, error: "Requer patente Prata" })
    expect(buyItem({ ...rich, xp: 250 }, item("st-notebook"), ctxAt(T0)).ok).toBe(true)
  })

  it("não compra item repetido", () => {
    const res = buyItem(makeUser(), item("st-danca"), ctxAt(T0))
    if (!res.ok) throw new Error(res.error)
    expect(buyItem(res.user, item("st-danca"), ctxAt(T0))).toEqual({ ok: false, error: "Já adquirido" })
  })

  it("verifica 'já adquirido' antes de patente e saldo", () => {
    const user = makeUser({ balance: 0, xp: 0, inventory: ["st-pele-ouro"] })
    expect(buyItem(user, item("st-pele-ouro"), ctxAt(T0))).toEqual({ ok: false, error: "Já adquirido" })
  })
})

describe("avatar", () => {
  it("equipa avatar gratuito", () => {
    expect(equipAvatar(makeUser(), "av3")).toMatchObject({ avatarId: "av3", avatarUrl: "/images/avatars/avatar-3.png" })
  })

  it("não equipa avatar pago fora do inventário nem inexistente", () => {
    expect(equipAvatar(makeUser(), "av7")).toBeNull()
    expect(equipAvatar(makeUser(), "zzz")).toBeNull()
    expect(equipAvatar(makeUser({ inventory: ["av7"] }), "av7")).toMatchObject({ avatarId: "av7" })
  })
})

describe("cadastro", () => {
  const input = {
    name: "Nova",
    email: "nova@escola.com",
    classroom: "1ºB",
    school: "X",
    password: "abcd",
    avatarId: "av2",
  }

  it("cria usuário com 100 moedas, 0 XP, 5 missões e avatar escolhido", () => {
    const res = signupUser([], input, idGenerator())
    if (!res.ok) throw new Error(res.error)
    expect(res.user).toMatchObject({ balance: 100, xp: 0, avatarId: "av2", avatarUrl: "/images/avatars/avatar-2.png" })
    expect(res.user.inventory).toEqual(["av2"])
    expect(res.user.missions).toHaveLength(5)
  })

  it("rejeita e-mail duplicado", () => {
    expect(signupUser([makeUser({ email: "nova@escola.com" })], input, idGenerator())).toEqual({
      ok: false,
      error: "E-mail já cadastrado",
    })
  })

  it("avatar desconhecido usa a imagem do primeiro avatar padrão", () => {
    const res = signupUser([], { ...input, avatarId: "av99" }, idGenerator())
    expect(res.ok && res.user.avatarUrl).toBe("/images/avatars/avatar-1.png")
  })

  it("normaliza usuários antigos sem listas", () => {
    const legacy = { id: "x", name: "Antigo", balance: 1, xp: 0 }
    expect(needsNormalization(legacy)).toBe(true)
    const user = normalizeUser(legacy, idGenerator())
    expect(user).toMatchObject({ investments: [], achievements: [], transactions: [], holdings: [], inventory: [] })
    expect(user.missions).toHaveLength(5)
    expect(needsNormalization(user)).toBe(false)
  })
})

describe("ranking", () => {
  const newId = idGenerator()
  const mk = (name: string, balance: number, xp: number, classroom = "2ºA", school = "Escola Teste") =>
    makeUser({ name, balance, xp, classroom, school }, newId)

  it("filtra mesma escola e turma, soma bônus de patente e ordena", () => {
    const me = mk("Eu", 100, 0)
    const users = [
      me,
      mk("Ouro", 95, 520), // 95 + 6 = 101
      mk("Empate XP alto", 100, 99), // Bronze → 100, desempata por XP
      mk("Outra turma", 999, 0, "3ºB"),
      mk("Outra escola", 999, 0, "2ºA", "Outra"),
    ]
    const ranking = computeRanking(users, me)
    expect(ranking.map((r) => r.name)).toEqual(["Ouro", "Empate XP alto", "Eu"])
    expect(ranking[0].balance).toBe(101)
    expect(Object.keys(ranking[0]).sort()).toEqual(["avatarUrl", "balance", "classroom", "id", "name", "xp"])
  })

  it("limita ao top 10", () => {
    const me = mk("Eu", 0, 0)
    const users = [me, ...Array.from({ length: 15 }, (_, i) => mk(`A${i}`, i + 1, 0))]
    const ranking = computeRanking(users, me)
    expect(ranking).toHaveLength(10)
    expect(ranking[0].name).toBe("A14")
  })
})
