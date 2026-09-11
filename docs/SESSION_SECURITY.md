# Segurança de senha e sessões — Caleida

**Status:** contrato de `US-AUTH-007`  
**Capacidades:** CAP-01, CAP-35  
**Provider:** Managed Better Auth / Neon Auth  
**Evidência:** `docs/US_AUTH_007_VERIFICATION.md`

## 1. Objetivo

Definir como o Caleida recupera/altera senha e permite ao usuário consultar/revogar suas próprias sessões sem duplicar credenciais, bearer tokens ou estado de autenticação.

## 2. Recuperação de senha

Fluxo oficial:

1. usuário informa o e-mail em `/forgot-password`;
2. o servidor deriva uma origem same-origin válida da requisição;
3. `requestPasswordReset()` é chamado com callback para `/reset-password`;
4. a resposta pública é sempre genérica, independentemente de o e-mail existir;
5. o provider entrega o link e valida o token;
6. `/reset-password` recebe o token apenas no fluxo de recuperação e chama `resetPassword()`;
7. sucesso redireciona para `/login?reset=1`.

Regras:

- não persistir e-mail de recuperação adicional nesta Story;
- não registrar token, senha, cookie ou payload do provider;
- token inválido/expirado produz erro genérico;
- token é de uso único segundo a implementação upstream corrente;
- limite local de senha: 8–128 caracteres, sem substituir regras adicionais do provider;
- ausência de conta não é distinguível na UI de recuperação.

## 3. Alteração autenticada de senha

A área `/account/security` exige a sessão privada server-side existente.

`changePassword()` recebe:

```text
currentPassword
newPassword
revokeOtherSessions = true
```

A senha atual é exigida. Em sucesso, a sessão corrente permanece e as demais são revogadas pelo provider.

Falha do provider, senha atual incorreta ou sessão inválida não ecoam mensagens internas do Better Auth.

## 4. Consulta de sessões

`listSessions()` é chamado somente no servidor.

A UI recebe apenas:

- `session.id` opaco;
- indicação de sessão atual;
- criação/atualização/expiração;
- user-agent truncado como indicação de dispositivo.

A UI não recebe:

- `session.token`;
- cookie de sessão;
- password/recovery token;
- connection string ou Auth URL.

O IP não é exibido nesta Story para evitar superfície de PII desnecessária.

## 5. Revogação

### Sessão específica

A UI envia somente `session.id`.

No servidor:

1. a sessão atual é validada;
2. `listSessions()` recupera as sessões próprias;
3. o `session.id` recebido precisa pertencer ao mesmo `user.id` autenticado;
4. somente então o servidor resolve `target.token` internamente;
5. `revokeSession({ token })` encerra a sessão remota.

Se o alvo for a sessão corrente, o Caleida usa `signOut()` e retorna ao login.

### Todas as outras sessões

`revokeOtherSessions()` encerra as sessões do mesmo usuário exceto a corrente.

Nenhuma ação administrativa/global é usada.

## 6. Cache de sessão

A implementação upstream corrente distingue cache de dados assinado de token de sessão. O Caleida configura:

```text
sessionDataTtl = 1 segundo
```

O valor anterior era 300 segundos. O SDK rejeita TTL `<= 0`, portanto 1 segundo é o menor valor positivo adotado para reduzir a janela stale sem inventar bypass do SDK.

Semântica aprovada:

- endpoints sensíveis upstream fazem leitura autoritativa em deployment stateful;
- o boundary comum pode reutilizar o cache assinado por até aproximadamente 1 segundo;
- depois disso precisa revalidar upstream;
- revogação executada em outro dispositivo pode, portanto, levar até esse limite para refletir numa rota comum que já possua cache válido;
- isso não equivale à duração do token de sessão.

## 7. Reset por e-mail e sessões existentes

A implementação Better Auth corrente possui a opção server-side `revokeSessionsOnPasswordReset`, mas o Managed Neon Auth observado em 10/09/2026 não expõe essa chave na configuração `email_and_password` disponível ao Caleida.

Portanto:

- o Caleida não promete revogação automática de todas as sessões após reset por e-mail;
- alteração autenticada de senha revoga as demais sessões explicitamente;
- sessões existentes permanecem consultáveis/revogáveis na área de segurança;
- `US-AUTH-008` deve validar o comportamento live do reset no Managed Neon e registrar o resultado real, sem presumir uma opção não configurável.

## 8. Auditoria e logs

Nesta Story não é criado novo armazenamento de auditoria porque isso anteciparia a consolidação de `US-AUTH-008` e introduziria uma nova dependência runtime de banco sem necessidade.

Regra obrigatória desde já: nenhum log persistente pode conter senha atual/nova, token de recovery, session token, cookie, Auth URL ou secret. Eventos auditáveis de segurança serão consolidados em `US-AUTH-008` usando somente metadados mínimos não sensíveis.

## 9. Browser/live

Browser live é `SKIPPED/deferred` nesta Story conforme a política vigente.

A matriz de `US-AUTH-008` deve cobrir, em uma única release candidate quando runtime público for material:

- e-mail existente versus inexistente sem enumeração;
- link válido, inválido, expirado e reutilizado;
- login com senha antiga versus nova;
- alteração autenticada e revogação das outras sessões;
- revogação individual multi-dispositivo;
- sessão remota perdendo acesso depois da janela de cache;
- trusted origin do callback de recuperação;
- ausência de token/secret em UI/logs.
