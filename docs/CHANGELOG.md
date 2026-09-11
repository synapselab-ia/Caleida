# Changelog

Mudanças relevantes do Caleida. Evidências detalhadas ficam nos documentos de validação/verificação e nos Issues/PRs associados.

## [Não lançado]

### Plataforma e protocolo

- protocolo canônico v2 em `00_SYSTEM/`;
- Neon é a plataforma canônica de dados/identidade (ADR-005);
- migrations persistentes são obrigatórias (ADR-004);
- PostgreSQL 18 descartável é o gate portável primário; Neon isolado cobre comportamento gerenciado (ADR-008);
- Vercel permanece exclusivamente humano/manual e CI não faz CD (ADR-007);
- Preview não é gate por Story; US-AUTH-008 concentra a matriz live do Incremento 2;
- e-mail compartilhado do Neon Auth permanece o transporte non-production atual (ADR-009).

### Incremento 0 — Fundação executável

Concluído. Evidência: `docs/INCREMENT_0_VALIDATION.md`.

### Incremento 1 — Fundação visual

Concluído. Evidência: `docs/INCREMENT_1_VALIDATION.md`.

### Incremento 2 — Acesso controlado

#### US-AUTH-001 — Neon Auth e sessão (#43/#44)

- Managed Better Auth integrado;
- boundary server-only/lazy/fail-closed;
- evidência em `docs/US_AUTH_001_VERIFICATION.md`.

#### US-AUTH-002 — Papéis e autorização (#45/#46)

- papéis de produto separados do Admin Better Auth;
- autorização server-side + banco e bootstrap owner controlado;
- evidência em `docs/US_AUTH_002_VERIFICATION.md`.

#### US-AUTH-003 — Entrada controlada (#47/#48)

- convites, solicitações e auditoria compacta;
- consumo concorrente/capacidade comprovados;
- evidência em `docs/US_AUTH_003_VERIFICATION.md`.

#### US-AUTH-004 — E-mail Auth non-production (#49/#50)

- provider compartilhado do Neon Auth adotado em non-production;
- evidência em `docs/US_AUTH_004_VERIFICATION.md`.

#### US-AUTH-005 — Cadastro controlado + OTP (#51/#52)

- signup fail-closed por convite/aprovação;
- confirmação de e-mail por OTP comprovada live;
- migrations `000004`–`000007` promovidas;
- merge `9abc3235623c3f7d37531eb94a60997960f526e1`;
- evidência em `docs/US_AUTH_005_VERIFICATION.md`.

#### US-AUTH-006 — Login/logout + proteção de sessão (#53/#54)

- login/logout por server actions;
- `/app` protegido server-side;
- credencial inválida com feedback genérico;
- merge `b585234a159a73dfec89e1d4cb866201dcfdef34`;
- live consolidado para US-AUTH-008;
- evidência em `docs/US_AUTH_006_VERIFICATION.md`.

#### US-AUTH-007 — Recovery + gestão/revogação de sessões (#55/#56)

- recovery anti-enumeração e callback same-origin;
- reset por token do provider;
- mudança autenticada de senha;
- consulta/revogação das próprias sessões sem bearer token na UI;
- `sessionDataTtl = 1 s`;
- merge `31ec6e2238a7b0bdaff7506ac0e9ed51179f3322`;
- live consolidado para US-AUTH-008;
- evidência em `docs/US_AUTH_007_VERIFICATION.md`.

#### US-AUTH-008 — Auditoria integrada + validação final (#57/#58)

Em andamento:

- migration append-only `000008_auth_security_audit.sql`;
- nova `caleida_audit.auth_security_events` com event/outcome/reason code controlados e UUID opcional de ator;
- nenhum e-mail, senha, token, cookie, Auth URL ou payload arbitrário na auditoria;
- login/logout/recovery/reset/mudança de senha/revogação de sessões auditados por writer server-only parametrizado;
- POST direto do proxy Auth auditado sem leitura do request body;
- recovery permanece anti-enumeração na resposta e no evento persistido;
- testes de contrato e SQL adversarial adicionados;
- testes concorrentes históricos renumerados sem alteração de comportamento;
- CI funcional #229 / `34601223118`: PASS completo;
- PostgreSQL 18 + `verify:db`: PASS;
- branch Neon `verify-us-auth-008 / br-delicate-meadow-aw1u62kn`: PASS;
- migration `000008` promovida para a baseline non-production após os gates;
- baseline Neon agora contém migrations `000001`–`000008`;
- baseline e branch isolada sem fixtures/usuários/sessões e com diff de schema vazio após promoção;
- projeto Vercel real rechecado: o último Preview ainda é da US-AUTH-005, portanto uma única nova RC manual é materialmente necessária;
- gate live permanece pendente conforme ADR-007; a IA não executa deployment;
- evidência corrente em `docs/US_AUTH_008_VERIFICATION.md`.

### Estado operacional atual

```text
Git: PR #58 / feat/us-auth-008-audit-integrated-validation
Neon baseline: caleida-nonprod/main / migrations 000001–000008
Neon verification: verify-us-auth-008 / ready
Auth: email/password + OTP obrigatório + shared email
Session data cache: 1 s
Data API: não provisionada
Production Neon: não provisionada
Vercel: projeto caleida existente; latest Preview ainda US-AUTH-005
Deployment: exclusivamente humano/manual
```

### Próxima ação canônica

> Depois que o CI da ref candidata da PR #58 estiver verde, o usuário cria manualmente uma única Preview Vercel da branch `feat/us-auth-008-audit-integrated-validation`. Em seguida, retomar a US-AUTH-008 para executar a matriz live acumulada e decidir o fechamento do Incremento 2.
