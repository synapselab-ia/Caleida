# Arquitetura técnica

**Status:** arquitetura de referência vigente após US-AUTH-007.

## 1. Visão geral

```text
GitHub
  ├── código
  ├── documentação
  ├── backlog, Issues e Checkpoint
  └── pull requests / CI
        ↓
Next.js + React + TypeScript
        ↓
Vercel
  └── destino de hosting; release exclusivamente manual pelo usuário
        ↓
Neon
  ├── Neon Auth / Managed Better Auth
  │    ├── email/password + confirmação OTP
  │    ├── login/logout
  │    └── recovery + gestão/revogação de sessões
  ├── Neon Data API
  ├── Postgres
  └── PostgreSQL Row Level Security

Object Storage
  └── provider separado e ainda não escolhido
```

Os amendments ativos são:

- `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md` — plataforma de dados/identidade;
- `docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md` — hosting, CI e release.

## 2. Stack de referência

- Next.js;
- React;
- TypeScript em modo estrito;
- Tailwind CSS;
- Neon Postgres;
- Neon Auth;
- Neon Data API quando o acesso sob contexto de usuário exigir API HTTP;
- PostgreSQL RLS;
- Vercel como destino de hosting com deployment humano/manual;
- GitHub Actions para CI/validação, sem CD;
- Object Storage provider-independent, a decidir em Story própria.

Versões implementadas ficam registradas no repositório e tecnologias externas devem ser conferidas na documentação oficial corrente quando a tarefa depender delas.

## 3. Ambientes

### Desenvolvimento local da aplicação

- Next.js executado localmente;
- variáveis de ambiente locais fora do Git;
- dados exclusivamente fictícios ou anonimizados;
- integração real de banco/Auth contra ambiente Neon não produtivo quando necessária.

### PostgreSQL descartável de verificação

Para migrations, constraints e RLS portáveis:

- PostgreSQL da mesma versão major do projeto Neon atual;
- banco efêmero criado limpo para cada verificação;
- sem credencial Neon;
- migrations aplicadas desde a baseline conhecida;
- testes de banco executados antes do merge.

A referência atual é PostgreSQL 18 conforme `ADR-008`.

### Neon Non-Production

Projeto Neon dedicado a staging e integração com o serviço gerenciado.

- branch canônica de staging/homologação;
- branches temporárias para verificação Neon-specific quando necessárias;
- branches descartáveis só são removidas com autorização quando a ferramenta classifica a ação como destrutiva;
- nenhuma branch temporária é fonte canônica de schema;
- baseline `main` não é laboratório destrutivo;
- provider compartilhado de e-mail do Neon Auth é suficiente para desenvolvimento/non-production enquanto adequado.

### Neon Production

Projeto Neon separado do non-production. Production ainda não foi provisionada e nunca serve como laboratório.

### Vercel

Preview e Production são releases manuais:

- push/PR/merge não publicam automaticamente;
- Preview não é gate obrigatório por Story;
- somente o usuário inicia publicação;
- IA pode preparar release candidate/runbook e verificar estado já publicado.

## 4. Domínios previstos

- identidade e acesso;
- perfis e privacidade;
- catálogo;
- integrações externas;
- biblioteca e progresso;
- avaliações e resenhas;
- coleções e rankings;
- diário e atividades;
- metas e estatísticas;
- comunidade;
- moderação;
- administração;
- arquivos;
- exportação e recuperação.

Os domínios devem permanecer separados, mas podem compartilhar componentes e serviços claramente definidos.

## 5. Princípios de dados

- catálogo global separado dos dados pessoais;
- uma relação de biblioteca por usuário e obra;
- identificadores externos únicos por provedor quando aplicável;
- RLS desde a primeira tabela privada/user-scoped exposta relevante;
- dados externos normalizados e preservados localmente apenas quando necessários;
- cache com expiração e limpeza;
- auditoria compacta e sem secrets;
- migrations no Git como história canônica do schema.

## 6. Autenticação e acesso a dados

Neon Auth / Managed Better Auth é a identidade canônica inicial.

Estado implementado até US-AUTH-007:

- email/password habilitado;
- confirmação obrigatória de e-mail por OTP;
- cadastro fail-closed por convite/aprovação;
- login/logout e boundary privado server-side;
- recuperação e alteração de senha;
- consulta e revogação das próprias sessões;
- session/recovery tokens permanecem server-only;
- `sessionDataTtl = 1 segundo` para limitar a janela stale antes de revalidação upstream.

Contrato detalhado: `docs/SESSION_SECURITY.md`.

Para CRUD normal sob contexto de usuário, a arquitetura prefere Neon Data API com JWT e RLS quando esse caminho for adequado. A Data API ainda não foi provisionada.

Regras:

- autenticação não substitui autorização;
- `authenticated` não concede acesso genérico a linhas;
- ownership/visibilidade deve ser imposta por RLS;
- helper/API de identidade deve seguir documentação oficial corrente;
- credencial privilegiada nunca é enviada ao browser;
- owner/BYPASSRLS não é utilizado como caminho normal de CRUD.

Operações server-side confiáveis podem usar conexão direta ao Postgres com least privilege e autorização própria comprovada.

## 7. Estratégia de banco

Layout canônico:

```text
database/migrations/
database/scripts/
database/tests/
```

- toda mudança estrutural é migration versionada;
- nenhuma alteração importante existe somente no Console;
- migrations aplicadas não são reescritas;
- correções usam novas migrations;
- testes de constraints e RLS devem ser executáveis;
- SQL PostgreSQL portável é verificado primeiro em PostgreSQL 18 descartável;
- comportamento específico do Neon exige verificação adicional em branch Neon isolada quando aplicável;
- Production nunca é ambiente de teste destrutivo.

O tooling usa Node.js + `psql`, sem ORM introduzido apenas para migrations.

## 8. Estratégia de integração externa

APIs externas serão acessadas preferencialmente por rotas server-side quando houver segredo ou necessidade de controle. O cliente não recebe chaves privadas.

## 9. Estratégia de imagens e arquivos

- capas externas permanecem por URL quando os termos permitirem;
- conteúdo próprio como avatar/banner exige Object Storage privado e controlado;
- o provedor de Storage ainda não foi escolhido;
- metadados de arquivo devem permanecer desacoplados do provedor.

## 10. CI e deployment

Fluxo normal:

```text
branch → implementação → lint/typecheck/test/build → PR → review → merge
```

GitHub Actions valida, mas não publica. `vercel.json` mantém Git deployments automáticos desabilitados. IA não executa Preview, Production, promote, rollback ou redeploy.

## 11. Próximo fechamento arquitetural

`US-AUTH-008` deve consolidar auditoria e validar live a arquitetura de acesso construída no Incremento 2. Mudança material de arquitetura detectada nessa Story exige ADR próprio; validação de comportamento existente não exige ADR novo.
