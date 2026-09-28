# Layout para celular (DocFlow responsivo)

| Campo | Valor |
|-------|-------|
| Tipo | Proposta de interface/design |
| Status | Rascunho |
| Prioridade | Média |
| Data | 2026-09-28 |
| Autor | Claude |
| Telas afetadas | Login, Painel (index.html: KPIs e Kanban), Modal de detalhes, Modal "Cancelados", Novo Documento (formulario.html), Planner, Painel de Indicadores do SGI, sidebar e cabeçalho |

---

## 1. Objetivo da mudança

Permitir que gestores e responsáveis de área consultem o status de um documento, vejam os KPIs e registrem ou movimentem um documento pelo celular (em campo, na obra, em auditoria), sem zoom e sem rolagem horizontal. Hoje o DocFlow só funciona bem em tela de computador.

## 2. Situação atual

- **Sidebar:** o rail flutuante com recorte côncavo e botão de colapso continua ocupando a lateral no celular. Mesmo colapsada, ela rouba largura útil, e o recorte e o dropdown de configurações (que abre para cima, com 290px) não foram pensados para toque.
- **KPIs:** o formulario.css tem ajustes (2 colunas abaixo de 980px e 1 coluna abaixo de 600px), mas o index.html força 4 colunas direto no HTML, o que anula esses ajustes. O problema já estava registrado como D4 na análise do doc_projeto e não foi resolvido pela ideia implantada de feedback de envio e acessibilidade.
- **Kanban:** abaixo de 980px as 5 colunas viram uma pilha vertical única. No celular, o usuário precisa rolar por todas as colunas para chegar a "Aprovado", sem saber quantos cartões há em cada uma.
- **Modal de detalhes:** vira uma coluna abaixo de 860px, mas mantém cantos de 28px, margens e altura máxima de 64% da tela na área dividida. Sobra pouco espaço útil e aparece rolagem dentro de rolagem.
- **Formulário (formulario.html):** usa grades de 2 e 3 colunas. Só algumas delas caem para 1 coluna (640px e 768px), então alguns campos ficam espremidos.
- **Espaçamento:** padding lateral de 40px e card-formulario com 28px/32px desperdiçam cerca de 20% de uma tela de 360px.
- **Alvos de toque:** vários botões pequenos (ações do cartão do Kanban com 11px de texto, botão de colapso com 26px, ícones de ação, fechar do modal) ficam abaixo de 44px.
- **Breakpoints:** o CSS tem pelo menos oito valores diferentes (600, 640, 768, 860, 980 e 1400px, entre outros), sem padrão.

## 3. Proposta

### 3.1 Layout

**Breakpoints oficiais.** Três faixas, definidas por largura mínima (mobile first) e usadas em todo o CSS novo. Os breakpoints antigos vão sendo substituídos por estes à medida que as regras forem tocadas.

| Faixa | Largura | Nome | Referência de teste |
|-------|---------|------|---------------------|
| Celular | até 767px | `sm` | 360px |
| Tablet | 768px a 1023px | `md` | 768px |
| Computador | a partir de 1024px | `lg` | 1024px e maior |

Os valores devem virar tokens em comentário padronizado no topo da seção "Responsividade" do formulario.css. O CSS puro não aceita variável dentro de media query, então o padrão é documental, com os três valores repetidos sempre iguais.

**Navegação (sidebar):**
- `lg`: sem mudança. A sidebar atual continua com recorte, colapso e rodapé.
- `md`: a sidebar começa colapsada (só ícones) por padrão, respeitando a preferência salva se o usuário a expandir.
- `sm`: a sidebar some e dá lugar a uma **barra de navegação inferior** fixa, com até 5 destinos: Painel, Novo, Planner, Indicadores e "Mais". "Mais" abre uma **folha inferior** (bottom sheet) com os itens restantes, o selo SharePoint, o usuário, as configurações (tema, sincronização) e "Sair". Não há recorte côncavo no celular. O item ativo é marcado pelo mesmo vinho do item ativo atual. A barra respeita a área segura inferior do aparelho (entalhe e barra de gestos).
- Motivo da escolha da barra inferior em vez do menu hambúrguer: os destinos são poucos e usados com frequência, e a barra fica ao alcance do polegar. O hambúrguer esconderia a navegação principal atrás de um toque a mais. Se o Eric preferir o hambúrguer (ver perguntas no fim), a folha "Mais" vira uma gaveta lateral que abre pelo botão no cabeçalho, com o mesmo conteúdo.

