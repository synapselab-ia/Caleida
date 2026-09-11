# Incremento 2 — Acesso controlado / EPIC-02

**Status:** EM ANDAMENTO; US-AUTH-007 em revisão  
**Origem:** `EPIC-02 — Contas e autenticação`  
**Capacidades:** CAP-01, CAP-02, CAP-04 e CAP-35  
**Prioridade:** P0/P1  
**Stories concluídas:** `US-AUTH-001` a `US-AUTH-006`  
**Story ativa:** `US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões`

## 1. Objetivo

Criar a fundação segura de identidade e entrada controlada do beta fechado, mantendo autenticação gerenciada, autorização, convites, e-mail, cadastro, sessão, recovery e auditoria em Stories separadas e verificáveis.

O incremento termina apenas quando:

- Neon Auth estiver integrado e reproduzível em non-production;
- cadastro só puder ocorrer por convite válido ou solicitação aprovada;
- confirmação de e-mail, login/logout e superfícies privadas estiverem protegidos;
- papéis administrativos forem verificados no servidor e no banco;
- recuperação de senha e gestão/revogação de sessões estiverem implementadas;
- eventos críticos de acesso estiverem auditados sem secrets;
- migrations/RLS aplicáveis forem versionadas e verificadas;
- comportamento Neon-specific for provado em branch isolada quando houver dependência real;
- a matriz adversarial/browser live integrada for executada no fechamento do incremento;
- nenhum deployment Vercel automático ou executado por IA ocorrer.

## 2. Arquitetura e gates

Decisões vigentes:

- `ADR-004`: mudanças persistentes de banco somente por migrations;
- `ADR-005`: Neon como plataforma canônica de dados/identidade;
- `ADR-007`: deployment Vercel exclusivamente humano/manual;
- `ADR-008`: PostgreSQL 18 descartável para SQL portável e branch Neon isolada para comportamento Neon-specific;
- `ADR-009`: provider compartilhado do Neon Auth atende desenvolvimento/non-production enquanto adequado.

### Browser e deployment

Browser real é evidência, não obrigação de Preview por Story.

Para Stories intermediárias:

- `npm run verify` é obrigatório;
- PostgreSQL 18/`verify:db` executam conforme o gate permanente;
- Neon-specific é obrigatório quando a Story depende do serviço gerenciado;
- revisão server-side, testes de contrato e casos adversariais devem cobrir a camada de imposição;
- browser live pode ser `SKIPPED/deferred` quando não houver dependência pública material;
- ausência de Preview manual não é `BLOCKED` por padrão.

`US-AUTH-008` concentra a validação live acumulada. Se runtime público for necessário, usar uma única release candidate manual.

## 3. Estado integrado atual

```text
Projeto Neon: caleida-nonprod / patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Managed Better Auth: habilitado
Email/password: enabled
Require email verification: true
Email verification: OTP
Auth email provider: shared Neon
Data API: não provisionada
Production Neon: não provisionada
Deployment Vercel: exclusivamente humano/manual
```

Branches Neon de verificação são housekeeping e não podem ser excluídas automaticamente sem autorização específica.

## 4. Rastreamento de capacidades

| Capacidade | Cobertura principal |
|---|---|
| CAP-01 — Contas, autenticação e sessões | US-AUTH-001, 004, 005, 006 e 007 |
| CAP-02 — Convites e controle de entrada | US-AUTH-003 e 005 |
| CAP-04 — Papéis e permissões | US-AUTH-002 e 008 |
| CAP-35 — Auditoria | US-AUTH-002, 003, 007 e 008 |

## 5. Ordem das Stories

```text
US-AUTH-001 — fundação Neon Auth + sessão — CONCLUÍDA (#43 / #44)
  ↓
US-AUTH-002 — papéis/autorização + bootstrap — CONCLUÍDA (#45 / #46)
  ↓
US-AUTH-003 — convites/solicitações + auditoria — CONCLUÍDA (#47 / #48)
  ↓
US-AUTH-004 — e-mail Auth non-production — CONCLUÍDA (#49 / #50)
  ↓
US-AUTH-005 — cadastro controlado + confirmação de e-mail — CONCLUÍDA (#51 / #52)
  ↓
US-AUTH-006 — login/logout + proteção de sessão — CONCLUÍDA (#53 / #54)
  ↓
US-AUTH-007 — recovery + gestão/revogação de sessões — EM REVISÃO (#55 / #56)
  ↓
US-AUTH-008 — auditoria integrada + validação live do incremento
```

## 6. Stories concluídas 001–006

Detalhes e evidências permanecem em:

