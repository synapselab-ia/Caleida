# Segurança de senha e sessões — Caleida

**Status:** contrato de `US-AUTH-007`, revalidado live por `US-AUTH-008`  
**Capacidades:** CAP-01, CAP-35  
**Provider:** Managed Better Auth / Neon Auth  
**Evidências:** `docs/US_AUTH_007_VERIFICATION.md` e `docs/US_AUTH_008_VERIFICATION.md`

## 1. Objetivo

Definir como o Caleida recupera/altera senha e permite ao usuário consultar/revogar suas próprias sessões sem duplicar credenciais, bearer tokens ou estado de autenticação.

## 2. Recuperação de senha

Fluxo oficial:

1. usuário informa o e-mail em `/forgot-password`;
2. o servidor deriva uma origem same-origin válida da requisição;
3. `requestPasswordReset()` é chamado com callback para `/reset-password`;
4. a resposta pública legítima é genérica, independentemente de o e-mail existir;
5. o provider entrega o link e valida o token;
6. `/reset-password` recebe o token somente no fluxo de recuperação e chama `resetPassword()`;
7. sucesso redireciona para `/login?reset=1`.

Regras:

- não registrar token, senha, cookie ou payload do provider;
- token inválido/expirado produz erro genérico;
- token é de uso único no comportamento upstream observado;
- limite local de senha: 8–128 caracteres;
- ausência de conta não é distinguível na UI de recuperação;
- request cross-origin forjado pode ser recusado pelo CSRF do framework antes da action; isso é comportamento desejado e não deve ser contornado.

## 3. Alteração autenticada de senha

A área `/account/security` exige a sessão privada server-side existente.

`changePassword()` recebe senha atual e nova senha com revogação das demais sessões solicitada ao provider.

A matriz live da US-AUTH-008 confirmou:

- a senha atual é exigida;
- a nova senha passa a autenticar;
- a senha anterior deixa de autenticar;
- a sessão corrente permanece;
- as demais sessões são efetivamente revogadas.

## 4. Consulta de sessões

`listSessions()` é chamado somente no servidor.

A UI recebe apenas:

- `session.id` opaco;
- indicação de sessão atual;
- criação/atualização/expiração;
- user-agent truncado como indicação de dispositivo.

A UI não recebe `session.token`, cookie, password/recovery token, connection string ou Auth URL.

## 5. Revogação

### Sessão específica

A UI envia somente `session.id`.

No servidor:

1. validar a sessão atual;
2. listar as sessões próprias;
3. exigir que o `session.id` recebido pertença ao mesmo usuário;
4. resolver `target.token` somente no servidor;
5. revogar a sessão remota por `revokeSession({ token })`.

Se o alvo for a sessão corrente, o Caleida usa `signOut()`.

### Todas as outras sessões

A RC inicial da US-AUTH-008 demonstrou que o atalho `revokeOtherSessions()` retornava sucesso sem invalidar a sessão remota nessa integração gerenciada.

Contrato corrigido:

1. listar as sessões no servidor;
2. limitar ao usuário autenticado;
3. excluir a sessão corrente;
4. revogar explicitamente cada sessão remota por `revokeSession({ token })`;
5. falhar fechado se a listagem ou qualquer revogação falhar.

O token permanece exclusivamente no servidor. A matriz final comprovou que a sessão remota perde acesso e a corrente permanece ativa.

## 6. Cache de sessão

O Caleida configura:

```text
sessionDataTtl = 1 segundo
```

O SDK rejeita TTL `<= 0`; 1 segundo é o menor valor positivo adotado.

Semântica comprovada:

- o cache assinado pode expirar rapidamente;
- após a expiração, o runtime revalida a sessão no provider;
- a revogação remota tornou-se efetiva após a janela usada pela matriz live;
- warning de cookie de dados expirado durante o gate não representou autorização stale: a leitura seguiu para revalidação autoritativa.

## 7. Reset por e-mail e sessões existentes

A implementação Better Auth possui opção upstream para revogar sessões no reset, porém essa opção não estava exposta na configuração Managed Neon observada.

A US-AUTH-008 mediu o comportamento real:

- reset válido alterou a senha;
- replay do recovery token foi rejeitado;
- senha antiga deixou de autenticar;
- nova senha autenticou;
- **sessões existentes antes do reset continuaram ativas**.

Portanto o Caleida não promete revogação automática de sessões após reset por e-mail. O usuário pode revogar sessões pela área de segurança e a mudança autenticada de senha revoga as demais explicitamente.

## 8. Auditoria e logs

US-AUTH-008 consolidou auditoria persistente em `caleida_audit.auth_security_events` usando somente metadados controlados.

Nenhum log/audit persistente pode conter senha atual/nova, token de recovery, session token, cookie, Auth URL ou secret.

## 9. Browser/live

A matriz integrada da US-AUTH-008 passou em Preview real, incluindo recovery, reset, replay, multi-sessão, revogações, password change e logout. Evidência detalhada: `docs/US_AUTH_008_VERIFICATION.md`.
