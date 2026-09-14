# Incremento 2 — Acesso controlado / EPIC-02

**Status:** EM REVISÃO FINAL — todas as Stories implementadas; US-AUTH-008 com matriz live em PASS e integração da PR #58 pendente  
**Origem:** EPIC-02 — Contas e autenticação  
**Capacidades:** CAP-01, CAP-02, CAP-04, CAP-35  
**Prioridade:** P0/P1

## 1. Objetivo

Entregar a fundação segura de identidade e entrada controlada do beta fechado: autenticação gerenciada, autorização, convites/aprovação, confirmação de e-mail, login/logout, proteção de sessão, recovery, gestão/revogação de sessões e auditoria sem secrets.

## 2. Decisões e ambientes

```text
Neon project: caleida-nonprod / patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r
Managed Better Auth: enabled
email/password: enabled
email verification: required / OTP
email provider: shared Neon
sessionDataTtl: 1 s
Data API: não provisionada
Production Neon: não provisionada
Vercel: deployment exclusivamente humano/manual
```

Decisões canônicas: ADR-004, ADR-005, ADR-007, ADR-008 e ADR-009.

## 3. Stories

```text
US-AUTH-001 — fundação Neon Auth + sessão                 CONCLUÍDA (#43/#44)
US-AUTH-002 — papéis/autorização + bootstrap              CONCLUÍDA (#45/#46)
US-AUTH-003 — convites/solicitações + auditoria            CONCLUÍDA (#47/#48)
US-AUTH-004 — e-mail Auth non-production                   CONCLUÍDA (#49/#50)
US-AUTH-005 — cadastro controlado + confirmação OTP        CONCLUÍDA (#51/#52)
US-AUTH-006 — login/logout + proteção de sessão            CONCLUÍDA (#53/#54)
US-AUTH-007 — recovery + gestão/revogação de sessões       CONCLUÍDA (#55/#56)
US-AUTH-008 — auditoria integrada + validação live final   EM REVISÃO (#57/#58)
```

## 4. Estado integrado comprovado

### Autenticação e entrada

- Managed Better Auth branch-scoped;
- signup fail-closed por convite válido ou solicitação aprovada;
- confirmação obrigatória por OTP;
- login/logout server-side;
- rotas privadas protegidas antes de retornar conteúdo;
- recovery com resposta pública anti-enumeração;
- reset por token de uso único do provider;
- mudança autenticada exige senha atual;
- consulta/revogação das próprias sessões sem bearer token no cliente;
- revogação coletiva implementada por revogação explícita server-side das sessões remotas;
- cache de dados de sessão limitado a aproximadamente 1 segundo para revalidação rápida.

### Auditoria

`000008_auth_security_audit.sql` adiciona `caleida_audit.auth_security_events` com somente tipo, ator opcional, outcome, reason code e timestamp.

Não existem colunas de e-mail, senha, OTP, token, cookie, Auth URL ou payload completo.

## 5. Gates — PASS

### CI / PostgreSQL / Neon

```text
CI da correção live: #232 / 34616208433 / job 103318914704 — SUCCESS
PostgreSQL 18 + verify:db — PASS
verify-us-auth-008 / br-delicate-meadow-aw1u62kn — PASS
promoção 000008 para baseline main — PASS
diff final isolada vs baseline — vazio
```

### Live integrado

RC final:

```text
dpl_HqRV6x1Vn5f3GL69wGgy85UDVc9B
commit c85135418eec133d7e0a5dc8ad6ad816f2c39668
Preview / READY
```

Matriz:

```text
run #13 / 34636223750
job 103384664571
SUCCESS
```

Passaram:

1. proteção anônima e ausência de flash privado;
2. signup controlado;
3. OTP real e bloqueio pré-verificação;
4. login/logout;
5. multi-sessão;
6. IDOR de session id negado;
7. revogação individual remota;
8. revogação de todas as outras sessões preservando a atual;
9. recovery existente/inexistente sem enumeração na resposta pública;
10. origem divergente bloqueada pelo CSRF de Server Actions sem disparar recovery;
11. reset válido e replay negado;
12. senha antiga/nova após reset;
13. medição real das sessões após reset;
14. mudança autenticada de senha revogando as demais;
15. auditoria live de todos os eventos críticos sem secrets.

## 6. Semântica observada de reset

No Managed Neon Auth exercitado, reset por e-mail **não revogou as sessões existentes**. A troca autenticada de senha, por sua vez, revogou as demais sessões e preservou a corrente.

Essa distinção passa a ser comportamento documentado, sem inventar garantia que o provider/configuração gerenciada não oferece.

## 7. Encerramento

O Incremento 2 pode ser declarado `CONCLUÍDO` assim que a US-AUTH-008 for integrada em `main`, a Issue #57 estiver fechada e o CI pós-merge estiver verde.

Branches e fixtures temporárias de prova não bloqueiam o incremento; limpeza destrutiva depende de autorização explícita.

## 8. Próxima ação

> Integrar a PR #58 após o CI/review final e registrar em `main` o SHA real de merge + CI. Só depois disso definir o próximo incremento canônico.
