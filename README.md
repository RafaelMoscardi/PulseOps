# PulseOps

Plataforma de monitoramento de APIs e sites — construída para portfólio de Engenharia de Software.

## O que é

O PulseOps permite cadastrar serviços web (URLs de APIs ou sites) e monitora periodicamente se estão online, mede tempo de resposta, registra histórico de verificações, calcula uptime e exibe tudo em um dashboard com gráficos.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Banco de dados | PostgreSQL |
| ORM | Prisma 7 |
| Autenticação | NextAuth v4 (JWT + bcrypt) |
| Estilo | Tailwind CSS |
| Gráficos | Recharts (Fase 4) |
| Monitoramento | node-cron (Fase 3) |

## Funcionalidades (por fase)

- **Fase 1** ✅ — Setup, Prisma, autenticação, dashboard base
- **Fase 2** ✅ — CRUD completo de serviços monitorados
- **Fase 3** — Engine de monitoramento (cron + HTTP checker)
- **Fase 4** — Dashboard com gráficos e uptime
- **Fase 5** — Incidentes e estrutura de notificações

## Rodando localmente

### Pré-requisitos

- Node.js 20+
- PostgreSQL 15+

### Configuração

```bash
# 1. Clone o repositório
git clone <url>
cd PulseOps/pulseops

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL

# 4. (já incluso) Prisma 7 usa @prisma/adapter-pg — já está no package.json

# 5. Gere o client Prisma e execute as migrations
npx prisma generate
npx prisma migrate dev --name init

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` — você será redirecionado para o login.

## Serviços Monitorados (Fase 2)

A tela `/services` permite gerenciar todos os endpoints monitorados:

| Ação | Descrição |
|------|-----------|
| Listar | Exibe nome, URL, status, intervalo e data de criação |
| Criar | Formulário em `/services/new` com validação de URL e intervalo |
| Editar | Formulário em `/services/[id]/edit` com dados pré-preenchidos |
| Excluir | Botão com confirmação inline (evita exclusão acidental) |
| Ativar/Inativar | Toggle direto no card — sem precisar abrir o formulário |

Todas as operações verificam a propriedade do serviço — um usuário nunca acessa dados de outro.

## Estrutura do projeto

```
pulseops/
├── prisma/
│   ├── schema.prisma          # Modelos: User, MonitoredService, CheckResult, Incident, Notification
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login e cadastro (rotas públicas)
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/     # Dashboard principal
│   │   │   └── services/      # CRUD de serviços
│   │   │       ├── page.tsx   # Listagem
│   │   │       ├── new/       # Criar serviço
│   │   │       └── [id]/edit/ # Editar serviço
│   │   ├── actions/
│   │   │   ├── auth.ts        # Server Actions de autenticação
│   │   │   └── services.ts    # Server Actions de CRUD de serviços
│   │   └── api/auth/          # NextAuth route handler
│   ├── components/
│   │   ├── layout/            # Sidebar e Header
│   │   ├── providers/         # SessionProvider
│   │   └── services/
│   │       ├── ServiceCard.tsx    # Card de serviço na listagem
│   │       ├── ServiceForm.tsx    # Formulário reutilizável (criar/editar)
│   │       ├── DeleteButton.tsx   # Botão de exclusão com confirmação
│   │       └── ToggleActive.tsx   # Toggle ativo/inativo com optimistic update
│   ├── lib/
│   │   ├── auth.ts            # Config NextAuth
│   │   └── prisma.ts          # Prisma Client singleton (adapter-pg)
│   ├── types/                 # TypeScript types
│   └── proxy.ts               # Proteção de rotas (Next.js 16)
└── .env.example
```

## Modelos do banco

```
User → MonitoredService → CheckResult
                       → Incident → Notification
User → Notification
```

## Observações técnicas

- **Next.js 16**: o arquivo de proteção de rotas chama-se `proxy.ts` (renomeado de `middleware.ts`)
- **Prisma 7**: o client é gerado em `src/generated/prisma` e importado de `@/generated/prisma`
- **Auth**: sessão JWT via NextAuth, senha hasheada com bcrypt (12 rounds)
- **Segurança**: cada usuário só acessa seus próprios serviços — verificado em todas as queries

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `NEXTAUTH_SECRET` | Secret para assinar os JWTs (gere com `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL base da aplicação |
