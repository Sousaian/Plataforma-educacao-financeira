import { listAvatarOptions } from "./catalog"
import { getPatent } from "./patents"
import { addTransaction } from "./users"
import type { DomainContext, Result, StoreItem, User } from "./types"

export function isLockedByPatent(item: { requiredPatentIndex?: number }, xp: number): boolean {
  return item.requiredPatentIndex !== undefined && getPatent(xp).index < item.requiredPatentIndex
}

export function buyItem(user: User, item: StoreItem, ctx: DomainContext): Result<{ user: User }> {
  if (user.inventory.includes(item.id)) return { ok: false, error: "Já adquirido" }
  if (isLockedByPatent(item, user.xp)) return { ok: false, error: `Requer patente ${item.requiredPatentName}` }
  if (user.balance < item.price) return { ok: false, error: "Saldo insuficiente" }

  const updated: User = {
    ...user,
    balance: user.balance - item.price,
    inventory: [...user.inventory, item.id],
  }
  return { ok: true, user: addTransaction(updated, -item.price, `Compra: ${item.name}`, ctx) }
}

/** Retorna o usuário com o avatar equipado, ou `null` se não puder equipar. */
export function equipAvatar(user: User, avatarId: string): User | null {
  const found = listAvatarOptions().find((a) => a.id === avatarId)
  if (!found) return null
  if (!user.inventory.includes(avatarId) && !found.free) return null
  return { ...user, avatarId, avatarUrl: found.src }
}
