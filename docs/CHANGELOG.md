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

### Incremento 2 — Acesso controlado

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
- confirmação de e-mail por OTP comprovada live;
- migrations `000004`–`000007` promovidas;
- merge `9abc3235623c3f7d37531eb94a60997960f526e1`.

#### US-AUTH-006 — Login/logout + proteção de sessão (#53/#54)

- login/logout por server actions;
- `/app` protegido server-side;
- credencial inválida com feedback genérico;
- merge `b585234a159a73dfec89e1d4cb866201dcfdef34`.

#### US-AUTH-007 — Recovery + gestão/revogação de sessões (#55/#56)

- recovery anti-enumeração e callback same-origin;
- reset por token do provider;
- mudança autenticada de senha;
- consulta/revogação das próprias sessões sem bearer token na UI;
- `sessionDataTtl = 1 s`;
- merge `31ec6e2238a7b0bdaff7506ac0e9ed51179f3322`.

#### US-AUTH-008 — Auditoria integrada + validação final (#57/#58)

Em revisão final:

- migration append-only `000008_auth_security_audit.sql`;
- `caleida_audit.auth_security_events` com metadados controlados e sem secrets;
- login/logout/recovery/reset/mudança de senha/revogação auditados;
- proxy Auth auditado sem leitura de request body;
- PostgreSQL 18, SQL adversarial e Neon isolated: PASS;
- `000008` promovida para a baseline non-production com checksum correto;
- matriz live inicial encontrou bug real em `revokeOtherSessions()`;
- revogação coletiva corrigida para listar sessões server-side e revogar explicitamente cada sessão remota;
- CI #232 da correção / `34616208433`: SUCCESS;
- Preview final manual `dpl_HqRV6x1Vn5f3GL69wGgy85UDVc9B` publicada com commit `c85135418eec133d7e0a5dc8ad6ad816f2c39668`;
- matriz live final run #13 / `34636223750`: SUCCESS;
- signup/OTP/login/logout/proteção privada/recovery/reset/replay/multi-sessão/IDOR/revogação/password change: PASS;
- Origin divergente bloqueado pelo CSRF de Server Actions sem disparar e-mail;
- comportamento observado: reset por e-mail não revoga sessões existentes; password change autenticado revoga as demais;
- auditoria live confirmou todos os eventos críticos esperados sem dados sensíveis;
- evidência final pré-merge em `docs/US_AUTH_008_VERIFICATION.md`.

### Estado operacional atual

```text
Git: PR #58 / feat/us-auth-008-audit-integrated-validation / revisão final
Neon baseline: caleida-nonprod/main / migrations 000001–000008
Neon Preview data-plane histórico: verify-us-auth-005 / migrations 000001–000008
Auth: email/password + OTP obrigatório + shared email
Session data cache: 1 s
Data API: não provisionada
Production Neon: não provisionada
Vercel RC: dpl_HqRV6x1Vn5f3GL69wGgy85UDVc9B / READY
Deployment: exclusivamente humano/manual
```

### Próxima ação canônica

> Executar CI/revisão do head documental final da PR #58, integrar se verde e registrar em `main` o fechamento real da US-AUTH-008 e do Incremento 2 antes de planejar o próximo incremento.
