# Portal do SGI: página inicial pública

| Campo | Valor |
|-------|-------|
| Tipo | Proposta de interface/design |
| Status | Rascunho |
| Prioridade | Média |
| Data | 2026-09-28 |
| Autor | Claude |
| Telas afetadas | Nova: Portal do SGI (página inicial pública). Relacionadas: Indicadores SGI (visão pública), Painel (Kanban), página do SGI no SharePoint |

> **Dependências:** usa a visão pública da tela Indicadores SGI (ideia implantada "Painel de Indicadores do SGI"), os tokens de CTA, foco e erro criados na ideia implantada "Feedback de envio e acessibilidade" e a leitura confiável da base de documentos garantida pela ideia implantada "Integridade da sincronização". Lista mestra, treinamentos e abertura de NC ainda não existem no DocFlow: nesta proposta entram como **links de saída** configuráveis (ver seção 3.2 e perguntas ao Eric).

---

## 1. Objetivo da mudança

Dar a qualquer colaborador da Monto uma porta de entrada única e sem login para o SGI (Qualidade, Meio Ambiente, Segurança e Saúde Ocupacional): em menos de 10 segundos a pessoa entende a política, encontra o documento vigente, vê como estão os indicadores, sabe o próximo treinamento e consegue registrar uma não conformidade.

## 2. Situação atual

- O DocFlow abre direto no login; não há página pensada para quem não é da Qualidade.
- A página do SGI no SharePoint é estática: política em texto corrido, links soltos para pastas e planilhas. Quem procura "a versão atual do procedimento X" navega por pastas ou pergunta ao Eric.
- Os indicadores já têm tela pública (Indicadores SGI), mas ela é um destino, não uma vitrine: ninguém chega lá sem o link.
- Documentos aprovados recentemente não são comunicados; a divulgação depende de e-mail manual.
- Não existe um caminho visível para "abrir NC", o que reduz o registro de desvios pelo chão de fábrica.

## 3. Proposta

### 3.1 Layout

Página única, rolagem vertical, **sem a sidebar do app** (é uma página de leitura, não de trabalho). Cabeçalho fino no topo: logo do DocFlow + "SGI Grupo Monto" à esquerda; à direita, o seletor de tema (botão de ícone sol/lua, igual ao do login) e o link discreto "Entrar no DocFlow".

Hierarquia (ordem de leitura e de importância):

1. **Hero com a política do SGI** (identidade e propósito).
2. **Atalhos** (a ação que a maioria veio fazer).
3. **Destaques de indicadores** (como estamos).
4. **Documentos recém-revisados** e **agenda de treinamentos** (o que mudou e o que vem).
5. **Contato da equipe do SGI** (fallback humano).
6. Rodapé com data da última atualização dos dados.

**Desktop (a partir de 1024px), container de largura máxima 1200px, centralizado:**

```
+--------------------------------------------------------------------+
| [logo] SGI Grupo Monto                       [sol/lua] Entrar  ->  |
+--------------------------------------------------------------------+
| HERO (gradiente da marca)                                          |
|  Rótulo: POLÍTICA DO SGI                                           |
|  Título: Qualidade, meio ambiente e segurança em tudo que fazemos  |
|  Resumo da política (3 a 4 linhas)   [4 selos: Q | MA | S | SO]   |
|  Link: Ler a política completa                                     |
+--------------------------------------------------------------------+
| [Lista mestra] [Indicadores] [Treinamentos] [Abrir NC (destaque)]  |  4 colunas
+--------------------------------------------------------------------+
| Como estamos       resumo: 8 na meta . 2 em atenção . 1 fora       |
| [KPI] [KPI] [KPI] [KPI]                       Ver todos ->         |  4 colunas
+----------------------------------------+---------------------------+
| Documentos recém-revisados (8 col.)    | Próximos treinamentos     |
| lista de 5 itens                       | (4 col.) lista de 4 itens |
| Ver lista mestra ->                    | Ver agenda completa ->    |
+----------------------------------------+---------------------------+
| Fale com a equipe do SGI: 2 a 3 cartões de pessoa + canal geral    |
+--------------------------------------------------------------------+
| Dados atualizados em 28/09/2026, 08:15 . DocFlow                   |
+--------------------------------------------------------------------+
```

