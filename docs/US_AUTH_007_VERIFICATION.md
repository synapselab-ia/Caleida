# US-AUTH-007 — Verification

**Story:** Recuperação de senha e gestão/revogação de sessões  
**Issue:** #55  
**PR:** #56  
**Branch:** `feat/us-auth-007-password-session-management`  
**Estado:** EM REVISÃO  
**Data:** 10/09/2026

## 1. Escopo implementado

US-AUTH-007 materializa:

- `/forgot-password` com resposta anti-enumeração;
- `/reset-password` para conclusão por token do provider;
- alteração autenticada de senha com confirmação da senha atual;
- `/account/security` sob o boundary privado existente;
- listagem das próprias sessões;
- revogação individual por ID opaco resolvido server-side;
- encerramento de todas as outras sessões;
- redução explícita do cache de dados de sessão de 300 s para 1 s;
- testes de contrato específicos para recovery/password/session management.

Contrato: `docs/SESSION_SECURITY.md`.

## 2. SDK e implementação upstream revalidados

A versão continuou exatamente:

```text
@neondatabase/auth 0.5.0-beta
```

Foi revalidado o código oficial corrente do Neon SDK (`neondatabase/neon-js`, commit `029a3367ee140d2c8987601b0e338000fe6db1e6`):

- `requestPasswordReset()`;
- `resetPassword()`;
- `changePassword()`;
- `listSessions()`;
- `revokeSession()`;
- `revokeOtherSessions()`;
- `sessionDataTtl` positivo, com default upstream de 300 s.

Também foi revalidada a implementação corrente do Better Auth (`better-auth/better-auth`, commit `8d37cc3b7732a04908b28d8abb7f010a286d6c43`):

- request de recovery retorna resposta equivalente para usuário inexistente e simula trabalho para reduzir timing leak;
- token de reset é armazenado como verification temporária, expira por padrão em 1 hora e é consumido antes da alteração de senha, tornando o uso concorrente single-winner;
- operações sensíveis usam sessão autoritativa em deployments stateful, desabilitando cookie cache para autorização sensível;
- `revokeSession` só remove sessão que pertença ao mesmo usuário autenticado;
- `revokeOtherSessions` preserva a sessão corrente;
- reset de senha só revoga todas as sessões automaticamente se `revokeSessionsOnPasswordReset` estiver habilitado no servidor.

Nenhum comportamento beta foi inferido apenas pela memória do chat.

## 3. Segurança do fluxo

### Anti-enumeração

`requestPasswordResetAction` sempre devolve ao usuário a mesma mensagem pública:

```text
Se existir uma conta para esse e-mail, você receberá instruções para redefinir a senha.
```

Erros retornados/lançados pelo provider não são ecoados para a UI.

### Callback

O callback de recovery é construído a partir da origem da própria requisição somente quando:

- host e origin/referer correspondem;
- protocolo é HTTPS;
- HTTP é aceito somente para localhost/127.0.0.1.

Nenhum domínio de Preview/Production é hardcoded no código.

### Tokens

- recovery token não é escrito em logs/docs;
- session token não é serializado para UI;
- a UI de revogação envia somente `session.id`;
- o servidor lista as sessões próprias e resolve `target.token` internamente apenas depois de validar ownership.

### Senha

- 8–128 caracteres no boundary do Caleida;
- reset inválido/expirado usa mensagem genérica;
- alteração autenticada exige senha atual;
- alteração autenticada usa `revokeOtherSessions: true`.

## 4. Cache e revogação

Antes da Story:

```text
sessionDataTtl = 300 s
```

Depois da Story:

```text
sessionDataTtl = 1 s
```

O SDK corrente rejeita TTL `<= 0`; 1 s é o menor valor positivo adotado pelo produto.

Semântica resultante:

- endpoints sensíveis Better Auth fazem validação autoritativa server-side;
- o boundary comum pode reutilizar dados assinados por no máximo aproximadamente 1 s antes de revalidar upstream;
- uma sessão revogada remotamente pode permanecer aparentemente válida apenas dentro dessa janela de cache já emitida;
- a duração do token de sessão não foi alterada.

## 5. Reset por e-mail e revogação automática

