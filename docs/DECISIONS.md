# Registro de decisões

Este documento registra decisões de produto e arquitetura que não devem ser alteradas silenciosamente.

---

## DEC-001 — Plataforma pública com beta fechado

**Data:** 03 de agosto de 2026  
**Status:** Aprovada

### Decisão

O Caleida será construído como plataforma pública multiusuário, mas seu lançamento inicial ocorrerá por convite ou aprovação administrativa.

### Consequências

- A arquitetura deve suportar múltiplas contas desde o início.
- Privacidade, moderação e isolamento não podem ser adicionados apenas no final.
- O beta controlará custos, estabilidade e crescimento antes da abertura pública.

---

## DEC-002 — Catálogo global e biblioteca pessoal separados

**Data:** 03 de agosto de 2026  
**Status:** Aprovada

### Decisão

Cada obra terá um registro global compartilhado. Status, progresso, nota, favorito, resenha e demais dados de consumo pertencerão à relação individual entre usuário e obra.

### Consequências

- Uma obra não deve ser duplicada por usuário.
- Exclusão de uma entrada pessoal não exclui o registro global.
- Mesclagens do catálogo devem preservar todos os dados pessoais relacionados.

---

## DEC-003 — Stack técnica de referência original

**Data:** 03 de agosto de 2026  
**Status:** SUPERSEDED em partes por `DEC-007` e `DEC-009`

### Decisão histórica

A stack inicial foi definida como GitHub, Codex, Next.js, React, TypeScript, Tailwind CSS, Vercel e Supabase. A consequência original também tratava Vercel como Preview/Production automático por branch/PR.

### Motivo da supersessão

- `DEC-007` substituiu Supabase por Neon para dados/identidade;
- `DEC-009` manteve Vercel como hosting, mas substituiu o modelo automático de deployment por release exclusivamente humana/manual.

Os componentes não afetados continuam válidos quando confirmados pelos documentos canônicos atuais.

---

## DEC-004 — Supabase Free como infraestrutura temporária

**Data:** 03 de agosto de 2026  
**Status:** SUPERSEDED por `DEC-007`

### Decisão histórica

O plano gratuito do Supabase seria utilizado para desenvolvimento, staging e beta fechado controlado, com Supabase local para desenvolvimento.

### Motivo da supersessão

O Caleida passou a utilizar Neon como plataforma canônica antes de qualquer schema ou integração Supabase ter sido implementada.

---

## DEC-005 — Desenvolvimento incremental por User Story

**Data:** 03 de agosto de 2026  
**Status:** Aprovada

### Decisão

O produto será construído por incrementos, épicos e User Stories pequenas e verificáveis.

### Consequências

- Cada tarefa deve possuir critérios de aceite e fora do escopo.
- Uma sessão de IA não deve receber a ordem de construir o produto completo.
- Cada entrega deve atualizar Checkpoint e documentação afetada.
- Funcionalidades futuras não devem ser antecipadas sem necessidade.

---

## DEC-006 — Mudanças de banco somente por migration

**Data:** 03 de agosto de 2026  
**Status:** Aprovada

### Decisão

Toda alteração estrutural do banco será versionada no repositório por meio de migrations.

### Consequências

- Alterações realizadas apenas pelo painel/Console não representam estado oficial.
- O banco deve poder ser reconstruído estruturalmente a partir do Git.
- RLS, constraints e índices fazem parte da mesma entrega da funcionalidade quando aplicáveis.
- Migrations aplicadas não são reescritas; correções usam nova migration.

---

## DEC-007 — Neon como plataforma canônica de dados e identidade

**Data:** 31 de agosto de 2026  
**Status:** Aprovada

### Decisão

O Caleida adotará:

- Neon Postgres para persistência relacional;
- Neon Auth como solução inicial de autenticação;
- Neon Data API como caminho preferencial para CRUD normal sob contexto de usuário quando apropriado;
- PostgreSQL RLS como camada persistente de autorização;
- projeto Neon separado para Production;
- projeto Neon separado para non-production/staging;
- branches Neon descartáveis no projeto non-production para migrations, testes e verificação;
- migrations em `database/migrations/`;
- testes de banco em `database/tests/`.

### Consequências

- referências Supabase ficam históricas quando abrangidas pelo amendment;
- Production não será laboratório de migration/RLS;
- JWT/RLS devem ser testados com identidade normal da aplicação;
- secrets permanecem fora do Git;
- capacidade/custo serão reavaliados antes de beta/abertura.

---

## DEC-008 — Storage desacoplado e decisão adiada

**Data:** 31 de agosto de 2026  
**Status:** Aprovada

### Decisão

O Caleida não escolherá provedor de Object Storage antes da Story correspondente.

### Consequências

- Neon Object Storage não é dependência canônica nesta fase;
- nenhum bucket/credencial é criado antecipadamente;
- capas externas continuam por URL quando permitido;
- metadados futuros devem permanecer provider-independent;
- a escolha posterior exige avaliação de privacidade, autorização, lifecycle, backup, custo, regiões e maturidade.

---

## DEC-009 — Deployment Vercel exclusivamente humano e manual

**Data:** 31 de agosto de 2026  
**Status:** Aprovada

### Contexto

O Project Design v1.0 tratava Preview Deployments por branch/PR e publicação como parte do ciclo normal de desenvolvimento. O fluxo evoluído do projeto exige evitar churn e consumo desnecessário de deployments, mantendo CI/build independentes de release.

A documentação oficial Vercel verificada em OPS-003 permite desabilitar Git deployments automáticos com `git.deploymentEnabled: false`.

### Decisão

Vercel continua sendo o destino de hosting do Caleida, porém:

- somente o usuário executa deployments;
- IA não executa Preview, Production, promote, rollback ou redeploy;
- automações e GitHub Actions não executam deployments;
- push, branch, PR e merge não devem criar deployments automaticamente;
- quando `vercel.json` existir, Git deployments automáticos devem permanecer desabilitados enquanto esta decisão estiver vigente;
- Preview é opcional e manual;
- Production é manual;
- merge e release são eventos distintos;
- deployment real não é gate obrigatório do Incremento 0.

### Consequências

- `docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md` supersede referências históricas a Preview/Production automáticos;
- `00_SYSTEM/DEPLOYMENT_POLICY.md` passa a ser human-only;
- GitHub Actions permanece CI sem CD;
- `US-PLAT-008` prepara configuração/runbook sem exigir publicação;
- `US-PLAT-010` valida PR → CI → review → merge sem deployment;
- uma futura release necessária deve ser registrada como ação manual do usuário;
- a IA pode inspecionar/logar/diagnosticar deployment já executado, mas não dispará-lo.

### Evidência documental verificada em OPS-003

Em 31/08/2026, documentação oficial da Vercel confirmou:

- `git.deploymentEnabled: false` desabilita deployments disparados por Git;
- Preview e Production podem ser criados por comandos/mecanismos manuais oficiais;
- a propriedade legada `github.enabled` não é a configuração recomendada para este guardrail quando `git.deploymentEnabled` está disponível.

Esses comportamentos devem ser revalidados na Story que materializar a integração Vercel.