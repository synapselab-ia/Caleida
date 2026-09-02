# Incremento 1 — Fundação visual do Caleida

**Status:** CONCLUÍDO após integração de `US-DS-001` a `US-DS-004`  
**Épico:** `EPIC-01 — Identidade e design system`  
**Issue de refino:** `#31`  
**Evidência de encerramento:** `docs/INCREMENT_1_VALIDATION.md`  
**Natureza:** incremento operacional de interface; nenhuma funcionalidade de domínio

## 1. Objetivo

Materializar a identidade visual aprovada do Caleida em uma fundação reutilizável antes de contas/autenticação e demais fluxos funcionais.

O incremento transforma o Project Design em contratos executáveis de interface: cores e temas, tipografia/marca, primitivos acessíveis e composição responsiva básica, sem alterar a visão funcional do produto.

## 2. Requisitos canônicos preservados

Do Project Design §§21–27:

- personalidade cultural, íntima, sofisticada, organizada, tecnológica, levemente lúdica e autoral;
- evitar dashboard empresarial genérico, streaming clone, loja, cassino, interface infantil ou rede social indiferenciada;
- paleta e temas materializados por tokens semânticos;
- Manrope para interface e Newsreader para contexto editorial;
- assinatura geométrica discreta como recurso visual auxiliar;
- cor nunca como único identificador de categoria;
- movimento discreto, funcional e reduzível;
- NFR-01 responsividade e NFR-02 acessibilidade/WCAG 2.2 AA como requisitos transversais.

Dos protocolos vigentes:

- CI permanece sem CD;
- deployment Vercel permanece exclusivamente humano/manual;
- nenhuma Story do incremento cria banco, Auth, RLS, Storage ou infraestrutura por conveniência visual;
- nenhuma decisão arquitetural material nova foi necessária.

## 3. Stories concluídas

### US-DS-001 — Materializar tokens de cor e temas base

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue:** `#33`
- **PR:** `#34`
- **Documentação:** `docs/DESIGN_TOKENS.md`

Resultado:

- paleta de marca e aliases semânticos materializados em `src/app/globals.css`;
- light/dark seguem `prefers-color-scheme` sem JavaScript ou preferência persistida;
- sete categorias possuem tokens próprios e texto normal/foco têm contratos de contraste automatizados;
- Manhua/coral `#D9685B`, Série/ciano `#278EAF` e Anime/verde-azulado `#278F83` foram documentados;
- nenhuma dependência, feature, migration ou infraestrutura foi adicionada.

### US-DS-002 — Integrar tipografia e assinatura de marca

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue:** `#35`
- **PR:** `#36`
- **Documentação:** `docs/BRAND_TYPOGRAPHY.md`

Resultado:

- Manrope e Newsreader centralizadas por `next/font`;
- Manrope é a fonte padrão da interface; Newsreader possui papel editorial explícito;
- o único asset oficial, `public/brand/caleida-logo-horizontal.png`, foi integrado por `next/image`;
- variantes clara/escura, símbolo, favicon, vetores e ícones permanecem pendências reais, sem fabricação automática;
- nenhum redesign funcional, banco ou infraestrutura foi antecipado.

### US-DS-003 — Criar primitivos acessíveis essenciais

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue:** `#37`
- **PR:** `#38`
- **Documentação:** `docs/UI_PRIMITIVES.md`

Resultado:

- `Button` nativo e tipado com foco visível, disabled nativo e hover somente em enabled;
- `FormField` com label explícito, descrição/erro programaticamente associados e `aria-invalid` proporcional;
- `Feedback` diferencia nota estática, status não urgente e alerta urgente;
- contratos automatizados protegem semântica, foco, estados e ausência de biblioteca externa;
- nenhuma tela ou feature de produto foi criada.

### US-DS-004 — Consolidar fundação responsiva e aplicar identidade à base

- **Prioridade:** P1
- **Estado:** CONCLUÍDA APÓS INTEGRAÇÃO
- **Issue:** `#39`
- **PR:** `#40`
- **Evidência:** `docs/INCREMENT_1_VALIDATION.md`

Resultado:

- a página técnica neutra foi substituída por composição cultural/editorial coerente com a marca;
- tokens, Manrope/Newsreader e o logo horizontal oficial são usados sem valores/ativos paralelos;
- o wrapper do logo passou a possuir caixa de layout real (`block`) e comportamento responsivo estável;
- a composição é mobile-first, possui `overflow-x-hidden` e breakpoints progressivos para tablet/notebook/desktop;
- as sete categorias são apresentadas com marcador de cor **e rótulo textual**;
- nenhuma interação, CTA, formulário, link ou fluxo futuro é fabricado;
- nenhuma animação ou dependência de hover foi introduzida;
- `tests/base-visual-foundation-contract.test.mjs` protege semântica, responsividade, temas, categorias e ausência de fluxo falso.

Verificação da Story:

- CI inicial da PR #40 `33662849749`: `FAIL` legítimo em contrato legado do logo; lint, typecheck e os seis testes novos passaram;
- causa: teste antigo exigia literalmente a sequência anterior de classes e não reconhecia o fortalecimento da caixa responsiva;
- contrato atualizado sem relaxar gate;
- head técnico corrigido `a4198a7c7508ae9ede628c59455a64d00cd55d94`, CI `33663025148`: `PASS` para `npm run verify`, build, PostgreSQL 18 e `npm run verify:db`;
- browser real: `SKIPPED` — a sessão não obteve checkout/dev server local porque o ambiente não resolveu `github.com`; nenhum deployment externo foi criado para contornar a limitação;
- Neon-specific: `SKIPPED — nenhuma mudança de dados ou comportamento gerenciado do Neon`;
- Vercel deployment: `SKIPPED/PROIBIDO` conforme `ADR-007`;
- CI do head documental final ainda deve estar `PASS` antes do merge e CI pós-merge da `main` deve passar antes do fechamento operacional; evidência final será registrada em `#39/#40`.

## 4. Porta de saída do Incremento 1

- tokens visuais canônicos e temas light/dark reutilizáveis: `PASS`;
- tipografia de referência integrada: `PASS`;
- assinatura de marca existente integrada sem variantes fabricadas: `PASS`;
- primitivos mínimos acessíveis e testados: `PASS`;
- layout base responsivo e sem fluxo falso: `PASS` por código/contrato/build; browser real `SKIPPED` com motivo registrado;
- WCAG 2.2 AA considerada em contraste, foco, labels e semântica: `PASS` nos contratos executados;
- redução de movimento: `PASS — nenhuma animação introduzida na composição base`;
- lint, typecheck, testes e build: `PASS` no head técnico corrigido;
- banco/infraestrutura criados por conveniência visual: `PASS — nenhum`;
- deployment: `PASS — separado do desenvolvimento e não executado`.

O fechamento operacional definitivo exige ainda CI do head documental final e CI pós-merge em `PASS`, conforme `docs/INCREMENT_1_VALIDATION.md`.

## 5. Impacto técnico final

| Área | Resultado |
|---|---|
| Banco / migrations | nenhuma alteração |
| RLS / Auth / Data API | nenhuma alteração |
| Neon-specific | `SKIPPED` em todas as Stories visuais |
| Storage | nenhuma alteração |
| Dependências | nenhuma biblioteca de UI adicionada |
| Vercel | build compatível; nenhum projeto/deployment criado |
| Segurança | sem superfície funcional falsa; foco/semântica protegidos |

## 6. Próximo horizonte

O próximo épico funcional definido pelo Project Design é:

> `EPIC-02 — Contas e autenticação`

Ele cobre convites, cadastro, login, sessão, SMTP, papéis e auditoria básica e toca decisões de segurança/Neon Auth que evoluem rapidamente. Por isso, **não deve ser implementado diretamente a partir deste plano visual**.

## 7. Próxima ação promovida

> `OPS-006 — Refinar o próximo incremento funcional (EPIC-02 — Contas e autenticação)`

O refino deve confrontar CAP-01, CAP-02, CAP-04 e CAP-35 com `ADR-005`, arquitetura atual, estado real do Neon e documentação oficial corrente de Neon Auth/Data API antes de produzir Stories pequenas, critérios de segurança, gates de RLS/Auth e ordem de execução.

Não implementar Auth, criar secrets, provisionar Production ou executar deployment durante o refino.
