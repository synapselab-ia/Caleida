# Desenvolvimento local — Caleida

**Status:** guia canônico do ambiente local da aplicação

Este documento descreve como preparar, executar e verificar o Caleida localmente sem depender de contexto de chat.

## 1. Pré-requisitos

Use exatamente a linha de runtime definida pelo repositório:

- Node.js `24.20.0` — pinado em `.nvmrc`;
- npm `11.19.0` — declarado em `package.json`;
- Git para clonar o repositório.

Para tarefas que executam migrations/testes de banco, também é necessário:

- cliente PostgreSQL `psql` compatível disponível no `PATH`;
- um PostgreSQL 18 descartável para o gate primário, localmente ou via CI.

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

A suíte SQL valida que o **servidor** usado no gate primário é PostgreSQL 18.x.

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

Para o gate PostgreSQL descartável:

```text
DATABASE_URL_UNPOOLED=<conexão direta para o banco efêmero>
CALEIDA_DB_TARGET=ephemeral
```

Quando uma mudança exigir gate Neon-specific:

```text
DATABASE_URL_UNPOOLED=<conexão direta da branch Neon descartável>
CALEIDA_DB_TARGET=neon-isolated
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

### Gate padrão

Antes de considerar uma mudança pronta para PR, execute a entrada canônica:

```bash
npm run verify
```

Ela reutiliza os scripts existentes e para no primeiro gate inválido, nesta ordem:

```text
db:migrations:check
→ lint
→ typecheck
→ test
→ build
```

`verify` não exige banco nem credencial externa. Ele valida o manifesto de migrations, mas não aplica SQL.

### Gate integrado de banco

Quando a mudança exigir migrations/testes SQL, prepare um PostgreSQL 18 descartável com as variáveis do alvo `ephemeral` e execute:

```bash
npm run verify:db
```

Esse comando reutiliza, em ordem:

```text
db:migrate
→ db:test
```

O lifecycle do PostgreSQL descartável — criar, limpar, reconstruir quando necessário e remover — permanece responsabilidade do ambiente que fornece o banco. A futura CI (`US-PLAT-007`) poderá automatizar esse lifecycle; esta Story não cria workflow permanente.

Quando uma mudança depender de Neon, execute o mesmo `verify:db` em branch Neon descartável com `CALEIDA_DB_TARGET=neon-isolated` depois do gate PostgreSQL portável.

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

### `npm run verify` falha

O comando para no primeiro gate inválido. Execute o script indicado pela saída (`db:migrations:check`, `lint`, `typecheck`, `test` ou `build`), corrija a causa e então repita `npm run verify` do início para provar o conjunto completo.

### Node ou npm em versão diferente

Confirme `node --version` e `npm --version`. Troque para Node `24.20.0` e npm `11.19.0` antes de investigar erros do framework.

### `psql` não encontrado

Esse requisito só afeta `verify:db`/migrations/testes de banco. Instale um cliente PostgreSQL compatível e confirme `psql --version` antes de executar o gate integrado.

### Teste rejeita a versão do servidor

O projeto Neon atual usa PostgreSQL 18. O gate descartável deve usar a mesma versão major; não reduza o teste para fazer outra versão passar.

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

O gate PostgreSQL portável é independente do Neon. Gates Neon-specific seguem `ADR-008` e `database/README.md`.
