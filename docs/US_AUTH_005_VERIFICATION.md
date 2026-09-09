# US-AUTH-005 — Verificação do cadastro controlado

**Estado:** BASELINE_PROMOTION_REQUIRED  
**Issue:** `#51`  
**PR:** `#52` (draft)  
**Branch Git:** `feat/us-auth-005-controlled-signup`  
**Branch Neon isolada:** `verify-us-auth-005 / br-small-river-aww0rtxo`  
**Baseline Neon:** `main / br-restless-cherry-awpcwy6r`

## Resultado

A implementação e os gates live da US-AUTH-005 estão aprovados na branch Neon isolada. O cadastro é fail-closed fora da UI, só permite entrada por convite/aprovação válida e exige confirmação de e-mail antes de autenticação.

A Story ainda não está concluída porque as migrations `000004`–`000007` e a configuração de confirmação obrigatória ainda não foram promovidas para a baseline non-production.

## Migrations validadas

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

Ledger isolado confirmado em `000001`–`000007`. A baseline continua deliberadamente em `000001`–`000003` até a promoção.

## Gates portáteis

O head funcional passou `npm run verify`, PostgreSQL 18 e `npm run verify:db`, incluindo concorrência de convite e cadastro.

Provas live temporárias foram executadas por GitHub Actions e removidas da árvore após coleta de evidência:

```text
#181 / 34387804292 — signup direto sem autorização: PASS
#182 / 34388232866 — solicitação aprovada: PASS
#183 / 34388501646 — assinatura/timestamp inválidos: PASS
#184 / 34388910697 — matriz de convites: PASS
#190 / 34393412880 — usuário não verificado bloqueado no sign-in: PASS
#194 / 34395716742 — OTP recebido, verificado e sign-in pós-verificação: PASS
```

## Gate live de entrada — PASS

Com Preview Vercel real e Managed Better Auth real foram comprovados:

- signup direto sem autorização → negado;
- solicitação aprovada → permitida e vinculada à identidade criada;
- convite inexistente, expirado, revogado ou esgotado → negado;
- e-mail divergente de convite restrito → negado;
- convite válido → permitido, consumido uma vez e vinculado;
- `user.before_create` sem user id → suportado;
- `user.created` → finaliza o vínculo;
- assinatura inválida → HTTP 401;
- timestamp expirado → HTTP 401;
- respostas/logs observados sem secrets.

A concorrência/capacidade permanece coberta pela suíte PostgreSQL versionada.

## Confirmação de e-mail — PASS

Na branch isolada, o readback do `neon_auth.project_config` confirmou:

```text
email/password: enabled
allow_sign_up: true
requireEmailVerification: true
sendVerificationEmailOnSignUp: true
emailVerificationMethod: otp
email provider: shared Neon
```

A primeira prova live confirmou que um usuário autorizado nasce `emailVerified=false` e não consegue autenticar antes da confirmação.

A prova ponta a ponta final usou uma mailbox temporária criada pela CI, um convite de teste sem destinatário fixo e o fluxo real do Managed Better Auth:

```text
claim do convite → HTTP 200
signup → HTTP 200
OTP recebido por e-mail → PASS
POST /email-otp/verify-email → HTTP 200
sign-in após verificação → HTTP 200
```

Readback Neon posterior confirmou o usuário da prova com `emailVerified=true`.

Nenhum OTP, senha, token de mailbox ou secret foi persistido na documentação.

## Preview utilizado

```text
Project: caleida
Deployment: dpl_8WN2sKEEL6ex3vKt11vmYX9ZGvoN
State: READY
Git deployado: 5ada76e8eb68679c181a6d5c3c7c8d5db1794786
Branch alias: caleida-git-feat-us-auth-005-55f705-synapselabia-8285s-projects.vercel.app
```

O Preview foi criado manualmente pelo usuário conforme ADR-007. A IA não executou deployment.

## Runtime Vercel

O Preview revelou que Vercel garante o major Node `24.x`, não um patch específico. A branch foi ajustada para declarar `engines.node = 24.x`, enquanto `.nvmrc` e CI continuam fixando `24.20.0` para reprodutibilidade local/CI. O gate final da branch deve permanecer verde após essa correção.

## Baseline — ainda preservada

Readback após todos os gates live:

```text
main / br-restless-cherry-awpcwy6r
ledger: 000001 + 000002 + 000003
```

Não existem migrations US-AUTH-005 promovidas no momento deste registro.

## Próximo gate

Promover deliberadamente `000004`–`000007` para a baseline, reproduzir a configuração de confirmação obrigatória de e-mail na baseline, executar readback de ledger/schema/Auth e somente então finalizar a PR #52 e fechar a Issue #51.

US-AUTH-006 permanece bloqueada até a conclusão desse processo.
