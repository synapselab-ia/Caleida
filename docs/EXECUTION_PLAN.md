# Execution Plan — Caleida

**Status:** roadmap operacional canônico  
**Regra:** uma `NEXT_ACTION` limitada por vez  
**Roadmap de produto:** `docs/PRODUCT_BACKLOG.md`

Este documento transforma o backlog macro em tarefas executáveis.

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

## Objetivo

Criar estrutura própria para decisões arquiteturais antes do início da implementação técnica.

## Resultado

- `docs/adr/README.md` como índice/autoridade arquitetural;
- `docs/adr/TEMPLATE.md` como formato mínimo;
- sete ADRs migrados das decisões arquiteturais existentes;
- relações de supersessão preservadas;
- `docs/DECISIONS.md` convertido em índice/histórico legado;
- Source of Truth, AGENTS, AI Work Protocol e documentação operacional reconciliados;
- primeira Story técnica refinada e promovida como `NEXT_ACTION`.

## Mapa migrado

- `DEC-002` → `ADR-001`;
- `DEC-003` → `ADR-002`;
- `DEC-004` → `ADR-003`;
- `DEC-006` → `ADR-004`;
- `DEC-007` → `ADR-005`;
- `DEC-008` → `ADR-006`;
- `DEC-009` → `ADR-007`.

`DEC-001` permanece decisão de produto e `DEC-005` decisão de processo.

## Verificação

- histórico preservado: `PASS`;
- supersessões explícitas: `PASS`;
- uma única autoridade arquitetural: `PASS`;
- código/aplicação alterados: `SKIPPED — nenhum`;
- banco/Neon alterados: `SKIPPED — nenhum`;
- Vercel/deployment: `SKIPPED — proibido/fora do escopo`.

---

# US-PLAT-001 — Inicializar a aplicação web

**Estado:** NEXT_ACTION  
**Backlog:** `US-PLAT-001` / EPIC-00  
**Tipo:** primeira tarefa técnica do Incremento 0

## Objetivo

Inicializar a aplicação Next.js/React/TypeScript mínima, reproduzível e verificável, sem implementar domínio de produto ou infraestrutura externa.

Ao final, o repositório deve possuir uma base real que possa ser instalada do zero e passar pelos gates técnicos locais.

## Por que agora

As quatro tarefas OPS concluíram a reconciliação de protocolo, plataforma, deployment e decisões. Não há mais decisão operacional pendente que justifique atrasar o bootstrap da aplicação.

## Dependências

- OPS-001 a OPS-004 concluídas;
- `ADR-002` interpretado com suas supersessões atuais;
- `ADR-005`, `ADR-006` e `ADR-007` respeitados;
- nenhuma necessidade de projeto Neon/Vercel para esta Story.

## Inspecionar antes de editar

1. estado real da `main` e estrutura do repositório;
2. `docs/PROJECT_DESIGN.md` + amendments;
3. `docs/adr/README.md` e ADRs aplicáveis;
4. `docs/ARCHITECTURE.md`;
5. `public/brand/` e demais assets existentes;
6. documentação oficial corrente de Next.js, React e Node.js;
7. compatibilidade do runtime e package manager escolhidos;
8. requisitos atuais de lint/configuração do framework.

## Versões e runtime

Não assumir versões por memória.

Durante a execução:

- verificar documentação oficial atual do Next.js/React/Node;
- selecionar runtime Node suportado e estável para a versão do framework;
- fixar a versão de runtime no repositório (`.nvmrc` ou mecanismo equivalente apropriado);
- escolher um único package manager e gerar lockfile canônico;
- evitar dependências desnecessárias.

A escolha de versões é implementação de baixo impacto e não exige novo ADR, salvo se introduzir restrição arquitetural material.

## Escopo esperado

Criar somente a fundação necessária, incluindo conforme a ferramenta oficial corrente:

- `package.json` e lockfile;
- Next.js App Router;
- React e TypeScript em modo estrito;
- estrutura `src/` quando compatível com a inicialização escolhida;
- Tailwind CSS conforme stack vigente, sem construir design system completo;
- página inicial mínima de fundação, sem feature de negócio;
- scripts reais para `dev`, lint, typecheck, test e build;
- configuração mínima de lint/TypeScript/framework;
- pin de runtime;
- `.gitignore` adequado;
- teste básico/smoke reproduzível com a solução mínima compatível;
- README/instruções locais atualizados somente no necessário.

Preservar assets existentes em `public/`.

## Segurança

- nenhum secret;
- nenhum `.env` com valores reais;
- nenhuma chave exposta ao cliente;
- nenhuma integração Auth/banco;
- nenhum dado pessoal real;
- nenhuma configuração que possa disparar deployment Vercel.

## Critérios de aceite

1. clone limpo pode instalar dependências a partir do lockfile;
2. aplicação inicia localmente;
3. TypeScript estrito está ativo;
4. lint passa;
5. typecheck passa;
6. teste básico passa;
7. build de produção passa localmente;
8. estrutura não contém feature de negócio prematura;
9. assets existentes não são removidos sem justificativa;
10. nenhum secret ou integração externa é criado;
11. nenhum deployment ocorre;
12. documentação/Checkpoint refletem o estado real.

## Verificação obrigatória

Executar usando o package manager real escolhido:

```text
clean install
lint
typecheck
test
build
```

Também revisar diff completo e confirmar ausência de credenciais/configuração de CD.

Se ambiente de ferramenta impedir algum gate, registrar `BLOCKED`/`SKIPPED` com evidência; não declarar PASS fictício.

## Non-goals

- Neon project/schema/migrations;
- Neon Auth/Data API;
- RLS;
- Object Storage;
- Vercel project/integration/deployment;
- `vercel.json` de hosting (Story `US-PLAT-008`);
- CI GitHub Actions (Story `US-PLAT-007`);
- catálogo, biblioteca, perfil ou qualquer feature funcional;
- design system completo;
- E2E amplo.

## Definition of Done

- implementação em branch limitada à Story;
- gates aplicáveis executados e registrados;
- PR revisável sem escopo extra;
- documentação afetada e Changelog atualizados;
- Checkpoint aponta para uma única próxima Story coerente;
- merge na `main` não dispara deployment.

---

# Contrato de execução

Para cada tarefa:

1. recuperar estado pelo protocolo;
2. confirmar `NEXT_ACTION`;
3. inspecionar repositório/documentação;
4. criar/usar Issue e branch limitadas;
5. implementar somente o necessário;
6. executar Verification Protocol;
7. revisar diff;
8. atualizar docs/ADRs quando aplicável;
9. atualizar Checkpoint;
10. abrir/revisar/mergear PR;
11. deixar uma única próxima ação.

Deployment segue `ADR-007` e nunca é consequência automática do fluxo.
