"use client"

import { nanoid } from "nanoid"
import { getPatent } from "./patents"

export type Transaction = { id: string; amount: number; description: string; at: number }
export type Mission = {
  id: string
  title: string
  description: string
  reward: number
  completed: boolean
  dueDate?: string
  mandatory?: boolean
}
export type StoreItem = {
  id: string
  name: string
  description: string
  category: "physical" | "immaterial" | "avatar"
  price: number
  imageUrl: string
  requiredPatentIndex?: number
  requiredPatentName?: string
}
export type BaseAsset = { id: string; name: string; description: string; price: number }

// Simulator-specific
export type Risk = "Baixo" | "Médio" | "Alto" | "Variável"
export type Indexation = "Fixado" | "Pós-fixado" | "Variável"
export type SimAsset = {
  id: string
  name: string
  subtitle: string
  risk: Risk
  monthlyRate: number
  color: string
  borderColor?: string
  indexation?: Indexation
  safe?: boolean
  hasCourse?: boolean
  yieldLabel?: string
  defaultMonths?: number
  minInvest?: number
  redemption?: "Automático" | "Ao final do prazo"
}
export type Investment = {
  id: string
  assetId: string
  assetName: string
  risk: Risk
  monthlyRate: number
  startAt: number
  months: number
  principal: number
  status: "active" | "closed"
  // Computed at close:
  finalValue?: number
  finalYield?: number
}
export type Holding = { assetId: string; amount: number }

export type User = {
  id: string
  name: string
  email: string
  classroom: string
  school: string // New field
  password: string
  avatarId: string
  avatarUrl: string
  balance: number
  xp: number
  inventory: string[]
  transactions: Transaction[]
  missions: Mission[]
  holdings: Holding[]
  investments?: Investment[]
  achievements?: string[]
}

// Storage keys
const K_USERS = "edu:users"
const K_CURRENT = "edu:current"
const K_ASSETS = "edu:assets"
const K_TICK = "edu:tick"

type Sub = () => void
const subs = new Set<Sub>()
export function subscribeDB(fn: Sub) {
  subs.add(fn)
  return () => subs.delete(fn)
}
function notify() {
  for (const s of subs) s()
}
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
  notify()
}

