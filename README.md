# EduInvest — Plataforma de Educação Financeira

Plataforma gamificada de educação financeira para alunos do ensino fundamental e médio. O aluno ganha moedas
cumprindo missões escolares, troca moedas por prêmios na loja, sobe de patente com XP e aprende a investir em um
simulador com ativos educacionais — tudo com moedas fictícias, sem dinheiro real.

**Demo:** https://v0-educational-gamification-platfor-seven.vercel.app

> Usuários demo (senha `1234`): `ana@escola.com`, `bruno@escola.com`, `carla@escola.com`, `diego@escola.com`.

O projeto nasceu no [v0.app](https://v0.app) e foi reorganizado depois (camadas de domínio/dados, testes e CI).

## Funcionalidades

- **Login e cadastro** com escolha de avatar inicial.
- **Dashboard** com saldo, patente, progresso de XP, ações rápidas e atividades recentes.
- **Missões** (obrigatórias e opcionais) que dão moedas e XP ao serem concluídas.
- **Loja** de prêmios físicos, imateriais e de personalização; alguns itens exigem patente mínima.
- **Avatar**: troca do avatar equipado.
- **Patentes**: Bronze → Cobre → Prata → Ouro → Diamante → Platina, conforme o XP.
- **Simulador de investimentos**: 4 ativos (risco baixo, médio, alto e variável), projeção com juros compostos,
  carteira de investimentos ativos, resgate no vencimento e histórico.
- **Conquistas**: primeiro investimento, projeção ≥ 10% e rendimento ≥ 10%.
- **Ranking** da turma (mesma escola e turma).
- **Oportunidades**: vagas, cursos e eventos.

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + componentes [shadcn/ui](https://ui.shadcn.com) (Radix UI) + lucide-react
- Persistência no `localStorage` do navegador (sem backend)
- Vitest + Testing Library (jsdom) para testes
- ESLint (`next/core-web-vitals` + `next/typescript`)
- pnpm

## Como rodar

Pré-requisitos: Node.js 22+ e pnpm (9 ou superior).

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Outros scripts:

| Comando          | O que faz                                   |
| ---------------- | ------------------------------------------- |
| `pnpm build`     | build de produção (valida tipos e lint)     |
| `pnpm start`     | sobe o build de produção                    |
| `pnpm lint`      | ESLint                                      |
| `pnpm typecheck` | `tsc --noEmit`                              |
| `pnpm test`      | testes (Vitest)                             |

Para "zerar" os dados no navegador, limpe as chaves `edu:*` do `localStorage` (DevTools → Application).

## Estrutura de pastas

```
app/
  (auth)/login, (auth)/signup     páginas públicas
  (app)/…                         páginas autenticadas (dashboard, missions, store, avatar,
                                  profile, ranking, opportunities, simulator)
components/
  ui/                             componentes shadcn/ui
  simulator/                      componentes + hook useSimulator da página de investimentos
  app-sidebar.tsx, app-topbar.tsx, investment-chart.tsx
hooks/
  use-edu.ts                      useEduSnapshot / useCurrentUser / useRanking
lib/
  domain/                         regras de negócio puras (sem I/O)
  data/                           armazenamento, repositório e seed demo
  services/                       fachada usada pelas páginas (eduService)
tests/                            testes Vitest
```

## Arquitetura da camada de dados

```
Página / componente
   │  useCurrentUser(), useEduSnapshot()        (leitura reativa)
   │  eduService.buyItem(), .login(), …         (ações)
   ▼
lib/services/edu-service.ts   — fachada: carrega dados, aplica regra, persiste, notifica
   │                    │
   ▼                    ▼
lib/domain/*           lib/data/repository.ts  (EduRepository)
regras puras            │
                        ▼
                  lib/data/storage.ts  (KeyValueStorage)
                   ├─ createLocalStorage()   → navegador
                   └─ createMemoryStorage()  → testes
```

- **`lib/domain`** — tipos e funções puras: simulação de rendimento (`simulateReturn`), maturidade e resgate
  (`withdrawMatured`), investimento (`confirmInvestment`), patentes/XP, compra na loja (`buyItem`), missões
  (`completeMission`), cadastro (`signupUser`) e ranking (`computeRanking`). Não acessam `localStorage`, `window`
  nem o relógio: recebem um `DomainContext` com `now` e `newId` e devolvem um novo objeto (`Result`).
- **`lib/data`** — `EduRepository` lê/grava usuários, usuário logado e ativos do simulador. A implementação atual usa
  as mesmas chaves de antes (`edu:users`, `edu:current`, `edu:assets`, `edu:tick`), então quem já usa o app não perde
  dados. O seed demo fica em `lib/data/seed.ts` e só é gravado quando a chave não existe.
- **`lib/services`** — `createEduService({ repository, now, newId })` é a fachada que as páginas usam. Ela mantém um
  snapshot imutável que só muda quando os dados mudam e expõe `subscribe/getSnapshot`, consumidos por
  `useSyncExternalStore` em `hooks/use-edu.ts`. No servidor (SSR) o hook usa um snapshot vazio, o que evita mismatch de
  hidratação e o loop de re-render que existia com `subscribeDB` + `useEffect`. Alterações feitas em outra aba
  chegam pelo evento `storage`.

### Fase 2: plugar um backend real

1. Criar uma implementação de `EduRepository` que fale com a API/banco (ex.: Supabase, Postgres via route handlers).
2. Como a interface atual é síncrona, a forma mais simples é manter um cache em memória no cliente: carregar os dados
   do usuário logado no início (ou via `fetch` em um provider) e gravar de forma assíncrona; ou tornar os métodos do
   repositório e da fachada `async` (as páginas já chamam só a fachada, então a mudança fica concentrada nela e nos
   hooks).
3. Autenticação e regras sensíveis (saldo, compras, resgates) devem passar a ser validadas no servidor; as funções de
   `lib/domain` podem ser reutilizadas lá sem alteração, já que são puras.
4. Os testes da fachada continuam valendo: basta trocar o repositório em memória por um fake da nova implementação.

## Testes

```bash
pnpm test
```

- `tests/domain` — simulação (valores de referência da implementação original), resgate/maturidade, conquistas,
  loja (saldo, patente mínima, item repetido), missões, avatar, cadastro e ranking.
- `tests/data` — repositório sobre o storage em memória (chaves, seed, JSON corrompido, logout).
- `tests/services` — fachada com storage em memória, incluindo o fluxo completo
  login → missão → compra → investimento → resgate.
- `tests/hooks` — `useCurrentUser` em jsdom com `localStorage` real (renderizações estáveis).

## CI e deploy

- **CI** (`.github/workflows/ci.yml`): em push na `main` e em pull requests roda `pnpm install --frozen-lockfile`,
  `lint`, `typecheck`, `test` e `build`.
- **Deploy**: a Vercel publica automaticamente a branch `main` (e gera previews de branches/PRs pela integração Git).
  O app é 100% estático/client-side, sem variáveis de ambiente.