**Celular (360px a 767px), uma coluna:**

```
+----------------------------+
| [logo] SGI Monto   [☾] [→] |
+----------------------------+
| POLÍTICA DO SGI            |
| Título (2-3 linhas)        |
| Resumo (recolhido em 3     |
| linhas) + Ler a política   |
| [Q] [MA] [S] [SO]          |
+----------------------------+
| [Abrir NC]  largura total  |  CTA principal primeiro
| [Lista    ] [Indicadores ] |  grade 2x2 para os demais
| [Treinam. ]                |
+----------------------------+
| Como estamos  (resumo)     |
| [KPI] [KPI] -> rolagem     |  carrossel horizontal com snap,
|                            |  ou 2 colunas em 2 linhas
+----------------------------+
| Documentos recém-revisados |
| 3 itens + Ver mais         |
+----------------------------+
| Próximos treinamentos      |
| 3 itens + Ver agenda       |
+----------------------------+
| Contato (cartões empilh.)  |
+----------------------------+
```

No celular, "Abrir NC" sobe para o topo dos atalhos com largura total: é a ação de quem está no chão de fábrica com o celular na mão. No desktop, fica como o quarto atalho, com estilo de CTA.

**Tablet (768px a 1023px):** atalhos em 4 colunas compactas (ícone em cima, rótulo embaixo); KPIs em 2 colunas; documentos e treinamentos empilhados em largura total.

### 3.2 Componentes

Reaproveitar o catálogo do 04-design.md:

| Seção | Componente base | Ajuste |
|-------|-----------------|--------|
| Cabeçalho | Botão de tema do login; link simples | Sem sidebar, sem crachá de usuário. |
| Hero | hero-banner (gradiente pêssego para âmbar) | Texto em --cor-chumbo sobre o gradiente claro (ver seção 4). Selos dos 4 pilares em pill branca translúcida. |
| Atalhos | action-card (ícone, título, descrição curta, seta) | "Abrir NC" usa fundo --cor-primaria-forte e texto --cor-texto-sobre-primaria. Os outros três, cartão neutro. Cada atalho é um link de verdade (não bloco clicável). |
| Indicadores | kpi-card da tela Indicadores SGI | Versão compacta: nome, valor e unidade, meta, farol (cor + texto), seta de tendência. Sem minigráfico no celular. Máximo de 4 cartões. |
| Resumo de farol | pills de contagem da faixa de resumo da tela Indicadores SGI | Reaproveitar sem mudança. |
| Documentos recém-revisados | Lista (linhas de tabela simplificadas) + card-code + card-type-tag | Cada linha: código (monoespaçado), título, tipo, revisão ("Rev. 04") e data de aprovação relativa ("há 3 dias"). |
| Treinamentos | Lista com "bloco de data" à esquerda | Componente novo e pequeno: quadrado de 48px com dia (18px, 700) e mês abreviado (11px, caixa alta). Ao lado: tema, público, local ou modalidade e horário. |
| Contato | Cartão com avatar de iniciais (dropdown-user-avatar) | Nome, função no SGI, pilar, botão "Enviar e-mail" e "Chamar no Teams". Sem telefone pessoal. |
| Rodapé | Texto mutado | Data da última atualização dos dados. |

**Conteúdo de cada bloco (regras de seleção):**

