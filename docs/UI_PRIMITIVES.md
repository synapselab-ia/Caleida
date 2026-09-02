# Primitivos acessíveis — Caleida

**Status:** contrato implementado em `US-DS-003`  
**Escopo:** botão, campo/form-field e feedback  
**Dependências:** `docs/DESIGN_TOKENS.md`, `docs/BRAND_TYPOGRAPHY.md`

## 1. Princípios

Os primitivos desta Story preservam HTML nativo como primeira camada de acessibilidade e usam ARIA somente para relações/atualizações que o HTML sozinho não expressa.

Regras:

- teclado e semântica nativos não são reimplementados com `div`, `role="button"` ou `tabIndex` artificial;
- foco usa `focus-visible` com outline de 2 px, offset de 2 px e o token `focus`, cujo contraste foi protegido em `US-DS-001`;
- hover é aprimoramento e não requisito para operar o controle;
- estado disabled usa o atributo HTML nativo;
- campos têm label visível e programaticamente associado;
- descrição e erro são associados por `aria-describedby`;
- `aria-invalid` só é emitido quando há erro;
- feedback estático não vira live region por padrão;
- `role="status"` é reservado a atualização não urgente e `role="alert"` a mensagem que precisa de anúncio imediato;
- cor nunca é a única pista de erro ou significado.

Referências WAI/WCAG verificadas em 02/09/2026:

- WCAG 2.2 — Focus Visible (2.4.7) e Non-text Contrast (1.4.11);
- WAI Forms — associação explícita de `<label for>` com `id`;
- ARIA1 — `aria-describedby` para descrição de controles;
- ARIA21 — `aria-invalid` em falhas de validação;
- WCAG 4.1.3 — status messages com semântica programática.

## 2. `Button`

Arquivo: `src/components/ui/Button.tsx`.

API adicional à API nativa de `<button>`:

```text
variant?: "primary" | "secondary"
```

Contrato:

- elemento real `<button>`;
- `type="button"` por padrão para evitar submit acidental; consumidores podem optar explicitamente por `submit`/`reset`;
- variantes usam apenas tokens canônicos;
- área mínima de controle de 44 × 44 px;
- hover somente quando o botão está enabled;
- `disabled` continua nativo;
- `focus-visible` tem outline explícito e não depende apenas de alteração de cor interna.

## 3. `FormField`

Arquivo: `src/components/ui/FormField.tsx`.

API própria mínima:

```text
id: string
label: string
description?: string
error?: string
className?: string
inputClassName?: string
```

O restante da API vem de atributos nativos de `<input>`, exceto os atributos de relacionamento que o componente controla (`id`, `aria-describedby`, `aria-invalid`).

Contrato:

- `id` é obrigatório para permitir associação explícita com `<label htmlFor>`;
- `required` continua atributo nativo e recebe indicação textual `(obrigatório)` no label;
- descrição recebe `${id}-description`;
- erro recebe `${id}-error`;
- quando ambos existem, os dois IDs compõem `aria-describedby`;
- quando `error` existe, o input recebe `aria-invalid="true"`;
- a mensagem visível começa por `Erro:` e não depende da borda/accent para comunicar falha;
- o erro do campo não usa `role="alert"` automaticamente, porque o momento de validação pertence ao fluxo que utilizar o primitivo; a associação descritiva permanece sempre disponível.

## 4. `Feedback`

Arquivo: `src/components/ui/Feedback.tsx`.

API:

```text
kind?: "note" | "status" | "alert"
title?: string
children: ReactNode
```

Semântica:

| `kind` | Papel | Uso |
|---|---|---|
| `note` | nenhum role/live region | conteúdo informativo já presente na página |
| `status` | `role="status"` | atualização não urgente, anunciada de forma polida pelo user agent/AT |
| `alert` | `role="alert"` | mensagem urgente que deve ser anunciada imediatamente |

O componente não permite sobrescrever `role` ou `aria-live` pela API comum, evitando combinações contraditórias. `aria-atomic` é aplicado apenas quando existe live-region role.

## 5. Limites

`US-DS-003` não:

- aplica os primitivos à página base;
- cria formulário de login, convite ou qualquer fluxo funcional;
- define loading button, modal, toast, select, checkbox, textarea ou componentes adicionais;
- adiciona biblioteca de UI, Storybook ou framework E2E;
- altera tokens de cor/tipografia já aprovados;
- toca banco, Neon, Auth, RLS, Storage ou deployment Vercel.

A prova visual composta dos primitivos no layout raiz pertence a `US-DS-004`.
