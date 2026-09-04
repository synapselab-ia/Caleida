# US-AUTH-005 — Verificação do cadastro controlado

**Estado:** MANUAL_ACTION_REQUIRED  
**Issue:** `#51`  
**PR:** `#52`  
**Branch Git:** `feat/us-auth-005-controlled-signup`  
**Branch Neon isolada:** `verify-us-auth-005 / br-small-river-aww0rtxo`  
**Baseline Neon preservada:** `main / br-restless-cherry-awpcwy6r`

## Objetivo verificado

US-AUTH-005 implementa a fundação fail-closed para que criação de conta dependa de convite válido ou solicitação aprovada, sem confiar em esconder signup na UI.

A unidade introduz:

- autorização curta de signup em `caleida_access.signup_permits`;
- rate limit persistente em `caleida_access.signup_rate_limits`;
- auditoria idempotente de eventos Auth em `caleida_audit.auth_webhook_events`;
- reserva de capacidade de convite antes do signup;
- autorização de solicitação aprovada limitada ao e-mail aprovado;
- `user.before_create` como gate bloqueante;
- `user.created` para finalizar vínculo/consumo;
- validação server-only do webhook Neon Auth por Ed25519 detached JWS, `kid`/JWKS, timestamp e event ID;
- endpoint público de claim com corpo limitado e chave de rate limit pseudonimizada por HMAC;
- respostas externas genéricas, sem expor permit ID, digest de convite ou motivo interno.

## Migrations

### `000004_controlled_signup.sql`

Checksum:

```text
633c913deeedae4eca32890268b9f47b03c67178a0fd9a6edf2e8f05f2890535
```

Cria o modelo de permits/rate limit/auditoria e as funções de autorização/finalização.

### `000005_controlled_signup_consume_fix.sql`

Checksum:

```text
c7211562a5aec011b5af8707f63c9db4171a379c1ee0897567c03f79059ab4f1
```

A migration `000004` já havia sido exercitada pelo runner quando o PostgreSQL revelou ambiguidade entre o campo de retorno `invitation_id` e a coluna homônima dentro da substituição de `consume_invitation`. Em vez de reescrever história aplicada/testada, `000005` substitui a função com aliases qualificados. Isso preserva ADR-004 e o contrato append-only de migrations.

## Gate portátil — PASS

Head técnico verificado:

```text
7083d6d28041539e96c26fa4e88c56d019939a26
```

GitHub Actions:

```text
CI run: 33878842417
Run number: 159
Conclusão: SUCCESS
```

O run aprovou o gate canônico da aplicação e do banco, incluindo:

- runtime Node/npm fixado;
- `npm ci`;
- `npm run verify`;
- migration checksum check;
- lint;
- typecheck;
- testes Node;
- build Next.js;
- PostgreSQL 18;
- `npm run verify:db`;
- testes SQL de entrada/cadastro controlado;
- provas concorrentes versionadas.

A suíte Node contém 62 testes no estado atual e passou integralmente no último ciclo observado antes do gate de banco final.

## Gate Neon isolado — migration/schema PASS

A branch `verify-us-auth-005` já existia como branch isolada derivada da baseline. Antes da aplicação, seu ledger continha somente `000001`–`000003`.

As migrations `000004` e `000005` foram aplicadas exclusivamente nessa branch em uma única transação lógica. Uma primeira tentativa do conector foi rejeitada pelo driver antes da execução por agrupar múltiplos comandos em um prepared statement; o readback imediatamente posterior confirmou rollback completo: nenhuma tabela nova e nenhum ledger novo existiam. A aplicação foi então repetida com um statement por item dentro da transação e concluiu com sucesso.

Readback do ledger isolado:

```text
000001_migration_ledger.sql
4d9a403d6bd074faeca04bf3e714fd8066e5e9f3ae7358bbc0f27a1faf2f14c2

000002_product_authorization.sql
0ba6981b583ac8ed693a2a6b6eabc0c84d12678bdf9953e845a239d6b48493c8

000003_entry_control.sql
503700640a81cf41dfe56a0abe70fc581b9c64d8e9ad6585cbcb55d4751b7c5f

000004_controlled_signup.sql
633c913deeedae4eca32890268b9f47b03c67178a0fd9a6edf2e8f05f2890535

000005_controlled_signup_consume_fix.sql
c7211562a5aec011b5af8707f63c9db4171a379c1ee0897567c03f79059ab4f1
```

Readback confirmou existência de:

- `caleida_access.signup_permits`;
- `caleida_access.signup_rate_limits`;
- `caleida_audit.auth_webhook_events`;
- `issue_signup_permit_from_invitation`;
- `claim_signup_authorization`;
- `finalize_signup_authorization`;
- `consume_invitation`.

