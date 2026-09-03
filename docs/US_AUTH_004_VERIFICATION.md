# US-AUTH-004 — Verificação

**Story:** `US-AUTH-004 — Validar e-mail Auth non-production`  
**Issue:** `#49`  
**PR:** `#50`  
**Status:** `PASS`, condicionado ao CI do head corrente antes do merge  
**Data:** 2026-09-03

## 1. Escopo final

A Story valida que o transporte de e-mail necessário aos fluxos de autenticação em desenvolvimento/non-production já é fornecido pelo Neon Auth e registra explicitamente que SMTP/provedor externo não é requisito nesta fase.

A implementação Resend inicialmente preparada na branch foi removida antes do merge por ausência de requisito material.

Arquivos principais:

- `docs/adr/ADR-009-neon-shared-email-nonproduction.md`;
- `docs/EMAIL_TRANSPORT.md`;
- `docs/NEON_NONPROD.md`;
- `docs/ENVIRONMENTS.md`;
- documentos canônicos de execução/checkpoint.

Não existe nova migration, adapter de e-mail, API key ou variável Resend no resultado final.

## 2. Readback Neon Auth

A baseline canônica foi lida diretamente em 03/09/2026:

```text
Project: caleida-nonprod
Branch: main / br-restless-cherry-awpcwy6r
Auth provider: better_auth
Email/password: enabled
Email provider: shared
Sender email: auth@mail.myneon.app
Sender name: Neon Auth
Require email verification: false
```

Conclusão: o ambiente non-production já possui transporte de e-mail de Auth sem domínio próprio ou SMTP externo.

## 3. Branch de verificação criada durante a investigação

Antes da simplificação de escopo havia sido criada:

```text
verify-us-auth-004 / br-plain-pond-aw5f59ia
parent: main
state: ready
Auth provider: better_auth
Email provider: shared
Require email verification: false
```

O readback confirmou que ela não contém mudança SMTP/Resend e que a baseline permaneceu inalterada.

A branch tornou-se desnecessária depois da decisão final. Sua existência é housekeeping não bloqueante. A exclusão exige autorização explícita do usuário porque `delete_branch` é destrutiva; nenhuma autorização é inferida nesta Story.

## 4. Decisão arquitetural

`ADR-009` estabelece:

- Neon shared email é suficiente para desenvolvimento/non-production e beta fechado enquanto seus limites atenderem;
- domínio próprio e SMTP customizado ficam adiados;
- provedor externo só será escolhido quando existir requisito real de branding, domínio, volume, entregabilidade, observabilidade, envio próprio da aplicação ou Production;
- uma futura escolha não presume Resend.

## 5. Confirmação de e-mail

`require_email_verification=false` permanece propositalmente.

US-AUTH-005 deve implementar primeiro o cadastro controlado por convite/aprovação de forma fail-closed. Só então a política de confirmação obrigatória pode ser ativada e exercitada sem criar um caminho de signup público acidental.

## 6. Invariantes preservados

- nenhuma credencial de e-mail foi criada ou versionada;
- nenhuma variável `RESEND_*`/SMTP foi adicionada ao contrato final;
- nenhum segredo foi exposto ao browser/chat/Git;
- nenhuma migration foi criada;
- nenhum convite/dado funcional foi alterado;
- nenhum SMTP da baseline foi modificado;
- nenhum deployment Vercel foi executado;
- Production Neon continua inexistente.

## 7. Gates

| Gate | Estado | Evidência |
|---|---|---|
| Neon Auth saudável na baseline | PASS | readback remoto 03/09/2026 |
| email/password habilitado | PASS | readback remoto |
| provider de e-mail nonprod | PASS | `type=shared` |
| domínio/SMTP externo | SKIPPED/DEFERRED | sem requisito atual; ADR-009 |
| `require_email_verification` | PASS | permanece `false` até US-AUTH-005 |
| migration/PostgreSQL específica da Story | SKIPPED | nenhuma mudança de schema |
| browser real | SKIPPED | nenhuma superfície funcional criada |
| Production Neon | SKIPPED/NON-GOAL | não provisionada |
| deployment Vercel | SKIPPED/PROIBIDO | ADR-007 |
| CI do head final | obrigatório antes do merge | evidência registrada na PR #50 para não criar commit auto-invalidante |

## 8. Critério de fechamento

A PR #50 pode ser mergeada quando:

1. o diff final não contiver adapter/env/secret Resend;
2. documentação canônica estiver reconciliada com ADR-009;
3. CI do head corrente estiver em PASS;
4. review não encontrar bloqueador.

Após o merge, `US-AUTH-005 — Cadastro controlado por convite ou aprovação` passa a ser a única `NEXT_ACTION`.
