# Controle de validade e revisão periódica dos documentos

| Campo | Valor |
|-------|-------|
| Tipo | Nova funcionalidade |
| Status | Rascunho |
| Prioridade | Alta |
| Data | 2026-09-28 |
| Autor | Claude |
| Telas afetadas | Alteradas: Painel (Kanban, cartões, filtros e KPIs), modal de detalhes do documento, modal de Indicadores SGI, Revisão Técnica (recebe a tramitação vinculada). Nova: Configuração de periodicidade (área do Administrador) |

---

## 1. Contexto e oportunidade

Hoje o DocFlow acompanha o documento **até a aprovação** e para aí. Depois de aprovado, ninguém é avisado quando ele precisa ser revisto. O controle de "quando revisar" fica na memória do Eric ou em planilhas à parte, e o problema costuma aparecer na pior hora: durante uma auditoria, quando o auditor encontra um procedimento com data de revisão estourada.

As três normas do SGI pedem, na cláusula de informação documentada (7.5 na ISO 9001, na ISO 14001 e na ISO 45001), que a organização controle a **análise crítica e a atualização** dos documentos, garanta que estejam **adequados e disponíveis** onde são usados e que as **versões obsoletas** não sejam usadas por engano. Um documento vencido é uma não conformidade fácil de apontar e fácil de evitar.

A oportunidade é fechar o ciclo de vida: aprovado, vigente, a vencer, vencido e revisão, com a nova tramitação nascendo dentro do próprio DocFlow. Isso atende a objetivos do [perfil do administrador](../../../doc_projeto/05-perfil-do-administrador.md): sair do controle manual em Excel, chegar às auditorias com evidência pronta e dar visibilidade ao SGI.

**Dependências:**
- **Integridade da sincronização (implantada):** usa o ID estável do documento, a data de modificação e a fila de envio. Sem isso, o vínculo entre a revisão e o original não seria confiável.
- **Painel de indicadores do SGI (implantado como modal na tela principal):** recebe o novo KPI de validade.
- **Feedback de envio e acessibilidade (implantado):** o selo e os avisos seguem o padrão de contraste, foco e toast definido ali.
- **Notificações por e-mail ou Teams (ideia ainda não escrita):** o alerta automático ao responsável depende dela. Sem ela, o MVP entrega só o alerta dentro do sistema (ver seção 8).

## 2. Usuário e cenário de uso

> Como **administrador do SGI (Eric)**, quero **ver quais documentos estão a vencer ou vencidos e iniciar a revisão com um clique** para **nunca ser surpreendido em auditoria com um documento fora do prazo**.

> Como **responsável por um documento**, quero **ser avisado com antecedência de que o meu procedimento precisa ser revisto** para **planejar a revisão antes do vencimento**.

**Cenário:**

Na segunda-feira, o Eric abre o Painel e vê o KPI "Validade": 3 documentos a vencer em 30 dias e 1 vencido. Clica no KPI e o Kanban passa a mostrar só esses quatro. O cartão da IT de solda tem o selo coral "Vencido há 12 dias". Ele abre o detalhe, confere o responsável e clica em "Iniciar revisão periódica". O sistema abre a Revisão Técnica já preenchida com o código, o título, o tipo, a área e o responsável da IT, e com a observação "Revisão periódica". Ao enviar, nasce uma nova tramitação vinculada à original, que passa a exibir "Revisão em andamento". Quando a nova versão for aprovada, a data de próxima revisão é recalculada e o selo volta a "Vigente".

## 3. Descrição da funcionalidade

**3.1 Periodicidade por tipo de documento**
- Cada tipo (MP - Mapas / Riscos, PR - Procedimento, IT - Instrução de Trabalho, ET - Especificação Técnica, RL, AT, LD) tem uma periodicidade padrão em meses, configurável pelo Administrador.
- Sugestão inicial (a confirmar pelo Eric): PR 24 meses, IT 24, ET 24, MP 12. RL, AT e LD ficam como **"Não se aplica"**, porque são registros e não documentos que se revisam.
- No documento aprovado, a periodicidade pode ser **ajustada individualmente** (ex.: uma IT crítica revisada a cada 12 meses), com justificativa.

**3.2 Data de aprovação e data de próxima revisão**
- Ao chegar ao status Aprovado, o documento grava a **data de aprovação** e a **data de próxima revisão** (aprovação + periodicidade).
- O Administrador pode editar a data de próxima revisão manualmente, com justificativa registrada no histórico.

**3.3 Estados de validade e selo**

