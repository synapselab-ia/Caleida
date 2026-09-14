# Arquitetura técnica

**Status:** arquitetura de referência vigente após o fechamento do Incremento 2 e o refino de EPIC-03 em OPS-007.

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
  ├── Managed Better Auth
  │    ├── email/password + confirmação OTP
  │    ├── login/logout
  │    └── recovery + gestão/revogação de sessões
  ├── Data API
  │    └── ainda não provisionada; planejada para o primeiro domínio user-scoped de EPIC-03
  ├── Postgres
  └── PostgreSQL Row Level Security

Object Storage
  └── provider separado e ainda não escolhido
```

Amendments ativos:

- `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md`: plataforma de dados/identidade;
- `docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md`: hosting, CI e release.

## 2. Stack de referência

- Next.js;
- React;
- TypeScript em modo estrito;
- Tailwind CSS;
- Neon Postgres;
- Managed Better Auth;
- Neon Data API quando o acesso sob contexto de usuário exigir API HTTP;
- PostgreSQL RLS;
- Vercel como destino de hosting com deployment humano/manual;
- GitHub Actions para CI/validação, sem CD;
- Object Storage provider-independent, a decidir em Story própria.

Versões implementadas ficam registradas no repositório. APIs e tecnologias externas devem ser conferidas na documentação oficial corrente quando a Story depender delas.

## 3. Ambientes

### Desenvolvimento local da aplicação

- Next.js executado localmente;
- variáveis de ambiente locais fora do Git;
- dados exclusivamente fictícios ou anonimizados;
- integração real de banco/Auth contra ambiente Neon non-production quando necessária.

### PostgreSQL descartável de verificação

Para migrations, constraints e RLS portáveis:

- PostgreSQL da mesma versão major do projeto Neon atual;
- banco efêmero criado limpo para cada verificação;
- sem credencial Neon;
- migrations aplicadas desde a baseline conhecida;
- testes de banco executados antes do merge.

A referência atual é PostgreSQL 18 conforme ADR-008.

### Neon Non-Production

Projeto Neon dedicado a staging e integração com o serviço gerenciado.

- baseline canônica `main` do projeto `caleida-nonprod`;
- branches temporárias para verificação Neon-specific quando necessárias;
- branches descartáveis só são removidas com autorização explícita quando a operação é destrutiva;
- nenhuma branch temporária é fonte canônica de schema;
- baseline `main` não é laboratório destrutivo;
- provider compartilhado de e-mail do Managed Better Auth é suficiente para desenvolvimento/non-production enquanto adequado.

### Neon Production

Projeto Neon separado do non-production. Production ainda não foi provisionada e nunca serve como laboratório.

### Vercel

Preview e Production são releases manuais:

- push/PR/merge não devem publicar automaticamente;
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

Os domínios permanecem separados e compartilham somente contratos explícitos.

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

Managed Better Auth é a identidade canônica inicial.

Estado consolidado após o Incremento 2:

- email/password habilitado;
- confirmação obrigatória de e-mail por OTP;
- cadastro fail-closed por convite/aprovação;
- login/logout e boundary privado server-side;
- papéis/autorização de produto separados da identidade gerenciada;
- recuperação e alteração de senha;
- consulta e revogação das próprias sessões;
- auditoria Auth sanitizada;
- session/recovery tokens permanecem server-only;
- `sessionDataTtl = 1 segundo` para limitar janela stale antes de revalidação upstream.

Contrato detalhado: `docs/SESSION_SECURITY.md`.

Para CRUD normal sob contexto de usuário, a arquitetura prefere Neon Data API com JWT e RLS quando esse caminho for adequado. A Data API ainda não foi provisionada. OPS-007 definiu US-PRIV-001 como a primeira Story autorizada a materializar esse caminho, primeiro em branch Neon isolada.

Regras:

- autenticação não substitui autorização;
- papel `authenticated` não concede acesso genérico a linhas;
- ownership/visibilidade deve ser imposta por RLS;
- helper/API de identidade deve seguir documentação oficial corrente;
- credencial privilegiada nunca é enviada ao browser;
- owner/BYPASSRLS não é utilizado como caminho normal de CRUD;
- grants da Data API devem ser mínimos e limitados aos schemas/tabelas realmente expostos.

Operações server-side confiáveis podem usar conexão direta ao Postgres com least privilege e autorização própria comprovada quando a operação não é CRUD normal do usuário.

## 7. Estratégia de perfis e privacidade

Plano canônico: `docs/INCREMENT_3_PLAN.md`.

Princípios definidos em OPS-007:

- perfil de produto é separado do registro de identidade `neon_auth`;
- perfil nasce com visibilidade `only_me`;
- estados de visibilidade que dependem de relações sociais resolvem fail-closed enquanto essas relações não existirem;
- perfil público só pode expor colunas deliberadamente públicas;
- bloqueio deve prevalecer sobre visibilidade pública entre identidades autenticadas;
- privacidade de conteúdos futuros nasce junto de cada domínio, sem tabelas vazias para features inexistentes;
- avatar/banner não escolhem Storage por antecipação;
- exclusão de conta usa período de cancelamento, export de encerramento, reautenticação e matriz explícita de dados.

## 8. Estratégia de banco

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

## 9. Estratégia de integração externa

APIs externas são acessadas preferencialmente por rotas server-side quando houver segredo ou necessidade de controle. O cliente não recebe chaves privadas.

## 10. Estratégia de imagens e arquivos

- capas externas permanecem por URL quando os termos permitirem;
- conteúdo próprio como avatar/banner exige Object Storage privado e controlado;
- o provedor de Storage ainda não foi escolhido;
- metadados de arquivo devem permanecer desacoplados do provedor;
- EPIC-03 não cria upload falso nem escolhe Storage apenas para preencher perfil.

## 11. CI e deployment

Fluxo normal:

```text
branch -> implementação -> lint/typecheck/test/build -> PR -> review -> merge
```

GitHub Actions valida, mas não publica. `vercel.json` mantém Git deployments automáticos desabilitados. IA não executa Preview, Production, promote, rollback ou redeploy.

## 12. Próximo fechamento arquitetural

`US-PRIV-001` deve provar o primeiro CRUD user-scoped com Data API + JWT + grants mínimos + RLS em ambiente Neon isolado antes de promoção non-production.

Mudança material do padrão de acesso, provedor de identidade, Storage ou automação destrutiva de ciclo de conta exige ADR próprio. Implementar o plano vigente sem mudar essas decisões não exige ADR novo.
