# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 2 — Acesso controlado / EPIC-02 em andamento  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada`  
**LAST_COMPLETED_ISSUE:** `#47`  
**LAST_COMPLETED_PR:** `#48`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**ACTIVE_PR:** none  
**NEXT_ACTION:** `US-AUTH-004 — Selecionar e integrar e-mail transacional non-production`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado real no GitHub e Neon antes de agir. Não refaça Stories concluídas e não execute deployment Vercel.

## Incrementos concluídos

### Incremento 0 — Fundação executável

**CONCLUÍDO.** Evidência: `docs/INCREMENT_0_VALIDATION.md`.

### Incremento 1 — Fundação visual / EPIC-01

**CONCLUÍDO.** Evidência: `docs/INCREMENT_1_VALIDATION.md`.

## Incremento 2 — estado atual

```text
US-AUTH-001 fundação Neon Auth + sessão — CONCLUÍDA (#43 / #44)
  ↓
US-AUTH-002 papéis/autorização + bootstrap administrativo — CONCLUÍDA (#45 / #46)
  ↓
US-AUTH-003 convites/solicitações + auditoria de entrada — CONCLUÍDA (#47 / #48)
  ↓
US-AUTH-004 e-mail transacional non-production — PRÓXIMA
  ↓
US-AUTH-005 cadastro controlado + confirmação de e-mail
  ↓
US-AUTH-006 login/logout + proteção de sessão
  ↓
US-AUTH-007 recuperação de senha + gestão/revogação de sessões
  ↓
US-AUTH-008 auditoria integrada + validação do incremento
```

Plano detalhado: `docs/INCREMENT_2_PLAN.md`.

## US-AUTH-001 — estado integrado

- Issue `#43` / PR `#44`;
- merge `538cffcc831b91de2aecb9715a3584cac1536d88`;
- CI pós-merge `33753190237`: `PASS`;
- Managed Better Auth habilitado na baseline non-production;
- nenhuma conta real criada pela Story.

Evidência: `docs/US_AUTH_001_VERIFICATION.md`.

## US-AUTH-002 — estado integrado

- Issue `#45` / PR `#46`;
- merge `f31328cc9405bb88d12064e85f6ba3906485f3bd`;
- CI pós-merge `33770088254`: `PASS`;
- cinco papéis de produto separados do Admin Better Auth;
- autorização server-only + banco e bootstrap owner controlado;
- migrations `000001`/`000002` promovidas à baseline;
- `verify-us-auth-002` removida em 03/09/2026 após autorização explícita do usuário.

Evidência: `docs/US_AUTH_002_VERIFICATION.md`.

## US-AUTH-003 — resultado candidato à integração

### GitHub

```text
Issue: #47
Branch: feat/us-auth-003-entry-control-model
PR: #48
Baseline Git: f31328cc9405bb88d12064e85f6ba3906485f3bd
CI inicial: 33771618637 — FAIL legítimo somente no teste SQL
CI técnico corrigido: 33771989432 — PASS
Head técnico corrigido: 93a85a0bf2bb72953e966ef364020b34073d1c5e
```

A primeira falha foi uma ambiguidade de variável do teste `000004_entry_control.sql`. A migration `000003` já aplicava corretamente. A variável foi renomeada sem relaxar constraints ou concorrência.

### Implementação

- migration `000003_entry_control.sql`;
- `caleida_access.invitations` para convite único/reutilizável, validade, destinatário e capacidade;
- token persistido somente como digest hexadecimal de 64 caracteres;
- `caleida_access.invitation_uses` para usos numerados e futuro vínculo com a conta;
- `caleida_access.access_requests` para espera/aprovação/recusa/arquivamento;
- `caleida_audit.entry_events` para auditoria compacta;
- funções `SECURITY DEFINER` com `search_path` fixo e acesso `PUBLIC` revogado;
- consumo de convite serializado por `SELECT ... FOR UPDATE`;
- teste concorrente com duas sessões `psql` independentes;
- nenhuma UI, endpoint público, signup, e-mail ou Data API criada.

### Gates

- `npm ci`: `PASS`, zero vulnerabilidades;
- `npm run verify`: `PASS`;
- testes Node: `55/55 PASS`;
- build: `PASS`;
- PostgreSQL 18 + `npm run verify:db`: `PASS`;
- teste concorrente: `PASS — exatamente 1/2 sessões consumiu convite único`;
- Neon-specific: `SKIPPED — SQL puramente PostgreSQL portável, sem dependência de neon_auth/Data API/roles gerenciados`;
- browser real: `SKIPPED — não existe fluxo/UI funcional`;
- e-mail/signup/Data API/Production: `SKIPPED/NON-GOAL`;
- deployment Vercel: `SKIPPED/PROIBIDO` conforme `ADR-007`.

Evidência detalhada: `docs/US_AUTH_003_VERIFICATION.md`.

## Neon non-production — estado após promoção

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Branches descartáveis: nenhuma
Managed Better Auth: habilitado
```

Ledger integrado:

```text
000001_migration_ledger.sql
4d9a403d6bd074faeca04bf3e714fd8066e5e9f3ae7358bbc0f27a1faf2f14c2

000002_product_authorization.sql
0ba6981b583ac8ed693a2a6b6eabc0c84d12678bdf9953e845a239d6b48493c8

000003_entry_control.sql
503700640a81cf41dfe56a0abe70fc581b9c64d8e9ad6585cbcb55d4751b7c5f
```

Estado de dados confirmado depois da promoção:

- Auth users: `0`;
- papéis de produto: `0`;
- mudanças de papel: `0`;
- convites: `0`;
- usos de convite: `0`;
- solicitações: `0`;
- eventos de entrada: `0`.

Nenhum fixture foi promovido.

## Próxima ação — US-AUTH-004

Executar somente:

> `US-AUTH-004 — Selecionar e integrar e-mail transacional non-production`

Antes de escolher provedor:

1. revalidar documentação, pricing, limites e privacidade correntes;
2. registrar ADR se a escolha criar compromisso arquitetural/operacional material;
3. configurar somente non-production e secrets server-only;
4. não criar signup/login/Production ou deployment Vercel dentro da Story.

A CI final da PR #48 e o CI pós-merge da `main` devem ser registrados na discussão da PR depois da integração; não alterar novamente o Checkpoint apenas para persistir IDs de runs.