- `docs/US_AUTH_001_VERIFICATION.md`;
- `docs/US_AUTH_002_VERIFICATION.md`;
- `docs/US_AUTH_003_VERIFICATION.md`;
- `docs/US_AUTH_004_VERIFICATION.md`;
- `docs/US_AUTH_005_VERIFICATION.md`;
- `docs/US_AUTH_006_VERIFICATION.md`.

Estado consolidado: identidade Managed Better Auth, autorização/papéis de produto separados, entrada controlada por convite/aprovação, e-mail compartilhado Neon, confirmação obrigatória por OTP, login/logout e boundary privado server-side.

## 7. US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões

**Prioridade:** P0  
**Estado:** EM REVISÃO  
**Issue/PR:** `#55 / #56`  
**Dependências:** US-AUTH-004 e 006  
**Capacidades:** CAP-01, CAP-35  
**Contrato:** `docs/SESSION_SECURITY.md`  
**Evidência:** `docs/US_AUTH_007_VERIFICATION.md`

### Implementação

- `/forgot-password`: recuperação com resposta pública genérica;
- callback same-origin validado no servidor;
- `/reset-password`: reset por token de uso único do provider;
- `/account/security`: alteração de senha e gestão das próprias sessões;
- alteração autenticada exige senha atual e revoga as outras sessões;
- listagem expõe metadados seguros, nunca bearer token;
- revogação individual usa ID opaco e resolve o token somente após ownership server-side;
- sessão corrente pode ser encerrada por `signOut()`;
- cache de dados de sessão reduzido de 300 s para 1 s;
- nenhum novo schema/migration de produto.

### Semântica de segurança

- SDK `@neondatabase/auth@0.5.0-beta` permaneceu exato após revalidação;
- operações sensíveis upstream usam sessão autoritativa em deployment stateful;
- o boundary comum pode aceitar cache assinado por até aproximadamente 1 s antes de revalidar;
- o Managed Neon observado não expõe `revokeSessionsOnPasswordReset`; portanto reset por e-mail não é declarado como revogação automática de sessões existentes;
- alteração autenticada e controles explícitos fornecem revogação das sessões próprias;
- recovery real, trusted origin e comportamento multi-device ficam para a matriz live final.

### Gates

```text
Head funcional: df745df9a05232372e8a1e1b269bc5502499503b
CI #221 / 34519793813 / job 103014162360: SUCCESS
npm run verify: PASS
PostgreSQL 18 + verify:db: PASS
Neon branch: verify-us-auth-007 / br-wandering-mountain-awjnqqps / ready
Auth users/sessions/accounts/verifications: 0
Schema diff vs baseline: vazio
Browser/live: SKIPPED/deferred para US-AUTH-008
Preview Vercel: não requerido
```

## 8. US-AUTH-008 — Consolidar auditoria e validar Incremento 2

**Prioridade:** P1  
**Estado:** A FAZER  
**Dependências:** US-AUTH-001 a 007  
**Capacidades:** CAP-04, CAP-35

Deve:

- consolidar eventos críticos de autenticação/autorização sem senha/token/secret;
- executar a matriz adversarial integrada;
- validar live signup/OTP, login/logout, recovery/reset, mudança de senha, sessão/revogação, autorização e acesso direto;
- medir comportamento de sessão revogada após janela de cache;
- validar trusted origin do callback de recovery;
- produzir evidência de encerramento do Incremento 2.

Se runtime público for material, usar uma única release candidate manual conforme `ADR-007` e a Deployment Policy.

## 9. Matriz transversal de segurança

Toda Story protegida deve considerar, conforme aplicável:

1. visitante/anônimo;
2. usuário autenticado autorizado;
3. usuário autenticado não autorizado conhecendo ID válido;
4. manipulação de ID/ownership/papel;
5. acesso direto sem UI;
6. sessão inválida/revogada;
7. secret ausente/inválido;
8. papel comum tentando ação administrativa;
9. concorrência em alteração crítica;
10. ausência de vazamento durante loading/erro.

## 10. Contrato de ambientes

Nomes versionados, valores reais proibidos:

```text
NEON_AUTH_BASE_URL
NEON_AUTH_COOKIE_SECRET
CALEIDA_BOOTSTRAP_OWNER_USER_ID
CALEIDA_BOOTSTRAP_REASON
CALEIDA_ALLOW_OWNER_BOOTSTRAP
```

Production Neon continua inexistente.

## 11. Próxima ação

> Finalizar a PR #56 da US-AUTH-007 com CI do head documental final, revisão da diff/threads e merge. Após CI saudável em `main`, promover somente US-AUTH-008.
