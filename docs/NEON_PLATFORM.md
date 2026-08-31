# Neon Platform — Caleida

**Status:** arquitetura canônica de plataforma após OPS-002  
**Decisão relacionada:** `DEC-007`  
**Project Design:** `PROJECT_DESIGN.md` + `PROJECT_DESIGN_PLATFORM_AMENDMENT.md`

## 1. Escopo

Este documento define como o Caleida utilizará Neon para banco, identidade, API de dados, RLS e ambientes. Não cria recursos remotos nem substitui migrations futuras.

## 2. Topologia planejada

```text
GitHub
  ↓
Next.js
  ├── browser / user session
  │     ↓
  │  Neon Auth
  │     ↓ JWT
  │  Neon Data API
  │     ↓
  │  PostgreSQL RLS
  │     ↓
  │  Neon Postgres
  │
  └── server trusted operations
        ↓
      direct Postgres connection
      (server-only, least privilege)

Storage de objetos: provider separado, ainda não escolhido
```

## 3. Projetos e branches

### Non-production

Projeto Neon dedicado a desenvolvimento integrado, staging e verificação.

Estrutura prevista:

```text
caleida-nonprod
  ├── staging
  ├── verify/<task-id>
  ├── dev/<task-id>
  └── outras branches temporárias quando justificadas
```

Branches temporárias devem ser curtas, resetáveis e removidas ao fim da tarefa.

### Production

Projeto Neon separado:

```text
caleida-production
  └── production
```

Production não serve como parent operacional de branches de teste e não recebe resets destrutivos.

A separação por projeto é intencional para reduzir blast radius e impedir mistura acidental de secrets, usuários e dados reais com homologação.

## 4. Migrations

Schema é propriedade do Git.

Layout canônico planejado:

```text
database/
  migrations/
  tests/
```

Cada alteração persistente deve poder ser reconstruída a partir da sequência de migrations.

Fluxo esperado para mudança de banco:

```text
migration no Git
  ↓
branch Neon descartável
  ↓
aplicar desde baseline conhecida
  ↓
testes de integridade/RLS
  ↓
rebuild/reset quando necessário
  ↓
review
  ↓
aplicar em staging
  ↓
aplicar em production somente após gates
```

O tooling exato será implementado em Story própria. Não introduzir ORM apenas para administrar migrations.

## 5. Neon Auth

Neon Auth é a solução inicial de identidade.

Características relevantes para o Caleida:

- baseado em Better Auth;
- dados de identidade e sessão no schema `neon_auth`;
- Auth acompanha branches do banco;
- cada branch possui endpoint de Auth isolado;
- integração com Data API por JWT;
- SDK e configuração devem ser lidos da documentação oficial corrente durante implementação.

Nenhuma tabela de produto deve duplicar identidade apenas para contornar Auth. Perfis de produto poderão referenciar a identidade canônica quando o schema for especificado.

## 6. Neon Data API

A Data API é o caminho preferencial para operações normais sob contexto do usuário quando acesso direto ao banco a partir da aplicação não for necessário.

Guardrails:

- RLS obrigatória em tabelas privadas expostas;
- JWT deve representar a sessão real do usuário;
- `authenticated` é apenas papel de autenticação, não ownership;
- políticas devem comparar identidade com ownership/visibilidade real;
- o helper de identidade deve seguir a API oficial vigente; em OPS-002, a documentação atual usa `auth.user_id()`;
- `anonymous` recebe somente acesso explicitamente público;
- grants e RLS são controles separados e ambos devem ser considerados.

## 7. Conexão direta ao Postgres

Permitida apenas em contextos server-side confiáveis, como:

- migrations;
- manutenção;
- jobs administrativos explícitos;
- operações que não devam passar pela Data API e tenham autorização própria comprovada.

Regras:

- connection string é secret;
- nunca usar credencial privilegiada no browser;
- não usar owner/BYPASSRLS para CRUD comum;
- testes de autorização devem usar papéis e JWT equivalentes aos usuários reais.

## 8. RLS

RLS faz parte do contrato do produto.

Testes mínimos futuros para tabelas user-scoped:

- owner consegue operação permitida;
- non-owner com ID válido falha;
- payload com ownership forjado falha;
- tentativa de transferência de ownership falha;
- anônimo falha em dados privados;
- políticas públicas concedem somente o que o Project Design permite;
- papel administrativo não é inferido por dados editáveis pelo usuário.

## 9. Storage

Object Storage não faz parte da plataforma canônica nesta fase.

Neon Object Storage está em beta em 31/08/2026. A decisão futura deve verificar novamente maturidade, regiões, pricing, lifecycle, backup, privacidade, integração com Auth/RLS e compatibilidade S3.

Até essa decisão, o domínio de arquivos deve permanecer desacoplado do banco e do provedor.

## 10. Backups e recuperação

Branching e time travel não substituem a estratégia de backup do produto.

Antes do beta, uma Story própria deve definir:

- retenção exigida;
- dump lógico e/ou mecanismo gerenciado;
- recuperação de banco;
- recuperação do futuro Storage;
- teste periódico de restore;
- RPO/RTO compatíveis com a fase.

## 11. Secrets e ambientes

Nunca versionar:

- `DATABASE_URL`;
- Neon API keys;
- Auth URLs/secrets quando tratados como sensíveis;
- cookie secrets;
- OAuth client secrets;
- credenciais de Storage futuro.

Arquivos `.env.example` futuros documentarão apenas nomes e finalidade das variáveis.

## 12. Estado de OPS-002

OPS-002 é somente decisão e reconciliação documental.

Nesta tarefa:

- nenhum projeto Neon do Caleida foi criado;
- nenhum Auth/Data API foi provisionado;
- nenhuma migration foi criada;
- nenhum schema foi aplicado;
- nenhum secret foi gerado;
- nenhum deployment ocorreu.

A criação real da infraestrutura começa apenas quando o `CHECKPOINT` promover uma tarefa técnica correspondente.
