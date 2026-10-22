import { nanoid } from "nanoid"
import {
  addDemoCoins,
  buyItem as buyItemRule,
  completeMission as completeMissionRule,
  computeRanking,
  confirmInvestment as confirmInvestmentRule,
  equipAvatar as equipAvatarRule,
  findByCredentials,
  getInvestmentSnapshots as getInvestmentSnapshotsRule,
  listStoreItems,
  needsNormalization,
  normalizeUser,
  replaceUser,
  signupUser,
  simulateReturn as simulateReturnRule,
  withdrawMatured as withdrawMaturedRule,
  type DomainContext,
  type InvestInput,
  type InvestmentSnapshot,
  type RankingEntry,
  type Result,
  type SignupInput,
  type SimAsset,
  type SimulationResult,
  type User,
} from "@/lib/domain"
import type { EduRepository } from "@/lib/data/repository"
import { createDemoSimAssets, createDemoUsers } from "@/lib/data/seed"

/** Estado imutável entregue à UI; a referência só muda quando os dados mudam. */
export type EduSnapshot = {
  users: User[]
  currentUser: User | null
  assets: SimAsset[]
}

export const EMPTY_SNAPSHOT: EduSnapshot = Object.freeze({ users: [], currentUser: null, assets: [] })

export type EduServiceDeps = {
  repository: EduRepository
  now?: () => number
  newId?: () => string
}

const NOT_AUTHENTICATED = { ok: false, error: "Não autenticado" } as const

/**
 * Fachada usada pelas páginas: orquestra repositório + regras de domínio
 * e notifica assinantes (compatível com `useSyncExternalStore`).
 */
export function createEduService({ repository, now = Date.now, newId = nanoid }: EduServiceDeps) {
  const listeners = new Set<() => void>()
  let snapshot: EduSnapshot | null = null
  let unsubscribeRepository: (() => void) | undefined

  const ctx = (): DomainContext => ({ now: now(), newId })

  function ensureSeeded() {
    if (repository.getUsers() === null) repository.saveUsers(createDemoUsers(newId))
    if (repository.getSimAssets() === null) repository.saveSimAssets(createDemoSimAssets())
    if (repository.getTick() === null) repository.saveTick(now())
  }

  function loadUsers(): User[] {
    ensureSeeded()
    const raw = repository.getUsers() ?? []
    if (!raw.some(needsNormalization)) return raw as User[]
    // Persiste a migração de campos ausentes para manter ids de missões estáveis.
    const users = raw.map((u) => normalizeUser(u, newId))
    repository.saveUsers(users)
    return users
  }

  function loadAssets(): SimAsset[] {
    ensureSeeded()
    return repository.getSimAssets() ?? []
  }

  function loadCurrent(): { users: User[]; user: User } | null {
    const users = loadUsers()
    const id = repository.getCurrentUserId()
    const user = id ? users.find((u) => u.id === id) : undefined
    return user ? { users, user } : null
  }

  function changed() {
    snapshot = null
    for (const listener of listeners) listener()
  }

  function saveUser(users: User[], user: User) {
    repository.saveUsers(replaceUser(users, user))
    changed()
  }

  /** Aplica uma regra ao usuário logado e persiste o resultado. */
  function mutateCurrent<T extends object>(
    rule: (user: User, c: DomainContext) => Result<T & { user: User }>,
  ): Result<Omit<T, "user">> {
    const current = loadCurrent()
    if (!current) return NOT_AUTHENTICATED
    const res = rule(current.user, ctx())
    if (!res.ok) return res
    const { user, ...rest } = res
    saveUser(current.users, user)
    return rest as Result<Omit<T, "user">>
  }

  return {
    // --- Assinatura / snapshot ---
    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      if (listeners.size === 1 && repository.subscribe) unsubscribeRepository = repository.subscribe(changed)
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) {
          unsubscribeRepository?.()
          unsubscribeRepository = undefined
        }
      }
    },

    getSnapshot(): EduSnapshot {
      if (!snapshot) {
        const users = loadUsers()
        const id = repository.getCurrentUserId()
        snapshot = {
          users,
          currentUser: (id && users.find((u) => u.id === id)) || null,
          assets: loadAssets(),
        }
      }
      return snapshot
    },

    // --- Autenticação ---
    getCurrentUser(): User | null {
      return loadCurrent()?.user ?? null
    },

    login(email: string, password: string): boolean {
      const user = findByCredentials(loadUsers(), email, password)
      if (!user) return false
      repository.setCurrentUserId(user.id)
      changed()
      return true
    },

    signup(input: SignupInput): boolean {
      const users = loadUsers()
      const res = signupUser(users, input, newId)
      if (!res.ok) return false
      repository.saveUsers([...users, res.user])
      repository.setCurrentUserId(res.user.id)
      changed()
      return true
    },

    logout() {
      repository.setCurrentUserId(null)
      changed()
    },

    // --- Missões / carteira ---
    completeMission(missionId: string): Result {
      return mutateCurrent((u, c) => completeMissionRule(u, missionId, c))
    },

    addCoinsDemo(amount: number) {
      mutateCurrent((u, c) => ({ ok: true, user: addDemoCoins(u, amount, c) }))
    },

    // --- Loja / avatar ---
    buyItem(itemId: string): Result {
      return mutateCurrent((u, c) => {
        const item = listStoreItems().find((i) => i.id === itemId)
        if (!item) return { ok: false, error: "Item não encontrado" }
        return buyItemRule(u, item, c)
      })
    },

    equipAvatar(avatarId: string) {
      mutateCurrent((u) => {
        const user = equipAvatarRule(u, avatarId)
        return user ? { ok: true, user } : { ok: false, error: "Avatar indisponível" }
      })
    },

    // --- Investimentos ---
    listSimAssets(): SimAsset[] {
      return loadAssets()
    },

    simulateReturn(asset: SimAsset | undefined, months: number, principal: number): SimulationResult {
      return simulateReturnRule(asset, months, principal, now())
    },

    confirmInvestment(input: InvestInput): Result<{ achievements: string[] }> {
      const assets = loadAssets()
      return mutateCurrent((u, c) => confirmInvestmentRule(u, assets, input, c))
    },

    withdrawMatured(investmentId: string): Result<{ finalValue: number; achievements: string[] }> {
      const assets = loadAssets()
      return mutateCurrent((u, c) => withdrawMaturedRule(u, assets, investmentId, c))
    },

    getInvestmentSnapshots(user: User, assets: SimAsset[]): { active: InvestmentSnapshot[]; closed: InvestmentSnapshot[] } {
      return getInvestmentSnapshotsRule(user, assets, now())
    },

    // --- Ranking ---
    getRanking(): RankingEntry[] {
      const current = loadCurrent()
      return current ? computeRanking(current.users, current.user) : []
    },
  }
}

export type EduService = ReturnType<typeof createEduService>
