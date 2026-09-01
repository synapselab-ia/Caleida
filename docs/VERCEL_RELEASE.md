# Vercel — Runbook de release manual

**Status:** runbook operacional de hosting  
**Decisão canônica:** `ADR-007`  
**Política:** `00_SYSTEM/DEPLOYMENT_POLICY.md`  
**Ambientes:** `docs/ENVIRONMENTS.md`

Este documento descreve como preparar e executar uma futura release Vercel do Caleida sem transformar GitHub, CI, pull requests ou merges em mecanismos de deployment.

## 1. Regra central

Deployment do Caleida é uma ação exclusivamente humana, manual e deliberada.

Agentes de IA, GitHub Actions, deploy hooks e outras automações não devem criar, promover, repetir ou reverter deployments.

O fluxo normal de desenvolvimento termina em merge:

```text
branch → CI → PR → review → merge → SEM DEPLOY AUTOMÁTICO
```

Release é um fluxo separado e iniciado pelo usuário somente quando houver motivo real para publicar.

## 2. Guardrail versionado

O repositório contém:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": {
    "deploymentEnabled": false
  }
}
```

Na documentação oficial da Vercel revalidada em 01/09/2026, `git.deploymentEnabled: false` desabilita deployments automáticos para todas as branches.

Enquanto `ADR-007` estiver vigente:

- esse valor deve permanecer `false`;
- não substituir por `github.enabled`, que é configuração legada/deprecated para esse objetivo;
- não criar regra por branch que reative deployment automático;
- não depender de Ignored Build Step como substituto desse guardrail.

## 3. Estado atual

O Caleida permanece preparado para hosting, mas não conectado/publicado.

No estado verificado durante `US-PLAT-009`:

- não existe projeto Vercel `Caleida`/`caleida` na conta conectada;
- não existe Project Linking versionado;
- `.vercel/` permanece ignorado pelo Git;
- nenhum deployment Caleida foi criado;
- nenhum `VERCEL_TOKEN` foi adicionado ao GitHub Actions;
- nenhum deploy hook foi criado;
- CI continua responsável apenas por validação técnica;
- `docs/ENVIRONMENTS.md` define a separação local / non-production / Production antes de qualquer release que use secrets.

Esse estado deve ser rechecado antes da primeira release real, porque recursos externos podem mudar independentemente do Git.

## 4. Pré-condições para qualquer release manual

Antes de publicar, confirmar:

1. a ref/commit candidata está identificada;
2. o CI da ref candidata está `PASS`;
3. `npm run verify` está aprovado pelo gate aplicável;
4. `vercel.json` ainda contém `git.deploymentEnabled: false`;
5. não existe job de deployment na CI;
6. as variáveis exigidas estão configuradas no **escopo correto** conforme `docs/ENVIRONMENTS.md`;
7. Preview/non-production não usa secrets ou banco de Production;
8. Production, quando existir, não reutiliza credenciais non-production;
9. nenhum secret está versionado;
10. o ambiente de dados correspondente está correto;
11. o usuário decidiu explicitamente publicar Preview ou Production;
12. `docs/CHECKPOINT.md` registra `MANUAL_ACTION_REQUIRED` quando a continuidade do projeto depender dessa publicação.

No estado atual não existe projeto Neon Production nem projeto Vercel Caleida. Não invente valores para satisfazer estas pré-condições.

## 5. Primeiro projeto/deployment

A documentação oficial da Vercel revalidada em 01/09/2026 informa que **o primeiro deployment de um projeto novo é Production mesmo sem `--prod`**.

Consequência operacional: não execute `vercel`, `vercel deploy`, importação via dashboard ou qualquer outro fluxo de criação/publicação supondo que a primeira execução produzirá apenas Preview.

Quando chegar o momento da primeira release real:

- o usuário deve decidir conscientemente criar/publicar o projeto;
- revisar este runbook e os gates antes da ação;
- confirmar que `vercel.json` já está na ref candidata;
- manter Git deployments automáticos desabilitados;
- configurar somente as variáveis requeridas no ambiente correto;
- tratar a primeira publicação como ação externa de release, não como teste de build.

A IA pode revisar as pré-condições e diagnosticar o resultado depois, mas não executar a publicação.

## 6. Preview manual futuro

Depois que o projeto existir, Preview pode ser usado opcionalmente pelo usuário para inspeção externa.

A documentação corrente da Vercel aceita deployment manual pela CLI com:

```bash
vercel deploy
```

Esse comando é apresentado apenas como referência para execução humana. Não deve aparecer em GitHub Actions, scripts automáticos de release ou automações do projeto.

Preview:

- não é criado para toda PR;
- não é gate obrigatório de merge;
- representa o ambiente publicado **non-production/staging** do Caleida;
- deve receber somente variáveis/recursos non-production;
- não deve usar banco ou secrets de Production por conveniência.

## 7. Production manual futura

Quando o usuário decidir publicar Production e todas as pré-condições estiverem satisfeitas, a documentação corrente aceita:

```bash
vercel deploy --prod
```

A execução é exclusiva do usuário.

Antes dessa ação, Production deve possuir recursos e secrets próprios conforme `docs/ENVIRONMENTS.md`. O projeto Neon Production ainda não foi provisionado e nenhuma credencial non-production deve ser promovida por reutilização.

IA e automações não devem:

- executar o comando;
- promover Preview;
- executar rollback;
- acionar redeploy;
- criar deploy hook;
- chamar API/SDK para criar deployment.

## 8. Falha de release

Se uma publicação manual falhar:

1. não repetir deployments de forma especulativa;
2. identificar o deployment que falhou;
3. obter logs/build output existentes;
4. reproduzir a falha localmente quando possível;
5. confirmar se o erro é de código ou de configuração/escopo de ambiente;
6. executar os gates técnicos aplicáveis;
7. corrigir a causa em branch/PR limitada;
8. somente depois o usuário decide se faz nova tentativa manual.

Falha de deployment não autoriza copiar secrets Production para Preview, reduzir testes, autorização, RLS ou guardrails de release.

## 9. O que nunca deve entrar na CI

Enquanto `ADR-007` estiver vigente, `.github/workflows/ci.yml` não deve ganhar:

- `vercel deploy`;
- `vercel --prod` ou `vercel deploy --prod`;
- `vercel promote`;
- `vercel rollback`;
- deploy hooks;
- chamadas à API Vercel que criem deployment;
- `VERCEL_TOKEN` apenas para publicação;
- connection strings Neon externas apenas para o gate padrão;
- permissões de escrita desnecessárias para CD.

O CI permanente usa PostgreSQL 18 efêmero e não depende de repository secrets para seus gates atuais. Os testes `tests/ci-contract.test.mjs` e `tests/environment-contract.test.mjs` protegem essa separação.

## 10. Fontes oficiais revalidadas

Consultadas em 01/09/2026:

- Vercel Git Configuration — `https://vercel.com/docs/project-configuration/git-configuration`;
- Deploying Projects from Vercel CLI — `https://vercel.com/docs/cli/deploying-from-cli`;
- Vercel Environment Variables / Manage Environment Variables;
- Vercel Sensitive Environment Variables.

Comportamentos de plataforma devem ser revalidados novamente no momento de uma release real.
