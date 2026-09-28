# Feedback do envio, validação visível e acessibilidade dos CTAs

| Campo | Valor |
|-------|-------|
| Tipo | Proposta de interface/design |
| Status | Aprovada |
| Prioridade | Alta |
| Data | 2026-09-28 |
| Autor | Claude |
| Telas afetadas | Novo Documento / Revisão Técnica (formulario.html), Painel Kanban (index.html), todos os CTAs pêssego do sistema |

<!-- Nome do arquivo: AAAA-MM-DD_design_titulo-curto.md. Veja ideias/README.md. -->

---

## 1. Objetivo da mudança

Dar ao usuário a certeza de que o cadastro foi registrado (ou de por que não foi), sem nunca perder o que ele digitou, e tornar os botões principais, o foco e o Kanban utilizáveis por quem depende de contraste, teclado ou menos movimento.

## 2. Situação atual

- **Envio sem retorno.** Ao clicar em "Registrar Documento", o formulário é limpo e nada é exibido: nem confirmação, nem erro. Se o envio falha, os dados são apagados do mesmo jeito e o usuário precisa redigitar tudo.
- **Bloqueio silencioso.** O campo "Arquivo do Documento Principal" é obrigatório, mas o input de arquivo nativo fica oculto (hidden-file-input). O navegador tenta mostrar o balão de "preencha este campo" num elemento invisível, então o clique em enviar simplesmente não faz nada.
- **Obrigatórios sem sinalização consistente.** Não há mensagem inline por campo nem resumo de pendências.
- **Contraste dos CTAs.** Branco sobre pêssego #F69463 = **2,25:1**; sobre o hover #e57f4e = **2,81:1**. Falha AA até para texto grande (3:1). Afeta pill-btn-submit, btn-primario, btn-stage-submit, btn-salvar-edicao, hover de btn-card-edit e btn-status-quick (ver 04-design.md, seção 11.1).
- **Foco invisível.** btn-primario, btn-secundario, btn-exportar e a busca removem o contorno sem substituto.
- **Kanban inacessível por teclado.** planner-card não recebe foco nem responde a Enter/Espaço.
- **Movimento.** pulse e sharepointPulse rodam sempre; não há tratamento de prefers-reduced-motion.

## 3. Proposta

### 3.1 Layout

**Formulário (card-formulario-pill), de cima para baixo:**

```
┌───────────────────────────────────────────────────────────┐
│ [Novo Documento | Revisão Técnica]                     ✕  │
│ Registro de Documento                                     │
│ ┌─ Resumo de erros (só aparece após tentativa) ─────────┐ │
│ │ ⚠ Faltam 2 itens para registrar o documento:          │ │
│ │   • Título do Documento  (link âncora)                │ │
│ │   • Arquivo do Documento Principal  (link âncora)     │ │
│ └───────────────────────────────────────────────────────┘ │
│ [Título *            ] [Tipo de Documento *   ]           │
│  ⓘ Informe o título do documento.                         │
│ ...                                                       │
│ ┌─ Área de upload do arquivo principal (tracejada) ─────┐ │
│ │  ⬆  Arraste o arquivo aqui ou [Procurar Arquivo]      │ │
│ │     Um único arquivo. Word, Excel ou PDF de preferência│ │
│ └───────────────────────────────────────────────────────┘ │
│  ⓘ Selecione o arquivo do documento principal.            │
│ ─────────────────────────────────────────────────────────│
│ rodapé:  info do rodapé               [ Registrar Documento ]│
│  (banner de erro de envio aparece aqui, acima do botão)   │
└───────────────────────────────────────────────────────────┘
```

- O **resumo de erros** fica logo abaixo do título do cartão, dentro do fluxo (não flutuante), largura total da grade.
- A **mensagem inline** fica imediatamente abaixo da pill do campo, alinhada à margem interna do rótulo (16px), 12px de texto.
- O **banner de erro de envio** fica no rodapé, acima do botão, largura total; no celular empilha com o botão.
- O **toast de sucesso** usa a posição já existente dos toasts (fixo a 92px do topo, centralizado).
- O **aviso offline** aparece como faixa fina no topo do cartão do formulário (acima das abas).

### 3.2 Componentes

Reaproveitados (04-design.md, seção 7):