function seedIfNeeded() {
  if (!localStorage.getItem(K_USERS)) {
    const avatars = listDefaultAvatars()
    const demoUsers: User[] = [
      mkUser(
        "Ana Silva",
        "ana@escola.com",
        "2ºA",
        "Escola Estadual Dom Pedro II",
        "1234",
        avatars[0].id,
        avatars[0].src,
        620,
        520,
      ),
      mkUser(
        "Bruno Souza",
        "bruno@escola.com",
        "3ºB",
        "Escola Estadual Dom Pedro II",
        "1234",
        avatars[1].id,
        avatars[1].src,
        890,
        980,
      ),
      mkUser(
        "Carla Lima",
        "carla@escola.com",
        "9ºC",
        "Escola Estadual Dom Pedro II",
        "1234",
        avatars[2].id,
        avatars[2].src,
        300,
        260,
      ),
      mkUser(
        "Diego Melo",
        "diego@escola.com",
        "1ºA",
        "Escola Estadual Dom Pedro II",
        "1234",
        avatars[3].id,
        avatars[3].src,
        1200,
        1400,
      ),
    ]
    write(K_USERS, demoUsers)
  }
  if (!localStorage.getItem(K_ASSETS)) {
    // Simulator assets (educational)
    const assets: SimAsset[] = [
      {
        id: "SABER",
        name: "Fundo Saber+",
        subtitle: "Baixo risco, retorno médio. Ideal para iniciantes.",
        risk: "Baixo",
        monthlyRate: 0.04,
        color: "#60A5FA",
        borderColor: "#0A2540", // padrão
        indexation: "Fixado",
        safe: true,
        hasCourse: false,
        defaultMonths: 3,
        minInvest: 200,
        redemption: "Ao final do prazo",
      },
      {
        id: "BOLSA",
        name: "Bolsa da Educação",
        subtitle: "Médio risco, retorno variado e potencial de crescimento.",
        risk: "Médio",
        monthlyRate: 0.06,
        color: "#34D399",
        borderColor: "#22C55E", // verde para seguros/estáveis
        indexation: "Pós-fixado",
        safe: false,
        hasCourse: false,
        defaultMonths: 3,
        minInvest: 150,
        redemption: "Ao final do prazo",
      },
      {
        id: "CRIPTO",
        name: "CriptoConhecimento",
        subtitle: "Alto risco, retorno volátil. Para quem aceita oscilações.",
        risk: "Alto",
        monthlyRate: 0.12,
        color: "#F59E0B",
        borderColor: "#A78BFA", // roxo para variável
        indexation: "Variável",
        safe: false,
        hasCourse: false,
        defaultMonths: 3,
        minInvest: 100,
        redemption: "Ao final do prazo",
        yieldLabel: "Variável (média 12% a.m.)",
      },
      {
        id: "EMP",
        name: "EmpreendaJá",
        subtitle: "Retorno varia com engajamento e tempo em missões.",
        risk: "Variável",
        monthlyRate: 0.05,
        color: "#A78BFA",
        borderColor: "#A78BFA",
        indexation: "Variável",
        safe: false,
        hasCourse: true,
        defaultMonths: 3,
        minInvest: 120,
        redemption: "Ao final do prazo",
      },
    ]
    write(K_ASSETS, assets)
  }
  if (!localStorage.getItem(K_TICK)) {
    write(K_TICK, Date.now())
  }
}
function mkUser(
  name: string,
  email: string,
  classroom: string,
  school: string, // New parameter
  password: string,
  avatarId: string,
  avatarUrl: string,
  balance: number,
  xp: number,
): User {
  const missions = defaultMissions()
  return {
    id: nanoid(),
    name,
    email,
    classroom,
    school, // New field
    password,
    avatarId,
    avatarUrl,
    balance,
    xp,
    inventory: [avatarId],
    transactions: [],
    missions,
    holdings: [],
    investments: [],
    achievements: [],
  }
}
function defaultMissions(): Mission[] {
  return [
    {
      id: nanoid(),
      title: "Prova de Matemática",
      description: "Entregar prova com dedicação e mostrar todo o desenvolvimento dos cálculos",
      reward: 50,
      completed: false,
      dueDate: "15/12/2024",
      mandatory: true,
    },
    {
      id: nanoid(),
      title: "Comportamento",
      description: "Manter bom comportamento durante toda a semana sem advertências",
      reward: 20,
      completed: false,
      dueDate: "Toda semana",
      mandatory: false,
    },
    {
      id: nanoid(),
      title: "Simulado",
      description: "Participar do simulado de sábado e responder todas as questões com atenção",
      reward: 30,
      completed: false,
      dueDate: "21/12/2024",
      mandatory: true,
    },
    {
      id: nanoid(),
      title: "Projeto",
      description: "Entregar projeto interdisciplinar sobre sustentabilidade com pesquisa completa",
      reward: 60,
      completed: false,
      dueDate: "30/12/2024",
      mandatory: true,
    },
    {
      id: nanoid(),
      title: "Participação em Aula",
      description: "Participar ativamente das discussões em sala durante a semana",
      reward: 15,
      completed: false,
      dueDate: "Toda semana",
      mandatory: false,
    },
  ]
}

// Avatars
export function listDefaultAvatars() {
  return [
    { id: "av1", src: "/images/avatars/avatar-1.png", alt: "Avatar 1", free: true },
    { id: "av2", src: "/images/avatars/avatar-2.png", alt: "Avatar 2", free: true },
    { id: "av3", src: "/images/avatars/avatar-3.png", alt: "Avatar 3", free: true },
    { id: "av4", src: "/images/avatars/avatar-4.png", alt: "Avatar 4", free: true },
    { id: "av5", src: "/images/avatars/avatar-5.png", alt: "Avatar 5", free: true },
    { id: "av6", src: "/images/avatars/avatar-6.png", alt: "Avatar 6", free: true },
  ]
}
export function listAvatarOptions() {
  return [
    ...listDefaultAvatars(),
    {
      id: "av7",
      src: "/images/avatars/avatar-7.png",
      alt: "Avatar 7",
      name: "Avatar Ouro",
      free: false,
      requiredPatentIndex: 3,
      requiredPatentName: "Ouro",
    },
    {
      id: "av8",
      src: "/images/avatars/avatar-8.png",
      alt: "Avatar 8",
      name: "Avatar Diamante",
      free: false,
      requiredPatentIndex: 4,
      requiredPatentName: "Diamante",
    },
  ]
}

