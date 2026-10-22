"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Mail, Lock, Users, School } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { eduService } from "@/lib/services"
import { listDefaultAvatars, type AvatarOption } from "@/lib/domain"
import { useToast } from "@/hooks/use-toast"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [classroom, setClassroom] = useState("")
  const [school, setSchool] = useState("")
  const [password, setPassword] = useState("")
  const [avatarId, setAvatarId] = useState<string>("")
  const [avatars, setAvatars] = useState<AvatarOption[]>([])

  useEffect(() => {
    setAvatars(listDefaultAvatars())
    if (!avatarId && listDefaultAvatars().length > 0) {
      setAvatarId(listDefaultAvatars()[0].id)
    }
  }, [avatarId])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = eduService.signup({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      classroom: classroom.trim(),
      school: school.trim(), // Include school in signup
      password,
      avatarId,
    })
    if (ok) {
      toast({ title: "Conta criada!", description: "Bem-vindo(a) à EduInvest." })
      router.replace("/dashboard")
    } else {
      toast({ variant: "destructive", title: "Erro", description: "E-mail já cadastrado." })
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F1F1F1]">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl" style={{ color: "#0A2540" }}>
            Cadastre-se
          </CardTitle>
          <CardDescription>Crie sua conta e escolha um avatar inicial</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">Escola</Label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="school"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="pl-9"
                    placeholder="Ex: Escola Estadual Dom Pedro II"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="classroom">Turma</Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="classroom"
                    required
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    className="pl-9"
                    placeholder="Ex: 2ºA"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    minLength={4}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" style={{ backgroundColor: "#0A2540", color: "#FFFFFF" }}>
                Criar conta
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Já possui conta?{" "}
                <Link href="/login" className="underline font-medium" style={{ color: "#0A2540" }}>
                  Entrar
                </Link>
              </p>
            </div>
            <div className="space-y-3">
              <Label>Escolha seu Avatar</Label>
              <div className="grid grid-cols-3 gap-3">
                {avatars.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAvatarId(a.id)}
                    className={`rounded-lg border p-2 hover:shadow transition ${
                      avatarId === a.id ? "ring-2 ring-[#0A2540] border-[#0A2540]" : "border-border"
                    }`}
                    aria-pressed={avatarId === a.id}
                    aria-label={`Selecionar avatar ${a.alt}`}
                  >
                    <Image
                      src={a.src || "/placeholder.svg"}
                      alt={a.alt}
                      width={120}
                      height={120}
                      className="w-full h-auto rounded-md"
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Você poderá personalizar seu personagem depois.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
