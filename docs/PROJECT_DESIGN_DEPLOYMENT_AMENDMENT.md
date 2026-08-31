# Caleida — Project Design Deployment Amendment v1.2

**Data:** 31 de agosto de 2026  
**Status:** Aprovado  
**Aplica-se a:** `docs/PROJECT_DESIGN.md` v1.0 e amendments anteriores  
**Escopo:** somente hosting, deployment, Preview/Production, CI e release workflow

Este documento integra o Project Design do Caleida e deve ser lido junto com `docs/PROJECT_DESIGN.md` e `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md`.

Ele não altera o destino de hosting: Vercel continua sendo a plataforma prevista. O que muda é a forma de publicação.

## 1. Regra de supersessão

Dentro do escopo de deployment/release, este amendment prevalece sobre referências anteriores que tratem deployment Vercel como consequência automática de push, branch, pull request ou merge.

Ficam preservadas como histórico, mas deixam de governar o fluxo ativo:

- a linha da seção 13.1 que descreve Vercel como `Produção e Preview Deployments por branch ou PR`;
- a etapa da seção 13.2 que pressupõe Preview automático para toda pull request/branch;
- referências da seção 15.2 a Preview automático como comportamento operacional necessário;
- o ciclo do Incremento 0 que exige `publicar uma base vazia` como gate técnico;
- a orientação da seção 32 que exige testar Preview para validar toda PR;
- a orientação da seção 35 que inclui Preview como gate obrigatório antes de merge;
- qualquer outra formulação do Project Design v1.0 que torne publicação externa uma consequência normal do desenvolvimento.

O `PROJECT_DESIGN_PLATFORM_AMENDMENT.md` continua vigente em seu próprio escopo. Sua nota transitória sobre deployment fica encerrada por este amendment.

## 2. Decisão central

Deployment do Caleida é uma **ação humana, manual e deliberada de release**.

Enquanto esta decisão estiver vigente:

- agentes de IA não executam deployments;
- automações não executam deployments;
- GitHub Actions não executa deployments;
- push, branch, PR e merge não devem gerar deployments Vercel;
- deploy hooks não são utilizados como mecanismo de publicação automática;
- Preview e Production são ambientes de publicação opcionais, não gates obrigatórios de desenvolvimento.

Uma futura mudança desta política exige decisão arquitetural explícita.

## 3. Vercel Git Integration

A documentação oficial da Vercel verificada em 31/08/2026 define `git.deploymentEnabled: false` como forma de impedir que branches Git disparem deployments.

Quando a aplicação possuir `vercel.json`, a configuração canônica deverá incluir, salvo decisão posterior que substitua esta política:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": {
    "deploymentEnabled": false
  }
}
```

Essa configuração deve existir **antes** de qualquer integração Git que possa provocar publicação automática.

A propriedade legada `github.enabled` não deve ser usada para esse objetivo quando `git.deploymentEnabled` for a configuração corrente documentada pela Vercel.

## 4. CI não é CD

GitHub Actions permanece responsável por integração contínua e qualidade técnica.

O pipeline normal pode executar:

- instalação reproduzível de dependências;
- lint;
- typecheck;
- testes;
- build;
- verificações de migrations/RLS em ambiente Neon isolado quando aplicável;
- checks de segurança e consistência.

O pipeline normal não deve conter:

- `vercel deploy`;
- `vercel --prod` / `vercel deploy --prod`;
- `vercel promote`;
- `vercel rollback`;
- chamadas à API da Vercel que criem deployment;
- deploy hooks;
- tokens Vercel mantidos no CI apenas para publicação.

## 5. Fluxo normal de desenvolvimento

```text
NEXT_ACTION / Issue
  ↓
branch
  ↓
implementação
  ↓
lint + typecheck + testes + build
  ↓
verificação de banco quando aplicável
  ↓
PR
  ↓
review
  ↓
merge
  ↓
SEM DEPLOY AUTOMÁTICO
```

O merge conclui integração de código; não significa release.

## 6. Fluxo de release manual

Quando houver motivo real para publicar:

1. a versão/ref candidata deve estar identificada;
2. gates técnicos aplicáveis devem estar `PASS`;
3. variáveis e configuração exigidas devem estar documentadas sem secrets;
4. o `CHECKPOINT` deve registrar `MANUAL_ACTION_REQUIRED` se a continuidade depender da publicação;
5. a IA pode preparar um runbook de release e revisar pré-condições;
6. **o usuário executa manualmente o deployment** por CLI/dashboard ou mecanismo oficial equivalente;
7. após a publicação, a IA pode inspecionar deployment/logs quando solicitado e disponível;
8. falhas devem ser diagnosticadas antes de qualquer nova tentativa manual.

O usuário pode optar por não publicar por longos períodos sem bloquear desenvolvimento independente.

## 7. Preview manual

Preview continua disponível como recurso da Vercel, mas somente quando o usuário deliberadamente quiser publicar um candidato para inspeção externa.

Um Preview manual:

- não é criado para cada PR;
- não é requisito para merge;
- não substitui build/testes locais ou CI;
- deve usar configuração non-production apropriada;
- não deve apontar para banco/secrets de Production por conveniência.

## 8. Production manual

Production só é publicada pelo usuário depois dos gates aplicáveis.

A IA não deve:

- disparar Production;
- promover Preview para Production;
- efetuar rollback;
- acionar redeploy;
- criar automação que faça qualquer dessas ações.

Ela pode preparar diagnóstico, recomendar release/rollback e inspecionar estado já publicado quando solicitado.

## 9. Incremento 0 atualizado

O Incremento 0 deve produzir uma base **deployable**, não necessariamente deployed.

Seu encerramento exige:

- aplicação reproduzível;
- lint, typecheck, testes e build aprovados;
- CI funcionando sem CD;
- configuração de hosting preparada para impedir Git deployments automáticos;
- contrato de variáveis por ambiente;
- runbook de release manual;
- ausência de secrets versionados.

Um deployment real não é obrigatório para fechar o Incremento 0.

## 10. Relação com as Stories de plataforma

`US-PLAT-008` passa a preparar o repositório para hosting Vercel manual, incluindo a configuração que desabilita Git deployments automáticos e o runbook de release. Ela não exige conectar/publicar o projeto.

`US-PLAT-010` valida o ciclo técnico:

```text
PR → CI → review → merge
```

sem deployment como etapa obrigatória.

Quando uma release externa for necessária, ela deve aparecer como ação manual separada, não como efeito colateral da Story.

## 11. Fontes oficiais verificadas em OPS-003

Documentação oficial Vercel consultada em 31/08/2026:

- Git configuration / `git.deploymentEnabled`: https://vercel.com/docs/project-configuration/git-configuration
- CLI deployments: https://vercel.com/docs/cli/deploy
- Deploying from CLI: https://vercel.com/docs/cli/deploying-from-cli
- Deployments overview: https://vercel.com/docs/deployments

A documentação corrente deve ser revalidada na Story que materializar a integração Vercel.