// Users
function getUsers(): User[] {
  seedIfNeeded()
  // Migrate missing fields
  const users = read<User[]>(K_USERS, [])
  for (const u of users) {
    if (!u.investments) u.investments = []
    if (!u.achievements) u.achievements = []
    if (!u.transactions) u.transactions = []
    if (!u.holdings) u.holdings = []
    if (!u.inventory) u.inventory = []
    if (!u.missions) u.missions = defaultMissions()
  }
  return users
}
function saveUsers(users: User[]) {
  write(K_USERS, users)
}
export function getCurrentUser(): User | null {
  seedIfNeeded()
  const id = read<string | null>(K_CURRENT, null)
  if (!id) return null
  const u = getUsers().find((x) => x.id === id)
  return u || null
}
function setCurrentUser(id: string) {
  write(K_CURRENT, id)
}
export function login(email: string, password: string): boolean {
  const users = getUsers()
  const u = users.find((x) => x.email === email && x.password === password)
  if (!u) return false
  setCurrentUser(u.id)
  return true
}
export function signup({
  name,
  email,
  classroom,
  school, // New parameter
  password,
  avatarId,
}: { name: string; email: string; classroom: string; school: string; password: string; avatarId: string }): boolean {
  const users = getUsers()
  if (users.some((x) => x.email === email)) return false
  const def = listDefaultAvatars().find((a) => a.id === avatarId) ?? listDefaultAvatars()[0]
  const newU = mkUser(name, email, classroom, school, password, avatarId, def.src, 100, 0)
  users.push(newU)
  saveUsers(users)
  setCurrentUser(newU.id)
  return true
}
export function logout() {
  write(K_CURRENT, "")
}

// Missions
export function listMissionsForCurrent(): Mission[] {
  const u = getCurrentUser()
  return u ? u.missions : []
}
export function completeMission(missionId: string): { ok: true } | { ok: false; error?: string } {
  const users = getUsers()
  const uid = read<string | null>(K_CURRENT, null)
  const u = users.find((x) => x.id === uid)
  if (!u) return { ok: false, error: "Não autenticado" }
  const m = u.missions.find((m) => m.id === missionId)
  if (!m) return { ok: false, error: "Missão não encontrada" }
  if (m.completed) return { ok: false, error: "Já concluída" }
  m.completed = true
  u.balance += m.reward
  u.xp += Math.round(m.reward * 0.8)
  u.transactions.unshift({ id: nanoid(), amount: m.reward, description: `Missão: ${m.title}`, at: Date.now() })
  saveUsers(users)
  return { ok: true }
}
export function addCoinsDemo(amount: number) {
  const users = getUsers()
  const uid = read<string | null>(K_CURRENT, null)
  const u = users.find((x) => x.id === uid)
  if (!u) return
  u.balance += amount
  u.xp += Math.round(amount * 0.5)
  u.transactions.unshift({ id: nanoid(), amount, description: "Bônus demo", at: Date.now() })
  saveUsers(users)
}

// Store
export function listStoreItems(): StoreItem[] {
  const pkg = [
    {
      id: "st-livro",
      name: "Conjunto de Livros",
      description: "Aprimore seus estudos",
      category: "physical",
      price: 120,
      imageUrl: "/images/store/books.png",
    },
    {
      id: "st-notebook",
      name: "Notebook (sorteio)",
      description: "Participe do sorteio",
      category: "physical",
      price: 300,
      imageUrl: "/images/store/laptop.png",
      requiredPatentIndex: 2,
      requiredPatentName: "Prata",
    },
    {
      id: "st-curso",
      name: "Curso Profissionalizante",
      description: "Desenvolva novas habilidades",
      category: "immaterial",
      price: 180,
      imageUrl: "/images/store/course.png",
    },
    {
      id: "st-pele-ouro",
      name: "Skin Ouro",
      description: "Personalização dourada",
      category: "avatar",
      price: 90,
      imageUrl: "/images/store/skin-gold.png",
      requiredPatentIndex: 3,
      requiredPatentName: "Ouro",
    },
    {
      id: "st-danca",
      name: "Dança Especial",
      description: "Animação para seu avatar",
      category: "avatar",
      price: 60,
      imageUrl: "/images/store/dance.png",
    },
  ] satisfies StoreItem[]
  return pkg
}
export function buyItem(itemId: string): { ok: true } | { ok: false; error?: string } {
  const users = getUsers()
  const uid = read<string | null>(K_CURRENT, null)
  const u = users.find((x) => x.id === uid)
  if (!u) return { ok: false, error: "Não autenticado" }
  const items = listStoreItems()
  const item = items.find((i) => i.id === itemId)
  if (!item) return { ok: false, error: "Item não encontrado" }
  if (u.inventory.includes(item.id)) return { ok: false, error: "Já adquirido" }
  const pat = getPatent(u.xp)
  if (item.requiredPatentIndex !== undefined && pat.index < item.requiredPatentIndex) {
    return { ok: false, error: `Requer patente ${item.requiredPatentName}` }
  }
  if (u.balance < item.price) return { ok: false, error: "Saldo insuficiente" }
  u.balance -= item.price
  u.transactions.unshift({ id: nanoid(), amount: -item.price, description: `Compra: ${item.name}`, at: Date.now() })
  u.inventory.push(item.id)
  saveUsers(users)
  return { ok: true }
}

