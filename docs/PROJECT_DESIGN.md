# Caleida — Project Design

**Versão:** 1.0  
**Data editorial:** 03 de agosto de 2026  
**Status:** Base aprovada para geração do backlog  
**Modelo:** Plataforma pública multiusuário, inicialmente em beta fechado  
**Stack de referência:** GitHub · Codex · Next.js · Vercel · Supabase

> Cada história muda o desenho.

---

# Controle do documento

Este documento consolida a visão final do Caleida, organiza as capacidades do produto e estabelece a forma correta de transformá-las em entregas incrementais. Ele deve ser tratado como referência de produto, não como um pedido para construir tudo de uma vez.

## Como interpretar as palavras normativas

| Termo           | Significado                                                       |
|-----------------|-------------------------------------------------------------------|
| **Deve**        | Requisito obrigatório para o escopo indicado.                     |
| **Não deve**    | Restrição ou comportamento proibido.                              |
| **Pode**        | Possibilidade permitida, mas não obrigatória no incremento atual. |
| **Futuramente** | Evolução prevista que não compõe o núcleo inicial.                |

## Regra de governança

Quando uma decisão de implementação contrariar este documento, a divergência deve ser registrada antes da alteração. O Project Design pode evoluir, mas não deve ser silenciosamente reinterpretado por uma sessão de desenvolvimento.

## Parte I

# Estratégia e definição do produto

O que o Caleida é, qual problema resolve e quais decisões orientam todo o desenvolvimento.

## 1. Resumo executivo

Caleida é uma plataforma pública de acompanhamento, organização e descoberta cultural. Ela reúne livros, mangás, manhwas, manhuas, filmes, séries e animes em um catálogo global, preservando uma experiência individual para cada usuário.

Uma obra existe uma única vez no catálogo. Cada pessoa, entretanto, pode atribuir a ela um status, registrar progresso, avaliar, escrever uma resenha, marcar como favorita, adicioná-la a coleções ou rankings e incorporá-la à própria história cultural.

O produto nasce multiusuário, mas será lançado inicialmente em **beta fechado**. Convites e aprovação administrativa permitem validar o sistema, medir custos, corrigir falhas e amadurecer moderação antes de abrir o cadastro.

**Decisão central:** O Supabase Free será utilizado como infraestrutura temporária de desenvolvimento e beta controlado. Ele não será considerado a base definitiva da abertura pública. A mudança para um plano adequado é um gate de lançamento, não um problema a ser resolvido depois.

## 2. Conceito, visão e posicionamento

### 2.1 O conceito de Caleida

O nome nasce da ideia de caleidoscópio: fragmentos que, conforme a combinação e a perspectiva, formam desenhos distintos. Cada obra representa um fragmento; preferências, memórias, períodos da vida e relações formam o desenho particular de cada usuário.

> Cada história muda o desenho.

### 2.2 Visão do produto

O Caleida deve se tornar o espaço central para registrar, preservar e compreender a relação das pessoas com obras culturais. O produto final funciona simultaneamente como catálogo, biblioteca pessoal, lista de desejos, rastreador de progresso, diário cultural, arquivo de avaliações, espaço de resenhas, criador de coleções, sistema de rankings, painel de metas, ferramenta de estatísticas, plataforma de descoberta e comunidade de interesses.

### 2.3 Problema resolvido

A organização cultural costuma ficar fragmentada entre plataformas de filmes, séries, anime, livros, planilhas, notas e redes sociais. Isso produz histórico espalhado, critérios inconsistentes, dificuldade de preservar dados e ausência de uma visão integrada da trajetória cultural.

O Caleida centraliza essa relação sem substituir os serviços onde as obras são consumidas. Ele não transmite, hospeda ou distribui conteúdo protegido; registra a experiência do usuário com a obra.

### 2.4 Objetivos do produto

- Criar contas por convite ou aprovação.
- Manter um catálogo global sem duplicatas.
- Permitir biblioteca, progresso, avaliação e resenha individuais.
- Criar coleções, rankings, diário, metas e retrospectivas.
- Oferecer descoberta e recursos sociais progressivos.
- Controlar privacidade e moderação desde a concepção.
- Exportar e preservar dados pessoais.
- Crescer sem reconstrução integral.

### 2.5 Escopo negativo

O produto não deve transmitir filmes ou séries, hospedar episódios, oferecer downloads, armazenar livros protegidos, reproduzir scans, funcionar como leitor de quadrinhos, copiar bancos externos ou depender de scraping como fonte principal.

## 3. Modelo público, beta e atores

### 3.1 Produto público com entrada controlada

O acesso restrito é uma fase de distribuição, não a identidade definitiva do produto. O cadastro poderá ocorrer por convite individual, código, aprovação, lista de espera ou criação administrativa.

### 3.2 Objetivos do beta fechado

- Validar experiência e estabilidade.
- Medir banco, armazenamento, tráfego, e-mail e processamento.
- Observar uso real e priorizar o backlog.
- Testar privacidade, moderação e suporte.
- Preparar a abertura sem depender de improvisação.

### 3.3 Público-alvo

Leitores, cinéfilos, espectadores de séries, fãs de anime e leitores de mangás, manhwas e manhuas. O sistema deve servir tanto a quem registra apenas o essencial quanto a quem acompanha detalhes e produz conteúdo.

### 3.4 Atores

| Ator          | Responsabilidade principal                                                                         |
|---------------|----------------------------------------------------------------------------------------------------|
| Visitante     | Conhecer a plataforma, solicitar acesso, utilizar convite e visualizar conteúdo público permitido. |
| Usuário       | Administrar perfil, biblioteca, progresso, conteúdo e privacidade.                                 |
| Curador       | Revisar metadados, sugestões, relações e duplicidades do catálogo.                                 |
| Moderador     | Analisar denúncias, aplicar medidas e registrar decisões.                                          |
| Administrador | Operar usuários, convites, catálogo, integrações, métricas e moderação.                            |
| Proprietário  | Controlar infraestrutura, segurança, políticas e administração superior.                           |

## 4. Princípios e taxonomia

PR-01 — **Uma obra, múltiplas experiências.** O registro global não é duplicado por usuário.

PR-02 — **Catálogo e biblioteca são entidades diferentes.**

PR-03 — **Dados pessoais pertencem ao usuário.**

PR-04 — **Sincronizações externas não apagam dados pessoais.**

PR-05 — **Obras salvas continuam disponíveis sem o provedor.**

PR-06 — **Curadoria global é controlada e auditável.**

PR-07 — **Dado manual validado prevalece sobre dado externo.**

PR-08 — **Privacidade é configurável e verificada no servidor e no banco.**

PR-09 — **A utilidade individual antecede a camada social.**

PR-10 — **Portabilidade e recuperação são requisitos do produto.**

PR-11 — **Infraestrutura deve permanecer substituível.**

PR-12 — **Custos e cotas devem ser observáveis.**

PR-13 — **Incrementos devem ser utilizáveis, não cenários de demonstração.**

### 4.1 Categorias principais

#### Livro

Romance, novela, conto, coletânea, poesia, ensaio, biografia, não ficção e outros formatos editoriais.

#### Mangá

Série, volume único, one-shot, webcomic, publicação digital ou impressa.

#### Manhwa

Série, webtoon, volume, publicação digital ou impressa.

#### Manhua

Série, webcomic, volume, edição digital ou impressa.

#### Filme

Longa, curta, documentário, especial, concerto e filme para televisão.

