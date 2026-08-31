# Deployment Policy — Caleida

**Status:** protocolo operacional canônico  
**Princípio:** deployment é release humano e manual; não é mecanismo de teste

## 1. Regra central

Deployment do Caleida é executado exclusivamente pelo usuário de forma manual e deliberada.

Enquanto esta política estiver vigente, agentes de IA, automações, workflows e integrações não devem criar, promover, repetir ou reverter deployments Vercel.

A existência de branch, commit, pull request, merge ou autorização genérica para trabalhar no repositório **não** concede autorização para publicar.

## 2. Proibições para IA e automação

Não executar:

- Preview deployment;
- Production deployment;
- `vercel deploy`;
- `vercel --prod` / `vercel deploy --prod`;
- `vercel promote`;
- `vercel rollback`;
- redeploy;
- deploy hooks;
- chamadas à API/SDK da Vercel que criem deployment;
- GitHub Actions/GitLab/CI que publiquem a aplicação.

Essas ações continuam proibidas mesmo que sejam tecnicamente possíveis pelas ferramentas conectadas. A política só muda por decisão canônica posterior explícita.

## 3. Git deployments automáticos

A configuração oficial verificada da Vercel permite desabilitar deployments disparados por Git com:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": {
    "deploymentEnabled": false
  }
}
```

Quando `vercel.json` for criado para o Caleida, essa configuração deve permanecer ativa enquanto `ADR-007` estiver vigente.

Não conectar/importar o repositório de forma que um deployment automático seja disparado antes desse guardrail estar materializado.

## 4. Trabalho permitido para IA

Sem publicar, a IA pode:

- consultar documentação oficial atual da Vercel;
- preparar código compatível com Vercel;
- preparar/revisar `vercel.json`;
- documentar contratos de variáveis de ambiente sem valores sensíveis;
- executar lint, typecheck, testes e build;
- preparar runbook de release manual;
- verificar que o repositório não contém workflow de deployment automático;
- inspecionar deployment já existente quando solicitado;
- diagnosticar logs/erros de deployment já executado pelo usuário;
- recomendar Preview, Production, promote ou rollback sem executar a ação.

## 5. CI sem CD

CI e deployment são responsabilidades separadas.

GitHub Actions pode validar:

```text
install
lint
typecheck
test
build
banco/RLS checks quando aplicável
```

GitHub Actions não deve possuir job de deployment Vercel como parte do fluxo normal.

Não armazenar `VERCEL_TOKEN` no CI apenas para permitir publicação automática.

## 6. Gate para release manual

Quando o projeto realmente precisar ser publicado, antes da ação humana:

1. gates técnicos aplicáveis devem estar `PASS`;
2. a ref/commit candidata deve estar identificada;
3. configuração e variáveis exigidas devem estar documentadas sem secrets;
4. a separação de ambiente deve estar confirmada;
5. `docs/CHECKPOINT.md` deve registrar `MANUAL_ACTION_REQUIRED` se a continuidade depender daquela publicação;
6. a IA deve fornecer o runbook e riscos relevantes;
7. o usuário executa manualmente a publicação.

A ação humana de deployment não deve ser escondida dentro de uma tarefa automática.

## 7. Preview

Preview é opcional e manual.

Ele pode ser usado quando o usuário quiser revisar externamente uma release candidata, mas:

- não existe um Preview por PR por padrão;
- Preview não é gate obrigatório de merge;
- Preview não substitui testes/build;
- Preview deve usar configuração non-production.

## 8. Production

Production é manual e humana.

A IA pode preparar uma release candidate e revisar os checks, mas não:

- publicar Production;
- promover Preview;
- efetuar rollback;
- acionar redeploy.

## 9. Falha de deployment

Se uma publicação manual falhar:

1. não faça sequência de redeploys especulativos;
2. obtenha logs/erro do deployment existente;
3. reproduza localmente quando possível;
4. execute lint/typecheck/test/build;
5. identifique a causa e prepare correção limitada;
6. só então o usuário decide se executa nova tentativa manual.

## 10. Relação com o Project Design

`docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md` formaliza esta política no nível de produto/arquitetura e supersede referências históricas a Preview/Production automáticos.

`docs/adr/ADR-007-manual-vercel-deployment.md` registra a decisão arquitetural canônica. `DEC-009` permanece apenas como identificador histórico no registro legado.

## 11. Fontes oficiais verificadas em OPS-003

Em 31/08/2026 foram consultadas fontes oficiais da Vercel, incluindo:

- `https://vercel.com/docs/project-configuration/git-configuration`;
- `https://vercel.com/docs/deployments`;
- `https://vercel.com/docs/cli/deploy`;
- `https://vercel.com/docs/cli/deploying-from-cli`.

Comportamentos e configurações devem ser revalidados quando a Story de integração Vercel for executada.