- **Indicadores em destaque:** até 4, escolhidos pelo Eric com uma marcação "destaque no portal" na Gestão de Indicadores. Sem marcação, mostrar os 4 indicadores com farol vermelho ou âmbar mais recentes. Clicar no cartão abre a tela Indicadores SGI já no detalhe do indicador.
- **Documentos recém-revisados:** documentos do DocFlow com status Aprovado nos últimos 30 dias, do mais recente para o mais antigo, máximo de 5 (3 no celular). Só aparecem campos públicos: código, título, tipo, revisão e data. Nada de solicitante, observações, histórico ou anexos. O clique leva ao documento vigente na lista mestra (link configurável); se não houver link, a linha não é clicável.
- **Treinamentos:** próximos 4 eventos a partir de hoje. Fonte a definir com o Eric (ver perguntas). No MVP, uma lista simples mantida pela equipe do SGI.
- **Contato:** lista fixa editável pela equipe do SGI (nome, função, pilar, e-mail corporativo).
- **Links de saída** (lista mestra, agenda completa de treinamentos, formulário de NC, política completa): ficam num arquivo de configuração único, sem endereços escritos dentro do HTML. Cada link sem destino configurado esconde o atalho, em vez de mostrar um link quebrado.

### 3.3 Estados

| Bloco | Carregando | Vazio | Erro | Outros |
|-------|-----------|-------|------|--------|
| Página | Estrutura aparece na hora (hero, atalhos e contato não dependem de dados). Blocos de dados mostram esqueletos com a forma final (sem spinner girando). | — | — | Sem animação de esqueleto quando o sistema pede menos movimento. |
| Indicadores | 4 esqueletos de cartão | "Os indicadores do mês ainda estão sendo lançados." | Mantém a última cópia local e mostra aviso inline "Dados podem estar desatualizados". Sem cópia: mensagem + "Tentar novamente". | Farol sempre com texto, nunca só cor. |
| Documentos | 5 linhas-esqueleto | "Nenhum documento foi revisado nos últimos 30 dias." + link para a lista mestra | Mesmo padrão dos indicadores | — |
| Treinamentos | 4 linhas-esqueleto | "Nenhum treinamento agendado por enquanto." + contato do SGI | Mesmo padrão | Treinamento do dia recebe pill "Hoje" (âmbar). |
| Atalhos e cartões | — | — | — | Hover: sobe 2px e borda pêssego. Foco: anel --cor-foco. Ativo: sem elevação. Link externo com ícone de "abre em nova aba" e aviso para leitor de tela. |

### 3.4 Microcopy

Não há texto atual (página nova). Textos propostos:

| Local | Texto atual | Texto proposto |
|-------|-------------|----------------|
| Título da aba do navegador | — | SGI Grupo Monto |
| Cabeçalho, marca | — | SGI Grupo Monto |
| Cabeçalho, link | — | Entrar no DocFlow |
| Hero, rótulo | — | POLÍTICA DO SGI |
| Hero, título | — | Qualidade, meio ambiente e segurança em tudo o que fazemos |
| Hero, resumo | — | Texto oficial da política, resumido pelo Eric em até 4 linhas (a ser fornecido). |
| Hero, selos | — | Qualidade · Meio Ambiente · Segurança · Saúde Ocupacional |
| Hero, link | — | Ler a política completa |
| Seção de atalhos, título (só para leitor de tela) | — | Acesso rápido |
| Atalho 1 | — | **Lista mestra** · Encontre a versão vigente de qualquer documento |
| Atalho 2 | — | **Indicadores** · Veja como estamos em relação às metas |
| Atalho 3 | — | **Treinamentos** · Consulte a agenda e as inscrições |
| Atalho 4 | — | **Abrir NC** · Viu um desvio? Registre em 2 minutos |
| Indicadores, título | — | Como estamos |
| Indicadores, resumo | — | {n} na meta · {n} em atenção · {n} fora da meta |
| Indicadores, farol | — | Na meta / Em atenção / Fora da meta / Sem dado no mês |
| Indicadores, link | — | Ver todos os indicadores |
| Documentos, título | — | Documentos recém-revisados |
| Documentos, subtítulo | — | Aprovados nos últimos 30 dias |
| Documentos, linha | — | {código} · {título} · Rev. {nn} · aprovado há {n} dias |
| Documentos, link | — | Ver lista mestra |
| Treinamentos, título | — | Próximos treinamentos |
| Treinamentos, pill | — | Hoje |
| Treinamentos, link | — | Ver agenda completa |
| Contato, título | — | Fale com a equipe do SGI |
| Contato, subtítulo | — | Dúvidas sobre documentos, indicadores, treinamentos ou auditorias |
| Contato, botões | — | Enviar e-mail · Chamar no Teams |
| Aviso de dados antigos | — | Dados podem estar desatualizados (última atualização em {data}, {hora}). |
| Botão de erro | — | Tentar novamente |
| Rodapé | — | Dados atualizados em {data}, {hora} |
| Aviso de link externo (leitor de tela) | — | (abre em nova aba) |