- **pill-btn-submit**: ganha estado "enviando" e novas cores (seção 4).
- **toast-push**: variante de sucesso com link de ação; variante de pendência.
- **pill-input-box**: ganha modificador de erro.
- **alerta-sem-anexo**: serve de base visual (borda esquerda de 4px) para o resumo e o banner de erro.
- **spin**: animação existente para o indicador do botão.

Novos (mínimos, necessários):

| Classe proposta | Base | Função |
|---|---|---|
| pill-dropzone | pill-file-box | Área de upload do arquivo principal com borda tracejada, estados de arrastar, preenchido e erro. |
| campo-erro-msg | — | Texto de erro inline sob o campo. |
| form-resumo-erros | alerta-sem-anexo | Caixa-resumo com lista de links para os campos pendentes. |
| envio-erro-banner | alerta-sem-anexo | Banner de falha de envio com botão "Tentar novamente". |
| envio-offline-faixa | — | Faixa informativa de conexão/pendência. |
| is-erro, is-enviando, is-arrastando, is-preenchido | modificadores | Estados, seguindo o padrão de modificadores do projeto. |

### 3.3 Estados

**A. Botão de envio (pill-btn-submit)**

| Estado | Aparência |
|---|---|
| Padrão | Gradiente de --cor-primaria-forte para --cor-primaria-forte-hover, texto branco 14px/700, sombra pêssego existente. |
| Hover | Fundo sólido --cor-primaria-forte-hover, sobe 1px. |
| Foco (teclado) | Anel de foco da marca (seção 6.2). |
| Enviando | Texto troca para "Registrando…", spinner branco de 16px à esquerda do texto (animação spin), largura do botão travada (não encolhe), opacidade 100%, cursor de espera, botão desabilitado para novo clique. Todos os campos ficam somente leitura (não desabilitados, para não perder contraste). |
| Desabilitado | Só durante o envio. Fora dele o botão nunca fica desabilitado: o clique sempre dispara a validação visível. |

**B. Sucesso**

- O formulário é limpo **somente** depois da confirmação de gravação.
- Toast de sucesso (toast-push) com ícone verde de check, título, código do documento e link "Ver no painel" que abre index.html com o documento destacado (o cartão recebe o foco e um contorno pêssego por 2s).
- Duração: 8s (mais que o toast comum, pois tem ação). Pausa ao passar o mouse ou receber foco. Botão de fechar ✕ com rótulo acessível.
- O foco do teclado volta ao primeiro campo do formulário limpo.

**C. Erro de envio**

- Nenhum campo é limpo. Arquivo principal e anexos continuam listados.
- Banner envio-erro-banner no rodapé, acima do botão: borda esquerda de 4px na cor de erro, fundo --cor-coral-suave, ícone de alerta, título, descrição e botão secundário "Tentar novamente".
- O botão volta ao estado padrão. O banner recebe o foco (para leitor de tela) e é anunciado como alerta.
- Se o erro for de um campo (ex.: título duplicado), o campo também entra em estado de erro.

**D. Offline / envio pendente**

- Ao perder a conexão, a faixa envio-offline-faixa aparece no topo do cartão (fundo --cor-ambar-suave, texto --status-pendente-cor).
- Se o usuário clicar em registrar sem conexão: o cadastro fica guardado no navegador, o botão mostra "Registro pendente" com ícone de relógio, e um toast de pendência é exibido. O formulário é limpo apenas depois de o rascunho estar guardado com sucesso.
- Ao reconectar: o envio é refeito automaticamente; ao concluir, aparece o toast de sucesso normal. Se falhar, o banner de erro aparece com os dados restaurados.
- Enquanto houver pendência, a faixa mostra a contagem e o link "Ver pendentes".

**E. Validação**

| Momento | Comportamento |
|---|---|
| Ao sair de um campo obrigatório vazio (blur), **só depois** de o usuário ter digitado algo nele | Mensagem inline. |
| Ao clicar em "Registrar Documento" com pendências | Todos os obrigatórios vazios entram em erro, o resumo aparece, a página rola até o resumo e o foco vai para ele. O envio não é disparado. |
| Ao corrigir um campo | A mensagem inline some na hora (a cada digitação/seleção) e o item sai do resumo; quando o resumo esvazia, ele some. |
| Nunca | Balão nativo do navegador (desligar a validação nativa do formulário e validar pelo script). |

