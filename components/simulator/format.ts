export function formatCoins(n: number): string {
  const val = Number.isFinite(n) ? Math.round(n) : 0
  return val.toLocaleString("pt-BR")
}

export function formatSignedCoins(n: number): string {
  return `${n >= 0 ? "+" : ""}${formatCoins(n)}`
}

export const yieldClass = (n: number) => (n >= 0 ? "text-green-600" : "text-red-600")

export const daysForMonths = (m: number) => m * 30

export const monthsLabel = (m: number) => (m === 1 ? "mês" : "meses")

/** Converte o texto digitado (aceita vírgula) em valor positivo, ou `null` se inválido. */
export function parseAmount(input: string): number | null {
  const amount = Number.parseFloat(input.replace(",", "."))
  return Number.isFinite(amount) && amount > 0 ? amount : null
}