Tom: frases curtas, verbo no imperativo nos atalhos, sem siglas soltas (NC só aparece junto de "Abrir", já conhecido no chão de fábrica; confirmar com o Eric).

## 4. Paleta e tokens

- **Fundo da página:** --cor-fundo. **Cartões:** --cor-cartao, borda --cor-borda, sombra --shadow-card, raio --radius-lg.
- **Hero:** gradiente do hero-banner (--cor-pessego para --cor-ambar). Texto em --cor-chumbo, **não branco** (branco sobre pêssego fica em 2,25:1). Chumbo sobre âmbar #FBBA6D dá cerca de 6,5:1 e sobre pêssego #F69463 cerca de 4,8:1; validar o pior ponto do gradiente com ferramenta de contraste. No tema escuro, o hero usa --cor-cartao com uma borda superior de 4px no gradiente da marca e texto --cor-texto-principal.
- **CTA "Abrir NC":** --cor-primaria-forte, hover --cor-primaria-forte-hover, texto --cor-texto-sobre-primaria (4,91:1, já validado na ideia de feedback de envio).
- **Foco:** --cor-foco em todos os elementos interativos.
- **Farol:** reaproveitar os tokens da tela Indicadores SGI (verde, âmbar, coral e cinza com texto escuro legível). Texto verde usar #4b6b40 (6,04:1), como na ideia de feedback.
- **Selos dos pilares:** fundo branco a 70% sobre o hero, texto --cor-chumbo.
- **Textos secundários:** usar --cor-texto-principal com peso menor, ou o secundário ajustado, nunca --cor-texto-mutado (2,6:1) em informação necessária.
- **Nenhuma cor nova.** Se o Eric quiser uma cor por pilar (ex.: verde para Meio Ambiente), isso vira token novo em paleta.css com contraste medido, numa ideia separada.

## 5. Responsivo e tema escuro

| Largura | Comportamento |
|---------|---------------|
| 360px | Uma coluna; padding lateral 16px; título do hero 22px; resumo da política recolhido em 3 linhas com "Ler a política completa"; "Abrir NC" largura total e atalhos restantes em 2x2 (altura mínima 72px); KPIs em 2 colunas ou carrossel com snap; 3 documentos e 3 treinamentos; contatos empilhados. Nenhuma rolagem horizontal da página (o carrossel rola só dentro dele). |
| 768px | Padding lateral 24px; atalhos em 4 colunas compactas; KPIs em 2 colunas; documentos e treinamentos empilhados em largura total; contatos em 2 colunas. |
| 1024px ou mais | Container de até 1200px; padding 32px; atalhos e KPIs em 4 colunas; documentos (2/3) e treinamentos (1/3) lado a lado; contatos em 3 colunas. |

Abordagem mobile-first (a página será muito aberta no celular), com grades definidas só no CSS, nunca no HTML (evita a pendência D4 do Kanban).

**Tema escuro:** segue a chave de tema já existente (mesmo anti-flash das outras páginas); quem nunca escolheu vê o tema do sistema. Superfícies e textos só por tokens; hero muda para cartão escuro com faixa de gradiente (seção 4). Quando incorporada no SharePoint, a página aceita um parâmetro para forçar o tema claro, para não destoar da página clara do SharePoint.

## 6. Acessibilidade

