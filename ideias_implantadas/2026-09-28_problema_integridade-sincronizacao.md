# Integridade dos dados entre navegador e planilha

| Campo | Valor |
|-------|-------|
| Tipo | Resolução de problema |
| Status | Aprovada |
| Prioridade | Alta |
| Data | 2026-09-28 |
| Autor | Claude |
| Telas afetadas | Painel (Kanban) e modais de detalhe, edição, anexos e auditoria; Novo Documento; sincronização em login, Painel e Novo Documento |

<!-- Nome do arquivo: AAAA-MM-DD_problema_titulo-curto.md. Veja ideias/README.md. -->

---

## 1. Problema observado

O DocFlow guarda os dados em dois lugares: no navegador de cada usuário (localStorage) e na planilha Excel no SharePoint, acessada por fluxos do Power Automate. Hoje esses dois lugares divergem, e em alguns casos há perda de dados. Os sintomas são estes:

1. **O status não chega à linha principal do Excel.** Quando alguém move um documento no Kanban, registra uma etapa na timeline ou edita o status, o sistema envia só um evento para a aba de Histórico. O fluxo que atualizaria a linha da tramitação não existe, porque a constante URL_WEBHOOK_UPDATE_STATUS está vazia. Por isso, a coluna Status da planilha continua com o valor antigo.
2. **A sincronização apaga dados locais.** A função buscarDadosDoPowerAutomate substitui a lista local inteira pela lista da nuvem. Um documento cujo cadastro não chegou ao Excel desaparece na próxima sincronização. Além disso, o histórico baixado é reduzido a **um evento por documento** e sobrescreve o histórico local. Com isso, a timeline some e a contagem de devoluções volta a zero.
3. **As modificações locais nunca expiram.** A cada salvamento local, a chave docflow_modificacoes_locais recebe o status, o link, a pasta, o arquivo, a quantidade de anexos e a observação de **todos** os documentos, e não só do que foi alterado. Esses valores se sobrepõem à nuvem em todas as sincronizações seguintes. Mudanças feitas por outras pessoas, ou direto na planilha, deixam de aparecer naquele navegador.
4. **O upload de anexos pode duplicar a linha.** O envio de anexos pelo modal do Painel usa enviarArquivosParaSharePoint, que chama o webhook de inserção (URL_WEBHOOK_POST). Esse fluxo adiciona uma linha nova no Excel. A deduplicação feita no navegador esconde o sintoma, mas a planilha fica suja.
5. **As ações do Kanban usam a posição do documento na lista.** Os cartões e os botões chamam as ações (moverStatus, abrirModalDetalhes, solicitarCancelamentoDocumento, abrirModalAuditoria) passando a posição do documento na lista. Se uma sincronização reordena ou mescla itens entre o desenho da tela e o clique, ou durante os 4 segundos do "Desfazer", a ação cai no documento errado.
6. **As falhas de envio são silenciosas.** Erros no cadastro, no envio do histórico e na atualização de status só aparecem no console do navegador. O usuário acha que salvou, e nada é tentado de novo.

**Como reproduzir (exemplos):**

- Mova um documento de "Recebido" para "Aprovado" no Painel e abra a planilha: a coluna Status não mudou.
- Com a rede desligada (ou com URL_WEBHOOK_POST trocada pelo marcador COLE_AQUI), cadastre um documento em Novo Documento. Religue a rede e clique em "Sincronizar Nuvem": o documento some do Painel.
- Registre três etapas na timeline de um documento e sincronize: a timeline passa a mostrar um único evento.
- No navegador A, mude o status de qualquer documento. Depois, mude direto na planilha o status de **outro** documento e sincronize o navegador A: a mudança da planilha não aparece.

## 2. Impacto

- **Quem é afetado:** todos os perfis. O Solicitante vê um status desatualizado e pode perder cadastros. A Qualidade perde a timeline e a contagem de devoluções e pode agir no documento errado. O Administrador não pode confiar na planilha como fonte da verdade nem como evidência de auditoria.
- **Frequência:** diária. Toda mudança de status deixa a planilha defasada, e toda sincronização reduz o histórico. A perda de cadastros e a ação no documento errado são eventuais, mas silenciosas.
- **Consequência:** perda e divergência de dados. A rastreabilidade da tramitação, exigida pelo SGI para o controle de informação documentada, fica comprometida. Cada navegador passa a ter a sua própria "verdade", e a planilha fica com linhas duplicadas e status antigos.

