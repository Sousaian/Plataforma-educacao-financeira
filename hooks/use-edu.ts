"use client"

import { useMemo, useSyncExternalStore } from "react"
import { computeRanking } from "@/lib/domain"
import { eduService, EMPTY_SNAPSHOT, type EduSnapshot } from "@/lib/services"

const getServerSnapshot = (): EduSnapshot => EMPTY_SNAPSHOT

/**
 * Estado do app com re-render só quando os dados mudam.
 * No SSR e na hidratação retorna o snapshot vazio (sem usuário), igual ao HTML do servidor.
 */
export function useEduSnapshot(): EduSnapshot {
  return useSyncExternalStore(eduService.subscribe, eduService.getSnapshot, getServerSnapshot)
}

export function useCurrentUser() {
  return useEduSnapshot().currentUser
}

export function useRanking() {
  const { users, currentUser } = useEduSnapshot()
  return useMemo(() => (currentUser ? computeRanking(users, currentUser) : []), [users, currentUser])
}