#### Série

Série regular, minissérie, antologia, reality, documentário seriado e programa.

#### Anime

Série de televisão, filme, OVA, ONA, especial, curta e conteúdo promocional.

## Parte II

# Arquitetura da experiência

Como o produto organiza dados, jornadas, páginas e níveis de exposição.

## 5. Modelo central do produto

### 5.1 Catálogo global

O catálogo armazena os dados gerais da obra e é compartilhado por toda a plataforma. Títulos, descrições, criadores, relações, quantidades e identificadores não devem ser replicados para cada usuário.

### 5.2 Biblioteca pessoal

A biblioteca representa a relação individual com uma obra. Status, progresso, nota, favorito, datas, resenha e observações pertencem ao usuário.

| Dado                         | Escopo global          | Escopo pessoal       |
|------------------------------|------------------------|----------------------|
| Título, ano, criadores, capa | Sim                    | Não                  |
| Status de acompanhamento     | Não                    | Sim                  |
| Progresso e datas            | Não                    | Sim                  |
| Nota e resenha               | Agregados comunitários | Autoria individual   |
| Relações entre obras         | Sim                    | Não                  |
| Favorito, coleção e ranking  | Não                    | Sim ou compartilhado |

Regra de integridadeRemover uma obra da biblioteca nunca exclui a obra do catálogo. Excluir ou mesclar uma obra global exige análise de dependências e preservação dos vínculos pessoais.

## 6. Jornada principal e arquitetura de informação

### 6.1 Jornada essencial

**Encontrar**Busca local ou externa› **Relacionar**Adicionar à biblioteca› **Registrar**Progresso, conclusão e opinião

Esse ciclo deve existir antes de recursos sociais ou análises avançadas. Ele define o primeiro produto realmente utilizável.

### 6.2 Áreas principais

- Início
- Explorar
- Pesquisa
- Catálogo
- Biblioteca
- Coleções
- Rankings
- Diário
- Metas
- Estatísticas
- Retrospectiva
- Notificações
- Perfil
- Configurações

### 6.3 Áreas administrativas

- Painel
- Usuários
- Convites
- Catálogo
- Curadoria
- Denúncias
- Moderação
- Integrações
- Consumo
- Auditoria
- Configurações

### 6.4 Estados obrigatórios de interface

Toda tela relevante deve tratar carregamento, vazio, erro, sucesso, acesso negado, conteúdo privado, serviço indisponível, conexão interrompida, conteúdo removido e confirmação de ação destrutiva.

## 7. Perfil, publicação e privacidade

O Caleida é público, mas não presume que todo registro pessoal seja público. O usuário deve poder controlar a visibilidade global e, quando necessário, a visibilidade de um conteúdo específico.

| Nível              | Aplicação                                                             |
|--------------------|-----------------------------------------------------------------------|
| Público            | Disponível a visitantes ou usuários, conforme a natureza do conteúdo. |
| Seguidores         | Disponível a pessoas que seguem a conta.                              |
| Conexões aprovadas | Disponível apenas a relações aceitas.                                 |
| Somente eu         | Disponível somente ao proprietário.                                   |

Bloqueio e silenciamento devem ser considerados em toda consulta social, não apenas na apresentação visual do perfil.

## Parte III

# Mapa de capacidades

O resultado final esperado, dividido em unidades rastreáveis de produto.

## 8. Identidade, acesso e privacidade

CAP-01

#### Contas, autenticação e sessões

Garantir identidade individual, acesso seguro e controle das sessões.

- Cadastro autorizado por convite ou aprovação.
- Login, logout, confirmação de e-mail e recuperação de senha.
- Alteração de senha, encerramento de sessões e consulta de acessos.
- Preparação para autenticação multifator sem dependência estrutural de sua ativação imediata.

****Resultado esperado:** .** Cada pessoa acessa somente sua conta e seus dados autorizados, com sessão protegida e revogável.

CAP-02

#### Convites e controle de entrada

Controlar o ingresso durante o beta fechado sem tratar o produto como aplicação privada.

- Convites únicos ou reutilizáveis, com validade, limite de uso e destinatário opcional.
- Estados: criado, enviado, utilizado, expirado, revogado e cancelado.
- Lista de espera e solicitações com aprovação, recusa, espera ou arquivamento.
- Rastreio do responsável pelo convite e da conta criada.

****Resultado esperado:** .** A administração sabe quem entrou, por qual mecanismo e sob qual autorização.

CAP-03

#### Perfis e personalização

Permitir identidade pública ou reservada dentro de um sistema visualmente coerente.

- Nome de usuário único e nome de exibição.
- Avatar, banner, biografia, cor de destaque e links permitidos.
- Categorias e obras favoritas em destaque.
- Organização modular do perfil, respeitando limites de acessibilidade e design.

****Resultado esperado:** .** Cada usuário possui presença própria sem fragmentar a identidade do Caleida.

CAP-04

#### Papéis e permissões

Separar uso comum, curadoria, moderação e administração.

- Papéis iniciais: proprietário, administrador, moderador, curador e usuário.
- Permissões verificadas no servidor e no banco.
- Ações críticas com confirmação, auditoria e escopo explícito.
- Nenhuma permissão inferida apenas pela interface.

****Resultado esperado:** .** Privilégios administrativos não podem ser obtidos por manipulação do cliente.

CAP-05

#### Privacidade, bloqueios e restrições

Oferecer controle granular sobre exposição e interação.

- Visibilidade pública, para seguidores, conexões aprovadas ou somente o próprio usuário.
- Configuração para biblioteca, progresso, avaliações, resenhas, atividade, coleções, rankings, metas, estatísticas e favoritos.
- Bloqueio, silenciamento e restrição de interação.
- Privacidade por conteúdo quando necessário, além da regra global da conta.

****Resultado esperado:** .** Conteúdo privado permanece inacessível por URL, ID, consulta ou interface alternativa.

## 9. Catálogo, busca e curadoria

CAP-06

#### Catálogo global

Manter uma fonte canônica de obras compartilhada por todos os usuários.

- Título principal, original e alternativos.
- Categoria, formato, descrição, datas, país, idioma e status.
- Criadores, pessoas, organizações, gêneros e tags.
- Capa, banner, duração, páginas, capítulos, volumes, temporadas e episódios.
- Identificadores externos e relações entre obras.

****Resultado esperado:** .** Uma obra existe uma única vez no catálogo e pode estar presente em qualquer quantidade de bibliotecas pessoais.

CAP-07

#### Pesquisa local

Priorizar o conteúdo já existente antes de consultar provedores externos.

- Busca por título, título alternativo, pessoa, organização, gênero e tag.
- Busca de usuários, coleções, rankings e resenhas quando autorizado.
- Resultados agrupados por tipo e ordenados por relevância.
- Paginação, filtros e estados de vazio ou erro.

****Resultado esperado:** .** A busca local reduz duplicatas e torna o sistema útil mesmo durante falhas externas.

CAP-08

#### Pesquisa e importação externa

Facilitar a entrada de obras sem copiar bancos completos.

- TMDB e TVmaze para filmes e séries.
- AniList e Jikan para animes.
- AniList, MangaDex e Jikan para mangás, manhwas e manhuas.
- Google Books e Open Library para livros.
- Fluxo: pesquisar, normalizar, revisar, verificar duplicidade, importar e preservar localmente.