**Cabeçalho:** em `sm`, uma linha só, com título da página à esquerda e ações essenciais à direita (sincronizar e, no Painel, busca como ícone que expande o campo em largura total).

**Grade de KPIs:**
- Remover a grade forçada no index.html. A grade passa a ser controlada só pelo CSS.
- `lg`: 4 colunas (a quantidade real de KPIs do Painel). `md`: 2 colunas. `sm`: 2 colunas compactas, com número em cima e rótulo embaixo, sem ícone decorativo. Se o número de KPIs for ímpar, o último ocupa a linha inteira.
- A mesma regra vale para a grade de cartões do Painel de Indicadores do SGI: 3 ou mais colunas em `lg`, 2 em `md` e 1 em `sm`.

**Kanban:**
- `lg`: sem mudança (colunas lado a lado, com a rolagem horizontal atual acima de 1400px).
- `md`: rolagem horizontal com **snap**. Cada coluna ocupa cerca de 45% da largura, mostrando 2 colunas e meia, o que sinaliza que há mais conteúdo à direita.
- `sm`: **abas de fase** no topo do quadro (Recebido, Em análise, Aprovação, Devolvido à Área, Aprovado, com os nomes reais das colunas), cada uma com o contador de cartões. Abaixo das abas, uma coluna por vez, em largura total. Deslizar para os lados também troca de coluna (rolagem com snap), e a aba ativa acompanha. As abas rolam horizontalmente se não couberem.
- Arrastar e soltar entre colunas **não** é usado no celular. Mover um cartão continua pelos botões de ação do cartão ou do modal, que já existem.
- A barra de filtros vira um botão "Filtros" que abre uma folha inferior com os mesmos filtros.

**Modal de detalhes e modal "Cancelados":**
- `sm`: **tela cheia**, sem cantos arredondados e sem margem. Cabeçalho fixo com botão "Voltar" (seta) à esquerda e título. Conteúdo em uma coluna, com uma única rolagem (acaba a altura máxima de 64% da área dividida). Ordem: informações, observações, anexos, timeline e auditoria. Ações principais (mudar status, abrir no SharePoint) numa barra fixa no rodapé.
- `md`: modal com 92% da largura, uma coluna, cantos de 20px.
- `lg`: sem mudança.
- Botão "Voltar" do Android e tecla Esc fecham o modal.

**Formulário (Novo Documento e edição):**
- `sm`: **coluna única** para todos os campos, inclusive as grades de 2 e 3 colunas. Botão de envio em largura total, fixo no rodapé enquanto o formulário estiver na tela, com o mesmo formato pill.
- `md`: 2 colunas no máximo.
- `lg`: sem mudança.
- Campos de data, e-mail e número usam o tipo de teclado adequado do celular.

**Espaçamento:**
- Padding lateral da página: **16px** em `sm`, 24px em `md` e o atual em `lg`.
- card-formulario, kpi-card, planner-col e demais cartões: padding interno de 16px em `sm`.
- Nenhum elemento pode ultrapassar a largura da tela (tabelas longas rolam dentro do próprio cartão, nunca a página).

**Login:** cartão em largura total menos 16px de cada lado, sem ilustração lateral em `sm`.

### 3.2 Componentes

Reaproveitar os do 04-design.md: sidebar-link (ícones e cor do ativo), badges e pills de status, kpi-card, planner-col, planner-card, modal-card, pill-input-box e pill-btn-submit, toast-push-box (em `sm`, o toast sobe acima da barra inferior).

Componentes novos (mínimos):

