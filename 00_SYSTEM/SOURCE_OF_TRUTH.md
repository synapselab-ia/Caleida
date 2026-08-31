# Source of Truth — Caleida

**Status:** protocolo canônico  
**Escopo:** precedência entre especificação, decisões, execução, código e contexto conversacional

## 1. Hierarquia canônica

Quando dois artefatos divergirem, use a seguinte ordem de precedência:

1. `docs/PROJECT_DESIGN.md` + amendments ativos de Project Design — comportamento de produto, princípios de domínio, escopo e decisões aprovadas. Amendments ativos: `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md` e `docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md`, cada um prevalecendo somente no escopo que declara superseded.
2. Instrução explícita do usuário na tarefa atual — pode alterar deliberadamente produto, prioridade ou arquitetura; mudanças materiais devem ser registradas no repositório na mesma unidade de trabalho ou antes da implementação dependente.
3. Decisões arquiteturais aceitas em `docs/DECISIONS.md` e, futuramente, ADRs que as substituam formalmente.
4. `docs/EXECUTION_PLAN.md` e a especificação da tarefa ativa — ordem de execução, dependências, critérios de aceite e fora do escopo.
5. Especificações de domínio/arquitetura aplicáveis, incluindo `docs/ARCHITECTURE.md`, `docs/NEON_PLATFORM.md`, `00_SYSTEM/DEPLOYMENT_POLICY.md` e documentos futuros de banco, segurança, integrações e UX.
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

## 3. Project Design e amendments

`docs/PROJECT_DESIGN.md` v1.0 permanece a especificação base do produto.

Amendments aprovados integram formalmente o Project Design sem apagar a edição histórica.

Regras:

- cada amendment declara exatamente o escopo que altera;
- fora desse escopo, o Project Design base continua prevalecendo;
- dentro do escopo declarado, o amendment mais recente aprovado prevalece;
- decisões relacionadas devem registrar supersessão de forma rastreável.

Amendments vigentes:

- `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md` — plataforma de dados/identidade/ambientes/Storage;
- `docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md` — hosting, deployment, CI/CD e release.

## 4. Estado operacional

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

`docs/STATUS.md` é snapshot histórico e não deve ser usado como cursor operacional atual.

## 5. GitHub como verdade operacional

O estado real de branch, commits, Issues, pull requests, workflows, arquivos e código prevalece sobre descrições antigas de conversas.

Antes de editar, confronte o `CHECKPOINT` com o GitHub. Se divergirem, preserve o estado real e reconcilie a documentação antes de avançar para trabalho dependente.

## 6. Plataforma canônica vigente

Dados/identidade:

- `DEC-007`;
- `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md`;
- `docs/NEON_PLATFORM.md`;
- `docs/ARCHITECTURE.md`.

Deployment/release:

- `DEC-009`;
- `docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md`;
- `00_SYSTEM/DEPLOYMENT_POLICY.md`.

Supabase permanece apenas como referência histórica explicitamente superseded. Storage permanece decisão aberta conforme `DEC-008`.

## 7. Banco e dados

Depois que a implementação de banco começar:

- migrations versionadas serão a única história canônica de schema;
- mudanças exclusivas de dashboard/console não serão solução permanente;
- migrations já aplicadas não devem ser reescritas para alterar história; correções usam novas migrations;
- autorização no banco faz parte do contrato do produto, não é detalhe de interface;
- dados reais de usuário não podem ser substituídos ou apagados silenciosamente por sincronizações, cache, conteúdo derivado ou IA.

## 8. Deployment

Deployment é uma ação humana e manual de release.

Enquanto `DEC-009` estiver vigente:

- IA não executa Preview ou Production;
- automações/CI não executam deployment;
- Git deployments automáticos devem permanecer desabilitados;
- merge não significa release;
- release externa pode ser marcada como `MANUAL_ACTION_REQUIRED` sem bloquear trabalho independente.

## 9. Segurança

Quando interface, aplicação e autorização persistente divergirem, preserve o comportamento mais restritivo até a divergência ser resolvida explicitamente.

Nunca reduza controles de segurança apenas para fazer uma tarefa, teste ou demonstração passar.

## 10. Plataformas externas

Para tecnologias de evolução rápida, a documentação oficial atual é a fonte de verdade para APIs, SDKs, configuração, limites e comportamento operacional.

Ela não altera automaticamente a semântica do Caleida. Se uma plataforma exigir adaptação de produto ou arquitetura, a adaptação deve ser deliberadamente registrada.

## 11. Regra de continuidade

Uma nova sessão deve conseguir retomar o Caleida sem depender do histórico de chats. Caso o repositório contenha a informação necessária, não peça ao usuário para repeti-la.