****Resultado esperado:** .** A plataforma importa somente obras selecionadas e continua funcionando se o provedor ficar indisponível. Os provedores e suas condições devem ser revalidados antes de cada integração relevante.

CAP-09

#### Sugestões manuais e curadoria

Permitir cobertura de obras ausentes sem conceder edição global irrestrita.

- Usuários sugerem obra, correção e fonte.
- Solicitações possuem fila, estado e histórico.
- Curadores aprovam, corrigem, recusam, pedem informação ou mesclam.
- Alterações sensíveis podem exigir revisão adicional.

****Resultado esperado:** .** Obras ausentes entram no sistema por processo rastreável e revisável.

CAP-10

#### Deduplicação e mesclagem

Impedir fragmentação do catálogo e corrigir registros repetidos com segurança.

- Correspondência por identificadores externos.
- Comparação por título normalizado, título original, categoria, ano, formato e criador principal.
- Sugestão de duplicidade sem mesclagem automática por mera semelhança.
- Mesclagem preservando bibliotecas, progresso, avaliações, resenhas, listas, relações e histórico.

****Resultado esperado:** .** Nenhum dado pessoal ou vínculo comunitário é perdido ao consolidar registros.

CAP-11

#### Página da obra

Concentrar metadados, experiência pessoal e contexto comunitário.

- Cabeçalho com capa, banner, título, categoria, formato, ano e ações.
- Metadados completos e relações entre obras.
- Status, progresso, nota, favorito, datas e resenha do usuário atual.
- Média comunitária, distribuição de notas e conteúdo público conforme privacidade.
- Fontes, IDs e histórico de sincronização.

****Resultado esperado:** .** A página da obra é o principal ponto de consulta e interação do produto.

## 10. Biblioteca, expressão e memória

CAP-12

#### Biblioteca pessoal

Representar a relação individual entre usuário e obra global.

- Estados adaptados à mídia: quero ler/assistir, em andamento, pausado, concluído e abandonado.
- Datas, quantidade de conclusões, observações, nota, favorito e última atividade.
- Visualizações por mídia, status, gênero, nota, progresso e período.
- Remoção da biblioteca sem exclusão da obra global.

****Resultado esperado:** .** Cada usuário possui uma única entrada por obra e pode administrá-la independentemente.

CAP-13

#### Progresso e histórico

Registrar evolução sem perder o contexto temporal.

- Páginas, capítulos, volumes, episódios, temporadas, porcentagem e minutos.
- Histórico de cada alteração relevante.
- Proteção contra regressão quando o total externo diminui.
- Releituras e reassistidas com contagem própria.

****Resultado esperado:** .** O estado atual e a trajetória do progresso permanecem reconstruíveis.

CAP-14

#### Avaliações

Permitir opinião individual e síntese comunitária transparente.

- Escala de 0 a 10 com incrementos de 0,5.
- Uma avaliação ativa por usuário e obra, com histórico opcional.
- Média, mediana, distribuição e quantidade de votos.
- Controles contra abuso, automação e avaliações em massa.

****Resultado esperado:** .** Nota pessoal e métricas da comunidade são apresentadas como informações distintas.

CAP-15

#### Resenhas

Oferecer escrita cultural com privacidade, rascunho e proteção contra spoilers.

- Título opcional, texto, nota associada, visibilidade e estado de rascunho.
- Marcação de spoiler com revelação explícita.
- Histórico de edição e data de publicação.
- Curtidas, comentários, salvamentos e denúncias como evolução social.

****Resultado esperado:** .** O usuário escreve, revisa e publica resenhas sem perder controle sobre exposição.

CAP-16

#### Favoritos

Destacar obras de valor pessoal sem confundir preferência com avaliação.

- Marcação e remoção individual.
- Uso em perfil, filtros, estatísticas, retrospectivas e recomendações.
- Visibilidade controlada pelo usuário.

****Resultado esperado:** .** Favoritos formam uma camada afetiva própria e reutilizável.

CAP-17

#### Coleções

Permitir agrupamentos editoriais, pessoais e colaborativos.

- Coleções pessoais, públicas, privadas, colaborativas, editoriais e oficiais.
- Título, descrição, capa, tags, visibilidade e ordem manual.
- Observações por item e autoria clara.
- Interações públicas futuras sob moderação.

****Resultado esperado:** .** Usuários organizam obras por tema, intenção ou memória, sem limitar-se aos status da biblioteca.

CAP-18

#### Rankings

Representar listas em que a posição possui significado.

- Posições, empates opcionais, comentários por item e histórico de alterações.
- Rankings pessoais, públicos, privados ou oficiais.
- Comparação entre rankings e possibilidade futura de sínteses comunitárias.

****Resultado esperado:** .** A ordem é controlável, explicável e preservada.

CAP-19

#### Diário cultural e atividades

Construir uma linha do tempo da relação com obras.

- Eventos automáticos de início, progresso, pausa, conclusão, avaliação, resenha, favorito, coleção e meta.
- Entradas manuais de impressão, memória ou contexto.
- Visualização por linha do tempo, calendário, período, mídia e tipo de evento.
- Privacidade separada para atividade e notas pessoais.

****Resultado esperado:** .** A trajetória cultural pode ser consultada cronologicamente e alimentar outras capacidades.

CAP-20

#### Metas

Transformar hábitos em objetivos mensuráveis.

- Metas mensais, anuais, personalizadas e permanentes.
- Objetivos por quantidade, mídia, gênero, páginas, capítulos, episódios, tempo, autores ou países.
- Progresso automático quando os dados permitem e ajuste manual controlado.
- Visibilidade pública ou privada.

****Resultado esperado:** .** O usuário acompanha objetivos com cálculo consistente e histórico.

CAP-21

#### Estatísticas

Converter registros em compreensão dos hábitos culturais.

- Totais de obras, páginas, capítulos, episódios, temporadas, filmes e tempo.
- Preferências por gênero, criador, país, idioma, década e formato.
- Atividade diária, mensal e anual, sequência e períodos de pausa.
- Gráficos somente quando respondem a uma pergunta concreta.

****Resultado esperado:** .** As estatísticas são auditáveis, baseadas em dados reais e não decorativas.

CAP-22

#### Retrospectivas

Criar sínteses editoriais de períodos concluídos.

- Primeira e última obra, maior nota, gênero dominante, criadores recorrentes e mês mais ativo.
- Totais e sequências.
- Destaques escolhidos manualmente: surpresa, decepção, descoberta e experiência marcante.
- Exportação visual como evolução futura.

****Resultado esperado:** .** A retrospectiva combina dados e curadoria pessoal em narrativa legível.

## 11. Relações, descoberta e comunidade

CAP-23

#### Relações entre obras

Permitir navegação por adaptações, franquias e versões.

- Adaptação, obra original, sequência, prequela, continuação e spin-off.
- Remake, reboot, edição, temporada, universo compartilhado e versão alternativa.
- Relações importadas, sugeridas ou validadas por curadoria.

****Resultado esperado:** .** Usuários compreendem como as obras se conectam sem depender de pesquisa externa.

CAP-24

#### Pessoas e organizações

Representar quem cria, publica, produz ou distribui obras.

- Autores, artistas, diretores, roteiristas, atores, tradutores e produtores.
- Editoras, estúdios, produtoras, distribuidoras e selos.
- Páginas relacionais com obras, funções e métricas locais.

****Resultado esperado:** .** O catálogo permite descoberta por criadores e entidades, não apenas por títulos.

CAP-25

#### Descoberta e recomendações