## 3. Causa provável

- **Falta um fluxo de atualização.** Só existem fluxos para inserir linha (cadastro), ler tudo e inserir evento de histórico. Sem um fluxo de atualização, sincronizarComPowerAutomate (planner.js) não envia nada, e o upload de anexos acaba usando o fluxo de inserção.
- **A identidade dos documentos é frágil.** O formulário não cria um ID estável. O ID é gerado depois por gerarIdDocumento, a partir do código ou do título, e a chave de deduplicação e de modificações locais é o código ou o título em minúsculas. Documentos sem código e com o mesmo título são fundidos em um só. O Kanban usa a posição na lista em vez do ID.
- **A sincronização é destrutiva, e não um merge.** buscarDadosDoPowerAutomate substitui as tramitações e o histórico em vez de mesclá-los. Para compensar, foi criado o mecanismo de modificações locais (salvarTramitacoes grava todos os itens; obterModificacoesLocais é aplicado por cima da nuvem). Esse mecanismo não tem data de expiração nem comparação de datas.
- **Não existe fila de envio.** Os envios usam uma chamada única, sem aguardar a confirmação (histórico) ou apenas registrando o erro no console (cadastro e status). Não existe registro do que falhou nem nova tentativa.

## 4. Proposta de solução

A solução tem seis etapas incrementais. Cada etapa pode ser entregue, testada e validada pelo Eric separadamente, nesta ordem. As etapas 1 e 2 são pré-requisito das demais.

### Etapa 1: ID estável para cada documento

- Todo documento novo recebe, no momento do cadastro, um ID único que nunca muda, gerado no navegador (formato sugerido: "DOC-" seguido de um identificador aleatório universal).
- O ID passa a ser gravado na coluna **ID** da tabela de tramitações no Excel (o fluxo de cadastro precisa gravar essa coluna).
- **Migração dos documentos existentes:** quem não tem ID na planilha continua com o ID derivado do código ("DOC-" + código), como já acontece hoje. O Eric preenche a coluna ID da planilha uma única vez com esse mesmo valor, para que o ID derivado e o gravado coincidam.
- Deduplicação, modificações locais, histórico e ações do Kanban passam a usar o ID como chave. O código e o título ficam só como alternativa para linhas antigas sem ID.
- O documento ganha um campo novo, **dataModificacao** (data e hora ISO), atualizado a cada alteração local e gravado na planilha em uma coluna nova, "Data Modificação".

### Etapa 2: Kanban por ID

- Cartões, botões do modal, "Reativar", "Cancelar", "Desfazer" e auditoria passam a identificar o documento pelo ID, e não pela posição. A cada ação, o documento é localizado na lista atual pelo ID.
- Se o ID não for encontrado (o documento foi removido por uma sincronização, por exemplo), a ação é abortada, e o usuário vê um aviso claro.

### Etapa 3: Fila de envios pendentes com nova tentativa

- Uma nova chave no navegador, **docflow_fila_envios**, guarda cada envio à nuvem como uma pendência. A pendência tem: ID da pendência, tipo (CADASTRO, ATUALIZACAO, HISTORICO, ANEXOS), ID do documento, dados a enviar, número de tentativas, data da última tentativa, último erro e situação (pendente, enviado, falhou).
- **Todos os envios passam pela fila:** cadastro, atualização de status e campos, eventos de histórico e anexos. A pendência só sai da fila quando o fluxo responde com sucesso (código HTTP 2xx e, quando houver, "sucesso" verdadeiro na resposta).
- **Nova tentativa automática:** ao carregar a página, antes de cada sincronização, quando o navegador volta a ficar on-line e a cada 60 segundos enquanto houver pendências. O intervalo entre tentativas cresce (1 min, 2 min, 5 min, 15 min). Depois de 5 falhas, a pendência fica como "falhou" e só é reenviada manualmente.
- **A ordem é preservada por documento.** O cadastro de um documento é enviado antes das atualizações e dos eventos dele.
- **Os anexos em Base64 não ficam na fila.** Por causa do limite de espaço do navegador, só os metadados dos anexos entram na fila. Se o envio de anexos falhar, o usuário é avisado na hora e reenvia os arquivos manualmente.
- **Fim da falha silenciosa:**
  - Toda falha mostra um aviso (toast) com o texto "Não foi possível enviar para a planilha. O DocFlow tentará novamente."
  - Um indicador no cabeçalho, perto do menu de sincronização, mostra a quantidade de envios pendentes. Ao clicar nele, abre-se a lista de pendências com o botão "Tentar agora".
  - Os cartões de documentos com envio pendente mostram uma marca discreta ("não sincronizado").

