# Neon Platform - Caleida

**Status:** arquitetura canônica de plataforma durante o Incremento 3, após promoção da US-PRIV-002 para a baseline non-production  
**Decisões:** ADR-004, ADR-005, ADR-008 e ADR-009

## 1. Topologia vigente

```text
Next.js
  ├── Neon Auth / Managed Better Auth
  │     ├── email/password + OTP
  │     ├── login/logout
  │     └── recovery + gestão/revogação de sessões
  ├── operações server-side confiáveis
  │     └── Neon Postgres
  └── CRUD normal user-scoped de perfil
        └── Neon Data API + JWT + PostgreSQL RLS
```

Data API está ativa na baseline non-production desde US-PRIV-001. Object Storage continua desacoplado e sem provider escolhido.

## 2. Non-production canônico

```text
Project: caleida-nonprod / patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Managed Better Auth: enabled
Data API: active
Data API schema exposto: caleida_profile
Data API default grants amplos: disabled
OpenAPI: disabled
email/password: enabled
require email verification: true
verification method: OTP
email provider: shared Neon
```

A branch Neon `main` é staging/non-production e não é a branch Git `main`.

## 3. Baseline de migrations

A baseline integrada contém migrations `000001`-`000011`.

Checksums mais recentes:

```text
000008_auth_security_audit.sql
4f2ab39dd53413c522648ce7021a0051a163b009486c5dd6e7fcf1e2f81460b8

000009_profile_core.sql
33f33c043c1a94b8ec4d5df3edd2a1fcb6c08d13abb3e128771687a576120de1

000010_profile_identity_claim_fix.sql
4a47f6715566445bcbed2f56fb2a9a15d867c633e85e89375e487aaa3c1ec2be

000011_profile_personalization.sql
4773504fe2296e7ce141e8efcb027efd2218f2fd5c5598585bd97f5a4f55f95f
```

`000009` cria o núcleo de perfil/RLS. `000010` faz a identidade user-scoped derivar do `sub` validado disponível em `request.jwt.claims`. `000011` adiciona biografia, token de destaque, links HTTPS validados e categorias culturais favoritas sem alterar ownership ou policies.

## 4. Perfil user-scoped e Data API

Persistência:

```text
caleida_profile.profiles
```

Contrato atual:

- `auth_user_id` UUID é a chave de ownership;
- campos editáveis atuais: `username`, `display_name`, `biography`, `accent_token`, `links` e `favorite_categories`;
- visibilidade nasce `only_me`;
- RLS está habilitada e forçada;
- policies normais existem somente para `SELECT`, `INSERT` e `UPDATE` do owner;
- `authenticated` recebe somente `SELECT`, `INSERT` e `UPDATE` na tabela;
- `anonymous` e `PUBLIC` não recebem grants de tabela;
- DELETE permanece fora do CRUD normal;
- Data API expõe somente `caleida_profile`;
- fluxo normal usa JWT + Data API + RLS, nunca owner/BYPASSRLS.

A função `caleida_profile.current_auth_user_id()` é `SECURITY INVOKER`, lê apenas `request.jwt.claims`, extrai `sub` UUID e falha fechada para claim ausente/malformada.

## 5. Ordem de provisionamento de papéis gerenciados

A Data API cria o papel `authenticated`. A migration `000009` concede privilégios a esse papel de forma condicional para continuar portável em PostgreSQL 18 sem Neon.

Consequência operacional:

- em ambiente novo, preferir provisionar/configurar Data API antes de aplicar a migration user-scoped que concede privilégios aos papéis gerenciados;
- se a migration já estiver aplicada antes do serviço, depois do provisionamento reaplicar somente os grants já codificados na migration e executar readback ACL;
- nunca usar grants adicionais ad hoc para contornar falha de autorização;
- o estado aceito exige readback de RLS, policies, grants e Data API.

Na promoção de US-PRIV-001, essa dependência foi detectada pelo readback. Os grants exatos de `000009` foram reaplicados depois da criação da Data API e o diff de schema entre branch isolada e baseline ficou vazio.

## 6. Auditoria Auth consolidada

Persistência:

```text
caleida_audit.auth_security_events
```

Metadados deliberadamente mínimos: id, event_type, actor_auth_user_id opcional, outcome, reason_code e occurred_at.

Não existem colunas de e-mail, senha, token, cookie, Auth URL, IP ou payload completo. `PUBLIC` não possui acesso direto à tabela/sequence.

## 7. Sessão e recovery

A aplicação usa `@neondatabase/auth@0.5.0-beta` em boundary server-only.

- `sessionDataTtl = 1 s`;
- recovery público é anti-enumeração;
- callback é derivado de origem same-origin validada;
- reset usa token do provider no fluxo server-side;
- session token nunca é enviado à UI;
- revogação individual valida ownership por session id antes de resolver token;
- revogação coletiva usa listagem server-side + revogação explícita de cada sessão remota, preservando a atual.

## 8. Branches de verificação

```text
verify-us-auth-004 / br-plain-pond-aw5f59ia
verify-us-auth-005 / br-small-river-aww0rtxo
verify-us-auth-006 / br-cold-block-aww00k4o
verify-us-auth-007 / br-wandering-mountain-awjnqqps
verify-us-auth-008 / br-delicate-meadow-aw1u62kn
verify-us-priv-001 / br-silent-rain-aw4fqrhg
verify-us-priv-002 / br-proud-wind-awycp0sd
```

Branches temporárias não são fonte de verdade de schema. Exclusão exige autorização explícita porque é destrutiva.

## 9. Evidência de US-PRIV-001

```text
CI funcional #278 / 35012494049: SUCCESS
Live JWT/Data API/RLS #11 / 35013092108: SUCCESS
Baseline promotion #1 / 35239947088: SUCCESS
Schema diff isolated vs baseline: vazio
```

Detalhes: `docs/US_PRIV_001_VERIFICATION.md`.

## 10. Production e secrets

`caleida-production` continua não provisionado. Production nunca é laboratório.

Nunca versionar DATABASE_URLs, Neon API keys, Auth URLs reais, Data API URLs reais, cookie secrets, rate-limit secrets, recovery/session tokens, OAuth/client secrets ou credenciais de e-mail/Storage.

## 11. Evidência de US-PRIV-002

```text
CI funcional #284 / 35350619301 / job 105617610955: SUCCESS
CI final PR #289 / 35351088749 / job 105619133550: SUCCESS
Merge PR #64: d19be4e881da6f8e3ba54a50ecef1c67fb1160e3
CI pós-merge main #290 / 35351301592 / job 105619831900: SUCCESS
Neon isolated: verify-us-priv-002 / br-proud-wind-awycp0sd
Baseline ledger: 000001-000011
Schema diff isolated vs baseline: vazio
Data API: active / somente caleida_profile
```

Readback após a promoção confirmou RLS habilitada e forçada, somente as policies owner existentes, `authenticated` com `INSERT/SELECT/UPDATE` na tabela, `anonymous` sem grant de tabela e validadores novos sem `EXECUTE` para `PUBLIC`.

Detalhes: `docs/US_PRIV_002_VERIFICATION.md`.

## 12. Próximo gate de plataforma

US-PRIV-002 está concluída. US-PRIV-003 é a próxima Story e poderá introduzir leitura pública fail-closed. A Data API baseline não deve ser recriada; qualquer policy/grant público deve existir somente dentro do escopo e dos gates da US-PRIV-003.
