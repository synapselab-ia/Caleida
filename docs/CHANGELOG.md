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

### Incremento 3 - Perfis e privacidade - PLANEJADO

OPS-007 / Issue #59 refinou CAP-03, CAP-05 e CAP-33 sem implementar produto.

- criado `docs/INCREMENT_3_PLAN.md`;
- oito Stories ordenadas foram definidas, de `US-PRIV-001` a `US-PRIV-008`;
- somente `US-PRIV-001 - Materializar perfil básico user-scoped com Data API e RLS` fica PRONTA;
- a Data API foi revalidada como boundary branch-scoped que delega autorização a PostgreSQL `GRANT` + RLS;
- o primeiro slice user-scoped deverá usar JWT/ownership real e falhar fechado para outro usuário e anônimo;
- perfil de produto fica separado da identidade gerenciada do Neon Auth;
- visibilidade começa em `only_me` e estados sociais sem relação implementada continuam privados para terceiros;
- bloqueio entra porque já produz efeito real sobre perfil;
- followers/connections, mute/restrict e privacidade de conteúdos inexistentes não geram fluxos falsos;
- avatar/banner ficam adiados até EPIC-16/CAP-30 e decisão de Storage;
- obras favoritas ficam adiadas até catálogo real;
- CAP-33 foi dividido em desativação reversível, solicitação/cancelamento, export de encerramento e finalização segura;
- janela inicial planejada para exclusão: 30 dias, sem scheduler destrutivo oculto;
- Production Neon, Data API, Storage e código funcional não foram provisionados/alterados em OPS-007;
- branches históricas Git/Neon não foram removidas.

### Estado operacional de partida do refino

```text
Git main: 9ea9f9253a0123eb491d8980fd252401b6ea8f10
CI main: #247 / 34851172467 / SUCCESS
Neon baseline: caleida-nonprod/main / migrations 000001-000008
Auth: email/password + OTP obrigatório + shared email
Session data cache: 1 s
Data API: não provisionada
Production Neon: não provisionada
Deployment: exclusivamente humano/manual
```

### Próxima ação canônica após OPS-007

> Executar somente `US-PRIV-001 - Materializar perfil básico user-scoped com Data API e RLS`, conforme `docs/INCREMENT_3_PLAN.md`.
