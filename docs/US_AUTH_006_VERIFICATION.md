# US-AUTH-006 — Verification

**Story:** Implementar login, logout e proteção de sessão  
**Issue:** #53  
**PR:** #54  
**Branch:** `feat/us-auth-006-session-protection`  
**Estado:** EM REVISÃO  
**Data:** 10/09/2026

## 1. Escopo verificado

A Story materializa login, logout e uma primeira superfície privada sobre o Managed Better Auth já integrado, sem duplicar credenciais nem confiar em estado do cliente como autoridade de sessão.

Implementação relevante:

- `src/lib/auth/actions.ts` — server actions de login/logout;
- `src/components/auth/LoginForm.tsx` — formulário de login com estado acessível;
- `src/components/auth/LogoutForm.tsx` — logout com tratamento de falha;
- `src/app/login/page.tsx` — página pública de login consciente da sessão no servidor;
- `src/app/(private)/layout.tsx` — boundary privado server-side;
- `src/app/(private)/app/page.tsx` — primeira superfície autenticada;
- `tests/session-protection-contract.test.mjs` — contratos adversariais/estruturais da Story;
- `tests/base-visual-foundation-contract.test.mjs` — contrato visual reconciliado com a existência do login real.

## 2. Regras de segurança cobertas

- credenciais inválidas retornam mensagem genérica sem propagar erro do provider;
- login/logout chamam o Auth por server action;
- sessão ausente/inválida nega a área privada no boundary server-side;
- acesso direto a `/app` atravessa a mesma proteção server-side;
- conteúdo privado não é retornado antes da validação da sessão;
- `/login` redireciona usuário já autenticado para `/app`;
- logout só redireciona como sucesso depois de `signOut()` sem erro;
- browser storage/cookie client-side não é usado como fonte de autoridade;
- estados pending/error usam semântica acessível;
- recuperação de senha e gestão avançada de sessão não foram antecipadas.

## 3. GitHub / CI

### Primeira execução

```text
Workflow: #206
Run: 34475743349
Resultado: FAIL
```

A falha foi legítima no sentido de detectar inconsistência de contrato, mas não era falha do Auth. Dois testes históricos da fundação visual ainda assumiam que a home não poderia conter qualquer `href` ou interação funcional. Isso deixou de ser verdade quando US-AUTH-006 materializou o link real de login.

Correção aplicada:

- preservado o guardrail mobile-first sem hover ornamental na home;
- teste visual passou a permitir somente o link real para `/login`;
- continuam proibidos formulário, input, botão e lógica Auth direta na home;
- warning de parâmetro não usado removido sem alterar comportamento.

### Execução corrigida

```text
Head funcional validado: df3923a68b30c7e2dfacd1d1ab6e6d5dc3dcd8dc
Workflow: #207
Run: 34476422464
Job: 102868179449
Resultado: SUCCESS
```

Passaram:

- instalação reprodutível;
- `npm run verify`;
- migration integrity check;
- lint;
- typecheck;
- testes Node, incluindo contratos da US-AUTH-006;
- build Next.js;
- PostgreSQL 18;
- `npm run verify:db`.

As alterações documentais posteriores devem disparar nova execução do CI antes do merge final.

## 4. PostgreSQL / migrations

US-AUTH-006 não altera schema nem contrato persistente de banco.

Resultado:

```text
nova migration: não
mudança de schema: não
PostgreSQL 18 permanente do CI: PASS
verify:db: PASS
```

## 5. Neon-specific

Branch isolada criada para a Story:

```text
Projeto: caleida-nonprod / patient-glade-95136440
Baseline: main / br-restless-cherry-awpcwy6r
Verificação: verify-us-auth-006 / br-cold-block-aww00k4o
Estado: ready
```

Readback confirmado:

- provider Better Auth;
- endpoint Auth próprio da branch isolada;
- email/password habilitado;
- signup/verificação de e-mail herdados da baseline;
- zero usuários Auth;
- zero sessões Auth;
- zero accounts Auth;
- schema diff da branch versus baseline vazio.

Nenhuma configuração Auth real sensível é persistida neste documento.

Resultado do gate Neon-specific estrutural/configuração: **PASS**.

## 6. Browser/live e política de deployment

Durante a execução inicial, a ausência de um Preview US-AUTH-006 foi tratada como blocker porque o Execution Plan dizia que browser real era obrigatório assim que a superfície existisse. Isso conflitou com a Deployment Policy, que já definia Preview como opcional e não obrigatório para merge.

Em 10/09/2026 o protocolo foi reconciliado:

- Preview Vercel não é gate obrigatório por Story;
- ausência de Preview manual não cria `MANUAL_ACTION_REQUIRED` automaticamente;
- browser real é obrigatório antecipadamente apenas quando o critério de aceitação depender materialmente de infraestrutura pública/externa que não possa ser validada de forma equivalente;
- para Stories intermediárias cobertas por CI, contratos, revisão server-side e ambiente específico isolado, browser live pode ser `SKIPPED/deferred`;
- a matriz live integrada do Incremento 2 fica concentrada na `US-AUTH-008`.

Para US-AUTH-006 não foi identificado requisito exclusivamente público que justifique novo deployment manual.

Resultado:

```text
browser/live da Story: SKIPPED/deferred para US-AUTH-008
Preview Vercel adicional: NÃO REQUERIDO
blocker manual: none
```

Isso não converte teste não executado em `PASS`; registra explicitamente o deferimento para a Story de validação integrada.

## 7. Non-goals preservados

- recuperação de senha;
- gestão/revogação avançada de sessões;
- Data API;
- Production Neon;
- deployment Vercel pela IA;
- exclusão automática de branches Neon de verificação.

## 8. Housekeeping

`verify-us-auth-006 / br-cold-block-aww00k4o` permanece existente. Exclusão é destrutiva e requer autorização explícita do usuário, portanto não faz parte do fechamento automático da Story.

## 9. Critério de encerramento

US-AUTH-006 pode ser encerrada quando:

1. o CI do head final, incluindo esta reconciliação documental, estiver `SUCCESS`;
2. a diff da PR #54 estiver limitada ao escopo;
3. não existirem reviews/threads bloqueantes;
4. a documentação canônica estiver coerente;
5. a PR for integrada em `main` e o CI pós-merge permanecer saudável.

Nenhum Preview Vercel adicional é necessário para esses critérios.