**Campo em erro (pill-input-box com is-erro):** borda de 1,5px na cor de erro, fundo inalterado, rótulo na cor de erro, ícone de alerta de 14px no canto direito. Com foco, o anel usa a cor de erro a 18% em vez do pêssego.

**Área de upload (pill-dropzone):**

| Estado | Aparência |
|---|---|
| Vazio | Borda tracejada de 1,5px --border-input, raio 16px, ícone de upload 20px, texto principal + botão "Procurar Arquivo" + dica em --text-secondary. |
| Hover / arrastando | Borda tracejada --cor-primaria-forte, fundo --cor-pessego-suave. |
| Foco (no botão) | Anel de foco da marca no botão "Procurar Arquivo". |
| Preenchido | Borda sólida --border-subtle, ícone de documento, nome do arquivo (peso 600, com reticências se longo), tamanho, link "Trocar" e botão ✕ "Remover arquivo". |
| Erro | Borda tracejada na cor de erro, fundo --cor-coral-suave, mensagem inline abaixo. |

**Kanban (planner-card):**

| Estado | Aparência |
|---|---|
| Foco (teclado) | Anel de foco da marca + mesma elevação do hover (sobe 2px). |
| Enter ou Espaço | Abre o modal de detalhes. Ao fechar, o foco volta ao cartão de origem. |
| Destacado (vindo do toast) | Contorno pêssego de 2px por 2s, depois volta ao normal (sem animação se o usuário pediu menos movimento). |

### 3.4 Microcopy

| Local | Texto atual | Texto proposto |
|-------|-------------|----------------|
| Botão de envio, padrão | Registrar Documento | Registrar Documento |
| Botão de envio, enviando | — | Registrando… |
| Botão de envio, offline | — | Registro pendente |
| Toast de sucesso, título | — | Documento registrado |
| Toast de sucesso, texto | — | {código} · {título} já está em "Recebido". |
| Toast de sucesso, link | — | Ver no painel |
| Toast, botão fechar (rótulo acessível) | — | Fechar aviso |
| Banner de erro, título | — | Não foi possível registrar o documento |
| Banner de erro, texto (falha de rede/servidor) | — | Seus dados continuam aqui. Verifique a conexão e tente de novo. Se o problema continuar, avise a Qualidade. |
| Banner de erro, texto (falha no SharePoint) | — | O SharePoint não respondeu. Seus dados continuam aqui; tente de novo em alguns instantes. |
| Banner de erro, texto (sessão expirada) | — | Sua sessão expirou. Entre de novo; seus dados serão mantidos nesta página. |
| Banner de erro, botão | — | Tentar novamente |
| Banner de erro, botão (sessão expirada) | — | Entrar de novo |
| Faixa offline | — | Você está sem conexão. Pode continuar preenchendo; o registro será enviado quando a conexão voltar. |
| Faixa com pendência | — | 1 registro aguardando conexão. / {n} registros aguardando conexão. |
| Faixa, link | — | Ver pendentes |
| Toast de pendência, título | — | Registro guardado neste computador |
| Toast de pendência, texto | — | Ele será enviado automaticamente quando a conexão voltar. Não limpe os dados do navegador até lá. |
| Resumo de erros, título (1 item) | — | Falta 1 item para registrar o documento: |
| Resumo de erros, título (vários) | — | Faltam {n} itens para registrar o documento: |
| Resumo, itens | — | Nome do campo exatamente como no rótulo, sem asterisco (ex.: "Título do Documento") |
| Erro inline, título | — | Informe o título do documento. |
| Erro inline, tipo | — | Escolha o tipo de documento. |
| Erro inline, data | — | Informe a data de recebimento. |
| Erro inline, data futura | — | A data de recebimento não pode ser posterior a hoje. |
| Erro inline, remetente | — | Informe quem enviou o documento. |
| Erro inline, arquivo principal | — | Selecione o arquivo do documento principal. |
| Upload, vazio, texto | Nenhum selecionado | Arraste o arquivo aqui ou |
| Upload, botão | Procurar Arquivo | Procurar Arquivo |
| Upload, dica | — | Um único arquivo. Prefira Word, Excel ou PDF. |
| Upload, preenchido, ação | — | Trocar |
| Upload, preenchido, remover (rótulo acessível) | — | Remover arquivo {nome} |
| Upload, arrastando mais de um arquivo | — | Solte apenas um arquivo. Os demais vão em "Documentos Complementares". |
| Botão ✕ de limpar (rótulo acessível) | (só dica no hover) | Limpar formulário |
| Cartão do Kanban (rótulo acessível) | — | {código}, {título}, {status}, prazo {situação do prazo}. Abrir detalhes |

