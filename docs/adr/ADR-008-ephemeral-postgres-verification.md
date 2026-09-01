# ADR-008 — PostgreSQL efêmero como gate primário de migrations e RLS

**Status:** Accepted  
**Data:** 2026-09-01  
**Supersedes:** somente o requisito de que toda verificação destrutiva genérica ocorra obrigatoriamente em branch Neon descartável, presente em `ADR-004` e `ADR-005`  
**Superseded by:** none

## Contexto

O Caleida mantém Neon como plataforma canônica, mas a correção de migrations SQL e de políticas PostgreSQL não deve depender da disponibilidade do plano de controle de um provedor externo.

Durante `US-PLAT-005`, o conector disponível para o Neon passou a rejeitar criação de branches por incompatibilidade entre o contrato público do tool e o backend. Isso bloqueou repetidamente uma verificação que, para a baseline técnica atual, usa apenas recursos padrão do PostgreSQL.

A documentação oficial corrente do Neon confirma que Neon é PostgreSQL e que o projeto atual usa PostgreSQL 18, embora existam diferenças próprias de serviço gerenciado em permissões, parâmetros, extensões e outros comportamentos.

## Decisão

O Caleida separa dois níveis de verificação de banco.

### Gate primário — PostgreSQL portável

Toda migration, constraint e política RLS que dependa apenas de comportamento PostgreSQL deve ser verificada primeiro em uma instância PostgreSQL descartável da mesma versão major do projeto Neon canônico.

No estado atual:

- PostgreSQL 18 é o runtime de banco de referência;
- o ambiente descartável pode ser container local ou service container de CI;
- o banco nasce limpo para o teste;
- migrations são aplicadas desde a baseline conhecida;
- testes em `database/tests/` são executados contra esse banco;
- falha na criação de branch Neon não converte ausência de prova em `PASS`, mas também não bloqueia esse gate portável.

### Gate adicional — compatibilidade Neon

Verificação em branch Neon descartável continua obrigatória quando a mudança depender de comportamento específico do Neon ou quando o risco justificar prova no serviço gerenciado, incluindo, entre outros:

- permissões ou papéis específicos do Neon;
- `neon_superuser`;
- extensões cujo suporte dependa do Neon;
- Neon Auth, Data API, helpers ou schemas gerenciados;
- comportamento de branching, compute, pooling ou conexão específico do serviço;
- diferenças documentadas entre Neon e PostgreSQL standalone.

Se esse gate adicional for necessário e o branching Neon estiver indisponível, a mudança específica permanece `BLOCKED`; a baseline Neon `main` não pode ser usada como laboratório destrutivo.

### Promoção

Uma mudança persistente só pode ser promovida para a baseline Neon non-production quando:

- estiver versionada em `database/migrations/`;
- o gate PostgreSQL aplicável tiver passado;
- qualquer gate Neon-specific aplicável também tiver passado;
- a promoção for deliberada e seguir os guardrails do tooling.

Production nunca é ambiente de teste destrutivo.

## Consequências

- migrations SQL padrão deixam de depender do endpoint de branching do provedor para provar correção básica;
- os testes ficam determinísticos, reproduzíveis e executáveis em CI sem credencial Neon;
- a plataforma de produção não muda: Neon continua canônico conforme `ADR-005`;
- diferenças de serviço gerenciado continuam sendo verificadas no Neon quando materialmente relevantes;
- uma futura mudança de versão major do projeto Neon deve atualizar conjuntamente o runtime PostgreSQL descartável e seus testes;
- RLS portável pode ser exercitada em PostgreSQL efêmero, mas políticas ligadas a identidade/roles específicos de Neon Auth/Data API exigem gate Neon adicional.

## Relações

- preserva a regra central de `ADR-004`: toda mudança persistente de schema é migration versionada;
- preserva a plataforma de `ADR-005`: Neon Postgres/Auth/Data API/RLS continua canônica;
- altera somente o ambiente mínimo obrigatório para verificação destrutiva de SQL PostgreSQL portável;
- protocolos e documentação técnica devem distinguir gate PostgreSQL portável de gate Neon-specific.
