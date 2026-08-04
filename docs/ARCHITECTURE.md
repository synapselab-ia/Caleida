# Arquitetura técnica inicial

**Status:** Arquitetura de referência aprovada; aplicação ainda não inicializada.

## 1. Visão geral

```text
GitHub
  ├── código
  ├── documentação
  ├── backlog e Issues
  └── pull requests
        ↓
Codex
  ├── implementa uma User Story
  ├── executa validações
  └── prepara alterações para revisão
        ↓
Vercel
  ├── Preview para pull requests
  └── Production para a branch principal
        ↓
Supabase
  ├── Postgres
  ├── Auth
  ├── Storage
  └── Row Level Security
```

## 2. Stack de referência

- Next.js;
- React;
- TypeScript em modo estrito;
- Tailwind CSS;
- Supabase Postgres;
- Supabase Auth;
- Supabase Storage;
- Vercel;
- GitHub Actions.

As versões exatas serão registradas quando a aplicação for inicializada.

## 3. Ambientes

### Desenvolvimento local

- Aplicação executada localmente.
- Supabase CLI e serviços locais.
- Dados exclusivamente fictícios.
- Migrations aplicadas desde o zero.

### Staging

- Projeto Supabase hospedado dedicado.
- Utilizado por homologação e Preview Deployments.
- Pode conter apenas dados fictícios ou anonimizados.
- Mudanças estruturais são aplicadas de forma coordenada.

### Production

- Projeto Supabase hospedado dedicado.
- Utilizado pelo beta fechado e, futuramente, pelo produto público.
- Não recebe testes destrutivos.
- Possui secrets próprios.

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

- Catálogo global separado dos dados pessoais.
- Uma relação de biblioteca por usuário e obra.
- Identificadores externos únicos por provedor quando aplicável.
- RLS desde a primeira tabela exposta.
- Dados externos normalizados e preservados localmente apenas quando necessários.
- Cache com expiração e limpeza.
- Auditoria compacta e sem secrets.

## 6. Estratégia de integração externa

As APIs externas serão acessadas preferencialmente por rotas server-side.

O cliente não deve receber chaves privadas. Resultados devem ser normalizados antes de chegar à interface. A indisponibilidade de um provedor não pode remover obras já salvas.

## 7. Estratégia de imagens

- Capas externas permanecerão por URL quando os termos permitirem.
- Storage próprio será reservado para avatares, banners e imagens personalizadas.
- Uploads terão compressão, limite de dimensão, limite de tamanho e limpeza de órfãos.

## 8. Estratégia de banco

- Migrations em `supabase/migrations/`.
- Seeds em `supabase/seed.sql` com dados fictícios.
- Testes de RLS.
- Índices adicionados com base em consultas reais.
- Nenhuma alteração estrutural exclusiva do painel.

## 9. Decisões ainda pendentes

Serão decididas em Stories específicas:

- ferramenta de testes unitários;
- ferramenta de testes end-to-end;
- biblioteca de componentes acessíveis, se utilizada;
- provedor SMTP;
- serviço externo de backup;
- monitoramento e rastreamento de erros;
- estratégia final de domínio.
