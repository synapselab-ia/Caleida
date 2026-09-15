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

#### US-PRIV-001 - Perfil básico user-scoped + Data API/RLS (#61/#62)

Estado atual: `BLOCKED / MANUAL_ACTION_REQUIRED` no gate JWT/Data API live.

Implementado:

- migration `000009_profile_core.sql`;
- schema `caleida_profile` separado de `neon_auth`;
- perfil básico com ownership UUID Auth, username, display name, timestamps e `only_me`;
- username normalizado, unique case-insensitively, route-safe e com nomes reservados bloqueados;
- RLS habilitada e forçada desde a criação;
- owner com `SELECT/INSERT/UPDATE`, sem `DELETE` normal;
- grants mínimos para `authenticated`;
- wrapper mínimo `current_auth_user_id()` para resolver `auth.uid()` sem abrir o schema gerenciado `auth` ao papel de aplicação;
- teste adversarial portátil em `000010_profile_core_contract.mjs`;
- boundary server-only da aplicação com JWT da sessão + Data API, sem `DATABASE_URL` no CRUD normal;
- `/account/profile` com criação/edição de username e nome de exibição;
- estados de loading, erro, perfil ausente, pending e sucesso;
- nenhum campo de UI pode definir ownership ou visibilidade;
- `NEON_DATA_API_URL` documentada apenas como nome de variável server-only;
- teste de contrato do boundary Data API;
- acesso à área de perfil publicado dentro de `/app`.

Gates:

```text
CI #263 / run 34981001267 / job 104421003400: SUCCESS
PostgreSQL 18 + verify:db: PASS
Neon isolated estrutural: PASS
Baseline Neon: intacta em 000001-000008 e sem Data API
Isolated ledger: 000001-000009
```

A prova Neon isolada encontrou um defeito real: `authenticated` não conseguia acessar diretamente `auth.uid()` por falta de `USAGE` no schema gerenciado. A correção usa wrapper `SECURITY DEFINER` limitado, sem grant genérico em `auth`, e o teste portátil reproduz essa fronteira.

Gate live preparado:

```text
Probe branch: probe/us-priv-001-live
Run #4: 34981435532
Job: 104422466974
Probe syntax: PASS
NEON_API_KEY preflight: FAIL-CLOSED / secret ausente
JWT/Data API matrix: SKIPPED
Cleanup: SUCCESS
```

O probe está pronto para criar duas identidades sintéticas, obter JWT A/B + token anônimo, provar isolamento/ownership pela Data API e limpar fixtures. Nenhum endpoint real, token, OTP, senha, API key ou connection string é persistido.

Bloqueio externo mínimo:

- configurar no GitHub Actions o secret `NEON_API_KEY` com acesso somente ao necessário no Neon non-production;
- não enviar a chave pelo chat;
- rerodar o job live existente;
- somente depois de PASS promover `000009` + Data API para a baseline e concluir a Story.

Enquanto bloqueada:

- nenhuma promoção à baseline;
- nenhum merge de #62 como concluída;
- nenhuma US-PRIV-002;
- nenhum Storage, Production Neon ou deployment Vercel.

Evidência: `docs/US_PRIV_001_VERIFICATION.md`.

### Limites vigentes do Incremento 3

- avatar/banner ficam adiados até EPIC-16/CAP-30 e decisão de Storage;
- obras favoritas ficam adiadas até catálogo real;
- followers/connections não são opções funcionais antes de EPIC-13;
- mute/restrict ficam para EPIC-13;
- privacidade de conteúdos inexistentes nasce com cada domínio;
- CAP-33 segue dividido em desativação reversível, solicitação/cancelamento, export de encerramento e finalização segura;
- Production Neon permanece não provisionada;
- deployment continua exclusivamente humano/manual.
