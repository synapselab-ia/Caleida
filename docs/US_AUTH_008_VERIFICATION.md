# US-AUTH-008 — Verificação de auditoria e fechamento do Incremento 2

**Estado:** `EM_REVISAO` — todos os gates técnicos e live em PASS; integração da PR #58 pendente  
**Issue:** `#57`  
**PR:** `#58`  
**Branch Git:** `feat/us-auth-008-audit-integrated-validation`  
**Baseline Neon:** `main / br-restless-cherry-awpcwy6r`  
**Branch Neon isolada:** `verify-us-auth-008 / br-delicate-meadow-aw1u62kn`

## 1. Escopo

US-AUTH-008 fecha o Incremento 2 consolidando auditoria mínima de segurança e uma matriz live integrada para signup/OTP, login/logout, recovery/reset, sessões, autorização e proteção privada.

## 2. Auditoria implementada

Migration canônica:

```text
database/migrations/000008_auth_security_audit.sql
checksum: 4f2ab39dd53413c522648ce7021a0051a163b009486c5dd6e7fcf1e2f81460b8
```

Tabela privada:

```text
caleida_audit.auth_security_events
```

Persistência limitada a tipo de evento, UUID opcional do ator, outcome, reason code e timestamp. E-mail, senha, OTP, recovery token, session token, cookie, Auth URL, connection string, IP e payload arbitrário não pertencem ao contrato.

## 3. Gates portáveis e Neon — PASS

- CI/PostgreSQL 18: PASS;
- migration `000008`: PASS;
- SQL adversarial/ACL: PASS;
- Neon isolated `verify-us-auth-008`: PASS;
- promoção `000008` para baseline non-production: PASS;
- checksum canônico confirmado;
- diff isolada vs baseline após promoção: vazio.

A primeira matriz live encontrou uma falha real na revogação coletiva. O novo head funcional corrigido foi:

```text
9366069ded22a9f1aed444e86153ab1a11db53b2
```

CI da correção:

```text
Run number: #232
Run ID: 34616208433
Job ID: 103318914704
Conclusion: SUCCESS
```

## 4. Defeito encontrado pelo gate live e correção — PASS

Na RC inicial, a operação **Encerrar todas as outras sessões** retornava sucesso, mas a sessão remota permanecia autenticada e presente no Managed Auth.

A implementação anterior delegava ao atalho `revokeOtherSessions()`. O runtime comprovou que ele não efetivava a revogação nessa integração.

Correção aplicada:

1. listar as sessões pelo provider somente no servidor;
2. limitar ao mesmo usuário autenticado;
3. preservar a sessão corrente;
4. revogar explicitamente cada sessão remota por `revokeSession({ token })`;
5. nunca enviar bearer token ao cliente;
6. falhar fechado e auditar erro se listagem/revogação for rejeitada.

O contrato automatizado foi reforçado e o CI #232 passou integralmente.

## 5. Release candidate final

Preview manual/non-production:

```text
deployment: dpl_HqRV6x1Vn5f3GL69wGgy85UDVc9B
commit: c85135418eec133d7e0a5dc8ad6ad816f2c39668
branch: feat/us-auth-008-audit-integrated-validation
state: READY
```

A configuração Preview histórica do projeto aponta para `verify-us-auth-005 / br-small-river-aww0rtxo`. O readback dessa branch confirmou migrations `000001`–`000008` e checksum correto de `000008`, permitindo validar a auditoria do código atual sem criar Production ou um novo ambiente de dados.

A probe usou mailbox descartável GrabMail porque `mail.tm` não entregou os OTPs nos primeiros ensaios. Nenhum endereço temporário, OTP, recovery token ou senha foi persistido nesta evidência.

## 6. Matriz live final — PASS

```text
Probe run #13
Run ID: 34636223750
Job ID: 103384664571
Conclusion: SUCCESS
```

Evidência observada:

- Chrome real: `/app` anônimo redireciona sem renderizar conteúdo privado;
- signup não autorizado → negado;
- signup autorizado → aceito;
- login antes da verificação → negado;
- OTP real → recebido e confirmado;
- login server action → sessão privada estabelecida;
- duas sessões independentes → válidas;
- session id não pertencente ao usuário → negado genericamente;
- revogação individual remota → efetiva após a janela de revalidação;
- revogação de todas as outras sessões → efetiva e sessão corrente preservada;
- recovery para conta inexistente → resposta pública genérica;
- request com Origin divergente → recusado pelo mecanismo CSRF de Server Actions antes da action;
- Origin divergente → zero novo e-mail de recovery;
- recovery para conta existente → mesma resposta pública genérica;
- e-mail de recovery real → recebido;
- reset válido → sucesso;
- replay do mesmo recovery token → rejeitado;
- senha anterior ao reset → rejeitada;
- nova senha → aceita;
- sessões A/B existentes antes do reset → permaneceram ativas após o reset;
- mudança autenticada de senha → sucesso, outras sessões revogadas, sessão corrente preservada;
- senha substituída pela mudança autenticada → rejeitada;
- senha nova → aceita;
- logout → sessão atual invalidada.

### Comportamento real reset/sessões

O Managed Neon Auth observado **não revogou automaticamente sessões existentes após reset por e-mail**. Esse resultado confirma a limitação documentada na US-AUTH-007: a opção upstream `revokeSessionsOnPasswordReset` não estava exposta na configuração gerenciada disponível.

O Caleida não promete essa revogação automática. O usuário pode revogar sessões pela área de segurança e a mudança autenticada de senha revoga as demais explicitamente.

## 7. Trusted origin / CSRF

O ensaio adversarial enviou `Origin: evil.example`. O Next.js recusou o request antes da Server Action por divergência entre `x-forwarded-host` e `origin` e retornou `Invalid Server Actions request`.

Esse request adversarial apareceu como HTTP 500 no runtime, mas:

- não executou a action de recovery;
- não gerou novo e-mail;
- não produziu callback inseguro;
- o fluxo same-origin legítimo permaneceu funcional.

Portanto ele é evidência de bloqueio CSRF, não falha funcional a ser “corrigida” aceitando cross-origin.

## 8. Auditoria live — PASS

Readback restrito a `event_type`, `outcome`, `reason_code` e contagem no intervalo do run #13 confirmou:

```text
auth_proxy_post / denied / login: 3
auth_proxy_post / success / login: 7
auth_proxy_post / success / other_auth_post: 1
auth_proxy_post / success / signup: 1
login / success / completed: 1
logout / success / completed: 1
other_sessions_revoked / success / completed: 1
password_changed / success / completed: 1
password_recovery_requested / accepted / generic_response: 2
password_reset / denied / invalid_or_expired: 1
password_reset / success / completed: 1
session_revoked / denied / target_not_owned: 1
session_revoked / success / remote_session: 1
```

Nenhum secret ou identificador de mailbox foi usado nessa evidência de auditoria.

## 9. Runtime

Nos caminhos funcionais exercitados não houve 5xx não intencional. O warning de cookie de dados de sessão expirado ocorreu durante revalidação com `sessionDataTtl = 1 s` e o servidor seguiu para validação autoritativa, como projetado.

O único 500 observado foi o request adversarial cross-origin deliberadamente abortado pelo Next.js.

## 10. Critério de conclusão

Todos os gates materiais da Story estão em PASS. Antes de marcar `CONCLUÍDA`, resta somente:

1. CI do head documental final;
2. revisão final da PR #58;
3. merge com head esperado;
4. fechamento da Issue #57;
5. CI de `main`;
6. checkpoint pós-merge com SHA real.

## 11. Restrições preservadas

- Production Neon não criada;
- Data API não provisionada;
- nenhum deployment executado pela IA;
- nenhum secret/Auth URL/OTP/token/senha persistido em Git/docs;
- nenhuma branch Neon ou fixture removida sem autorização destrutiva explícita.