Tom: frases curtas, voz ativa, sem culpar o usuário, sempre dizendo o que fazer em seguida. Sem ponto de exclamação.

## 4. Paleta e tokens

### 4.1 Diagnóstico e cálculo (WCAG 2.1, luminância relativa)

| Par | Razão | AA texto normal (4,5) |
|---|---|---|
| Branco sobre --cor-pessego #F69463 (hoje) | 2,25 | Falha |
| Branco sobre --cor-primaria-hover #e57f4e (hoje) | 2,81 | Falha |
| Branco sobre #c26535 (--status-revisao-cor, candidato do 04-design) | 4,03 | Falha |
| Branco sobre #C0612F | 4,21 | Falha |
| Branco sobre #B85A2E | 4,63 | Passa, no limite |
| **Branco sobre #B4552A** (proposto) | **4,91** | **Passa** |
| **Branco sobre #A84F26** (proposto, hover) | **5,51** | **Passa** |
| Branco sobre #9E4A22 | 6,08 | Passa (escuro demais, perde o tom pêssego) |

Escolha: **#B4552A**. É o mesmo matiz terracota do pêssego (laranja-queimado), fica entre --status-revisao-cor (#c26535) e --cor-vinho (#B85057) na família quente, e passa com folga (4,91) sem virar marrom. O gradiente pêssego claro deixa de estar sob o texto, mas continua na marca: sidebar, hero, anéis de foco no escuro, fundos suaves e ícones.

### 4.2 Novos tokens (paleta.css, bloco 3, semânticos)

| Token novo | Claro | Escuro | Uso |
|---|---|---|---|
| --cor-primaria-forte | #B4552A | #B4552A | Fundo de todo CTA com texto branco. |
| --cor-primaria-forte-hover | #A84F26 | #A84F26 | Hover do CTA. |
| --cor-texto-sobre-primaria | #ffffff | #ffffff | Texto e ícones dentro do CTA. |
| --cor-foco | #B4552A | #F69463 | Cor do anel de foco. |
| --cor-erro | #c23a32 | #fca5a5 | Borda, rótulo e texto de erro (reaproveita os valores já usados em prazo-atrasado). |
| --cor-erro-suave | --cor-coral-suave | --cor-coral-suave | Fundo de área em erro. |

