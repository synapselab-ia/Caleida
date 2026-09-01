# Ambientes e variáveis — Caleida

**Status:** contrato operacional canônico de configuração  
**Decisões relacionadas:** `ADR-005` e `ADR-007`  
**Plataforma:** `docs/NEON_PLATFORM.md`  
**Release:** `docs/VERCEL_RELEASE.md`

Este documento define como configuração e secrets devem ser separados entre desenvolvimento local, non-production/staging e Production. Ele documenta **nomes, escopos e regras**; valores reais permanecem fora do Git.

## 1. Princípio central

Os ambientes do Caleida não compartilham credenciais por conveniência.

```text
local
  ↓ somente recursos descartáveis ou non-production
non-production / staging
  ↓ isolado de Production
Production
  ↓ projeto/segredos próprios, quando provisionados
```

Regras obrigatórias:

- nunca usar credencial Production em desenvolvimento local, CI, Preview ou staging;
- nunca usar credencial non-production como substituto de uma futura credencial Production;
- nenhum secret, token, senha ou connection string é versionado;
- variáveis server-only nunca recebem prefixo `NEXT_PUBLIC_`;
- qualquer nova variável deve ser classificada neste contrato ou em documentação de domínio aplicável antes de depender dela operacionalmente.

## 2. Estado real em US-PLAT-009

### Neon

