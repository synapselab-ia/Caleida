# Execution Plan — Caleida

**Status:** roadmap operacional canônico  
**Regra:** uma `NEXT_ACTION` limitada por vez  
**Roadmap de produto:** `docs/PRODUCT_BACKLOG.md`

Este documento transforma o backlog macro em tarefas executáveis. Evidências detalhadas de incrementos concluídos ficam nos documentos de validação correspondentes e nos Issues/PRs indicados.

---

# OPS-001 — Modernizar o protocolo canônico

**Estado:** CONCLUÍDO

Resultado: Source of Truth, AI Work Protocol, Verification Protocol, Deployment Policy, Execution Plan e Checkpoint tornaram o repositório recuperável sem memória de chat.

---

# OPS-002 — Formalizar o pivot Supabase → Neon

**Estado:** CONCLUÍDO

Resultado: plataforma Neon formalizada, ambientes isolados definidos, migrations/testes planejados em `database/`, Storage adiado e Project Design reconciliado por amendment.

---

# OPS-003 — Reconciliar a política de deployment

**Estado:** CONCLUÍDO

Resultado: deployment Vercel passou a ser exclusivamente humano/manual; CI ficou separada de CD; Project Design/backlog foram reconciliados.

---

# OPS-004 — Evoluir o registro de decisões para ADRs

**Estado:** CONCLUÍDO

Resultado: `docs/adr/` tornou-se autoridade arquitetural, decisões existentes foram migradas com supersessões preservadas.

---

# Incremento 0 — Fundação executável

**Estado:** CONCLUÍDO  
**Evidência:** `docs/INCREMENT_0_VALIDATION.md`

## Stories concluídas

- `US-PLAT-001 — Inicializar a aplicação web` — Next.js 16.3.3, React 19.2.8, TypeScript strict, Tailwind CSS 4, Node/npm fixados, gates reais;
- `US-PLAT-002 — Organizar a estrutura documental` — documentos canônicos, amendments, arquitetura e continuidade;
- `US-PLAT-003 — Configurar o ambiente local da aplicação` — setup reproduzível e `.env.example` seguro;
- `US-PLAT-004 — Configurar a fundação Neon de desenvolvimento` — `caleida-nonprod`, PostgreSQL 18, baseline `main`, sem Production/Auth/Data API/Storage funcional;
- `US-PLAT-005 — Definir migrations, testes de banco e RLS` — runners versionados, ledger/checksums, PostgreSQL 18 efêmero e `ADR-008`;
- `US-PLAT-006 — Configurar validações automatizadas` — `npm run verify` e `npm run verify:db`;
- `US-PLAT-007 — Configurar integração contínua` — `.github/workflows/ci.yml`, PostgreSQL 18 e CI sem CD;
- `US-PLAT-008 — Preparar hosting Vercel para release manual` — `vercel.json` com `git.deploymentEnabled: false`, sem projeto/deployment criado;
- `US-PLAT-009 — Separar variáveis por ambiente` — local/non-production/Production explicitamente separados;
- `US-PLAT-010 — Validar o ciclo técnico de entrega` — Issue `#28`, PR `#29`, ciclo `Issue → branch → CI → review → merge → CI main` validado.

Estado técnico consolidado do Incremento 0:

```text
Next.js 16.3.3 / React 19.2.8
TypeScript strict / Tailwind CSS 4
Node 24.20.0 / npm 11.19.0
CI: .github/workflows/ci.yml
Banco canônico: Neon
Non-production: caleida-nonprod / PostgreSQL 18 / branch main
Production Neon: não provisionada
Vercel project: não criado/importado
Deployment: exclusivamente humano/manual
```

---

# OPS-005 — Refinar o Incremento 1 (EPIC-01 — Identidade e design system)

**Estado:** CONCLUÍDO  
**Issue:** `#31`

Resultado: `docs/INCREMENT_1_PLAN.md` decompôs EPIC-01 em quatro Stories ordenadas e preservou NFR-01/NFR-02, sem banco, Auth, Storage ou deployment.

---

# Incremento 1 — Fundação visual / EPIC-01

**Estado:** CONCLUÍDO APÓS INTEGRAÇÃO DE US-DS-004  
**Plano:** `docs/INCREMENT_1_PLAN.md`  
**Evidência:** `docs/INCREMENT_1_VALIDATION.md`

## US-DS-001 — Materializar tokens de cor e temas base

**Estado:** CONCLUÍDO  
**Issue:** `#33`  
**PR:** `#34`

Resultado:

- paleta canônica e aliases semânticos em `src/app/globals.css`;
- light/dark por `prefers-color-scheme` sem JavaScript;
- sete categorias com tokens próprios;
- contraste de texto/foco protegido por `tests/design-tokens-contract.test.mjs`;
- documentação em `docs/DESIGN_TOKENS.md`;
- Neon-specific `SKIPPED`; nenhum deployment.