### Etapa 4: Merge por ID usando a data de modificação

A sincronização deixa de substituir a lista local e passa a mesclar documento por documento, pelo ID:

| Situação | Resultado |
|----------|-----------|
| Está na nuvem e no navegador | Vence a versão com a **dataModificacao mais recente**. Se a nuvem não tiver data (linha antiga), vence a nuvem, a menos que o documento tenha uma pendência na fila. |
| Está só na nuvem | Entra na lista local. |
| Está só no navegador **e** tem uma pendência de cadastro na fila | É mantido, com a marca "não sincronizado". |
| Está só no navegador e **não** tem pendência | É removido (foi excluído na planilha), e o evento fica registrado no console. |

- O mecanismo de **modificações locais é aposentado**. A chave docflow_modificacoes_locais deixa de ser gravada e é apagada na primeira execução da nova versão. O papel dela (não perder o que o usuário acabou de fazer) passa a ser da fila de envios somada à comparação de datas.
- Enquanto um documento tiver uma pendência de ATUALIZACAO na fila, a versão local prevalece, independentemente da data.
- A importação de Excel (importarArquivoExcel) passa a usar o mesmo merge por ID, em vez de substituir a lista.

### Etapa 5: Histórico acumulativo

- O histórico baixado da nuvem é **mesclado** ao local pelo ID do evento ("HIST-..."). Nenhum evento é descartado por ser antigo, e o mesmo evento nunca é gravado duas vezes.
- A redução a um evento por documento deixa de existir, assim como os filtros fixos no código ("monto-001", "suprimento", "muen", "muem") dentro da sincronização.
- Eventos locais ainda não enviados (pendência de HISTORICO na fila) são mantidos.
- Os eventos passam a ser associados ao documento pelo ID do documento, com o código como alternativa só para eventos antigos.
- O upload de anexos passa a gerar um evento do tipo ANEXO, já previsto na tela de auditoria.

### Etapa 6: Fluxo do Power Automate de atualização

É preciso criar um fluxo novo no Power Automate, com gatilho HTTP, para **atualizar uma linha existente** na tabela de tramitações sem nunca inserir linhas. A URL dele vai para a constante URL_WEBHOOK_UPDATE_STATUS (ou para uma constante renomeada, URL_WEBHOOK_UPDATE). O Eric cria esse fluxo, e o Antigravity faz o lado do navegador.

**Entradas esperadas (corpo JSON da requisição):**

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| id | Sim | ID estável do documento; é a chave de busca da linha. |
| codigo | Não | Alternativa de busca para linhas antigas sem ID. |
| dataModificacao | Sim | Data e hora ISO da alteração no navegador. |
| campos | Sim | Objeto só com os campos alterados, entre: status, titulo, tipoDocumento, revisao, dataRevisao, area, disciplina, observacao, linkAnexo, nomePasta, nomeArquivoPrincipal, qtdAnexos. |
| anexos | Não | Lista de arquivos em Base64 (nome e conteúdo) a gravar na pasta **já existente** do documento. Substitui o uso do fluxo de inserção no modal. |
| autor | Sim | Nome do usuário que fez a alteração, para registro. |

**Comportamento esperado do fluxo:**

1. Localizar a linha pela coluna ID. Se não achar e houver código, localizar pela coluna Código.
2. Se a linha não existir, **não inserir**: responder "nao_encontrado".
3. Se a "Data Modificação" gravada na linha for mais recente que a data recebida, não gravar: responder "conflito" com os valores atuais da linha.
4. Caso contrário, atualizar só as colunas recebidas em "campos" e gravar a nova "Data Modificação". Se houver anexos, gravá-los na pasta do documento.

**Saídas esperadas (corpo JSON da resposta, sempre com HTTP 200, salvo erro técnico):**

