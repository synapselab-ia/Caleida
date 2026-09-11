# US-AUTH-008 — Verificação de auditoria e fechamento do Incremento 2

**Estado:** `MANUAL_ACTION_REQUIRED` — implementação, CI, PostgreSQL 18, Neon isolated e promoção non-production em PASS; matriz live pendente  
**Issue:** `#57`  
**PR:** `#58`  
**Branch Git:** `feat/us-auth-008-audit-integrated-validation`  
**Branch Neon isolada:** `verify-us-auth-008 / br-delicate-meadow-aw1u62kn`  
**Baseline Neon:** `main / br-restless-cherry-awpcwy6r`

## 1. Objetivo

Fechar o Incremento 2 sem criar uma segunda implementação de Auth: consolidar a auditoria mínima dos eventos críticos já implementados, executar os gates de banco/Neon e, por fim, validar em uma única release candidate live o conjunto signup/OTP/login/logout/recovery/sessões/autorização.

## 2. Implementação de auditoria

Migration canônica:

```text
database/migrations/000008_auth_security_audit.sql
checksum: 4f2ab39dd53413c522648ce7021a0051a163b009486c5dd6e7fcf1e2f81460b8
```

Tabela:

```text
caleida_audit.auth_security_events
```

Persistência deliberadamente limitada a:

```text
id
event_type
actor_auth_user_id (nullable)
outcome
reason_code
occurred_at
```

Tipos de evento aceitos:

```text
login
logout
password_recovery_requested
password_reset
password_changed
session_revoked
other_sessions_revoked
auth_proxy_post
```

Outcomes aceitos:

```text
accepted
success
denied
error
```

`reason_code` aceita somente identificador controlado `[a-z0-9_]{2,64}`.

A tabela/sequence têm acesso `PUBLIC` revogado.

## 3. Dados sensíveis deliberadamente ausentes

O schema e o writer não aceitam campos arbitrários. Não são persistidos:

- e-mail;
- senha atual/nova;
- OTP;
- recovery token;
- session token;
- cookie;
- Auth URL;
- connection string;
- IP;
- request body;
- payload completo de provider.

O writer `src/lib/audit/auth-security.ts` é server-only, valida tipo/outcome/reason/UUID e usa query parametrizada.

`tryRecordAuthSecurityEvent()` não deixa uma indisponibilidade de auditoria transformar-se silenciosamente em bypass Auth: o fluxo de autenticação conserva sua semântica e a persistência de auditoria falha isoladamente.

## 4. Integração nos fluxos Auth

`src/lib/auth/actions.ts` registra eventos controlados para:

- login válido/inválido/erro de provider;
- logout;
- solicitação de recovery;
- reset válido/inválido/erro;
- mudança autenticada de senha;
- revogação individual da sessão atual/remota;
- revogação de todas as outras sessões.

A solicitação de recovery continua indistinguível para conta existente/inexistente. O evento persistido é sempre:

```text
password_recovery_requested / accepted / generic_response
```

A auditoria não registra existência da conta.

A rota `src/app/api/auth/[...path]/route.ts` registra POSTs diretos do proxy Auth usando apenas path conhecido + status da resposta. O request body não é lido pela camada de auditoria.

## 5. Compatibilidade com contratos históricos

A nova auditoria exigiu duas correções limitadas em contratos existentes:

1. o teste histórico da fundação Auth passou a proibir chamadas diretas `.signIn/.signUp/.signOut` no proxy, em vez de proibir a simples presença textual dos nomes de operações;
2. o runner de testes de banco exige SQL antes dos scripts `.mjs`; por isso o novo teste SQL usa `000007` e os dois testes concorrentes históricos foram renumerados para `000008` e `000009` sem mudar seu conteúdo funcional.

O contrato `tests/entry-control-contract.test.mjs` foi atualizado somente para acompanhar o novo filename do teste concorrente.

## 6. CI / PostgreSQL 18

Head funcional que fechou a implementação antes desta reconciliação documental:

```text
f093df971207793fcd7a25edcf135707f65973b0
```

CI:

```text
Run number: #229
Run ID: 34601223118
Job ID: 103268721995
Conclusion: SUCCESS
```

Gates observados:

```text
runtime contract: PASS
npm ci: PASS
npm run verify: PASS
  db:migrations:check: PASS
  lint: PASS
  typecheck: PASS
  tests: PASS
  build: PASS
PostgreSQL 18: PASS
npm run verify:db: PASS
  migrations 000001–000008: PASS
  SQL tests: PASS
  invitation concurrency: PASS
  controlled signup concurrency: PASS
```

Falhas intermediárias anteriores foram usadas para corrigir contratos/ordenação; nenhuma foi convertida artificialmente em PASS.

## 7. Gate Neon isolated

Foi criada a branch:

```text
verify-us-auth-008 / br-delicate-meadow-aw1u62kn
parent: main / br-restless-cherry-awpcwy6r
state: ready
```

A primeira tentativa de criação tentou customizar `suspend_timeout` e foi recusada pelo plano da conta antes da criação. A branch foi então criada com os defaults do projeto, sem mudar configuração da baseline.

### Readback antes da migration

Ledger herdado:

```text
000001_migration_ledger.sql
000002_product_authorization.sql
000003_entry_control.sql
000004_controlled_signup.sql
000005_controlled_signup_consume_fix.sql
000006_before_create_without_user_id.sql
000007_claim_signature_compatibility.sql
```

Managed Better Auth foi herdado com email/password habilitado, signup habilitado, confirmação obrigatória por OTP e provider de e-mail shared Neon. Endpoints/secrets reais não foram persistidos nesta evidência.

### Aplicação de 000008

A migration versionada foi aplicada transacionalmente e o ledger recebeu o checksum canônico.

O teste `database/tests/000007_auth_security_audit.sql` foi exercitado no Neon e comprovou:

- tabela existente;
- conjunto exato de colunas;
- eventos válidos aceitos;
- event type arbitrário rejeitado;
- outcome arbitrário rejeitado;
- reason code livre/sensível rejeitado;
- papel não privilegiado sem USAGE/SELECT/INSERT/UPDATE/DELETE;
- cleanup final.

Resultado pós-cleanup:

```text
auth_security_events: 0
auth users: 0
auth sessions: 0
auth accounts: 0
auth verifications: 0
```

O schema diff contra a baseline, antes da promoção, continha somente:

- `auth_security_events`;
- sequence identity;
- primary key;
- índice event_type/occurred_at;
- índice parcial actor/occurred_at.

## 8. Promoção para baseline non-production

Com PostgreSQL 18 e Neon isolated em PASS, a migration `000008` foi promovida deliberadamente para:

```text
caleida-nonprod
main / br-restless-cherry-awpcwy6r
```

Readback final do ledger:

```text
000001_migration_ledger.sql
000002_product_authorization.sql
000003_entry_control.sql
000004_controlled_signup.sql
000005_controlled_signup_consume_fix.sql
000006_before_create_without_user_id.sql
000007_claim_signature_compatibility.sql
000008_auth_security_audit.sql
```

Checksum de `000008` coincide com o arquivo versionado.

Readback de dados:

```text
auth_security_events: 0
auth users: 0
auth sessions: 0
auth accounts: 0
auth verifications: 0
```

Depois da promoção:

```text
compare_database_schema(verify-us-auth-008, main)
diff: vazio
```

Nenhuma fixture da prova isolada foi copiada para a baseline.

## 9. Estado Vercel e motivo do gate manual

O projeto Vercel `caleida` existe e o latest deployment observado é:

```text
dpl_8WN2sKEEL6ex3vKt11vmYX9ZGvoN / READY
```

Ele foi criado na US-AUTH-005 e não contém os fluxos implementados nas US-AUTH-006/007/008. Portanto não pode provar o gate live acumulado atual.

