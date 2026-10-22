"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Coins,
  Medal,
  ShoppingBag,
  ListTodo,
  LineChartIcon as ChartLine,
  Trophy,
  Wand2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { eduService } from "@/lib/services"
import { getPatent, getNextPatentProgress } from "@/lib/domain"
import { useCurrentUser } from "@/hooks/use-edu"

const quick = [
  { href: "/missions", icon: ListTodo, label: "Missões" },
  { href: "/store", icon: ShoppingBag, label: "Loja" },
  { href: "/simulator", icon: ChartLine, label: "Simulador" },
  { href: "/ranking", icon: Trophy, label: "Ranking" },
  { href: "/profile", icon: Medal, label: "Perfil" },
]

export default function DashboardPage() {
  const user = useCurrentUser()
  const patent = getPatent(user?.xp ?? 0)
  const prog = getNextPatentProgress(user?.xp ?? 0)

  if (!user) return null

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Image
                src={user.avatarUrl || "/placeholder.svg"}
                alt="Avatar"
                width={48}
                height={48}
                className="rounded-[7px] border"
              />
              <span>Bem-vindo(a), {user.name.split(" ")[0]}!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg p-4 border bg-[#F1F1F1] flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  {user.balance}
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/store">
                  Usar <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="rounded-lg p-4 border bg-[#F1F1F1]">
              <p className="text-sm text-muted-foreground">Patente</p>
              <div className="flex items-center gap-2">
                <Medal className="h-5 w-5" style={{ color: patent.fg }} />
                <span className="font-semibold" style={{ color: patent.fg }}>
                  {patent.name}
                </span>
              </div>
              <div className="mt-2">
                <Progress value={prog.percent} />
                <p className="mt-1 text-xs text-muted-foreground">
                  Progresso: {prog.current} / {prog.target} XP
                </p>
              </div>
            </div>
            <div className="rounded-lg p-4 border bg-[#F1F1F1]">
              <p className="text-sm text-muted-foreground">Ações Rápidas</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {quick.slice(0, 4).map((q) => (
                  <Button key={q.href} asChild variant="secondary" className="justify-start">
                    <Link href={q.href}>
                      <q.icon className="h-4 w-4 mr-2" />
                      {q.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Apresentação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ganhe moedas por desempenho, comportamento e participação. Use-as para prêmios e aprenda a investir!
            </p>
            <Button
              onClick={() => eduService.addCoinsDemo(25)}
              className="w-full"
              style={{ backgroundColor: "#0A2540", color: "#FFFFFF" }}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Receber moedas (demo)
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/missions">Começar Missões</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {user.transactions.slice(0, 6).map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{t.description}</span>
                <span className={t.amount >= 0 ? "text-green-600" : "text-red-600"}>
                  {t.amount >= 0 ? "+" : ""}
                  {t.amount}
                </span>
              </div>
            ))}
            {user.transactions.length === 0 && <p className="text-sm text-muted-foreground">Ainda sem atividades.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Material Didático</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-medium text-sm text-blue-900">💡 Dica do Dia</h4>
                <p className="text-xs text-blue-700 mt-1">
                  Diversificar investimentos reduz riscos. Não coloque todas as moedas em um só ativo!
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <h4 className="font-medium text-sm text-green-900">📚 Conceito</h4>
                <p className="text-xs text-green-700 mt-1">
                  <strong>Rentabilidade:</strong> É o ganho obtido sobre o valor investido, expresso em porcentagem.
                </p>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <h4 className="font-medium text-sm text-orange-900">⚠️ Importante</h4>
                <p className="text-xs text-orange-700 mt-1">
                  Investimentos de alto risco podem gerar grandes ganhos, mas também grandes perdas.
                </p>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/simulator">
                <ChartLine className="h-4 w-4 mr-2" />
                Começar a investir
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
