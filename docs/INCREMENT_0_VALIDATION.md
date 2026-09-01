# Validação do Incremento 0 — Caleida

**Status:** IN_PROGRESS  
**Story:** `US-PLAT-010 — Validar o ciclo técnico de entrega`  
**Issue:** `#28`  
**Branch:** `verify/us-plat-010-delivery-cycle`  
**PR:** `#29`  
**Escopo:** auditoria e evidência de encerramento do Incremento 0; nenhuma funcionalidade de produto

## 1. Objetivo

Registrar evidência verificável de que a fundação do Caleida percorre o ciclo real de integração:

```text
Issue → branch → documentação mínima → CI → PR → review → merge → CI na main
```

O ciclo deve permanecer sem secrets versionados, sem CD e sem qualquer deployment Vercel automático. O Incremento 0 só pode ser declarado concluído depois da confirmação pós-merge.

## 2. Baseline anterior à Story

Estado recuperado antes de qualquer edição de `US-PLAT-010`:

- branch padrão GitHub: `main`;
- head inicial da `main`: `88dfde9abec1937c0366662a4ff34eeba0edf957`;
- última Story concluída: `US-PLAT-009`;
- última Issue concluída: `#26`;
- última PR concluída: `#27`;
- CI integrada da `main`: run `33549799028`, `PASS`;
- nenhuma Issue/PR/branch de `US-PLAT-010` existia antes do início desta Story.

## 3. Contratos técnicos inspecionados

### CI

`.github/workflows/ci.yml` continua:

- acionado em PR para `main` e push integrado na `main`;
- com `permissions: contents: read`;
- sem Vercel, deploy hooks, tokens de publicação ou CD;
- usando Node/npm pinados;
- executando `npm ci`;
- executando `npm run verify`;
- provisionando PostgreSQL 18 efêmero;
- executando `npm run verify:db` com `CALEIDA_DB_TARGET=ephemeral`.

### Vercel

`vercel.json` continua contendo:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": {
    "deploymentEnabled": false
  }
}
```

A documentação oficial corrente da Vercel foi revalidada em 01/09/2026: `git.deploymentEnabled: false` impede deployments disparados por Git.

Estado remoto anterior à PR:

- conta/team conectada sem projeto Caleida;
- somente outros projetos não relacionados presentes;
- portanto nenhum Preview ou Production do Caleida existe para esta Story;
- nenhum deployment será executado por IA durante a validação.

### Ambientes e secrets

- `.env.example` permanece deliberadamente não executável e sem valores reais;
- nenhuma variável `NEXT_PUBLIC_*` é necessária no estado atual;
- connection strings/tokens/secrets permanecem proibidos no namespace público;
- a CI não depende de repository secret externo.

### Neon

Estado remoto anterior à PR:

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
Região: aws-us-east-1
PostgreSQL: 18
Branches: 1
Baseline: main / br-restless-cherry-awpcwy6r
```

- `caleida-production`: ausente;
- Neon Auth/Data API/Object Storage: não implementados;
- nenhum recurso Neon foi criado ou alterado nesta Story.

## 4. Aplicabilidade dos gates

| Gate | Estado | Motivo |
|---|---|---|
| `npm run verify` no CI permanente | PENDING | obrigatório no head final da PR |
| PostgreSQL 18 + `npm run verify:db` no CI | PENDING | obrigatório e portável |
| Gate Neon-specific | SKIPPED | a Story não altera schema, Auth, Data API, roles, extensões ou comportamento gerenciado do Neon |
| Deployment Vercel | SKIPPED/PROIBIDO | deployment é release exclusivamente humana/manual conforme `ADR-007` |
| Inspeção Vercel pré/pós-merge | PRE-MERGE PASS / POST-MERGE PENDING | necessária para provar ausência de publicação automática |

## 5. Evidência do ciclo da Story

| Etapa | Evidência | Estado |
|---|---|---|
| Issue | `#28` | PASS |
| Branch | `verify/us-plat-010-delivery-cycle` a partir de `88dfde9` | PASS |
| Mudança limitada | somente documentação operacional/auditoria | PASS |
| PR | `#29` | PASS |
| CI da PR | head final ainda precisa concluir | PENDING |
| Review/diff/threads | ainda não revisados no head final | PENDING |
| Merge com head verificado | ainda não executado | PENDING |
| CI pós-merge na `main` | ainda não executado | PENDING |
| Vercel pós-merge sem Caleida | ainda não confirmado | PENDING |

## 6. Critérios de encerramento do Incremento 0

A fundação já possui, das Stories anteriores:

- setup local documentado e aplicação instalável/executável;
- lint, typecheck, testes e build canônicos;
- fundação Neon non-production;
- migrations e testes reconstruíveis em PostgreSQL 18 descartável;
- contrato de ambientes e secrets;
- CI permanente sem CD;
- hosting Vercel preparado com Git deployments desabilitados;
- runbook de release manual.

Permanecem para esta Story:

- CI da PR em `PASS`;
- revisão do diff, secrets, reviews/threads e mergeability;
- merge do head verificado;
- CI da `main` pós-merge em `PASS`;
- confirmação Vercel pós-merge sem projeto/deployment Caleida;
- reconciliação final de `CHECKPOINT`, `EXECUTION_PLAN`, backlog e changelog.

## 7. Próximo horizonte

O Project Design posiciona `EPIC-01 — Identidade e design system` após a fundação técnica. O backlog operacional atual, porém, está refinado somente até o Incremento 0.

Nenhuma feature de EPIC-01 será antecipada em `US-PLAT-010`. Após o encerramento verificável do Incremento 0, a próxima ação deve ser uma unidade de planejamento/refino que derive o próximo incremento e sua primeira Story limitada antes de qualquer implementação funcional.
