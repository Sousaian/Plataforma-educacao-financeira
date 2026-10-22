import { createUser, listDefaultAvatars, type SimAsset, type User } from "@/lib/domain"

export const DEMO_SCHOOL = "Escola Estadual Dom Pedro II"
export const DEMO_PASSWORD = "1234"

/** Alunos demo gravados na primeira visita (senha "1234"). */
export function createDemoUsers(newId: () => string): User[] {
  const avatars = listDefaultAvatars()
  const demo: Array<[name: string, email: string, classroom: string, balance: number, xp: number]> = [
    ["Ana Silva", "ana@escola.com", "2ºA", 620, 520],
    ["Bruno Souza", "bruno@escola.com", "3ºB", 890, 980],
    ["Carla Lima", "carla@escola.com", "9ºC", 300, 260],
    ["Diego Melo", "diego@escola.com", "1ºA", 1200, 1400],
  ]
  return demo.map(([name, email, classroom, balance, xp], i) =>
    createUser(
      {
        name,
        email,
        classroom,
        school: DEMO_SCHOOL,
        password: DEMO_PASSWORD,
        avatarId: avatars[i].id,
        avatarUrl: avatars[i].src,
        balance,
        xp,
      },
      newId,
    ),
  )
}

/** Ativos educacionais do simulador. */
export function createDemoSimAssets(): SimAsset[] {
  return [
    {
      id: "SABER",
      name: "Fundo Saber+",
      subtitle: "Baixo risco, retorno médio. Ideal para iniciantes.",
      risk: "Baixo",
      monthlyRate: 0.04,
      color: "#60A5FA",
      borderColor: "#0A2540",
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
      borderColor: "#22C55E",
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
      borderColor: "#A78BFA",
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
      hasCourse: false,
      defaultMonths: 3,
      minInvest: 120,
      redemption: "Ao final do prazo",
    },
  ]
}
