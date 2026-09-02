# Design tokens — Caleida

**Status:** contrato visual implementado em `US-DS-001`  
**Escopo:** cores, temas light/dark e categorias  
**Fonte de produto:** `docs/PROJECT_DESIGN.md` §§21–27

## 1. Estratégia

O contrato visual usa três camadas:

1. **cores de marca** em `@theme`, integradas ao namespace de cores do Tailwind CSS 4;
2. **aliases semânticos** em custom properties `--caleida-*`, que representam o papel visual e mudam conforme o tema;
3. **`@theme inline`** para disponibilizar os aliases semânticos e as categorias às utilities do Tailwind sem congelar o valor do tema no build.

A documentação oficial corrente do Tailwind CSS 4 foi verificada em 02/09/2026. Ela define `@theme` para design tokens e recomenda `@theme inline` quando um theme variable referencia outra custom property:

- https://tailwindcss.com/docs/theme
- https://tailwindcss.com/docs/colors
- https://tailwindcss.com/docs/functions-and-directives

Nenhuma dependência npm adicional é necessária.

## 2. Paleta canônica de marca

Estes valores vêm diretamente do Project Design e não são reinterpretados:

| Token Tailwind | Papel | Valor |
|---|---|---|
| `--color-brand-violet` | Violeta | `#7457E8` |
| `--color-brand-magenta` | Magenta | `#D85BA8` |
| `--color-brand-blue` | Azul | `#4C8DFF` |
| `--color-brand-green` | Verde | `#39B99A` |
| `--color-brand-amber` | Âmbar | `#F2A93B` |

Esses tokens são primitivos de marca. Componentes futuros devem preferir aliases semânticos quando a intenção for background, texto, borda, accent ou foco.

## 3. Tokens semânticos por tema

| Papel | Light | Dark |
|---|---|---|
| `--caleida-background` | `#F7F6FA` | `#101014` |
| `--caleida-surface` | `#FFFFFF` | `#17171D` |
| `--caleida-surface-raised` | alias de `surface` | `#202028` |
| `--caleida-border` | `#E4E1EA` | `#30303A` |
| `--caleida-text-primary` | `#24212A` | `#F5F4F8` |
| `--caleida-text-muted` | `#706978` | `#AAA5B3` |
| `--caleida-accent` | `#7457E8` | `#A994FF` |
| `--caleida-focus` | alias de `accent` | alias de `accent` |

No tema claro, `surface` e `surface-raised` compartilham deliberadamente o mesmo primitivo branco porque o Project Design especifica somente uma superfície clara. A separação semântica existe desde já para evitar que componentes futuros dependam de um detalhe visual acidental; nenhuma segunda tonalidade clara foi inventada apenas para diferenciar nomes.

O accent escuro `#A994FF` é um tint derivado do violeta canônico. Ele não substitui `--color-brand-violet`; existe para preservar leitura e foco em superfícies escuras.

## 4. Comportamento de tema

O tema segue exclusivamente `prefers-color-scheme`:

```text
preferência light/sem preferência escura → tokens light
preferência dark                     → tokens dark
```

Não existe JavaScript, cookie, localStorage, botão de troca de tema ou preferência persistida nesta Story. Esses comportamentos só poderão ser adicionados em escopo futuro explícito.

`color-scheme` acompanha o tema para permitir que controles nativos do navegador usem a aparência coerente.

## 5. Contraste

Os pares destinados a texto normal foram calculados pelo algoritmo de contraste WCAG e protegidos por `tests/design-tokens-contract.test.mjs`.

### Light

| Combinação | Razão aproximada |
|---|---:|
| texto principal × background | `14.72:1` |
| texto principal × surface | `15.84:1` |
| texto muted × background | `4.90:1` |
| texto muted × surface | `5.28:1` |
| accent × background | `4.57:1` |
| accent × surface | `4.92:1` |

### Dark

| Combinação | Razão mínima aproximada entre background/surfaces |
|---|---:|
| texto principal | `14.77:1` |
| texto muted | `6.73:1` |
| accent | `6.44:1` |

O foco usa o accent de cada tema e mantém pelo menos `3:1` contra background e superfícies normais. A Story não define ainda o formato/espessura do focus ring; isso pertence aos primitivos acessíveis de `US-DS-003`.

## 6. Cores de categoria

O Project Design define a semântica das sete categorias, mas fornece hexadecimal explícito apenas para as que reutilizam a paleta principal. Para as três categorias sem hexadecimal próprio, `US-DS-001` materializa valores coerentes com a identidade existente:

| Categoria | Token | Valor | Origem |
|---|---|---|---|
| Livro | `--color-category-book` | `#F2A93B` | âmbar canônico |
| Mangá | `--color-category-manga` | `#D85BA8` | magenta canônico |
| Manhwa | `--color-category-manhwa` | `#7457E8` | violeta canônico |
| Manhua | `--color-category-manhua` | `#D9685B` | coral definido em US-DS-001 |
| Filme | `--color-category-movie` | `#4C8DFF` | azul canônico |
| Série | `--color-category-series` | `#278EAF` | ciano definido em US-DS-001 |
| Anime | `--color-category-anime` | `#278F83` | verde-azulado definido em US-DS-001 |

Essas cores são identificadores visuais auxiliares. **Nunca podem ser o único identificador da categoria**, conforme o Project Design. Também não devem ser assumidas como cor de texto normal apenas por existirem como tokens; componentes futuros devem combinar cor com rótulo, ícone ou outra pista semântica e verificar contraste no contexto real.

## 7. Integração com Tailwind

`@theme inline` expõe os aliases semânticos no namespace `--color-*`, incluindo:

- `--color-background`;
- `--color-surface`;
- `--color-surface-raised`;
- `--color-border`;
- `--color-text-primary`;
- `--color-text-muted`;
- `--color-accent`;
- `--color-focus`;
- os sete `--color-category-*`.

A camada semântica é a interface estável para componentes futuros. Valores hexadecimais não devem se espalhar por JSX quando um token canônico já representar a intenção visual.

## 8. Limites desta Story

`US-DS-001` não implementa:

- Manrope ou Newsreader;
- logo, favicon ou variantes de marca;
- botão, input ou outro componente;
- theme switch manual/persistido;
- redesign da página inicial;
- Auth ou funcionalidade de domínio;
- banco, migration, Neon ou Storage;
- deployment Vercel.
