# Execution Plan - Caleida

**Estado:** Incremento 3 em execução; US-PRIV-001 bloqueada no gate JWT/Data API live.  
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
- não criar fluxo social, catálogo ou upload falso para satisfazer requisitos que dependem de épicos futuros;
- owner/BYPASSRLS não substitui evidência de autorização de usuário real.

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

## 3. Incremento 3 - Perfis e privacidade / EPIC-03

**Capacidades:** CAP-03, CAP-05 e CAP-33  
**Plano:** `docs/INCREMENT_3_PLAN.md`  
**Estado:** EM ANDAMENTO

Ordem planejada:

```text
US-PRIV-001 - perfil básico user-scoped + Data API/RLS       BLOQUEADA NO GATE LIVE
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

Nenhuma Story posterior pode iniciar enquanto US-PRIV-001 estiver bloqueada.

## 4. Estado técnico de US-PRIV-001

Já concluído em código e gates não-live:

- migration `000009_profile_core.sql`;
- perfil básico em `caleida_profile.profiles`;
- ownership UUID Auth imutável pelo payload;
- visibilidade default `only_me`;
- grants mínimos + RLS forçada;
- owner `SELECT/INSERT/UPDATE`;
- outro usuário/anônimo negados no contrato adversarial;
- nenhum `DELETE` normal;
- Data API ativa somente em `verify-us-priv-001`;
- boundary normal de aplicação usa JWT server-side + Data API, não owner connection;
- `/account/profile` oferece setup/edição real de username/display name;
- CI final do head funcional/documental: `#270 / 34981913010 / SUCCESS`;
- PostgreSQL 18 e `npm run verify:db`: PASS;
- ledger Neon isolado em `000001-000009`.

A baseline `main / br-restless-cherry-awpcwy6r` continua em `000001-000008` e sem Data API.

## 5. Gate obrigatório pendente

O fechamento de US-PRIV-001 exige duas identidades Auth sintéticas reais A/B e anônimo atravessando JWT, Data API e RLS.

O probe está pronto:

```text
Branch: probe/us-priv-001-live
Head: 5c034c42c455a2812cd6e4b1dd1674c66e0733be
Workflow: US-PRIV-001 live probe
Run #4: 34981435532
Attempt atual: 2
Job atual: 104438672632
Probe syntax: PASS
Preflight NEON_API_KEY: FAIL-CLOSED / secret ausente
JWT/Data API matrix: SKIPPED
Fixtures sintéticas: não criadas
Cleanup: SKIPPED/no_api_key sem resíduo
```

A matriz preparada cobre:

- JWT real A e B;
- token anônimo;
- insert do owner;
- isolamento de leitura A/B;
- update cruzado negado;
- forged ownership negado;
- transferência de ownership negada;
- `DELETE` negado;
- anônimo sem leitura;
- cleanup de perfis/identidades sintéticas.

Nenhum endpoint real, JWT, OTP, API key ou connection string é persistido.

O attempt 2 executado em 15/09/2026 confirmou diretamente no log que `NEON_API_KEY` continua vazio no runtime do GitHub Actions. Portanto o bloqueio permanece externo e atual.

## 6. Intervenção externa mínima

É necessário configurar no repositório GitHub Actions o secret `NEON_API_KEY`, com acesso somente ao necessário no projeto Neon non-production.

A chave não deve ser enviada pelo chat.

Após a configuração, rerodar somente o job live existente. Não recriar recursos já existentes.

## 7. Critério para retomar promoção

Somente depois de o gate live ficar em PASS:

1. promover deliberadamente `000009` para a baseline non-production com o tooling canônico;
2. provisionar/configurar Data API na baseline com grants mínimos;
3. fazer readback do ledger, schema, RLS, grants e Data API;
4. executar CI final;
5. atualizar `CHECKPOINT`, backlog, changelog e evidência;
6. mergear PR #62 e fechar Issue #61;
7. somente então promover US-PRIV-002 como próxima Story.

Se o live gate encontrar defeito, corrigir US-PRIV-001 e repetir os gates antes de qualquer promoção.

## 8. Limites deliberados

O Incremento 3 não antecipa dependências sem superfície real:

- avatar/banner ficam para EPIC-16/CAP-30, quando Storage for decidido;
- obras favoritas ficam após EPIC-04/CAP-06;
- followers/connections não são oferecidos como visibilidade funcional antes de EPIC-13;
- mute e restrição de interação ficam para EPIC-13, onde feed/interações lhes dão efeito observável;
- privacidade de biblioteca, avaliações, resenhas, coleções, metas e demais conteúdos nasce junto de cada domínio;
- exportação de encerramento de CAP-33 é limitada aos dados existentes; CAP-32/EPIC-17 continuará responsável pela portabilidade completa.

Bloqueio entra neste incremento porque já possui efeito real sobre leitura de perfil e deve prevalecer sobre visibilidade pública entre usuários autenticados.

## 9. NEXT_ACTION

> Configurar com segurança `NEON_API_KEY` em GitHub Actions e, somente depois, rerodar o live probe existente da US-PRIV-001. Não promover baseline, mergear #62 ou iniciar US-PRIV-002 antes de PASS da matriz JWT/Data API/RLS.
