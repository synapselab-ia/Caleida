# Incremento 1 — Fundação visual do Caleida

**Status:** refinado por `OPS-005`  
**Épico:** `EPIC-01 — Identidade e design system`  
**Issue de refino:** `#31`  
**Natureza:** incremento operacional de interface; nenhuma funcionalidade de domínio

## 1. Objetivo

Materializar a identidade visual aprovada do Caleida em uma fundação reutilizável de UI antes de iniciar contas/autenticação e demais fluxos funcionais.

O incremento deve transformar as regras já aprovadas no Project Design em contratos executáveis de interface: cores e temas, tipografia, primitivos acessíveis e composição responsiva básica.

Este incremento **não altera** a visão funcional do Project Design. O incremento funcional de acesso controlado continua posterior a esta fundação visual.

## 2. Baseline inspecionada

Estado integrado antes do refino:

```text
main: 52065a10416432fd8d5b70b5a92c99a6dd9b5270
Issues abertas: nenhuma
PRs abertas: nenhuma
último CI main: 33560939552 — PASS
```

Interface existente:

- `src/app/globals.css` importa Tailwind CSS e não possui design tokens próprios;
- `src/app/layout.tsx` contém somente metadata e o layout raiz mínimo;
- `src/app/page.tsx` é uma página técnica neutra, sem identidade visual final;
- `public/brand/caleida-logo-horizontal.png` já existe como ativo oficial;
- `public/brand/README.md` registra variantes futuras ainda ausentes.

Neon permaneceu fora do escopo do refino e foi somente conferido: `caleida-nonprod`, PostgreSQL 18, uma branch `main`. Nenhuma mudança de banco é necessária para EPIC-01.

## 3. Requisitos canônicos preservados

Do Project Design:

- personalidade: cultural, íntima, sofisticada, organizada, tecnológica, levemente lúdica e autoral;
- evitar aparência de dashboard empresarial genérico, streaming clone, loja, cassino ou interface infantil;
- paleta principal aprovada: violeta `#7457E8`, magenta `#D85BA8`, azul `#4C8DFF`, verde `#39B99A`, âmbar `#F2A93B`;
- tema escuro: fundo `#101014`, superfícies `#17171D` / `#202028`, borda `#30303A`, texto principal `#F5F4F8`;
- tema claro: fundo `#F7F6FA`, superfície branca, borda `#E4E1EA`, texto principal `#24212A`;
- Manrope como referência de interface e Newsreader para resenhas/citações/retrospectivas;
- cor nunca pode ser o único identificador de categoria;
- animação deve ser discreta, funcional e respeitar redução de movimento;
- NFR-01 responsividade e NFR-02 acessibilidade/WCAG 2.2 AA são transversais.

Dos protocolos vigentes:

- CI continua sem CD;
- deployment Vercel continua exclusivamente humano/manual;
- nenhuma Story deste incremento exige Neon, migration, RLS ou Storage por padrão;
- decisões arquiteturais materiais futuras exigem ADR; calibração visual/tokenização interna não exige ADR por si só.

## 4. Limite do Incremento 1

### Inclui

- tokens de cor e temas light/dark;
- tipografia e hierarquia textual base;
- uso coerente dos ativos de marca já disponíveis;
- primitivos acessíveis mínimos para os próximos fluxos;
- composição/layout base responsivo;
- foco, contraste e redução de movimento como requisitos transversais;
- testes/contratos proporcionais à fundação visual.

### Não inclui

- Auth, convites, sessão ou papéis;
- banco, migrations, Neon Auth/Data API ou RLS;
- catálogo, biblioteca ou qualquer domínio funcional;
- Storage ou upload de avatar/banner;
- componentes específicos de features futuras;
- Storybook, framework E2E ou biblioteca de componentes adicionados sem necessidade demonstrada;
- geração/reinterpretação arbitrária de novas versões do logotipo;
- deployment Preview/Production.

## 5. Stories refinadas

### US-DS-001 — Materializar tokens de cor e temas base

- **Prioridade:** P0
- **Estado após OPS-005:** PRONTA / `NEXT_ACTION`
- **Dependências:** Incremento 0 concluído; Project Design §§21–27; Tailwind CSS 4 já instalado.

**Narrativa.** Como equipe de produto, quero codificar a paleta e os temas aprovados como tokens semânticos reutilizáveis para que as próximas interfaces usem cores coerentes, acessíveis e sem valores visuais dispersos.

**Critérios de aceite:**

1. os valores de marca e superfícies já definidos pelo Project Design existem em uma camada canônica de tokens CSS;
2. tokens semânticos distinguem ao menos background, surface, surface-raised, border, text-primary, text-muted, accent e focus;
3. tema claro e tema escuro são representados sem duplicação arbitrária de valores e respeitam a preferência de esquema do sistema sem exigir JavaScript;
4. cores de categoria previstas no Project Design recebem tokens próprios; quando o documento não fornecer hexadecimal exato, o valor escolhido deve ser documentado na mesma Story e manter coerência/contraste, sem alterar a semântica aprovada;
5. combinações normais de texto e superfície atendem WCAG 2.2 AA quando o critério de contraste for aplicável;
6. a implementação não adiciona dependência npm, componente de UI, theme switch persistido ou lógica de produto;
7. contrato automatizado protege os tokens essenciais e evita regressão para configuração puramente ad hoc;
8. `npm run verify` e o CI da PR passam; banco/Neon-specific são `SKIPPED` com motivo por ausência de mudança de dados.

