# Tela inicial "Minha fila"

| Campo | Valor |
|-------|-------|
| Tipo | Proposta de interface/design |
| Status | Rascunho |
| Prioridade | Média |
| Data | 2026-09-28 |
| Autor | Claude |
| Telas afetadas | Nova tela "Minha fila" (index.html, nova visão), Sidebar (novo item), Painel (Kanban), Modal de detalhes |

---

## 1. Objetivo da mudança

Hoje cada pessoa precisa varrer as 5 colunas do Kanban para descobrir o que é dela. A "Minha fila" abre o sistema já respondendo à pergunta "o que eu preciso fazer agora?", com três blocos: o que está comigo, o que voltou para a minha área e o que está atrasado ou vencendo.

## 2. Situação atual

- A entrada do sistema é o Painel (Kanban geral) com todos os documentos de todas as áreas. O filtro por área e a busca ajudam, mas precisam ser refeitos a cada visita.
- O campo "responsável" existe no histórico de cada etapa (obrigatório em devoluções e aprovações, definido em "Atualizar Etapa"), mas não há nenhuma visão que filtre por ele.
- Devoluções à área ficam misturadas na coluna "Devolvido à Área"; o Solicitante não tem um lugar claro para ver só as da sua área.
- O prazo aparece só como pill no cartão (prazo-ok, prazo-vencendo, prazo-atrasado). Não há lista de atrasados por pessoa.
- Consequência: documentos parados sem dono percebido, retrabalho e cobrança manual da Qualidade.

## 3. Proposta

### 3.1 Layout

**Desktop (1024px ou mais):**

```
┌ sidebar ┐ ┌──────────────────────────────────────────────────────────────┐
│ Minha   │ │ Olá, {primeiro nome}                                          │
│ fila  ● │ │ Sua fila em {data de hoje}          [Ver painel geral →]      │
│ Painel  │ │                                                               │
│ Novo    │ │ ┌ Contadores (3 kpi-card clicáveis) ─────────────────────────┐ │
│         │ │ │ [ Comigo  7 ] [ Devolvidos à área  3 ] [ Atrasados 2 · 4 ]  │ │
│         │ │ └─────────────────────────────────────────────────────────────┘ │
│         │ │ ┌ Bloco 1: Comigo ────────┐ ┌ Bloco 3: Prazos ───────────────┐ │
│         │ │ │ linha de documento      │ │ Atrasados (2)                   │ │
│         │ │ │ linha de documento      │ │   linha de documento            │ │
│         │ │ │ ...  Ver todos (7)      │ │ Vencem em até 5 dias (4)        │ │
│         │ │ └─────────────────────────┘ │   linha de documento            │ │
│         │ │ ┌ Bloco 2: Devolvidos ────┐ └─────────────────────────────────┘ │
│         │ │ │ linha de documento      │                                     │
│         │ │ └─────────────────────────┘                                     │
└─────────┘ └──────────────────────────────────────────────────────────────┘
```

- Cabeçalho da página: saudação (18px/700), linha de data em --text-secondary e o botão secundário "Ver painel geral" à direita.
- Faixa de contadores: 3 kpi-card lado a lado. Cada um é um botão que rola até o bloco correspondente e dá foco ao título dele.
- Grade principal de 2 colunas (proporção 1,2 : 1): à esquerda "Comigo" e, abaixo, "Devolvidos à minha área"; à direita "Prazos", fixo no topo durante a rolagem (sticky a 16px), porque é o bloco mais urgente.
- Ordem de leitura e de tabulação: contadores → Comigo → Devolvidos → Prazos. No celular a ordem visual muda (ver seção 5).

**Linha de documento (fila-item), usada nos três blocos:**

```
┌──────────────────────────────────────────────────────────────────────┐
│ ▌ PR-QUA-012 · rev. 03   [Em Revisão]                  [prazo-pill]  │
│ ▌ Procedimento de controle de documentos                             │
│ ▌ Área: Suprimentos · desde 12/09 (16 dias)  ↺ 2×                    │
│ ▌                           [Ação principal]  [Abrir]  [⋯]           │
└──────────────────────────────────────────────────────────────────────┘
```