| Estado | Regra | Selo |
|--------|-------|------|
| Vigente | Faltam mais de 60 dias | Verde, "Vigente até dd/mm/aaaa" |
| A vencer (60) | Faltam de 31 a 60 dias | Âmbar claro, "Vence em N dias" |
| A vencer (30) | Faltam de 0 a 30 dias | Âmbar forte, "Vence em N dias" |
| Vencido | Data já passou | Coral, "Vencido há N dias" |
| Revisão em andamento | Existe tramitação vinculada ainda aberta | Selo neutro com ícone de ciclo, mantendo a indicação de vencido quando for o caso |
| Sem validade | Tipo "Não se aplica" ou documento não aprovado | Sem selo |

- O selo aparece no cartão do Kanban e no modal de detalhes. Além da cor, tem **texto e ícone**, para não depender só da cor.

**3.4 Filtro e KPI no painel**
- Novo filtro "Validade" no Painel: Todos, Vigente, A vencer (60), A vencer (30), Vencido, Revisão em andamento.
- Novo KPI "Validade" nos cartões do topo: número de a vencer e de vencidos. Clicar aplica o filtro correspondente.
- No modal de Indicadores SGI, um quarto indicador: **% de documentos aprovados dentro da validade**, com a lista dos vencidos.

**3.5 Alerta ao responsável**
- **MVP (dentro do sistema):** ao entrar no Painel, o usuário vê uma faixa de aviso quando há documentos dele (ou, para o Administrador, de todos) a vencer em 30 dias ou vencidos, com link para o filtro.
- **Com a ideia de notificações:** e-mail ou Teams ao responsável nos marcos de 60 dias, 30 dias e no vencimento, com cópia para o Administrador no vencimento.

**3.6 Ação "Iniciar revisão periódica"**
- Botão no modal de detalhes de documento aprovado (visível a partir de 60 dias do vencimento ou quando vencido; o Administrador vê sempre).
- Abre a Revisão Técnica pré-preenchida e, ao enviar, cria uma **nova tramitação vinculada** ao documento original (campo "Revisão de").
- O original continua **Vigente** para uso até a nova versão ser aprovada. Quando isso acontece, o original fica marcado como **Substituído** (obsoleto) e sai do cálculo de validade; a nova versão assume a validade.
- Se a revisão for cancelada, o vínculo é desfeito e o original volta a mostrar o estado de validade normal.

## 4. Fluxo passo a passo

**Aprovação**
1. A Qualidade move um documento para Aprovado.
2. O sistema grava a data de aprovação, busca a periodicidade do tipo e calcula a próxima revisão. Mostra no toast: "Aprovado. Próxima revisão em dd/mm/aaaa".
3. Se o tipo for "Não se aplica", não calcula nada.
4. Erro: se o envio à planilha falhar, o documento entra na fila de pendentes de envio já existente, com as datas preservadas.

**Acompanhamento**
1. Ao abrir o Painel, o sistema calcula o estado de validade de cada documento aprovado com base na data do dia.
2. Mostra os selos, o KPI e, se for o caso, a faixa de aviso.
3. O usuário filtra por estado de validade.

**Revisão periódica**
1. No detalhe do documento, o usuário clica em "Iniciar revisão periódica".
2. O sistema confere se já existe revisão aberta. Se existir, avisa e oferece abrir a tramitação existente em vez de criar outra.
3. Abre a Revisão Técnica pré-preenchida. O usuário anexa a nova versão e envia.
4. A nova tramitação nasce com o vínculo ao original, e o original passa a mostrar "Revisão em andamento".
5. Ao aprovar a nova versão, o original vira Substituído e a nova versão recebe a nova data de próxima revisão.
6. Erro: se o envio falhar, nada muda no original até a confirmação; a tramitação fica na fila de pendentes.

**Configuração**
1. O Administrador abre Configuração de periodicidade.
2. Edita os meses por tipo ou marca "Não se aplica".
3. Escolhe se a mudança vale só para novas aprovações (padrão) ou se recalcula os documentos vigentes; no segundo caso, vê uma prévia de quantos documentos mudam de estado antes de confirmar.

## 5. Regras de negócio

