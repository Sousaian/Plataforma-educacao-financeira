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

export type StoreCategory = "physical" | "immaterial" | "avatar"

export type StoreItem = {
  id: string
  name: string
  description: string
  category: StoreCategory
  price: number
  imageUrl: string
  requiredPatentIndex?: number
  requiredPatentName?: string
}

export type AvatarOption = {
  id: string
  src: string
  alt: string
  name?: string
  free: boolean
  requiredPatentIndex?: number
  requiredPatentName?: string
}

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
  // Preenchidos no resgate
  finalValue?: number
  finalYield?: number
}

export type Holding = { assetId: string; amount: number }

export type AchievementId = "first_investment" | "proj_gain_10" | "yield_10_plus"

export type User = {
  id: string
  name: string
  email: string
  classroom: string
  school: string
  password: string
  avatarId: string
  avatarUrl: string
  balance: number
  xp: number
  inventory: string[]
  transactions: Transaction[]
  missions: Mission[]
  holdings: Holding[]
  investments: Investment[]
  achievements: string[]
}

export type SeriesPoint = { t: number; v: number }

/** Dependências não determinísticas injetadas nas regras de negócio. */
export type DomainContext = {
  now: number
  newId: () => string
}

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string }
