# US-AUTH-008 — Verificação de auditoria e fechamento do Incremento 2

**Estado:** `MANUAL_ACTION_REQUIRED` — gates técnicos em PASS; matriz live encontrou uma falha material, corrigida no código e ainda pendente de revalidação em RC atualizada  
**Issue:** `#57`  
**PR:** `#58`  
**Branch Git:** `feat/us-auth-008-audit-integrated-validation`  
**Baseline Neon:** `main / br-restless-cherry-awpcwy6r`  
**Branch Neon isolada:** `verify-us-auth-008 / br-delicate-meadow-aw1u62kn`

## 1. Escopo

US-AUTH-008 fecha o Incremento 2 consolidando auditoria mínima de segurança e uma única matriz live integrada para signup/OTP, login/logout, recovery/reset, sessões, autorização e proteção privada.

## 2. Auditoria implementada

Migration canônica:

```text
database/migrations/000008_auth_security_audit.sql
checksum: 4f2ab39dd53413c522648ce7021a0051a163b009486c5dd6e7fcf1e2f81460b8
```

Tabela privada:

```text
caleida_audit.auth_security_events
```

Persistência limitada a `event_type`, `actor_auth_user_id`, `outcome`, `reason_code` e timestamp. E-mail, senha, OTP, recovery token, session token, cookie, Auth URL, connection string, IP e payload arbitrário não fazem parte do contrato.

Eventos cobertos: login, logout, recovery, reset, password change, revogação individual/coletiva e POSTs relevantes do proxy Auth.

## 3. Gates portáveis e Neon

Gates previamente concluídos:

- CI/PostgreSQL 18: PASS;
- migration `000008`: PASS;
- teste SQL adversarial/ACL: PASS;
- Neon isolated `verify-us-auth-008`: PASS;
- promoção `000008` para baseline non-production: PASS;
- diff `verify-us-auth-008` vs baseline após promoção: vazio.

O head funcional inicial da Story havia passado no CI #229. Após a correção descoberta pela matriz live, o novo head funcional é:

```text
9366069ded22a9f1aed444e86153ab1a11db53b2
```

CI da correção:

```text
Run number: #232
Run ID: 34616208433
Job ID: 103318914704
Conclusion: SUCCESS
```

Passaram novamente runtime contract, instalação, `npm run verify`, PostgreSQL 18 e `npm run verify:db`.

## 4. Release candidate exercitada

Preview manual exercitada:

```text
deployment: dpl_91NQikXRxHEKFMVxE52JRJBNWbjC
branch: feat/us-auth-008-audit-integrated-validation
environment: Preview / non-production
```

A RC reutilizava a configuração Preview histórica que apontava para a branch Neon non-production `verify-us-auth-005 / br-small-river-aww0rtxo`. Para tornar o ambiente compatível com o código atual sem criar novo deploy ou Production:

- a migration `000008` foi aplicada nessa branch de Preview;
- o hostname da RC atual foi adicionado aos trusted origins do Managed Better Auth;
- nenhum segredo foi versionado.

A entrega de OTP via `mail.tm` ficou indisponível apesar de o OTP ser gerado no Managed Auth. A probe descartável passou a usar GrabMail como mailbox temporária; isso destravou a entrega sem alterar o código da aplicação.

## 5. Evidência live confirmada

A matriz real comprovou na RC:

- Chrome real: acesso anônimo a `/app` redireciona e não mostra conteúdo privado;
- signup sem autorização: negado;
- signup com autorização sintética isolada: aceito;
- usuário não verificado: login negado;
- OTP real recebido e confirmado;
- login por server action: sucesso e `/app` privado acessível;
- duas sessões independentes do mesmo usuário;
- tentativa de revogar session id não pertencente ao usuário: negada sem derrubar sessões legítimas;
- revogação individual remota: sucesso;
- após a janela de cache, a sessão revogada perdeu acesso e a sessão atual permaneceu ativa;
- auditoria live registrou eventos controlados sem persistir credenciais/e-mail no schema de auditoria.

Probe que revelou o defeito material:

```text
run #9
Run ID: 34615577700
Job ID: 103316542470
```

## 6. Defeito encontrado pela matriz e correção

A ação **Encerrar todas as outras sessões** retornava sucesso, porém a sessão remota continuava existente e autenticada após a janela de revalidação.

Readback do Neon confirmou que não era apenas cache: a sessão remota permanecia na tabela de sessões do Managed Auth.

A implementação anterior delegava diretamente a `createServerAuth().revokeOtherSessions()`. A RC demonstrou que esse atalho não efetivava a revogação no adapter/configuração atual.

Correção aplicada em `src/lib/auth/actions.ts`:

1. obter as sessões pelo provider no servidor;
2. filtrar somente sessões do usuário autenticado;
3. preservar a sessão corrente por `session.id`;
4. revogar cada sessão remota explicitamente com `revokeSession({ token })`;
5. manter token exclusivamente no servidor;
6. falhar fechado e auditar erro se listagem ou qualquer revogação for rejeitada.

O contrato `tests/password-session-management-contract.test.mjs` foi reforçado para exigir essa semântica.

A correção passou integralmente no CI #232.

## 7. O que ainda falta

A Preview já publicada é imutável e contém o código anterior à correção acima. Portanto ela não pode provar o fechamento da Story.

É materialmente necessária **uma única RC Preview atualizada** da branch atual da PR #58. Isso não reintroduz deploy por Story: trata-se da revalidação do bug real encontrado pelo gate live final.

Na RC atualizada, retomar a matriz a partir do conjunto completo e confirmar em especial:

- revogação de todas as outras sessões preservando a atual;
- recovery existente/inexistente com resposta indistinguível;
- origin divergente sem disparo inseguro;
- recovery real e reset por link;
- replay de token rejeitado;
- senha antiga/nova após reset;
- comportamento real das sessões existentes após reset;
- mudança autenticada de senha revogando demais sessões;
- logout final;
- readback final de auditoria sem dados sensíveis;
- ausência de 5xx/erro crítico nos caminhos exercitados.

## 8. Critério de conclusão

Não declarar US-AUTH-008 nem Incremento 2 concluídos até que a RC atualizada passe a matriz live restante e a PR #58 tenha seus gates finais verdes.

## 9. Restrições preservadas

- Production Neon não criada;
- Data API não provisionada;
- nenhum deployment executado pela IA;
- nenhum secret/Auth URL/OTP/token/senha persistido em Git/docs;
- nenhuma branch Neon ou fixture histórica removida sem autorização destrutiva explícita.
