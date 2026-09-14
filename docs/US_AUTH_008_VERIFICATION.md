# US-AUTH-008 — Verificação de auditoria e fechamento do Incremento 2

**Estado:** `CONCLUÍDA`  
**Issue:** `#57` — closed/completed  
**PR:** `#58` — merged  
**Merge:** `84f7fecb018d6f4b6bc36817accef15f1976f05f`  
**Branch Git:** `feat/us-auth-008-audit-integrated-validation`  
**Baseline Neon:** `main / br-restless-cherry-awpcwy6r`  
**Branch Neon isolada:** `verify-us-auth-008 / br-delicate-meadow-aw1u62kn`

## 1. Escopo

US-AUTH-008 encerrou o Incremento 2 consolidando auditoria mínima de segurança e uma matriz live integrada para signup/OTP, login/logout, recovery/reset, sessões, autorização e proteção privada.

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

- migration `000008`: PASS;
- PostgreSQL 18 + `npm run verify:db`: PASS;
- SQL adversarial/ACL: PASS;
- Neon isolated `verify-us-auth-008`: PASS;
- promoção `000008` para baseline non-production: PASS;
- checksum canônico confirmado;
- diff isolada vs baseline após promoção: vazio.

## 4. Defeito encontrado pelo live gate e correção — PASS

A primeira RC revelou que **Encerrar todas as outras sessões** retornava sucesso, mas a sessão remota permanecia autenticada e presente no Managed Auth.

A implementação foi corrigida para:

1. listar sessões pelo provider somente no servidor;
2. limitar ao mesmo usuário autenticado;
3. preservar a sessão corrente;
4. revogar explicitamente cada sessão remota por `revokeSession({ token })`;
5. manter bearer token exclusivamente no servidor;
6. falhar fechado e auditar erro se listagem/revogação for rejeitada.

Head funcional da correção:

```text
9366069ded22a9f1aed444e86153ab1a11db53b2
CI #232 / run 34616208433 / job 103318914704: SUCCESS
```

## 5. Release candidate final

Preview manual/non-production:

```text
deployment: dpl_HqRV6x1Vn5f3GL69wGgy85UDVc9B
commit: c85135418eec133d7e0a5dc8ad6ad816f2c39668
state: READY
```

A configuração Preview histórica apontou para `verify-us-auth-005 / br-small-river-aww0rtxo`. O readback confirmou migrations `000001`–`000008` e checksum correto de `000008`.

A probe usou mailbox descartável GrabMail após falha de entrega em `mail.tm`. Nenhum endereço temporário, OTP, recovery token ou senha foi persistido nesta evidência.

## 6. Matriz live final — PASS

```text
Probe run #13
Run ID: 34636223750
Job ID: 103384664571
Conclusion: SUCCESS
```

Evidência observada:

- Chrome real: `/app` anônimo redireciona sem renderizar conteúdo privado;
- signup não autorizado negado;
- signup autorizado aceito;
- login antes da verificação negado;
- OTP real recebido e confirmado;
- login server action estabeleceu sessão privada;
- múltiplas sessões independentes válidas;
- session id não pertencente ao usuário negado genericamente;
- revogação individual remota efetiva após a janela de revalidação;
- revogação coletiva efetiva preservando a sessão corrente;
- recovery inexistente e existente com mesma resposta pública genérica;
- Origin divergente recusado pelo mecanismo CSRF de Server Actions antes da action;
- Origin divergente gerou zero novo e-mail de recovery;
- recovery real recebido;
- reset válido concluído;
- replay do mesmo recovery token rejeitado;
- senha anterior ao reset rejeitada e nova senha aceita;
- sessões existentes antes do reset permaneceram ativas após o reset;
- mudança autenticada de senha revogou as demais sessões e preservou a corrente;
- logout invalidou a sessão atual.

## 7. Trusted origin / CSRF

O ensaio adversarial com `Origin: evil.example` foi recusado pelo Next.js antes da Server Action por divergência entre `x-forwarded-host` e `origin`.

Esse request apareceu como HTTP 500 `Invalid Server Actions request`, mas não executou recovery, não gerou e-mail e não produziu callback inseguro. Portanto é evidência de bloqueio CSRF, não falha funcional do fluxo legítimo.

## 8. Auditoria live — PASS

O readback do intervalo do run final confirmou eventos esperados para login, logout, recovery, reset, password change, revogação individual/coletiva e proxy Auth, com outcomes/reason codes controlados e sem dados sensíveis.

## 9. Semântica real reset/sessões

O Managed Neon Auth observado **não revogou automaticamente sessões existentes após reset por e-mail**.

O Caleida não promete essa revogação automática. Sessões podem ser revogadas pela área de segurança e a mudança autenticada de senha revoga as demais explicitamente.

## 10. Fechamento Git/CI — PASS

```text
Head final pré-merge: 1336de47bfcfb2d9678197c5532e9cfb255bdf9b
CI pré-merge #245 / run 34637332904: SUCCESS
PR #58: merged
Merge SHA: 84f7fecb018d6f4b6bc36817accef15f1976f05f
Issue #57: closed/completed
CI pós-merge #246 / run 34850194033 / job 103995893357: SUCCESS
```

Runtime contract, `npm run verify`, PostgreSQL 18 e `npm run verify:db` passaram no pós-merge.

## 11. Restrições preservadas

- Production Neon não criada;
- Data API não provisionada;
- nenhum deployment executado pela IA;
- nenhum secret/Auth URL/OTP/token/senha persistido em Git/docs;
- nenhuma branch Neon ou fixture removida sem autorização destrutiva explícita.