- Barra esquerda de 3px na cor da fase (mesmo mapa das colunas do Kanban), sempre acompanhada do badge com o nome da fase.
- Linha 1: código e revisão (card-code), badge de status e prazo-pill alinhada à direita.
- Linha 2: título, 14px/600, até 2 linhas com reticências.
- Linha 3: metadados 12px em --text-secondary: área, "desde" (data de entrada na etapa atual e dias corridos) e devolucao-pill quando houver.
- Linha 4: ações rápidas alinhadas à direita.
- Cada bloco mostra no máximo 5 linhas; depois disso, o link "Ver todos ({n})" expande o bloco no lugar (sem trocar de página).

**Ordenação dentro de cada bloco:** atrasados primeiro, depois menor prazo restante, depois há mais tempo na etapa. Sem prazo definido vai para o fim.

### 3.2 Componentes

Reaproveitados (04-design.md, seção 7):

| Componente | Uso na Minha fila |
|---|---|
| kpi-card | Contadores, sem barra de progresso. Número em kpi-val (26px), rótulo em kpi-label. |
| card-tabela (base de cartão, --radius-lg 14px, --shadow-card) | Contêiner de cada bloco. |
| badge (variantes existentes) | Status do documento na linha. |
| prazo-pill (ok, vencendo, atrasado) | Prazo na linha. Mesma regra de calcularStatusPrazo. |
| devolucao-pill | Contador de retrabalho "↺ N×". |
| card-code | Código do documento. |
| btn-primario | Ação principal da linha (forte, com os tokens de CTA acessíveis). |
| btn-secundario | "Abrir", "Ver painel geral", "Ver todos". |
| btn-status-quick | Base visual do menu "⋯" de outras ações. |
| toast-desfazer | Confirmação das ações rápidas, com "DESFAZER". |
| Modal de detalhes | Aberto por "Abrir" e pelo clique no título. |
| Estado vazio da tabela | Base do estado vazio dos blocos. |

Novos (mínimos):

| Classe proposta | Base | Função |
|---|---|---|
| fila-pagina | main-container | Página da Minha fila. |
| fila-contadores | kpi-grid | Faixa dos 3 contadores, com colunas definidas só no CSS (nunca no HTML, para não repetir a pendência D4). |
| fila-bloco | card-tabela | Bloco com cabeçalho (ícone 18px, título 16px/700, col-count-pill) e lista. |
| fila-item | planner-card | Linha de documento descrita em 3.1. |
| fila-vazio | estado vazio da tabela | Estado vazio com ícone, título e texto. |
| fila-subgrupo | — | Subtítulo "Atrasados" / "Vencem em até 5 dias" dentro do bloco Prazos. |
| is-expandido, is-carregando, is-concluido | modificadores | Estados. |

**Ações rápidas por bloco** (as mesmas transições que já existem no Kanban e no modal; nada novo de regra):

| Bloco / situação | Ação principal | Outras ações (menu ⋯) |
|---|---|---|
| Comigo, documento em Recebido | Iniciar revisão | Devolver à área |
| Comigo, em Em Revisão | Enviar p/ aprovação | Devolver à área, Aprovar |
| Comigo, em Em Aprovação | Aprovar | Devolver à área |
| Devolvidos à minha área | Retomar revisão (reenvia à Qualidade) | P/ aprovação |
| Prazos | A ação principal do estágio atual (mesma regra acima) | Abrir no SharePoint |

As ações que hoje exigem responsável ou observação (devolução e envio para aprovação) abrem o controle "Atualizar Etapa" do modal de detalhes já com o status escolhido, em vez de mudar direto. Ações sem campos obrigatórios mudam direto e mostram o toast com "DESFAZER". A disponibilidade de cada ação segue o perfil do usuário, igual ao Kanban.

### 3.3 Estados