Ajudar usuários a encontrar novas obras com critérios compreensíveis.

- Gêneros, tags, tendências, lançamentos, coleções, rankings e relações.
- Preferências pessoais e usuários com gostos semelhantes.
- Curadoria editorial e conteúdos oficiais.
- Explicação da razão da recomendação quando possível.

****Resultado esperado:** .** A descoberta complementa a organização sem criar dependência de algoritmo opaco.

CAP-26

#### Recursos sociais

Adicionar relações comunitárias de forma progressiva.

- Seguir usuários, feed, curtidas, comentários, recomendações e salvamentos.
- Compartilhamentos internos com regras de privacidade.
- Bloqueio, silenciamento e moderação integrados.
- A camada social entra somente depois do núcleo individual estável.

****Resultado esperado:** .** Interações ampliam valor sem transformar o produto em rede social genérica.

CAP-27

#### Notificações

Informar eventos importantes sem criar ruído.

- Convites, segurança, seguidores, curtidas, comentários, recomendações, metas, moderação e administração.
- Canais e frequência configuráveis.
- Alertas essenciais de segurança não completamente desativáveis.
- Agrupamento e limpeza para evitar excesso.

****Resultado esperado:** .** O usuário recebe informação acionável e controla o volume não essencial.

CAP-28

#### Moderação

Proteger a comunidade e registrar decisões de forma responsável.

- Denúncias de perfil, avatar, biografia, resenha, comentário, coleção, ranking, imagem, spam e comportamento.
- Advertência, ocultação, remoção, limitação, suspensão, banimento e rejeição.
- Motivo, evidência, moderador, data e possibilidade de recurso.
- Separação entre moderação de conteúdo e curadoria de catálogo.

****Resultado esperado:** .** A plataforma possui resposta rastreável a abuso antes de ampliar o acesso.

## 12. Operação, arquivos e continuidade

CAP-29

#### Administração

Oferecer operação central sem misturar controles administrativos à experiência comum.

- Usuários, convites, papéis, catálogo, curadoria, denúncias e integrações.
- Métricas operacionais, falhas, consumo e configurações.
- Ações críticas com confirmação e auditoria.

****Resultado esperado:** .** A equipe administra a plataforma com contexto, limites e histórico.

CAP-30

#### Imagens e arquivos

Gerenciar mídia própria com segurança e custo previsível.

- Avatares, banners, capas personalizadas, capas de coleção e ranking, exportações e backups.
- Validação de tipo, tamanho, dimensão, nome, autorização e moderação.
- Compressão, remoção de metadados e limpeza de órfãos.
- Capas externas mantidas por URL quando os termos permitirem.

****Resultado esperado:** .** O armazenamento próprio é reservado ao conteúdo necessário e controlado.

CAP-31

#### Sincronização e cache

Atualizar metadados externos sem sobrescrever curadoria ou dados pessoais.

- Comparação entre valor local e externo.
- Prévia de mudanças relevantes.
- Cache normalizado com expiração e limpeza.
- Timeout, retry limitado, fallback e registro de falhas.

****Resultado esperado:** .** Integrações reduzem trabalho manual sem se tornarem ponto único de falha.

CAP-32

#### Importação, exportação e portabilidade

Garantir controle do usuário sobre seu histórico.

- Exportação de biblioteca, progresso, avaliações, resenhas, coleções, rankings, diário, metas e configurações.
- Formatos JSON, CSV e backup próprio documentado.
- Importação com validação, prévia, conflitos e confirmação.
- Integração futura com exportações de outras plataformas.

****Resultado esperado:** .** O usuário consegue sair, migrar ou preservar seus dados em formato compreensível.

CAP-33

#### Desativação e exclusão de conta

Tratar encerramento de conta com clareza e reversibilidade limitada.

- Desativação, solicitação de exclusão e período de cancelamento.
- Explicação do que será removido, anonimizado ou preservado por obrigação.
- Exportação oferecida antes da exclusão.
- Remoção de arquivos e revogação de sessões.

****Resultado esperado:** .** O encerramento não é oculto, instantaneamente destrutivo ou ambíguo.

CAP-34

#### Backup e recuperação

Preservar banco e arquivos fora do ambiente principal.

- Migrations versionadas, dumps lógicos, cópia de objetos e retenção.
- Criptografia, armazenamento externo e controle de acesso.
- Teste periódico de restauração.
- Procedimento de incidente e recuperação documentado.

****Resultado esperado:** .** Backups são comprovadamente restauráveis, não apenas arquivos produzidos.

CAP-35

#### Auditoria

Registrar eventos críticos com retenção proporcional.

- Login sensível, mudança de função, convite, suspensão, exclusão, importação, sincronização, moderação, mesclagem e restauração.
- Sem senhas, tokens, segredos ou payloads desnecessários.
- Retenção maior para segurança; curta para depuração transitória.

****Resultado esperado:** .** Ações críticas podem ser investigadas sem inflar o banco com dados inúteis.

CAP-36

#### Monitoramento de consumo

Tornar custos e limites operacionais visíveis antes de causarem indisponibilidade.

- Tamanho do banco e índices.
- Storage, egress padrão e em cache.
- Usuários ativos, Realtime, funções e falhas de e-mail.
- Crescimento semanal e mensal, alertas internos e tendência de esgotamento.

****Resultado esperado:** .** A administração sabe quando otimizar, limitar expansão ou migrar de plano.

## Parte IV

# Arquitetura técnica e política do plano gratuito

Como desenvolver com baixo custo sem confundir validação temporária com infraestrutura definitiva.

## 13. Stack e fluxo de desenvolvimento

### 13.1 Arquitetura de referência

| Camada                    | Tecnologia                     | Papel                                                                         |
|---------------------------|--------------------------------|-------------------------------------------------------------------------------|
| Código e backlog          | GitHub                         | Repositório privado, Issues, branches, pull requests, Actions e documentação. |
| Desenvolvimento assistido | Codex                          | Implementar uma Story delimitada, testar, revisar diff e abrir PR.            |
| Aplicação                 | Next.js + React + TypeScript   | Interface, rotas server-side, integrações e composição do produto.            |
| Interface                 | Tailwind CSS + tokens próprios | Design system, temas, responsividade e consistência.                          |
| Deploy                    | Vercel                         | Produção e Preview Deployments por branch ou PR.                              |
| Dados                     | Supabase Postgres              | Banco relacional, constraints, índices e RLS.                                 |
| Identidade                | Supabase Auth                  | Cadastro, login, sessão e recuperação.                                        |
| Arquivos                  | Supabase Storage               | Avatares, banners e conteúdo próprio controlado.                              |

### 13.2 Fluxo por User Story

1

#### Issue refinada

A Story contém critérios, dependências, impacto no banco e limites de escopo.

2

#### Branch dedicada

O Codex trabalha sem alterar diretamente a branch principal.

3

#### Implementação vertical

Interface, regra, persistência, autorização e testes são entregues em conjunto quando aplicável.

4

#### Pull request e Preview

A Vercel gera URL única para revisão das mudanças em PRs e branches não produtivas.\[S8\]

5

#### Validação e merge

Critérios, testes, build, segurança e interface são revisados antes da promoção.

## 14. Papel e limites do Supabase Free

O Supabase Free é adequado para desenvolvimento, homologação e beta fechado controlado. Ele não deve ser tratado como promessa de operação pública sem custo.