A branch isolada permaneceu sem dados de teste após a aplicação:

```text
Auth users: 0
Invitations: 0
Invitation uses: 0
Access requests: 0
Signup permits: 0
Signup rate limits: 0
Auth webhook events: 0
```

## Baseline Neon — preservada

Readback da baseline `main / br-restless-cherry-awpcwy6r` depois da aplicação isolada confirmou que seu ledger continua exatamente em `000001`–`000003`.

Nenhuma migration US-AUTH-005 foi promovida à baseline.

## Better Auth isolado — estado atual

Readback de `verify-us-auth-005` confirmou:

```text
Auth provider: better_auth
Email/password: enabled
allow_sign_up: true
require_email_verification: false
Email provider: shared Neon
Auth users: 0
```

O endpoint Auth e o JWKS são branch-scoped. Nenhum secret foi registrado neste documento.

## Gate Neon-specific live — MANUAL_ACTION_REQUIRED

O critério crítico ainda não pode ser declarado `PASS`: é necessário provar que uma chamada real de criação diretamente ao Neon Auth é bloqueada pelo `user.before_create` quando não existir permit, e aceita somente quando existir autorização válida.

A implementação do receptor existe em:

```text
/api/webhooks/neon-auth
```

Porém, no estado real verificado:

1. não existe projeto/deployment Vercel do Caleida na conta conectada para reutilizar como HTTPS público;
2. ADR-007 proíbe a IA de criar Preview/Production ou acionar deployment;
3. a superfície do conector Neon disponível nesta execução não expõe configuração de webhooks Auth;
4. `allow_sign_up=true` permanece deliberadamente ligado e `require_email_verification=false` permanece inalterado até a prova fail-closed.

A documentação atual da Neon continua tratando Auth como branch-scoped e recomenda Preview isolado para testar mudanças sensíveis de Auth. A Neon também documenta suporte atual a configuração de webhooks do Managed Better Auth. O gate não será substituído por localhost ou por teste sintético que ignore o serviço real.

## Ação humana necessária

Executar manualmente um Preview HTTPS da branch Git `feat/us-auth-005-controlled-signup`, apontado para `verify-us-auth-005`, sem promover a baseline.

No ambiente Preview, configurar de forma privada, sem enviar valores ao chat:

```text
DATABASE_URL=<pooled connection da branch verify-us-auth-005>
NEON_AUTH_BASE_URL=<Auth URL branch-scoped>
NEON_AUTH_COOKIE_SECRET=<secret server-only 32+ chars>
CALEIDA_RATE_LIMIT_SECRET=<secret HMAC server-only 32+ chars>
```

Depois, no Neon Auth da branch `verify-us-auth-005`, configurar o endpoint HTTPS público `/api/webhooks/neon-auth` para os eventos necessários ao fluxo:

```text
user.before_create
user.created
```

A prova live deve cobrir pelo menos:

1. signup direto sem convite/aprovação → negado;
2. convite inválido/expirado/revogado/esgotado → negado;
3. e-mail divergente de convite restrito → negado;
4. convite válido reservado → signup permitido e vínculo finalizado;
5. solicitação aprovada → somente o e-mail aprovado é permitido;
6. repetição do mesmo event ID → idempotente;
7. assinatura/timestamp inválidos → receptor falha fechado;
8. nenhum secret aparece em resposta/log persistente.

Somente depois desse gate PASS podem ocorrer promoção das migrations para a baseline, eventual ativação de confirmação obrigatória de e-mail conforme escopo canônico, revisão final, merge da PR e fechamento da Issue.

## Gates finais

| Gate | Estado |
|---|---|
| `npm run verify` / app | PASS |
| PostgreSQL 18 / `verify:db` | PASS |
| concorrência versionada | PASS |
| migration na branch Neon isolada | PASS |
| readback schema/ledger isolado | PASS |
| baseline preservada | PASS |
| Better Auth branch-scoped readback | PASS |
| webhook live contra Neon Auth | MANUAL_ACTION_REQUIRED |
| browser/Preview real | MANUAL_ACTION_REQUIRED |
| promoção para baseline | BLOCKED pelo gate live |
| `require_email_verification=true` | NÃO EXECUTADO deliberadamente |
| merge PR #52 | BLOCKED pelo gate live |
| US-AUTH-006 | NÃO INICIAR |

## Conclusão

US-AUTH-005 está tecnicamente implementada e passou os gates portáteis e de schema na branch Neon isolada, mas **não está concluída**. O fechamento permanece fail-closed até existir a prova live do webhook em HTTPS público. A PR deve permanecer draft e a Issue aberta.