# US-AUTH-007 — Verification

**Story:** Recuperação de senha e gestão/revogação de sessões  
**Issue:** #55 — CLOSED / completed  
**PR:** #56 — MERGED  
**Branch:** `feat/us-auth-007-password-session-management`  
**Merge:** `31ec6e2238a7b0bdaff7506ac0e9ed51179f3322`  
**Estado:** CONCLUÍDA  
**Data de encerramento:** 11/09/2026

## 1. Escopo implementado

US-AUTH-007 materializou:

- `/forgot-password` com resposta anti-enumeração;
- `/reset-password` para conclusão por token do provider;
- alteração autenticada de senha com confirmação da senha atual;
- `/account/security` sob o boundary privado existente;
- listagem das próprias sessões;
- revogação individual por ID opaco resolvido server-side;
- encerramento das outras sessões;
- redução explícita do cache de dados de sessão de 300 s para 1 s;
- testes de contrato específicos para recovery/password/session management.

Contrato: `docs/SESSION_SECURITY.md`.

## 2. SDK e implementação upstream revalidados

Versão utilizada:

```text
@neondatabase/auth 0.5.0-beta
```

Código oficial corrente do Neon SDK revalidado em `neondatabase/neon-js` commit `029a3367ee140d2c8987601b0e338000fe6db1e6`:

- `requestPasswordReset()`;
- `resetPassword()`;
- `changePassword()`;
- `listSessions()`;
- `revokeSession()`;
- `revokeOtherSessions()`;
- `sessionDataTtl` positivo, default upstream 300 s.

Implementação Better Auth revalidada no commit `8d37cc3b7732a04908b28d8abb7f010a286d6c43`:

- request de recovery usa resposta equivalente para usuário inexistente e simula trabalho para reduzir timing leak;
- token de reset é temporário, expira por padrão em uma hora e é consumido antes da mudança de senha;
- operações sensíveis usam sessão autoritativa em deployment stateful;
- `revokeSession` restringe remoção ao mesmo usuário autenticado;
- `revokeOtherSessions` preserva a sessão corrente;
- reset só revoga todas as sessões automaticamente quando `revokeSessionsOnPasswordReset` está habilitado no servidor.

## 3. Segurança do fluxo

### Anti-enumeração

A resposta pública da solicitação de recovery é sempre:

```text
Se existir uma conta para esse e-mail, você receberá instruções para redefinir a senha.
```

Erros do provider não são ecoados para a UI.

### Callback

O callback é derivado da origem da própria requisição apenas quando host e origin/referer correspondem. HTTPS é obrigatório, com HTTP permitido somente para localhost/127.0.0.1. Nenhum domínio real de Preview/Production é hardcoded.

### Tokens e senha

- recovery token não é escrito em logs/docs;
- session token não é serializado para UI;
- revogação recebe somente `session.id` no cliente;
- bearer token é resolvido server-side após ownership;
- senha nova possui boundary local de 8–128 caracteres;
- alteração autenticada exige senha atual e `revokeOtherSessions: true`.

## 4. Cache e revogação

Antes:

```text
sessionDataTtl = 300 s
```

Depois:

```text
sessionDataTtl = 1 s
```

O SDK rejeita TTL `<= 0`; 1 s é o menor valor positivo adotado.

Semântica aprovada:

- endpoints sensíveis fazem validação autoritativa upstream;
- o boundary comum pode reutilizar dados assinados por aproximadamente 1 s antes de revalidar;
- sessão revogada remotamente pode permanecer aparentemente válida somente dentro dessa pequena janela de cache já emitida;
- isso não altera a duração do token de sessão.

## 5. Reset por e-mail e sessões existentes

Readback do schema gerenciado `neon_auth.project_config` na branch isolada mostrou as chaves atuais de `email_and_password` sem `revokeSessionsOnPasswordReset`.

Consequência: o Caleida **não afirma** que recovery por e-mail revoga automaticamente sessões pré-existentes. Alteração autenticada encerra as demais sessões e a área de segurança fornece revogação explícita. US-AUTH-008 deve medir o comportamento live real do reset em cenário multi-device.

## 6. GitHub / CI

### Primeiro head funcional

```text
Commit: df745df9a05232372e8a1e1b269bc5502499503b
CI #221 / run 34519793813 / job 103014162360: SUCCESS
```

### Head final da PR

```text
Commit: 2c139f817bfcb8c9b7e316e26c0fcb883d33ab71
CI #222 / run 34597671892 / job 103257145584: SUCCESS
```

### Integração

```text
PR #56: MERGED
Merge: 31ec6e2238a7b0bdaff7506ac0e9ed51179f3322
Issue #55: CLOSED / completed
CI pós-merge #223 / run 34597951573 / job 103258037267: SUCCESS
```

Nos CIs finais passaram:

- runtime contract Node 24;
- instalação reproduzível;
- `npm run verify`;
- migration integrity check;
- lint;
- typecheck;
- testes Node;
- build Next.js;
- PostgreSQL 18;
- `npm run verify:db`.

## 7. PostgreSQL / migrations

```text
nova migration: não
mudança de schema de produto: não
PostgreSQL 18: PASS
verify:db: PASS
```

Senha e sessão continuam gerenciadas pelo Managed Better Auth; nenhuma credencial foi duplicada em schema próprio.

## 8. Neon-specific

```text
Projeto: caleida-nonprod / patient-glade-95136440
Baseline: main / br-restless-cherry-awpcwy6r
Verificação: verify-us-auth-007 / br-wandering-mountain-awjnqqps
Estado: ready
Provider: Better Auth
Email/password: enabled
Confirmação de e-mail: required / OTP
Email provider: shared Neon
Usuários/sessões/accounts/verifications: 0
Schema diff versus baseline: vazio
```

Nenhuma Auth URL real é persistida neste documento. A baseline não foi usada como laboratório destrutivo.

Resultado Neon-specific estrutural/configuração: **PASS**.

## 9. Browser/live

```text
browser/live US-AUTH-007: SKIPPED/deferred para US-AUTH-008
Preview Vercel adicional: NÃO REQUERIDO
```

A decisão segue a política canônica: o gate live acumulado será executado em US-AUTH-008. Recovery real, trusted origin, senha antiga/nova e revogação multi-device devem fazer parte dessa matriz.

## 10. Auditoria

US-AUTH-007 não criou novo storage de auditoria para não antecipar US-AUTH-008. Nenhum log persistente da Story registra senha, recovery token, session token, cookie, Auth URL ou secret.

US-AUTH-008 consolidará os eventos auditáveis com metadados mínimos não sensíveis.

## 11. Non-goals preservados

- MFA;
- OAuth adicional;
- Data API;
- Production Neon;
- deployment Vercel pela IA;
- criação manual de credenciais no schema `neon_auth`;
- exclusão automática de branches Neon.

## 12. Resultado

US-AUTH-007 está **CONCLUÍDA**. Todos os gates materiais da Story passaram, a PR #56 foi integrada e a `main` permaneceu saudável no CI pós-merge.

Próxima Story única: `US-AUTH-008 — Consolidar auditoria e validar Incremento 2`.
