# US-AUTH-005 — Verificação do cadastro controlado

**Estado:** PASS — pronta para integração  
**Issue:** `#51`  
**PR:** `#52`  
**Branch Git:** `feat/us-auth-005-controlled-signup`  
**Branch Neon isolada:** `verify-us-auth-005 / br-small-river-aww0rtxo`  
**Baseline Neon:** `main / br-restless-cherry-awpcwy6r`

## Resultado

A US-AUTH-005 foi comprovada de ponta a ponta em non-production. O cadastro é fail-closed fora da UI, só permite criação de conta por convite válido ou solicitação aprovada e exige confirmação de e-mail antes da autenticação por senha.

As migrations `000004`–`000007` foram promovidas deliberadamente para a baseline Neon após os gates live passarem. A configuração de confirmação obrigatória de e-mail também foi reproduzida na baseline e confirmada por readback.

## Migrations promovidas

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

Readback final do ledger da baseline:

```text
000001_migration_ledger.sql
000002_product_authorization.sql
000003_entry_control.sql
000004_controlled_signup.sql
000005_controlled_signup_consume_fix.sql
000006_before_create_without_user_id.sql
000007_claim_signature_compatibility.sql
```

Todos os checksums da baseline coincidem com os arquivos versionados.

A promoção foi executada de forma transacional, preservando o comportamento do runner canônico `database/scripts/migrate.mjs`. O helper de prepared migration do conector Neon não aceitou os blocos PL/pgSQL `$$`; essa tentativa falhou antes de qualquer promoção. A aplicação efetiva usou os statements de topo das migrations versionadas e gravou cada entrada do ledger na mesma transação da migration correspondente.

## Paridade de schema Neon — PASS

Após a promoção, o schema da baseline foi comparado com `verify-us-auth-005`.

```text
compare_database_schema(verify-us-auth-005, main)
diff: vazio
```

As funções críticas também tiveram `prosrc` comparado entre as branches. Os corpos finais coincidem para:

- `claim_signup_authorization(uuid, text)`;
- `claim_signup_authorization(uuid, uuid, text)`;
- `consume_invitation(text, text)`;
- `consume_signup_rate_limit(text, integer, integer)`;
- `finalize_signup_authorization(uuid, uuid, text)`;
- `issue_signup_permit_from_invitation(text, text, integer)`;
- `transition_invitation(bigint, uuid, text, text)`.

## Baseline sem fixtures — PASS

Readback após a promoção:

```text
auth_users: 0
product_roles: 0
invitations: 0
invitation_uses: 0
access_requests: 0
signup_permits: 0
auth_webhook_events: 0
```

Nenhuma fixture da validação isolada foi transportada para `main`.

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
#198 / 34396625071 — CI da branch após fechamento dos gates: PASS
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

A prova ponta a ponta final usou uma mailbox temporária criada pela CI, um convite de teste sem destinatário fixo e o fluxo real do Managed Better Auth:

```text
claim do convite → HTTP 200
signup → HTTP 200
usuário criado com emailVerified=false
sign-in antes da confirmação → negado
OTP recebido por e-mail → PASS
POST /email-otp/verify-email → HTTP 200
readback → emailVerified=true
sign-in após verificação → HTTP 200
```

Nenhum OTP, senha, token de mailbox ou secret foi persistido na documentação.

### Configuração final da baseline

O readback de `main / br-restless-cherry-awpcwy6r` confirmou:

```text
email/password: enabled
allow_sign_up: true
verify_email_on_sign_up: true
require_email_verification: true
email_verification_method: otp
auto_sign_in_after_verification: true
email provider: shared Neon
```

## Preview utilizado

```text
Project: caleida
Deployment: dpl_8WN2sKEEL6ex3vKt11vmYX9ZGvoN
State: READY
Git deployado: 5ada76e8eb68679c181a6d5c3c7c8d5db1794786
Branch alias: caleida-git-feat-us-auth-005-55f705-synapselabia-8285s-projects.vercel.app
```

O Preview foi criado manualmente pelo usuário conforme ADR-007. A IA não executou deployment.

A comparação entre o SHA deployado e o head posterior mostrou que, depois de `5ada76e8...`, mudaram apenas documentação e o contrato de runtime em `package.json`; nenhum código funcional de Auth/webhook mudou depois da prova live.

## Runtime Vercel

O Preview revelou que Vercel seleciona patches dentro do major Node 24. `package.json` foi alinhado a `24.x`, enquanto `.nvmrc` e CI continuam fixando `24.20.0` para reprodutibilidade local/CI. O gate da branch permaneceu verde após a correção.

## Restrições preservadas

- nenhum secret foi versionado;
- nenhuma mudança foi feita em Neon Production;
- nenhum deployment, promotion, redeploy ou rollback Vercel foi executado pela IA;
- Data API continua fora do escopo;
- as branches `verify-us-auth-004` e `verify-us-auth-005` não foram removidas porque exclusão exige autorização destrutiva específica.

## Conclusão

US-AUTH-005 atende os gates de implementação, PostgreSQL, Neon-specific, comportamento live, confirmação de e-mail, promoção de baseline e readback pós-promoção. A PR #52 pode seguir para revisão final e integração. US-AUTH-006 permanece bloqueada apenas até a integração desta PR.