import { describe, expect, it } from "vitest"
import { createStorageRepository, STORAGE_KEYS } from "@/lib/data/repository"
import { createLocalStorage, createMemoryStorage } from "@/lib/data/storage"

describe("createStorageRepository", () => {
  it("usa as chaves originais do localStorage", () => {
    expect(STORAGE_KEYS).toEqual({ users: "edu:users", current: "edu:current", assets: "edu:assets", tick: "edu:tick" })
  })

  it("retorna null para chaves ausentes (dispara seed)", () => {
    const repo = createStorageRepository(createMemoryStorage())
    expect(repo.getUsers()).toBeNull()
    expect(repo.getSimAssets()).toBeNull()
    expect(repo.getTick()).toBeNull()
    expect(repo.getCurrentUserId()).toBeNull()
  })

  it("JSON corrompido não dispara novo seed", () => {
    const repo = createStorageRepository(createMemoryStorage({ "edu:users": "{oops", "edu:current": "{oops" }))
    expect(repo.getUsers()).toEqual([])
    expect(repo.getCurrentUserId()).toBeNull()
  })

  it("serializa em JSON e trata usuário vazio como deslogado", () => {
    const storage = createMemoryStorage()
    const repo = createStorageRepository(storage)
    repo.setCurrentUserId("abc")
    expect(storage.getItem("edu:current")).toBe('"abc"')
    expect(repo.getCurrentUserId()).toBe("abc")
    repo.setCurrentUserId(null)
    expect(repo.getCurrentUserId()).toBeNull()
  })
})

describe("createLocalStorage fora do navegador", () => {
  it("é no-op no SSR", () => {
    const storage = createLocalStorage()
    expect(storage.getItem("edu:users")).toBeNull()
    expect(() => storage.setItem("edu:users", "[]")).not.toThrow()
    expect(typeof storage.subscribe?.(() => {})).toBe("function")
  })
})
