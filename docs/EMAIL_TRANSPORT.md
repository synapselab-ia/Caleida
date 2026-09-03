# E-mail transacional — Caleida

**Status:** implementação técnica preparada; gate live isolado em `verify-us-auth-004` aguarda configuração externa  
**Story:** `US-AUTH-004` / Issue `#49` / PR `#50`  
**Decisão:** `ADR-009`  
**Escopo:** convites da aplicação + transporte futuro de confirmação/recuperação do Neon Auth

## 1. Provedor

O provedor selecionado para non-production é **Resend**.

A aplicação usa REST diretamente por `fetch` nativo em `src/lib/email/server.ts`. Neon Auth deve usar o mesmo provedor por SMTP customizado, primeiro na branch Neon isolada `verify-us-auth-004` e somente depois, se o gate passar, na baseline.

Nenhum SDK Resend é requisito arquitetural. A boundary fica concentrada no módulo server-only.

## 2. Contrato de ambiente

```text
RESEND_API_KEY
CALEIDA_EMAIL_FROM
CALEIDA_EMAIL_FROM_NAME
```

Regras:

- `RESEND_API_KEY` é secret server-only;
- criar como `sending_access`, preferencialmente limitada ao domínio non-production;
- `CALEIDA_EMAIL_FROM` usa domínio/subdomínio verificado;
- `CALEIDA_EMAIL_FROM_NAME` é server-only; default runtime `Caleida`;
- nenhum valor recebe prefixo `NEXT_PUBLIC_`;
- valores reais ficam em secret store/arquivo local ignorado, nunca Git, Issue, PR ou chat.

## 3. Boundary da aplicação

`sendTransactionalEmail(message, { idempotencyKey })`:

- aceita 1–50 destinatários;
- normaliza endereços;
- exige assunto sem quebra de linha;
- exige `text` ou `html`;
- aceita `replyTo` opcional;
- exige idempotency key de 1–256 caracteres;
- chama `POST https://api.resend.com/emails`;
- usa `Authorization: Bearer ...` apenas server-side;
- usa `Idempotency-Key` em todo envio;
- retorna somente `provider` + `messageId`;
- não propaga payload bruto de erro.

### Falhas

Recuperáveis:

- erro de rede/timeout;
- HTTP `429`;
- HTTP `5xx`.

Outros `4xx` são rejeição não recuperável por retry cego. O erro exposto contém somente mensagem sanitizada, `retryable` e status HTTP quando conhecido.

Não existe retry infinito nesta Story. O chamador futuro decide retry/backoff conforme evento e limites vigentes.

## 4. Invariante dos convites

O transporte de e-mail **não possui acesso ao banco**.

Fluxo futuro correto:

```text
convite criado
  ↓
preparar mensagem + idempotency key estável
  ↓
provedor confirma envio
  ↓
transição administrativa criado → enviado
```

Se o envio falhar, o convite permanece `criado` e pode ser tentado novamente de modo controlado.

Falha de transporte nunca:

- chama `consume_invitation`;
- aumenta `use_count`;
- marca convite como utilizado;
- finge estado `enviado`.

## 5. Idempotência

Resend mantém chaves por 24 horas e aceita no máximo 256 caracteres.

Formato conceitual:

```text
<tipo-do-evento>/<identificador-estável>/<versão-do-envio>
```

Não usar senha, token de convite, e-mail bruto ou outro secret na chave. Retry da mesma intenção reutiliza a mesma chave dentro da janela; nova intenção legítima usa nova versão/chave.

## 6. Domínio, autenticação e região

Para destinatários reais, o domínio/subdomínio precisa ser verificado no Resend. Subdomínio é recomendado para isolar reputação.

Configuração mínima:

- SPF;
- DKIM;
- DMARC recomendado quando operacionalmente apropriado.

A região de envio São Paulo (`sa-east-1`) pode ser preferida para o público inicial brasileiro quando disponível. Ela controla roteamento, **não residência de dados**. Segundo a documentação corrente, metadados, logs e registros de API do Resend permanecem nos Estados Unidos.

Consequências:

- enviar apenas dados necessários;
- evitar dados sensíveis desnecessários;
- manter tracking adicional desabilitado quando não houver requisito;
- reavaliar DPA/subprocessadores antes do beta real.

## 7. Neon Auth — gate SMTP isolado

Estado criado em 03/09/2026:

```text
Baseline: main / br-restless-cherry-awpcwy6r
Gate: verify-us-auth-004 / br-plain-pond-aw5f59ia / ready
Auth provider no gate: Better Auth
Email provider no gate: shared Neon
Require email verification no gate: false
```

A branch herdou Auth da baseline e existe somente para testar SMTP customizado sem alterar `main`.

Campos suportados pelo Neon Auth:

```text
host
port
username
password
sender_email
sender_name
```

Contrato Resend:

```text
host: smtp.resend.com
username: resend
password: <RESEND_API_KEY server-only>
port: 465 ou 587 conforme o gate real
sender_email: <CALEIDA_EMAIL_FROM>
sender_name: <CALEIDA_EMAIL_FROM_NAME>
```

Sequência operacional:

1. criar/usar conta Resend non-production;
2. verificar domínio/subdomínio;
3. criar chave `sending_access`, limitada ao domínio quando possível;
4. armazenar secret fora do Git/chat;
5. no Neon Console, selecionar **branch `verify-us-auth-004`**;
6. configurar SMTP Resend somente nessa branch;
7. manter `require_email_verification=false`;
8. executar teste de envio controlado;
9. informar apenas que configuração/teste passaram, sem expor secret.

A IA então revalida a branch com secrets redigidos. Somente depois de PASS isolado a configuração pode ser promovida deliberadamente para `main` por superfície segura.

A exclusão futura da branch de verificação exigirá autorização explícita do usuário.

Não habilitar `require_email_verification` em US-AUTH-004. Isso pertence a US-AUTH-005, junto do cadastro controlado.

## 8. Testes automatizados

O CI padrão não recebe `RESEND_API_KEY` e não envia e-mail externo.

A implementação é provada por:

- typecheck/build;
- testes de contrato de boundary/env/idempotência/falhas;
- ausência de acesso ao banco;
- PostgreSQL 18/`verify:db` permanente para regressão geral.

CI técnico `33786184072`: `60/60 PASS`, build PASS e PostgreSQL 18/`verify:db` PASS.

O envio live não recebe `PASS` enquanto domínio/chave reais não forem exercitados na branch isolada.

## 9. Limites correntes observados

Em 03/09/2026, Resend Free anuncia:

- 3.000 e-mails/mês;
- 100 e-mails/dia;
- REST API e SMTP relay;
- retenção padrão de dados de 30 dias.

Revalidar pricing, limites, região e privacidade antes do beta real e Production.

## 10. Non-goals

- templates finais de cadastro/recuperação;
- endpoint público de convite;
- signup;
- login/logout;
- confirmação obrigatória nesta Story;
- fila/outbox persistente;
- webhooks Resend;
- Production;
- deployment Vercel.
