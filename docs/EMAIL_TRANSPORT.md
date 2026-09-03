# E-mail transacional — Caleida

**Status:** implementação preparada; ativação non-production depende de credencial/domínio externos  
**Story:** `US-AUTH-004` / Issue `#49`  
**Decisão:** `ADR-009`  
**Escopo:** convites da aplicação + transporte futuro de confirmação/recuperação do Neon Auth

## 1. Provedor

O provedor selecionado para non-production é **Resend**.

A aplicação usa REST diretamente por `fetch` nativo em `src/lib/email/server.ts`. O Neon Auth pode usar o mesmo provedor por SMTP customizado quando a conta/domínio/credencial non-production forem configurados.

Nenhum SDK Resend é requisito arquitetural. A fronteira do provedor permanece concentrada no módulo server-only para preservar substituibilidade.

## 2. Contrato de ambiente

```text
RESEND_API_KEY
CALEIDA_EMAIL_FROM
CALEIDA_EMAIL_FROM_NAME
```

Regras:

- `RESEND_API_KEY` é secret server-only;
- criar a chave como `sending_access`, preferencialmente limitada ao domínio non-production;
- `CALEIDA_EMAIL_FROM` deve usar domínio/subdomínio verificado;
- `CALEIDA_EMAIL_FROM_NAME` é configuração server-only; quando ausente, o runtime usa `Caleida`;
- nenhum desses valores recebe prefixo `NEXT_PUBLIC_`;
- valores reais ficam em secret store/arquivo local ignorado, nunca no Git, Issue, PR ou chat.

## 3. Boundary da aplicação

`sendTransactionalEmail(message, { idempotencyKey })`:

- aceita 1–50 destinatários;
- normaliza endereços;
- exige assunto sem quebra de linha;
- exige `text` ou `html`;
- aceita `replyTo` opcional;
- exige chave de idempotência entre 1 e 256 caracteres;
- chama somente `POST https://api.resend.com/emails`;
- usa header `Authorization: Bearer ...` somente server-side;
- usa `Idempotency-Key` em todo envio;
- retorna somente `provider` + `messageId` em sucesso;
- não devolve payload bruto de erro do provedor.

### Falhas

São classificadas como recuperáveis:

- erro de rede/timeout do `fetch`;
- HTTP `429`;
- HTTP `5xx`.

Outros `4xx` são tratados como rejeição não recuperável por retry cego. O erro exposto pela boundary contém apenas mensagem sanitizada, `retryable` e status HTTP quando conhecido.

A aplicação não mantém retry automático infinito nesta Story. O chamador futuro deverá decidir retry/backoff conforme o evento de negócio e os limites vigentes do provedor.

## 4. Invariante dos convites

O transporte de e-mail **não possui acesso ao banco** e não importa qualquer função de `caleida_access`.

Fluxo futuro correto para convite:

```text
convite criado
  ↓
preparar mensagem + idempotency key estável
  ↓
provedor confirma envio
  ↓
transição administrativa criado → enviado
```

Se o envio falhar:

```text
convite permanece criado
  ↓
operação pode ser tentada novamente de forma controlada
```

Falha de transporte nunca:

- chama `consume_invitation`;
- aumenta `use_count`;
- marca convite como utilizado;
- finge estado `enviado`.

Essa ordem será materializada no fluxo funcional posterior, não nesta Story.

## 5. Idempotência

Resend mantém chaves de idempotência por 24 horas e aceita no máximo 256 caracteres.

O chamador deve gerar chave estável por evento, por exemplo conceitualmente:

```text
<tipo-do-evento>/<identificador-estável>/<versão-do-envio>
```

Não use senha, token de convite, e-mail bruto ou outro secret na chave.

Uma nova intenção legítima de envio deve receber uma nova versão/chave; retry da mesma intenção deve reutilizar a mesma chave dentro da janela suportada.

## 6. Domínio, autenticação e região

Para envio a destinatários reais, o domínio/subdomínio precisa ser verificado no Resend. O provedor recomenda subdomínio para isolar reputação de envio.

Configuração mínima do domínio:

- SPF;
- DKIM;
- DMARC recomendado quando operacionalmente apropriado.

A região de envio São Paulo (`sa-east-1`) é preferível para o público inicial brasileiro quando disponível no plano vigente. Essa escolha controla roteamento de envio, **não residência de dados**. Segundo a documentação corrente do Resend, metadados, logs e registros de API permanecem nos Estados Unidos.

Por isso:

- enviar somente os dados necessários ao e-mail transacional;
- não incluir dados sensíveis desnecessários;
- manter tracking adicional desabilitado quando não houver requisito explícito;
- reavaliar DPA/subprocessadores antes do beta real.

## 7. Neon Auth — SMTP customizado

A baseline Neon Auth atualmente usa o provider de e-mail compartilhado do Neon. Em 03/09/2026 a configuração também permanece com confirmação obrigatória de e-mail **desabilitada**, coerente com o fato de o cadastro controlado ainda não existir.

A API corrente do Neon Auth permite configurar, por branch:

```text
host
port
username
password
sender_email
sender_name
```

Para Resend, o contrato oficial SMTP é:

```text
host: smtp.resend.com
username: resend
password: <RESEND_API_KEY server-only>
port: 465 ou 587 conforme o modo SMTP/TLS adotado no gate real
sender_email: <CALEIDA_EMAIL_FROM>
sender_name: <CALEIDA_EMAIL_FROM_NAME>
```

A configuração live não é versionada. Ela deve ser aplicada apenas depois que:

1. existir conta Resend non-production;
2. domínio/subdomínio estiver verificado;
3. uma chave `sending_access` limitada ao domínio tiver sido criada;
4. os valores tiverem sido armazenados fora do Git/chat;
5. houver um gate Neon Auth isolado apropriado para provar SMTP antes de qualquer promoção à baseline.

Não habilitar `require_email_verification` em US-AUTH-004. A confirmação obrigatória será ativada junto do cadastro controlado em `US-AUTH-005`, depois que o gate de entrada estiver conectado ao Auth.

## 8. Testes sem envio real

O CI padrão não recebe `RESEND_API_KEY` e não envia e-mail externo.

A implementação é testável sem Production por:

- typecheck/build do módulo TypeScript;
- testes de contrato que fixam boundary server-only, nomes de env, idempotência, classificação de erros e ausência de mutação de convite;
- futura verificação manual/isolada com credencial non-production e endereço de teste seguro do provedor.

O envio live não pode receber `PASS` enquanto domínio/chave reais não forem configurados e exercitados.

## 9. Limites correntes observados

Em 03/09/2026, o Resend Free anuncia:

- 3.000 e-mails por mês;
- 100 e-mails por dia;
- REST API e SMTP relay;
- retenção padrão de dados de 30 dias.

Esses números são capacidade observada, não requisito permanente. Revalidar pricing, limites, região e privacidade antes do beta real e antes de qualquer promoção Production.

## 10. Non-goals desta Story

- templates finais de cadastro/recuperação;
- endpoint público de convite;
- signup;
- login/logout;
- ativação de confirmação obrigatória;
- fila/outbox persistente;
- webhooks do Resend;
- Production;
- deployment Vercel.