| Componente | Uso | Base visual |
|------------|-----|-------------|
| Barra inferior de navegação | Navegação em `sm` | Fundo com o gradiente da sidebar ou `--cor-fundo` com borda superior (decisão do Eric), ícones de sidebar-link, rótulo de 11px |
| Folha inferior (bottom sheet) | "Mais", filtros do Kanban | Cantos superiores de 20px, sombra do modal, alça de arraste decorativa |
| Abas de fase do Kanban | Troca de coluna em `sm` | Pill com o ponto de cor da coluna e o contador |

### 3.3 Estados

| Elemento | Estados |
|----------|---------|
| Item da barra inferior | padrão, ativo (vinho), pressionado (leve escurecimento), foco visível |
| Aba de fase | padrão, ativa (fundo da cor da fase suave e texto forte), foco visível, contador zero em cinza |
| Coluna do Kanban no celular | carregando (esqueleto de 3 cartões), vazio ("Nenhum documento nesta fase."), com cartões |
| Folha inferior | fechada, abrindo (animação de 200ms, desligada com preferência por menos movimento), aberta com fundo escurecido |
| Modal em tela cheia | carregando, conteúdo, erro de sincronização (toast acima da barra de ações) |
| Botão de envio fixo | padrão, desabilitado, enviando e sucesso ou erro (reaproveitar os estados da ideia implantada de feedback de envio) |

### 3.4 Microcopy

| Local | Texto atual | Texto proposto |
|-------|-------------|----------------|
| Barra inferior, destinos | (itens da sidebar) | Painel · Novo · Planner · Indicadores · Mais |
| Folha "Mais", título | — | Mais opções |
| Botão de filtros do Kanban | — | Filtros |
| Filtros ativos | — | Filtros (2) |
| Coluna vazia no celular | — | Nenhum documento nesta fase. |
| Botão voltar do modal (rótulo acessível) | Fechar | Voltar para o painel |
| Rótulo acessível das abas | — | Fase {nome}, {n} documentos |

## 4. Paleta e tokens

- Sem cores novas. Usar `--cor-vinho` (item ativo), `--cor-fundo` (fundo da barra inferior e do modal em tela cheia), as cores de fase já usadas nos pontos de coluna e nas pills, e o `--radius-lg` nos cartões.
- Tokens novos de espaçamento e toque, em paleta.css:
  - `--espaco-lateral-sm` = 16px; `--espaco-lateral-md` = 24px.
  - `--alvo-toque-min` = 44px.
  - `--altura-barra-inferior` = 64px mais a área segura do aparelho.
- A barra inferior no tema escuro usa a mesma superfície escura dos rodapés e painéis internos listada no 04-design.md, com borda na cor de borda escura já existente.

## 5. Responsivo e tema escuro

| Elemento | 360px (`sm`) | 768px (`md`) | 1024px (`lg`) |
|----------|--------------|--------------|---------------|
| Navegação | Barra inferior + folha "Mais" | Sidebar colapsada (ícones) | Sidebar atual |
| Padding lateral | 16px | 24px | Atual |
| KPIs | 2 colunas compactas | 2 colunas | 4 colunas |
| Kanban | Abas + uma coluna em largura total com snap | Rolagem horizontal com snap, cerca de 2,5 colunas visíveis | Colunas lado a lado |
| Modal | Tela cheia | 92% da largura, 1 coluna | Atual (dividido) |
| Formulário | 1 coluna, envio fixo no rodapé | Até 2 colunas | Atual |

Tema escuro: todos os componentes novos têm variante escura com as superfícies escuras existentes. O fundo escurecido das folhas inferiores e do modal é o mesmo nos dois temas.

## 6. Acessibilidade