## US-DS-002 — Integrar tipografia e assinatura de marca

**Estado:** CONCLUÍDO  
**Issue:** `#35`  
**PR:** `#36`

Resultado:

- Manrope como interface e Newsreader como família editorial via `next/font`;
- `CaleidaLogo` integra somente `public/brand/caleida-logo-horizontal.png` por `next/image`;
- variantes de marca ausentes continuam pendências reais;
- contrato em `tests/brand-typography-contract.test.mjs`;
- documentação em `docs/BRAND_TYPOGRAPHY.md`;
- Neon-specific `SKIPPED`; nenhum deployment.

## US-DS-003 — Criar primitivos acessíveis essenciais

**Estado:** CONCLUÍDO  
**Issue:** `#37`  
**PR:** `#38`

Resultado:

- `Button`, `FormField` e `Feedback` mínimos, tipados e baseados em HTML nativo;
- focus-visible explícito, label/descrição/erro associados e live-region roles proporcionais;
- `tests/ui-primitives-contract.test.mjs` protege semântica e estados;
- documentação em `docs/UI_PRIMITIVES.md`;
- nenhuma feature funcional ou biblioteca de UI adicionada;
- Neon-specific `SKIPPED`; nenhum deployment.

## US-DS-004 — Consolidar fundação responsiva e aplicar identidade à base

**Estado:** CONCLUÍDO APÓS INTEGRAÇÃO  
**Issue:** `#39`  
**PR:** `#40`  
**Prioridade:** P1

### Resultado

- `src/app/page.tsx` passou de placeholder técnico neutro para composição cultural/editorial coerente com Project Design §§21–27;
- composição usa apenas tokens canônicos, Manrope/Newsreader e o logo horizontal oficial;
- slogan `Cada história muda o desenho.` recebe papel editorial;
- sete categorias aparecem com marcador cromático **e rótulo textual**;
- layout mobile-first usa proteção contra overflow horizontal e breakpoints progressivos;
- nenhuma interação, CTA, formulário, link ou fluxo futuro é fabricado;
- nenhuma animação ou dependência de hover foi introduzida;
- `CaleidaLogo` passou a possuir wrapper `block`/`shrink-0`, garantindo caixa responsiva real para `next/image fill`;
- `tests/base-visual-foundation-contract.test.mjs` protege semântica, tokens, responsividade, categorias, temas e ausência de fluxo falso;
- contrato legado de marca foi reconciliado com a caixa responsiva mais forte, sem relaxar gate.

### Verificação

- baseline `main`: `43be04c122349ee33a727cd7f8e576df18a54375`, CI anterior `33657214289`: `PASS`;
- CI inicial da PR #40, head `3ba500f2f1c1c10a740c2db3608107df64380bbb`, run `33662849749`: `FAIL` legítimo em teste legado do logo;
- no run inicial, migrations manifest, lint, typecheck e os seis testes novos de US-DS-004: `PASS`;
- causa: teste antigo exigia literalmente a sequência anterior de classes e rejeitou `block`/`shrink-0`/`object-left`;
- correção: contrato atualizado para exigir a nova caixa responsiva, sem remover nem enfraquecer verificação;
- head técnico corrigido `a4198a7c7508ae9ede628c59455a64d00cd55d94`, run `33663025148`: `PASS`;
- `npm run verify`: `PASS`;
- PostgreSQL 18 + `npm run verify:db`: `PASS`, como gate permanente do repositório;
- browser real: `SKIPPED — ambiente da sessão não conseguiu preparar checkout/dev server local porque não resolveu github.com; deployment externo não foi usado como atalho`;
- banco/Neon-specific: `SKIPPED — Story visual sem mudança de dados ou comportamento gerenciado do Neon`;
- consulta/mutação remota Neon: `SKIPPED — não aplicável`;
- Vercel deployment: `SKIPPED/PROIBIDO` conforme `ADR-007`;
- CI do head documental final da PR deve estar `PASS` antes do merge;
- CI pós-merge da `main` deve estar `PASS` antes do fechamento operacional;
- evidência final de SHA/runs deve ser registrada em `#39/#40`.

### Porta de saída do Incremento 1

- tokens/temas: `PASS`;
- tipografia/marca: `PASS`;
- primitivos acessíveis: `PASS`;
- composição responsiva sem fluxo falso: `PASS` por código/contrato/build;
- browser real: `SKIPPED` com motivo explícito;
- acessibilidade estrutural/contraste/foco/labels: `PASS` nos contratos executados;
- redução de movimento: `PASS — nenhuma animação introduzida`;
- dependências/banco/infraestrutura criados por conveniência visual: nenhum;
- deployment: não executado.

---

# OPS-006 — Refinar o próximo incremento funcional (EPIC-02 — Contas e autenticação)

