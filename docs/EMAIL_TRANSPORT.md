# E-mail transacional — Caleida

**Status:** non-production coberto pelo provedor compartilhado do Neon Auth  
**Story:** `US-AUTH-004` / Issue `#49` / PR `#50`  
**Decisão:** `ADR-009`  
**Escopo atual:** confirmação de e-mail e recuperação de senha gerenciadas pelo Neon Auth

## 1. Decisão atual

Durante desenvolvimento e o beta fechado inicial, o Caleida usa o **provedor de e-mail compartilhado do Neon Auth**.

Readback remoto em 03/09/2026 confirmou na baseline `caleida-nonprod/main`:

```text
Auth provider: better_auth
Email provider: shared
Sender: Neon Auth <auth@mail.myneon.app>
Email/password: enabled
Require email verification: false
```

Nenhum domínio próprio, API key de e-mail ou SMTP customizado é necessário para a fase atual.

## 2. Responsabilidade do Neon Auth

Os fluxos que pertencem ao Auth devem usar o transporte já integrado ao Neon:

- confirmação/verificação de endereço de e-mail quando habilitada;
- recuperação/alteração de senha quando a Story correspondente for implementada;
- mensagens de Auth suportadas pelo serviço gerenciado.

A aplicação não implementa adapter paralelo de e-mail enquanto não existir requisito real para isso.

## 3. Confirmação de e-mail

`require_email_verification` permanece `false` em US-AUTH-004.

Essa flag só pode ser ativada quando US-AUTH-005 provar que o cadastro controlado por convite/aprovação continua fail-closed. Isso evita tornar a confirmação de e-mail um substituto incorreto para o gate de entrada.

## 4. Convites da aplicação

US-AUTH-003 modelou convites e auditoria, mas US-AUTH-004 não cria um serviço de envio de convite por e-mail.

O token de convite continua sujeito aos invariantes existentes:

- persistência digest-only;
- não consumir convite por causa de tentativa de envio;
- capacidade/validade/destinatário permanecem impostos no banco;
- nenhum secret de convite entra em logs/auditoria.

Se no futuro houver requisito de enviar convites diretamente pela aplicação, uma Story específica deverá escolher o transporte e provar idempotência/falhas antes de conectar a mutação de estado.

## 5. Quando introduzir provedor externo

SMTP/provedor próprio será avaliado somente quando houver necessidade demonstrada, por exemplo:

- domínio/remetente próprio;
- branding de e-mail;
- limites do servidor compartilhado insuficientes;
- requisitos de entregabilidade/observabilidade;
- abertura pública ou preparação de Production;
- envio transacional próprio da aplicação fora dos fluxos do Neon Auth.

A escolha futura não presume Resend. Pricing, limites, privacidade, domínio, região e segurança devem ser reavaliados no momento real da decisão.

## 6. Secrets e ambientes

No estado atual não existem variáveis `RESEND_*`, SMTP ou remetente próprio no contrato do Caleida.

Continuam server-only:

```text
NEON_AUTH_BASE_URL
NEON_AUTH_COOKIE_SECRET
```

Nenhum secret recebe `NEXT_PUBLIC_*`, entra no Git/chat ou é copiado de non-production para Production.

## 7. Verificação US-AUTH-004

A Story exige somente:

1. confirmar que Neon Auth está saudável na baseline non-production;
2. confirmar `email_provider.type=shared`;
3. confirmar email/password habilitado;
4. confirmar `require_email_verification=false` até US-AUTH-005;
5. manter provedor externo explicitamente adiado;
6. executar CI normal, sem envio externo e sem migration nova.

A evidência está em `docs/US_AUTH_004_VERIFICATION.md`.
