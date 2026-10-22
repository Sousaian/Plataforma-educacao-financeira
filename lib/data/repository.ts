import type { SimAsset, User } from "@/lib/domain"
import type { KeyValueStorage } from "./storage"

// Chaves mantidas da versão original para não perder dados de quem já usa o app.
export const STORAGE_KEYS = {
  users: "edu:users",
  current: "edu:current",
  assets: "edu:assets",
  tick: "edu:tick",
} as const

/**
 * Porta de persistência usada pelo serviço. Retornar `null` significa "nunca inicializado"
 * (o serviço então grava o seed demo). Para a fase 2, basta outra implementação desta interface.
 */
export interface EduRepository {
  getUsers(): Partial<User>[] | null
  saveUsers(users: User[]): void
  getCurrentUserId(): string | null
  setCurrentUserId(id: string | null): void
  getSimAssets(): SimAsset[] | null
  saveSimAssets(assets: SimAsset[]): void
  getTick(): number | null
  saveTick(tick: number): void
  subscribe?(listener: () => void): () => void
}

export function createStorageRepository(storage: KeyValueStorage): EduRepository {
  function read<T>(key: string): T | null {
    const raw = storage.getItem(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }
  const write = (key: string, value: unknown) => storage.setItem(key, JSON.stringify(value))
  // Valor presente mas corrompido não deve disparar novo seed (mesmo comportamento da versão original).
  const readList = <T>(key: string): T[] | null => (storage.getItem(key) ? (read<T[]>(key) ?? []) : null)

  return {
    getUsers: () => readList<Partial<User>>(STORAGE_KEYS.users),
    saveUsers: (users) => write(STORAGE_KEYS.users, users),
    getCurrentUserId: () => read<string>(STORAGE_KEYS.current) || null,
    // Logout grava string vazia, como antes.
    setCurrentUserId: (id) => write(STORAGE_KEYS.current, id ?? ""),
    getSimAssets: () => readList<SimAsset>(STORAGE_KEYS.assets),
    saveSimAssets: (assets) => write(STORAGE_KEYS.assets, assets),
    getTick: () => (storage.getItem(STORAGE_KEYS.tick) ? read<number>(STORAGE_KEYS.tick) : null),
    saveTick: (tick) => write(STORAGE_KEYS.tick, tick),
    subscribe: storage.subscribe ? (listener) => storage.subscribe!(listener) : undefined,
  }
}
