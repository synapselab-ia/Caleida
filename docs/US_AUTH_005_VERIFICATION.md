# US-AUTH-005 — Verificação do cadastro controlado

**Estado:** MANUAL_ACTION_REQUIRED — confirmação de e-mail pendente  
**Issue:** `#51`  
**PR:** `#52` (draft)  
**Branch Git:** `feat/us-auth-005-controlled-signup`  
**Branch Neon isolada:** `verify-us-auth-005 / br-small-river-aww0rtxo`  
**Baseline Neon preservada:** `main / br-restless-cherry-awpcwy6r`

## Resultado atual

O gate crítico de entrada controlada foi comprovado contra o Neon Auth real e um Preview Vercel real. Signup direto fora da UI falha fechado quando não existe convite ou solicitação aprovada; autorização válida permite a criação e o `user.created` finaliza o vínculo.

A Story ainda não está concluída porque `require_email_verification` permanece `false`. Pelo plano canônico, confirmação de e-mail deve ser ativada e comprovada somente depois do gate fail-closed de cadastro — condição que agora foi satisfeita.

## Implementação

A unidade inclui:

- `caleida_access.signup_permits` para autorizações curtas de cadastro;
- rate limit persistente em `caleida_access.signup_rate_limits`;
- auditoria idempotente em `caleida_audit.auth_webhook_events`;
- reserva de capacidade de convite antes da criação da identidade;
- autorização por solicitação aprovada limitada ao e-mail aprovado;
- `user.before_create` como gate bloqueante;
- `user.created` para finalizar consumo/vínculo;
- validação server-only do webhook por Ed25519 detached JWS, `kid`/JWKS, timestamp e event ID;
- endpoint público de claim com corpo limitado, `no-store` e rate limiting pseudonimizado por HMAC;
- respostas externas genéricas sem expor permit ID, digest de convite ou motivo interno.

## Migrations da Story

```text
000004_controlled_signup.sql
633c913deeedae4eca32890268b9f47b03c67178a0fd9a6edf2e8f05f2890535

000005_controlled_signup_consume_fix.sql
c7211562a5aec011b5af8707f63c9db4171a379c1ee0897567c03f79059ab4f1

000006_before_create_without_user_id.sql
5537735b38710032affbe600f5ce4f666da8532e6fc554953c526914357ed68b

000007_claim_signature_compatibility.sql
823d39d763c32736fa0df1f0d626647f8dd3009d56fe1262fa74cc91d67b02c6
```

`000005` preserva o histórico append-only após a ambiguidade PL/pgSQL descoberta em `000004`. `000006` adapta a reserva ao contrato real de `user.before_create`, que não depende de user ID já criado. `000007` preserva compatibilidade da assinatura do claim após a evolução do fluxo.

## Gates portáteis — PASS

O head funcional antes das provas live, `5ada76e8eb68679c181a6d5c3c7c8d5db1794786`, passou CI `#180` (`34373402005`) com:

- runtime canônico no GitHub Actions;
- `npm ci`;
- migration checksum check;
- lint;
- typecheck;
- testes Node;
- build Next.js;
- PostgreSQL 18;
- `npm run verify:db`;
- testes SQL do controle de entrada;
- provas concorrentes versionadas.

As provas live temporárias também passaram dentro da CI e foram removidas da árvore final depois da coleta de evidência:

```text
CI #181 / 34387804292 — signup direto sem autorização: SUCCESS
CI #182 / 34388232866 — solicitação aprovada: SUCCESS
CI #183 / 34388501646 — assinatura/timestamp inválidos: SUCCESS
CI #184 / 34388910697 — matriz live de convites: SUCCESS
```

Esses testes temporários não fazem parte da suíte permanente porque dependiam de endpoints externos e fixtures branch-scoped; a evidência persistente fica neste documento e no estado auditável da branch Neon isolada.

## Gate Neon isolado — PASS

Readback do ledger em `verify-us-auth-005` confirmou `000001`–`000007` com os checksums canônicos. A baseline foi relida após as provas e continua somente em `000001`–`000003`; nenhuma migration da US-AUTH-005 foi promovida ainda.

A branch isolada contém somente dados de verificação gerados durante o gate live. Eles não foram promovidos à baseline.

## Preview Vercel real — PASS

O usuário criou manualmente o Preview, em conformidade com ADR-007. Readback confirmou:

```text
Projeto: caleida
Deployment: dpl_8WN2sKEEL6ex3vKt11vmYX9ZGvoN
Estado: READY
Branch: feat/us-auth-005-controlled-signup
Commit: 5ada76e8eb68679c181a6d5c3c7c8d5db1794786
Alias estável: caleida-git-feat-us-auth-005-55f705-synapselabia-8285s-projects.vercel.app
```

A raiz do Preview respondeu HTTP 200 e `/api/webhooks/neon-auth` existe no deployment. O alias estável foi confirmado como trusted origin do Neon Auth isolado.