| Estado | Aparência |
|---|---|
| Padrão | Como em 3.1. |
| Hover da linha | Fundo --cor-primaria-suave a meio caminho (usar --cor-pessego-suave), borda --border-subtle, sem elevação (a lista é densa; elevação fica só no Kanban). |
| Foco de teclado | Anel de foco da marca (--cor-foco, 2px, afastado 2px), já implantado. |
| Carregando | 3 linhas-esqueleto por bloco em --cor-chumbo-suave; contadores mostram "–". Sem pulsar se o usuário pediu menos movimento. |
| Ação em andamento | Botão da ação com spinner e texto da ação no gerúndio; a linha fica com opacidade 60% e não aceita outro clique. |
| Ação concluída | A linha some do bloco com fade de 0,2s (instantâneo com menos movimento), o contador cai 1 e aparece o toast com "DESFAZER". Se a ação levar o documento a outro bloco da pessoa, ele aparece lá. |
| Erro na ação | A linha volta ao normal, e aparece o banner compacto envio-erro-banner dentro do bloco, com "Tentar novamente". |
| Sem conexão | Faixa envio-offline-faixa no topo da página; as ações rápidas ficam desabilitadas com dica "Disponível quando a conexão voltar." A leitura continua (dados do navegador). |
| Vazio | Por bloco, com microcopy própria (3.4). Contador mostra 0 em --text-secondary, sem cor de alerta. |
| Tudo vazio | Os 3 blocos são substituídos por um único estado vazio central (3.4) com o botão "Ver painel geral". |
| Usuário sem área definida | Bloco 2 mostra o estado vazio "sem área", com orientação. |

### 3.4 Microcopy

| Local | Texto atual | Texto proposto |
|-------|-------------|----------------|
| Item da sidebar | — | Minha fila |
| Título da página (aba do navegador) | — | Minha fila · DocFlow |
| Saudação | — | Olá, {primeiro nome} |
| Linha de data | — | Sua fila em {dia da semana}, {dd/mm} |
| Botão para o Kanban | — | Ver painel geral |
| Contador 1, rótulo | — | Comigo |
| Contador 2, rótulo | — | Devolvidos à minha área |
| Contador 3, rótulo | — | Atrasados · vencendo |
| Contador 3, valor | — | {a} · {v} |
| Contador, rótulo acessível | — | {n} documentos com você. Ir para a lista / {n} documentos devolvidos à sua área. Ir para a lista / {a} atrasados e {v} vencendo em até 5 dias. Ir para a lista |
| Bloco 1, título | — | Comigo |
| Bloco 1, subtítulo | — | Documentos em que você é o responsável pela etapa atual. |
| Bloco 2, título | — | Devolvidos à minha área |
| Bloco 2, subtítulo | — | A Qualidade devolveu para ajuste. Corrija e reenvie. |
| Bloco 3, título | — | Prazos |
| Bloco 3, subgrupos | — | Atrasados / Vencem em até 5 dias |
| Linha, metadado de tempo | — | desde {dd/mm} ({n} dias) |
| Linha, botão abrir | — | Abrir |
| Linha, menu de ações (rótulo acessível) | — | Mais ações para {código} |
| Ações | (iguais ao Kanban) | Iniciar revisão / Enviar p/ aprovação / Aprovar / Devolver à área / Retomar revisão |
| Ação em andamento | — | Iniciando… / Enviando… / Aprovando… / Devolvendo… / Retomando… |
| Toast após ação | — | {código} foi para "{nova fase}". |
| Link "ver todos" | — | Ver todos ({n}) / Mostrar menos |
| Vazio, bloco 1 | — | Nada com você agora. Quando alguém te indicar como responsável de uma etapa, o documento aparece aqui. |
| Vazio, bloco 2 | — | Nenhuma devolução para {área}. Tudo o que a sua área enviou está com a Qualidade ou já foi aprovado. |
| Vazio, bloco 2, sem área | — | Seu cadastro está sem área. Peça à Qualidade para completar, e as devoluções da sua área vão aparecer aqui. |
| Vazio, bloco 3 | — | Nenhum prazo em risco. Nada atrasado nem vencendo nos próximos 5 dias. |
| Vazio, página inteira, título | — | Fila em dia |
| Vazio, página inteira, texto | — | Nenhum documento depende de você neste momento. Para acompanhar a tramitação de todas as áreas, use o painel geral. |
| Erro de carregamento | — | Não foi possível carregar a sua fila. Mostrando os dados guardados neste computador às {hh:mm}. |
| Erro de carregamento, botão | — | Tentar novamente |
| Ação sem conexão (dica) | — | Disponível quando a conexão voltar. |
| Preferência de tela inicial | — | Abrir o DocFlow em: Minha fila / Painel geral |

Tom igual ao da ideia de feedback de envio: frases curtas, voz ativa, sem ponto de exclamação, sempre dizendo o próximo passo.

## 4. Paleta e tokens

