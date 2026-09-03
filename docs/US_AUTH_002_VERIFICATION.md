# Verificação — US-AUTH-002

**Story:** `US-AUTH-002 — Materializar papéis, autorização e bootstrap administrativo`  
**Issue:** `#45`  
**PR:** `#46`  
**Branch Git:** `feat/us-auth-002-authorization-bootstrap`

## Escopo verificado

- papéis de produto separados do papel Admin do Better Auth;
- migration versionada de autorização/auditoria;
- política server-only;
- negações adversariais no banco;
- bootstrap inicial por identidade Neon Auth existente;
- ACLs sem acesso público;
- nenhuma superfície client-side ou Data API adicionada.

## Neon-specific

Branch descartável:

```text
name: verify-us-auth-002
id: br-weathered-shape-awp7ckqa
parent: br-restless-cherry-awpcwy6r
project: patient-glade-95136440
PostgreSQL: 18
Auth: Managed Better Auth branch-scoped
```

O SQL de `database/migrations/000002_product_authorization.sql` foi aplicado na branch isolada antes de qualquer promoção à baseline.

Foram criadas três identidades sintéticas somente nessa branch descartável para o gate. Seus valores não são persistidos nesta documentação e nenhuma identidade foi criada na baseline.

Resultados:

- migration SQL: `PASS`;
- Managed Better Auth herdado/branch-scoped: `PASS`;
- UUID existente no diretório `neon_auth.user`: `PASS`;
- UUID inexistente: `PASS — rejeitável/detectado`;
- bootstrap inicial: `PASS`;
- bootstrap repetido da mesma identidade: `PASS — idempotente`;
- proprietário concedendo `administrador` a outra identidade: `PASS`;
- administrador concedendo `moderador`: `PASS`;
- usuário tentando autopromoção: `PASS — DENIED`;
- administrador tentando conceder `administrador`: `PASS — DENIED`;
- auditoria dos eventos válidos: `PASS`;
- acesso direto/EXECUTE para `PUBLIC`: `PASS — ausente`.

## CI PostgreSQL 18

### Run inicial — `33765866322`

Head: `b8f84ee8db2c59de8f377c4b4f40933f2e6c538a`.

- `npm ci`: `PASS`;
- `npm run verify`: `PASS`;
- servidor PostgreSQL 18: `PASS`;
- migrations `000001` e `000002`: `PASS`;
- testes SQL `000001`/`000002`: `PASS`;
- teste `000003_product_authorization.sql`: `FAIL` no check de ACL porque `has_*_privilege('PUBLIC', ...)` interpreta `PUBLIC` como nome de role e PostgreSQL 18 não possui role com esse nome.

A falha foi do teste, não da migration ou da política. O teste foi corrigido sem relaxar o ACL: passou a criar um role `NOLOGIN` sem privilégios e verificar schema/tabelas/funções contra esse role real.

### Run corrigido

Pendente de conclusão no head posterior à correção. O resultado final deve ser atualizado neste documento antes do merge.

## Baseline non-production

A baseline `caleida-nonprod/main` permaneceu intacta durante a experimentação. A migration só pode ser promovida depois de CI PostgreSQL 18 e Neon-specific em PASS.

Nenhum proprietário deve ser bootstrapado na baseline enquanto não houver identidade real apropriada; criar conta persistente somente para concluir esta Story é non-goal.

## Gates complementares

- browser real: `SKIPPED — não existe fluxo/UI funcional nesta Story`;
- Data API: `SKIPPED/NON-GOAL`;
- Production Neon: `SKIPPED/NON-GOAL`;
- deployment Vercel: `SKIPPED/PROIBIDO` conforme ADR-007;
- secrets reais no Git/Issue/PR/docs: `PASS — nenhum`.

## Limpeza

A exclusão da branch Neon descartável `verify-us-auth-002` é destrutiva no conector e exigirá autorização explícita do usuário após os gates, sem reutilizar autorizações dadas para branches anteriores.
