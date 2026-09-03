# Arquitetura técnica

**Status:** arquitetura de referência vigente durante US-AUTH-004.

## 1. Visão geral

```text
GitHub
  ├── código / documentação / Issues / PRs / CI
  ↓
Next.js + React + TypeScript
  ├── server-only integrations
  │    ├── Neon Auth
  │    ├── Neon Postgres / futura Data API
  │    └── Resend REST — e-mail transacional da aplicação
  ↓
Vercel
  └── destino de hosting; release exclusivamente manual pelo usuário

Neon
  ├── Better Auth gerenciado
  │    └── SMTP customizado Resend quando gate non-production for configurado
  ├── Postgres
  ├── futura Data API
  └── PostgreSQL RLS

Object Storage
  └── provider separado e ainda não escolhido
```

Amendments ativos:

- `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md`;
- `docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md`.

Decisões relevantes: `ADR-004`, `ADR-005`, `ADR-007`, `ADR-008`, `ADR-009`.

## 2. Stack de referência

- Next.js 16 / React / TypeScript strict;
- Tailwind CSS + design system próprio;
- Neon Postgres;
- Neon Auth/Better Auth;
- Neon Data API quando CRUD user-scoped realmente exigir HTTP/JWT;
- PostgreSQL RLS;
- Resend como transporte transacional non-production conforme `ADR-009`;
- Vercel como destino de hosting com deployment humano/manual;
- GitHub Actions para CI, sem CD;
- Object Storage provider-independent, ainda a decidir.

Tecnologias externas devem ser revalidadas na documentação oficial quando a tarefa depender delas.

## 3. Ambientes

### Local

- aplicação Next.js local;
- secrets em `.env.local`/secret store, nunca Git;
- somente recursos descartáveis/non-production;
- nenhum envio externo no CI padrão.

### PostgreSQL descartável

- PostgreSQL 18;
- migrations desde banco limpo;
- sem credencial Neon;
- gate primário para SQL/constraints/RLS portáveis conforme `ADR-008`.

### Neon non-production

- projeto `caleida-nonprod`;
- baseline `main` como staging integrado;
- branches curtas apenas quando comportamento Neon-specific justificar;
- baseline não é laboratório destrutivo.

### Production

Projeto Neon separado ainda não provisionado. Secrets, Auth, banco e e-mail Production serão próprios.

### Vercel

Preview/Production são publicações opcionais e manuais. Merge nunca publica automaticamente.

## 4. Domínios previstos

- identidade e acesso;
- perfis e privacidade;
- catálogo e integrações externas;
- biblioteca/progresso;
- avaliações/resenhas;
- coleções/rankings;
- diário/atividades;
- metas/estatísticas;
- comunidade/moderação/administração;
- arquivos;
- exportação/recuperação.

Domínios permanecem separados, com boundaries explícitas.

## 5. Princípios de dados

- catálogo global separado de dados pessoais;
- migrations no Git como história canônica;
- RLS desde a primeira tabela privada/user-scoped exposta;
- auditoria compacta e sem secrets;
- dados externos mínimos e normalizados;
- falha de integração externa não corrompe estado canônico.

## 6. Autenticação e autorização

Neon Auth é a identidade canônica inicial.

Regras:

- autenticação não substitui autorização;
- papel Admin Better Auth não substitui papéis de produto Caleida;
- ownership/visibilidade deve ser imposta server-side/banco/RLS conforme a superfície;
- credencial privilegiada nunca é enviada ao browser;
- owner/BYPASSRLS não é caminho de CRUD comum;
- confirmação obrigatória de e-mail só será ativada quando o cadastro controlado de US-AUTH-005 estiver pronto para impor o gate de entrada.

## 7. Banco

Layout:

```text
database/migrations/
database/scripts/
database/tests/
```

- toda mudança persistente é migration versionada;
- migrations aplicadas não são reescritas;
- PostgreSQL portável é testado primeiro em PostgreSQL 18;
- comportamento Neon-specific exige branch isolada quando aplicável;
- Production nunca é ambiente de teste destrutivo.

Tooling: Node.js + `psql`, sem ORM introduzido só para migrations.

## 8. Integrações externas

Integrações com segredo ficam server-side. O browser nunca recebe API key privada.

A boundary deve:

- validar configuração;
- reduzir payload ao necessário;
- normalizar respostas;
- sanitizar falhas;
- distinguir falha recuperável quando a semântica permitir;
- não transformar indisponibilidade do provedor em mutação irreversível de negócio.

## 9. E-mail transacional

### Decisão

`ADR-009` seleciona Resend para non-production.

### Aplicação

`src/lib/email/server.ts` usa `fetch` nativo para `POST /emails`:

- server-only;
- `RESEND_API_KEY` apenas no servidor;
- idempotency key obrigatória;
- rede/429/5xx tratados como recuperáveis;
- resposta externa reduzida a `messageId`;
- sem SDK Resend obrigatório;
- sem acesso ao banco.

Para convites, a ordem futura é:

```text
convite criado
  ↓
envio confirmado pelo provedor
  ↓
transição criado → enviado
```

Falha de e-mail não consome convite e não marca envio como concluído.

### Neon Auth

O Auth pode usar SMTP customizado do mesmo Resend para confirmação/recuperação. A configuração real exige domínio e chave externos e permanece fora do Git/chat. Até o gate live ser executado, o provider Auth da baseline continua compartilhado do Neon.

### Privacidade

A região São Paulo do Resend controla roteamento, não residência de dados. Metadados/logs/API permanecem nos Estados Unidos segundo a documentação corrente; minimizar conteúdo e revalidar DPA/subprocessadores antes do beta real.

## 10. Imagens e arquivos

- capas externas permanecem por URL quando permitido;
- avatar/banner futuro exige Object Storage privado;
- provedor ainda não escolhido;
- metadados devem permanecer desacoplados do fornecedor.

## 11. CI e deployment

Fluxo normal:

```text
branch → implementação → lint/typecheck/test/build → PR → review → merge
```

GitHub Actions valida aplicação + PostgreSQL 18, sem secret Resend e sem envio externo.

`vercel.json` mantém Git deployment desabilitado. IA não executa Preview, Production, promote, rollback ou redeploy.

## 12. Decisões ainda pendentes

- ferramenta E2E quando necessária;
- biblioteca acessível adicional se necessária;
- Object Storage;
- backup de longo prazo;
- monitoramento/error tracking;
- estratégia final de domínio;
- política/infra de e-mail Production após revalidação do `ADR-009`.