Nenhuma cor nova. Só tokens de paleta.css, formulario.css e os já implantados pela ideia de feedback de envio e acessibilidade.

| Elemento | Token |
|---|---|
| Fundo da página | --bg-page |
| Blocos, contadores, linhas | --bg-card, borda --border-subtle, sombra --shadow-card |
| Texto principal / metadados / datas | --text-primary / --text-secondary (evitar --text-muted em texto, que falha no contraste) |
| Ação principal da linha | fundo --cor-primaria-forte, hover --cor-primaria-forte-hover, texto --cor-texto-sobre-primaria |
| Foco | --cor-foco (anel já implantado) |
| Hover da linha | --cor-pessego-suave |
| Barra da fase na linha | --cor-cinza (Recebido), --cor-pessego (Em Revisão), --cor-vinho (Devolvido), --cor-ambar (Em Aprovação), --cor-verde (Aprovado) |
| Ícone e número do contador "Comigo" | ícone --cor-primaria-forte; número --text-primary |
| Ícone do contador "Devolvidos" | --cor-destaque (vinho) |
| Número de atrasados no contador 3 | --cor-erro, só quando maior que 0 |
| Número de vencendo no contador 3 | --status-pendente-cor, só quando maior que 0 |
| Subgrupo "Atrasados" | rótulo em --cor-erro, fundo --cor-erro-suave |
| Subgrupo "Vencem em até 5 dias" | rótulo em --status-pendente-cor, fundo --cor-ambar-suave |
| Estado vazio | ícone em --cor-verde (tudo em dia), texto --text-secondary |
| Esqueleto de carregamento | --cor-chumbo-suave |

