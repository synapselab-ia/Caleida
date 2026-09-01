# Caleida

Plataforma pública para organização, acompanhamento e descoberta cultural.

## Desenvolvimento local

Requisitos:

- Node.js 24.20.0 (`.nvmrc`);
- npm 11.19.0.

Setup mínimo:

```bash
npm ci
npm run dev
```

Gate padrão do repositório:

```bash
npm run verify
```

Esse comando valida o manifesto de migrations e executa lint, typecheck, testes e build em ordem determinística.

O gate integrado de banco permanece explícito e separado porque exige PostgreSQL 18 e variáveis de ambiente apropriadas:

```bash
npm run verify:db
```

O guia completo de clone limpo, variáveis, execução, gates e troubleshooting está em [`docs/LOCAL_DEVELOPMENT.md`](docs/LOCAL_DEVELOPMENT.md).

A aplicação usa Next.js App Router, React, TypeScript strict e Tailwind CSS.

## Documentação

A especificação, arquitetura, decisões e estado operacional canônico estão em `/docs` e `/00_SYSTEM`.

## Deployment

Deploy Vercel não é automático e permanece exclusivamente manual conforme a política canônica do projeto.