**Estado:** CONCLUÍDO  
**Issue:** `#41`  
**Tipo:** planejamento/refino; Auth não implementado  
**Plano produzido:** `docs/INCREMENT_2_PLAN.md`

## Resultado

OPS-006 transformou EPIC-02 em `Incremento 2 — Acesso controlado`, com oito Stories pequenas e ordenadas:

1. `US-AUTH-001` — fundação Neon Auth isolada e contrato de sessão;
2. `US-AUTH-002` — papéis, autorização e bootstrap administrativo;
3. `US-AUTH-003` — convites, solicitações e auditoria de entrada;
4. `US-AUTH-004` — decisão/integração de e-mail transacional non-production;
5. `US-AUTH-005` — cadastro controlado por convite ou aprovação;
6. `US-AUTH-006` — login, logout e proteção de sessão;
7. `US-AUTH-007` — recuperação de senha e gestão/revogação de sessões;
8. `US-AUTH-008` — consolidação de auditoria e validação do incremento.

### Revalidação técnica

- Neon non-production real: `caleida-nonprod`, PostgreSQL 18, apenas branch baseline `main`, estado `ready`;
- Neon Auth/Data API continuam não provisionados;
- Production Neon continua inexistente;
- somente a migration técnica `000001_migration_ledger.sql` existe;
- Neon Auth corrente é Better Auth gerenciado e branch-scoped, usando SDK oficial `@neondatabase/auth`;
- SDK Next.js corrente centraliza servidor por `createNeonAuth()` e documenta `NEON_AUTH_BASE_URL` + `NEON_AUTH_COOKIE_SECRET`;
- cache de sessão assinado do SDK atual deve ser considerado explicitamente em revogação;
- Neon Auth não permite presumir plugins/handlers server-side customizados de Better Auth, então o gate de beta fechado deve ser provado contra signup direto, não apenas pela UI;
- Data API/RLS continua usando identidade documentada por `auth.user_id()` e exige RLS em tabelas expostas;
- Next.js 16 pode usar `proxy.ts` como proteção antecipada, mas autorização real permanece server-side/banco.

### Arquitetura

Nenhum novo ADR é necessário em OPS-006. `ADR-004`, `ADR-005`, `ADR-007` e `ADR-008` já cobrem a plataforma atual.

A escolha futura do provedor de e-mail permanece decisão aberta e deve ser registrada quando US-AUTH-004 for executada. Se o Neon Auth não oferecer superfície segura para impor o beta fechado, a implementação deve parar e registrar decisão arquitetural em vez de liberar signup público como workaround.

### Non-goals preservados

OPS-006 não:

- provisionou Neon Auth/Data API;
- criou migration funcional, schema ou RLS;
- criou usuário remoto;
- configurou SMTP/OAuth;
- gerou ou versionou secrets;
- criou Production Neon;
- criou/importou projeto Vercel;
- executou deployment.

---

# Incremento 2 — Acesso controlado / EPIC-02

**Estado:** REFINADO; primeira Story PRONTA  
**Plano:** `docs/INCREMENT_2_PLAN.md`

## US-AUTH-001 — Materializar fundação Neon Auth isolada e contrato de sessão

**Estado:** NEXT_ACTION  
**Prioridade:** P0  
**Capacidade:** CAP-01

### Escopo limitado

- branch Neon descartável para gate Neon-specific;
- Neon Auth somente no ambiente isolado durante desenvolvimento/verificação;
- SDK oficial `@neondatabase/auth` corrente;
- contrato server-side de sessão no Next.js 16;
- nomes `NEON_AUTH_BASE_URL` e `NEON_AUTH_COOKIE_SECRET` documentados sem valores;
- fail-closed para configuração/sessão inválida;
- testes proporcionais;
- sem cadastro/login, convite, papéis, Data API, e-mail, OAuth, schema funcional, Production ou deployment.

### Gates

- `npm run verify`;
- PostgreSQL 18 + `npm run verify:db` como gate permanente;
- Neon-specific **obrigatório**;
- baseline Neon `main` não pode ser laboratório destrutivo;
- browser real somente se houver superfície real a validar;
- deployment Vercel proibido para IA.

Se branching/provisionamento isolado do Neon estiver indisponível, marcar `BLOCKED`; não degradar o gate.

---

# Contrato de execução

Para cada tarefa:

1. recuperar estado pelo protocolo;
2. confirmar `NEXT_ACTION`;
3. inspecionar repositório/documentação/estado externo aplicável;
4. criar/usar Issue e branch limitadas;
5. implementar somente o necessário;
6. executar Verification Protocol;
7. revisar diff;
8. atualizar docs/ADRs quando aplicável;
9. atualizar Checkpoint;
10. abrir/revisar/mergear PR;
11. deixar uma única próxima ação.