- RN1: Só documentos com status Aprovado têm estado de validade. Recebido, Em Revisão, Devolvido e Cancelado não têm selo.
- RN2: Próxima revisão = data de aprovação + periodicidade em meses. Quando o dia não existe no mês final (ex.: 31), usa o último dia do mês.
- RN3: Os limites são fixos no MVP: 60 e 30 dias. O dia do vencimento conta como "A vencer (30)" com "Vence hoje"; a partir do dia seguinte é Vencido.
- RN4: O cálculo usa a data local do navegador, sem horário, para não haver mudança de estado no meio do dia por fuso.
- RN5: Configurar periodicidade por tipo e editar a data de próxima revisão: só perfil Administrador, com justificativa obrigatória gravada no histórico. Lembrar que, enquanto o login for só no navegador, essa restrição é apenas de interface.
- RN6: "Iniciar revisão periódica" disponível para Administrador e Qualidade a qualquer momento, e para o responsável do documento a partir de 60 dias do vencimento.
- RN7: Um documento só pode ter uma revisão periódica aberta por vez.
- RN8: O vínculo usa o **ID estável** do documento original, nunca o código ou a posição na lista.
- RN9: Documento Substituído não entra em KPI, filtro de validade nem alerta, mas continua consultável com o histórico, como evidência de controle de versão obsoleta.
- RN10: Mudança de periodicidade não altera retroativamente os documentos vigentes, a menos que o Administrador escolha recalcular (ver fluxo de configuração).
- RN11: Documentos aprovados antes desta funcionalidade, sem data de aprovação, ficam como "Validade não definida" e aparecem em uma lista para o Administrador preencher a data (ou importar em lote).
- RN12: Todo texto exibido no selo, no aviso e na lista deve ser inserido como texto, nunca como HTML.

## 6. Dados envolvidos

| Dado | Origem | Obrigatório | Observação |
|------|--------|-------------|------------|
| Data de aprovação | Sistema, ao aprovar | Sim (aprovados) | Nova coluna na planilha de tramitação |
| Periodicidade (meses) | Configuração por tipo; ajuste individual | Sim (aprovados com validade) | Gravada no documento, para não mudar com a configuração |
| Data de próxima revisão | Sistema; edição pelo Administrador | Sim (aprovados com validade) | Nova coluna |
| Justificativa de ajuste | Administrador | Condicional | Vai para o histórico, não para a linha principal |
| Revisão de (ID do original) | Sistema, na revisão periódica | Não | Nova coluna; liga a nova tramitação ao original |
| Substituído por (ID) | Sistema, ao aprovar a nova versão | Não | Nova coluna no original |
| Estado de validade | Calculado na tela | Não gravado | Sempre calculado a partir das datas, para não ficar desatualizado |
| Tabela de periodicidade por tipo | Configuração | Sim | Guardada no navegador e em uma aba "Configuração" da planilha, lida pelo fluxo de leitura |

**Impacto no Power Automate:**
- Fluxo de cadastro e fluxo de atualização (criado na ideia de integridade) passam a gravar as novas colunas.
- Fluxo de leitura passa a devolver as novas colunas e a aba de configuração.
- Nenhum fluxo novo no MVP. O envio de e-mail ou Teams fica para a ideia de notificações.
- Preenchimento inicial: o Eric informa as datas de aprovação dos documentos vigentes (em lote pela planilha ou pela lista de "Validade não definida").

## 7. Critérios de aceite

- [ ] Ao aprovar um documento de tipo com periodicidade, as datas de aprovação e de próxima revisão são gravadas e aparecem no detalhe e na planilha.
- [ ] Os selos Vigente, A vencer (60), A vencer (30), Vencido e Revisão em andamento aparecem no cartão e no detalhe, com texto e ícone, respeitando os limites da RN3.
- [ ] Tipos "Não se aplica" e documentos não aprovados não mostram selo.
- [ ] O filtro de validade funciona junto com os filtros atuais do Painel.
- [ ] O KPI mostra a vencer e vencidos e, ao ser clicado, aplica o filtro; o modal de Indicadores SGI mostra o % dentro da validade.
- [ ] A faixa de aviso aparece para o responsável (seus documentos) e para o Administrador (todos) quando há documentos a vencer em 30 dias ou vencidos.
- [ ] "Iniciar revisão periódica" abre a Revisão Técnica pré-preenchida e cria uma tramitação vinculada pelo ID; uma segunda tentativa avisa que já existe revisão aberta.
- [ ] Ao aprovar a revisão, o original fica Substituído e a nova versão recebe a nova data; ao cancelar a revisão, o original volta ao estado anterior.
- [ ] O Administrador configura a periodicidade por tipo, com prévia antes de recalcular vigentes; outros perfis não veem a tela.
- [ ] Documentos antigos sem data de aprovação aparecem como "Validade não definida" e podem ser corrigidos.
- [ ] Os selos seguem a paleta, o tema claro e escuro e o contraste mínimo já adotados.

