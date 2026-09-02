# Tipografia e assinatura de marca — Caleida

**Status:** contrato visual implementado em `US-DS-002`  
**Escopo:** tipografia de referência e ativo horizontal oficial  
**Fonte de produto:** `docs/PROJECT_DESIGN.md` §§21–24

## 1. Tipografia

O Caleida usa dois papéis tipográficos explícitos:

- **Manrope** — tipografia padrão da interface;
- **Newsreader** — tipografia editorial para resenhas, citações, retrospectivas e outros trechos deliberadamente editoriais.

A integração é centralizada em `src/app/fonts.ts` e aplicada pelo layout raiz. Não devem existir imports independentes de fontes em componentes comuns.

## 2. Carregamento e rendering

As duas famílias usam `next/font/google`, mecanismo suportado pelo Next.js 16.3.3 vigente no projeto.

Contrato atual:

- subset `latin`;
- `display: "swap"`;
- variável CSS `--font-caleida-interface` para Manrope;
- variável CSS `--font-caleida-editorial` para Newsreader;
- fallback explícito sans-serif para interface e serif para editorial;
- Newsreader não é preloaded globalmente porque é secundária e deve ser carregada quando seu papel editorial for realmente usado;
- nenhuma folha de estilo do Google Fonts é requisitada pelo browser em runtime.

A documentação oficial do Next.js foi revalidada em 02/09/2026: `next/font` baixa os arquivos no build e os hospeda junto aos assets da aplicação, reduzindo requests externos em runtime e mitigando layout shift de fontes.

## 3. Integração CSS/Tailwind

`src/app/globals.css` expõe:

```text
--font-sans      → --font-caleida-interface
--font-editorial → --font-caleida-editorial
```

Manrope é também aplicada diretamente ao `body` como default global. Componentes futuros podem usar a utility `font-editorial` somente quando o conteúdo possuir função editorial real; ela não é uma segunda fonte decorativa genérica.

## 4. Assinatura de marca disponível

O inventário real de `public/brand` contém atualmente apenas:

```text
public/brand/caleida-logo-horizontal.png
```

`src/components/brand/CaleidaLogo.tsx` integra esse arquivo por import estático e `next/image`, preservando dimensões intrínsecas para evitar layout shift e definindo apresentação responsiva com largura fluida e limite máximo.

Regras:

- usar o arquivo oficial sem filtros, recoloração, recorte ou reconstrução;
- manter proporção original;
- o texto alternativo da assinatura é `Caleida`;
- largura é responsiva e não deve ultrapassar o limite definido pelo componente sem necessidade explícita;
- o componente não cria automaticamente versão clara/escura; contraste deve ser conferido no contexto em que ele for aplicado futuramente.

A Story não redesenha `src/app/page.tsx`; a aplicação da identidade à página base pertence a `US-DS-004`.

## 5. Variantes ausentes

O Project Design prevê versão reduzida, clara, escura, símbolo isolado, favicon e ícone de aplicação. Esses arquivos ainda não existem.

Eles permanecem **pendências reais de ativo**, não requisitos que possam ser satisfeitos gerando ou derivando arquivos arbitrariamente nesta Story. Em especial, nenhum favicon é criado a partir de crop automático do logo horizontal.

## 6. Limites

`US-DS-002` não implementa:

- botão, campo, feedback ou outros primitivos de `US-DS-003`;
- redesign da página base de `US-DS-004`;
- theme switch;
- Auth ou funcionalidade de domínio;
- banco, migration, Neon, Data API, RLS ou Storage;
- deployment Vercel.