O schema gerenciado `neon_auth.project_config` da branch isolada foi inspecionado apenas de forma read-only. As chaves atuais de `email_and_password` são:

```text
autoSignInAfterVerification
disableSignUp
emailVerificationMethod
enabled
requireEmailVerification
sendVerificationEmailOnSignIn
sendVerificationEmailOnSignUp
```

A opção upstream `revokeSessionsOnPasswordReset` não aparece na configuração gerenciada exposta nesse ambiente.

Consequência: US-AUTH-007 **não afirma** que recovery por e-mail revoga automaticamente sessões existentes. Isso não impede que as sessões sejam consultadas/revogadas explicitamente; alteração autenticada já encerra as demais. O comportamento live de reset + sessões será medido em `US-AUTH-008`.

## 6. GitHub / CI

Primeiro head funcional:

```text
Commit: df745df9a05232372e8a1e1b269bc5502499503b
Workflow: #221
Run: 34519793813
Job: 103014162360
Resultado: SUCCESS
```

Passaram:

- runtime contract Node 24;
- instalação reproduzível;
- `npm run verify`;
- migration integrity check;
- lint;
- typecheck;
- testes Node, incluindo `password-session-management-contract.test.mjs`;
- build Next.js;
- PostgreSQL 18;
- `npm run verify:db`.

Não houve correção de código exigida pelo primeiro CI funcional.

Alterações documentais de fechamento devem gerar novo CI antes do merge.

## 7. PostgreSQL / migrations

A Story não cria schema próprio para senha/sessão e não duplica tabelas do Managed Better Auth.

```text
nova migration: não
mudança de schema de produto: não
PostgreSQL 18: PASS via CI
verify:db: PASS
```

## 8. Neon-specific

Branch isolada:

```text
Projeto: caleida-nonprod / patient-glade-95136440
Baseline: main / br-restless-cherry-awpcwy6r
Verificação: verify-us-auth-007 / br-wandering-mountain-awjnqqps
Estado: ready
```

Readback:

- provider Better Auth;
- email/password enabled;
- confirmação de e-mail obrigatória por OTP;
- provider de e-mail shared Neon;
- branch Auth isolada da baseline;
- usuários: 0;
- sessões: 0;
- accounts: 0;
- verification rows: 0;
- schema diff versus baseline: vazio.

Nenhuma Auth URL real é persistida aqui.

Resultado Neon-specific estrutural/configuração: **PASS**.

Não foram fabricados usuários/sessões diretamente no banco para simular uma prova do provider.

## 9. Browser/live e recovery real

Conforme o protocolo revisado, browser live não é gate automático por Story.

Nesta Story:

```text
browser/live: SKIPPED/deferred para US-AUTH-008
Preview Vercel adicional: NÃO REQUERIDO
MANUAL_ACTION_REQUIRED: none
```

A validação integrada de `US-AUTH-008` deve incluir um recovery real porque o callback depende do trusted origin do runtime candidato. Isso será feito junto dos demais fluxos em uma única release candidate quando material, e não com um Preview adicional só para US-AUTH-007.

## 10. Auditoria

Nenhum novo storage de auditoria foi criado nesta Story para não antecipar US-AUTH-008 nem introduzir conexão runtime de banco apenas para logging.

Guardrail já aplicado: nenhum log de aplicação contém senha atual/nova, recovery token, session token, cookie, Auth URL ou secret. US-AUTH-008 consolidará eventos auditáveis apenas com metadados mínimos não sensíveis.

## 11. Non-goals preservados

- MFA;
- OAuth adicional;
- Data API;
- Production Neon;
- deployment Vercel pela IA;
- criação manual de credenciais no schema `neon_auth`;
- auditoria integrada final;
- exclusão automática de branches Neon.

## 12. Critério de encerramento

US-AUTH-007 pode ser integrada quando:

1. documentação canônica estiver reconciliada;
2. CI do head final estiver `SUCCESS`;
3. diff não contiver mudança fora da Story ou secret;
4. não houver review/thread bloqueante;
5. PR #56 for integrada e CI pós-merge permanecer saudável.

Após isso, a única próxima Story é `US-AUTH-008 — consolidar auditoria e validar Incremento 2`.
