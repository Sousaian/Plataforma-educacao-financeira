"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/mock-db"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, GraduationCap, Briefcase, Users, Calendar } from "lucide-react"

const newsItems = [
  {
    id: 1,
    title: "ENEM 2024 - Inscrições Abertas",
    description: "Período de inscrições até 15 de dezembro. Não perca o prazo!",
    category: "Vestibular",
    icon: GraduationCap,
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Programa Jovem Aprendiz - Banco do Brasil",
    description: "Vagas abertas para estudantes de 14 a 24 anos. Salário inicial R$ 800.",
    category: "Jovem Aprendiz",
    icon: Briefcase,
    color: "bg-green-500",
  },
  {
    id: 3,
    title: "Feira de Profissões 2024",
    description: "Evento estadual com mais de 50 universidades. Data: 20/12/2024.",
    category: "Evento",
    icon: Users,
    color: "bg-purple-500",
  },
  {
    id: 4,
    title: "Indústria 4.0 - Cursos Gratuitos",
    description: "SENAI oferece cursos de programação e robótica. Inscrições abertas.",
    category: "Indústria",
    icon: Calendar,
    color: "bg-orange-500",
  },
]

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState(getCurrentUser())
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (!user) {
      router.replace("/login")
    }
  }, [user, router])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % newsItems.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % newsItems.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + newsItems.length) % newsItems.length)
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#0A2540] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Plataforma Educacional</h1>
          <p className="text-blue-200">Bem-vindo, {user.name}!</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Carousel */}
        <div className="relative">
          <h2 className="text-xl font-semibold text-[#0A2540] mb-4">Oportunidades e Eventos</h2>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-64 flex items-center">
                <button
                  onClick={prevSlide}
                  className="absolute left-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#0A2540]" />
                </button>

                <div className="w-full px-16">
                  {newsItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.id}
                        className={`transition-all duration-500 ${
                          index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute inset-0"
                        }`}
                      >
                        <div className="flex items-center space-x-6 p-8">
                          <div className={`${item.color} p-4 rounded-full`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-gray-500 mb-1">{item.category}</div>
                            <h3 className="text-xl font-semibold text-[#0A2540] mb-2">{item.title}</h3>
                            <p className="text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button
                  onClick={nextSlide}
                  className="absolute right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-[#0A2540]" />
                </button>
              </div>

              {/* Dots indicator */}
              <div className="flex justify-center space-x-2 p-4">
                {newsItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide ? "bg-[#0A2540]" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* School Info */}
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-[#0A2540] rounded-full flex items-center justify-center mx-auto">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#0A2540] mb-2">Escola Estadual Dom Pedro II</h3>
                <p className="text-gray-600 mb-1">Turma: {user.classroom}</p>
                <p className="text-sm text-gray-500">
                  Transformando educação através da gamificação e educação financeira
                </p>
              </div>
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-[#0A2540] hover:bg-[#0A2540]/90 text-white px-8 py-2"
              >
                Acessar Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
