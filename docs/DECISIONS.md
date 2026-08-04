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

## DEC-003 — Stack técnica de referência

**Data:** 03 de agosto de 2026  
**Status:** Aprovada

### Decisão

A stack inicial será GitHub, Codex, Next.js, React, TypeScript, Tailwind CSS, Vercel e Supabase.

### Consequências

- O repositório será a fonte de verdade.
- O Codex trabalhará por User Story e pull request.
- A Vercel será utilizada para previews e produção.
- O Supabase fornecerá Postgres, Auth e Storage.

---

## DEC-004 — Supabase Free como infraestrutura temporária

**Data:** 03 de agosto de 2026  
**Status:** Aprovada

### Decisão

O plano gratuito do Supabase será utilizado somente para desenvolvimento, staging e beta fechado controlado. Ele não será tratado como infraestrutura definitiva para abertura pública.

### Consequências

- Dois projetos hospedados: Staging e Production.
- Desenvolvimento e testes isolados utilizarão Supabase local.
- Backups próprios serão obrigatórios durante o beta.
- SMTP próprio será necessário antes de convidar usuários externos.
- A abertura pública exigirá revisão formal de capacidade e provável migração para plano pago.

---

## DEC-005 — Desenvolvimento incremental por User Story

**Data:** 03 de agosto de 2026  
**Status:** Aprovada

### Decisão

O produto será construído por incrementos, épicos e User Stories pequenas e verificáveis.

### Consequências

- Cada tarefa deve possuir critérios de aceite e fora do escopo.
- Uma sessão do Codex não deve receber a ordem de construir o produto completo.
- Cada entrega deve atualizar status e changelog.
- Funcionalidades futuras não devem ser antecipadas sem necessidade.

---

## DEC-006 — Mudanças de banco somente por migration

**Data:** 03 de agosto de 2026  
**Status:** Aprovada

### Decisão

Toda alteração estrutural do banco será versionada no repositório por meio de migrations.

### Consequências

- Alterações realizadas apenas pelo painel não representam estado oficial.
- O banco deve poder ser reconstruído estruturalmente a partir do Git.
- RLS, constraints e índices fazem parte da mesma entrega da funcionalidade.
