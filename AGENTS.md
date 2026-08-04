# AGENTS.md — Caleida

Este arquivo define instruções permanentes para qualquer agente de código que trabalhe neste repositório.

## 1. Fonte de verdade

Antes de alterar qualquer arquivo, leia nesta ordem:

1. `docs/PROJECT_DESIGN.md`
2. `docs/ARCHITECTURE.md`
3. `docs/PRODUCT_BACKLOG.md`
4. `docs/STATUS.md`
5. `docs/DECISIONS.md`
6. a GitHub Issue ou User Story indicada na tarefa

O histórico de um chat não substitui os documentos do repositório.

## 2. Regra de escopo

- Implemente apenas a User Story solicitada.
- Não antecipe funcionalidades de incrementos futuros.
- Não refatore áreas não relacionadas sem necessidade demonstrável.
- Não altere decisões estruturais silenciosamente.
- Quando houver conflito entre a tarefa e o Project Design, interrompa a implementação da parte conflitante e registre a divergência.
- Dados fictícios podem existir em testes e seeds, mas não podem sustentar uma funcionalidade declarada concluída.

## 3. Arquitetura obrigatória

A stack de referência é:

- Next.js;
- React;
- TypeScript em modo estrito;
- Tailwind CSS;
- Supabase Postgres;
- Supabase Auth;
- Supabase Storage;
- Row Level Security;
- Vercel;
- GitHub Actions.

Mudanças nessa stack exigem registro em `docs/DECISIONS.md` antes da implementação.

## 4. Banco de dados

- Toda mudança de esquema deve ser criada como migration versionada em `supabase/migrations/`.
- Não faça alterações estruturais somente pelo painel do Supabase.
- Toda tabela exposta deve possuir políticas de Row Level Security adequadas.
- Cada migration deve considerar constraints, índices, autorização, testes e recuperação.
- Nunca use o banco de produção para testes.
- Não armazene payloads externos integrais sem justificativa e política de expiração.

## 5. Segurança e secrets

Nunca grave em código, documentação, Issues, commits, logs ou respostas:

- senhas;
- tokens;
- chaves privadas;
- `SUPABASE_SECRET_KEY`;
- chaves legadas `service_role`;
- credenciais de APIs;
- dados pessoais reais usados como teste.

Variáveis públicas e secretas devem permanecer separadas. Nenhuma chave secreta pode utilizar prefixo `NEXT_PUBLIC_`.

## 6. Limites operacionais

O Supabase Free é temporário para desenvolvimento e beta controlado.

Ao implementar uma funcionalidade, avalie quando aplicável:

- impacto no tamanho do banco;
- novos índices;
- retenção de histórico;
- uso de Storage;
- tamanho e quantidade de uploads;
- egress;
- necessidade real de Realtime;
- envio de e-mail;
- inclusão em backup e restauração.

Prefira paginação, consultas enxutas, cache com expiração, compressão de imagens e remoção de arquivos órfãos.

## 7. Qualidade mínima

Uma tarefa não está concluída enquanto não houver, quando aplicável:

- validação de entrada;
- autorização no servidor e no banco;
- estados de carregamento, vazio e erro;
- responsividade;
- acessibilidade básica;
- testes unitários e/ou de integração;
- testes de RLS;
- lint;
- typecheck;
- build;
- documentação atualizada.

## 8. Fluxo de trabalho

- Uma User Story por branch e pull request, salvo agrupamento explicitamente aprovado.
- Não faça push direto na `main` quando a proteção estiver ativa.
- Commits devem ser pequenos e descritivos.
- A pull request deve explicar o que mudou, como testar, migrations, riscos e limitações.
- Corrija a mesma Story na mesma pull request sempre que possível.

## 9. Encerramento obrigatório

Ao concluir uma tarefa:

1. execute os comandos de validação disponíveis;
2. informe os arquivos alterados;
3. informe migrations criadas ou modificadas;
4. descreva como validar manualmente;
5. registre limitações e riscos;
6. atualize `docs/STATUS.md`;
7. atualize `docs/CHANGELOG.md`;
8. atualize `docs/DECISIONS.md` se houver decisão arquitetural;
9. não declare conclusão sem evidência verificável.

## 10. Estado inicial

O repositório ainda está em preparação documental. Não inicialize a aplicação, conecte serviços externos ou crie banco hospedado sem uma User Story aprovada para isso.