- Estrutura com marcos: cabeçalho, principal e rodapé; um único título de nível 1 (título do hero) e títulos de nível 2 por seção.
- Link "Pular para o conteúdo" como primeiro elemento focável.
- Contraste mínimo de 4,5:1 em todo texto, 3:1 em ícones e bordas de controle; farol sempre com texto.
- Ordem de tabulação igual à ordem visual; no celular, "Abrir NC" vem primeiro também no código, e no desktop a ordem visual é ajustada por CSS de forma a manter a leitura lógica (validar com leitor de tela).
- Cada atalho, cartão de KPI e linha de documento é um link de verdade, com nome acessível completo (ex.: "Abrir NC: registre um desvio"). Ícones decorativos ocultos do leitor de tela.
- Carrossel de KPIs: navegável por teclado, sem avanço automático.
- Área de toque mínima de 44x44px.
- Esqueletos e hovers respeitam a preferência por menos movimento.
- Datas relativas ("há 3 dias") com a data completa disponível para leitor de tela e ao passar o mouse.
- Idioma declarado como português do Brasil.

## 7. Como incorporar no SharePoint

Três caminhos, do mais simples ao mais integrado:

| Opção | Como funciona | Prós | Contras |
|-------|---------------|------|---------|
| **A. Link / botão** na página do SGI | Um botão ou web part "Link" / "Ação rápida" na página do SGI no SharePoint abre o Portal em nova aba. | Zero configuração de segurança; a página roda em tela cheia, com layout, tema e navegação completos; funciona igual no app do SharePoint e no celular; nenhuma limitação de iframe. | Um clique a mais; o colaborador sai do SharePoint; a página do SGI continua "parada" até alguém clicar. |
| **B. Web part Incorporar (Embed)** com a página inteira | A web part Incorporar mostra o Portal num iframe dentro da página do SGI. | Conteúdo vivo direto na página que todos já visitam; aproveita permissão e navegação do SharePoint; sensação de produto único. | O domínio onde o DocFlow está hospedado precisa estar na lista de domínios permitidos para iframe do site (configuração de administrador do SharePoint); altura fixa do iframe gera rolagem dupla (a página foi desenhada para rolar sozinha); no celular e no app do SharePoint o iframe fica apertado; links precisam abrir em nova aba (navegar dentro do iframe confunde); a página não pode proibir ser incorporada, mas deve limitar a incorporação aos domínios da Monto; o armazenamento do navegador dentro de iframe pode ser bloqueado por alguns navegadores, então a cópia local e o tema podem não persistir. |
| **C. Híbrido (recomendado)** | Na página do SGI: web part Incorporar só com uma **versão compacta** do Portal (modo "faixa": resumo de farol + 4 KPIs + 3 documentos recentes, altura fixa de cerca de 420px, sem cabeçalho nem hero) e, logo acima, a web part de Texto do próprio SharePoint com a política e um botão "Abrir o Portal do SGI" para a versão completa. | Página do SGI ganha números vivos sem rolagem dupla; política fica no SharePoint, editável pelo Eric sem código; celular recebe a versão completa pelo botão; se o iframe falhar, o botão continua funcionando. | Duas variações de layout para manter (página completa e faixa, ambas no mesmo HTML via parâmetro); ainda depende da liberação do domínio para iframe. |

**Recomendação:** começar pela opção **A** no primeiro dia (sem dependência de TI) e evoluir para a **C** assim que o domínio for liberado para incorporação. A opção B pura não é recomendada por causa da rolagem dupla e da experiência no celular.

**Cuidados para qualquer opção:**

- Página pública significa **sem login**: ela só pode ler dados já pensados para serem públicos (indicadores publicados e campos públicos dos documentos aprovados). Nada de usuários, solicitantes, observações ou anexos.
- Os dados devem vir por uma leitura **só de consulta e filtrada** (um fluxo ou fonte que devolve apenas os campos públicos), nunca pelo fluxo de leitura geral do DocFlow, que hoje devolve a planilha inteira (achado C1 do README do projeto). Isso é pré-requisito, não detalhe.
- "Público" aqui é público **interno** (colaboradores da Monto). Se a hospedagem ficar aberta à internet, a política e os indicadores ficam visíveis para qualquer pessoa: o Eric precisa confirmar se isso é aceitável.

