# Neon Non-Production — Caleida

**Status:** provisionado  
**Data de referência:** 2026-09-01  
**Projeto relacionado:** `docs/NEON_PLATFORM.md`  
**Decisões:** `ADR-004` e `ADR-005`

## 1. Recurso remoto canônico

A fundação Neon non-production do Caleida existe na organização conectada.

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
Região: aws-us-east-1
PostgreSQL: 18
Branch baseline: main
Branch ID: br-restless-cherry-awpcwy6r
Database default: neondb
```

Os IDs acima identificam recursos e **não são credenciais**. Senhas, connection strings e API keys nunca devem ser registradas neste arquivo.

## 2. Papel do branch `main`

No projeto Neon `caleida-nonprod`, o branch `main` é a baseline canônica de non-production/staging.

Ele não deve ser confundido com a branch Git `main`.

Responsabilidades:

- receber somente mudanças persistentes de banco aprovadas e versionadas por migrations;
- representar o estado integrado de non-production;
- servir de referência para branches descartáveis de desenvolvimento/verificação quando o tooling de branching estiver disponível;
- nunca receber experimentos destrutivos diretamente.

Não foi criado um branch adicional chamado `staging` nesta Story. O branch default criado pelo Neon foi adotado como baseline canônica para evitar uma camada nominal sem benefício técnico.

## 3. Convenção de branches temporárias

Quando a Story de migrations introduzir o tooling executável, use branches curtas e descartáveis, preferencialmente:

```text
verify/<task-id>
dev/<task-id>
```

Regras:

- derivar da baseline non-production adequada;
- aplicar migrations/testes somente na branch isolada durante verificação destrutiva;
- remover a branch após a tarefa;
- não usar Production como parent operacional de testes;
- não manter branches temporárias como ambientes permanentes.

## 4. Estado do conector Neon em 2026-09-01

O projeto foi provisionado normalmente pelo conector Neon.

As ações de criação/descrição de branch e execução SQL apresentam, nesta sessão, uma inconsistência de contrato entre o schema público do tool (`projectId`, `branchName`, `branchId`) e o backend, que exige nomes snake_case. Por isso:

- nenhuma branch temporária foi criada artificialmente por workaround;
- nenhum SQL foi executado;
- nenhuma migration foi aplicada;
- a próxima Story deve revalidar o tooling antes de depender de branches descartáveis.

Se branching isolado continuar indisponível, uma Story de migration que dependa dessa verificação deve ficar `BLOCKED`; não se deve usar a baseline `main` como laboratório destrutivo.

## 5. Credenciais e connection strings

Nenhum valor real é versionado.

Quando a aplicação/tooling passar a usar o banco, o contrato esperado é:

- `DATABASE_URL` — conexão pooled para runtime server-side quando apropriado;
- `DATABASE_URL_UNPOOLED` — conexão direta para migrations/manutenção que exigem sessão direta;
- Neon API key — somente para automação administrativa explicitamente autorizada; nunca no browser;
- credenciais de owner/admin — somente em contexto administrativo confiável e nunca como prova de autorização de usuário.

No estado atual, a aplicação continua sem exigir essas variáveis para iniciar localmente.

## 6. Serviços deliberadamente não provisionados

Nesta Story não foram provisionados:

- Neon Auth;
- Neon Data API;
- Object Storage;
- projeto Neon de Production;
- schema/tabelas/RLS de produto;
- integração do Next.js com o banco;
- CI permanente;
- Vercel/deployment.

## 7. Production

`caleida-production` **não existe por decisão deliberada nesta fase**.

Production será um projeto Neon separado quando uma Story futura exigir ambiente real de produção. Non-production não deve compartilhar secrets, usuários ou dados reais com Production.

## 8. Verificação desta fundação

Confirmado via Neon conectado:

- projeto `caleida-nonprod`: `PASS`;
- região `aws-us-east-1`: `PASS`;
- PostgreSQL 18: `PASS`;
- branch default `main` pronta: `PASS`;
- ausência de SQL/migrations executados nesta Story: `PASS`;
- Auth/Data API/Storage não provisionados: `PASS`;
- Production não provisionada: `PASS`;
- secrets versionados: `PASS — nenhum`;
- criação de branch adicional `staging`: `SKIPPED — baseline default main adotada`;
- criação de branch descartável de prova: `BLOCKED — inconsistência atual do conector; deve ser revalidada antes de US-PLAT-005 executar migrations`.