| Campo | Descrição |
|-------|-----------|
| sucesso | Verdadeiro ou falso. |
| resultado | "atualizado", "nao_encontrado" ou "conflito". |
| id | ID do documento processado. |
| dataModificacao | Data gravada na linha após a operação. |
| linha | No caso de "conflito", os valores atuais da linha, para o navegador aplicar. |
| linkAnexo e qtdAnexos | Quando houver anexos: o link da pasta e a quantidade atualizada. |
| mensagem | Texto do erro, quando houver. |

Ajustes nos fluxos existentes (feitos pelo Eric):

- **Fluxo de cadastro:** gravar as colunas ID e Data Modificação. Antes de inserir, verificar se já existe uma linha com o mesmo ID; se existir, responder sucesso sem inserir de novo, para que a nova tentativa da fila não duplique a linha. Devolver sucesso, ID e link da pasta.
- **Fluxo de histórico:** antes de inserir, verificar se o ID do evento já existe (pelo mesmo motivo) e devolver sucesso.
- **Fluxo de leitura:** devolver as colunas ID e Data Modificação e o histórico completo.

**Alternativa descartada:** manter as modificações locais, só com expiração (por exemplo, 24 h). É mais simples, mas continua perdendo cadastros, não resolve a planilha defasada e mantém a divergência entre navegadores durante a janela de expiração.

## 5. Critérios de aceite

**Etapa 1: ID estável**
- [ ] Um documento cadastrado em Novo Documento já tem um ID no formato "DOC-" seguido de um identificador aleatório, antes de qualquer sincronização, e esse ID aparece na coluna ID da planilha.
- [ ] Dois documentos sem código e com o mesmo título aparecem como dois cartões distintos no Painel.
- [ ] Documentos antigos sem ID na planilha continuam aparecendo, com o ID "DOC-" + código.

**Etapa 2: Kanban por ID**
- [ ] Com o modal de um documento aberto, uma sincronização que reordena a lista não faz a ação seguinte cair em outro documento.
- [ ] O "Desfazer" de um cancelamento restaura o mesmo documento, mesmo que uma sincronização ocorra durante os 4 segundos.

**Etapa 3: Fila de envios**
- [ ] Com a rede desligada, um cadastro é salvo, aparece com a marca "não sincronizado", e o indicador do cabeçalho mostra 1 pendência.
- [ ] Ao religar a rede, a pendência é enviada sozinha em até 60 segundos, a marca some, e a linha aparece na planilha uma única vez.
- [ ] Toda falha de envio mostra um aviso na tela. Nenhuma falha fica só no console.
- [ ] Ao fechar e reabrir o navegador com pendências, elas continuam na fila e são reenviadas.
- [ ] Depois de 5 falhas, a pendência aparece como "falhou" e pode ser reenviada com o botão "Tentar agora".

**Etapa 4: Merge por ID**
- [ ] Um documento cadastrado sem rede **não some** ao clicar em "Sincronizar Nuvem" com o fluxo de leitura funcionando.
- [ ] Um status alterado direto na planilha (com Data Modificação mais recente) aparece no navegador que já tinha feito alterações locais em **outros** documentos.
- [ ] Uma alteração local ainda na fila não é sobrescrita pela nuvem na sincronização.
- [ ] A chave docflow_modificacoes_locais não existe mais no localStorage depois da primeira abertura da nova versão.

**Etapa 5: Histórico acumulativo**
- [ ] Um documento com 3 etapas registradas continua mostrando as 3 na timeline e na auditoria depois de sincronizar.
- [ ] Sincronizar duas vezes seguidas não duplica eventos.
- [ ] A contagem de devoluções do cartão continua correta após a sincronização.
- [ ] O upload de anexos gera um evento ANEXO visível na auditoria.

**Etapa 6: Fluxo de atualização**
- [ ] Mover um documento no Kanban atualiza a coluna Status e a Data Modificação da **mesma linha** na planilha, sem criar linha nova.
- [ ] O upload de anexos pelo modal não cria linha nova na planilha. Os arquivos aparecem na pasta existente, e a quantidade de anexos é atualizada.
- [ ] Enviar a mesma atualização duas vezes (simulando uma nova tentativa) não altera o resultado nem cria linhas.
- [ ] Uma atualização com data mais antiga que a da planilha recebe "conflito", e o navegador passa a mostrar os valores da planilha, com um aviso ao usuário.

## 6. Riscos

