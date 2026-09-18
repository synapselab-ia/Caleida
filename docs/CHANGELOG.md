# Changelog

Mudanças relevantes do Caleida. Evidências detalhadas ficam nos documentos de validação/verificação e nos Issues/PRs associados.

## [Não lançado]

### Plataforma e protocolo

- protocolo canônico v2 em `00_SYSTEM/`;
- Neon é a plataforma canônica de dados/identidade (ADR-005);
- migrations persistentes são obrigatórias (ADR-004);
- PostgreSQL 18 descartável é o gate portável primário; Neon isolado cobre comportamento gerenciado (ADR-008);
- Vercel permanece exclusivamente humano/manual e CI não faz CD (ADR-007);
- Preview não é gate por Story; US-AUTH-008 concentrou a matriz live do Incremento 2;
- e-mail compartilhado do Neon Auth permanece o transporte non-production atual (ADR-009).

### Incremento 0 - Fundação executável

Concluído. Evidência: `docs/INCREMENT_0_VALIDATION.md`.

### Incremento 1 - Fundação visual

Concluído. Evidência: `docs/INCREMENT_1_VALIDATION.md`.

### Incremento 2 - Acesso controlado - CONCLUÍDO

#### US-AUTH-001 - Neon Auth e sessão (#43/#44)

- Managed Better Auth integrado;
- boundary server-only/lazy/fail-closed.

#### US-AUTH-002 - Papéis e autorização (#45/#46)

- papéis de produto separados do Admin Better Auth;
- autorização server-side + banco e bootstrap owner controlado.

#### US-AUTH-003 - Entrada controlada (#47/#48)

- convites, solicitações e auditoria compacta;
- consumo concorrente/capacidade comprovados.

#### US-AUTH-004 - E-mail Auth non-production (#49/#50)

- provider compartilhado do Neon Auth adotado em non-production.

#### US-AUTH-005 - Cadastro controlado + OTP (#51/#52)

- signup fail-closed por convite/aprovação;
- confirmação por OTP comprovada live;
- migrations `000004` a `000007` promovidas;
- merge `9abc3235623c3f7d37531eb94a60997960f526e1`.

#### US-AUTH-006 - Login/logout + proteção de sessão (#53/#54)

- login/logout por server actions;
- `/app` protegido server-side;
- merge `b585234a159a73dfec89e1d4cb866201dcfdef34`.

#### US-AUTH-007 - Recovery + gestão/revogação de sessões (#55/#56)

- recovery anti-enumeração e callback same-origin;
- reset por token do provider;
- mudança autenticada de senha;
- consulta/revogação das próprias sessões sem bearer token na UI;
- `sessionDataTtl = 1 s`;
- merge `31ec6e2238a7b0bdaff7506ac0e9ed51179f3322`.

#### US-AUTH-008 - Auditoria integrada + validação final (#57/#58)

Concluída:

- migration `000008_auth_security_audit.sql`;
- auditoria Auth sanitizada em `caleida_audit.auth_security_events`;
- PostgreSQL 18, SQL adversarial e Neon isolated: PASS;
- `000008` promovida para baseline non-production;
- live gate encontrou bug real de revogação coletiva e a implementação foi corrigida para revogar explicitamente sessões remotas server-side;
- CI da correção #232 / `34616208433`: SUCCESS;
- Preview manual final `dpl_HqRV6x1Vn5f3GL69wGgy85UDVc9B` / READY;
- matriz live final #13 / `34636223750`: SUCCESS;
- signup/OTP/login/logout/proteção privada/recovery/reset/replay/multi-sessão/IDOR/revogação/password change: PASS;
- Origin divergente bloqueado por CSRF sem disparar recovery;
- reset por e-mail não revogou sessões existentes no provider observado; password change autenticado revogou as demais;
- auditoria live confirmou eventos críticos sem dados sensíveis;
- PR #58 integrada no merge `84f7fecb018d6f4b6bc36817accef15f1976f05f`;
- Issue #57 fechada como completed;
- CI pós-merge #246 / `34850194033` / job `103995893357`: SUCCESS.

### Incremento 3 - Perfis e privacidade - EM ANDAMENTO

OPS-007 / Issue #59 refinou CAP-03, CAP-05 e CAP-33 e definiu `docs/INCREMENT_3_PLAN.md` com oito Stories ordenadas.

#### US-PRIV-001 - Perfil básico user-scoped + Data API/RLS (#61/#62) - CONCLUÍDA

Implementado:

- migration `000009_profile_core.sql` para schema `caleida_profile`, tabela de perfil, constraints, RLS, policies e grants mínimos;
- migration `000010_profile_identity_claim_fix.sql` para resolver ownership pelo `sub` de `request.jwt.claims` de forma fail-closed;
- perfil básico com ownership UUID Auth, username, display name, timestamps e `only_me`;
- username normalizado, unique case-insensitively, route-safe e com nomes reservados bloqueados;
- RLS habilitada e forçada desde a criação;
- owner com `SELECT/INSERT/UPDATE`, sem `DELETE` normal;
- boundary server-only da aplicação com JWT da sessão + Data API, sem `DATABASE_URL` no CRUD normal;
- `/account/profile` com criação/edição de username e nome de exibição;
- estados de loading, erro, perfil ausente, pending e sucesso;
- nenhum campo de UI pode definir ownership ou visibilidade;
- `NEON_DATA_API_URL` documentada apenas como nome de variável server-only;
- teste de contrato do boundary Data API;
- acesso à área de perfil publicado dentro de `/app`.

Gates e fechamento:

