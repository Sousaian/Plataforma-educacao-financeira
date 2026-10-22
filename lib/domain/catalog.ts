import type { AvatarOption, Mission, StoreItem } from "./types"

// Catálogos estáticos (não persistidos)

export function listDefaultAvatars(): AvatarOption[] {
  return [
    { id: "av1", src: "/images/avatars/avatar-1.png", alt: "Avatar 1", free: true },
    { id: "av2", src: "/images/avatars/avatar-2.png", alt: "Avatar 2", free: true },
    { id: "av3", src: "/images/avatars/avatar-3.png", alt: "Avatar 3", free: true },
    { id: "av4", src: "/images/avatars/avatar-4.png", alt: "Avatar 4", free: true },
    { id: "av5", src: "/images/avatars/avatar-5.png", alt: "Avatar 5", free: true },
    { id: "av6", src: "/images/avatars/avatar-6.png", alt: "Avatar 6", free: true },
  ]
}

export function listAvatarOptions(): AvatarOption[] {
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

export function listStoreItems(): StoreItem[] {
  return [
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
      name: "Capacete de Bombeiro",
      description: "Personalização de avatar",
      category: "avatar",
      price: 90,
      imageUrl: "/images/store/capaBomb.png",
      requiredPatentIndex: 3,
      requiredPatentName: "Ouro",
    },
    {
      id: "st-danca",
      name: "Emoji Gatinho Irado!",
      description: "Emoji para seu avatar",
      category: "avatar",
      price: 60,
      imageUrl: "/images/store/gatinhofofo.gif",
    },
  ]
}

export function defaultMissions(newId: () => string): Mission[] {
  return [
    {
      id: newId(),
      title: "Prova de Matemática",
      description: "Entregar prova com dedicação e mostrar todo o desenvolvimento dos cálculos",
      reward: 50,
      completed: false,
      dueDate: "15/12/2024",
      mandatory: true,
    },
    {
      id: newId(),
      title: "Comportamento",
      description: "Manter bom comportamento durante toda a semana sem advertências",
      reward: 20,
      completed: false,
      dueDate: "Toda semana",
      mandatory: false,
    },
    {
      id: newId(),
      title: "Simulado",
      description: "Participar do simulado de sábado e responder todas as questões com atenção",
      reward: 30,
      completed: false,
      dueDate: "21/12/2024",
      mandatory: true,
    },
    {
      id: newId(),
      title: "Projeto",
      description: "Entregar projeto interdisciplinar sobre sustentabilidade com pesquisa completa",
      reward: 60,
      completed: false,
      dueDate: "30/12/2024",
      mandatory: true,
    },
    {
      id: newId(),
      title: "Participação em Aula",
      description: "Participar ativamente das discussões em sala durante a semana",
      reward: 15,
      completed: false,
      dueDate: "Toda semana",
      mandatory: false,
    },
  ]
}