| Recurso             | Limite atual                                         | Implicação para o Caleida                                                                |
|---------------------|------------------------------------------------------|------------------------------------------------------------------------------------------|
| Projetos ativos     | 2                                                    | Staging e Production ocupam os dois projetos hospedados; desenvolvimento deve ser local. |
| Banco               | 500 MB por projeto                                   | Evitar payloads brutos, cache permanente, logs volumosos e índices redundantes.          |
| Computação          | CPU compartilhada e 500 MB de RAM                    | Consultas, estatísticas e concorrência precisam ser medidas.                             |
| Auth                | 50.000 MAU                                           | Não significa que banco, tráfego e processamento suportem 50 mil usuários intensos.      |
| Storage             | 1 GB                                                 | Reservar para conteúdo próprio; não copiar todas as capas externas.                      |
| Egress              | 5 GB padrão + 5 GB em cache                          | Cotas independentes; paginação, cache e respostas enxutas são obrigatórios.              |
| Realtime            | 200 conexões simultâneas; 2 milhões de mensagens/mês | Usar somente onde agrega valor real.                                                     |
| Edge Functions      | 500.000 invocações/mês                               | Preferir rotas server-side do Next.js quando forem mais simples e portáveis.             |
| Arquivo individual  | até 50 MB                                            | O Caleida imporá limites internos muito menores.                                         |
| Logs                | retenção curta                                       | Auditoria própria compacta para eventos relevantes.                                      |
| Branching           | não incluído                                         | Não há banco isolado por PR no plano Free.                                               |
| Backups gerenciados | não incluídos no Free                                | Dumps e cópias externas são obrigatórios.                                                |
| Inatividade         | pausa após baixa atividade por 7 dias                | Não há garantia de disponibilidade contínua.                                             |

Fonte principal: página oficial de preços e documentação do Supabase, verificadas em 03/08/2026.\[S1\]\[S2\]\[S5\]

Leitura correta do limite de Auth“50.000 usuários ativos mensais” é uma cota específica do Auth. Não é uma declaração de que o plano gratuito suporta gratuitamente uma comunidade de 50 mil pessoas com uso intenso.

## 15. Ambientes, migrations, RLS e e-mail

### 15.1 Estratégia de ambientes

**Local**Supabase CLI + dados de teste› **Staging**Previews e homologação› **Production**Beta real

O Free oferece dois projetos ativos; portanto, Staging e Production ocupam os projetos hospedados. O desenvolvimento local não consome essa cota.

### 15.2 Previews e alterações de banco

A Vercel cria previews automaticamente, mas o Supabase Branching, que fornece ambiente isolado por pull request, exige plano Pro.\[S7\]\[S8\] Enquanto o projeto permanecer no Free, mudanças estruturais devem ser testadas localmente, promovidas para staging de forma coordenada e só então aplicadas em produção.

### 15.3 Migrations

Toda alteração estrutural deve existir em supabase/migrations. Nenhuma mudança importante pode existir apenas no painel. A Story deve entregar migration, constraints, índices, RLS, testes e instrução de recuperação.

### 15.4 Row Level Security

RLS é obrigatória em tabelas expostas. O Supabase determina que tabelas em schemas expostos, como public, devem possuir RLS e privilégios mínimos.\[S6\]

Perguntas obrigatórias para cada tabelaQuem lê? Quem insere? Quem atualiza? Quem exclui? Quais papéis administrativos possuem exceção? Como cada política será testada?

### 15.5 Auth e SMTP

O serviço de e-mail embutido do Supabase é destinado a testes, possui limite atual de dois e-mails por hora e não oferece SLA. Um SMTP próprio é obrigatório antes de convidar usuários externos.\[S3\]\[S4\]

## 16. Uso eficiente de banco, arquivos e tráfego

### 16.1 Banco de 500 MB

Não armazenar cópia integral de APIs, payloads brutos permanentes, cache sem expiração, logs extensos ou dados duplicados. Priorizar modelo relacional, identificadores externos, paginação, limpeza e índices baseados em consultas reais.

### 16.2 Storage de 1 GB

Capas externas devem permanecer por URL quando os termos permitirem. O Storage é reservado para avatares, banners, imagens personalizadas, capas próprias, exportações temporárias e arquivos essenciais.

| Tipo                       | Limite interno inicial sugerido |
|----------------------------|---------------------------------|
| Avatar                     | 1 MB                            |
| Banner                     | 2 MB                            |
| Capa personalizada         | 2 MB                            |
| Capa de coleção ou ranking | 2 MB                            |

### 16.3 Egress

Feeds, bibliotecas e catálogos devem usar paginação, seleção de colunas, cache, compressão e carregamento progressivo. Egress em cache e não armazenado em cache são cotas independentes.\[S9\]

### 16.4 Realtime

Não será padrão para todas as páginas. Notificações e colaboração específica podem justificar Realtime; feeds, estatísticas e listagens devem preferir revalidação e refetch controlado.

### 16.5 Funções server-side

Integrações externas e operações com segredo devem ocorrer em código server-side do Next.js ou, quando houver razão técnica clara, em Edge Functions. A escolha deve considerar portabilidade e custo.

### 16.6 Backups

Projetos Free devem realizar exportações regulares por CLI e manter backups externos.\[S5\]\[S10\] Banco e objetos do Storage exigem rotinas separadas.

| Proteção             | Frequência inicial do beta                      |
|----------------------|-------------------------------------------------|
| Migrations           | Em toda alteração estrutural.                   |
| Dump lógico          | Diário ou antes de mudança crítica.             |
| Cópia de arquivos    | Periódica, com verificação de objetos ausentes. |
| Teste de restauração | Mensal e antes da abertura pública.             |

### 16.7 Pausa e disponibilidade

Projetos Free com baixa atividade podem ser pausados após sete dias. Projetos pagos não sofrem pausa automática por inatividade.\[S2\] O beta deve tratar indisponibilidade e possuir procedimento de reativação, sem gerar tráfego artificial para contornar a política.

## 17. Monitoramento e migração de plano

### 17.1 Limites internos

#### 50% — Informativo

Registrar tendência e revisar crescimento.

#### 70% — **Atenção:** 

Otimizar, limpar transitórios e preparar orçamento.

#### 85% — Crítico

Congelar expansões de alto consumo e migrar antes de restrições.

Esses percentuais são políticas internas do Caleida, não limites adicionais do Supabase.

### 17.2 Gatilhos obrigatórios de migração

- Decisão de abrir cadastro público.
- Necessidade de disponibilidade contínua.
- Necessidade de backups gerenciados ou branching por PR.
- Banco, arquivos ou egress próximos do limite interno.
- Pausas afetando usuários.
- Retenção de logs insuficiente.
- Desempenho inadequado ou aumento relevante de concorrência.
- Operação própria de backup tornando-se arriscada.

Gate de abertura públicaO cadastro público não deve ser aberto enquanto a operação depender do Supabase Free. O orçamento deve incluir Supabase pago, domínio, SMTP, possíveis custos da Vercel, monitoramento e backup externo. Parte V

# Backlog incremental

Como transformar o produto completo em trabalho pequeno, rastreável e verificável.

