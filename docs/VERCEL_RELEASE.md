# Vercel — Runbook de release manual

**Status:** runbook operacional de hosting atualizado para US-AUTH-008  
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

`vercel.json` mantém:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": {
    "deploymentEnabled": false
  }
}
```

Enquanto ADR-007 estiver vigente, esse guardrail não deve ser removido.

## 2. Estado externo observado em 11/09/2026

O estado antigo deste runbook, que dizia não existir projeto Vercel, ficou obsoleto após a primeira publicação manual do Caleida.

Estado real atual:

```text
Project: caleida
Project ID: prj_OQw0hRn1YYQWXSpC87OLF47NqZ2r
Framework: Next.js
Node: 24.x
Latest deployment: dpl_8WN2sKEEL6ex3vKt11vmYX9ZGvoN
Latest state: READY
Latest Git source: US-AUTH-005
Production deployment ativo: não
```

O deployment existente é útil como evidência histórica da US-AUTH-005, mas não contém US-AUTH-006, US-AUTH-007 ou US-AUTH-008.

## 3. Pré-condições para release manual

Antes de qualquer publicação:

1. ref candidata identificada;
2. CI da ref candidata verde;
3. `npm run verify` e gates de banco aplicáveis em PASS;
4. `vercel.json` ainda com `git.deploymentEnabled: false`;
5. CI sem CD/deploy hooks;
6. variáveis no escopo correto;
7. Preview usando somente recursos/secrets non-production;
8. nenhum secret versionado;
9. ambiente de dados correspondente pronto;
10. `docs/CHECKPOINT.md` em `MANUAL_ACTION_REQUIRED` quando o gate depender da publicação;
11. publicação explicitamente decidida pelo usuário.

## 4. Release candidate da US-AUTH-008

A US-AUTH-008 é o ponto planejado de validação live acumulada do Incremento 2. Os gates técnicos e Neon-specific passaram e a migration `000008` já está na baseline non-production.

A única publicação necessária agora é uma Preview da branch:

```text
feat/us-auth-008-audit-integrated-validation
```

Não usar Production e não promover a Preview depois do teste.

### Pelo dashboard

A Vercel documenta a criação manual de deployment por branch ou SHA no Dashboard. No projeto `caleida`:

1. abrir **Deployments**;
2. no menu de três pontos ao lado do cabeçalho de Deployments, escolher **Create Deployment**;
3. informar `feat/us-auth-008-audit-integrated-validation` para deployment baseado na branch;
4. confirmar que a configuração selecionada é Preview/non-production;
5. criar o deployment;
6. aguardar `READY`;
7. retornar ao fluxo canônico do Caleida com o deployment disponível para inspeção.

A nomenclatura visual do dashboard pode variar, mas a operação deve continuar sendo manual e baseada na ref candidata. Se o dashboard pedir escolha de branch configuration porque o commit aparece em múltiplas branches, selecionar a configuração da feature branch/Preview, não Production.

### CLI — somente referência

A documentação Vercel também suporta `vercel deploy`, mas essa não é a rota necessária para o usuário neste gate e não deve ser adicionada a scripts/CI.

## 5. Variáveis da Preview

A Preview da US-AUTH-008 deve continuar apontando somente para non-production.

Nomes necessários no estado atual, sem registrar valores:

```text
DATABASE_URL
CALEIDA_RATE_LIMIT_SECRET
NEON_AUTH_BASE_URL
NEON_AUTH_COOKIE_SECRET
```

Variáveis de tooling como `DATABASE_URL_UNPOOLED`, `CALEIDA_DB_TARGET` e autorização de migration não são requisitos do runtime web comum e não devem ser adicionadas à Preview apenas por conveniência.

Production Neon não existe. Nunca reutilizar qualquer futuro secret Production nesta Preview.

## 6. Depois de READY

A IA pode inspecionar o deployment já criado, obter acesso temporário se Vercel Authentication proteger a Preview, revisar logs/runtime e executar a matriz live da US-AUTH-008.

A matriz deve ocorrer sobre uma única RC e cobrir signup/OTP, login/logout, recovery/reset, senha, sessões, autorização, acesso direto, flash privado e auditoria.

## 7. Falha de release

Se a publicação manual falhar:

1. não repetir deployments especulativamente;
2. identificar o deployment falho;
3. coletar build logs existentes;
4. separar erro de código de erro de configuração;
5. reproduzir pelos gates canônicos quando possível;
6. corrigir em branch/PR limitada;
7. somente depois decidir uma nova tentativa manual.

Falha nunca autoriza reduzir Auth/autorização, copiar secrets Production ou reativar Git deployments automáticos.

## 8. Production

Production continua fora do escopo da US-AUTH-008.

A IA não executa:

- Production deployment;
- promote;
- rollback;
- redeploy;
- deploy hook;
- API/SDK para criar deployment.

## 9. Fontes Vercel revalidadas

Em 11/09/2026 foi revalidado que:

- `git.deploymentEnabled: false` continua sendo o guardrail para Git deployments automáticos;
- Vercel continua suportando deployment manual via CLI;
- o Dashboard suporta iniciar deployment manual a partir de uma branch ou SHA de Git.

Comportamentos externos devem ser novamente conferidos se a interface/plataforma mudar materialmente.
