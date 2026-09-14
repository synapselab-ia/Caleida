# Segurança de senha e sessões — Caleida

**Status:** contrato consolidado de `US-AUTH-007` + validação live de `US-AUTH-008`  
**Capacidades:** CAP-01, CAP-35  
**Provider:** Managed Better Auth / Neon Auth

## 1. Recuperação de senha

Fluxo oficial:

1. usuário informa o e-mail em `/forgot-password`;
2. o servidor deriva uma origem same-origin válida da requisição;
3. `requestPasswordReset()` é chamado com callback para `/reset-password`;
4. a resposta pública permanece genérica independentemente de a conta existir;
5. o provider entrega o link e valida o token;
6. `/reset-password` recebe o token apenas no fluxo de recovery e chama `resetPassword()`;
7. sucesso redireciona para `/login?reset=1`.

Regras:

- token inválido/expirado/reutilizado é rejeitado;
- senha, token, cookie e payload do provider não são persistidos em logs/documentação;
- ausência de conta não é distinguível na UI de recovery;
- callback só pode ser derivado de origem same-origin válida.

A matriz live da US-AUTH-008 confirmou recovery real, anti-enumeração, replay negado e bloqueio de Origin divergente pelo CSRF de Server Actions sem envio de recovery.

## 2. Alteração autenticada de senha

A área `/account/security` exige sessão privada server-side.

A alteração autenticada exige senha atual. Após sucesso, a implementação revoga explicitamente as demais sessões do mesmo usuário e preserva a sessão corrente.

Falha do provider, senha atual incorreta ou sessão inválida não ecoam mensagens internas do Better Auth.

## 3. Consulta de sessões

`listSessions()` é chamado somente no servidor.

A UI recebe apenas:

- `session.id` opaco;
- indicação de sessão atual;
- criação/atualização/expiração;
- user-agent truncado.

A UI não recebe session token, cookie, senha, recovery token, connection string ou Auth URL.

## 4. Revogação individual

A UI envia somente `session.id`.

No servidor:

1. a sessão atual é validada;
2. `listSessions()` recupera as sessões próprias;
3. o `session.id` recebido precisa pertencer ao mesmo usuário autenticado;
4. o token da sessão alvo é resolvido exclusivamente server-side;
5. `revokeSession({ token })` encerra a sessão remota.

Se o alvo for a sessão corrente, o Caleida usa `signOut()`.

A matriz live confirmou que tentativa de IDOR é negada e que sessão remota revogada perde acesso após a janela de revalidação.

## 5. Revogação de todas as outras sessões

O gate live da US-AUTH-008 demonstrou que o atalho upstream `revokeOtherSessions()` retornava sucesso sem invalidar a sessão remota na integração gerenciada observada.

A implementação canônica passou a:

1. listar sessões server-side;
2. limitar ao usuário autenticado;
3. preservar a sessão corrente;
4. revogar explicitamente cada sessão remota com `revokeSession({ token })`;
5. manter tokens exclusivamente no servidor;
6. falhar fechado se listagem ou revogação for rejeitada.

A RC final confirmou a revogação coletiva efetiva.

## 6. Cache de sessão

```text
sessionDataTtl = 1 segundo
```

O SDK rejeita TTL `<= 0`; 1 segundo é o menor valor positivo adotado.

Semântica:

- endpoints sensíveis usam leitura autoritativa;
- o boundary comum pode reutilizar cache assinado por até aproximadamente 1 segundo;
- depois disso revalida upstream;
- revogação remota pode levar até essa janela curta para refletir em uma rota comum.

## 7. Reset por e-mail e sessões existentes — comportamento medido

A implementação Better Auth possui opção upstream `revokeSessionsOnPasswordReset`, mas a configuração Managed Neon observada não expõe essa chave.

A matriz live da US-AUTH-008 mediu o comportamento real:

- reset por e-mail alterou a senha;
- a senha anterior deixou de autenticar;
- o recovery token tornou-se inutilizável após uso;
- **sessões existentes permaneceram ativas após o reset**;
- mudança autenticada de senha revogou as demais sessões e preservou a corrente.

Portanto o Caleida não promete revogação automática de sessões após reset por e-mail no provider/configuração atual.

## 8. Auditoria

US-AUTH-008 adicionou auditoria sanitizada para login, logout, recovery, reset, mudança de senha, revogação individual/coletiva e POSTs relevantes do proxy Auth.

Nenhum evento persistente pode conter senha atual/nova, OTP, recovery token, session token, cookie, Auth URL, connection string ou payload arbitrário.

## 9. Evidência

- `docs/US_AUTH_007_VERIFICATION.md`;
- `docs/US_AUTH_008_VERIFICATION.md`;
- live matrix `#13 / 34636223750` — SUCCESS;
- merge da US-AUTH-008 `84f7fecb018d6f4b6bc36817accef15f1976f05f`.
