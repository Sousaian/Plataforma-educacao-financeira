import { addTransaction } from "./users"
import type { DomainContext, Result, User } from "./types"

/** XP ganho ao concluir uma missão: 80% da recompensa. */
export function missionXp(reward: number): number {
  return Math.round(reward * 0.8)
}

export function completeMission(user: User, missionId: string, ctx: DomainContext): Result<{ user: User }> {
  const mission = user.missions.find((m) => m.id === missionId)
  if (!mission) return { ok: false, error: "Missão não encontrada" }
  if (mission.completed) return { ok: false, error: "Já concluída" }

  const updated: User = {
    ...user,
    missions: user.missions.map((m) => (m.id === missionId ? { ...m, completed: true } : m)),
    balance: user.balance + mission.reward,
    xp: user.xp + missionXp(mission.reward),
  }
  return { ok: true, user: addTransaction(updated, mission.reward, `Missão: ${mission.title}`, ctx) }
}