- Todo alvo de toque com no mínimo 44 por 44px (área clicável, mesmo quando o ícone é menor), com pelo menos 8px entre alvos vizinhos.
- Barra inferior como navegação com rótulo "Navegação principal". O item ativo é anunciado como página atual.
- Abas de fase com a semântica de abas: setas esquerda e direita trocam de aba e o contador é lido junto do nome.
- Modal em tela cheia e folhas inferiores prendem o foco enquanto abertos e devolvem o foco ao elemento de origem ao fechar.
- Contraste mínimo de 4,5:1 para texto e 3:1 para ícones e bordas de controle, nos dois temas.
- Foco visível mantido (o que foi feito na ideia de feedback de envio e acessibilidade não pode regredir).
- Texto base de pelo menos 16px nos campos do formulário no celular, para o navegador não dar zoom automático.
- Preferência por menos movimento desliga as animações das folhas e do snap suave.
- Zoom da página não pode ser bloqueado.

## 7. Critérios de aceite visuais

Testar no modo de dispositivo do navegador em **360px**, **768px** e **1024px** de largura, nos temas claro e escuro, e também num celular real (Android e iPhone, se houver).

Gerais
- [ ] Funciona no tema claro e no escuro.
- [ ] Em 360px, 768px e 1024px nenhuma tela (Login, Painel, Novo Documento, Planner, Indicadores) tem rolagem horizontal da página.
- [ ] Em 360px o padding lateral das páginas é de 16px, medido no inspetor.
- [ ] Em 360px todos os botões, links, abas, ícones de ação e itens de navegação têm área de toque de pelo menos 44 por 44px, medida no inspetor.
- [ ] Os campos do formulário em 360px têm texto de 16px ou mais, e tocar num campo não dá zoom na página.

Navegação
- [ ] Em 360px a sidebar não aparece e a barra inferior mostra Painel, Novo, Planner, Indicadores e Mais, com o item da página atual em vinho.
- [ ] Em 360px "Mais" abre a folha com usuário, SharePoint, configurações e Sair, e todos funcionam.
- [ ] Em 768px a sidebar aparece colapsada por padrão. Em 1024px aparece como hoje, com recorte e colapso.
- [ ] Em 360px a barra inferior não cobre conteúdo nem toasts (o último cartão e o botão de envio ficam visíveis ao rolar até o fim).

KPIs
- [ ] O index.html não força mais o número de colunas da grade de KPIs.
- [ ] Os KPIs aparecem em 2 colunas em 360px, 2 colunas em 768px e 4 colunas em 1024px, sem texto cortado.

Kanban
- [ ] Em 360px aparecem as abas de fase com contador. Tocar numa aba mostra só aquela coluna, e deslizar para o lado passa à coluna seguinte, parando alinhada (snap), com a aba ativa acompanhando.
- [ ] Em 768px as colunas rolam na horizontal com snap e uma coluna parcialmente visível indica que há mais.
- [ ] Em 1024px o quadro fica igual ao atual.
- [ ] Em 360px é possível mover um documento de fase só com toques, pelos botões de ação.
- [ ] Em 360px, "Filtros" abre a folha com os filtros e mostra o número de filtros ativos.

Modal
- [ ] Em 360px o modal de detalhes e o de Cancelados ocupam a tela inteira, com uma rolagem só, botão Voltar no topo e ações fixas no rodapé.
- [ ] O botão Voltar do celular e a tecla Esc fecham o modal e o foco volta ao cartão de origem.
- [ ] Em 768px o modal ocupa cerca de 92% da largura, em 1 coluna. Em 1024px fica como hoje.

Formulário
- [ ] Em 360px todos os campos do Novo Documento e da edição estão em uma coluna e o botão de envio ocupa a largura total.
- [ ] Em 768px há no máximo 2 colunas. Em 1024px o formulário fica como hoje.
- [ ] Enviar um cadastro pelo celular mostra os mesmos estados de envio (enviando, sucesso, erro) da ideia implantada de feedback de envio.

Acessibilidade
- [ ] Navegando com Tab em 768px e 1024px, e com leitor de tela no celular (TalkBack ou VoiceOver), a barra inferior, as abas e o modal são anunciados corretamente e o foco é sempre visível.
- [ ] O contraste dos componentes novos passa em 4,5:1 (texto) e 3:1 (ícones) numa ferramenta de contraste, nos dois temas.