- **Migração de IDs:** se a coluna ID da planilha for preenchida com valores diferentes de "DOC-" + código, o histórico antigo (associado por esse ID) pode ficar órfão. Preencha exatamente com esse padrão, e faça uma cópia de segurança da planilha antes.
- **Colunas novas na planilha (ID e Data Modificação):** os fluxos de leitura, cadastro e atualização precisam ser ajustados ao mesmo tempo. Uma versão do navegador que espera a coluna, rodando com um fluxo antigo, cai na regra "a nuvem vence".
- **Duplicação por nova tentativa:** sem a verificação de ID já existente nos fluxos de cadastro e histórico, a fila pode inserir linhas repetidas. Os ajustes desses fluxos devem ser feitos antes de ativar a Etapa 3.
- **Relógios diferentes entre computadores** podem inverter a regra da data mais recente em alterações quase simultâneas. O risco é aceitável para o volume atual. A resposta "conflito" do fluxo reduz o problema.
- **Espaço do localStorage** (cerca de 5 MB): o histórico acumulativo e a fila crescem. A fila não guarda arquivos em Base64, e pendências enviadas devem ser apagadas.
- **Aposentar as modificações locais:** no primeiro uso, alterações locais que nunca chegaram à planilha (status mudados antes desta correção) podem ser sobrescritas pela nuvem. Antes do deploy, o Eric deve conferir e acertar os status na planilha ou exportar a base de cada máquina principal.
- **Segurança:** esta correção **não** resolve a exposição das URLs dos webhooks no código-fonte (tratada à parte, no item 12.1 da documentação). O fluxo novo terá a mesma exposição.
- **Dados de negócio fixos no código:** remover os filtros "monto-001"/"suprimento" da sincronização pode fazer reaparecer eventos que eles escondiam. Verifique a aba de Histórico antes.

---

## Instruções para o Antigravity

- **O que implementar:** as Etapas 1 a 6 da seção 4, **uma de cada vez e na ordem**, com um commit por etapa e sem avançar antes da validação do Eric. Para cada etapa:
  1. **ID estável:** gerar o ID do documento no cadastro, em formulario.js (no ponto em que a nova tramitação é montada, antes de salvarTramitacoes e de enviarParaExcelSharePoint). Incluir o ID e a dataModificacao nos dados enviados ao fluxo de cadastro. Em data-service.js, fazer desduplicarTramitacoes usar o ID como chave (código ou título só como alternativa para linhas sem ID). Manter gerarIdDocumento apenas como alternativa para dados antigos, sem gerar IDs a partir da posição. Fazer normalizarItemExcel ler a coluna "Data Modificação". Toda gravação local que altera um documento deve atualizar a dataModificacao **só daquele documento**.
  2. **Kanban por ID:** em planner.js, trocar o parâmetro de posição por ID em window.moverStatus, window.abrirModalDetalhes, window.abrirModalEdicao, window.solicitarCancelamentoDocumento e window.abrirModalAuditoria, em criarCartao, criarCartaoCancelado, renderizarRiverTimeline e contarDevolucoes, e nos botões gerados no modal de detalhes. A variável do documento aberto no modal (hoje, uma posição) passa a guardar o ID. Criar uma função auxiliar que localiza o documento na lista atual pelo ID e aborta com aviso se não o encontrar. O "Desfazer" do cancelamento deve usar o ID.
  3. **Fila de envios:** criar em data-service.js as funções exportadas enfileirarEnvio, processarFilaEnvios, obterFilaEnvios e reenviarPendencia, gravando na chave docflow_fila_envios. Fazer passar pela fila: adicionarHistoricoAlteracao (quando o envio à nuvem está ativo), sincronizarComPowerAutomate (planner.js), enviarParaExcelSharePoint (formulario.js) e enviarArquivosParaSharePoint (esta última só com os metadados na fila; o conteúdo dos arquivos é enviado na hora, com aviso em caso de falha). Chamar processarFilaEnvios no início de buscarDadosDoPowerAutomate, ao carregar as páginas, no evento de volta à conexão (online) e em um intervalo de 60 segundos enquanto houver pendências. Usar mostrarNotificacaoToast para os avisos de falha. Criar o indicador de pendências no cabeçalho, junto do menu criado por inicializarMenuConfiguracoes, e a marca "não sincronizado" em criarCartao.
  4. **Merge por ID:** reescrever a parte final de buscarDadosDoPowerAutomate para mesclar as listas local e remota pelo ID, seguindo a tabela da Etapa 4. Criar uma função exportada mesclarTramitacoes, reutilizada por importarArquivoExcel. Remover de salvarTramitacoes a gravação em docflow_modificacoes_locais. Remover o uso de obterModificacoesLocais na sincronização. Apagar a chave docflow_modificacoes_locais uma vez na inicialização. Ajustar limparHistoricoManterUltimos, que hoje remove essa chave, para não depender dela.
  5. **Histórico acumulativo:** em buscarDadosDoPowerAutomate, trocar a redução a um evento por documento por um merge pelo ID do evento com obterTodoHistorico, e só depois chamar salvarTodoHistorico. Remover os filtros fixos "monto-001", "suprimento", "muen" e "muem" da sincronização. Fazer obterHistoricoDocumento priorizar o ID do documento. Gerar um evento com tipoAcao ANEXO após o upload de anexos em planner.js.
  6. **Fluxo de atualização:** fazer sincronizarComPowerAutomate enviar o contrato da Etapa 6 (id, codigo, dataModificacao, campos alterados, autor e, opcionalmente, anexos) para URL_WEBHOOK_UPDATE_STATUS, pela fila. Tratar as respostas "atualizado", "nao_encontrado" (manter a pendência como "falhou" e avisar) e "conflito" (aplicar os valores da linha recebida e avisar). Trocar o upload de anexos do modal para usar esse fluxo, e não mais URL_WEBHOOK_POST. Chamar a atualização também no salvamento da edição completa e no registro de etapa da timeline.
