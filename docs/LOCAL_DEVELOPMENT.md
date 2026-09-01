# Desenvolvimento local — Caleida

**Status:** guia canônico do ambiente local da aplicação

Este documento descreve como preparar, executar e verificar o Caleida localmente sem depender de contexto de chat e sem conectar serviços remotos.

## 1. Pré-requisitos

Use exatamente a linha de runtime definida pelo repositório:

- Node.js `24.20.0` — pinado em `.nvmrc`;
- npm `11.19.0` — declarado em `package.json`;
- Git para clonar o repositório.

Antes de instalar dependências, confirme:

```bash
node --version
npm --version
```

Resultado esperado:

```text
v24.20.0
11.19.0
```

Um gerenciador de versões que respeite `.nvmrc` pode ser usado. Se não houver um, instale diretamente o Node.js `24.20.0`.

## 2. Clone limpo e instalação

```bash
git clone https://github.com/synapselab-ia/Caleida.git
cd Caleida
npm ci
```

`npm ci` é o comando canônico de instalação porque usa `package-lock.json` sem recalcular a árvore de dependências.

Não use `npm install` apenas para contornar divergência de lockfile. Mudanças de dependência devem ser deliberadas, revisadas e versionar o lockfile correspondente.

## 3. Variáveis de ambiente

No estado atual do Incremento 0, a aplicação não exige nenhuma variável de ambiente para iniciar.

`.env.example` é o contrato versionado das variáveis que vierem a existir. Regras:

- nunca colocar secret ou credencial real em `.env.example`;
- arquivos `.env*` locais são ignorados pelo Git, com exceção de `.env.example`;
- uma variável só deve ser adicionada ao contrato quando uma Story realmente precisar dela;
- nomes com `NEXT_PUBLIC_` são públicos no browser e só podem conter valores deliberadamente públicos;
- credenciais server-side futuras não devem usar `NEXT_PUBLIC_`.

Quando uma Story futura introduzir variáveis, copie os nomes necessários de `.env.example` para o arquivo local apropriado e preencha somente no ambiente local.

## 4. Executar a aplicação

```bash
npm run dev
```

Por padrão, o Next.js inicia em:

```text
http://localhost:3000
```

Para usar outra porta quando `3000` estiver ocupada:

```bash
npm run dev -- -p 3001
```

Interrompa o servidor com `Ctrl+C`.

## 5. Gates locais

Antes de considerar uma mudança pronta para PR, execute:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Para reproduzir a instalação desde o lockfile, execute também `npm ci` em árvore limpa quando a mudança tocar dependências, runtime ou configuração de build.

## 6. Estrutura mínima relevante

```text
src/app/               App Router
public/                assets públicos versionados
tests/                 testes automatizados
.env.example           contrato seguro de variáveis
.nvmrc                 versão Node canônica
package.json            scripts/runtime/dependências
package-lock.json       resolução canônica do npm
```

A arquitetura e as decisões continuam documentadas em `docs/ARCHITECTURE.md` e `docs/adr/`.

## 7. Troubleshooting

### Node ou npm em versão diferente

Confirme `node --version` e `npm --version`. Troque para Node `24.20.0` e npm `11.19.0` antes de investigar erros do framework.

### `npm ci` falha por divergência do lockfile

Parta de uma árvore Git limpa e confirme que `package.json` e `package-lock.json` vieram do mesmo commit. Não regenere o lockfile sem uma mudança deliberada de dependências.

### Registry npm inacessível

Verifique conectividade e a configuração atual com:

```bash
npm config get registry
npm ping
```

Não versionar tokens, proxies privados ou credenciais para resolver acesso local.

### Porta 3000 ocupada

Use outra porta:

```bash
npm run dev -- -p 3001
```

### Cache local inconsistente

Pare o servidor, remova apenas os artefatos gerados (`.next/`) e execute novamente `npm run dev` ou `npm run build`. Não apague arquivos versionados para resolver cache.

## 8. Limites do ambiente local nesta fase

Este setup não provisiona nem exige:

- Neon project/branch;
- Neon Auth ou Data API;
- migrations/RLS;
- Object Storage;
- Vercel project/integration;
- Preview ou Production deployment.

Esses itens pertencem a Stories posteriores e devem seguir os ADRs e protocolos canônicos correspondentes.
