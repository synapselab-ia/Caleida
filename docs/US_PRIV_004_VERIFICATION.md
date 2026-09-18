# US-PRIV-004 - Verificação do bloqueio com efeito real

**Estado:** `PASS / PRONTA PARA INTEGRAÇÃO`  
**Issue:** `#67` - open até o merge  
**PR:** `#68` - open  
**Branch Git:** `feat/us-priv-004-profile-blocking`  
**Neon isolated:** `verify-us-priv-004 / br-curly-fog-aw1c1hpo`

## Escopo

- `caleida_profile.profile_blocks` materializa blocker -> blocked;
- auto-bloqueio e duplicidade são impossíveis;
- blocker autenticado lista/cria/remove somente seus próprios bloqueios;
- UPDATE não existe no contrato normal;
- `has_block_relationship_with(uuid)` encapsula o predicado bilateral;
- `profiles_block_guard` é uma policy RESTRICTIVE de SELECT;
- owner sempre lê o próprio perfil;
- se A bloqueia B, A não lê B e B não lê A autenticados, mesmo quando public;
- anonymous continua lendo perfis public segundo US-PRIV-003;
- `/account/privacy` cria, lista e remove bloqueios sem fabricar mute/restrict.

## Migration

```text
database/migrations/000013_profile_blocking.sql
3a0b5d0548deef10e1fa2bda0c7c143400210288f681d51dbcdffa58c419e105
```

A tabela de bloqueios tem RLS habilitada sem FORCE deliberadamente. O acesso normal continua RLS-scoped; o helper SECURITY DEFINER precisa consultar ambos os sentidos da relação para aplicar o guard ao perfil.

## CI e PostgreSQL 18

```text
CI #299 / 35360001503: FAIL
causa: expectativa textual incorreta no teste novo

CI #301 / 35360262227: FAIL
causa: regex de grant anônimo capturava o EXECUTE do helper como falso positivo

CI #302 / 35360488983 / job 105650247432: SUCCESS
npm run verify: PASS
PostgreSQL 18: PASS
npm run verify:db: PASS
```

Os dois FAILs ocorreram em testes de contrato antes do gate SQL e foram corrigidos sem alterar o comportamento funcional.

## Neon-specific

Na branch isolada real:

- migration + ledger: PASS;
- Data API permaneceu active, expondo somente `caleida_profile`;
- profile_blocks RLS: enabled;
- policies: SELECT/INSERT/DELETE do owner;
- authenticated grants: SELECT/INSERT/DELETE;
- anonymous grants na tabela de bloqueios: nenhum;
- helper SECURITY DEFINER: confirmado;
- EXECUTE do helper para PUBLIC: false;
- guard de profiles: RESTRICTIVE.

Matriz com três identidades sintéticas:

```text
A lê B antes do bloqueio: 1
A bloqueia B: PASS
A helper(B): true
A lê B depois: 0
B helper(A): true
B lê A depois: 0
A lê a si próprio: 1
B lista bloqueios de A: 0
C lê A e B: 2
anonymous lê A e B public: 2
anonymous helper: false
self-block: CHECK violation / PASS adversarial
duplicate: PK violation / PASS adversarial
forged blocker: RLS violation / PASS adversarial
UPDATE block: permission denied / PASS adversarial
anonymous lê profile_blocks: permission denied / PASS adversarial
B remove bloqueio de A: 0
A remove próprio bloqueio: 1
B lê A após unblock: 1
cleanup synthetic fixtures: PASS
```

## Promoção baseline

Após os gates, `000013` foi aplicada deliberadamente em `main / br-restless-cherry-awpcwy6r`.

Readback:

- ledger `000001-000013`;
- checksum correto;
- ACLs e policies iguais à branch isolada;
- anonymous continua com somente as seis colunas públicas de profiles;
- Data API continua ativa somente para `caleida_profile`;
- schema diff isolated vs baseline: vazio.

## Browser e deployment

Browser/live intermediário: `SKIPPED/deferred` conforme Verification Protocol. Os critérios de autorização foram verificados na camada persistente e nos papéis gerenciados reais.

Nenhum deployment Vercel foi executado. Production Neon e Storage não foram criados.

## Resultado

US-PRIV-004 possui implementação, gate PostgreSQL 18, matriz Neon-specific e promoção da baseline em PASS. Falta somente CI final documental, merge, CI pós-merge e fechamento canônico.
