# Verification Protocol — Caleida

**Status:** protocolo canônico de verificação

Uma tarefa não está concluída porque o código parece correto. A verificação deve ser proporcional ao escopo e registrada com precisão.

## 1. Gates gerais

Depois que a aplicação existir, manter comandos equivalentes a:

```text
lint
typecheck
test
build
```

Use os comandos reais definidos pelo repositório. Não invente scripts sem inspecionar o `package.json` e a documentação oficial das ferramentas instaladas.

## 2. Tarefas somente documentais

Para mudanças exclusivamente documentais, verificar no mínimo:

- coerência com `docs/PROJECT_DESIGN.md` e `00_SYSTEM/SOURCE_OF_TRUTH.md`;
- ausência de contradições entre `CHECKPOINT`, `EXECUTION_PLAN`, backlog e decisões;
- diff limitado ao escopo;
- ausência de secrets ou credenciais;
- links/caminhos internos coerentes;
- `NEXT_ACTION` concreta e executável.

Gates de aplicação ainda inexistentes devem ser marcados `SKIPPED — aplicação não inicializada`, não simulados.

## 3. Banco de dados

Quando houver banco ativo, a verificação deve ser reproduzível a partir do Git.

Para tarefas de schema/autorização, use ambiente isolado e descartável compatível com a plataforma canônica vigente. A sequência deve ser equivalente a:

```text
criar ou resetar ambiente isolado
aplicar migrations desde baseline conhecida
executar testes de banco
inspecionar schema, constraints e autorização
reconstruir do zero quando a mudança exigir prova de reprodutibilidade
limpar o ambiente descartável
```

Nunca use produção como laboratório destrutivo.

Verifique, quando aplicável:

- migrations aplicam na ordem correta;
- constraints e FKs impedem estados inválidos;
- índices necessários existem sem duplicação prematura;
- RLS/autorização está habilitada nas tabelas expostas;
- owner autorizado consegue a operação prevista;
- usuário autenticado não proprietário é negado;
- anônimo é negado onde o dado é privado;
- ownership não pode ser forjado ou transferido por payload do cliente;
- dados existentes continuam legíveis e íntegros após evolução de schema.

Credencial owner/BYPASSRLS pode administrar schema quando necessário, mas não serve como evidência de autorização normal de usuário.

## 4. Segurança

Tarefas que tocam autenticação, sessão, autorização, RLS, uploads, rotas server-side ou integrações sensíveis devem incluir casos adversariais adequados.

Considere pelo menos:

- visitante/anônimo;
- usuário autenticado autorizado;
- usuário autenticado não autorizado conhecendo um ID válido;
- manipulação de IDs/ownership no payload;
- acesso direto a endpoint/objeto sem passar pela UI;
- secret ausente, inválido ou indevidamente exposto;
- ação administrativa executada por papel comum.

A verificação deve testar a camada que realmente impõe a regra, não apenas visibilidade de botão.

## 5. Interface e acessibilidade

Para slices visuais, verificar em browser real quando a infraestrutura de teste estiver disponível:

- carregamento;
- estados vazio, erro e loading;
- ação principal;
- refresh/navegação;
- viewport móvel e desktop representativos;
- navegação por teclado e foco básico;
- sem erros críticos de console;
- conteúdo privado não aparece durante loading ou erro de autorização.

Automatize E2E somente quando houver framework estabelecido e benefício real.

## 6. Integrações externas

Quando uma tarefa tocar APIs ou serviços externos:

- confirmar documentação oficial atual;
- usar somente campos/permissões necessários;
- validar tratamento de indisponibilidade e rate limits quando relevantes;
- respeitar regras atuais de persistência/cache/atribuição;
- garantir que indisponibilidade do provedor não apague dados canônicos já persistidos;
- não expor secrets ao browser.

## 7. Deployment

Build local/CI é um gate técnico. Deploy não é um comando de teste.

Siga `00_SYSTEM/DEPLOYMENT_POLICY.md`. Não publique Preview ou Production apenas para descobrir se a aplicação compila.

## 8. Diff e Git

Antes de concluir:

- revisar todos os arquivos alterados;
- confirmar ausência de mudanças não relacionadas;
- verificar arquivos temporários/gerados indevidos;
- verificar vazamento de secrets;
- confirmar documentação necessária atualizada;
- confirmar que a branch parte da baseline esperada.

Quando comandos Git locais não estiverem disponíveis, use inspeção equivalente pelas ferramentas do GitHub.

## 9. Registro do resultado

`docs/CHECKPOINT.md` deve registrar os gates relevantes como:

- `PASS` — executado e aprovado;
- `FAIL` — executado e falhou;
- `SKIPPED` — não aplicável ou impossível no estado atual, com motivo;
- `BLOCKED` — necessário, mas impedido por condição que deve ser resolvida antes da conclusão.

Nunca converta ausência de execução em `PASS`.