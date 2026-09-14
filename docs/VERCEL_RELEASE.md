# Vercel — Runbook de release manual

**Status:** runbook operacional de hosting após o fechamento da US-AUTH-008  
**Decisão:** ADR-007  
**Política:** `00_SYSTEM/DEPLOYMENT_POLICY.md`

## 1. Regra central

Deployment do Caleida é exclusivamente humano, manual e deliberado.

IA, GitHub Actions, deploy hooks e automações não criam, promovem, repetem ou revertem deployments.

```text
branch → CI → PR → review → merge
                    ≠
                 release
```

`vercel.json` mantém `git.deploymentEnabled: false` enquanto ADR-007 estiver vigente.

## 2. Estado externo validado

Projeto Vercel existente:

```text
Project: caleida
Project ID: prj_OQw0hRn1YYQWXSpC87OLF47NqZ2r
Framework: Next.js
Node: 24.x
Production deployment ativo: não
```

Release candidate manual usada no fechamento do Incremento 2:

```text
Deployment: dpl_HqRV6x1Vn5f3GL69wGgy85UDVc9B
Git commit publicado: c85135418eec133d7e0a5dc8ad6ad816f2c39668
Branch: feat/us-auth-008-audit-integrated-validation
Environment: Preview / non-production
State: READY
```

Essa RC passou a matriz live final da US-AUTH-008. O merge posterior em `main` não implica nem exige novo deployment.

## 3. Pré-condições para qualquer futura release manual

Antes de publicar:

1. ref candidata identificada;
2. CI da ref candidata verde;
3. `npm run verify` e gates de banco aplicáveis em PASS;
4. `vercel.json` ainda com Git deployment desabilitado;
5. CI sem CD/deploy hooks;
6. variáveis no escopo correto;
7. Preview usando somente recursos/secrets non-production;
8. nenhum secret versionado;
9. ambiente de dados correspondente pronto;
10. `docs/CHECKPOINT.md` em `MANUAL_ACTION_REQUIRED` somente quando a continuidade realmente depender da publicação;
11. publicação explicitamente decidida pelo usuário.

## 4. Variáveis runtime

Nomes atuais, sem registrar valores:

```text
DATABASE_URL
CALEIDA_RATE_LIMIT_SECRET
NEON_AUTH_BASE_URL
NEON_AUTH_COOKIE_SECRET
```

Variáveis de tooling/migration não devem ser adicionadas ao runtime web por conveniência.

Production Neon não existe. Nunca reutilizar qualquer futuro secret Production em Preview.

## 5. Fluxo manual pelo dashboard

Quando uma Story/release futura exigir runtime público material:

1. abrir o projeto `caleida` no Dashboard;
2. abrir **Deployments**;
3. iniciar **Create Deployment** manualmente;
4. informar a branch/SHA candidata;
5. confirmar Preview/non-production quando esse for o escopo;
6. aguardar `READY`;
7. retornar ao fluxo canônico para inspeção/testes.

A interface pode mudar, mas a ação continua humana/manual.

## 6. Falha de release

Se uma publicação manual falhar:

1. não repetir redeploys especulativamente;
2. identificar o deployment falho;
3. coletar build/runtime logs existentes;
4. separar erro de código de erro de configuração;
5. reproduzir pelos gates canônicos quando possível;
6. corrigir em branch/PR limitada;
7. somente depois decidir nova tentativa manual.

## 7. Production

Production permanece fora do escopo atual.

A IA não executa Production deployment, promote, rollback, redeploy, deploy hook ou chamada API/SDK para criar deployment.

## 8. Estado após Incremento 2

Não existe `MANUAL_ACTION_REQUIRED` ativo. Nenhum novo deployment é necessário para encerrar a US-AUTH-008 ou o Incremento 2.

O próximo trabalho é planejar o Incremento 3 / EPIC-03. Release externa só volta a ser requisito quando uma Story futura demonstrar dependência material de runtime público ou quando o usuário deliberadamente decidir publicar uma nova candidata.