O build Vercel registrou warnings de peer dependency e um warning de patch do Node (`24.19.0` no builder versus contrato local `>=24.20.0 <25`), mas concluiu `READY`; os gates canônicos de runtime continuam sendo os da CI, que passaram. Isso não foi usado como substituto de verificação.

## Webhooks Neon Auth — PASS

Readback de `neon_auth.project_config.webhook_config` confirmou:

```text
enabled: true
webhookUrl: <alias estável do Preview>/api/webhooks/neon-auth
enabledEvents:
  - user.before_create
  - user.created
timeoutSeconds: 5
```

### Signup direto sem autorização — PASS

Uma chamada real a `POST /sign-up/email` no Neon Auth, originada pela CI e sem convite/aprovação, produziu:

```text
user.before_create
outcome: denied
reason_code: entry_not_authorized
signup_permit_id: null
```

O e-mail de teste não apareceu em `neon_auth.user`. Portanto esconder o formulário na UI não é o mecanismo de segurança; o serviço real bloqueia a criação antes da conta existir.

### Solicitação aprovada — PASS

Uma solicitação isolada previamente marcada `aprovada` foi usada no fluxo real. O readback mostrou:

```text
user.before_create → allowed / entry_authorized / permit 1
user.created       → linked  / identity_linked / permit 1
```

A linha de `access_requests` recebeu o mesmo `created_auth_user_id` criado no Neon Auth e `linked_at` foi preenchido.

### Convites — PASS

A matriz live confirmou:

- token inexistente → negado;
- convite expirado → negado;
- convite revogado → negado;
- convite esgotado → negado;
- e-mail divergente de convite restrito → negado;
- convite válido → claim aceito, signup permitido e vínculo finalizado.

No caso válido, o convite terminou em `utilizado`, `use_count=1/max_uses=1`, e o permit terminou `vinculado` ao mesmo Auth user. Os casos negados não produziram permits utilizáveis.

A concorrência de capacidade permanece coberta pela suíte versionada PostgreSQL/CI; não foi substituída por uma prova manual.

### Assinatura e timestamp inválidos — PASS

Chamadas reais ao Preview com assinatura inválida e timestamp expirado retornaram HTTP 401. Os logs sanitizados registraram somente os reason codes:

```text
jwk_not_found
timestamp
```

Nenhum secret foi incluído em resposta ou log persistente observado.

## Better Auth isolado — estado após o gate

```text
Auth provider: better_auth
email/password: enabled
allow_sign_up: true
require_email_verification: false
email verification method: otp
email provider: shared Neon
webhook: enabled
```

`allow_sign_up=true` é intencional: o bloqueio do beta fechado é imposto pelo `user.before_create`, agora comprovado live. Desabilitar signup globalmente impediria também os cadastros autorizados.

## Confirmação de e-mail — MANUAL_ACTION_REQUIRED

O Project Design exige confirmação de e-mail e o plano da US-AUTH-005 determina que `require_email_verification` só seja ativado após o cadastro controlado estar comprovado fail-closed. Esse pré-requisito agora está PASS.

A superfície Neon conectada disponível nesta execução permite ler a configuração Auth, mas não expõe a alteração de `require_email_verification`. Não será feita edição direta e não documentada de `neon_auth.project_config` por SQL apenas para contornar essa limitação.

A próxima ação é, na branch **isolada** `verify-us-auth-005`, ativar a confirmação obrigatória de e-mail pelo Neon Auth usando a superfície oficial e então executar um signup autorizado com uma caixa de e-mail acessível para comprovar o fluxo de OTP/confirmação. Não alterar a baseline antes dessa prova.

## Gates finais

| Gate | Estado |
|---|---|
| `npm run verify` / app | PASS |
| PostgreSQL 18 / `verify:db` | PASS |
| concorrência versionada | PASS |
| migrations `000004`–`000007` na branch Neon isolada | PASS |
| readback schema/ledger isolado | PASS |
| baseline preservada em `000001`–`000003` | PASS |
| Preview HTTPS real | PASS |
| webhook `user.before_create` / `user.created` | PASS |
| signup direto sem autorização | PASS — negado |
| solicitação aprovada | PASS — criada e vinculada |
| matriz live de convites | PASS |
| assinatura/timestamp inválidos | PASS — fail-closed |
| confirmação obrigatória de e-mail | MANUAL_ACTION_REQUIRED |
| promoção das migrations para baseline | PENDENTE |
| PR #52 ready/merge | BLOQUEADO pela confirmação de e-mail |
| US-AUTH-006 | NÃO INICIAR |

## Conclusão

O **controle de entrada da US-AUTH-005 está comprovado live** contra Neon Auth e Vercel Preview reais. O antigo bloqueio por ausência de HTTPS/webhook foi removido. A Story permanece aberta exclusivamente para fechar a confirmação obrigatória de e-mail e, depois disso, promover as migrations para a baseline, executar readback final e concluir a PR #52.