// Avatar equip
export function equipAvatar(avatarId: string) {
  const users = getUsers()
  const uid = read<string | null>(K_CURRENT, null)
  const u = users.find((x) => x.id === uid)
  if (!u) return
  const found = listAvatarOptions().find((a) => a.id === avatarId)
  if (!found) return
  if (!u.inventory.includes(avatarId) && !found.free) return
  u.avatarId = avatarId
  u.avatarUrl = (found as any).src
  saveUsers(users)
}

// Assets + investing simulation
const MS_MONTH = 30 * 24 * 60 * 60 * 1000

export function listAssets(): BaseAsset[] {
  // legacy for dashboard chart (not core of this page)
  return [
    { id: "AST-EDU", name: "Fundo Educação", description: "Carteira diversificada educacional", price: 100 },
    { id: "AST-TEC", name: "Tech Simulada", description: "Empresas de tecnologia simuladas", price: 100 },
    { id: "AST-GREEN", name: "Green Simulado", description: "Sustentabilidade e energia", price: 100 },
  ]
}

export function listSimAssets(): SimAsset[] {
  seedIfNeeded()
  return read<SimAsset[]>(K_ASSETS, [])
}

// Deterministic-ish volatility per month
function monthVolatility(assetId: string, monthIndex: number, risk: Risk): number {
  const baseNoise =
    (Array.from(assetId + ":" + monthIndex).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 100) / 100 - 0.5 // -0.5..0.5
  const amp = risk === "Baixo" ? 0.01 : risk === "Médio" ? 0.03 : risk === "Alto" ? 0.08 : 0.05
  return baseNoise * amp
}

function variableAdjustment(monthIndex: number): number {
  // Varies with time using a sine wave pattern between -0.02..+0.02
  return Math.sin(monthIndex / 1.5) * 0.02
}

export function simulateReturn(
  assetId: string,
  months: number,
  principal: number,
): {
  ok: boolean
  series: { t: number; v: number }[]
  expectedFinal: number
  expectedYield: number
  monthlyRate: number
  maturity: number
  message?: string
} {
  const assets = listSimAssets()
  const asset = assets.find((a) => a.id === assetId)
  if (!asset)
    return {
      ok: false,
      series: [],
      expectedFinal: 0,
      expectedYield: 0,
      monthlyRate: 0,
      maturity: Date.now(),
      message: "Ativo inexistente",
    }
  if (!months || months <= 0)
    return {
      ok: false,
      series: [],
      expectedFinal: 0,
      expectedYield: 0,
      monthlyRate: asset.monthlyRate,
      maturity: Date.now(),
      message: "Prazo inválido",
    }
  if (principal <= 0)
    return {
      ok: false,
      series: [],
      expectedFinal: 0,
      expectedYield: 0,
      monthlyRate: asset.monthlyRate,
      maturity: Date.now(),
      message: "Valor inválido",
    }

  let value = principal
  const start = Date.now()
  const maturity = start + months * MS_MONTH
  const series: { t: number; v: number }[] = [{ t: start, v: value }]

  for (let m = 1; m <= months; m++) {
    let rate = asset.monthlyRate + monthVolatility(asset.id, m, asset.risk)
    if (asset.risk === "Variável") {
      rate += variableAdjustment(m)
    }
    value = value * (1 + rate)
    series.push({ t: start + m * MS_MONTH, v: value })
  }

  const expectedFinal = value
  const expectedYield = expectedFinal - principal

  return {
    ok: true,
    series,
    expectedFinal,
    expectedYield,
    monthlyRate: asset.monthlyRate,
    maturity,
  }
}

