# ADR-007 — Deployment Vercel exclusivamente humano e manual

**Status:** Accepted  
**Data:** 2026-08-31  
**Supersedes:** parte de deployment automático de `ADR-002`  
**Superseded by:** none

## Contexto

O Project Design v1.0 previa Preview Deployments por branch/PR como parte normal do fluxo. O processo evoluído do Caleida separa integração de release para evitar churn, consumo desnecessário de quota e publicação acidental durante desenvolvimento assistido.

A Vercel permanece adequada como destino de hosting; a decisão trata de **quem publica e quando**.

## Decisão

Deployment do Caleida é ação exclusivamente humana, manual e deliberada.

Enquanto este ADR estiver vigente:

- somente o usuário executa deployments;
- IA não executa Preview, Production, promote, rollback ou redeploy;
- automações e GitHub Actions não executam deployments;
- push, branch, PR e merge não criam deployments automaticamente;
- quando `vercel.json` existir, Git deployments automáticos devem permanecer desabilitados conforme documentação oficial corrente;
- Preview é opcional/manual;
- Production é manual;
- merge e release são eventos distintos;
- deployment real não é gate obrigatório do Incremento 0.

## Consequências

- CI permanece sem CD;
- `US-PLAT-008` prepara configuração e runbook sem exigir publicação;
- `US-PLAT-010` valida `PR → CI → review → merge` sem deployment;
- release necessária é registrada como `MANUAL_ACTION_REQUIRED` quando bloquear continuidade;
- IA pode preparar release candidate, verificar pré-condições e diagnosticar deployment já executado, mas não dispará-lo.

## Guardrails

Na documentação Vercel verificada em `OPS-003`, `git.deploymentEnabled: false` desabilita deployments disparados por Git. A configuração exata deve ser revalidada quando a integração Vercel for materializada.

Nenhum token Vercel deve existir no CI apenas para permitir publicação automática.

## Relações

- Origem histórica: `DEC-009`.
- Supersedes a parte automática de deployment de `ADR-002`.
- Amendment: `docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md`.
- Política operacional: `00_SYSTEM/DEPLOYMENT_POLICY.md`.

## Evidência externa

Documentação oficial Vercel foi verificada em `OPS-003` em 2026-08-31. O comportamento corrente deve ser revalidado na Story de hosting.
