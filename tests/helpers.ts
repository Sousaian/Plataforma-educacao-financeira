import { createUser, type DomainContext, type User } from "@/lib/domain"
import { createDemoSimAssets } from "@/lib/data/seed"

export const T0 = Date.UTC(2025, 0, 1)

export function idGenerator(prefix = "id") {
  let n = 0
  return () => `${prefix}-${++n}`
}

export function ctxAt(now: number, newId = idGenerator()): DomainContext {
  return { now, newId }
}

export function makeUser(overrides: Partial<User> = {}, newId = idGenerator("u")): User {
  return {
    ...createUser(
      {
        name: "Teste Aluno",
        email: "teste@escola.com",
        classroom: "2ºA",
        school: "Escola Teste",
        password: "1234",
        avatarId: "av1",
        avatarUrl: "/images/avatars/avatar-1.png",
        balance: 1000,
        xp: 0,
      },
      newId,
    ),
    ...overrides,
  }
}

export const assets = createDemoSimAssets()
export const asset = (id: string) => assets.find((a) => a.id === id)!
