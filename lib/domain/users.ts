import { defaultMissions, listDefaultAvatars } from "./catalog"
import type { DomainContext, Result, Transaction, User } from "./types"

export type NewUserInput = {
  name: string
  email: string
  classroom: string
  school: string
  password: string
  avatarId: string
  avatarUrl: string
  balance: number
  xp: number
}

export type SignupInput = {
  name: string
  email: string
  classroom: string
  school: string
  password: string
  avatarId: string
}

export const SIGNUP_INITIAL_BALANCE = 100

export function createUser(input: NewUserInput, newId: () => string): User {
  return {
    id: newId(),
    ...input,
    inventory: [input.avatarId],
    transactions: [],
    missions: defaultMissions(newId),
    holdings: [],
    investments: [],
    achievements: [],
  }
}

const LIST_FIELDS = ["investments", "achievements", "transactions", "holdings", "inventory", "missions"] as const

export function needsNormalization(raw: Partial<User>): boolean {
  return LIST_FIELDS.some((field) => raw[field] === undefined)
}

/** Completa campos ausentes de usuários salvos por versões antigas. */
export function normalizeUser(raw: Partial<User>, newId: () => string): User {
  return {
    ...(raw as User),
    investments: raw.investments ?? [],
    achievements: raw.achievements ?? [],
    transactions: raw.transactions ?? [],
    holdings: raw.holdings ?? [],
    inventory: raw.inventory ?? [],
    missions: raw.missions ?? defaultMissions(newId),
  }
}

export function findByCredentials(users: User[], email: string, password: string): User | undefined {
  return users.find((u) => u.email === email && u.password === password)
}

export function signupUser(users: User[], input: SignupInput, newId: () => string): Result<{ user: User }> {
  if (users.some((u) => u.email === input.email)) return { ok: false, error: "E-mail já cadastrado" }
  const avatars = listDefaultAvatars()
  const avatar = avatars.find((a) => a.id === input.avatarId) ?? avatars[0]
  const user = createUser(
    { ...input, avatarUrl: avatar.src, balance: SIGNUP_INITIAL_BALANCE, xp: 0 },
    newId,
  )
  return { ok: true, user }
}

export function addTransaction(user: User, amount: number, description: string, ctx: DomainContext): User {
  const tx: Transaction = { id: ctx.newId(), amount, description, at: ctx.now }
  return { ...user, transactions: [tx, ...user.transactions] }
}

/** Bônus do botão "Receber moedas (demo)". */
export function addDemoCoins(user: User, amount: number, ctx: DomainContext): User {
  const updated = { ...user, balance: user.balance + amount, xp: user.xp + Math.round(amount * 0.5) }
  return addTransaction(updated, amount, "Bônus demo", ctx)
}

export function replaceUser(users: User[], user: User): User[] {
  return users.map((u) => (u.id === user.id ? user : u))
}