export function confirmInvestment({
  assetId,
  assetName,
  months,
  principal,
}: {
  assetId: string
  assetName: string
  months: number
  principal: number
}): { ok: true; achievements?: string[] } | { ok: false; error?: string } {
  const users = getUsers()
  const uid = read<string | null>(K_CURRENT, null)
  const u = users.find((x) => x.id === uid)
  if (!u) return { ok: false, error: "Não autenticado" }
  if (principal <= 0) return { ok: false, error: "Valor inválido" }
  if (u.balance < principal) return { ok: false, error: "Saldo insuficiente" }
  const asset = listSimAssets().find((a) => a.id === assetId)
  if (!asset) return { ok: false, error: "Ativo não encontrado" }

  // Deduct balance and create investment
  u.balance -= principal
  const inv: Investment = {
    id: nanoid(),
    assetId,
    assetName,
    risk: asset.risk,
    monthlyRate: asset.monthlyRate,
    startAt: Date.now(),
    months,
    principal,
    status: "active",
  }
  if (!u.investments) u.investments = []
  u.investments.unshift(inv)
  u.transactions.unshift({
    id: nanoid(),
    amount: -principal,
    description: `Investimento em ${asset.name}`,
    at: Date.now(),
  })

  // Achievements
  const achievements: string[] = []
  if ((u.achievements ?? []).indexOf("first_investment") === -1 && (u.investments?.length ?? 0) >= 1) {
    u.achievements?.push("first_investment")
    achievements.push("first_investment")
  }
  const sim = simulateReturn(assetId, months, principal)
  const projGainPct = sim.ok ? sim.expectedYield / principal : 0
  if (projGainPct >= 0.1 && (u.achievements ?? []).indexOf("proj_gain_10") === -1) {
    u.achievements?.push("proj_gain_10")
    achievements.push("proj_gain_10")
  }

  saveUsers(users)
  return { ok: true, achievements }
}

export type InvestmentSnapshot = {
  id: string
  assetName: string
  risk: Risk
  months: number
  startAt: number
  maturityAt: number
  principal: number
  monthlyRate: number
  currentValue: number
  currentYield: number
  statusLabel: "Em andamento" | "Em vencimento" | "Finalizado"
  canWithdraw: boolean
  series: { t: number; v: number }[]
}

export function getInvestmentSnapshots(): {
  active: InvestmentSnapshot[]
  closed: InvestmentSnapshot[]
} {
  const u = getCurrentUser()
  if (!u) return { active: [], closed: [] }
  const now = Date.now()
  const active: InvestmentSnapshot[] = []
  const closed: InvestmentSnapshot[] = []
  for (const inv of u.investments ?? []) {
    const maturityAt = inv.startAt + inv.months * MS_MONTH
    // Build series month by month until now (or maturity)
    const monthsElapsed = Math.max(0, Math.floor((Math.min(now, maturityAt) - inv.startAt) / MS_MONTH))
    const simAll = simulateReturn(inv.assetId, inv.months, inv.principal)
    const series = simAll.ok ? simAll.series.filter((p) => p.t <= Math.min(now, maturityAt)) : []
    const currentValue = series.length > 0 ? series[series.length - 1].v : inv.principal
    const currentYield = currentValue - inv.principal

    if (inv.status === "closed") {
      closed.push({
        id: inv.id,
        assetName: inv.assetName,
        risk: inv.risk,
        months: inv.months,
        startAt: inv.startAt,
        maturityAt,
        principal: inv.principal,
        monthlyRate: inv.monthlyRate,
        currentValue,
        currentYield,
        statusLabel: "Finalizado",
        canWithdraw: false,
        series: simAll.ok ? simAll.series : [],
      })
    } else {
      // Active
      const daysToMaturity = Math.ceil((maturityAt - now) / (24 * 60 * 60 * 1000))
      const label: InvestmentSnapshot["statusLabel"] = daysToMaturity <= 7 ? "Em vencimento" : "Em andamento"
      active.push({
        id: inv.id,
        assetName: inv.assetName,
        risk: inv.risk,
        months: inv.months,
        startAt: inv.startAt,
        maturityAt,
        principal: inv.principal,
        monthlyRate: inv.monthlyRate,
        currentValue,
        currentYield,
        statusLabel: label,
        canWithdraw: now >= maturityAt,
        series,
      })
    }
  }
  return { active, closed }
}

