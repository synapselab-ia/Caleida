# Integração contínua — Caleida

**Status:** CI permanente ativo  
**Workflow:** `.github/workflows/ci.yml`

## Objetivo

O CI valida a qualidade técnica do repositório. Ele não publica Preview ou Production e não possui responsabilidade de CD.

## Triggers

O workflow executa em:

- `pull_request` direcionada à `main`;
- `push` integrado na `main`.

## Permissões

O `GITHUB_TOKEN` recebe somente:

```yaml
permissions:
  contents: read
```

Nenhum secret externo é necessário para os gates atuais.

## Runtime e instalação

O workflow usa:

- `ubuntu-latest`;
- `actions/checkout@v7`;
- `actions/setup-node@v7` lendo `.nvmrc`;
- Node `24.20.0`;
- npm `11.19.0`;
- `npm ci`;
- cache de package manager desabilitado enquanto não houver benefício demonstrado.

O job falha se Node ou npm divergirem do contrato versionado.

## Gate padrão

```bash
npm run verify
```

Esse comando executa a sequência canônica já definida no `package.json`:

```text
db:migrations:check
→ lint
→ typecheck
→ test
→ build
```

O YAML não replica essa lógica interna.

## Gate PostgreSQL portável

O mesmo job provisiona um service container:

```text
postgres:18
```

Depois confirma que o servidor é PostgreSQL 18.x e executa:

```bash
npm run verify:db
```

O banco é efêmero e usa somente credenciais locais do próprio service container. Nenhuma credencial Neon é utilizada.

O alvo é explicitamente:

```text
CALEIDA_DB_TARGET=ephemeral
```

Gates Neon-specific continuam regidos por `ADR-008` e não são substituídos por este workflow quando uma mudança realmente depender do serviço Neon.

## Segurança e deployment

O CI não contém:

- Vercel CLI/API;
- deploy hooks;
- tokens Vercel;
- `id-token: write`;
- jobs de Preview/Production;
- promote, rollback ou redeploy.

Deployment continua exclusivamente humano/manual conforme `ADR-007` e `00_SYSTEM/DEPLOYMENT_POLICY.md`.

`tests/ci-contract.test.mjs` protege automaticamente os elementos centrais desse contrato.

## Diagnóstico

Quando o CI falhar:

1. identificar o primeiro step em `FAIL`;
2. reproduzir pelo comando canônico equivalente (`npm run verify` ou `npm run verify:db`);
3. corrigir a causa, sem reduzir gates para obter verde;
4. reexecutar o CI pela nova revisão da branch/PR.

Falha do CI não autoriza deployment nem uso da baseline Neon como laboratório.
