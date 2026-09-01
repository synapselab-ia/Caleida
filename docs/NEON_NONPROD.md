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
- servir de referência para branches descartáveis de desenvolvimento/verificação;
- nunca receber experimentos destrutivos diretamente.

## 3. Convenção de branches temporárias

Use branches curtas e descartáveis:

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

A documentação Neon vigente continua tratando branches como ambientes isolados adequados para testes e desenvolvimento branch-first.

## 4. Estado do conector Neon em US-PLAT-005

A leitura/provisionamento do projeto funciona normalmente pelo conector Neon.

A ação exposta de criação de branch, porém, continua com incompatibilidade entre o contrato público do wrapper e o backend:

- wrapper expõe `projectId` e `branchName`;
- backend rejeita essas chaves e solicita `project_id` e `branch_name`;
- o wrapper não permite enviar as chaves snake_case.

A tentativa de criar `verify/us-plat-005-baseline` falhou antes de criar qualquer recurso.

Consequências de segurança:

- nenhum DDL de US-PLAT-005 foi executado remotamente;
- a baseline `main` não foi usada como laboratório;
- a infraestrutura Git de migrations/testes pode ser desenvolvida e validada offline;
- a prova remota e a conclusão da Story permanecem bloqueadas até que uma branch descartável possa ser criada de forma suportada.

Não usar credenciais/API paralelas como workaround apenas para contornar o conector.

## 5. Credenciais e connection strings

Nenhum valor real é versionado.

Contrato atual:

- `DATABASE_URL` — conexão pooled para runtime server-side quando apropriado;
- `DATABASE_URL_UNPOOLED` — conexão direta para migrations/manutenção;
- `CALEIDA_DB_TARGET` — guardrail operacional (`isolated` ou promoção explícita `baseline`);
- `CALEIDA_NEON_BRANCH_ID` — ID não secreto do branch-alvo, usado pelo guardrail;
- `CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES` — segundo sinal obrigatório para promoção deliberada à baseline.

Neon API key e credenciais owner/admin continuam fora do Git e do browser.

## 6. Serviços deliberadamente não provisionados

Ainda não foram provisionados:

- Neon Auth;
- Neon Data API;
- Object Storage;
- projeto Neon de Production;
- schema funcional/tabelas/RLS de produto;
- integração do Next.js com o banco;
- CI permanente;
- Vercel/deployment.

## 7. Production

`caleida-production` **não existe por decisão deliberada nesta fase**.

Production será um projeto Neon separado quando uma Story futura exigir ambiente real de produção. Non-production não deve compartilhar secrets, usuários ou dados reais com Production.