export function withdrawMatured(
  invId: string,
): { ok: true; finalValue: number; achievements?: string[] } | { ok: false; error?: string } {
  const users = getUsers()
  const uid = read<string | null>(K_CURRENT, null)
  const u = users.find((x) => x.id === uid)
  if (!u) return { ok: false, error: "Não autenticado" }
  const inv = (u.investments ?? []).find((i) => i.id === invId)
  if (!inv) return { ok: false, error: "Investimento não encontrado" }
  const maturityAt = inv.startAt + inv.months * MS_MONTH
  if (Date.now() < maturityAt) return { ok: false, error: "Ainda não chegou o vencimento" }
  if (inv.status === "closed") return { ok: false, error: "Já encerrado" }

  const sim = simulateReturn(inv.assetId, inv.months, inv.principal)
  const finalValue = sim.ok ? sim.expectedFinal : inv.principal

  inv.status = "closed"
  inv.finalValue = finalValue
  inv.finalYield = finalValue - inv.principal

  // Return to balance
  u.balance += finalValue
  u.transactions.unshift({
    id: nanoid(),
    amount: finalValue,
    description: `Resgate: ${inv.assetName}`,
    at: Date.now(),
  })
  // XP bonus for completing investment
  const pat = getPatent(u.xp)
  const xpGain = Math.max(5, Math.round((inv.finalYield ?? 0) * 0.1) + pat.index * 2)
  u.xp += xpGain

  // Achievements
  const achievements: string[] = []
  const yieldPct = (finalValue - inv.principal) / inv.principal
  if (yieldPct >= 0.1 && (u.achievements ?? []).indexOf("yield_10_plus") === -1) {
    u.achievements?.push("yield_10_plus")
    achievements.push("yield_10_plus")
  }

  saveUsers(users)
  return { ok: true, finalValue, achievements }
}

export function getHistoryInvestments(): Array<{
  id: string
  assetName: string
  startAt: number
  maturityAt: number
  principal: number
  finalYield: number
}> {
  const u = getCurrentUser()
  if (!u) return []
  return (u.investments ?? [])
    .filter((i) => i.status === "closed")
    .map((i) => ({
      id: i.id,
      assetName: i.assetName,
      startAt: i.startAt,
      maturityAt: i.startAt + i.months * MS_MONTH,
      principal: i.principal,
      finalYield: i.finalYield ?? 0,
    }))
    .sort((a, b) => b.maturityAt - a.maturityAt)
}

// Legacy chart for dashboard (kept)
function getPrice(a: BaseAsset): number {
  const seed = read<number>(K_TICK, Date.now())
  const t = Math.floor((Date.now() - seed) / 3000)
  const hash = Array.from(a.id + t).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const base = 100
  const drift = Math.sin((hash % 360) * (Math.PI / 180)) * 5
  const noise = (hash % 7) - 3
  return Math.max(50, base + drift + noise)
}
export function getPortfolioSeries(): { t: number; v: number }[] {
  const assets = listAssets()
  const u = getCurrentUser()
  const now = Date.now()
  const points: { t: number; v: number }[] = []
  const steps = 20
  for (let i = steps - 1; i >= 0; i--) {
    const time = now - i * 3000
    const tIndex = Math.floor(i)
    const v =
      (u?.holdings ?? []).reduce((sum, h) => {
        const a = assets.find((as) => as.id === h.assetId)
        if (!a) return sum
        const shadow: BaseAsset = { ...a, id: a.id + ":" + (tIndex + (a.id.length % 3)) }
        const price = getPrice(shadow)
        return sum + (h.amount / 100) * price
      }, 0) ?? 0
    points.push({ t: time, v })
  }

  // This was triggering infinite re-renders by continuously updating the tick value
  // setTimeout(() => write(K_TICK, Date.now()), 1000)

  return points
}

// Ranking
export function getRanking(): Array<Pick<User, "id" | "name" | "classroom" | "avatarUrl" | "balance" | "xp">> {
  const users = getUsers()
  const currentUser = getCurrentUser()
  if (!currentUser) return []

  // Filter by same school and classroom
  const sameSchoolAndClass = users.filter(
    (u) => u.school === currentUser.school && u.classroom === currentUser.classroom,
  )

  const noisy = sameSchoolAndClass.map((u) => {
    const pat = getPatent(u.xp)
    const bonus = pat.index * 2
    return { ...u, balance: u.balance + bonus }
  })
  const top = noisy.sort((a, b) => {
    if (b.balance !== a.balance) return b.balance - a.balance
    return b.xp - a.xp
  })
  return top.slice(0, 10).map((u) => ({
    id: u.id,
    name: u.name,
    classroom: u.classroom,
    avatarUrl: u.avatarUrl,
    balance: u.balance,
    xp: u.xp,
  }))
}