## 18. Mapa de épicos

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>Épico</th>
<th>Escopo</th>
<th>Capacidades</th>
<th>Resultado</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td class="nowrap"><strong>EPIC-00</strong></td>
<td><strong>Fundação técnica</strong><br />
Repositório, Next.js, Supabase local, migrations, CI, testes e documentação.</td>
<td>Base de todas as capacidades.</td>
<td>Projeto executável, testável e implantável.</td>
</tr>
<tr class="even">
<td class="nowrap"><strong>EPIC-01</strong></td>
<td><strong>Identidade e design system</strong><br />
Marca, tokens, temas, componentes, responsividade e acessibilidade.</td>
<td>Transversal.</td>
<td>Interface coerente antes da expansão funcional.</td>
</tr>
<tr class="odd">
<td class="nowrap"><strong>EPIC-02</strong></td>
<td><strong>Contas e autenticação</strong><br />
Convites, cadastro, login, sessão, SMTP, papéis e auditoria básica.</td>
<td>CAP-01, 02, 04, 35.</td>
<td>Acesso individual seguro e controlado.</td>
</tr>
<tr class="even">
<td class="nowrap"><strong>EPIC-03</strong></td>
<td><strong>Perfis e privacidade</strong><br />
Perfil, visibilidade, bloqueio e ciclo de conta.</td>
<td>CAP-03, 05, 33.</td>
<td>Identidade e exposição sob controle do usuário.</td>
</tr>
<tr class="odd">
<td class="nowrap"><strong>EPIC-04</strong></td>
<td><strong>Catálogo global</strong><br />
Obras, curadoria, deduplicação, relações e pessoas.</td>
<td>CAP-06, 09, 10, 23, 24.</td>
<td>Fonte canônica compartilhada.</td>
</tr>
<tr class="even">
<td class="nowrap"><strong>EPIC-05</strong></td>
<td><strong>Pesquisa e integrações</strong><br />
Busca local, provedores, normalização, cache e sincronização.</td>
<td>CAP-07, 08, 31.</td>
<td>Entrada eficiente de obras sem dependência absoluta.</td>
</tr>
<tr class="odd">
<td class="nowrap"><strong>EPIC-06</strong></td>
<td><strong>Página da obra</strong><br />
Composição central de metadados, experiência e comunidade.</td>
<td>CAP-11.</td>
<td>Ponto único de interação com a obra.</td>
</tr>
<tr class="even">
<td class="nowrap"><strong>EPIC-07</strong></td>
<td><strong>Biblioteca e progresso</strong><br />
Status, progresso, histórico e favoritos.</td>
<td>CAP-12, 13, 16, parte da 19.</td>
<td>Primeiro ciclo cultural completo.</td>
</tr>
<tr class="odd">
<td class="nowrap"><strong>EPIC-08</strong></td>
<td><strong>Avaliações e resenhas</strong><br />
Notas, spoilers, rascunhos, publicação e métricas.</td>
<td>CAP-14, 15.</td>
<td>Expressão pessoal estruturada.</td>
</tr>
<tr class="even">
<td class="nowrap"><strong>EPIC-09</strong></td>
<td><strong>Coleções e rankings</strong><br />
Listas temáticas e ordenadas.</td>
<td>CAP-17, 18.</td>
<td>Organização editorial do acervo.</td>
</tr>
<tr class="odd">
<td class="nowrap"><strong>EPIC-10</strong></td>
<td><strong>Diário e atividades</strong><br />
Linha do tempo automática e manual.</td>
<td>CAP-19.</td>
<td>Memória cultural cronológica.</td>
</tr>
<tr class="even">
<td class="nowrap"><strong>EPIC-11</strong></td>
<td><strong>Metas, estatísticas e retrospectivas</strong><br />
Objetivos, métricas e sínteses editoriais.</td>
<td>CAP-20, 21, 22.</td>
<td>Autoconhecimento baseado em dados.</td>
</tr>
<tr class="odd">
<td class="nowrap"><strong>EPIC-12</strong></td>
<td><strong>Descoberta</strong><br />
Tendências, curadoria e recomendações explicáveis.</td>
<td>CAP-25.</td>
<td>Novas obras encontradas com contexto.</td>
</tr>
<tr class="even">
<td class="nowrap"><strong>EPIC-13</strong></td>
<td><strong>Comunidade</strong><br />
Seguidores, feed, interações e notificações sociais.</td>
<td>CAP-26, 27.</td>
<td>Camada social posterior ao núcleo.</td>
</tr>
<tr class="odd">
<td class="nowrap"><strong>EPIC-14</strong></td>
<td><strong>Moderação</strong><br />
Denúncias, decisões, sanções e recursos.</td>
<td>CAP-28, parte da 35.</td>
<td>Operação comunitária segura.</td>
</tr>
<tr class="even">
<td class="nowrap"><strong>EPIC-15</strong></td>
<td><strong>Administração e consumo</strong><br />
Operação, integrações, métricas e limites.</td>
<td>CAP-29, 35, 36.</td>
<td>Controle operacional e financeiro.</td>
</tr>
<tr class="odd">
<td class="nowrap"><strong>EPIC-16</strong></td>
<td><strong>Arquivos e imagens</strong><br />
Uploads, quotas, compressão e limpeza.</td>
<td>CAP-30.</td>
<td>Storage seguro e previsível.</td>
</tr>
<tr class="even">
<td class="nowrap"><strong>EPIC-17</strong></td>
<td><strong>Dados e recuperação</strong><br />
Exportação, exclusão, backup e restauração.</td>
<td>CAP-32, 33, 34.</td>
<td>Portabilidade e continuidade.</td>
</tr>
<tr class="odd">
<td class="nowrap"><strong>EPIC-18</strong></td>
<td><strong>Preparação para abertura</strong><br />
Carga, custos, infraestrutura paga, políticas, suporte e auditoria.</td>
<td>Todos os NFRs.</td>
<td>Abertura pública sem reconstrução emergencial.</td>
</tr>
</tbody>
</table>

## 19. Incrementos do produto

0

#### Fundação executável

**Objetivo.** Criar uma base técnica confiável.

**Inclui.** Repositório, aplicação, Supabase local, migrations, CI, testes, documentação e design system inicial.

**Ciclo entregue.** Instalar -\> executar -\> testar -\> gerar build -\> publicar uma base vazia.

**Porta de saída.** Todos os comandos passam e a arquitetura está documentada.

1

#### Acesso controlado

**Objetivo.** Permitir entrada segura de usuários autorizados.

**Inclui.** Convites, cadastro, login, SMTP próprio, perfil, sessão, papéis, RLS e auditoria básica.

**Ciclo entregue.** Receber convite -\> criar conta -\> confirmar -\> entrar -\> acessar somente os próprios dados.

**Porta de saída.** Isolamento testado; nenhum usuário externo é convidado antes disso.

2

#### Núcleo cultural

**Objetivo.** Entregar o primeiro ciclo real de valor.

**Inclui.** Catálogo manual controlado, pesquisa local, página da obra, biblioteca, progresso e favoritos.

**Ciclo entregue.** Entrar -\> encontrar obra -\> adicionar -\> atualizar -\> concluir.

**Porta de saída.** O ciclo funciona com persistência real, celular e desktop.

3

#### Integrações externas

**Objetivo.** Reduzir cadastro manual sem copiar bases completas.

**Inclui.** TMDB, Google Books, Open Library, AniList, MangaDex, fallbacks, cache, deduplicação e sincronização.

**Ciclo entregue.** Pesquisar externamente -\> revisar -\> importar -\> usar localmente.

**Porta de saída.** Falha do provedor não afeta obras já salvas.

4

#### Expressão pessoal

**Objetivo.** Permitir opinião e organização editorial.