---

## Instruções para o Antigravity

- **O que implementar:**
  1. Padronizar os breakpoints (`sm` até 767px, `md` de 768px a 1023px, `lg` a partir de 1024px) e criar os tokens de espaçamento lateral, alvo de toque e altura da barra inferior em paleta.css.
  2. Remover a grade de colunas forçada da grade de KPIs no index.html e aplicar 2, 2 e 4 colunas pelo CSS. Aplicar regra equivalente à grade do Painel de Indicadores.
  3. Criar a barra inferior e a folha "Mais" para `sm`, ocultando a sidebar nessa faixa, e deixar a sidebar colapsada por padrão em `md` sem sobrescrever a preferência salva pelo usuário em sidebar.js.
  4. Kanban: abas de fase com contador e rolagem com snap em `sm`, rolagem com snap em `md`, filtros numa folha inferior em `sm`. Manter as ações de mover cartão pelos botões.
  5. Modal de detalhes e modal Cancelados em tela cheia em `sm`, com cabeçalho Voltar, rolagem única e barra de ações fixa. Botão Voltar do aparelho fecha o modal.
  6. Formulário em coluna única em `sm` e no máximo 2 colunas em `md`, com botão de envio fixo e tipos de campo com teclado adequado.
  7. Padding lateral de 16px em `sm` e 24px em `md`. Alvos de toque de no mínimo 44px em todas as telas nessa faixa.
  8. Conferir a meta de viewport de todas as páginas (largura do aparelho, sem bloquear o zoom).
- **Onde (telas e arquivos):** index.html, formulario.html, planner.html, login.html e a página do Painel de Indicadores; formulario.css (seção Responsividade e componentes afetados); paleta.css (tokens novos); sidebar.js (padrão colapsado em `md` e barra inferior); planner.js (abas de fase e sincronização da aba com a rolagem).
- **O que não alterar:** regras de negócio, fluxo de status, sincronização com a planilha e fila de envios pendentes, IDs dos documentos, microcopy existente fora da tabela da seção 3.4, layout em 1024px ou mais (que deve ficar idêntico ao atual), foco visível e contraste definidos na ideia implantada de acessibilidade.
- **Como testar:** modo de dispositivo do navegador em 360px, 768px e 1024px, temas claro e escuro, seguindo a lista da seção 7; depois, num celular real, cadastrar um documento, mover um cartão de fase e abrir e fechar o modal.

**Dependências e referências:**
- Depende da ideia implantada `ideias_implantadas/modelos/modelo_design/2026-09-28_feedback-envio-e-acessibilidade.md` (foco visível, contraste, estados de envio), que não pode regredir.
- Depende da ideia implantada `ideias_implantadas/modelos/modelo_problema/2026-09-28_integridade-sincronizacao.md`: as ações do Kanban localizam o documento por ID, o que torna seguro mover cartões pelas abas no celular.
- Afeta a ideia implantada `ideias_implantadas/modelos/modelo_funcao/2026-09-28_painel-indicadores-sgi.md` (grade de cartões e item "Indicadores" na navegação).
- Ao concluir, atualizar o doc_projeto/04-design.md (breakpoints, tokens novos, barra inferior, folha inferior, abas de fase).

**Perguntas para o Eric (antes de aprovar):**
1. Barra inferior (recomendada) ou menu hambúrguer no celular?
2. Quais são os 4 destinos principais da barra inferior? A proposta supõe Painel, Novo, Planner e Indicadores.
3. O celular deve permitir tudo (cadastrar, editar, mover fase) ou só consulta e movimentação? Isso pode reduzir o escopo do formulário.
4. Quem usa pelo celular, com que aparelhos, e o acesso é pelo navegador ou por algum aplicativo corporativo (Teams, SharePoint)?

---

## Resultado da implantação

- **Data da implantação:**
- **Validado por:** Eric
- **O que foi feito:**
- **Diferenças em relação à proposta:**
- **Observações e pendências:**
