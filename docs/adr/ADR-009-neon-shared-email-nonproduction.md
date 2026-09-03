# ADR-009 — E-mail compartilhado do Neon Auth em non-production

**Status:** Accepted  
**Data:** 2026-09-03  
**Supersedes:** none  
**Superseded by:** none

## Contexto

O Incremento 2 precisa suportar fluxos de autenticação que dependem de e-mail, principalmente confirmação de endereço e recuperação de senha. O Caleida ainda está em desenvolvimento/non-production e será usado inicialmente por um grupo pequeno de pessoas.

O Neon Auth já possui um provedor de e-mail compartilhado no ambiente `caleida-nonprod`. O readback de 03/09/2026 confirmou na baseline `main`:

```text
Auth provider: better_auth
Email provider: shared Neon
Sender: Neon Auth
Email/password: enabled
Require email verification: false
```

Introduzir agora Resend, domínio próprio, DNS e credenciais externas acrescentaria uma dependência operacional sem requisito atual que a justifique.

## Decisão

Usar o **provedor de e-mail compartilhado do Neon Auth** como transporte canônico para os fluxos de Auth em desenvolvimento e non-production enquanto seus limites e comportamento forem adequados ao beta fechado.

Consequências operacionais:

1. US-AUTH-004 não exige domínio próprio, Resend, SMTP customizado ou API key externa;
2. confirmação e recuperação de senha devem usar os recursos do Neon Auth nas Stories que implementarem esses fluxos;
3. `require_email_verification` permanece `false` até US-AUTH-005 integrar o cadastro controlado de forma fail-closed;
4. um provedor externo de e-mail somente será selecionado quando houver requisito demonstrado, como domínio/remetente próprio, limites maiores, entregabilidade, branding ou preparação de Production;
5. a escolha futura de provedor externo exigirá nova decisão/revalidação, sem presumir Resend.

## Consequências

### Positivas

- remove dependência de domínio próprio durante desenvolvimento;
- elimina secrets e configuração SMTP desnecessários nesta fase;
- mantém Auth e transporte de e-mail sob a mesma plataforma já adotada;
- reduz operação manual e pontos de falha para o beta fechado;
- preserva a possibilidade de migrar para SMTP/provedor próprio quando necessário.

### Limitações e riscos

- o servidor compartilhado não deve ser tratado como solução definitiva de Production;
- limites, reputação, remetente e controles do provedor compartilhado pertencem ao Neon;
- antes de abertura pública/Production, volume, entregabilidade, privacidade, domínio e política de remetente precisam ser reavaliados;
- convites enviados diretamente pela aplicação, se forem necessários como e-mail próprio fora dos fluxos do Neon Auth, podem exigir transporte adicional em Story futura.

## Guardrails

- não criar dependência externa de e-mail sem requisito material;
- não armazenar secrets SMTP/API no Git, chat ou browser;
- não ativar confirmação obrigatória antes do gate de cadastro controlado de US-AUTH-005;
- não reutilizar non-production como configuração Production;
- revalidar a documentação oficial do Neon antes de depender de limites ou comportamentos específicos do serviço compartilhado.

## Alternativas consideradas

- **Resend + SMTP customizado** — tecnicamente adequado, mas exige conta externa, domínio/remetente verificado e secret sem necessidade atual; adiado.
- **Outros provedores externos** — igualmente prematuros sem requisito de domínio, volume ou entregabilidade próprio.
- **Sem e-mail** — rejeitado porque confirmação/recuperação fazem parte do Incremento 2 e o Neon Auth já fornece transporte non-production suficiente para desenvolvê-las.

## Relações

- `ADR-005` — Neon como plataforma canônica de dados e identidade.
- `ADR-008` — gates Neon-specific somente quando houver dependência real.
- `docs/EMAIL_TRANSPORT.md` — contrato operacional de e-mail.
- `US-AUTH-004` / Issue `#49` / PR `#50`.

## Evidência

Readback remoto de 03/09/2026 confirmou `email_provider.type=shared` e `require_email_verification=false` na baseline Neon `main`. Nenhum domínio próprio, SMTP customizado ou provedor externo é necessário para concluir US-AUTH-004 no escopo atual.
