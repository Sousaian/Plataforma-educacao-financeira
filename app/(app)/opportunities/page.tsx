import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, MapPin, Calendar, Users, GraduationCap, Briefcase } from "lucide-react"

const opportunities = [
  {
    id: 1,
    title: "Programa Jovem Aprendiz - Banco do Brasil",
    type: "Jovem Aprendiz",
    location: "São Paulo, SP",
    deadline: "15/12/2024",
    description: "Oportunidade para jovens de 14 a 24 anos desenvolverem habilidades no setor bancário.",
    requirements: ["Ensino médio completo ou cursando", "Idade entre 14-24 anos"],
    icon: Briefcase,
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "ENEM 2024 - Inscrições Abertas",
    type: "Vestibular",
    location: "Nacional",
    deadline: "07/06/2024",
    description: "Exame Nacional do Ensino Médio - principal porta de entrada para universidades públicas.",
    requirements: ["Ensino médio completo ou cursando o 3º ano"],
    icon: GraduationCap,
    color: "bg-green-500",
  },
  {
    id: 3,
    title: "Feira de Profissões SENAI",
    type: "Evento",
    location: "Centro de Convenções",
    deadline: "20/11/2024",
    description: "Conheça cursos técnicos e oportunidades na área industrial.",
    requirements: ["Aberto ao público"],
    icon: Users,
    color: "bg-purple-500",
  },
  {
    id: 4,
    title: "Curso Gratuito: Programação Web",
    type: "Curso",
    location: "Online",
    deadline: "30/11/2024",
    description: "Aprenda HTML, CSS e JavaScript do zero. Certificado incluso.",
    requirements: ["Conhecimentos básicos de informática"],
    icon: GraduationCap,
    color: "bg-orange-500",
  },
]

export default function OpportunitiesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "#0A2540" }}>
          Oportunidades
        </h1>
        <p className="text-muted-foreground mt-2">
          Descubra vagas, cursos, eventos e oportunidades para seu futuro profissional
        </p>
      </div>

      <div className="grid gap-6">
        {opportunities.map((opportunity) => {
          const IconComponent = opportunity.icon
          return (
            <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${opportunity.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {opportunity.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Até {opportunity.deadline}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{opportunity.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{opportunity.description}</CardDescription>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Requisitos:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {opportunity.requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full sm:w-auto" style={{ backgroundColor: "#0A2540" }}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Saiba Mais
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
