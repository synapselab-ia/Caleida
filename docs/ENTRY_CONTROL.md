# Entrada controlada — US-AUTH-003

## Escopo

Este documento define a fundação persistente de convites e solicitações de acesso criada em `US-AUTH-003`.

A Story modela a barreira de entrada do beta fechado **antes** do signup. Ela não envia e-mail, não cria conta, não expõe Data API, não cria endpoint público e não publica o Caleida.

## Migration canônica

A implementação persistente pertence a:

```text
database/migrations/000003_entry_control.sql
```

Schema principal:

```text
caleida_access
```

Auditoria reutiliza:

```text
caleida_audit
```

## Convites

### `caleida_access.invitations`

Representa o convite e sua capacidade.

Campos centrais:

- `token_digest`: digest hexadecimal de 64 caracteres; o token em texto puro nunca é persistido;
- `kind`: `unico` ou `reutilizavel`;
- `state`;
- `recipient_email` opcional e normalizado;
- `max_uses` e `use_count`;
- `expires_at`;
- UUID do responsável que criou o convite;
- timestamps de criação, envio e encerramento.

Estados canônicos:

```text
criado
  ├── enviado
  │     ├── utilizado
  │     ├── expirado
  │     ├── revogado
  │     └── cancelado
  ├── expirado
  └── cancelado
```

`utilizado`, `expirado`, `revogado` e `cancelado` são terminais.

Um convite `unico` possui exatamente um uso. Um convite `reutilizavel` deve possuir capacidade maior que um. Constraints impedem `use_count` fora da capacidade e impedem marcar como `utilizado` antes de esgotar todos os usos.

### Token de convite

US-AUTH-003 não gera nem envia tokens, pois ainda não existe endpoint/fluxo externo.

O contrato para a Story que vier a gerar convites é:

1. gerar token aleatório criptograficamente forte fora do banco;
2. entregar o valor em texto puro somente ao canal autorizado;
3. persistir apenas seu digest SHA-256 em hexadecimal minúsculo;
4. localizar/consumir o convite pelo digest calculado server-side;
5. nunca registrar o token puro em banco, auditoria ou log.

### Destinatário opcional

`recipient_email` restringe um convite a um endereço específico quando preenchido.

E-mails persistidos são normalizados por `trim + lowercase`. `consume_invitation()` aplica a mesma normalização ao valor recebido antes da comparação, evitando que diferenças de caixa alterem o destinatário autorizado.

A normalização não substitui confirmação de e-mail. Essa etapa pertence ao fluxo futuro de cadastro.

## Usos de convite

### `caleida_access.invitation_uses`

Cada consumo bem-sucedido recebe um `use_number` único por convite e guarda:

- convite de origem;
- número sequencial do uso;
- e-mail normalizado usado no consumo;
- timestamp;
- UUID da futura conta criada, quando esse vínculo existir;
- timestamp do vínculo futuro.

Nenhuma conta é criada ou vinculada em US-AUTH-003.

## Concorrência e limite de uso

`caleida_access.consume_invitation(...)` protege a capacidade no próprio PostgreSQL:

1. localiza o convite pelo digest;
2. adquire row lock com `SELECT ... FOR UPDATE`;
3. verifica estado, validade, destinatário e capacidade;
4. cria o registro de uso;
5. incrementa `use_count` na mesma transação;
6. transforma o convite em `utilizado` ao esgotar a capacidade.

O row lock serializa consumidores concorrentes do mesmo convite. A prova versionada `database/tests/000005_invitation_concurrency.mjs` abre duas sessões `psql` independentes contra o mesmo PostgreSQL 18 e exige que, para um convite de uso único, exatamente uma sessão consuma e a outra receba indisponibilidade.

A constraint única `(invitation_id, use_number)` funciona como defesa adicional contra duplicação de número de uso.

## Expiração, revogação e cancelamento

Convite indisponível não é consumido.

- expirado: `expires_at <= CURRENT_TIMESTAMP`;
- revogado: encerramento administrativo após envio;
- cancelado: encerramento administrativo antes ou depois do envio, conforme a máquina de estados;
- utilizado: capacidade esgotada.

Se a validade termina antes de uma tentativa de consumo, a própria operação materializa o estado `expirado` e registra o evento correspondente.

## Solicitações de acesso

### `caleida_access.access_requests`

Representa pedido/lista de espera sem criar identidade Auth.

Estados:

```text
em_espera
  ├── aprovada
  │     └── arquivada
  ├── recusada
  │     └── arquivada
  └── arquivada
```

A decisão guarda:

- UUID do responsável;
- timestamp;
- motivo entre 1 e 500 caracteres.

Um índice parcial impede mais de uma solicitação ativa (`em_espera` ou `aprovada`) para o mesmo e-mail normalizado. Depois do arquivamento, uma nova solicitação pode ser registrada.

Campos `created_auth_user_id` e `linked_at` existem somente para rastrear a futura conta criada quando US-AUTH-005 implementar cadastro. Permanecem nulos nesta Story.

## Auditoria

### `caleida_audit.entry_events`

Registra eventos mínimos de entrada:

- mudança de estado de convite;
- consumo de convite;
- mudança de estado de solicitação;
- futuro vínculo com identidade quando a operação for implementada.

O evento contém apenas:

- tipo/id da entidade;
- tipo do evento;
- UUID do ator quando aplicável;
- estado anterior/novo;
- motivo curto;
- timestamp.

Não há senha, token de convite em texto puro, cookie, token de sessão ou payload Auth completo.

## Privacidade e superfície de banco

Schemas/tabelas/funções desta Story ficam fechados a `PUBLIC`.

US-AUTH-003 não cria papel runtime nem grants para browser porque ainda não existe endpoint de produto que os necessite. Também não habilita Neon Data API nem fabrica RLS sem superfície de acesso real.

Quando uma Story futura expuser operações externas, ela deve:

1. validar sessão/entrada no servidor quando aplicável;
2. usar papel runtime de least privilege;
3. preservar as constraints e máquinas de estado do banco;
4. adicionar RLS quando a tabela for efetivamente exposta por Data API/user context;
5. provar acesso direto/adversarial, não apenas esconder botões.

## Rate limiting e abuso

US-AUTH-003 não possui endpoint externo, portanto rate limiting não é implementado artificialmente.

A primeira Story que expuser criação de solicitação, validação ou consumo de convite via rede deve definir e testar controles de abuso/rate limiting antes de considerar o endpoint concluído.

## Gate Neon-specific

`SKIPPED` por desenho nesta Story.

A migration usa somente comportamento PostgreSQL portável e UUIDs opacos. Ela não consulta `neon_auth`, não usa helper/role gerenciado, não habilita Data API e não depende de branching/compute Neon.

Conforme `ADR-008`, o gate correto foi PostgreSQL 18 descartável. Nenhuma branch Neon de verificação foi criada apenas por conveniência.

A migration validada foi promovida deliberadamente à baseline `caleida-nonprod/main` depois dos gates técnicos, sem fixtures ou dados sintéticos.

## Próximas Stories

- `US-AUTH-004`: selecionar/integrar e-mail transacional non-production;
- `US-AUTH-005`: impor o mecanismo de entrada ao cadastro real, confirmar e-mail, consumir convite/vincular solicitação de forma segura e testar chamadas diretas.

US-AUTH-003, isoladamente, **não autoriza signup**.