# Incremento 2 — Acesso controlado / EPIC-02

**Status:** CONCLUÍDO  
**Origem:** EPIC-02 — Contas e autenticação  
**Capacidades:** CAP-01, CAP-02, CAP-04, CAP-35  
**Prioridade:** P0/P1

## 1. Objetivo

Entregar a fundação segura de identidade e entrada controlada do beta fechado: autenticação gerenciada, autorização, convites/aprovação, confirmação de e-mail, login/logout, proteção de sessão, recovery, gestão/revogação de sessões e auditoria sem secrets.

## 2. Stories

```text
US-AUTH-001 — fundação Neon Auth + sessão                 CONCLUÍDA (#43/#44)
US-AUTH-002 — papéis/autorização + bootstrap              CONCLUÍDA (#45/#46)
US-AUTH-003 — convites/solicitações + auditoria           CONCLUÍDA (#47/#48)
US-AUTH-004 — e-mail Auth non-production                  CONCLUÍDA (#49/#50)
US-AUTH-005 — cadastro controlado + confirmação OTP       CONCLUÍDA (#51/#52)
US-AUTH-006 — login/logout + proteção de sessão           CONCLUÍDA (#53/#54)
US-AUTH-007 — recovery + gestão/revogação de sessões      CONCLUÍDA (#55/#56)
US-AUTH-008 — auditoria integrada + validação live final  CONCLUÍDA (#57/#58)
```

## 3. Estado integrado entregue

- Managed Better Auth branch-scoped;
- signup fail-closed por convite válido ou solicitação aprovada;
- confirmação obrigatória por OTP;
- login/logout server-side;
- papéis de produto e autorização no servidor/banco;
- rotas privadas protegidas antes de retornar conteúdo;
- recovery anti-enumeração e reset por token de uso único do provider;
- mudança autenticada de senha com revogação das demais sessões;
- consulta e revogação das próprias sessões sem bearer token no cliente;
- revogação coletiva explícita server-side preservando a sessão atual;
- `sessionDataTtl = 1 s` para revalidação rápida;
- auditoria Auth persistente e sanitizada em `caleida_audit.auth_security_events`.

## 4. Banco / Neon — PASS

Baseline non-production:

```text
Project: caleida-nonprod / patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r
Migrations: 000001–000008
```

US-AUTH-008:

- `000008_auth_security_audit.sql` promovida com checksum canônico;
- PostgreSQL 18 + `verify:db`: PASS;
- Neon isolated `verify-us-auth-008`: PASS;
- SQL/ACL adversarial: PASS;
- diff final isolada vs baseline: vazio.

## 5. Gate live acumulado — PASS

Release candidate manual:

```text
dpl_HqRV6x1Vn5f3GL69wGgy85UDVc9B
commit c85135418eec133d7e0a5dc8ad6ad816f2c39668
Preview / non-production / READY
```

Matriz final:

```text
run #13 / 34636223750
job 103384664571
SUCCESS
```

Passaram proteção anônima, signup/OTP, login/logout, multi-sessão, IDOR negado, revogação individual/coletiva, recovery existente/inexistente, CSRF/origin divergente, reset válido, replay negado, senha antiga/nova, mudança autenticada de senha e auditoria live sem secrets.

A matriz encontrou um defeito real na primeira RC: o atalho `revokeOtherSessions()` retornava sucesso sem invalidar a sessão remota. A implementação foi corrigida para revogar explicitamente cada sessão remota server-side, e a RC final comprovou a correção.

## 6. Semântica observada de reset

No Managed Neon Auth exercitado, reset por e-mail **não revogou sessões existentes**. A mudança autenticada de senha revogou as demais sessões e preservou a corrente.

Essa é a semântica documentada do ambiente/configuração atual; o Caleida não promete uma revogação automática que o provider gerenciado não oferece.

## 7. Fechamento Git/CI

```text
PR #58: merged
Issue #57: closed/completed
Merge SHA: 84f7fecb018d6f4b6bc36817accef15f1976f05f
Head final pré-merge: 1336de47bfcfb2d9678197c5532e9cfb255bdf9b
CI pré-merge #245 / 34637332904: SUCCESS
CI pós-merge #246 / 34850194033 / job 103995893357: SUCCESS
```

Não há Issue ou PR aberta após o fechamento.

## 8. Housekeeping

Branches Neon/fixtures temporárias de prova não bloqueiam o incremento. Exclusão é destrutiva e exige autorização explícita.

Production Neon e Data API continuam não provisionados. Deployment Vercel continua exclusivamente humano/manual.

## 9. Próximo passo

O Incremento 2 está encerrado. A próxima unidade canônica é **planejar** o Incremento 3 — Perfis e privacidade / EPIC-03; nenhuma implementação do novo incremento faz parte deste fechamento.