Conforme ADR-007, a IA não cria deployment. Como US-AUTH-008 foi deliberadamente reservada para essa validação, agora existe necessidade material de **uma única Preview manual** da branch da PR #58.

Não usar Production e não criar Preview separado por subfluxo.

## 10. Release candidate manual

Ref candidata:

```text
feat/us-auth-008-audit-integrated-validation
PR #58
```

A publicação só deve ser iniciada depois do CI verde do commit que registra o checkpoint desta fase.

Fluxo pelo dashboard documentado em `docs/VERCEL_RELEASE.md`:

```text
Project caleida
→ Deployments
→ menu de três pontos
→ Create Deployment
→ branch feat/us-auth-008-audit-integrated-validation
→ Preview/non-production
→ Create Deployment
→ aguardar READY
```

## 11. Matriz live a executar na retomada

A mesma RC deve cobrir:

### Visitante e proteção privada

- GET direto `/app` sem sessão;
- GET direto `/account/security` sem sessão;
- redirecionamento para login;
- conteúdo privado não aparece antes do redirect/erro;
- navegação teclado/foco básica nas superfícies Auth relevantes;
- sem erro crítico de console/runtime.

### Signup/OTP

- claim/cadastro controlado usando fixture temporária mínima;
- signup sem autorização negado;
- confirmação OTP real usando mailbox temporária segura;
- usuário não confirmado não autentica;
- confirmado autentica;
- OTP/e-mail temporário não persistidos nos docs.

A metodologia pode reutilizar a prova segura da US-AUTH-005, mas a execução deve ocorrer sobre a RC atual para confirmar a integração acumulada.

### Login/logout

- credencial válida → `/app`;
- credencial inválida → feedback genérico;
- logout → acesso privado perdido;
- auditoria correspondente persistida sem credencial/e-mail.

### Recovery/reset

- solicitação para e-mail existente versus inexistente → resposta pública indistinguível;
- trusted origin aceito;
- origin divergente não produz callback inseguro;
- token válido → reset;
- token inválido/expirado → erro genérico;
- reutilização do token → negada conforme comportamento upstream;
- senha antiga versus nova após reset;
- medir, sem presumir, se sessões existentes sobrevivem ao reset por e-mail.

### Sessões multi-device

- criar duas sessões independentes do mesmo usuário;
- área de segurança lista apenas metadados seguros;
- session token não aparece na UI;
- revogação individual de sessão remota;
- sessão remota perde acesso depois da janela aproximada de cache de 1 s;
- revogação de todas as outras sessões preserva a corrente;
- mudança autenticada de senha revoga as demais e mantém a atual;
- tentativa de revogar session id não pertencente ao usuário é negada.

### Autorização/adversarial

- preservar as negações de papel/ownership já provadas no banco;
- nenhum papel comum ganha operação administrativa por manipulação de ID/payload;
- endpoint/ação sensível não depende apenas de botão escondido.

### Auditoria live

Após os fluxos, ler apenas colunas não sensíveis e confirmar eventos esperados para:

- login;
- logout;
- recovery;
- reset;
- password change;
- session revoke / other sessions revoke;
- POSTs diretos relevantes pelo proxy Auth.

A evidência deve registrar tipos/outcomes/reason codes/contagens necessárias, nunca e-mail/token/cookie/senha/payload.

## 12. Critério de conclusão

Ainda **não** declarar US-AUTH-008 ou Incremento 2 concluídos.

Faltam:

1. Preview manual `READY` da ref candidata;
2. matriz live acima;
3. registro do comportamento real reset/sessões;
4. readback da auditoria live;
5. revisão final da PR #58;
6. atualização desta evidência para PASS/FAIL real;
7. merge somente se todos os gates materiais permitirem.

## 13. Restrições preservadas

- nenhuma Production Neon criada;
- Data API não provisionada;
- nenhum deployment Vercel executado pela IA;
- nenhum secret ou Auth URL real versionado;
- nenhuma branch Neon housekeeping excluída sem autorização explícita.
