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

Gates locais:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

O guia completo de clone limpo, variáveis, execução e troubleshooting está em [`docs/LOCAL_DEVELOPMENT.md`](docs/LOCAL_DEVELOPMENT.md).

A aplicação usa Next.js App Router, React, TypeScript strict e Tailwind CSS.

## Documentação

A especificação, arquitetura, decisões e estado operacional canônico estão em `/docs` e `/00_SYSTEM`.

## Deployment

Deploy Vercel não é automático e permanece exclusivamente manual conforme a política canônica do projeto.