**Inclui.** Avaliações, resenhas, spoilers, coleções e rankings.

**Ciclo entregue.** Concluir -\> avaliar -\> resenhar -\> organizar.

**Porta de saída.** Privacidade e edição funcionam de ponta a ponta.

5

#### Memória e análise

**Objetivo.** Transformar registros em trajetória e compreensão.

**Inclui.** Diário, atividades, metas, estatísticas e retrospectivas.

**Ciclo entregue.** Registrar ao longo do tempo -\> consultar -\> analisar.

**Porta de saída.** Métricas usam dados verificáveis e não mocks.

6

#### Beta fechado operacional

**Objetivo.** Tornar o produto seguro para um grupo real controlado.

**Inclui.** Privacidade completa, administração, moderação essencial, monitoramento de cotas, exportação, backup, restauração, notificações essenciais e hardening.

**Ciclo entregue.** Convidar -\> operar -\> monitorar -\> recuperar.

**Porta de saída.** Gate de beta atendido e capacidade registrada.

7

#### Comunidade

**Objetivo.** Adicionar relações sociais sem enfraquecer a utilidade individual.

**Inclui.** Seguir, feed, curtidas, comentários, recomendações, bloqueio e silenciamento.

**Ciclo entregue.** Descobrir pessoa -\> seguir -\> interagir com conteúdo permitido.

**Porta de saída.** Moderação e privacidade acompanham cada interação.

8

#### Descoberta avançada

**Objetivo.** Ajudar usuários a encontrar novas obras com transparência.

**Inclui.** Tendências, curadoria, recomendações, gostos semelhantes e conteúdo editorial.

**Ciclo entregue.** Explorar -\> compreender a recomendação -\> adicionar à biblioteca.

**Porta de saída.** Recomendação não depende de coleta opaca ou excessiva.

9

#### Preparação para abertura pública

**Objetivo.** Remover dependências operacionais do Free e ampliar capacidade.

**Inclui.** Plano adequado, carga, backups gerenciados ou equivalentes, SMTP dimensionado, suporte, moderação ampliada, termos e segurança.

**Ciclo entregue.** Simular crescimento -\> corrigir gargalos -\> abrir cadastro.

**Porta de saída.** Todos os critérios de abertura pública atendidos.

## 20. User Stories e rastreabilidade

### 20.1 Estrutura obrigatória

### US-LIB-001 — Adicionar obra à biblioteca

Épico: EPIC-07Capacidade: CAP-12Prioridade: P0

**Narrativa.** Como usuário autenticado, quero adicionar uma obra do catálogo à minha biblioteca para registrar meu interesse e acompanhar meu progresso.

**Critérios de aceite.**

1.  A obra deve existir no catálogo global.
2.  O usuário deve escolher um status inicial.
3.  A mesma obra não pode gerar duas entradas para o mesmo usuário.
4.  A privacidade da biblioteca deve ser respeitada.
5.  A operação deve persistir e gerar atividade quando aplicável.
6.  A autorização deve ser testada.

### 20.2 Campos mínimos

- Identificador e título.
- Épico, capacidade, incremento e prioridade.
- Ator, narrativa e contexto.
- Critérios de aceite observáveis.
- Dependências e fora do escopo.
- Impacto no banco, RLS, Storage, egress, Realtime, e-mail e backup.
- Testes obrigatórios e evidência de conclusão.

### 20.3 Prioridades

| Prioridade | Uso                                                       |
|------------|-----------------------------------------------------------|
| P0         | Núcleo sem o qual o produto não funciona ou não é seguro. |
| P1         | Obrigatório antes de convidar usuários reais para o beta. |
| P2         | Amplia significativamente a proposta central.             |
| P3         | Expansão social e descoberta.                             |
| P4         | Evolução futura.                                          |

### 20.4 Definition of Ready

- Ator, narrativa e contexto definidos.
- Capacidade, épico, incremento e prioridade identificados.
- Critérios de aceite verificáveis.
- Dependências e fora do escopo explícitos.
- Autorização, dados e cotas avaliados.
- Estratégia de teste e referência visual quando aplicável.

### 20.5 Definition of Done

- Comportamento implementado e critérios atendidos.
- Validação server-side e RLS testadas.
- Migration e índices incluídos quando necessários.
- Lint, typecheck, testes e build aprovados.
- Loading, vazio, erro e sucesso tratados.
- Celular, desktop e acessibilidade verificados.
- Documentação e status atualizados.
- Impacto nas cotas considerado.
- Nenhum botão ou fluxo falso.

### 20.6 Matriz de rastreabilidade

> Visão → capacidade → épico → incremento → User Story → critérios → testes → pull request → commit.

Essa cadeia impede trabalho duplicado, funcionalidades esquecidas e declarações de conclusão sem evidência.

## Parte VI

# Identidade visual e linguagem

Como o Caleida deve parecer, se mover e se comunicar.

## 21. Personalidade visual

O produto deve parecer cultural, íntimo, sofisticado, organizado, tecnológico, levemente lúdico e autoral. A interface combina biblioteca pessoal, diário cultural, catálogo visual, plataforma editorial e comunidade.

Deve evitar painel empresarial genérico, site de scans, loja, cassino, interface infantil, cópia de streaming e rede social indiferenciada.

## 22. Marca e logotipo

O logotipo utiliza uma letra C fragmentada e uma referência abstrata a caleidoscópio. Deve existir em versão horizontal, reduzida, clara, escura, símbolo isolado, favicon e ícone de aplicação.

## 23. Paleta

**Violeta**  
\#7457E8 **Magenta**  
\#D85BA8 **Azul**  
\#4C8DFF **Verde**  
\#39B99A **Âmbar**  
\#F2A93B

### 23.1 Tema escuro

Fundo \#101014, superfícies \#17171D e \#202028, borda \#30303A, texto principal \#F5F4F8.

### 23.2 Tema claro

Fundo \#F7F6FA, superfície branca, borda \#E4E1EA, texto principal \#24212A.

## 24. Tipografia e composição

**Manrope** é a referência para interface; **Newsreader**, para resenhas, citações e retrospectivas. Em implementação, fontes equivalentes podem ser usadas provisoriamente, mas a decisão deve ser registrada.

Fragmentos, losangos, triângulos, círculos incompletos, recortes e gradientes pontuais funcionam como assinatura. Capas e conteúdo permanecem protagonistas.

## 25. Cores de categoria

Livro: âmbar; Mangá: magenta; Manhwa: violeta; Manhua: coral; Filme: azul; Série: ciano; Anime: verde-azulado. A cor nunca deve ser o único identificador.

## 26. Movimento e tom de voz

Animações devem ser discretas, funcionais, reduzíveis e nunca atrasar tarefas. A linguagem deve ser clara, humana, cultural e direta.

| Evitar                       | Preferir                                   |
|------------------------------|--------------------------------------------|
| Item cadastrado com sucesso. | Obra adicionada à sua biblioteca.          |
| Nenhum registro encontrado.  | Nenhuma obra encontrada com esses filtros. |
| Conteúdo concluído.          | Você concluiu esta obra.                   |

## Parte VII

# Qualidade e portas de lançamento

Requisitos transversais e condições que impedem lançamentos prematuros.

## 27. Requisitos não funcionais

