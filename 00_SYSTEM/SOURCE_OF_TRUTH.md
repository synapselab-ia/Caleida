# Source of Truth — Caleida

**Status:** protocolo canônico  
**Escopo:** precedência entre especificação, decisões, execução, código e contexto conversacional

## 1. Hierarquia canônica

Quando dois artefatos divergirem, use a seguinte ordem de precedência:

1. `docs/PROJECT_DESIGN.md` — comportamento de produto, princípios de domínio, escopo e decisões de produto aprovadas.
2. Instrução explícita do usuário na tarefa atual — pode alterar deliberadamente produto, prioridade ou arquitetura; mudanças materiais devem ser registradas no repositório na mesma unidade de trabalho ou antes da implementação dependente.
3. Decisões arquiteturais aceitas em `docs/DECISIONS.md` e, futuramente, ADRs que as substituam formalmente.
4. `docs/EXECUTION_PLAN.md` e a especificação da tarefa ativa — ordem de execução, dependências, critérios de aceite e fora do escopo.
5. Especificações de domínio/arquitetura aplicáveis, incluindo `docs/ARCHITECTURE.md` e documentos futuros de banco, segurança, integrações e UX.
6. Migrations e testes automatizados — contratos executáveis do estado implementado.
7. Código da aplicação.
8. `docs/CHECKPOINT.md` — cursor operacional de continuação; registra onde o projeto está, mas não redefine produto ou arquitetura.
9. Memória de chats, suposições da IA e conhecimento não registrado no repositório.

## 2. Regra de conflito

Não altere documentação canônica apenas para legitimar um comportamento acidental do código.

Quando houver divergência, classifique-a como:

- **defeito de implementação:** corrigir código, migration ou teste;
- **mudança deliberada:** registrar a nova decisão e atualizar os artefatos afetados de forma coerente;
- **documentação operacional desatualizada:** reconciliar `CHECKPOINT`, plano de execução e estado real do GitHub antes de continuar;
- **decisão ainda aberta:** marcar explicitamente como bloqueio ou decisão necessária; não inventar semântica de produto.

## 3. Estado operacional

`docs/CHECKPOINT.md` é o cursor oficial para continuidade entre sessões. Ele deve responder, no mínimo:

- estado do projeto;
- fase atual;
- última base integrada conhecida;
- tarefa ativa, se houver;
- `NEXT_ACTION`;
- bloqueios;
- frentes `ON_HOLD`;
- ações manuais necessárias;
- última verificação relevante.

`docs/STATUS.md` é um snapshot histórico da preparação inicial e não deve ser usado como cursor operacional após a adoção deste protocolo.

## 4. GitHub como verdade operacional

O estado real de branch, commits, Issues, pull requests, workflows, arquivos e código prevalece sobre descrições antigas de conversas.

Antes de editar, confronte o `CHECKPOINT` com o GitHub. Se divergirem, preserve o estado real e reconcilie a documentação antes de avançar para trabalho dependente.

## 5. Banco e dados

Depois que a implementação de banco começar:

- migrations versionadas serão a única história canônica de schema;
- mudanças exclusivas de dashboard/console não serão solução permanente;
- migrations já aplicadas não devem ser reescritas para alterar história; correções usam novas migrations;
- autorização no banco faz parte do contrato do produto, não é detalhe de interface;
- dados reais de usuário não podem ser substituídos ou apagados silenciosamente por sincronizações, cache, conteúdo derivado ou IA.

## 6. Segurança

Quando interface, aplicação e autorização persistente divergirem, preserve o comportamento mais restritivo até a divergência ser resolvida explicitamente.

Nunca reduza controles de segurança apenas para fazer uma tarefa, teste ou demonstração passar.

## 7. Plataformas externas

Para tecnologias de evolução rápida, a documentação oficial atual é a fonte de verdade para APIs, SDKs, configuração, limites e comportamento operacional.

Ela não altera automaticamente a semântica do Caleida. Se uma plataforma exigir adaptação de produto ou arquitetura, a adaptação deve ser deliberadamente registrada.

## 8. Regra de continuidade

Uma nova sessão deve conseguir retomar o Caleida sem depender do histórico de chats. Caso o repositório contenha a informação necessária, não peça ao usuário para repeti-la.