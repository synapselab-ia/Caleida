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

**Estado:** NEXT_ACTION  
**Tipo:** planejamento/refino; não implementar Auth  
**Backlog:** próximo horizonte funcional do Project Design

## Objetivo

Transformar `EPIC-02 — Contas e autenticação` em um incremento técnico seguro, pequeno e executável antes de escrever qualquer fluxo de identidade.

O Project Design associa o épico a convites, cadastro, login, sessão, SMTP, papéis e auditoria básica e às capacidades CAP-01, CAP-02, CAP-04 e CAP-35. Como o trabalho toca identidade, autorização, e-mail e comportamento gerenciado do Neon, o refino deve revalidar o estado externo e a documentação oficial corrente.

## Inspecionar antes de editar

1. `docs/PROJECT_DESIGN.md`, especialmente CAP-01, CAP-02, CAP-04, CAP-35 e requisitos de privacidade/segurança;
2. `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md`;
3. `docs/ARCHITECTURE.md` e `docs/NEON_PLATFORM.md`;
4. `docs/adr/ADR-004-database-changes-by-migrations.md`;
5. `docs/adr/ADR-005-neon-data-identity-platform.md`;
6. `docs/adr/ADR-008-ephemeral-postgres-verification.md`;
7. `docs/ENVIRONMENTS.md` e estado real do projeto `caleida-nonprod`;
8. documentação oficial corrente de Neon Auth, Neon Data API/RLS e integração Next.js aplicável;
9. contratos atuais de UI/acessibilidade produzidos no Incremento 1;
10. limites de deployment definidos por `ADR-007`.

## Escopo esperado

- definir o próximo incremento funcional e sua porta de saída;
- decompor EPIC-02 em Stories pequenas e ordenadas;
- separar claramente fundação de Auth, convite/cadastro, login/sessão, papéis/autorização, e-mail/SMTP e auditoria quando necessário;
- mapear quais Stories exigem migrations/RLS e quais dependem de comportamento Neon-specific;
- definir casos adversariais mínimos: anônimo, usuário autenticado, usuário não autorizado, sessão inválida/revogada, manipulação de ID/ownership e papel administrativo;
- definir contratos de secrets e ambientes sem valores reais;
- verificar se a arquitetura corrente exige novo ADR antes de qualquer implementação;
- promover exatamente uma primeira Story técnica executável.

## Critérios de aceite

1. CAP-01, CAP-02, CAP-04 e CAP-35 estão rastreadas para Stories do próximo incremento;
2. dependências e ordem de Auth/convites/sessão/papéis/e-mail/auditoria estão explícitas;
3. mudanças de schema/RLS previstas usam migrations e possuem estratégia PostgreSQL + Neon-specific adequada;
4. documentação oficial corrente do Neon/Next.js foi revalidada para APIs/SDKs que a implementação realmente pretende usar;
5. ambientes/secrets estão definidos sem versionar credenciais;
6. nenhum fluxo de Auth, migration funcional, secret, usuário, SMTP/OAuth ou recurso Production é criado durante o refino;
7. nenhum projeto/deployment Vercel é criado;
8. documentação canônica fica com uma única `NEXT_ACTION` técnica.

## Non-goals

- implementar cadastro/login/logout;
- ativar Neon Auth/Data API;
- criar migration funcional ou políticas RLS;
- configurar SMTP/OAuth;
- criar usuários de teste remotos;
- provisionar Neon Production;
- criar/importar projeto Caleida na Vercel;
- executar Preview/Production.

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
