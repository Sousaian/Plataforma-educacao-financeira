/** Armazenamento chave/valor síncrono (subconjunto da Web Storage API). */
export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  /** Avisa sobre alterações feitas fora desta instância (ex.: outra aba). */
  subscribe?(listener: () => void): () => void
}

function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

/** `localStorage` do navegador. No servidor (SSR) vira no-op: leituras retornam `null`. */
export function createLocalStorage(prefix = "edu:"): KeyValueStorage {
  return {
    getItem: (key) => (hasLocalStorage() ? window.localStorage.getItem(key) : null),
    setItem: (key, value) => {
      if (hasLocalStorage()) window.localStorage.setItem(key, value)
    },
    subscribe: (listener) => {
      if (typeof window === "undefined") return () => {}
      const onStorage = (e: StorageEvent) => {
        if (e.key === null || e.key.startsWith(prefix)) listener()
      }
      window.addEventListener("storage", onStorage)
      return () => window.removeEventListener("storage", onStorage)
    },
  }
}

/** Implementação em memória, usada nos testes. */
export function createMemoryStorage(initial: Record<string, string> = {}): KeyValueStorage & {
  dump(): Record<string, string>
} {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
    dump: () => Object.fromEntries(data),
  }
}