Existe somente o projeto non-production:

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
PostgreSQL: 18
Baseline: main
Branch ID: br-restless-cherry-awpcwy6r
```

O projeto Neon Production **não está provisionado**. Portanto não existe connection string Production para registrar, configurar ou simular.

Neon Auth, Data API e Object Storage também não estão implementados nesta fase.

### Vercel

A conta conectada ainda não possui projeto Caleida. Nenhuma variável remota do Caleida existe na Vercel e nenhum Project Linking deve ser criado apenas para concluir esta Story.

Quando o projeto Vercel existir por ação humana deliberada, os escopos da plataforma devem ser mapeados assim:

| Caleida | Vercel | Dados permitidos |
|---|---|---|
| desenvolvimento local | Development/local `.env.local` | somente recursos locais, descartáveis ou non-production |
| non-production/staging | Preview | somente Neon non-production/branches isoladas e demais credenciais non-production |
| Production | Production | somente recursos Production dedicados |

O termo canônico `non-production/staging` não exige Vercel Custom Environment. Enquanto não houver decisão posterior, um Preview manual futuro representa o ambiente publicado não produtivo.

## 3. Contrato de arquivos locais

`.env.example` é o único arquivo `.env*` versionado e contém apenas declarações comentadas/documentação.

`.gitignore` mantém:

```text
.env*
!.env.example
```

Uso local futuro:

```text
.env.local              ← valores locais/non-production, nunca Production
.env.*.local            ← também permanece fora do Git quando criado por tooling/framework
```

A aplicação atualmente inicia sem variável externa. Não crie um `.env.local` apenas para preencher placeholders desnecessários.

## 4. Classificação das variáveis atuais

| Variável | Classe | Escopo atual | Regra |
|---|---|---|---|
| `DATABASE_URL` | secret server-only | runtime futuro | conexão pooled; não é consumida pela aplicação atualmente |
| `DATABASE_URL_UNPOOLED` | secret server-only | tooling de banco | conexão direta para migrations/testes; nunca browser |
| `CALEIDA_DB_TARGET` | controle não secreto | tooling de banco | aceita somente os alvos implementados pelo runner |
| `CALEIDA_NEON_BRANCH_ID` | identificador não secreto | tooling Neon | vincula o comando ao branch esperado; não concede acesso sozinho |
| `CALEIDA_ALLOW_BASELINE_MIGRATIONS` | confirmação não secreta | promoção non-production | só existe para a ação deliberada de baseline documentada |
| `NEXT_PUBLIC_*` | público | nenhum atualmente | só pode ser criado para dado intencionalmente público |

Connection strings contêm credenciais e devem ser tratadas como secrets mesmo quando o hostname, project ID ou branch ID isoladamente não forem secretos.

## 5. Desenvolvimento local

### Aplicação

No estado atual:

```text
nenhuma variável obrigatória
```

Quando a aplicação passar a depender de Neon ou outro serviço, o desenvolvimento local deve apontar exclusivamente para:

- `caleida-nonprod` quando for apropriado usar a baseline de integração; ou
- branch/recurso descartável quando a mudança exigir isolamento.

Production é proibida para desenvolvimento local.

### Banco efêmero

O gate PostgreSQL portável continua usando:

```text
DATABASE_URL_UNPOOLED=<direct-ephemeral-postgres-connection>
CALEIDA_DB_TARGET=ephemeral
```

Esse ambiente é descartável e não usa credencial Neon.

## 6. Non-production / staging

### Runtime futuro

Quando o runtime realmente passar a consumir banco:

```text
DATABASE_URL=<pooled-nonprod-connection>
```

A connection string deve ser obtida do ambiente/branch non-production correspondente e armazenada somente no secret store ou arquivo local ignorado apropriado.

### Gate Neon-specific isolado

Quando uma mudança depender de comportamento específico do Neon:

```text
DATABASE_URL_UNPOOLED=<direct-disposable-neon-branch-connection>
CALEIDA_DB_TARGET=neon-isolated
CALEIDA_NEON_BRANCH_ID=<disposable-neon-branch-id>
```

A baseline `main` não pode ser usada como branch `neon-isolated`.

### Promoção deliberada da baseline non-production

Somente migrations já versionadas e verificadas podem usar:

```text
DATABASE_URL_UNPOOLED=<direct-nonprod-baseline-connection>
CALEIDA_DB_TARGET=baseline
CALEIDA_NEON_BRANCH_ID=br-restless-cherry-awpcwy6r
CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES
```

Esse fluxo é non-production. Não deve ser reinterpretado como mecanismo de promoção Production.

## 7. Production

Production exige projeto Neon separado conforme `ADR-005`, mas ele ainda não existe.

Até uma Story explícita provisionar e proteger esse ambiente:

- não existe `DATABASE_URL` Production canônica;
- não existe `DATABASE_URL_UNPOOLED` Production canônica;
- não existe alvo `CALEIDA_DB_TARGET` Production no runner;
- não se reutiliza `baseline` para chegar a Production;
- nenhum valor fictício deve ser criado para aparentar que Production está configurada.

Uma futura Story que habilitar migrations Production deve introduzir guardrail explícito e verificável antes de qualquer operação real.

## 8. Exposição ao browser

No Next.js, nomes `NEXT_PUBLIC_*` são destinados a valores públicos incorporados ao código do cliente. Portanto são proibidos para:

- `DATABASE_URL`;
- `DATABASE_URL_UNPOOLED`;
- senhas/tokens Neon;
- secrets de Neon Auth/Data API;
- OAuth client secrets;
- cookie/session secrets;
- Vercel tokens;
- credenciais futuras de Storage/e-mail/APIs privadas.

O Caleida não necessita nenhuma variável `NEXT_PUBLIC_*` nesta fase.

## 9. Vercel — configuração futura de secrets

Quando o usuário criar o projeto Vercel e uma release realmente exigir variáveis:

- Development deve receber somente configuração adequada a desenvolvimento/non-production;
- Preview deve receber somente configuração non-production;
- Production deve receber somente configuração Production dedicada;
- secrets devem usar os controles de proteção/sensibilidade disponíveis na plataforma quando aplicável;
- nunca copiar o conjunto Production inteiro para Preview apenas para fazer uma release funcionar.

Configurar variável Vercel não autoriza deployment. Release continua regida por `ADR-007` e `docs/VERCEL_RELEASE.md`.

Variáveis de sistema fornecidas automaticamente pela Vercel, como `VERCEL_ENV`, não fazem parte do contrato configurável do Caleida e não devem ser recriadas manualmente sem necessidade específica.

## 10. CI

O CI permanente usa somente um PostgreSQL 18 efêmero e valores locais do próprio workflow para esse container.

Ele não deve depender de:

- connection string Neon;
- Neon API key;
- Vercel token;
- Auth secret;
- secret externo do repositório apenas para executar os gates padrão.

Uma Story futura só pode adicionar secret ao CI quando houver requisito técnico explícito e revisão de segurança correspondente. CI continua sem CD.

## 11. Fontes externas revalidadas em US-PLAT-009

Em 01/09/2026 foram revalidados:

- Vercel Environment Variables / ambientes Development, Preview e Production;
- Vercel Sensitive Environment Variables;
- Neon branch-scoped environment variables, incluindo `DATABASE_URL` pooled e `DATABASE_URL_UNPOOLED` direta.

A documentação corrente deve ser revalidada novamente na Story que efetivamente configurar um projeto Vercel, Neon Production, Auth/Data API ou outra integração com secrets.
