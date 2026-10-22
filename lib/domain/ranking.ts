import { getPatent } from "./patents"
import type { User } from "./types"

export type RankingEntry = Pick<User, "id" | "name" | "classroom" | "avatarUrl" | "balance" | "xp">

export const RANKING_SIZE = 10

/**
 * Top 10 da mesma escola e turma do usuário atual.
 * Saldo exibido = saldo + bônus de patente (índice * 2); desempate por XP.
 */
export function computeRanking(users: User[], current: User): RankingEntry[] {
  return users
    .filter((u) => u.school === current.school && u.classroom === current.classroom)
    .map((u) => ({ ...u, balance: u.balance + getPatent(u.xp).index * 2 }))
    .sort((a, b) => (b.balance !== a.balance ? b.balance - a.balance : b.xp - a.xp))
    .slice(0, RANKING_SIZE)
    .map((u) => ({
      id: u.id,
      name: u.name,
      classroom: u.classroom,
      avatarUrl: u.avatarUrl,
      balance: u.balance,
      xp: u.xp,
    }))
}