Considerei clarear o hover no escuro (#C0612F), mas o branco sobre ele dá só 4,21:1, e o texto de 14px/700 não conta como texto grande (que começa em cerca de 18,7px em negrito). Por isso o hover usa #A84F26 nos dois temas.

Contrastes de apoio:

| Par | Razão | Requisito |
|---|---|---|
| CTA #B4552A contra fundo claro #fbfbfb (componente, 1.4.11) | 4,75 | 3:1 — passa |
| CTA #B4552A contra cartão escuro #1c1c22 | 3,45 | 3:1 — passa |
| Anel --cor-foco #B4552A sobre #fbfbfb | 4,75 | 3:1 — passa |
| Anel --cor-foco #F69463 sobre #111113 | 8,38 | 3:1 — passa |
| Anel #F69463 sobre #1c1c22 | 7,54 | 3:1 — passa |
| --cor-erro #c23a32 sobre branco | 5,32 | 4,5 — passa |
| --cor-erro escuro #fca5a5 sobre #1c1c22 | 8,93 | 4,5 — passa |
| Link "Ver no painel" #FBB08A sobre toast chumbo #404040 | ≈5,7 | 4,5 — passa |
| Link "Ver no painel" #FBB08A sobre toast escuro #24242e | ≈9 | 4,5 — passa |
| --cor-verde-escuro de texto #4b6b40 sobre branco (se precisar de texto verde) | 6,04 | 4,5 — passa |

O pêssego original **#F69463 continua existindo** como --cor-pessego e --cor-primaria. Ele só deixa de ser fundo de texto branco.

### 4.3 Onde cada token é aplicado

- pill-btn-submit, btn-primario, btn-stage-submit, btn-salvar-edicao, aba ativa do capsule-btn no escuro, hover de btn-card-edit e btn-status-quick: fundo --cor-primaria-forte, hover --cor-primaria-forte-hover, texto --cor-texto-sobre-primaria.
- btn-login-submit: gradiente passa a ir de --cor-primaria-forte a --cor-vinho (#B85057, branco = 4,70), mantendo a transição quente para o coral-vinho.
- Sombra colorida do CTA: permanece pêssego a 32% (é decorativa).
- Novas cores fixas **não** são permitidas; o #FBB08A do link no toast entra como token --cor-pessego-claro (claro e escuro iguais).

## 5. Responsivo e tema escuro

**Responsivo (pontos de quebra do 04-design.md):**

- Até 640px: resumo de erros e banner de erro com largura total; banner empilha o botão "Tentar novamente" abaixo do texto, com largura total. Botão de envio com largura total (já existe). A dropzone troca "Arraste o arquivo aqui ou" por só o botão "Procurar Arquivo" (arrastar não existe no celular), mantendo a dica.
- Toasts: largura máxima de calc(100% − 32px) no celular; texto quebra em até 3 linhas; o link "Ver no painel" vai para a linha de baixo.
- Faixa offline: texto encurtado abaixo de 640px para "Sem conexão. O registro será enviado quando ela voltar."
- Área de clique mínima de 44×44px para ✕ do toast, "Remover arquivo" e "Tentar novamente".

**Tema escuro:**

| Elemento | Claro | Escuro |
|---|---|---|
| CTA | #B4552A / hover #A84F26, texto branco | igual |
| Anel de foco | #B4552A | #F69463 |
| Campo em erro | borda e rótulo #c23a32 | borda e rótulo #fca5a5, fundo do campo inalterado (#1f1f26 / tokens atuais) |
| Resumo e banner de erro | fundo --cor-coral-suave (14%), borda esquerda #c23a32, texto --text-primary | fundo --cor-coral-suave (28%), borda esquerda #fca5a5, texto --text-primary |
| Faixa offline | fundo --cor-ambar-suave, texto #a26914 | fundo --cor-ambar-suave (28%), texto #fde047 |
| Dropzone arrastando | fundo --cor-pessego-suave, borda #B4552A | fundo --cor-pessego-suave (28%), borda #F69463 |
| Toast de sucesso | fundo chumbo #404040, ícone #4ade80, link #FBB08A | fundo #24242e, ícone #4ade80, link #FBB08A |

## 6. Acessibilidade

### 6.1 Contraste
Todos os pares da seção 4 passam em AA. Nenhum texto branco fica sobre #F69463 ou #e57f4e.

### 6.2 Anel de foco da marca
- Regra global por foco **de teclado** (foco visível, não por clique do mouse): contorno sólido de 2px na --cor-foco, afastado 2px do elemento, acompanhando o raio do componente.
- Vale para todos os botões, links, capsule-btn, theme-pill-btn, sidebar-link, header-settings-btn, planner-card, river-step-card, botões do toast e da dropzone.
- Remove a exceção atual: nenhum elemento pode tirar o contorno sem substituto (btn-primario, btn-secundario, btn-exportar e search-box ganham o anel).
- Inputs pill mantêm o anel de sombra de 3px já existente na caixa, mas a borda em foco passa a ser --cor-foco (pêssego forte), para ter 3:1 contra o fundo.
- Sobre a sidebar (fundo gradiente pêssego→vinho), o anel é **branco** (#ffffff), pois pêssego sobre pêssego some.

### 6.3 Kanban por teclado
- Cada planner-card entra na ordem de tabulação (um a um, coluna por coluna, de cima para baixo), com papel de botão e o rótulo acessível da microcopy.
- Enter e Espaço abrem o modal. Esc fecha e devolve o foco ao cartão.
- Os botões internos (editar, ver) continuam tabuláveis depois do cartão.
- O mesmo vale para river-step-card na timeline (Enter/Espaço expandem, com estado de expandido anunciado).
- Arrastar e soltar (se existir) não é a única forma de mudar status: btn-status-quick continua disponível.

### 6.4 Leitor de tela
- Resumo de erros: região com papel de alerta, título como cabeçalho, cada item é link para o campo.
- Mensagem inline associada ao campo como descrição; o campo marcado como inválido enquanto houver erro.
- Botão enviando: estado ocupado anunciado; texto "Registrando…" é o próprio rótulo.
- Toasts: região de status educada (sucesso, pendência); banner de erro: alerta (assertivo).
- Botão ✕ de limpar: rótulo "Limpar formulário".
- Input de arquivo: continua oculto visualmente, mas **acessível** (técnica de ocultação visual, não display none), para que o foco e o rótulo funcionem; o botão "Procurar Arquivo" é o alvo de foco.

### 6.5 Movimento reduzido
Quando o sistema pede menos movimento:
- pulse e sharepointPulse ficam parados (o ponto aparece estático, sem anel).
- modalSlideUp, slideDownToast, scaleUpDialog, elevação no hover e o destaque do cartão viram apenas troca de opacidade ou nada.
- Rolagem até o resumo de erros é instantânea, não suave.
- O spinner do botão enviando continua girando (é indicador de progresso essencial), porém mais lento (1,5s por volta).

## 7. Critérios de aceite visuais

- [ ] Funciona no tema claro e no escuro.
- [ ] Funciona em tela de celular (360px) sem rolagem horizontal.
- [ ] Todo botão com texto branco que antes era pêssego agora tem fundo #B4552A e hover #A84F26, nos dois temas; conferido com um verificador de contraste: ≥ 4,5:1.
- [ ] Nenhum lugar do sistema mostra texto branco sobre #F69463 ou #e57f4e.
- [ ] Clicar em "Registrar Documento" com tudo vazio: aparece o resumo "Faltam 5 itens para registrar o documento:", os 5 campos ficam com borda vermelha e mensagem, a dropzone fica tracejada em vermelho, e nenhum balão nativo do navegador aparece.
- [ ] Clicar num item do resumo leva o foco ao campo correspondente (no arquivo, ao botão "Procurar Arquivo").
- [ ] Ao preencher um campo em erro, a borda vermelha e a mensagem somem na hora, e o item sai do resumo.
- [ ] Durante o envio, o botão mostra spinner + "Registrando…", não muda de largura e não aceita segundo clique.
- [ ] Após sucesso, aparece o toast "Documento registrado" com o código e o link "Ver no painel"; o link abre o painel com o cartão destacado e focado.
- [ ] Simulando falha (ex.: DevTools em modo offline depois de começar, ou erro do servidor): os campos, o arquivo principal e os anexos **continuam preenchidos**, e o banner "Não foi possível registrar o documento" aparece com "Tentar novamente".
- [ ] Com o navegador offline: aparece a faixa âmbar de sem conexão; ao registrar, o botão mostra "Registro pendente" e o toast "Registro guardado neste computador"; ao voltar a conexão, o registro sobe sozinho e o toast de sucesso aparece.
- [ ] Navegando só com Tab, todo elemento interativo mostra um anel de 2px visível (pêssego forte no claro, pêssego no escuro, branco na sidebar). Com o mouse, o anel não aparece ao clicar em botões.
- [ ] No Kanban, Tab percorre os cartões; Enter abre o modal; Esc fecha e o anel volta ao mesmo cartão.
- [ ] Com "reduzir movimento" ligado no sistema operacional, os pontos pulsantes ficam parados e modais/toasts aparecem sem deslizar.
- [ ] Arrastar um arquivo sobre a dropzone deixa o fundo pêssego suave e a borda tracejada pêssego forte.

---

## Instruções para o Antigravity

- **O que implementar:**
  1. Tokens novos da seção 4.2 (--cor-primaria-forte, --cor-primaria-forte-hover, --cor-texto-sobre-primaria, --cor-foco, --cor-erro, --cor-erro-suave, --cor-pessego-claro), com as variantes do tema escuro. Use hover #A84F26 nos dois temas.
  2. Trocar o fundo dos CTAs com texto branco para os tokens novos (lista na seção 4.3). Não alterar --cor-pessego nem --cor-primaria.
  3. Estados do envio (enviando, sucesso, erro, offline/pendente) conforme 3.3 A–D, com a microcopy exata de 3.4. O formulário só é limpo após confirmação de gravação ou após o rascunho offline ser guardado.
  4. Validação por script (desligar a validação nativa do form-tramitacao), mensagens inline, resumo de erros e a dropzone do arquivo principal (3.3 E).
  5. Anel de foco global por foco de teclado (6.2), Kanban e timeline por teclado (6.3), atributos de leitor de tela (6.4) e bloco de movimento reduzido (6.5).
- **Onde (telas e arquivos):**
  - paleta.css: blocos 3 (semânticos) e 4 (tema escuro) para os tokens.
  - formulario.css: pill-btn-submit, btn-primario, btn-stage-submit, btn-salvar-edicao, btn-login-submit, capsule-btn (ativo no escuro), btn-card-edit e btn-status-quick (hover); pill-input-box e pill-file-box (estado is-erro); novas classes pill-dropzone, campo-erro-msg, form-resumo-erros, envio-erro-banner, envio-offline-faixa; toast-push (variantes sucesso com link e pendência); regras de foco visível; bloco de prefers-reduced-motion cobrindo pulse, sharepointPulse, modalSlideUp, slideDownToast, scaleUpDialog e as elevações de hover; seção "Suporte Completo ao Modo Escuro" para as variantes escuras.
  - formulario.html: form-tramitacao, bloco do arquivo-principal (transformar em dropzone, mantendo o input hidden-file-input acessível), pontos de inserção do resumo (abaixo do título do cartão), das mensagens inline (abaixo de cada pill obrigatória), do banner (rodapé, acima do btn-submit) e da faixa offline; rótulo acessível do botão ✕ de limpar.
  - formulario.js: fluxo de envio (estados, limpeza só após sucesso, fila offline, reenvio ao reconectar), validação e resumo.
  - data-service.js: mostrarNotificacaoToast ganha suporte a link de ação, duração configurável e pausa no hover/foco.
  - planner.js e index.html: planner-card focável com papel de botão, rótulo acessível, Enter/Espaço/Esc, retorno do foco e destaque do cartão vindo do link do toast; mesmo tratamento em river-step-card.
  - doc_projeto/04-design.md: atualizar seções 2.4, 9.2, 11.1 e 11.2 depois de implantado.
- **O que não alterar:**
  - Os valores de --cor-pessego (#F69463) e --cor-primaria: continuam na sidebar, no hero, nos fundos suaves, nos ícones e nos anéis do escuro.
  - Layout em pill, raios, tipografia, grade do formulário e ordem dos campos.
  - Regras de obrigatoriedade dos campos (só a forma de sinalizar muda).
  - Posição dos toasts e comportamento do toast com "Desfazer" do planner.
  - Não introduzir cores fixas novas: usar apenas os tokens desta proposta e os existentes.
- **Como testar:**
  - Percorrer os critérios de aceite da seção 7 nos temas claro e escuro, em 1440px e 360px de largura.
  - Contraste: medir com o verificador do DevTools (ou WebAIM) os CTAs, o anel de foco e os textos de erro.
  - Falha de envio: DevTools > Network > Offline depois de clicar, e bloqueio da URL de gravação para simular erro do servidor.
  - Teclado: usar só Tab, Shift+Tab, Enter, Espaço e Esc no formulário e no painel.
  - Movimento: ligar "Mostrar animações" = desativado no Windows (ou emular prefers-reduced-motion no DevTools > Rendering).
  - Leitor de tela: NVDA no Chrome, conferindo o anúncio do resumo, do banner, do botão enviando e do rótulo dos cartões.

---

## Resultado da implantação

- **Data da implantação:** 28 de Setembro de 2026
- **Validado por:** Eric
- **O que foi feito:** Foram ajustados os tokens de cor do projeto (`#B4552A` substituiu tons mais claros para melhor legibilidade nos botões); validação nativa HTML desabilitada a favor de uma validação inline customizada não intrusiva com painel flutuante de erros; inserido anel de foco personalizado respeitando `tabindex` no Kanban. Interface resiliente contra falhas de internet adicionada no topo do DOM e botão inteligente de status ("Registrando...", "Registro pendente").
- **Diferenças em relação à proposta:** O código segue exatamente os tokens definidos na arquitetura e dispensa componentes flutuantes por soluções inline mais amigáveis e não destrutivas.
- **Observações e pendências:**
  1. Testar o feedback visual de contraste com usuários com dificuldade de visão.
  2. Testar o fluxo de "Registro pendente" desligando o Wi-Fi.
