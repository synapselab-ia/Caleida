# Desenvolvimento local — Caleida

**Status:** guia canônico do ambiente local da aplicação

Este documento descreve como preparar, executar e verificar o Caleida localmente sem depender de contexto de chat.

## 1. Pré-requisitos

Use exatamente a linha de runtime definida pelo repositório:

- Node.js `24.20.0` — pinado em `.nvmrc`;
- npm `11.19.0` — declarado em `package.json`;
- Git para clonar o repositório.

Para tarefas que executam migrations/testes de banco, também é necessário:

- PostgreSQL client `psql` 18.x disponível no `PATH`.

A aplicação web continua podendo iniciar sem `psql` e sem conexão com banco.

Antes de instalar dependências, confirme:

```bash
node --version
npm --version
```

Resultado esperado:

```text
v24.20.0
11.19.0
```

Para trabalho de banco, confirme também:

```bash
psql --version
```

## 2. Clone limpo e instalação

```bash
git clone https://github.com/synapselab-ia/Caleida.git
cd Caleida
npm ci
```

`npm ci` é o comando canônico de instalação porque usa `package-lock.json` sem recalcular a árvore de dependências.

Não use `npm install` apenas para contornar divergência de lockfile. Mudanças de dependência devem ser deliberadas, revisadas e versionar o lockfile correspondente.

## 3. Variáveis de ambiente

A aplicação ainda não exige nenhuma variável de ambiente para iniciar.

`.env.example` é o contrato versionado. Regras:

- nunca colocar secret ou credencial real em `.env.example`;
- arquivos `.env*` locais são ignorados pelo Git, com exceção de `.env.example`;
- nomes com `NEXT_PUBLIC_` são públicos no browser e só podem conter valores deliberadamente públicos;
- `DATABASE_URL`/`DATABASE_URL_UNPOOLED` são server-side e nunca usam `NEXT_PUBLIC_`.

Para tooling de banco em branch isolada, o contrato é:

```text
DATABASE_URL_UNPOOLED=<direct connection string da branch descartável>
CALEIDA_DB_TARGET=isolated
CALEIDA_NEON_BRANCH_ID=<branch id descartável>
```

A promoção deliberada para a baseline non-production exige os guardrails adicionais documentados em `database/README.md`.

## 4. Executar a aplicação

```bash
npm run dev
```

Por padrão, o Next.js inicia em:

```text
http://localhost:3000
```

Para usar outra porta quando `3000` estiver ocupada:

```bash
npm run dev -- -p 3001
```

Interrompa o servidor com `Ctrl+C`.

## 5. Gates locais

Antes de considerar uma mudança pronta para PR, execute:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Para validar apenas o manifesto de migrations, sem banco:

```bash
npm run db:migrations:check
```

Quando houver uma branch Neon descartável e credenciais locais corretas:

```bash
npm run db:migrate
npm run db:test
```

Nunca use a baseline Neon `main` como laboratório destrutivo.

## 6. Estrutura mínima relevante

```text
src/app/               App Router
public/                assets públicos versionados
tests/                 testes automatizados
database/migrations/   migrations SQL versionadas
database/scripts/      runner/guardrails de banco
database/tests/        testes SQL de banco/RLS
.env.example           contrato seguro de variáveis
.nvmrc                 versão Node canônica
package.json            scripts/runtime/dependências
package-lock.json       resolução canônica do npm
```

O contrato completo de banco está em `database/README.md`.

## 7. Troubleshooting

### Node ou npm em versão diferente

Confirme `node --version` e `npm --version`. Troque para Node `24.20.0` e npm `11.19.0` antes de investigar erros do framework.

### `psql` não encontrado

Esse requisito só afeta migrations/testes de banco. Instale PostgreSQL client 18.x e confirme `psql --version` antes de executar `db:migrate`/`db:test`.

### `npm ci` falha por divergência do lockfile

Parta de uma árvore Git limpa e confirme que `package.json` e `package-lock.json` vieram do mesmo commit. Não regenere o lockfile sem uma mudança deliberada de dependências.

### Registry npm inacessível

Verifique conectividade e a configuração atual com:

```bash
npm config get registry
npm ping
```

Não versionar tokens, proxies privados ou credenciais para resolver acesso local.

### Porta 3000 ocupada

Use outra porta:

```bash
npm run dev -- -p 3001
```

### Cache local inconsistente

Pare o servidor, remova apenas os artefatos gerados (`.next/`) e execute novamente `npm run dev` ou `npm run build`. Não apague arquivos versionados para resolver cache.

## 8. Limites atuais

Existe um projeto Neon non-production, mas a aplicação ainda não depende dele para iniciar.

Ainda não estão implementados:

- schema funcional do produto;
- Neon Auth/Data API na aplicação;
- Object Storage;
- Production;
- Vercel project/integration;
- Preview ou Production deployment.

Migrations/testes remotos só podem ser executados em branch isolada, conforme `database/README.md` e o `CHECKPOINT`.
