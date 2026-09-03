# Execution Plan — Caleida

**Status:** roadmap operacional canônico  
**Regra:** uma `NEXT_ACTION` limitada por vez  
**Roadmap de produto:** `docs/PRODUCT_BACKLOG.md`

Este documento transforma o backlog em tarefas executáveis. Evidências detalhadas ficam nos documentos de verificação e Issues/PRs indicados.

---

# Operações canônicas concluídas

- `OPS-001` — protocolo canônico v2: **CONCLUÍDO**.
- `OPS-002` — pivot Supabase → Neon: **CONCLUÍDO**.
- `OPS-003` — deployment Vercel exclusivamente humano/manual: **CONCLUÍDO**.
- `OPS-004` — ADRs como autoridade arquitetural: **CONCLUÍDO**.
- `OPS-005` — refino do Incremento 1: **CONCLUÍDO** (#31).
- `OPS-006` — refino do EPIC-02: **CONCLUÍDO** (#41 / #42).

# Incremento 0 — Fundação executável

**Estado:** CONCLUÍDO  
**Evidência:** `docs/INCREMENT_0_VALIDATION.md`

Inclui Next.js/TypeScript/Tailwind, Neon non-production, migrations/testes, CI sem CD, Vercel preparado para release manual e ciclo Issue → branch → PR → CI → merge validado.

# Incremento 1 — Fundação visual / EPIC-01

**Estado:** CONCLUÍDO  
**Evidência:** `docs/INCREMENT_1_VALIDATION.md`

```text
US-DS-001 tokens/temas — CONCLUÍDA (#33 / #34)
US-DS-002 tipografia/marca — CONCLUÍDA (#35 / #36)
US-DS-003 primitivos acessíveis — CONCLUÍDA (#37 / #38)
US-DS-004 fundação responsiva — CONCLUÍDA (#39 / #40)
```

---

# Incremento 2 — Acesso controlado / EPIC-02

**Estado:** EM ANDAMENTO; US-AUTH-004 aguarda gate externo  
**Plano:** `docs/INCREMENT_2_PLAN.md`

## US-AUTH-001 — Fundação Neon Auth e sessão

**Estado:** CONCLUÍDA  
**Issue/PR:** `#43 / #44`  
**Evidência:** `docs/US_AUTH_001_VERIFICATION.md`

Resultado: Managed Better Auth, boundary server-only/fail-closed, sessão cacheada de forma explícita e CI pós-merge `33753190237` em PASS.

## US-AUTH-002 — Papéis, autorização e bootstrap

**Estado:** CONCLUÍDA  
**Issue/PR:** `#45 / #46`  
**Evidência:** `docs/US_AUTH_002_VERIFICATION.md`

Resultado: cinco papéis Caleida separados do Admin Better Auth, migration `000002`, auditoria, autopromoção negada e bootstrap owner controlado. CI pós-merge `33770088254` em PASS.

## US-AUTH-003 — Convites, solicitações e auditoria de entrada

**Estado:** CONCLUÍDA  
**Issue/PR:** `#47 / #48`  
**Evidência:** `docs/US_AUTH_003_VERIFICATION.md`

Resultado:

- migration `000003_entry_control.sql`;
- convite único/reutilizável com digest, validade, destinatário e capacidade;
- solicitações em espera/aprovadas/recusadas/arquivadas;
- auditoria compacta;
- row lock + prova concorrente real;
- migration promovida à baseline sem fixtures.

Fechamento:

```text
Merge: 3cecfaf6eef357ece3096873d6847e334510db94
CI final PR: 33773066584 — PASS
CI pós-merge main: 33773379852 — PASS
```

## US-AUTH-004 — Selecionar e integrar e-mail transacional non-production

**Estado:** EM ANDAMENTO / MANUAL_ACTION_REQUIRED  
**Issue:** `#49`  
**PR:** `#50`  
**Branch:** `feat/us-auth-004-transactional-email`  
**Prioridade:** P0  
**Capacidades:** CAP-01, CAP-02  
**Decisão:** `ADR-009`  
**Contrato:** `docs/EMAIL_TRANSPORT.md`  
**Evidência:** `docs/US_AUTH_004_VERIFICATION.md`

### Decisão

Resend foi selecionado para non-production após revalidação oficial de pricing/limites/privacidade e comparação com Brevo, Mailgun e Amazon SES.

Guardrails principais:

- REST da aplicação por `fetch` nativo, sem SDK obrigatório;
- SMTP customizado do mesmo provedor para Neon Auth quando credencial real existir;
- `RESEND_API_KEY` somente server-side com `sending_access`, preferencialmente limitada ao domínio;
- idempotência obrigatória em envios da aplicação;
- região São Paulo pode controlar roteamento, não residência de dados;
- metadados/logs/API do Resend permanecem nos EUA conforme documentação verificada;
- Production exige revalidação e credenciais próprias.

### Implementação já realizada

- `src/lib/email/server.ts` — boundary server-only;
- `.env.example` — nomes de configuração sem valores;
- `tests/email-transport-contract.test.mjs` — 5 contratos novos;
- `docs/adr/ADR-009-resend-transactional-email.md`;
- `docs/EMAIL_TRANSPORT.md`;
- reconciliação de arquitetura/ambientes/estado.

### Invariante de entrada

A boundary de e-mail não acessa banco. No fluxo futuro, convite só muda `criado → enviado` depois de confirmação do provedor. Falha de transporte não chama `consume_invitation` e não consome capacidade.

### CI técnico

```text
Run: 33786184072
Head: 9de864fd17a515207e123cfb3cb88344a83f08fe
npm ci: PASS / 0 vulnerabilities
npm run verify: PASS
Node tests: 60/60 PASS
build: PASS
PostgreSQL 18 + verify:db: PASS
```

Nenhuma migration foi adicionada em US-AUTH-004.

### Gate externo pendente

Não declarar a Story concluída e não promover US-AUTH-005 enquanto não houver prova live non-production.

Ação externa necessária, sem compartilhar secret pelo chat/Git:

1. criar/usar conta Resend non-production;
2. verificar domínio/subdomínio apropriado (SPF/DKIM);
3. criar API key `sending_access`, preferencialmente restrita ao domínio;
4. armazenar a chave fora do Git/chat;
5. configurar o email provider do Neon Auth non-production como SMTP Resend diretamente em superfície segura;
6. manter `require_email_verification=false`;
7. avisar apenas que a configuração está pronta.

Depois disso:

1. revalidar configuração Neon com secrets redigidos;
2. executar envio/teste live permitido;
3. registrar resultado em `docs/US_AUTH_004_VERIFICATION.md`;
4. executar CI final do head;
5. review;
6. merge #50;
7. confirmar Issue #49 fechada e CI pós-merge;
8. somente então promover `US-AUTH-005`.

### Non-goals preservados

- signup completo;
- login/logout;
- OAuth;
- `require_email_verification=true` antes de US-AUTH-005;
- fila/outbox persistente sem necessidade;
- Production Neon;
- deployment Vercel.

---

# Próxima ação única

> `US-AUTH-004 — concluir gate live Resend/Neon Auth non-production sem expor secrets`.

US-AUTH-005 **não** é a próxima ação enquanto #49/#50 estiverem abertas.

# Contrato de execução

1. recuperar estado canônico + remoto;
2. executar somente a `NEXT_ACTION`;
3. manter Issue/branch/PR limitadas;
4. verificar antes de concluir;
5. atualizar ADR/docs quando material;
6. nunca versionar secret;
7. nunca executar deployment Vercel;
8. deixar exatamente uma próxima ação.