```text
Feature head: ec644c1495644a74a281f08848224c43cc60daf7
CI final PR #279 / 35241013997 / job 105269156530: SUCCESS
PR #62: merged
Merge: 8aeb90cdc3b9b017aee3cefcd4e60b35f22d2758
Issue #61: closed/completed
CI pós-merge main #280 / 35241229260 / job 105269874527: SUCCESS
PostgreSQL 18 + verify:db: PASS
Live JWT/Data API/RLS #11 / 35013092108 / job 104529657936: SUCCESS
Baseline promotion #1 / 35239947088 / job 105265502696: SUCCESS
Baseline ledger: 000001-000010
Baseline Data API: active / somente caleida_profile
Schema diff verify-us-priv-001 vs baseline: vazio
```

A prova Neon encontrou dois pontos reais e os fechou sem ampliar privilégios:

1. acesso direto a `auth.uid()` pelo papel `authenticated` exigiria abrir o schema gerenciado `auth`, o que foi rejeitado;
2. a prova live confirmou que a Data API disponibiliza claims validados em `request.jwt.claims`, levando à migration `000010` com `SECURITY INVOKER` e extração apenas do `sub` UUID.

A promoção também revelou uma dependência de ordem: a Data API cria o papel `authenticated`, enquanto `000009` concede privilégios somente se ele já existir. Como as migrations entraram antes do serviço, o readback detectou ACL ausente. Depois do provisionamento foram reaplicados exatamente os grants versionados em `000009`, sem privilégio novo, e o readback confirmou somente `SELECT`, `INSERT` e `UPDATE`, sem `DELETE`.

A matriz live usou duas identidades sintéticas A/B e anônimo e provou ownership, isolamento de leitura/alteração, forged ownership, transferência negada, DELETE negado e cleanup completo.

Nenhum endpoint real, JWT, OTP, senha, API key, cookie ou connection string foi persistido. Production Neon não foi criada e nenhum deployment Vercel foi executado.

Evidência: `docs/US_PRIV_001_VERIFICATION.md`.

#### US-PRIV-002 - Personalização segura do perfil (#63/#64) - CONCLUÍDA

Implementado e verificado:

- migration `000011_profile_personalization.sql`;
- biografia opcional limitada a 280 caracteres;
- tokens de destaque aprovados: violet, magenta, blue, green e amber;
- até 5 links HTTPS sem credenciais embutidas;
- até 3 categorias culturais favoritas da taxonomia canônica;
- validação server-side e constraints persistentes;
- RLS, ownership e grants de tabela preservados;
- CI #283 encontrou divergência no papel sintético do teste legado e a correção passou no CI #284;
- CI #284 / `35350619301` / job `105617610955`: SUCCESS;
- CI final da PR #289 / `35351088749` / job `105619133550`: SUCCESS;
- PR #64 integrada no merge `d19be4e881da6f8e3ba54a50ecef1c67fb1160e3`;
- Issue #63 fechada como completed;
- CI pós-merge main #290 / `35351301592` / job `105619831900`: SUCCESS;
- Neon isolated `verify-us-priv-002 / br-proud-wind-awycp0sd`: PASS;
- migration `000011` promovida à baseline non-production com checksum `4773504fe2296e7ce141e8efcb027efd2218f2fd5c5598585bd97f5a4f55f95f`;
- Data API permanece ativa somente para `caleida_profile`;
- diff de schema isolated versus baseline: vazio;
- nenhum avatar/banner/Storage, perfil público, obra favorita ou relação social foi antecipado.

Evidência: `docs/US_PRIV_002_VERIFICATION.md`.

#### US-PRIV-003 - Perfil público + visibilidade fail-closed (#65/#66) - CONCLUÍDA

Implementado e verificado:

- migration `000012_profile_public_visibility.sql`;
- rota pública `/<username>`;
- seleção funcional somente entre `public` e `only_me`;
- `followers` e `connections` continuam fail-closed e fora da UI;
- policy pública somente para SELECT de linhas `public`;
- `anonymous` limitado às seis colunas públicas, sem INSERT/UPDATE/DELETE;
- perfil privado e inexistente usam a mesma ausência de conteúdo na rota pública;
- CI #292 / `35354823796` / job `105631496653`: SUCCESS;
- CI final da PR #296 / `35355383381` / job `105633487565`: SUCCESS;
- PR #66 integrada no merge `8541324800708eaecaff17c9492ef072142672a5`;
- Issue #65 fechada como completed;
- CI pós-merge main #297 / `35355615237` / job `105634118124`: SUCCESS;
- Neon isolated `verify-us-priv-003 / br-noisy-firefly-aw06x1br`: PASS;
- migration `000012` promovida à baseline non-production;
- Data API permanece ativa somente para `caleida_profile`;
- diff de schema isolated versus baseline: vazio;
- browser/live intermediário: SKIPPED/deferred conforme protocolo;
- nenhum bloqueio, Storage ou relação social funcional foi antecipado.

Evidência: `docs/US_PRIV_003_VERIFICATION.md`.

### Próxima Story

`US-PRIV-004 - Implementar bloqueio com efeito real` está pronta para promoção. Seu escopo é bloqueio direcional e enforcement sobre leitura autenticada. Mute/restrict, relações sociais funcionais, Storage e ciclo de conta continuam fora de escopo.

### Limites vigentes do Incremento 3

- avatar/banner ficam adiados até EPIC-16/CAP-30 e decisão de Storage;
- obras favoritas ficam adiadas até catálogo real;
- followers/connections não são opções funcionais antes de EPIC-13;
- mute/restrict ficam para EPIC-13;
- privacidade de conteúdos inexistentes nasce com cada domínio;
- CAP-33 segue dividido em desativação reversível, solicitação/cancelamento, export de encerramento e finalização segura;
- Production Neon permanece não provisionada;
- deployment continua exclusivamente humano/manual.
