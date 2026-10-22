export type Patent = {
  index: number
  name: "Bronze" | "Cobre" | "Prata" | "Ouro" | "Diamante" | "Platina"
  minXp: number
  bg: string
  fg: string
  border: string
}

export const PATENTS: Patent[] = [
  { index: 0, name: "Bronze", minXp: 0, bg: "#F8E4D1", fg: "#7A4E2D", border: "#D9B792" },
  { index: 1, name: "Cobre", minXp: 100, bg: "#F6D9CF", fg: "#7C3F31", border: "#E3B2A3" },
  { index: 2, name: "Prata", minXp: 250, bg: "#F0F2F5", fg: "#4B5563", border: "#CBD5E1" },
  { index: 3, name: "Ouro", minXp: 500, bg: "#FEF3C7", fg: "#92400E", border: "#F59E0B" },
  { index: 4, name: "Diamante", minXp: 900, bg: "#E0F2FE", fg: "#0C4A6E", border: "#7DD3FC" },
  { index: 5, name: "Platina", minXp: 1400, bg: "#ECFDF5", fg: "#064E3B", border: "#86EFAC" },
]

export function getPatent(xp: number): Patent {
  let current = PATENTS[0]
  for (const p of PATENTS) {
    if (xp >= p.minXp) current = p
  }
  return current
}

export function getNextPatentProgress(xp: number): { current: number; target: number; percent: number; next?: Patent } {
  const current = getPatent(xp)
  const currentIndex = current.index
  const next = PATENTS[currentIndex + 1]
  if (!next) {
    const maxTarget = current.minXp + 1
    return { current: xp - current.minXp, target: maxTarget - current.minXp, percent: 100, next: undefined }
  }
  const currentProgress = xp - current.minXp
  const target = next.minXp - current.minXp
  const percent = Math.max(0, Math.min(100, (currentProgress / target) * 100))
  return { current: currentProgress, target, percent, next }
}
