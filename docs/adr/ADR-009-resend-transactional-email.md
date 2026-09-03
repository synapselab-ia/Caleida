# ADR-009 — Resend como transporte transacional non-production

**Status:** Accepted  
**Data:** 2026-09-03  
**Supersedes:** none  
**Superseded by:** none

## Contexto

O beta fechado precisa de e-mail transacional para três classes de evento que serão materializadas em Stories distintas:

- convites de entrada controlada;
- confirmação de endereço de e-mail;
- recuperação de senha.

A identidade canônica permanece Neon Auth/Better Auth. O transporte de convites pertence à aplicação, enquanto confirmação e recuperação podem ser emitidas pelo Neon Auth via provedor SMTP customizado. A solução precisa portanto oferecer REST e SMTP sem expor secrets ao browser, funcionar em non-production com baixo custo operacional e permanecer substituível conforme PR-11.

Em 03/09/2026 foram comparados Resend, Brevo, Mailgun e Amazon SES em documentação oficial corrente. O Resend oferece no plano gratuito 3.000 e-mails transacionais por mês, limite de 100 por dia, REST API e SMTP relay. Ele também permite chaves `sending_access`, inclusive restritas a domínio, e idempotência nativa no `POST /emails` por 24 horas.

A seleção de região do Resend pode usar São Paulo para roteamento/saída, porém essa escolha **não** fornece residência brasileira de dados: metadados de e-mail, logs e registros de API permanecem armazenados nos Estados Unidos. O DPA do provedor contempla tratamento de dados pessoais e mecanismos de transferência internacional; isso não elimina a obrigação do Caleida de minimizar conteúdo e reavaliar privacidade antes do beta real.

## Decisão

Adotar **Resend** como provedor de e-mail transacional do ambiente non-production do Caleida.

A integração será deliberadamente estreita:

1. o runtime server-side da aplicação usa a REST API `POST /emails` via `fetch` nativo, sem SDK Resend obrigatório;
2. `RESEND_API_KEY` é secret server-only com permissão `sending_access`, preferencialmente restrita ao domínio non-production;
3. cada envio da aplicação exige `Idempotency-Key` estável e específico do evento;
4. o Neon Auth será configurado futuramente com SMTP customizado do mesmo provedor, usando `smtp.resend.com` e credencial sending-only, após domínio/chave reais existirem;
5. o domínio/subdomínio de envio deve ser separado operacionalmente e verificado por SPF/DKIM; o nome concreto do domínio não é inventado nem versionado enquanto não existir;
6. região São Paulo deve ser preferida para roteamento quando disponível e compatível com o plano vigente, sem descrevê-la como residência de dados;
7. Production exigirá credencial/domínio/configuração próprios e nova revalidação antes do uso.

A aplicação não persistirá uma abstração genérica de múltiplos provedores nem adicionará uma dependência SDK apenas para antecipar migração hipotética. A substituição futura fica concentrada na boundary `src/lib/email/server.ts` e no contrato de ambiente.

## Consequências

### Positivas

- REST e SMTP no mesmo provedor cobrem app + Neon Auth sem dois fornecedores iniciais;
- plano gratuito é suficiente para desenvolvimento e um beta pequeno, sujeito à revalidação de volume;
- chave `sending_access` reduz blast radius em relação a uma chave administrativa;
- idempotência do provedor simplifica retry sem duplicação durante a janela suportada;
- integração por HTTP nativo evita acoplamento ao SDK do fornecedor;
- domínio de envio pode usar região São Paulo para reduzir latência operacional para usuários brasileiros.

### Custos e riscos

- o free tier possui limite diário e mensal; ultrapassá-lo exige controle de volume/plano;
- metadados, logs e registros de API do Resend ficam nos Estados Unidos mesmo quando São Paulo é a região de envio;
- a entrega real depende de conta externa, domínio DNS verificado, reputação e secret que não podem ser criados pelo repositório;
- a idempotência do Resend expira após 24 horas; retries posteriores precisam continuar usando estado de negócio coerente;
- indisponibilidade do provedor não pode ser transformada em consumo de convite ou sucesso aparente;
- termos, pricing, regiões e limites podem mudar e devem ser revalidados antes de Production/abertura pública.

### Guardrails

- nunca versionar `RESEND_API_KEY` nem credencial SMTP;
- nunca criar `NEXT_PUBLIC_RESEND_*`;
- não registrar payload bruto do provedor, destinatário desnecessário ou secret em logs/auditoria;
- mensagens do app devem usar idempotência;
- `429`, falha de rede e `5xx` são tratadas como temporariamente recuperáveis; falhas de validação/autorização não devem gerar retry cego;
- falha de envio não muda convite para `enviado` e jamais chama `consume_invitation`;
- não habilitar confirmação obrigatória do Neon Auth em US-AUTH-004; isso pertence ao cadastro controlado de US-AUTH-005;
- não usar domínio/credencial non-production em Production;
- desabilitar tracking que não seja necessário ao fluxo transacional quando o provedor permitir, minimizando coleta;
- revalidar DPA/subprocessadores e requisitos legais antes do beta real.

## Alternativas consideradas

- **Brevo** — free tier maior por dia (300 envios/dia) e e-mail transacional incluído, mas introduz uma plataforma mais ampla que o necessário e não melhora o encaixe técnico o suficiente para superar a simplicidade/idempotência/least privilege do Resend nesta fase.
- **Mailgun** — REST + SMTP e 100 envios/dia no plano gratuito, porém com menor retenção de logs e uma proposta operacional menos simples para este beta.
- **Amazon SES** — custo unitário muito baixo e forte escalabilidade, mas exige mais superfície AWS, configuração regional/sandbox/IAM e operação do que o necessário para um beta fechado pequeno.
- **Servidor compartilhado do Neon Auth** — adequado para desenvolvimento inicial do Auth, mas não cobre o transporte de convites da aplicação nem representa a configuração operacional pretendida para o beta.

## Relações

- Project Design: `CAP-01`, `CAP-02`, `PR-11`, beta fechado.
- Amendment: `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md`.
- Documentos técnicos: `docs/ARCHITECTURE.md`, `docs/ENVIRONMENTS.md`, `docs/EMAIL_TRANSPORT.md`.
- Issue de decisão/implementação: `#49`.
- ADRs relacionados: `ADR-005`, `ADR-007`, `ADR-008`.

## Evidência externa

Fontes oficiais verificadas em 03/09/2026:

- Resend Pricing — https://resend.com/pricing
- Resend Send Email / Idempotency — https://resend.com/docs/api-reference/emails/send-email
- Resend Idempotency Keys — https://resend.com/docs/dashboard/emails/idempotency-keys
- Resend API Keys — https://resend.com/docs/dashboard/api-keys/introduction
- Resend Regions / Data Residency — https://resend.com/docs/dashboard/domains/regions
- Resend Domains — https://resend.com/docs/dashboard/domains/introduction
- Resend DPA — https://resend.com/legal/dpa
- Brevo Free plan limits — https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan
- Mailgun Pricing — https://www.mailgun.com/pricing/
- Amazon SES Pricing — https://aws.amazon.com/ses/pricing/
- Neon Auth email provider API — https://api-docs.neon.tech/reference/updateneonauthemailprovider

Revalidar essas fontes quando o domínio/credencial non-production for efetivamente configurado e novamente antes de Production.
