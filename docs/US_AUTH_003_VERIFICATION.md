# Verificação — US-AUTH-003

**Story:** `US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada`  
**Issue:** `#47`  
**PR:** `#48`  
**Branch Git:** `feat/us-auth-003-entry-control-model`

## Escopo verificado

- convites únicos e reutilizáveis;
- validade, capacidade e destinatário opcional;
- estados canônicos de convite;
- solicitações/lista de espera com decisão e arquivamento;
- auditoria mínima sem secrets;
- token persistido somente como digest;
- consumo concorrente serializado no PostgreSQL;
- ACLs privadas por padrão;
- nenhuma conta, e-mail, Data API ou superfície client-side criada.

## CI inicial — `33771618637`

Head: `ced1c0c5180452f50453762f11c55365b0335ef8`.

Resultados antes da falha:

- runtime Node/npm: `PASS`;
- `npm ci`: `PASS`, zero vulnerabilidades;
- `npm run verify`: `PASS`;
- testes Node: `55/55 PASS`;
- build Next.js: `PASS`;
- PostgreSQL server 18: `PASS`;
- migrations `000001`, `000002`, `000003`: `PASS`.

O gate de banco falhou no teste `000004_entry_control.sql` por uma ambiguidade do próprio teste: a variável PL/pgSQL `invitation_id` tinha o mesmo nome da coluna `invitation_uses.invitation_id`.

Erro observado:

```text
column reference "invitation_id" is ambiguous
```

A migration já havia aplicado corretamente. O teste foi corrigido renomeando as variáveis para identificadores sem colisão, sem alterar constraints, máquinas de estado ou política de concorrência.

## CI corrigido — `33771989432`

Head: `93a85a0bf2bb72953e966ef364020b34073d1c5e`.

Resultado final técnico:

- runtime Node `24.20.0`: `PASS`;
- npm `11.19.0`: `PASS`;
- `npm ci`: `PASS`, auditoria npm com zero vulnerabilidades;
- `npm run verify`: `PASS`;
- testes Node: `55/55 PASS`;
- build Next.js 16.3.3: `PASS`;
- PostgreSQL server major 18: `PASS`;
- `npm run verify:db`: `PASS`;
- migration `000001_migration_ledger.sql`: `PASS`;
- migration `000002_product_authorization.sql`: `PASS`;
- migration `000003_entry_control.sql`: `PASS`;
- teste `000001_migration_baseline.sql`: `PASS`;
- teste `000002_postgres_18.sql`: `PASS`;
- teste `000003_product_authorization.sql`: `PASS`;
- teste `000004_entry_control.sql`: `PASS`;
- teste concorrente `000005_invitation_concurrency.mjs`: `PASS`.

O teste concorrente registrou explicitamente:

```text
concorrência de convite: exatamente 1/2 sessões consumiu o uso único
```

Isso prova que duas sessões `psql` independentes disputando simultaneamente um convite de capacidade 1 não excedem o limite.

## Checksum canônico

Validado pelo runner:

```text
000003_entry_control.sql
503700640a81cf41dfe56a0abe70fc581b9c64d8e9ad6585cbcb55d4751b7c5f
```

## Gate Neon-specific

`SKIPPED` corretamente conforme `ADR-008`.

Motivo:

- a migration usa SQL PostgreSQL portável;
- UUIDs são tratados como identificadores opacos;
- não consulta `neon_auth`;
- não depende de role/helper gerenciado;
- não habilita Neon Data API;
- não depende de branching, pooling ou compute específico do Neon.

Criar uma branch Neon descartável sem dependência específica teria apenas duplicado o gate PostgreSQL.

A branch descartável anterior `verify-us-auth-002` foi removida antes da Story após autorização explícita do usuário. Nenhuma nova branch Neon descartável foi criada em US-AUTH-003.

## Promoção para baseline non-production

Antes da promoção, `caleida-nonprod/main` continha somente as migrations `000001` e `000002`.

Depois do CI corrigido em `PASS` e da revisão técnica do diff, `000003_entry_control.sql` foi aplicada deliberadamente à baseline e registrada no migration ledger com o checksum acima.

Estado confirmado depois da promoção:

```text
migrations: 000001 + 000002 + 000003
auth users: 0
product roles: 0
role_changes: 0
invitations: 0
invitation_uses: 0
access_requests: 0
entry_events: 0
```

Nenhum fixture ou dado sintético do CI foi copiado para a baseline.

## Matriz funcional/adversarial

- digest inválido: `DENIED` por constraint;
- convite reutilizável com capacidade 1: `DENIED` por constraint;
- convite único: exatamente um consumo permitido;
- novo consumo após esgotamento: `DENIED`;
- convite reutilizável: consumo permitido até `max_uses`, nunca além;
- destinatário divergente: `DENIED`;
- destinatário equivalente após normalização: `PASS`;
- convite expirado: `DENIED` + estado `expirado` materializado;
- convite revogado: `DENIED`;
- solicitação ativa duplicada para mesmo e-mail: `DENIED`;
- aprovação: `PASS` com ator/motivo;
- repetição da mesma decisão: idempotente;
- solicitação decidida voltando para outro resultado: `DENIED`;
- arquivamento: `PASS`;
- nova solicitação após arquivamento: `PASS`;
- papel PostgreSQL não privilegiado lendo tabelas/executando funções: `DENIED`;
- duas sessões concorrentes em convite único: exatamente uma consome.

## Gates complementares

- coerência CAP-02 / CAP-35 / ADR-004 / ADR-005 / ADR-008: `PASS`;
- token de convite em texto puro no banco: `PASS — ausente`;
- auditoria com senha/token/cookie/session payload: `PASS — ausente`;
- browser real: `SKIPPED — não existe fluxo/UI funcional nesta Story`;
- Data API: `SKIPPED/NON-GOAL`;
- e-mail/SMTP: `SKIPPED/NON-GOAL`;
- signup/criação de conta: `SKIPPED/NON-GOAL`;
- Production Neon: `SKIPPED/NON-GOAL`;
- deployment Vercel: `SKIPPED/PROIBIDO` conforme `ADR-007`.

## Porta para a Story seguinte

US-AUTH-003 encerra somente o modelo persistente de entrada.

A próxima Story canônica é:

> `US-AUTH-004 — Selecionar e integrar e-mail transacional non-production`

US-AUTH-005 continuará responsável por aplicar convite/aprovação ao signup real e vincular a futura conta.