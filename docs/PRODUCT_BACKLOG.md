# Product Backlog

**Status:** Backlog inicial em preparação  
**Escopo detalhado neste momento:** Incremento 0 — Fundação executável

## Convenções

- `P0`: obrigatório para o núcleo ou segurança.
- `P1`: obrigatório antes do beta fechado.
- `P2`: importante para completar a proposta.
- `P3`: expansão social e descoberta.
- `P4`: evolução futura.

Estados:

- `A FAZER`;
- `PRONTA`;
- `EM ANDAMENTO`;
- `EM REVISÃO`;
- `CONCLUÍDA`;
- `BLOQUEADA`.

---

# Incremento 0 — Fundação executável

## Objetivo

Criar uma aplicação vazia, porém instalável, testável, documentada e publicável, sem iniciar funcionalidades de negócio.

## EPIC-00 — Fundação técnica

### US-PLAT-001 — Inicializar a aplicação web

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** aplicação Next.js com TypeScript estrito, estrutura mínima, lint, typecheck e build.

### US-PLAT-002 — Organizar a estrutura documental

- **Prioridade:** P0
- **Estado:** EM ANDAMENTO
- **Resultado:** Project Design em Markdown, arquitetura, decisões, status, backlog, changelog e regras do agente no repositório.

### US-PLAT-003 — Configurar o ambiente local

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** instruções reproduzíveis para instalar dependências e executar a aplicação localmente.

### US-PLAT-004 — Inicializar Supabase local

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** Supabase CLI configurada, serviços locais executáveis e seed fictício inicial.

### US-PLAT-005 — Definir estrutura de migrations e RLS

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** convenções para migrations, testes de políticas e funções comuns sem modelar prematuramente todo o produto.

### US-PLAT-006 — Configurar validações automatizadas

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** comandos de lint, typecheck, testes e build executáveis de forma consistente.

### US-PLAT-007 — Configurar integração contínua

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** GitHub Actions validando pull requests.

### US-PLAT-008 — Conectar o projeto à Vercel

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** primeiro deploy de produção e Preview Deployment validado.

### US-PLAT-009 — Separar variáveis por ambiente

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** desenvolvimento, preview/staging e produção sem compartilhamento indevido de secrets.

### US-PLAT-010 — Validar o ciclo completo de entrega

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** uma pull request de teste passa por validação, Preview, revisão e merge sem alterar funcionalidades de negócio.

---

# Critério de encerramento do Incremento 0

O incremento estará concluído quando:

- o projeto puder ser clonado e executado com documentação clara;
- lint, typecheck, testes e build passarem;
- Supabase local puder ser iniciado e resetado;
- nenhuma credencial estiver versionada;
- pull requests executarem CI;
- a Vercel gerar Preview e Production;
- os documentos operacionais refletirem o estado real.

# Próxima ação de refinamento

Detalhar a Issue completa de `US-PLAT-001`, incluindo narrativa, critérios de aceite, dependências, fora do escopo e testes.
