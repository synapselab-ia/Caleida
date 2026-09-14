# Execution Plan - Caleida

**Estado:** Incremento 3 refinado em OPS-007; nenhuma Story de implementação ativa.  
**Fonte de execução:** `docs/CHECKPOINT.md`  
**Plano vigente:** `docs/INCREMENT_3_PLAN.md`

## 1. Regras vigentes

- uma Story limitada por vez;
- migrations persistentes somente em `database/migrations/`;
- PostgreSQL 18 descartável é o gate portável padrão;
- Neon isolado complementa mudanças dependentes de comportamento gerenciado;
- deployment Vercel é exclusivamente humano/manual conforme ADR-007;
- nenhum secret, senha, OTP, recovery token, session token, cookie, Auth URL ou connection string é persistido em Git/docs/issues;
- Production Neon e Storage não são criados sem Story/decisão própria;
- Data API somente é provisionada quando a Story user-scoped realmente a exigir e depois de prova em branch Neon isolada;
- não criar fluxo social, catálogo ou upload falso para satisfazer requisitos que dependem de épicos futuros.

## 2. Incrementos concluídos

```text
Incremento 0 - Fundação executável - CONCLUÍDO
Incremento 1 - Fundação visual - CONCLUÍDO
Incremento 2 - Acesso controlado / EPIC-02 - CONCLUÍDO
```

Fechamento do Incremento 2:

```text
PR #58: merged
Issue #57: closed/completed
Merge: 84f7fecb018d6f4b6bc36817accef15f1976f05f
CI pós-merge #246 / 34850194033: SUCCESS
Live matrix #13 / 34636223750: SUCCESS
```

A baseline operacional usada por OPS-007 é `main` em `9ea9f9253a0123eb491d8980fd252401b6ea8f10`, com CI `#247 / 34851172467` em `SUCCESS`.

## 3. Incremento 3 - Perfis e privacidade / EPIC-03

**Capacidades:** CAP-03, CAP-05 e CAP-33  
**Plano:** `docs/INCREMENT_3_PLAN.md`  
**Estado:** REFINADO

Ordem planejada:

```text
US-PRIV-001 - perfil básico user-scoped + Data API/RLS       PRONTA
  ↓
US-PRIV-002 - personalização segura do perfil                A FAZER
  ↓
US-PRIV-003 - rota pública + visibilidade                     A FAZER
  ↓
US-PRIV-004 - bloqueio e contrato de exclusão social          A FAZER
  ↓
US-PRIV-005 - desativação e reativação da conta              A FAZER
  ↓
US-PRIV-006 - solicitação/cancelamento + export de encerramento A FAZER
  ↓
US-PRIV-007 - finalização segura da exclusão                  A FAZER
  ↓
US-PRIV-008 - validação integrada + fechamento                A FAZER
```

## 4. Limites deliberados

O Incremento 3 não antecipa dependências sem superfície real:

- avatar/banner ficam para EPIC-16/CAP-30, quando Storage for decidido;
- obras favoritas ficam após EPIC-04/CAP-06;
- followers/connections não são oferecidos como visibilidade funcional antes de EPIC-13;
- mute e restrição de interação ficam para EPIC-13, onde feed/interações lhes dão efeito observável;
- privacidade de biblioteca, avaliações, resenhas, coleções, metas e demais conteúdos nasce junto de cada domínio;
- exportação de encerramento de CAP-33 é limitada aos dados existentes; CAP-32/EPIC-17 continuará responsável pela portabilidade completa.

Bloqueio entra neste incremento porque já possui efeito real sobre leitura de perfil e deve prevalecer sobre visibilidade pública entre usuários autenticados.

## 5. Estratégia de dados e segurança

A primeira Story deve criar o primeiro domínio user-scoped com ownership real:

- perfil separado da identidade `neon_auth`;
- UUID Auth como ownership imutável;
- visibilidade default `only_me`;
- Data API + JWT + grants mínimos + RLS;
- `authenticated` não concede acesso genérico;
- owner/BYPASSRLS não é caminho normal de CRUD;
- outro usuário e anônimo são negados na Story inicial;
- profile public/anonymous somente entra na Story de visibilidade;
- qualquer estado social ainda não implementado resolve fail-closed.

A documentação oficial corrente da Neon foi revalidada em OPS-007 para Data API, access control/RLS e Managed Better Auth. A Story deve confirmar novamente versões e APIs imediatamente antes de implementar.

## 6. NEXT_ACTION

> Executar somente `US-PRIV-001 - Materializar perfil básico user-scoped com Data API e RLS`, conforme `docs/INCREMENT_3_PLAN.md`. Não iniciar US-PRIV-002, Storage, catálogo, relações sociais, Production Neon ou deployment Vercel por antecipação.