Contrastes: todos os pares de texto reaproveitam pares já medidos no 04-design.md e na ideia de feedback (CTA 4,91:1; --cor-erro 5,32:1; texto secundário escuro 6,6:1). A barra de fase de 3px é decorativa, pois o nome da fase sempre aparece no badge ao lado. Atenção: --text-secondary claro (#808184) sobre branco dá 3,9:1; como os metadados usam 12px, a linha 3 deve usar --text-primary com peso 500 até que a pendência de contraste do texto secundário seja resolvida, ou até o Eric decidir aceitar o risco.

## 5. Responsivo e tema escuro

**1024px ou mais:** layout de 3.1. Bloco Prazos fixo à direita.

**768px (até 980px):** contadores em 3 colunas compactas (número 22px, rótulo em 2 linhas); blocos em 1 coluna, na ordem Prazos → Comigo → Devolvidos (o urgente sobe). Sidebar em modo ícones (72px), com o item "Minha fila" no topo.

**360px (até 640px):**

```
┌────────────────────────────┐
│ Olá, Eric                  │
│ Sua fila em seg, 28/09     │
│ ┌─────┐┌─────┐┌─────┐     │  contadores em faixa rolável
│ │ 7   ││ 3   ││ 2·4 │ →   │  na horizontal (só a faixa rola)
│ └─────┘└─────┘└─────┘     │
│ Prazos                (6) │
│ ┌────────────────────────┐ │
│ │▌PR-QUA-012  [atrasado] │ │
│ │▌Procedimento de...     │ │
│ │▌Suprimentos · 16 dias  │ │
│ │▌[   Ação principal   ] │ │  largura total, 44px de altura
│ │▌[Abrir]         [ ⋯ ]  │ │
│ └────────────────────────┘ │
│ Comigo                (7) │
│ ...                        │
│ [ Ver painel geral ]       │
└────────────────────────────┘
```

- Padding lateral da página de 16px (não os 40px do main-container).
- Contadores: faixa com rolagem horizontal própria e encaixe por cartão; a página não rola na horizontal.
- Linha: badge de status vai para a linha 3; ação principal em largura total; "Abrir" e "⋯" em linha abaixo.
- Cada bloco mostra 3 linhas antes de "Ver todos".
- "Ver painel geral" desce para o fim da página.
- Dependência de layout: a sidebar ainda não tem versão para celular (04-design.md, seção 10). Esta ideia não resolve isso; em 360px a Minha fila funciona com a sidebar de 72px, mas ganha espaço real quando existir a versão em barra inferior (ver dependências).

**Tema escuro:** tudo por token, sem regra específica além das abaixo.

| Elemento | Claro | Escuro |
|---|---|---|
| Blocos e linhas | --bg-card #ffffff | --bg-card #1c1c22 (linhas em #1f1f26, como os cartões do Kanban) |
| Hover da linha | --cor-pessego-suave (15%) | --cor-pessego-suave (28%) |
| CTA da linha | #B4552A / #A84F26, texto branco | igual |
| Anel de foco | #B4552A | #F69463 |
| Atrasados (texto) | --cor-erro #c23a32 | --cor-erro #fca5a5 |
| Vencendo (texto) | --status-pendente-cor #a26914 | tom claro já usado na prazo-pill escura |
| Esqueleto | --cor-chumbo-suave (preto 8%) | --cor-chumbo-suave (branco 8%) |
| Ícone do estado vazio | --cor-verde | --cor-verde sobre fundo --cor-verde-suave (28%) |

## 6. Acessibilidade

- Contraste: ver seção 4. Nenhum texto branco sobre pêssego claro.
- A página tem um título principal (a saudação) e cada bloco é uma região com título de nível 2 e contador anunciado junto ("Comigo, 7 documentos").
- Cada linha é um item de lista; o título do documento é um botão de verdade que abre o modal. Ação principal, "Abrir" e "⋯" são botões tabuláveis na ordem visual.
- Rótulo acessível da linha: "{código}, {título}, {fase}, prazo {situação}, {n} devoluções".
- Menu "⋯": abre com Enter/Espaço, setas navegam, Esc fecha e devolve o foco ao botão.
- Depois de uma ação concluída, o foco vai para a próxima linha do mesmo bloco (ou para o título do bloco, se ele esvaziou). A mudança do contador é anunciada numa região de status educada.
- Contadores: botões com os rótulos da seção 3.4; ao ativar, o foco vai para o título do bloco.
- Área de clique mínima de 44×44px em todos os botões da linha e no "⋯".
- Menos movimento: sem fade na saída da linha, sem rolagem suave, esqueleto parado.
- Cor nunca sozinha: atrasado e vencendo sempre com texto da prazo-pill; fase sempre com badge.

## 7. Critérios de aceite visuais

- [ ] Funciona no tema claro e no escuro.
- [ ] Funciona em tela de celular (360px) sem rolagem horizontal da página (só a faixa de contadores rola).
- [ ] O item "Minha fila" aparece no topo da sidebar, com o recorte côncavo quando ativo.
- [ ] Os 3 contadores batem com o número de linhas de cada bloco; clicar num contador leva ao bloco e dá foco ao título.
- [ ] Um documento em que o usuário é o responsável da etapa atual aparece em "Comigo"; um documento em "Devolvido à Área" da área do usuário aparece em "Devolvidos à minha área"; um documento do usuário com prazo vencido aparece em "Atrasados".
- [ ] A ordem dentro de cada bloco é: atrasados, menor prazo, mais tempo na etapa.
- [ ] Cada bloco vazio mostra exatamente a microcopy da seção 3.4; com tudo vazio, aparece "Fila em dia".
- [ ] A ação principal usa fundo #B4552A (hover #A84F26) com texto branco, ≥ 4,5:1 no verificador.
- [ ] Ação sem campos obrigatórios: a linha sai do bloco, o contador diminui e o toast com "DESFAZER" aparece; desfazer devolve a linha.
- [ ] Devolução e envio para aprovação abrem o "Atualizar Etapa" do modal já com o status escolhido.
- [ ] O mesmo documento aparece igual no Kanban geral depois de uma ação feita na Minha fila (e vice-versa).
- [ ] Navegação só por teclado: Tab percorre contadores, blocos e botões de cada linha; o anel de foco é visível em todos.
- [ ] Sem conexão, as ações ficam desabilitadas com a dica, e a leitura continua.
- [ ] Com "reduzir movimento", nenhuma linha desliza ou some com animação.

---

## Convivência com o Kanban geral

- **São duas visões dos mesmos dados.** A Minha fila não tem regra própria de status, prazo ou transição; usa as mesmas funções do Kanban (classificação da fase, calcularStatusPrazo, ações rápidas, "Atualizar Etapa"). Uma ação feita em uma aparece na outra.
- **Tela inicial por perfil:** Solicitante abre na Minha fila; Qualidade e Administrador abrem no Painel geral, porque trabalham com a visão de todas as áreas. Qualquer um pode trocar em "Abrir o DocFlow em:" no dropdown da engrenagem (preferência guardada no navegador, como o tema).
- **Navegação:** a sidebar ganha "Minha fila" acima de "Painel". A Minha fila tem o botão "Ver painel geral"; o Painel ganha, ao lado da busca, um chip "Só os meus" que aplica no Kanban o mesmo filtro do bloco "Comigo" (atalho para quem prefere colunas).
- **O Kanban continua sendo o lugar** de visão geral, KPIs de todas as áreas, cancelados, exportação e sincronização. A Minha fila não repete esses controles.
- **Modal único:** "Abrir" usa o mesmo modal de detalhes; ao fechar, volta à Minha fila com o foco na linha de origem.
- **Indicadores SGI** (ideia implantada) continuam no Painel; a Minha fila não mostra gráficos.

## Dependências e pontos em aberto

- **Implantadas (base):** feedback de envio e acessibilidade (tokens de CTA, anel de foco, banner de erro, faixa offline, movimento reduzido); integridade da sincronização (identificação por ID e status que realmente atualiza a planilha, sem os quais as ações rápidas da fila são arriscadas); painel de indicadores (continua no Painel, sem mudança).
- **Regra de "responsável" (pode exigir uma ideia de função):** hoje o responsável e o destino são texto livre gravados no histórico da etapa. Para o bloco "Comigo" funcionar, é preciso comparar esse campo com o usuário logado de forma confiável (idealmente, escolha do responsável a partir da lista de usuários, guardando o e-mail). Se isso não existir, o Antigravity não deve inventar regra: a comparação provisória é pelo nome exato do usuário, e isso fica anotado como limitação.
- **Área do usuário:** o bloco 2 depende da área do cadastro do usuário e da área do documento terem a mesma grafia.
- **Sidebar para celular:** ideia futura separada; a Minha fila funciona sem ela.

---

## Instruções para o Antigravity

- **O que implementar:**
  1. Nova visão "Minha fila" com cabeçalho, faixa de 3 contadores e os blocos Comigo, Devolvidos à minha área e Prazos (seção 3.1), linha de documento fila-item e ordenação definida.
  2. Filtros de cada bloco, reaproveitando os dados já carregados: Comigo = responsável da etapa atual igual ao usuário logado; Devolvidos = fase "Devolvido à Área" e área do documento igual à área do usuário; Prazos = documentos dos blocos 1 e 2 mais os que o usuário enviou (remetente), com prazo atrasado ou de 0 a 5 dias, em dois subgrupos. Cancelados e aprovados ficam fora.
  3. Ações rápidas da tabela da seção 3.2, chamando as mesmas funções do Kanban; devolução e envio para aprovação abrem o "Atualizar Etapa" do modal.
  4. Estados da seção 3.3 e microcopy exata da seção 3.4.
  5. Item "Minha fila" na sidebar, tela inicial por perfil, preferência "Abrir o DocFlow em:" no dropdown da engrenagem e chip "Só os meus" no Painel.
  6. Responsivo e tema escuro da seção 5; acessibilidade da seção 6.
- **Onde (telas e arquivos):** index.html (nova visão e item da sidebar), planner.js (renderização da fila, filtros, reaproveitamento das ações e do modal, chip "Só os meus"), formulario.css (novas classes fila-*, variantes escuras e pontos de quebra), data-service.js (preferência de tela inicial, no mesmo padrão da chave de tema), sidebar.js (recorte para o novo item). Tokens: só os existentes em paleta.css.
- **O que não alterar:** regras de status, transições, cálculo de prazo, sincronização e o próprio Kanban (exceto o chip "Só os meus"); valores dos tokens; posição dos toasts. Não criar cores fixas. Não definir colunas de grade no HTML.
- **Como testar:** entrar com um Solicitante e com um usuário da Qualidade; conferir os critérios da seção 7 em 1440px, 768px e 360px, nos temas claro e escuro; fazer uma ação na fila e conferir no Kanban; simular sem conexão pelo DevTools; percorrer só com teclado; ligar "reduzir movimento"; medir contraste da ação principal e dos textos de prazo.

---

## Resultado da implantação

- **Data da implantação:**
- **Validado por:** Eric
- **O que foi feito:**
- **Diferenças em relação à proposta:**
- **Observações e pendências:**