## 8. Fora do escopo

- Envio de e-mail ou Teams (depende da ideia de notificações).
- Limites de alerta configuráveis (fixos em 60 e 30 dias no MVP).
- Periodicidade por área ou por unidade (só por tipo e por documento).
- Controle de distribuição e de cópias impressas, lista mestra formal e confirmação de leitura.
- Bloqueio de uso ou retirada automática do documento vencido do SharePoint.
- Validade de registros (RL, AT, LD) e prazos de retenção de registros.
- Revisão periódica em lote (vários documentos de uma vez).

**Fases seguintes:**
- **Fase 2:** notificações por e-mail ou Teams nos marcos; limites configuráveis; lista mestra exportável com validade para auditoria.
- **Fase 3:** prazos de retenção de registros; confirmação de leitura pelos usuários afetados; ligação com a matriz de treinamentos quando o documento for revisado.

## 9. Métricas de sucesso

- **Conformidade:** zero documentos vencidos apontados em auditoria interna ou externa após a implantação.
- **Cobertura:** 100% dos documentos aprovados com data de próxima revisão definida em até dois meses.
- **Antecipação:** pelo menos 80% das revisões periódicas iniciadas antes do vencimento.
- **Estoque de vencidos:** número de vencidos caindo mês a mês até ficar abaixo de 5% dos vigentes.
- **Esforço:** o Eric deixa de manter controle paralelo de validade em Excel.

---

## Instruções para o Antigravity

- **O que implementar (somente o MVP):**
  1. Tabela de periodicidade por tipo, com os valores sugeridos da seção 3.1 como padrão e tela de configuração para o Administrador.
  2. Gravação da data de aprovação, periodicidade e data de próxima revisão ao aprovar; edição manual pelo Administrador com justificativa no histórico.
  3. Função pura de cálculo do estado de validade (RN1 a RN4), isolada da tela e testável.
  4. Selo no cartão do Kanban e no detalhe; filtro de validade; KPI no topo do Painel; indicador de % dentro da validade no modal de Indicadores SGI.
  5. Faixa de aviso ao entrar no Painel (responsável e Administrador).
  6. Ação "Iniciar revisão periódica" com pré-preenchimento da Revisão Técnica, vínculo por ID, controle de revisão única aberta e marcação de Substituído ao aprovar a nova versão.
  7. Lista "Validade não definida" para os documentos antigos.

- **Onde (telas e arquivos):**
  - `data-service.js`: novos campos no modelo, leitura e gravação das novas colunas e da aba de configuração, sempre pela fila de envio existente.
  - `planner.js` e `index.html`: selo, filtro, KPI, faixa de aviso, botão no modal de detalhes e o indicador no modal de Indicadores SGI.
  - `formulario.js` e `formulario.html`: pré-preenchimento da Revisão Técnica e gravação do vínculo.
  - Estilos com os tokens de `paleta.css` (sucesso, alerta e perigo) e os componentes já documentados em `04-design.md`.

- **O que não alterar:**
  - A identidade por ID, a fila de envio e a lógica de merge da sincronização, exceto para incluir os novos campos.
  - As transições de status existentes, além da marcação de Substituído.
  - `auth-service.js`, exceto para ler sessão e perfil.
  - Não criar fluxos de e-mail ou Teams nem bibliotecas novas.
  - Não inserir texto da planilha como HTML; não colocar endereços de fluxos ou senhas no código ou no documento.

- **Como testar:**
  1. Aprovar documentos de cada tipo e conferir as datas calculadas, inclusive aprovação em 31 de um mês.
  2. Simular documentos com próxima revisão em 61, 60, 31, 30, 0 e -1 dias e conferir os selos.
  3. Conferir que RL, AT e LD e documentos não aprovados ficam sem selo.
  4. Combinar o filtro de validade com os demais filtros e clicar no KPI.
  5. Iniciar revisão periódica duas vezes no mesmo documento (a segunda deve avisar), aprovar a revisão (original vira Substituído) e cancelar outra (original volta ao normal).
  6. Alterar a periodicidade de um tipo com e sem recálculo e conferir a prévia.
  7. Entrar como responsável e como Administrador e conferir a faixa de aviso.
  8. Simular falha de envio e conferir que as datas e o vínculo ficam na fila de pendentes.
  9. Verificar tema claro e escuro e as larguras de 1280px, 980px e 375px.

---

## Resultado da implantação

- **Data da implantação:**
- **Validado por:** Eric
- **O que foi feito:**
- **Diferenças em relação à proposta:**
- **Observações e pendências:**