**Non-goals:** tipografia, logo/favicon, componentes, redesign completo da página inicial, persistência de preferência de tema, EPIC-02.

### US-DS-002 — Integrar tipografia e assinatura de marca

- **Prioridade:** P0
- **Estado:** A FAZER
- **Dependência:** `US-DS-001`.

**Objetivo:** materializar Manrope/Newsreader e o uso da marca já disponível sem inventar variantes ausentes.

**Critérios principais:**

- Manrope é a fonte padrão de interface e Newsreader possui papel editorial explícito;
- carregamento segue mecanismo suportado pelo Next.js vigente e não expõe dependência remota em runtime desnecessária;
- fallbacks, pesos e rendering evitam layout shift indevido;
- o logo horizontal existente recebe regras de uso e apresentação responsiva;
- variantes de marca ainda ausentes são registradas como pendência real, não fabricadas para fechar a Story;
- acessibilidade e `npm run verify` permanecem gates.

### US-DS-003 — Criar primitivos acessíveis essenciais

- **Prioridade:** P0
- **Estado:** A FAZER
- **Dependências:** `US-DS-001`, `US-DS-002`.

**Objetivo:** fornecer um conjunto mínimo e reutilizável para o próximo incremento funcional, sem construir telas de produto.

**Escopo inicial:** botão, campo/form-field e mensagem/feedback, usando semântica HTML correta e tokens canônicos.

**Critérios principais:**

- estados default, hover quando aplicável, focus-visible, disabled e erro possuem contrato consistente;
- navegação por teclado e labels são preservados;
- foco nunca depende somente de cor imperceptível;
- API dos componentes é pequena e tipada;
- não é adicionada biblioteca de componentes sem decisão/necessidade demonstrada;
- testes cobrem semântica e estados essenciais.

### US-DS-004 — Consolidar fundação responsiva e aplicar identidade à base

- **Prioridade:** P1
- **Estado:** A FAZER
- **Dependências:** `US-DS-001` a `US-DS-003`.

**Objetivo:** provar a fundação visual no layout raiz e na página base sem criar fluxo falso.

**Critérios principais:**

- composição base funciona em celular, tablet, notebook e desktop sem dependência de hover;
- a página técnica existente passa a apresentar o Caleida de forma coerente com a marca, sem botões/ações que ainda não existem;
- light/dark, tipografia, foco e redução de movimento são verificáveis em browser quando a infraestrutura estiver disponível;
- não são antecipados login, convite, catálogo, biblioteca ou outras features;
- `npm run verify` e CI passam.

## 6. Ordem e gate do incremento

```text
US-DS-001 tokens/temas
  ↓
US-DS-002 tipografia/marca
  ↓
US-DS-003 primitivos acessíveis
  ↓
US-DS-004 fundação responsiva aplicada
```

A sequência é intencional: componentes não devem cristalizar valores visuais antes dos tokens; layout não deve consolidar componentes antes dos primitivos básicos.

## 7. Porta de saída do Incremento 1

O incremento estará concluído quando:

- identidade visual base estiver codificada por tokens reutilizáveis;
- temas claro/escuro tiverem comportamento coerente;
- tipografia oficial de referência estiver integrada;
- primitivos mínimos necessários ao próximo fluxo funcional estiverem acessíveis e testados;
- layout base for responsivo e não contiver fluxo falso;
- lint, typecheck, testes e build estiverem em PASS;
- nenhum banco/infraestrutura tiver sido criado por conveniência visual;
- documentação e backlog apontarem para o próximo incremento funcional real.

## 8. Impacto técnico do incremento

| Área | Impacto esperado |
|---|---|
| Banco / migrations | nenhum |
| RLS / Auth / Data API | nenhum |
| Neon-specific | normalmente `SKIPPED`; reavaliar somente se uma Story fugir deste limite |
| Storage | nenhum; ativo de marca existente permanece no Git |
| Egress | sem impacto material previsto; fontes devem evitar dependência remota de runtime |
| Realtime / e-mail | nenhum |
| Vercel | build compatível; deployment continua proibido para IA |
| Segurança | foco em evitar superfície falsa e preservar semântica/acessibilidade |

## 9. Próxima ação promovida

> `US-DS-001 — Materializar tokens de cor e temas base`

A próxima sessão deve criar Issue/branch próprias para essa Story e implementar somente seus critérios, consultando a documentação oficial corrente do Tailwind CSS 4/Next.js quando o comportamento de implementação depender dela.
