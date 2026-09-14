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

### Incremento 0 — Fundação executável

Concluído. Evidência: `docs/INCREMENT_0_VALIDATION.md`.

### Incremento 1 — Fundação visual

Concluído. Evidência: `docs/INCREMENT_1_VALIDATION.md`.

### Incremento 2 — Acesso controlado — CONCLUÍDO

#### US-AUTH-001 — Neon Auth e sessão (#43/#44)

- Managed Better Auth integrado;
- boundary server-only/lazy/fail-closed.

#### US-AUTH-002 — Papéis e autorização (#45/#46)

- papéis de produto separados do Admin Better Auth;
- autorização server-side + banco e bootstrap owner controlado.

#### US-AUTH-003 — Entrada controlada (#47/#48)

- convites, solicitações e auditoria compacta;
- consumo concorrente/capacidade comprovados.

#### US-AUTH-004 — E-mail Auth non-production (#49/#50)

- provider compartilhado do Neon Auth adotado em non-production.

#### US-AUTH-005 — Cadastro controlado + OTP (#51/#52)

- signup fail-closed por convite/aprovação;
- confirmação por OTP comprovada live;
- migrations `000004`–`000007` promovidas;
- merge `9abc3235623c3f7d37531eb94a60997960f526e1`.

#### US-AUTH-006 — Login/logout + proteção de sessão (#53/#54)

- login/logout por server actions;
- `/app` protegido server-side;
- merge `b585234a159a73dfec89e1d4cb866201dcfdef34`.

#### US-AUTH-007 — Recovery + gestão/revogação de sessões (#55/#56)

- recovery anti-enumeração e callback same-origin;
- reset por token do provider;
- mudança autenticada de senha;
- consulta/revogação das próprias sessões sem bearer token na UI;
- `sessionDataTtl = 1 s`;
- merge `31ec6e2238a7b0bdaff7506ac0e9ed51179f3322`.

#### US-AUTH-008 — Auditoria integrada + validação final (#57/#58)

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

### Estado operacional atual

```text
Git: main / nenhuma Issue ou PR aberta
Último merge funcional: 84f7fecb018d6f4b6bc36817accef15f1976f05f
Neon baseline: caleida-nonprod/main / migrations 000001–000008
Auth: email/password + OTP obrigatório + shared email
Session data cache: 1 s
Data API: não provisionada
Production Neon: não provisionada
Vercel RC validada: dpl_HqRV6x1Vn5f3GL69wGgy85UDVc9B / READY
Deployment: exclusivamente humano/manual
```

### Próxima ação canônica

> Planejar o Incremento 3 — Perfis e privacidade / EPIC-03, decompondo CAP-03, CAP-05 e CAP-33 em Stories limitadas antes de iniciar implementação.
