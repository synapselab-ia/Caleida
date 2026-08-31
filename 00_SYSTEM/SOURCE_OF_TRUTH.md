# Source of Truth — Caleida

**Status:** protocolo canônico  
**Escopo:** precedência entre produto, arquitetura, execução, implementação e contexto conversacional

## 1. Hierarquia canônica

Quando dois artefatos divergirem, use esta ordem:

1. `docs/PROJECT_DESIGN.md` + amendments ativos — comportamento e decisões de produto aprovadas.
2. Instrução explícita do usuário na tarefa atual — pode deliberadamente alterar produto, prioridade ou arquitetura; mudanças materiais devem ser registradas no repositório.
3. ADRs `Accepted` em `docs/adr/` — decisões arquiteturais canônicas. ADR `Superseded` permanece histórico e não governa trabalho novo na parte substituída.
4. `docs/EXECUTION_PLAN.md` + especificação da tarefa ativa — ordem, dependências, critérios e limites operacionais.
5. Especificações técnicas aplicáveis, como `docs/ARCHITECTURE.md`, `docs/NEON_PLATFORM.md`, `00_SYSTEM/DEPLOYMENT_POLICY.md` e documentos futuros de domínio/segurança/integração.
6. Migrations e testes automatizados — contratos executáveis do estado implementado.
7. Código da aplicação.
8. `docs/CHECKPOINT.md` — cursor operacional; registra onde estamos, mas não redefine produto/arquitetura.
9. `docs/DECISIONS.md` — índice/histórico legado; não sobrepõe ADRs nem Project Design.
10. Memória de chats, suposições da IA e conhecimento não registrado no repositório.

## 2. Regra de conflito

Não altere documentação canônica apenas para legitimar comportamento acidental do código.

Classifique divergências como:

- **defeito de implementação:** corrigir código, migration ou teste;
- **mudança deliberada:** registrar a decisão e atualizar artefatos afetados;
- **documentação operacional desatualizada:** reconciliar Checkpoint/plano com o GitHub;
- **decisão aberta:** marcar bloqueio/decisão necessária; não inventar semântica de produto.

## 3. Project Design e amendments

`docs/PROJECT_DESIGN.md` v1.0 permanece a base de produto. Amendments aprovados prevalecem somente no escopo que declaram.

Ativos:

- `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md` — plataforma, dados, identidade, ambientes e Storage;
- `docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md` — hosting, CI, deployment e release.

## 4. ADRs

`docs/adr/README.md` é o índice canônico das decisões arquiteturais.

Regras:

- nova decisão arquitetural material cria ADR;
- ADR aceito não é reescrito para apagar história;
- mudança material cria ADR posterior e relações `Supersedes` / `Superseded by`;
- `docs/DECISIONS.md` preserva IDs históricos, mas não é segunda fonte de arquitetura;
- documentos técnicos devem preferir referências ao ADR canônico.

## 5. Estado operacional

`docs/CHECKPOINT.md` é o cursor oficial de continuidade e deve informar estado, fase, última tarefa, `NEXT_ACTION`, blockers, `ON_HOLD`, ações manuais e verificação relevante.

`docs/STATUS.md` é snapshot histórico.

## 6. GitHub como verdade operacional

Branch, commits, Issues, PRs, workflows, arquivos e código reais prevalecem sobre descrições conversacionais antigas. Antes de editar, confronte o Checkpoint com o GitHub.

## 7. Plataforma vigente

Dados/identidade:

- `ADR-005`;
- `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md`;
- `docs/NEON_PLATFORM.md`.

Banco/migrations:

- `ADR-004`.

Storage:

- `ADR-006` — decisão adiada/provider-independent.

Deployment/release:

- `ADR-007`;
- `docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md`;
- `00_SYSTEM/DEPLOYMENT_POLICY.md`.

Supabase permanece apenas histórico conforme `ADR-003`/`ADR-005`.

## 8. Banco e dados

Depois que a implementação começar:

- migrations versionadas são a história canônica de schema;
- dashboard/Console não substitui migration;
- migrations aplicadas não são reescritas; correções usam nova migration;
- autorização no banco faz parte do contrato do produto;
- dados reais do usuário não podem ser apagados/substituídos silenciosamente por sync, cache ou IA.

## 9. Deployment

Deployment é release humana/manual conforme `ADR-007`.

- IA não executa Preview/Production/promote/rollback/redeploy;
- automações/CI não executam deployment;
- Git deployments automáticos permanecem desabilitados;
- merge não significa release;
- release externa pode virar `MANUAL_ACTION_REQUIRED` sem bloquear trabalho independente.

## 10. Segurança

Quando interface, aplicação e autorização persistente divergirem, preserve o comportamento mais restritivo até resolução explícita. Nunca reduza controles para fazer teste/demonstração passar.

## 11. Plataformas externas

Para tecnologia de evolução rápida, documentação oficial corrente é autoridade sobre APIs, SDKs, configuração e limites, mas não altera automaticamente a semântica do Caleida. Adaptações materiais exigem ADR/amendment quando aplicável.

## 12. Continuidade

Uma nova sessão deve conseguir retomar o projeto pelo repositório sem depender do histórico de chats e sem pedir ao usuário contexto já recuperável.
