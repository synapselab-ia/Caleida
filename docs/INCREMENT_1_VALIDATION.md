# Validação do Incremento 1 — Fundação visual

**Status:** evidência de encerramento técnico, condicionada ao CI do head final da PR e ao CI pós-merge  
**Épico:** `EPIC-01 — Identidade e design system`  
**Stories:** `US-DS-001` a `US-DS-004`

## 1. Resultado do incremento

O Incremento 1 materializa a fundação visual do Caleida sem antecipar funcionalidades de domínio:

- `US-DS-001` — tokens canônicos, temas light/dark e cores de categoria;
- `US-DS-002` — Manrope, Newsreader e assinatura horizontal oficial;
- `US-DS-003` — `Button`, `FormField` e `Feedback` acessíveis;
- `US-DS-004` — composição responsiva da página base e aplicação da identidade aprovada.

A página base permanece institucional/técnica. Ela não contém login, convite, catálogo, biblioteca, formulário, CTA ou navegação para funcionalidades inexistentes.

## 2. US-DS-004 — composição final

Issue: `#39`  
PR: `#40`  
Branch: `feat/us-ds-004-responsive-foundation`

A Story:

- substitui a página neutra por uma composição cultural/editorial coerente com o Project Design §§21–27;
- usa exclusivamente tokens visuais já materializados, sem hexadecimais dispersos no JSX;
- mantém Manrope como tipografia de interface e usa Newsreader somente em contexto editorial;
- aplica o único logo oficial existente sem fabricar variantes;
- corrige o wrapper do logo para uma caixa de layout real e responsiva com `display: block`;
- apresenta as sete categorias com marcador cromático e rótulo textual;
- usa composição mobile-first com breakpoints progressivos e proteção contra overflow horizontal;
- não depende de hover e não introduz animação;
- não usa os primitivos de US-DS-003 porque não existe ação, formulário ou feedback dinâmico real nesta página.

## 3. Contratos automatizados

`tests/base-visual-foundation-contract.test.mjs` protege:

- estrutura semântica da página;
- uso do logo oficial, tipografia editorial e tokens canônicos;
- ausência de hexadecimal visual disperso;
- composição mobile-first e proteção contra overflow estrutural;
- ausência de hover, transições e animações obrigatórias;
- presença das sete categorias com texto além de cor;
- ausência de botão, link, formulário ou fluxo funcional fabricado;
- manutenção do contrato light/dark por preferência do sistema.

O contrato legado de marca também foi atualizado para refletir a caixa responsiva mais forte do `CaleidaLogo`, sem relaxar sua exigência de `next/image`, asset oficial, proporção e ausência de filtros/recoloração.

## 4. Verificação executada

### CI inicial da PR #40

Run `33662849749`: `FAIL` legítimo.

- migrations manifest: `PASS`;
- lint: `PASS`;
- typecheck: `PASS`;
- seis testes novos de US-DS-004: `PASS`;
- falha: contrato legado de `tests/brand-typography-contract.test.mjs` exigia literalmente a sequência antiga `relative h-20 w-full max-w-80` e não reconhecia a adição correta de `block`/`shrink-0` e `object-left`;
- PostgreSQL/`verify:db`: não executado nesse run porque o gate de aplicação parou corretamente na falha de teste.

A correção atualizou o contrato para a implementação responsiva mais forte; nenhum gate foi removido ou enfraquecido.

### CI corrigido da PR #40

Head técnico `a4198a7c7508ae9ede628c59455a64d00cd55d94`, run `33663025148`: `PASS`.

- runtime Node/npm: `PASS`;
- `npm ci`: `PASS`;
- `npm run verify`: `PASS`;
- lint: `PASS`;
- TypeScript strict: `PASS`;
- testes: `PASS`;
- build Next.js: `PASS`;
- PostgreSQL 18: `PASS`;
- `npm run verify:db`: `PASS`.

O head documental final da PR deve repetir o CI em `PASS` antes do merge. O CI pós-merge da `main` também deve passar antes do fechamento operacional da Story; a evidência final fica registrada em `#39/#40` para não fabricar SHAs/runs antes de existirem.

## 5. Verificação em browser

`SKIPPED` nesta sessão.

Foi tentado preparar um checkout local para iniciar o dev server sem deployment, mas o ambiente de execução da sessão não conseguiu resolver `github.com` para realizar o clone. Não havia dev server local acessível sobre o qual executar o browser automatizado.

A política canônica proíbe usar Preview/Production Vercel como substituto de teste. Portanto:

- nenhum deployment foi criado para obter uma URL de teste;
- ausência de browser real não foi convertida em `PASS`;
- responsividade/estrutura foram cobertas por contrato de fonte + build/CI, e a limitação permanece registrada explicitamente.

## 6. Banco, Neon e infraestrutura

- migration/schema: nenhuma alteração;
- Auth/Data API/RLS: nenhuma alteração;
- Storage: nenhuma alteração;
- gate Neon-specific: `SKIPPED — Story exclusivamente visual, sem comportamento gerenciado do Neon`;
- consulta/mutação remota Neon: `SKIPPED — não aplicável`;
- PostgreSQL 18 efêmero do CI: `PASS`, como gate permanente do repositório;
- dependências/package-lock: nenhuma alteração;
- workflow CI: nenhuma alteração;
- Vercel project/import: não criado;
- Preview/Production/promote/rollback/redeploy: `SKIPPED/PROIBIDO` conforme `ADR-007`.

## 7. Porta de saída

Com US-DS-004 integrada e os CIs finais em `PASS`, EPIC-01 e o Incremento 1 podem ser encerrados porque:

- tokens/temas: concluídos;
- tipografia/marca: concluídas;
- primitivos acessíveis: concluídos;
- composição responsiva base: concluída;
- fluxo falso: ausente;
- banco/infraestrutura não foram criados por conveniência visual;
- CI continua separado de CD.

O próximo trabalho não deve iniciar Auth diretamente. Primeiro deve refinar o próximo incremento funcional a partir de `EPIC-02 — Contas e autenticação`, confrontando CAP-01, CAP-02, CAP-04 e CAP-35 com a arquitetura Neon vigente e a documentação oficial corrente.