| ID     | Requisito           | Resultado mínimo                                                                   |
|--------|---------------------|------------------------------------------------------------------------------------|
| NFR-01 | Responsividade      | Celular, tablet, notebook e desktop sem rolagem indevida ou dependência de hover.  |
| NFR-02 | Acessibilidade      | Objetivo WCAG 2.2 AA, teclado, foco, contraste, labels e redução de movimento.     |
| NFR-03 | Segurança           | Auth, RLS, autorização, rate limiting, validação, secrets e auditoria.             |
| NFR-04 | Privacidade         | Impossibilidade de acessar dados privados por IDs, URLs ou consultas alternativas. |
| NFR-05 | Desempenho          | Paginação, cache, índices, lazy loading e consultas enxutas.                       |
| NFR-06 | Resiliência         | Falhas externas não inutilizam dados já salvos.                                    |
| NFR-07 | Observabilidade     | Erros, consumo, sincronizações e ações críticas rastreáveis.                       |
| NFR-08 | Portabilidade       | Exportação documentada e legível.                                                  |
| NFR-09 | Manutenibilidade    | Domínios separados e documentação no repositório.                                  |
| NFR-10 | Integridade         | Migrations, constraints e testes de recuperação.                                   |
| NFR-11 | Eficiência de custo | Impacto em banco, Storage, egress, e-mail e Realtime considerado por Story.        |
| NFR-12 | Recuperação         | Procedimento de restauração testado.                                               |

## 28. Gate do beta fechado

- Convites e SMTP próprio funcionam.
- Isolamento, RLS e autorização foram testados.
- Backup e restauração foram executados com sucesso.
- Staging e Production estão separados.
- Monitoramento de cotas e alertas internos existem.
- Moderação essencial e política de privacidade estão disponíveis.
- Versão móvel é utilizável.
- Não existem erros críticos ou fluxos falsos.

## 29. Gate da abertura pública

- Infraestrutura deixou de depender operacionalmente do Supabase Free.
- Capacidade e custos foram revisados.
- Backups gerenciados ou equivalentes estão ativos.
- SMTP e moderação suportam o volume esperado.
- Testes de carga e auditoria de segurança foram concluídos.
- Termos, privacidade, suporte e resposta a incidentes estão consolidados.
- Alertas e limites de gasto foram definidos.

## 30. Critério de produto completo

O Caleida somente pode ser considerado completo quando contas, catálogo, bibliotecas, privacidade, busca, integrações, progresso, avaliações, resenhas, coleções, rankings, diário, metas, estatísticas, administração, moderação, exportação, backup, responsividade e identidade visual funcionarem sem erros críticos conhecidos.

## Parte VIII

# Como usar este documento

Procedimento operacional para transformar o Project Design em software sem perder contexto.

## 31. O papel deste PDF

Este documento define o **resultado final e as regras permanentes**. Ele não substitui o backlog, a arquitetura detalhada, as decisões registradas ou o status do repositório.

### 31.1 Documentos derivados

| Documento                | Função                                          |
|--------------------------|-------------------------------------------------|
| PROJECT_DESIGN.pdf / .md | Visão integral e fonte de requisitos.           |
| PRODUCT_BACKLOG.md       | Lista priorizada de épicos e Stories.           |
| EPICS.md                 | Decomposição e ordem das histórias por domínio. |
| ROADMAP.md               | Incrementos, gates e horizonte de entrega.      |
| ARCHITECTURE.md          | Decisões técnicas concretas da implementação.   |
| DECISIONS.md             | Registro de divergências e escolhas.            |
| STATUS.md                | Estado real, testes, bloqueios e próxima Story. |

## 32. Sequência de início

1

#### Versionar o documento

Guardar o PDF e uma versão editável no diretório /docs. Nunca deixar a única cópia em uma conversa.

2

#### Gerar o backlog

Derivar primeiro EPIC-00 e o Incremento 0. Não gerar Stories sociais antes do núcleo.

3

#### Criar Issues

Cada Story refinada vira uma Issue com ID, critérios, dependências e impacto nas cotas.

4

#### Abrir uma tarefa por escopo

Enviar ao Codex uma Story ou pequeno conjunto coeso, nunca o documento inteiro como ordem de implementação.

5

#### Validar por PR

Testar o Preview, revisar critérios, executar checks e só então fazer merge.

6

#### Atualizar o estado

Após cada merge, atualizar backlog, status, decisões e changelog.

## 33. Como abrir cada chat do Codex

O chat deve receber:

1.  ID e texto completo da User Story.
2.  Critérios de aceite e fora do escopo.
3.  Arquivos obrigatórios de leitura.
4.  Comandos de teste e build.
5.  Regra de não alterar áreas não relacionadas.
6.  Obrigação de entregar migration, RLS e testes quando aplicável.
7.  Obrigação de atualizar documentação e apresentar evidências.

**Regra operacional:** Um chat não recebe “faça o Caleida”. Ele recebe uma Story pronta. Um épico inteiro só deve ser enviado quando já estiver decomposto e o limite da execução estiver explícito.

## 34. Como tratar mudanças de ideia

Alterações de visão devem primeiro modificar o Project Design. Depois, revisar capacidades, épicos, Stories afetadas e migrations. Não corrigir uma decisão permanente apenas dentro de um prompt de implementação.

## 35. Ritmo recomendado

| Momento        | Ação                                                |
|----------------|-----------------------------------------------------|
| Antes da Story | Refinar, confirmar dependências e impacto de custo. |
| Durante        | Manter escopo e registrar bloqueios reais.          |
| Antes do merge | Testar critérios, RLS, mobile, build e preview.     |
| Após o merge   | Atualizar status, backlog e documentação.           |
| Semanalmente   | Revisar consumo, bugs, dívida e próxima prioridade. |
| Antes do beta  | Executar gate completo e restauração.               |

O objetivo não é apenas produzir um site bonito. O objetivo é construir um produto utilizável, preservável e tecnicamente sustentável. **Cada pessoa possui uma perspectiva. Cada obra acrescenta um fragmento. Cada interação transforma a composição. Cada história muda o desenho.**

Referências

# Fontes técnicas consultadas

Informações de serviços mudam. Os limites devem ser revalidados antes do beta e da abertura pública.

S1[Supabase — Pricing](https://supabase.com/pricing). Cotas do plano Free, projetos ativos, banco, Storage, egress, Auth, Realtime, Edge Functions e pausa. S2[Supabase — Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing). Pausa de projetos Free por baixa atividade em sete dias. S3[Supabase — Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp). Limite e natureza não produtiva do serviço padrão. S4[Supabase — Auth Rate Limits](https://supabase.com/docs/guides/auth/rate-limits). Limite de dois e-mails por hora com provedor embutido. S5[Supabase — Database Backups](https://supabase.com/docs/guides/platform/backups). Backups por plano e recomendação de exportação para projetos Free. S6[Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security). Obrigatoriedade de RLS em schemas expostos. S7[Supabase — Deployment & Branching](https://supabase.com/docs/guides/deployment). Branching para ambientes de PR disponível no plano Pro. S8[Vercel — Deploying Git Repositories](https://vercel.com/docs/git). Preview Deployment para pull requests e branches. S9[Supabase — Egress](https://supabase.com/docs/guides/troubleshooting/all-about-supabase-egress-a_Sg_e). Cotas em cache e fora de cache são independentes. S10[Supabase — Automated Backups with GitHub Actions](https://supabase.com/docs/guides/deployment/ci/backups). Dumps periódicos por CLI.

Revisão editorial concluída em 03/08/2026. Antes de decisões financeiras ou abertura pública, consultar novamente as páginas oficiais.
