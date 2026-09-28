# 04 — Design e Sistema Visual do DocFlow

> Público: desenvolvedores e designers que vão evoluir a interface.
> Fonte da verdade: paleta.css (tokens de cor), formulario.css (componentes, layout, tema escuro, animações) e sidebar.js (colapso e recorte da sidebar). Todos os valores abaixo foram tirados desses arquivos. Quando o código e este documento divergirem, vale o código, e este documento deve ser corrigido.

## Sumário

1. [Princípios visuais](#1-princípios-visuais)
2. [Paleta de cores](#2-paleta-de-cores)
3. [Tema claro e escuro](#3-tema-claro-e-escuro)
4. [Tipografia](#4-tipografia)
5. [Espaçamento, raios e sombras](#5-espaçamento-raios-e-sombras)
6. [Layout](#6-layout)
7. [Catálogo de componentes](#7-catálogo-de-componentes)
8. [Ícones](#8-ícones)
9. [Animações e transições](#9-animações-e-transições)
10. [Responsividade](#10-responsividade)
11. [Acessibilidade](#11-acessibilidade)
12. [Guia para evoluir o sistema](#12-guia-para-evoluir-o-sistema)
13. [Pendências e inconsistências conhecidas](#13-pendências-e-inconsistências-conhecidas)

---

## 1. Princípios visuais

O cabeçalho de formulario.css chama o sistema de "Clean SaaS Moderno". Na prática, a interface segue estes princípios:

- **Paleta quente e terrosa.** O acento principal é o pêssego/terracota (#F69463). Vinho, verde-oliva, âmbar e coral completam a paleta. Azul aparece só em alguns resquícios (ver seção 13).
- **Superfícies claras e bordas finas.** A página usa fundo #fbfbfb, os cartões são brancos com borda de 1px #e8eaed, e as sombras são discretas e de baixa opacidade.
- **Formas arredondadas.** Os componentes de formulário, badges e botões de ação principal têm formato pill (cantos totalmente arredondados). Cartões usam raio de 14px, e a sidebar e o modal chegam a 26px e 28px.
- **Cor como status.** Cada fase da tramitação tem uma cor fixa (seção 2.4). A cor sempre aparece junto de texto (rótulo do badge ou título da coluna), nunca sozinha.
- **Fundos suaves com texto saturado.** Badges e tags usam a cor da marca com opacidade de 12% a 20% no fundo e uma versão mais escura da mesma cor no texto.
- **Movimento curto e com propósito.** As transições duram entre 0,15s e 0,25s. A curva de assinatura é um ease-out expressivo (desaceleração forte no fim). Pulsos contínuos indicam estado "vivo": a conexão com o SharePoint e a etapa atual da timeline.
- **Tema escuro de primeira classe.** Quase todo componente tem uma variante própria para o tema escuro.

---

## 2. Paleta de cores

### 2.1 Cores primitivas (paleta.css)

| Token | Valor | Nome / uso |
|---|---|---|
| --cor-vinho | #B85057 | Marsala / terracota avermelhado. Fim do gradiente da sidebar, texto do item ativo da sidebar, coluna "Devolvido à Área", pill de devoluções. |
| --cor-verde | #668D58 | Sage olive. Sucesso e aprovado, coluna "Aprovado", botão SharePoint do modal. |
| --cor-chumbo | #404040 | Grafite. Texto principal do tema claro, fundo dos toasts. |
| --cor-ambar | #FBBA6D | Ocre dourado. Alerta e pendente, coluna "Em Aprovação". |
| --cor-pessego | #F69463 | Terracota pêssego. **Cor primária**: botões, foco, ícones, item ativo, coluna "Em Revisão". |
| --cor-coral | #F1655D | Coral / goiaba. Perigo, cancelado, atrasado, etapa atual da timeline. |
| --cor-cinza | #808184 | Cinza ardósia. Texto secundário, coluna "Recebido". |

### 2.2 Variações suaves (fundos de badge, hover e tags)

| Token | Claro | Escuro |
|---|---|---|
| --cor-vinho-suave | rgba(184, 80, 87, 0.12) | rgba(184, 80, 87, 0.28) |
| --cor-verde-suave | rgba(102, 141, 88, 0.14) | rgba(102, 141, 88, 0.28) |
| --cor-chumbo-suave | rgba(64, 64, 64, 0.08) | rgba(255, 255, 255, 0.08) |
| --cor-ambar-suave | rgba(251, 186, 109, 0.20) | rgba(251, 186, 109, 0.28) |
| --cor-pessego-suave | rgba(246, 148, 99, 0.15) | rgba(246, 148, 99, 0.28) |
| --cor-coral-suave | rgba(241, 101, 93, 0.14) | rgba(241, 101, 93, 0.28) |
| --cor-cinza-suave | rgba(128, 129, 132, 0.12) | rgba(128, 129, 132, 0.28) |

### 2.3 Neutros e superfícies

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| --cor-fundo | #fbfbfb | #111113 | Fundo da página. Também preenche o recorte côncavo da sidebar. |
| --cor-cartao | #ffffff | #1c1c22 | Superfície de cartões. |
| --cor-borda | #e8eaed | #2e2e38 | Borda padrão. |
| --cor-borda-suave | #f1f3f4 | #25252d | Divisórias leves (ex.: tracejado das ações rápidas do cartão). |
| --cor-borda-foco | --cor-pessego | (herda) | Borda em foco. |
| --cor-texto-principal | --cor-chumbo (#404040) | #f3f4f6 | Texto principal. |
| --cor-texto-secundario | --cor-cinza (#808184) | #a1a1aa | Texto secundário. |
| --cor-texto-mutado | #9ba0a6 | #71717a | Placeholders, legendas e datas. |

### 2.4 Tokens semânticos

| Token | Valor |
|---|---|
| --cor-primaria | --cor-pessego |
| --cor-primaria-hover | #e57f4e |
| --cor-primaria-suave | --cor-pessego-suave |
| --cor-secundaria | --cor-cinza |
| --cor-secundaria-hover | #6c6d70 |
| --cor-destaque / -suave | --cor-vinho / --cor-vinho-suave |
| --cor-sucesso / -suave | --cor-verde / --cor-verde-suave |
| --cor-alerta / -suave | --cor-ambar / --cor-ambar-suave |
| --cor-perigo / -suave | --cor-coral / --cor-coral-suave |

> Atenção: nenhum arquivo do projeto usa hoje os tokens semânticos, com exceção de --cor-primaria-hover. Os componentes referenciam as primitivas diretamente (--cor-pessego, --cor-coral etc.). Em código novo, prefira os semânticos.

### 2.5 Tokens de status da tramitação (paleta.css)

| Token | Valor | Significado |
|---|---|---|
| --status-aprovado-cor / -bg | --cor-verde / --cor-verde-suave | Aprovado, concluído. |
| --status-revisao-cor / -bg | #c26535 / --cor-pessego-suave | Em revisão pela Qualidade. |
| --status-pendente-cor / -bg | #a26914 / --cor-ambar-suave | Pendente, devolvido ao solicitante, prazo vencendo. |
| --status-cancelado-cor / -bg | --cor-coral / --cor-coral-suave | Cancelado. Definido, mas o badge de cancelado não usa. |

formulario.css redefine um segundo conjunto com outra nomenclatura: --status-aprovado-text, --status-revisao-text (#c26535), --status-pendente-text (#a26914), --badge-cancelado-bg e --badge-cancelado-text. Os badges usam esse segundo conjunto (ver seção 13).

### 2.6 Mapa de status → cor

Nas colunas "pill do cartão" os três valores são fundo / texto / borda.

| Fase | Coluna Kanban (index.html) | Pill de status do cartão | Badge (modal/tabela) |
|---|---|---|---|
| Recebido | cinza (--cor-cinza) | status-recebido: #eff6ff / #1d4ed8 / #bfdbfe (azul) | badge-default |
| Em revisão (Qualidade) | pêssego (--cor-pessego) | status-revisao: #fff7ed / #c2410c / #fed7aa | badge-revisao |
| Em revisão junto à área | — | — | badge-revisao-area: #fef3c7 / #b45309 |
| Devolvido à área | vinho (--cor-vinho) | status-devolvido: #fef3c7 / #b45309 / #fde68a | badge-pendente |
| Em aprovação | âmbar (--cor-ambar), ponto "dourado" | status-aprovacao: #f5f3ff / #6d28d9 / #ddd6fe (roxo) | badge-default |
| Aprovado | verde (--cor-verde) | status-aprovado: #f0fdf4 / #15803d / #bbf7d0 | badge-aprovado |
| Cancelado | fora do quadro (modal "Cancelados") | status-cancelado: #fef2f2 / #b91c1c / #fecaca | badge-cancelado |

A escolha da classe a partir do status é feita em planner.js (função obterBadgeClassStatus e no badge da timeline do modal) e em formulario.js (função getStatusBadge).

**Prazo e retrabalho** (pill de prazo, classificada pela função calcularStatusPrazo de planner.js):

| Classe | Regra | Fundo | Texto claro | Texto escuro |
|---|---|---|---|---|
| prazo-ok | mais de 5 dias | --cor-verde-suave | #4b6b40 | #86efac |
| prazo-vencendo | de 0 a 5 dias | --cor-ambar-suave | --status-pendente-cor (#a26914) | #fde047 |
| prazo-atrasado | prazo vencido | --cor-coral-suave | #c23a32 | #fca5a5 |
| devolucao-pill | quantidade de devoluções | --cor-vinho-suave | --cor-vinho | #f3a5aa |

### 2.7 Cores fora da paleta em uso (legado / estilo Tailwind)

Estas cores estão fixas no CSS e não fazem parte da paleta oficial:

- **Slate (neutros):** #0f172a, #1e293b, #334155, #475569, #64748b, #94a3b8, #cbd5e1, #e2e8f0, #f1f5f9 e #f8fafc. Aparecem no formulário pill, no modal, na timeline e na auditoria.
- **Azul:** #2563eb (pontos de coluna, barras de KPI e ícones de ação na variante "blue") e o mesmo azul translúcido na sombra de foco dos inputs genéricos, do botão primário e dos campos do modal de edição.
- **Roxo:** #8b5cf6 (barra de KPI e ponto de coluna na variante "purple") e #6d28d9 (pill de status "aprovação").
- **Teal:** #0f766e e #0d9488 (botão de exportar, botão de salvar anexos no SharePoint e prévia do nome do arquivo).
- **Verde "esmeralda":** #10b981 (indicador pulsante e ponto de sincronização), #ecfdf5, #065f46 e #a7f3d0 (badge do cabeçalho), #16a34a e #15803d (botão de salvar link).
- **Vermelho:** #ef4444 (marcador de obrigatório, contador de cancelados, cartão cancelado), #b91c1c, #fee2e2 e #fecaca.

### 2.8 Classes utilitárias (paleta.css)

Todas têm prioridade forçada:

- Texto: classes "cor-" + nome da cor (vinho, verde, chumbo, ambar, pessego, coral, cinza).
- Fundo sólido (define também a cor do texto): classes "bg-" + nome da cor. O texto é branco, exceto no fundo âmbar, que usa chumbo.
- Fundo suave: classes "bg-" + nome + "-suave". O âmbar suave usa o texto --status-pendente-cor e o pêssego suave usa --status-revisao-cor.
- Borda: classes "borda-" + nome da cor.

Nenhuma página ou script atual usa essas classes, mas elas continuam disponíveis.

---

## 3. Tema claro e escuro

### 3.1 Como o tema é aplicado

- O tema é um atributo (data-theme, com valor "dark" ou "light") no elemento raiz da página.
- O tema claro é o padrão. O tema escuro redefine tokens em dois lugares:
  - paleta.css (bloco 4): superfícies, bordas, textos e todas as variações suaves (opacidade 0,28).
  - formulario.css (seção "Suporte Completo ao Modo Escuro"): tokens de componente.
- Além dos tokens, há dezenas de regras específicas de componente para o tema escuro, muitas com prioridade forçada e cores fixas.

### 3.2 Tokens de componente (formulario.css)

| Token | Claro | Escuro |
|---|---|---|
| --font-primary | Inter, com fallback para as fontes de sistema (Apple, Segoe UI, Roboto, sans-serif) | — |
| --bg-page | --cor-fundo | --cor-fundo → #111113 |
| --bg-card | --cor-cartao | --cor-cartao → #1c1c22 |
| --border-subtle | --cor-borda | --cor-borda → #2e2e38 |
| --border-input | #d8dadc | #373742 |
| --border-focus | --cor-pessego | — |
| --text-primary | --cor-chumbo | #f3f4f6 |
| --text-secondary | --cor-cinza | #a1a1aa |
| --text-muted | --cor-texto-mutado | #71717a |
| --primary / --primary-hover / --primary-light | pêssego / #e57f4e / pêssego-suave | — |
| --shadow-sm | sombra de 1–2px, preto a 4% | sombra de 1–3px, preto a 40% |
| --shadow-card | sombra dupla leve (preto a 3% + chumbo a 6%, até 16px de desfoque) | sombra de 20px de desfoque, preto a 40% |

Superfícies escuras fixas que se repetem nas regras de componente: #141418 e #16161c (rodapés e painéis internos), #1f1f26 (cartões do Kanban), #24242e, #262632 e #282832 (pills e hovers), #2e2e38 e #353544 (bordas).

### 3.3 Persistência

- Chave de armazenamento do navegador: **docflow_theme**, com valor "dark" ou "light".
- **Anti-flash:** cada página (index.html, formulario.html, login.html) tem um script pequeno no cabeçalho, carregado antes das folhas de estilo, que lê a chave. Se o valor for "dark", ou se não houver valor salvo e o sistema operacional preferir o modo escuro, o tema escuro é aplicado antes de a página aparecer.
- data-service.js oferece estas funções:
  - obterTemaAtual: usa o valor salvo, depois a preferência do sistema e, por fim, o tema claro.
  - definirTema: grava a escolha, aplica o tema e marca como ativo o botão correspondente (claro ou escuro).
  - aplicarTemaSalvo: é executada automaticamente quando o módulo carrega.
- A troca de tema fica no dropdown da engrenagem (seletor de tema em pills, anunciado como grupo de opções). Na tela de login, a troca é feita por um botão de ícone que mostra sol ou lua conforme o tema.
- A preferência de colapso da sidebar é persistida do mesmo jeito, na chave docflow_sidebar_colapsada ("1" ou "0"), por sidebar.js.

---

## 4. Tipografia

- **Família:** Inter, carregada do Google Fonts em index.html, formulario.html e login.html, nos pesos 400, 500, 600 e 700. O fallback está no token --font-primary. Inputs e botões herdam a fonte da página. O código do documento na tabela (tabela-codigo) usa fonte monoespaçada.
- **Base do texto:** altura de linha 1,5 e suavização de fonte ativada.
- **Pesos usados no CSS:** 400, 500, 600, 700 e **800**.
  - O peso 800 **não é carregado** do Google Fonts, então o navegador sintetiza o negrito. Usam 800: sidebar-logo-text, sidebar-link ativo, pill-card-title, kpi-val, modal-title, login-title, login-brand-name, devolucao-pill, dot-check e o badge da etapa atual da timeline.
- **Espaçamento entre letras:** títulos grandes usam de -0,01em a -0,03em. Rótulos em caixa alta usam de +0,04em a +0,06em.

### Escala de tamanhos realmente usada

| px | Onde (exemplos) |
|---|---|
| 26 | kpi-val, título do hero |
| 24 | login-title |
| 22 | pill-card-title (título do formulário) |
| 20 | modal-title |
| 18 | app-title, card-title, login-brand-name, ícone de alerta |
| 16 | sidebar-logo-text, tabela-titulo, título do action-card, título do modal de cancelados |
| 15 | custom-dialog-title, auditoria-title |
| 14 | corpo de inputs, btn-primario, pill-input, card-heading, timeline-river-title |
| 13,5 | sidebar-link, planner-col-title, login-input |
| 13 | rótulos, card-description, modal-info-value, nav-link, botões secundários |
| 12,5 | selects universais, badge da etapa atual |
| 12 | badge, app-subtitle, card-meta-row, toasts, col-count-pill |
| 11,5 | kpi-label, btn-auditoria-modal, auditoria-diff-list |
| 11 | pill-label, cabeçalhos de tabela, card-code, btn-card-action, modal-info-label |
| 10,5 | card-status-pill, prazo-pill, devolucao-pill, river-date-label |
| 10 | avatar-initial, user-role-text, river-expand-hint, auditoria-tipo-pill |
| 9,5 | river-subsequent-tag, texto pequeno do demo-info |

Na prática, a hierarquia tem três faixas:

- títulos de página e modal: de 20px a 26px, pesos 700 e 800;
- conteúdo: de 13px a 14px, pesos 500 e 600;
- metadados: de 10px a 12px, pesos 600 e 700, muitas vezes em caixa alta.

---

## 5. Espaçamento, raios e sombras

### 5.1 Espaçamento

Não existe escala formal de espaçamento em tokens: os valores estão escritos diretamente em cada regra. Os mais recorrentes são estes:

- **Espaços entre itens:** 4, 6, 8, 10, 12, 14, 16, 18, 20 e 28 px.
- **Padding de cartões:** card-formulario 28px/32px; kpi-card 16px/18px; planner-col 14px; planner-card 16px; action-card 24px.
- **Container principal** (main-container): padding de 28px no topo, 40px nas laterais e 60px embaixo; espaço de 28px entre blocos; largura máxima de 1680px.
- **Formulário pill:** padding horizontal de 36px (20px abaixo de 640px).
- **Modal:** padding horizontal de 28px.

Recomendação: use múltiplos de 2 e, de preferência, a sequência 4 / 8 / 12 / 16 / 20 / 24 / 28.

### 5.2 Raios

| Valor | Uso |
|---|---|
| --radius-sm 6px | Definido, mas **não usado** via token. 6px aparece fixo em card-status-pill, prazo-pill, btn-card-action e em botões de diálogo. |
| 4px | card-code, card-type-tag, btn-status-quick, toast-desfazer-btn |
| --radius-md 8px | Inputs genéricos, btn-primario/btn-secundario, planner-card, custom-dialog-box |
| 9px | Selects universais, river-step-card |
| 10px | logo-icon, header-settings-btn, login-input, btn-login-submit |
| 12px | nav-menu, action-icon, sinc-wrapper, modal-obs-text |
| --radius-lg 14px | Cartões (card-formulario, kpi-card, planner-col, card-tabela), header-settings-dropdown |
| 16px | sidebar-link, modal-cancelados-card, pill-anexos-container |
| 18px | login-card |
| 20px | modal-right-pane, pill-box-full (área de texto pill) |
| 26px | app-sidebar |
| 28px | card-formulario-pill, modal-card |
| Pill (totalmente arredondado) | badge, pill-input-box, capsule-switch, pill-btn-submit, btn-sharepoint-modal, toast-push-box |
| Círculo | Avatares, pontos da timeline, sidebar-toggle-btn, links da sidebar colapsada |

### 5.3 Sombras

| Nível | Descrição | Uso |
|---|---|---|
| sm | token --shadow-sm | sinc-wrapper, header-settings-btn, user-profile-badge |
| card | token --shadow-card | Cartões, filtros |
| hover de cartão | sombra slate a 8%, com 16px a 24px de desfoque, deslocada para baixo | planner-card e action-card no hover |
| colorida (marca) | sombra pêssego a 32% (botão de envio) e sombra vinho a 45% (sidebar) | pill-btn-submit, app-sidebar |
| flutuante | sombra preta a 15% com 34px de desfoque, mais uma sombra curta a 4% | Dropdown da engrenagem |
| modal | sombra slate a 30% com 60px de desfoque | modal-card |
| toast | sombra preta a 22% com 20px de desfoque | Toasts |

**Anéis de foco (desenhados com sombra, 3px ao redor do elemento):**

- pêssego a 18% nos elementos pill e nos selects;
- pêssego a 20% no login;
- azul a 15% nos inputs genéricos.

**Camadas (ordem de empilhamento):** cabeçalho 100; sidebar: conteúdo 3, recorte 2, botão de colapso 4; dropdown 1000; modal 1000; toasts 9999; diálogos 10000.

---

## 6. Layout

### 6.1 Estrutura geral (app-shell)

A página é uma faixa horizontal com altura mínima de uma tela inteira, dividida em duas partes:

- **Sidebar** (app-sidebar): rail flutuante e fixa durante a rolagem. Contém as peças do recorte (corpo e orelhas superior e inferior), o conteúdo (logo, navegação e rodapé) e o botão de colapso.
- **Coluna principal** (app-main-col): ocupa o espaço restante e contém o container principal (main-container).

### 6.2 Sidebar

- **Expandida:** 220px de largura. **Colapsada:** 72px. A mudança de largura é animada em 0,22s com a curva de assinatura.
- **Posição:** fica fixa a 16px do topo durante a rolagem, com altura da tela menos 32px, margem de 16px no topo, embaixo e à esquerda, e raio de 26px. A rail "flutua" separada das bordas da janela.
- **Fundo:** gradiente diagonal de pêssego (--cor-pessego) para vinho (--cor-vinho), com sombra vinho.
- **Links** (sidebar-link):
  - estado normal: padding 11px/14px, raio 16px, fundo branco a 14%, texto branco a 92% com 13,5px e peso 600;
  - hover: fundo branco a 22%;
  - colapsada: círculo de 46×46px, com o rótulo oculto.
- **Item ativo:**
  - expandida: fundo transparente, texto vinho com peso 800, apoiado sobre o recorte côncavo;
  - colapsada: círculo branco com sombra leve.
- **Recorte côncavo (notch):** posicionado pela função posicionarRecorte de sidebar.js a partir da posição do link ativo na tela.
  - Medidas: orelha de 20px (precisa casar com o raio de 20px das orelhas no CSS), profundidade de 64px (quanto invade a rail) e extensão de 10px (quanto ultrapassa a borda direita).
  - O corpo tem a altura do link e a cor --cor-fundo. As orelhas superior e inferior são quadrados de 20px com um gradiente circular que vai da cor de fundo para o pêssego, o que produz as curvas côncavas.
  - O recorte só aparece depois de posicionado e nunca aparece com a sidebar colapsada.
  - É reposicionado quando a janela muda de tamanho e quando as fontes terminam de carregar, para acompanhar a Inter.
- **Botão de colapso** (sidebar-toggle-btn): círculo branco de 26px, a 38px do topo e metade para fora da borda direita, com ícone de seta em vinho, leve aumento no hover e rótulo acessível atualizado pelo script.
- **Rodapé** (sidebar-footer): selo "SharePoint" com indicador pulsante branco, badge do usuário e engrenagem. O dropdown de configurações, com 290px de largura, abre **para cima**.

### 6.3 Kanban (planner-board, em index.html)

- Grade de 5 colunas iguais com 14px de espaço. Abaixo de 1400px, cada coluna passa a ter no mínimo 260px e o quadro ganha rolagem horizontal. Abaixo de 980px, 1 coluna.
- **Coluna** (planner-col): cartão com altura mínima de 480px, padding 14px e borda superior de 3px na cor da coluna (definida diretamente no HTML), com cabeçalho formado por um ponto colorido de 9px (col-dot), o título (planner-col-title) e o contador (col-count-pill).

| # | Coluna | Borda superior | Variante do ponto |
|---|---|---|---|
| 1 | Recebido | --cor-cinza | cinza |
| 2 | Em Revisão | --cor-pessego | amber (que resulta em pêssego) |
| 3 | Devolvido à Área | --cor-vinho | vinho |
| 4 | Em Aprovação | --cor-ambar | dourado |
| 5 | Aprovado | --cor-verde | green |

- **Cartão** (planner-card): padding 16px, raio 8px, 10px entre blocos. No hover, sobe 2px, a borda fica #cbd5e1 e o título fica pêssego. Estrutura, de cima para baixo:
  - linha de topo (código e revisão);
  - título;
  - etiqueta de tipo;
  - linha de prazo (pill de prazo e pill de devoluções);
  - linha de metadados (avatar com gradiente pêssego→vinho e data);
  - ações rápidas (botões de editar e de ver).
- **Cancelado** (card-cancelado): borda esquerda de 4px em #ef4444 e leve transparência (92%).
- **KPIs** acima do quadro: a grade de KPIs (kpi-grid) tem 5 colunas no CSS, mas index.html sobrescreve para 4 colunas diretamente no HTML.

### 6.4 Modal de detalhes (modal-overlay com modal-card)

- **Fundo escurecido:** slate a 55% com desfoque de 4px e padding de 20px.
- **Cartão:** largura máxima de 980px, raio 28px.
- **Estrutura:**
  - cabeçalho (pill de ID, badges e ações à direita);
  - área do título;
  - área dividida em dois painéis;
  - rodapé (fundo #f8fafc, com o botão verde em pill de abrir no SharePoint).
- **Área dividida** (modal-content-split): painel esquerdo um pouco mais largo que o direito (proporção de cerca de 1,2 para 0,95, com mínimo de 320px à direita), 20px de espaço, altura máxima de 64% da tela com rolagem. Abaixo de 860px, 1 coluna.
  - **Esquerda** (modal-left-pane): grade de 2 colunas de informações (rótulo de 11px em caixa alta + valor de 13px), texto de observações e caixa de anexos.
  - **Direita** (modal-right-pane): painel #f8fafc com raio 20px, contendo a timeline "rio" e o controle de etapa.
- **Timeline "rio"** (timeline-river-flow, altura máxima de 310px com rolagem):
  - Cada etapa tem uma coluna de eixo de 30px (com o ponto e a linha) e uma coluna com o cartão.
  - **Pontos** (22px):
    - etapa anterior: pêssego sólido com ✓;
    - etapa atual: coral com brilho e anel pulsante animado (sharepointPulse);
    - próxima etapa (Aprovação): borda tracejada #94a3b8.
  - **Linhas:**
    - trecho percorrido: 2,5px, gradiente de pêssego para #fbd2bd;
    - trecho seguinte: tracejado cinza.
  - **Cartão da etapa** (river-step-card): clicável, fica com borda pêssego no hover e expande os detalhes com a animação fadeInDialog. A etapa atual tem um badge em coral de 12,5px com peso 800.
  - **Controle de etapa:** rótulos em caixa alta de 11px, seletor de status, campo de destino, campo de observação e o botão de registrar (gradiente pêssego, largura total).

Outros modais seguem a mesma base: o de cancelados (520px, borda #fecaca), o de auditoria (680px) e o diálogo customizado (440px, raio 8px), que substitui as caixas nativas de confirmação e alerta do navegador.

### 6.5 Formulário (formulario.html)

- **Container:** o container principal na variante pill, com largura máxima de 860px, centralizado, com 28px de margem no topo e 60px embaixo.
- **Cartão** (card-formulario-pill):
  - raio 28px, borda #e2e8f0 e sombra azulada muito suave;
  - topo: abas em cápsula ("Novo Documento" e "Revisão Técnica") e o botão de limpar;
  - área do título;
  - grade de campos: 2 colunas, 14px de espaço vertical e 16px horizontal, 1 coluna abaixo de 640px;
  - rodapé: fundo #f8fafc, com as informações do rodapé e o botão de envio.
- **Campo** (pill-input-box): o rótulo fica *dentro* da pill.
  - rótulo de 11px, peso 600, cor #64748b, acima do campo (14px, peso 500, sem borda própria);
  - a caixa tem altura mínima de 56px, fundo #f8fafc e borda de 1,5px #e2e8f0;
  - hover: fundo branco e borda #cbd5e1;
  - com o campo em foco: borda pêssego com anel pêssego a 18%.
- **Variações:** caixa de largura total (raio 20px, altura mínima de 76px, para a área de texto), caixa de arquivo e contêiner de anexos (raio 16px, com etiquetas removíveis).
- **Upload:** o botão de escolher arquivo é um pill pêssego translúcido com texto #c25e2e. A variante secundária é verde (#446338). O campo de arquivo nativo fica oculto.
- Também existe um formulário "clássico" (card-formulario, com grade de 4 colunas e ações no rodapé). Hoje ele não aparece em formulario.html, mas o CSS continua disponível.

---

## 7. Catálogo de componentes

### 7.1 Badges e pills de status

| Classe | Forma | Uso |
|---|---|---|
| badge, nas variantes aprovado / revisao / revisao-area / pendente / default / cancelado | Pill, padding 4px/10px, 12px, peso 600 | Status no modal e na tabela |
| card-status-pill, nas variantes recebido / revisao / devolvido / aprovacao / aprovado / cancelado | Raio 6px, 10,5px, peso 700, com borda | Status compacto no cartão |
| prazo-pill, nas variantes ok / vencendo / atrasado | Raio 6px, 10,5px | Prazo de revisão |
| devolucao-pill | Raio 6px, peso 800, cursor de ajuda | Contador de retrabalho ("↺ N×") |
| card-id-pill | Raio 6px, pêssego translúcido, texto #c25e2e | ID do item no modal |
| col-count-pill, badge-count | Pill | Contadores |
| auditoria-tipo-pill, nas variantes status / edicao / criacao / anexo / cancelamento | Raio 4px, 10px, caixa alta | Tipo de evento na auditoria |
| header-badge com pulse-indicator | Pill verde com ponto pulsante | Status "SharePoint" conectado |
| login-card-badge, auditoria-badge-tag | Pêssego suave, caixa alta | Etiquetas |

No tema escuro, os badges ganham fundo da própria cor a 20%, borda a 35% e texto claro:

- aprovado: #86efac
- revisão: #fdba74
- pendente: #fde047
- cancelado: #fca5a5
- default: #d1d5db

### 7.2 Botões

| Classe | Aparência | Uso |
|---|---|---|
| btn-primario | Fundo primário, texto branco, raio 8px, 14px/600. Hover: cor primária de hover e sobe 1px | Ação principal (ex.: "Novo") |
| btn-secundario | Transparente com borda sutil. Hover: #f1f5f9 | Ação secundária |
| pill-btn-submit | Pill com gradiente diagonal de pêssego para #e57f4e, 14px/700, sombra pêssego | Enviar formulário |
| btn-stage-submit | Gradiente pêssego, largura total, raio 8px | Avançar etapa no modal |
| btn-card-edit | Borda pêssego a 45%, ícone pêssego. Hover: fundo pêssego sólido e texto branco | Editar no cartão |
| btn-card-view | Neutro, ícone cinza. Hover: fundo chumbo sólido | Detalhes no cartão |
| btn-status-quick | Neutro. Hover: pêssego | Troca rápida de status |
| btn-sharepoint-modal | Pill verde (--cor-verde). Hover: #557948 | Abrir no SharePoint |
| btn-exportar, btn-salvar-anexos-sharepoint | Teal #0f766e | Exportar e salvar anexos |
| btn-sinc-pill (variante btn-excel) | Pill neutro (a variante Excel é verde) | Sincronizar e importar |
| btn-cancelados-pill | Vermelho claro (#fef2f2 / #b91c1c) + contador | Abrir lista de cancelados |
| btn-reativar | Verde translúcido | Reativar cancelado |
| btn-editar-modal, btn-auditoria-modal, btn-card-auditoria | Neutros com hover pêssego | Ações do modal |
| btn-salvar-edicao / btn-cancelar-edicao | Pêssego / neutro | Modo de edição do modal |
| custom-dialog-btn, nas variantes cancelar / confirmar-primario / confirmar-perigo | Raio 6px, 12px/600 | Diálogos (o de perigo usa coral e hover #e04f46) |
| btn-login-submit | Gradiente de pêssego para coral, altura 44px | Login |
| header-settings-btn | Quadrado de 38px, raio 10px. Hover: pêssego e o ícone gira 60° | Engrenagem |
| capsule-btn | Aba dentro da cápsula (no escuro, a aba ativa fica pêssego) | Abas do formulário |
| theme-pill-btn | Segmento do seletor de tema | Tema claro/escuro |
| dropdown-action-item (variantes excel e danger) | Linha de ação no dropdown | Menu de configurações |

### 7.3 Inputs

- **Pill** (padrão do formulário): caixa pill com rótulo interno e campo de texto, seleção ou área de texto (ver seção 6.5).
- **Genéricos** (campos de texto, seleção e área de texto sem classe própria): borda --border-input, raio 8px, padding 9px/13px, 14px. Foco com borda pêssego e anel **azul** (ver seção 13).
- **Selects universais** (todos os seletores, incluindo o de etapa, o do modal de edição, os filtros, o pill e o filtro de área):
  - aparência nativa removida, raio 9px, 12,5px;
  - seta desenhada como imagem SVG embutida, em cinza #808184, a 11px da borda direita e centralizada na vertical;
  - foco pêssego com anel de 3px.
- **Busca** (search-box): caixa de 320px com ícone de lupa. Com o campo em foco, a borda fica pêssego.
- **Login** (login-input): altura de 44px, ícone à esquerda (fica pêssego no foco) e botão de mostrar/ocultar senha.
- **Modal de edição:** campos de texto, seleção e área de texto próprios dentro da caixa de edição.

### 7.4 Toasts

| Componente | Formato | Comportamento |
|---|---|---|
| Toast com "Desfazer" (toast-desfazer) | Fixo a 92px do topo, centralizado; fundo chumbo, raio 6px, 12px | Mensagem + botão "DESFAZER" em caixa alta. Entra com a animação slideDownToast e sai com fade. Criado por planner.js. |
| Toast simples (toast-push) | Mesma posição, em pill, com ícone verde #4ade80 | Notificação sem ação. Fecha sozinha. Criado pela função mostrarNotificacaoToast de data-service.js. No escuro, o fundo é #24242e. |

### 7.5 Timeline

- **Timeline "rio"** (modal de detalhes): ver seção 6.4. Seus elementos são a trilha, as etapas, os pontos (anterior, atual e próxima), as linhas (percorrida e seguinte), o cartão da etapa, o badge de status, a data, o autor, a dica "expandir" e os detalhes expandidos (linhas de detalhe e observação).
- **Auditoria** (histórico completo): uma lista de cartões de evento, cada um com a pill de tipo, o autor e a data. As diferenças de edição aparecem numa lista com borda esquerda azul-clara (#38bdf8) e a observação numa caixa com borda esquerda pêssego.

### 7.6 Outros

- **Cartões:** card-formulario, card-tabela, kpi-card (com barra de progresso nas variantes blue, amber, coral, purple e green), action-card e hero-banner (gradiente de #F69463 para #FBBA6D).
- **Tabela:** cabeçalhos em caixa alta de 11px, hover de linha em pêssego a 6%, código em fonte monoespaçada e estado vazio próprio.
- **Alertas:** alerta-sem-anexo (âmbar, com borda esquerda de 4px #f59e0b) e alerta de erro do login (coral).
- **Perfil:** user-profile-badge, user-avatar-pill e dropdown-user-avatar (gradiente de pêssego para coral).
- **Navegação horizontal legada:** nav-menu e nav-link. Ainda estão no CSS, mas a navegação atual usa a sidebar.

---

## 8. Ícones

- **Padrão:** SVG embutido no HTML ou gerado pelos scripts, no estilo "Feather/Lucide":
  - área de desenho de 24×24, sem preenchimento, traço na cor do texto;
  - pontas e junções de traço arredondadas.
  - Não há biblioteca de ícones nem sprite.
- **Tamanhos e espessuras em uso:**
  - 13px com traço 3: setas do botão de colapso da sidebar (sidebar.js);
  - 15–16px com traço 2–2,2: botões e filtros (busca, cancelados, "Novo");
  - 17px com traço 2,3: logo da sidebar;
  - 18px com traço 2–2,2: navegação da sidebar e KPIs;
  - 20px com traço 2: engrenagem.
- **Cor:** o ícone herda a cor do texto do elemento pai. Exceções: a lupa tem cor fixa #94a3b8; os botões de ação do cartão forçam a cor do traço (pêssego no editar, cinza no ver, branco no hover); o ícone do título da timeline é pêssego; a seta dos selects é um SVG embutido em cinza #808184.
- **Caracteres de texto usados como ícone:** ✕ (botão de limpar o formulário), ✓ (ponto de etapa concluída), ↺ (pill de devoluções) e um emoji no alerta de "sem anexo".
- **Recomendação:** para novos ícones, siga a mesma área de 24×24, traço 2 e cor herdada, e escolha o tamanho pelo contexto (16px em botões, 18px em navegação, 20px em ações isoladas).

---

## 9. Animações e transições

### 9.1 Animações nomeadas

| Nome | Efeito | Uso |
|---|---|---|
| pulse | escala de 0,95 a 1 + anel verde até 6px, 2s, infinito | Indicador pulsante |
| spin | rotação completa | Spinners de carregamento |
| modalFadeIn | opacidade de 0 a 1 | Fundo do modal (0,2s), cartão de login (0,3s), alerta de login |
| modalSlideUp | sobe 20px e cresce de 98% para 100%, com opacidade | Cartão do modal (0,25s) |
| sharepointPulse | anel cresce de 0,85 a 1,6 enquanto some, 1,8s, infinito | Anel da etapa atual |
| fadeInDialog | opacidade | Fundo do diálogo (0,15s), detalhes expandidos da timeline (0,18s) |
| scaleUpDialog | cresce de 96% para 100% | Caixa do diálogo (0,18s) |
| slideDownToast | desce 10px até a posição final | Toasts (0,22s) |
| modalEntrada | **não definida** (ver seção 13) | Cartão do modal de cancelados |

### 9.2 Transições

- **Curva de assinatura:** um ease-out expressivo (acelera rápido e desacelera longamente). É usada na largura da sidebar (0,22s), no dropdown (0,22s), no modal, nos toasts, nos diálogos e no botão de login.
- **Micro-interações:** 0,15s a 0,2s com suavização padrão em cor, borda e sombra.
- **Elevação no hover:** sobe 1px em botões primários, 2px em cartões do Kanban e KPIs e 3px em action-card.
- **Ícones:** a engrenagem gira 60° em 0,35s e os ícones dos botões do cartão crescem 8%.
- **Toasts:** a saída some e sobe 8px, em 0,25s a 0,28s.
- **Barras de KPI:** a largura é animada em 0,4s.
- **Redução de movimento:** não existe tratamento para a preferência do sistema de reduzir movimento. As animações infinitas (pulse, sharepointPulse) rodam sempre.

---

## 10. Responsividade

O projeto tem pontos de quebra definidos por largura máxima (abordagem desktop-first):

| Largura | Efeito |
|---|---|
| até 1400px | O quadro Kanban mantém 5 colunas com mínimo de 260px cada e ganha rolagem horizontal |
| até 980px | Ações rápidas em 1 coluna; KPIs em 2 colunas; Kanban em 1 coluna; filtros empilhados; busca com largura total |
| até 860px (sidebar) | A sidebar fica sempre em 72px (modo ícones), mesmo sem estar colapsada: oculta rótulos e recorte, o item ativo vira círculo branco e o botão de colapso some |
| até 860px (modal) | A área dividida do modal passa a 1 coluna (a timeline vai para baixo dos dados) |
| até 640px | Formulário pill: padding lateral de 20px, 1 coluna, rodapé empilhado e botão de envio com largura total |
| até 600px | Cabeçalho e menu horizontal legados empilhados; hero com padding de 24px; KPIs em 1 coluna; card-formulario com padding de 20px; cabeçalho da tabela empilhado |

Limitações observadas:

- A grade de KPIs de index.html tem as 4 colunas definidas diretamente no HTML, e isso anula os pontos de quebra de 980px e 600px. Os 4 KPIs ficam lado a lado mesmo no celular.
- O container principal mantém padding lateral de 40px em qualquer largura. Somado à sidebar de 72px mais 16px de margem, sobra pouco espaço em telas estreitas.
- A sidebar continua visível abaixo de 600px; não existe versão em gaveta ou barra inferior.
- O Kanban tem uma lacuna: rola na horizontal entre 981px e 1400px, mas abaixo de 980px empilha as 5 colunas (cada uma com altura mínima de 480px).

---

## 11. Acessibilidade

### 11.1 Contraste (WCAG 2.1, calculado a partir das cores do CSS)

| Par | Razão | AA texto normal (4,5) |
|---|---|---|
| Chumbo #404040 sobre #fbfbfb | 10,0 | OK |
| Texto claro #f3f4f6 sobre cartão escuro #1c1c22 | 15,4 | OK |
| #a1a1aa sobre #1c1c22 (secundário escuro) | 6,6 | OK |
| Vinho #B85057 sobre #fbfbfb (item ativo sobre o recorte) | 4,7 | OK |
| Branco sobre #0f766e (teal) | 5,5 | OK |
| Badge de cancelado #b91c1c / #fee2e2 | 5,3 | OK |
| Badge padrão #475569 / #f1f5f9 | 6,9 | OK |
| Prazo ok #4b6b40 sobre verde-suave | 5,2 | OK |
| Prazo atrasado #c23a32 sobre coral-suave | 4,6 | OK (no limite) |
| Cinza #808184 sobre branco (texto secundário, células de tabela, rótulos) | 3,9 | **Falha** |
| --cor-texto-mutado #9ba0a6 sobre branco | 2,6 | **Falha** |
| #94a3b8 sobre branco ou #f8fafc (datas da timeline, subtítulos) | 2,5 | **Falha** |
| #71717a sobre #1c1c22 (mutado escuro) | 3,5 | **Falha** |
| **Branco sobre pêssego #F69463** (botão primário, salvar edição, troca rápida de status no hover, aba ativa no escuro, avatar de demonstração) | **2,25** | **Falha** (nem 3:1) |
| Branco sobre #e57f4e (hover e fim do gradiente dos botões pill) | 2,8 | **Falha** |
| Branco sobre coral #F1655D (botão de confirmar perigo) | 3,1 | Falha (passa só em texto grande) |
| Branco sobre verde #668D58 (botão SharePoint do modal) | 3,8 | Falha (passa só em texto grande) |
| Links da sidebar: branco a 92% sobre branco a 14% aplicado ao pêssego (topo do gradiente) | ~1,9 | **Falha** |
| Badge aprovado #668D58 sobre verde-suave | 3,3 | **Falha** |
| Badge revisão #c26535 sobre pêssego-suave | 3,6 | **Falha** |
| Badge pendente #a26914 sobre âmbar-suave | 4,1 | **Falha** (próximo) |
| Pêssego #F69463 como texto sobre branco (link ativo do menu legado, seta dos action-cards, dica de expandir da timeline, etiqueta do login) | 2,25 | **Falha** |
| Coral #F1655D como texto sobre branco (badge da etapa atual, alerta de erro do login) | 3,1 | **Falha** |

Em resumo: o texto branco sobre a cor primária pêssego é o problema mais grave, porque aparece em quase todos os CTAs. Para escurecer, o candidato natural é #c26535 (--status-revisao-cor), mas ele não foi testado com texto branco neste documento. Os textos secundário e mutado também ficam abaixo de 4,5:1.

### 11.2 Foco e teclado

- **Não há estilo de foco visível específico para navegação por teclado.**
- O contorno de foco é removido sem substituto em btn-primario, btn-secundario, btn-exportar e no campo de busca. O teclado fica sem indicação de foco nesses elementos.
- Inputs e selects têm anel de foco desenhado com sombra, o que é aceitável. No formulário pill, o anel aparece na caixa inteira quando o campo interno recebe foco.
- Com a sidebar colapsada, os rótulos dos links ficam ocultos e os links não têm rótulo acessível nem dica. O leitor de tela não lê nome nenhum.
- Os cartões do Kanban e os cartões da timeline são blocos clicáveis que não recebem foco, não têm papel acessível nem respondem a teclas. Não dá para abrir um documento pelo teclado.
- O dropdown da engrenagem abre ao passar o mouse (e fica aberto quando fixado). Vale confirmar que o clique e o teclado também funcionam.
- Pontos positivos:
  - rótulos acessíveis nos botões de ícone (engrenagem, botão de colapso da sidebar atualizado pelo script, tema e senha no login);
  - diálogos customizados marcados como diálogo modal para tecnologias assistivas;
  - seletor de tema marcado como grupo de opções;
  - idioma da página declarado como português do Brasil;
  - todos os campos do formulário associados aos seus rótulos.
- O botão de limpar o formulário usa o caractere ✕ e só tem dica ao passar o mouse. Faltaria um rótulo acessível.
- Não há suporte à preferência de reduzir movimento (ver seção 9).

---

## 12. Guia para evoluir o sistema

### 12.1 Adicionar uma cor

1. **Primitiva:** declare a nova cor em paleta.css, no bloco 1, com o nome "--cor-" + nome, e crie a variação "-suave" no bloco 2, com opacidade entre 0,12 e 0,20.
2. **Tema escuro:** no bloco 4 de paleta.css, redefina a variação suave com opacidade 0,28, seguindo o padrão atual.
3. **Semântica:** se a cor tiver uma função (ex.: "informação"), crie os tokens semânticos correspondentes (por exemplo, --cor-info e --cor-info-suave) no bloco 3, apontando para a primitiva. Nos componentes, use o token semântico.
4. **Texto sobre fundo suave:** se a primitiva não atingir 4,5:1 sobre a própria variação suave, crie uma variante escura, como já foi feito em --status-revisao-cor (#c26535) e --status-pendente-cor (#a26914). No escuro, defina uma variante clara, com luminosidade semelhante a #86efac ou #fca5a5.
5. **Utilitários (opcional):** se precisar, adicione as classes de texto, fundo, fundo suave e borda para a nova cor.
6. **Validação:** verifique o contraste nos dois temas antes de fazer o merge.

### 12.2 Adicionar um status de tramitação

1. Crie os tokens de cor e de fundo do novo status em paleta.css, seguindo o padrão "--status-" + fase + "-cor" e "-bg".
2. Crie o badge e a pill de status do cartão para a nova fase em formulario.css usando **esses tokens**, sem cor fixa, e adicione a variante do tema escuro.
3. Atualize os mapeamentos em planner.js (obterBadgeClassStatus e o badge do modal) e em formulario.js (getStatusBadge). Se for uma nova coluna, adicione a coluna em index.html, com borda superior e ponto colorido, e ajuste a quantidade de colunas do quadro Kanban.

### 12.3 Adicionar um componente

- **Nomenclatura:** classes em português, com palavras separadas por hífen e prefixo por contexto (card-, modal-, river-, pill-, btn-). Estados usam classes modificadoras (active, collapsed, fade-out, selected).
- **Cores:** use apenas tokens: --bg-card, --border-subtle, --text-primary, --text-secondary, --text-muted, --primary e a família --cor-. Não introduza novas cores fixas da família slate ou azul.
- **Tema escuro:** se você usou tokens, o componente se adapta sozinho. Só escreva regras específicas do tema escuro para o que realmente difere, e evite forçar prioridade.
- **Forma:** controles de formulário e CTAs usam pill, cartões usam --radius-lg (14px) e elementos compactos usam --radius-md ou --radius-sm (8px ou 6px).
- **Sombra:** use --shadow-sm ou --shadow-card. Sombras coloridas ficam restritas ao CTA principal.
- **Movimento:** transições de 0,15s a 0,2s com suavização padrão. Para entradas, use a curva de assinatura. Ative animações infinitas apenas quando o usuário não pediu redução de movimento.
- **Foco:** todo elemento interativo precisa de foco visível para teclado. Sugestão: anel pêssego de 3px a 35% com borda pêssego. Use botões e links de verdade, em vez de blocos clicáveis.
- **Ícones:** use SVG 24×24, traço 2, cor herdada, e oculte-o das tecnologias assistivas quando for decorativo.
- **Responsivo:** teste em 1400, 980, 860, 640 e 600px. Evite definir colunas de grade diretamente no HTML, porque isso anula os pontos de quebra.
- **Onde colocar:** acrescente o componente em formulario.css numa seção própria, com um cabeçalho de comentário com o nome do componente, e mantenha a variante escura perto dele ou na seção de tema escuro correspondente.

---

## 13. Pendências e inconsistências conhecidas

1. **Tokens de status duplicados:** paleta.css usa a família --status-…-cor e formulario.css usa --status-…-text e --badge-cancelado-…. O badge de cancelado usa cores fixas (#fee2e2 e #b91c1c) em vez de tokens, e --status-cancelado-… fica sem uso.
2. **Tokens semânticos sem uso:** --cor-primaria, --cor-sucesso, --cor-perigo etc. não são usados. --radius-sm também não é usado.
3. **Anel de foco azul** (azul #2563eb translúcido) nos inputs genéricos, no botão primário (inclusive na sombra em repouso) e nos campos do modal de edição, destoando da marca pêssego.
4. **Duas linguagens de cor para status:** as colunas usam a paleta (cinza, pêssego, vinho, âmbar, verde), mas as pills de status do cartão usam azul, laranja, amarelo, roxo, verde e vermelho em cores estilo Tailwind. As variantes de ponto de coluna "amber" (que é pêssego) e "coral" (que é #d97706, laranja) têm nomes que não correspondem à cor.
5. **A animação modalEntrada não existe:** o modal de cancelados a referencia, então ele abre sem animação.
6. **Peso 800 não carregado** do Google Fonts (só 400 a 700), então o navegador sintetiza o negrito.
7. **Orelhas do recorte** com cor fixa pêssego. A sidebar é um gradiente de pêssego para vinho, então, se o item ativo estiver mais abaixo na rail, as orelhas não casam com o fundo real. Hoje só existem 2 itens no topo, por isso o efeito não aparece.
8. **Select pill sem seta:** a regra universal remove a aparência nativa e desenha a seta como imagem de fundo, mas o select pill força fundo transparente e padding zero, o que remove a seta. Precisa de confirmação visual.
9. **KPIs com colunas definidas no HTML** em index.html, anulando a responsividade.
10. **Classes com regra só para o tema escuro:** river-dest-pill, river-resp-pill, river-obs-note, kanban-card, quadro-coluna, modal-cancelados-footer, modal-flutuante-conteudo e painel-cancelados-conteudo só aparecem em regras do tema escuro. São resquícios ou estão incompletas.
11. **Excesso de prioridade forçada** nas regras do tema escuro, o que dificulta sobrescritas futuras.
12. **Cores que mudam de significado no tema escuro:** o alerta de "sem anexo" é âmbar no claro e vira coral no escuro, mudando o significado. O badge pendente no escuro usa #fde047 (amarelo) em vez de um tom âmbar.
