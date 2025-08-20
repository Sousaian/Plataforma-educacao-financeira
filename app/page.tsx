"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/mock-db"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)

    if (!currentUser) {
      router.replace("/login")
    }
  }, [router])

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

      <div className="max-w-4xl mx-auto p-6">
        {/* School Info */}
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-[#0A2540] rounded-full flex items-center justify-center mx-auto">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#0A2540] mb-2">{user.school}</h3>
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