- **Onde (telas e arquivos):** data-service.js (núcleo: ID, fila, merge, histórico), planner.js (Kanban, modais, timeline, anexos e atualização), formulario.js (cadastro com ID e envio pela fila), index.html e formulario.html (só se o indicador de pendências precisar de um contêiner no cabeçalho). Depois de cada etapa, atualizar as seções 7.3, 7.4, 8, 9, 10 e 12.2 de doc_projeto/02-estrutura-do-codigo.md.
- **O que não alterar:**
  - Os valores das constantes de webhook: não trocar, apagar nem adicionar URLs. A URL do fluxo novo é preenchida pelo Eric.
  - auth-service.js e o fluxo de login.
  - O layout e as cores do Kanban, além do indicador e da marca de pendência descritos acima.
  - Os nomes e o significado dos status nem a regra de classificarColuna.
  - O formato dos dados enviados ao fluxo de cadastro: só acrescentar ID e dataModificacao, sem remover campos existentes, porque o fluxo depende deles.
  - Não incluir URLs nem senhas em código novo, commits ou logs.
- **Como testar:**
  - Rode o sistema localmente pelo Live Server (porta 5501).
  - Para simular falhas sem tocar nos fluxos de produção, use o modo off-line das ferramentas de desenvolvedor do navegador (aba Rede), em vez de trocar as constantes.
  - Inspecione as chaves tramitacoes, docflow_historico_alteracoes e docflow_fila_envios em Application → Local Storage.
  - Execute os critérios de aceite da etapa em questão e os das etapas anteriores (regressão). Os testes das Etapas 1 e 6 exigem que os fluxos ajustados pelo Eric estejam publicados. Até lá, valide só o lado do navegador e registre essa pendência.

---

## Resultado da implantação

- **Data da implantação:** 28 de Setembro de 2026
- **Validado por:** Eric
- **O que foi feito:** Foram implementadas as 6 etapas estruturais da integridade de sincronização, incluindo a migração de identificadores baseados em índices para IDs únicos por documento (UUIDs), fila assíncrona de submissão ao Power Automate (para cadastro, atualização e histórico), política inteligente de merge por `dataModificacao` entre dados da planilha local e da nuvem, e preservação do histórico de forma cumulativa. Além disso, criaram-se os novos padrões de payload para submissão aos webhooks do Flow.
- **Diferenças em relação à proposta:** O campo `ID` do Power Automate e `Data Modificação` devem ser adicionados na base excel do SharePoint para acompanhar os dados enviados pelo payload nos formulários.
- **Observações e pendências:**
  1. A constante `URL_WEBHOOK_UPDATE_STATUS` no `data-service.js` está em branco (precisa da URL do novo fluxo HTTP para rodar a atualização - isso depende do PO).
  2. A Planilha do Excel e fluxo do Power Automate agora precisam prever no payload as propriedades `id` e `dataModificacao` conforme arquitetado na Etapa 6.