## 8. Critérios de aceite visuais

- [ ] Funciona no tema claro e no escuro.
- [ ] Funciona em tela de celular sem rolagem horizontal.
- [ ] Em 360px, "Abrir NC" é o primeiro atalho e ocupa a largura total; em 1024px os 4 atalhos ficam numa linha.
- [ ] Hero, atalhos e contato aparecem mesmo sem conexão com os dados.
- [ ] Cada bloco de dados tem os estados carregando, vazio e erro com os textos da seção 3.4.
- [ ] Nenhum texto branco sobre pêssego claro; texto do hero em chumbo passa 4,5:1 no pior ponto do gradiente.
- [ ] Todo elemento interativo mostra o anel --cor-foco ao navegar pelo teclado, e a ordem de tabulação segue a hierarquia da seção 3.1.
- [ ] O farol dos KPIs sempre tem texto além da cor.
- [ ] Documentos recém-revisados não mostram solicitante, observações, histórico ou anexos.
- [ ] Atalho sem link configurado não aparece.
- [ ] Modo faixa (opção C) cabe em cerca de 420px de altura sem rolagem interna em 1024px ou mais.
- [ ] Parâmetro de tema claro forçado funciona quando incorporado.
- [ ] Com preferência por menos movimento, esqueletos e elevações não animam.

---

## Instruções para o Antigravity

- **O que implementar:** uma página pública nova, Portal do SGI, com as seções, a hierarquia, os estados e a microcopy exata desta proposta; um modo "faixa" compacto da mesma página, ativado por parâmetro, para incorporação no SharePoint; um parâmetro para forçar tema claro; um arquivo único de configuração com os links de saída (lista mestra, agenda de treinamentos, formulário de NC, política completa), a lista de contatos e a lista inicial de treinamentos.
- **Onde (telas e arquivos):** novos `portal.html`, `portal.js` e a configuração do portal; estilos numa seção própria de `formulario.css` (componente "portal"), usando só tokens de `paleta.css`. Reaproveitar os cartões de KPI e o cálculo de farol da tela Indicadores SGI (`indicadores.js`), sem duplicar lógica. A página **não** chama a proteção de login de `auth-service.js`.
- **O que não alterar:** regras de negócio do DocFlow, fluxo de dados da tramitação, telas Painel (Kanban), Novo Documento e Indicadores SGI (além de expor o que for preciso para reaproveitar componentes). Não ler dados pelo fluxo de leitura geral: se ainda não existir uma leitura pública e filtrada, implementar com dados de exemplo e **parar para o Eric decidir a fonte**. Não escrever endereços de fluxo, do SharePoint ou de formulários no HTML.
- **Como testar:** abrir em 360px, 768px e 1024px nos temas claro e escuro; navegar só pelo teclado do topo ao rodapé; medir contraste do hero e do CTA; simular falha dos dados (hero, atalhos e contato devem continuar visíveis); abrir no modo faixa dentro de um iframe de teste com 420px de altura; ativar "reduzir movimento" no sistema; conferir que nenhum dado não público aparece.

### Perguntas para o Eric antes de aprovar

1. Onde vivem hoje a lista mestra, a agenda de treinamentos e o registro de NC (pasta ou lista do SharePoint, Forms, outro sistema)? Os atalhos vão apontar para lá.
2. O Portal é só para a rede interna da Monto ou pode ficar acessível pela internet?
3. A TI consegue liberar o domínio de hospedagem do DocFlow para a web part Incorporar do site do SGI?
4. Qual o texto oficial resumido da política (até 4 linhas) e quem da equipe do SGI aparece no contato?
5. "Documentos recém-revisados" deve incluir todos os tipos (inclusive mapas de riscos e especificações técnicas) ou só procedimentos e instruções de trabalho?

---

## Resultado da implantação

<!-- Preencher ao mover para ideias_implantadas/modelos/modelo_design/. -->

- **Data da implantação:**
- **Validado por:** Eric
- **O que foi feito:**
- **Diferenças em relação à proposta:**
- **Observações e pendências:**
