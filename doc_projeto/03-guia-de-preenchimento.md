# Guia de Preenchimento do DocFlow

Este guia explica, passo a passo, como cadastrar e acompanhar documentos no **DocFlow**, o sistema de tramitação de documentos. Ele foi escrito para:

- **Solicitantes das áreas**, que enviam documentos novos ou revisões para a Qualidade;
- **Equipe da Qualidade**, que analisa os documentos, muda o status e acompanha os prazos.

Você não precisa de conhecimento técnico para usar o sistema.

---

## Sumário

1. [Como acessar e fazer login](#1-como-acessar-e-fazer-login)
2. [Visão geral das telas](#2-visão-geral-das-telas)
3. [Novo Documento ou Revisão Técnica: qual aba usar](#3-novo-documento-ou-revisão-técnica-qual-aba-usar)
4. [Passo a passo: cadastrar um documento novo](#4-passo-a-passo-cadastrar-um-documento-novo)
5. [Passo a passo: cadastrar uma revisão](#5-passo-a-passo-cadastrar-uma-revisão)
6. [Tabela campo a campo](#6-tabela-campo-a-campo)
7. [Regras de arquivos (principal e anexos)](#7-regras-de-arquivos-principal-e-anexos)
8. [O que acontece ao clicar em "Registrar Documento"](#8-o-que-acontece-ao-clicar-em-registrar-documento)
9. [Acompanhando o documento no Painel](#9-acompanhando-o-documento-no-painel)
10. [Mudando o status e editando um documento](#10-mudando-o-status-e-editando-um-documento)
11. [Exportação para Excel (CSV)](#11-exportação-para-excel-csv)
12. [Erros comuns e boas práticas](#12-erros-comuns-e-boas-práticas)
13. [Perguntas frequentes](#13-perguntas-frequentes)

---

## 1. Como acessar e fazer login

1. Abra o endereço do DocFlow informado pela Qualidade/SGI. A tela de login se chama **"Acesse sua Conta"**.
2. Preencha:
   - **E-mail Corporativo**: o seu e-mail da empresa (por exemplo, `seu.nome@monto.com.br`). O sistema também aceita o seu **nome** exatamente como está cadastrado.
   - **Senha de Acesso**: a senha que foi fornecida a você pelo administrador do sistema.
3. Clique em **Acessar DocFlow**.
4. Se estiver tudo certo, aparece "Bem-vindo! Redirecionando..." e você é levado ao **Painel**. Se você tentou abrir outra página antes de entrar (por exemplo, o formulário), o sistema leva você de volta para ela após o login.

**Dicas:**

- O ícone de olho ao lado da senha mostra ou esconde o que você digitou.
- O botão de sol/lua no canto superior direito alterna entre modo claro e escuro.
- Nunca compartilhe sua senha. Se você não tem acesso ou esqueceu a senha, fale com o administrador do DocFlow (a base de usuários é mantida pela equipe responsável na planilha do SharePoint).
- A sessão fica salva no navegador. Para sair, clique na **engrenagem** (menu lateral, parte de baixo) e depois em **Sair da Conta**. Faça isso sempre que usar um computador compartilhado.

**Mensagens de erro no login:**

| Mensagem | O que fazer |
|---|---|
| "Por favor, informe tanto o e-mail quanto a senha." | Preencha os dois campos. |
| "Usuário não cadastrado na base de dados." | Confira o e-mail. Se estiver correto, peça ao administrador para cadastrar você. |
| "Senha incorreta. Verifique suas credenciais." | Digite a senha novamente com atenção a maiúsculas e minúsculas. |
| "Este usuário está inativo. Consulte o administrador." | Seu acesso foi desativado. Procure o administrador. |

---

## 2. Visão geral das telas

O menu lateral esquerdo tem duas opções:

| Menu | Para que serve |
|---|---|
| **Painel** | Quadro de acompanhamento (Kanban) com indicadores de prazo, busca, filtros e detalhes de cada documento. |
| **Novo Registro** | Formulário para cadastrar documentos e revisões, com a lista "Documentos Registrados Recentemente" e o botão de exportação para Excel. |

Na parte de baixo do menu lateral fica a **engrenagem** (Configurações & Sincronização), com:

- seu nome, perfil e área;
- **Aparência**: Claro ou Escuro;
- **Dados & Sincronização**: mostra de onde vêm os dados ("Nuvem (SharePoint)" ou "Cache Local") e quantos documentos existem, com os botões **Sincronizar Nuvem** e **Carregar Excel (.xlsx)**;
- **Sair da Conta**.

O botão da seta no menu lateral recolhe ou expande o menu.

---

## 3. Novo Documento ou Revisão Técnica: qual aba usar

No topo do formulário há duas abas: **Novo Documento** e **Revisão Técnica**. Os campos são os mesmos nas duas abas. O que muda é apenas o comportamento do campo **N° de Revisão**:

| Aba | Quando usar | O que o sistema faz |
|---|---|---|
| **Novo Documento** (padrão) | O documento está sendo criado pela primeira vez. | Coloca o **N° de Revisão** em **0**. |
| **Revisão Técnica** | O documento já existe e você está enviando uma nova versão. | Se o N° de Revisão estiver em 0 ou vazio, muda para **1** e coloca o cursor no campo **Código do Documento**, para você informar o código do documento que está sendo revisado. |

Pontos importantes:

- Ao voltar para a aba **Novo Documento**, o N° de Revisão volta para **0**, mesmo que você tenha digitado outro número. Escolha a aba **antes** de ajustar o número.
- Na aba **Revisão Técnica**, se a revisão não for a 1 (por exemplo, rev. 3), digite o número correto manualmente.
- **Use exatamente o mesmo código** do documento original na revisão. O sistema identifica o documento pelo **Código** (ou, se o código estiver vazio, pelo **Título**). Quando você registra algo com um código que já existe, o registro **substitui/atualiza** o documento existente no painel, em vez de criar um cartão novo.

---

## 4. Passo a passo: cadastrar um documento novo

1. No menu lateral, clique em **Novo Registro** (ou, no Painel, no botão **Novo**).
2. Confirme que a aba **Novo Documento** está selecionada.
3. Preencha o **Título do Documento** (obrigatório).
4. Preencha o **Código do Documento**, se já houver um código definido (ex.: `MR-IND-0001-CTO-001`).
5. Escolha o **Tipo de Documento** (obrigatório).
6. Deixe o **Status da Tramitação** como **Recebido** (é o padrão para um documento que está entrando).
7. Informe a **Data de Recebimento** (obrigatória).
8. Informe a **Data de Revisão (Prazo)**, se houver um prazo combinado. Ela alimenta os alertas de prazo do Painel.
9. Confira o **Remetente / Solicitante** (obrigatório). Ele já vem preenchido com o seu nome.
10. Deixe o **N° de Revisão** em **0**.
11. Confira a **Área / Setor** (já vem com a sua área) e preencha a **Disciplina**, se aplicável.
12. Em **Arquivo do Documento Principal**, clique em **Procurar Arquivo** e selecione o arquivo (obrigatório). O nome do arquivo aparece ao lado do título do campo.
13. Se houver documentos de apoio, clique em **Adicionar Anexos** em **Documentos Complementares (Pasta Anexos)**. Você pode clicar várias vezes para ir somando arquivos.
14. Escreva em **Observações Complementares** qualquer informação útil para a Qualidade.
15. Clique em **Registrar Documento** e aguarde. Durante o envio o botão mostra "Enviando com Anexos...".
16. Quando o botão voltar ao normal e o formulário for limpo, o registro foi gravado. Ele aparece na lista **Documentos Registrados Recentemente**, logo abaixo, e no **Painel**.

---

## 5. Passo a passo: cadastrar uma revisão

1. Clique em **Novo Registro**.
2. Clique na aba **Revisão Técnica**. O N° de Revisão passa para **1** e o cursor vai para o campo **Código do Documento**.
3. Digite o **Código do Documento** exatamente igual ao do documento original.
4. Ajuste o **N° de Revisão** se não for a revisão 1.
5. Preencha **Título**, **Tipo de Documento**, **Data de Recebimento** e **Remetente / Solicitante** (obrigatórios). Mantenha o mesmo título do original, sempre que possível.
6. Informe a nova **Data de Revisão (Prazo)**, se houver.
7. Anexe o **arquivo principal** da nova versão (obrigatório) e, se necessário, os anexos complementares.
8. Em **Observações Complementares**, descreva o que mudou nesta revisão (ex.: "Atualizado item 4.2 conforme auditoria interna").
9. Clique em **Registrar Documento**.

> Lembre-se: como o código é o mesmo, o documento existente no Painel é **atualizado** com os novos dados (status, revisão, datas etc.). Não se cria um segundo cartão.

---

## 6. Tabela campo a campo

Formulário **Registro de Documento – DocFlow** (tela **Novo Registro**). Os campos com asterisco (*) no rótulo são obrigatórios: o botão **Registrar Documento** só funciona depois que eles estiverem preenchidos.

| Rótulo exibido | Obrigatório | Formato | Valor padrão / autopreenchido | Opções | Dicas |
|---|---|---|---|---|---|
| **Título do Documento \*** | Sim | Texto livre | Vazio | — | Use o nome oficial do documento. O título também dá nome à pasta no SharePoint (veja a seção 7). Evite títulos repetidos. |
| **Código do Documento** | Não | Texto livre | Vazio | — | Ex.: `MR-IND-0001-CTO-001`. Em revisões, é essencial: use o mesmo código do original. |
| **Tipo de Documento \*** | Sim | Lista | "Selecione o tipo..." (nenhum) | MP - Mapas / Riscos; PR - Procedimento; IT - Instrução de Trabalho; ET - Especificação Técnica; RL - Relatório; AT - Ata de Reunião; LD - Lista de Documentos | Escolha o tipo pela sigla do documento. |
| **Status da Tramitação** | Não | Lista agrupada | **Recebido** | Veja a lista completa logo abaixo desta tabela | Solicitantes: mantenham **Recebido**. A Qualidade muda o status depois, pelo Painel. |
| **Data de Recebimento \*** | Sim | Data (calendário do navegador) | Vazio | — | Data em que o documento chegou/foi enviado. Clique no ícone de calendário para escolher. |
| **Data de Revisão (Prazo)** | Não | Data | Vazio | — | Prazo para concluir a análise. Sem essa data, o Painel não mostra alertas de "Vence em..." ou "Atrasado". |
| **Remetente / Solicitante \*** | Sim | Texto livre | **Seu nome** (do usuário logado) | — | Pode ser alterado se você estiver cadastrando em nome de outra pessoa. |
| **N° de Revisão** | Não | Número inteiro, mínimo 0 | **0** (aba Novo Documento) ou **1** (aba Revisão Técnica) | — | Não aceita números negativos. |
| **Área / Setor** | Não | Texto livre | **Sua área** (do usuário logado) | — | Ex.: Custos, Engenharia. Escreva sempre do mesmo jeito: o filtro "Filtrar por Área" do Painel usa exatamente esse texto. |
| **Disciplina** | Não | Texto livre | Vazio | — | Ex.: Corporativo, Mecânica. |
| **Arquivo do Documento Principal \*** | Sim | Um único arquivo | "Nenhum selecionado" | — | Botão **Procurar Arquivo**. Veja a seção 7. |
| **Documentos Complementares (Pasta Anexos)** | Não | Vários arquivos | "0 anexos adicionados" | — | Botão **Adicionar Anexos**. Cada arquivo aparece como uma etiqueta com 📎; clique no **×** para remover um anexo. |
| **Observações Complementares** | Não | Texto livre (várias linhas) | Vazio | — | Informe contexto, o que mudou, urgência etc. Esse texto também aparece no histórico do documento. |

### Status disponíveis (exatamente como aparecem na lista)

| Grupo | Status |
|---|---|
| 1. Entrada & Triagem | Recebido |
| 2. Em Análise Técnica (Qualidade) | Em revisão da qualidade · Em revisão junto à área · Em Revisão (Geral) |
| 3. Devolvido para a Área | Devolvido para área para revisão · Devolvido para correção · Em revisão do solicitante |
| 4. Em Validação & Aprovação | Para aprovação da área solicitante · Para aprovação qualidade |
| 5. Conclusão & Arquivo | Aprovado · Cancelado |

> Observação: na tela de **edição** do Painel existe também o tipo **Memorial Descritivo**, que não aparece no formulário de cadastro.

### Botão ✕ (Limpar formulário)

O **✕** no canto superior direito do formulário apaga os campos digitados. Atenção: depois de clicar nele, confira o **Remetente** e a **Área** (eles podem ficar vazios) e verifique se a lista de anexos e o nome do arquivo principal foram realmente limpos antes de começar um novo cadastro. Se tiver dúvida, recarregue a página (tecla F5).

---

## 7. Regras de arquivos (principal e anexos)

### Arquivo principal

- É **obrigatório** e aceita **um único arquivo**.
- Para trocar, clique de novo em **Procurar Arquivo** e escolha outro arquivo.

### Anexos complementares

- São **opcionais** e aceitam **vários arquivos**.
- Você pode clicar em **Adicionar Anexos** várias vezes; os arquivos vão se somando na lista **"Arquivos complementares a salvar na pasta /Anexos:"**.
- Para retirar um anexo da lista, clique no **×** da etiqueta.

### Formatos aceitos

O sistema **não restringe o tipo de arquivo**: nenhum dos campos de upload tem limitação de formato. Qualquer arquivo pode ser selecionado. Como boa prática, prefira:

- **PDF** para documentos para leitura/aprovação;
- **Word (.docx)** ou **Excel (.xlsx)** quando a Qualidade precisar editar o arquivo.

Evite arquivos muito grandes, compactados (.zip, .rar) ou executáveis. Não há limite de tamanho informado na tela, mas arquivos grandes deixam o envio mais lento.

### Como a pasta no SharePoint é nomeada

Para cada documento, o sistema cria uma pasta no repositório de Tramitação de Documentos do SharePoint:

- O **nome da pasta é o Título do Documento**.
- Os caracteres `~ " # % & * : < > ? / \ { | }` são trocados por hífen (`-`), e espaços repetidos viram um só.
- O **arquivo principal** fica na pasta do documento, e os **anexos complementares** ficam na subpasta **/Anexos**.

Exemplos:

| Título digitado | Nome da pasta |
|---|---|
| `Manual de Procedimentos` | `Manual de Procedimentos` |
| `Procedimento: Compras & Contratos` | `Procedimento- Compras - Contratos` |
| `IT 05/2026 - Solda` | `IT 05-2026 - Solda` |

> Como o nome da pasta vem do título, **dois documentos com o mesmo título vão para a mesma pasta**. Use títulos únicos e descritivos.

---

## 8. O que acontece ao clicar em "Registrar Documento"

1. O navegador confere se os campos obrigatórios estão preenchidos.
2. O botão muda para **"Enviando com Anexos..."** e fica bloqueado.
3. O documento é gravado imediatamente no DocFlow e aparece na lista **Documentos Registrados Recentemente** e no **Painel**.
4. Um primeiro evento é criado no histórico do documento, do tipo **"Cadastro Inicial"**, com o status escolhido (normalmente "Recebido"), o remetente como autor e as observações que você escreveu.
5. Os dados, o arquivo principal e os anexos são enviados automaticamente para o **Excel e a pasta do SharePoint**.
6. Ao terminar, o botão volta ao normal, o formulário é limpo e o seu nome e a sua área são preenchidos de novo, prontos para o próximo cadastro.

> Importante: o sistema **não mostra uma mensagem de "enviado com sucesso"** nem de erro do envio ao SharePoint. Para confirmar que tudo chegou, abra o documento no Painel e clique em **Abrir Pasta no SharePoint** (veja a seção 9).

---

## 9. Acompanhando o documento no Painel

Clique em **Painel** no menu lateral.

### Indicadores (KPIs)

No topo há quatro indicadores. Eles consideram apenas documentos **não cancelados** e respeitam a busca e o filtro de área que estiverem aplicados.

| Indicador | O que significa |
|---|---|
| **Total Cadastrado** — "documentos em tramitação ativa" | Documentos que ainda estão em andamento (todos, exceto os **Aprovados** e os **Cancelados**). |
| **Vencendo esta semana** — "prazo entre hoje e 5 dias" | Documentos em andamento cuja **Data de Revisão (Prazo)** é hoje ou nos próximos 5 dias. |
| **Atrasados** — "passaram do prazo de revisão" | Documentos em andamento cuja **Data de Revisão (Prazo)** já passou. |
| **Aprovados** — "concluídos este mês" | Documentos com status **Aprovado**. Atenção: hoje o número inclui **todos** os aprovados, não só os do mês atual. |

Documentos sem **Data de Revisão (Prazo)** entram no Total, mas nunca aparecem em "Vencendo" nem em "Atrasados".

### Busca e filtros

- **Buscar por título, código ou remetente...**: filtra o quadro enquanto você digita.
- **Filtrar por Área**: lista as áreas que existem nos documentos cadastrados. "Todas as Áreas" remove o filtro.
- **Cancelados**: abre uma janela com os documentos cancelados (o número ao lado mostra quantos são).
- **Novo**: abre o formulário de cadastro.

### Colunas do quadro (Kanban)

Cada documento aparece como um cartão em uma das 5 colunas, de acordo com o status:

| Coluna | Status que caem nela |
|---|---|
| **Recebido** | Recebido |
| **Em Revisão** | Em revisão da qualidade · Em revisão junto à área · Em Revisão (Geral) |
| **Devolvido à Área** | Devolvido para área para revisão · Devolvido para correção · Em revisão do solicitante |
| **Em Aprovação** | Para aprovação da área solicitante · Para aprovação qualidade |
| **Aprovado** | Aprovado |

Documentos **Cancelados** não aparecem no quadro; ficam no botão **Cancelados**.

### O que o cartão mostra

- **Código** (ou "S/ CÓDIGO") e **Rev.** (número da revisão);
- **Título**, **status** e **tipo**;
- **Etiqueta de prazo** (quando há Data de Revisão e o documento não está aprovado);
- **↺ N×**: quantas vezes o documento já foi devolvido para a área/solicitante (retrabalho);
- **Remetente** e a data (📅): mostra a data de revisão ("Revisão até") ou, se não houver, a data de recebimento ("Recebido em");
- Botões **Editar**, **Detalhes** e **Histórico**.

### Cores de prazo

| Cor | Texto no cartão | Significado |
|---|---|---|
| **Verde** | "Prazo: dd/mm/aaaa" | Faltam mais de 5 dias para o prazo. |
| **Âmbar (amarelo/laranja)** | "Vence hoje" ou "Vence em N dias" | O prazo é hoje ou nos próximos 5 dias. |
| **Vermelho (coral)** | "Atrasado há N dias" | O prazo já passou. |
| Sem etiqueta | — | O documento não tem Data de Revisão (Prazo) ou já está Aprovado. |

### Janela de detalhes

Clique no cartão (ou em **Detalhes**) para abrir a janela do documento. Ela tem:

- **Topo**: ID, código, revisão, status e os botões **Histórico Completo**, **Editar** e **✕** (fechar). A tecla **Esc** também fecha.
- **Lado esquerdo**: Remetente / Responsável, Área & Disciplina, Data de Recebimento, Data Limite de Revisão, Observações da Tramitação e **Arquivos & Pastas Vinculadas**.
- **Lado direito**: **Fluxo de Tramitação** (linha do tempo, do mais recente para o mais antigo; clique em um evento para ver "▾ Detalhes") e o bloco **Atualizar Etapa**.
- **Rodapé**: **Abrir Pasta no SharePoint** (ou **🔗 Inserir link da pasta do SharePoint**, se ainda não houver link), **✏️ Alterar Link** e os **botões de ação rápida**.

#### Arquivos & Pastas Vinculadas

- Mostra o nome do documento principal e a quantidade de anexos na pasta /Anexos.
- Se não houver nenhum arquivo nem link, aparece o aviso **"Nenhum arquivo anexado ou link disponível"**.
- Pelo painel **Anexar Arquivos ao SharePoint** você pode enviar arquivos depois do cadastro: escolha o **Documento Principal (PDF/DOC)** e/ou **Anexos Complementares** e clique em **Criar Pasta & Salvar Arquivos no SharePoint**. É preciso selecionar pelo menos um arquivo.
- Pelo **✏️ Link** / **✏️ Alterar Link** você pode colar manualmente o endereço da pasta do SharePoint e clicar em **Salvar Link**.

#### Histórico Completo

O botão **Histórico Completo** (ou **Histórico** no cartão) mostra todas as movimentações do documento, com data/hora e autor. Os tipos de evento são: **Cadastro Inicial**, **Mudança de Status**, **Edição de Dados** (mostra cada campo com valor anterior ➔ novo), **Arquivos / SharePoint** e **Cancelamento**.

---

## 10. Mudando o status e editando um documento

Há três formas de mudar o status. Todas ficam registradas no histórico, com o nome de quem fez a alteração.

### a) Botões de ação rápida (rodapé da janela de detalhes)

Os botões mudam conforme a coluna em que o documento está:

| Coluna atual | Botões disponíveis | Novo status aplicado |
|---|---|---|
| Recebido | **🔍 Iniciar Revisão** / **↩ Devolver à Área** | Em revisão da qualidade / Devolvido para área para revisão |
| Em Revisão | **↩ Devolver à Área** / **📋 P/ Aprovação** / **✓ Aprovar** | Devolvido para área para revisão / Para aprovação da área solicitante / Aprovado |
| Devolvido à Área | **🔍 Retomar Revisão** / **📋 P/ Aprovação** | Em revisão da qualidade / Para aprovação da área solicitante |
| Em Aprovação | **↩ Devolver p/ Correção** / **✓ Aprovar** | Devolvido para correção / Aprovado |
| Aprovado | **↺ Reabrir Revisão** | Em revisão da qualidade |
| Cancelado | **↺ Reativar Documento** | Recebido |

Em todas as colunas ativas há também o botão **🚫 Cancelar** (veja abaixo).

### b) Bloco "Atualizar Etapa" (lado direito da janela de detalhes)

Use quando precisar de um status que não está nos botões rápidos ou quando quiser registrar uma observação.

1. Em **Status**, escolha o novo status (mesma lista da seção 6).
2. Em **Observação**, descreva o motivo ou o que foi feito. Se deixar em branco, o sistema registra automaticamente "Etapa alterada de ... para ...".
3. Para os status de **devolução** (Devolvido para área para revisão, Devolvido para correção) e de **aprovação** (Para aprovação da área solicitante, Para aprovação qualidade), aparece o campo **Definir responsável**, que é **obrigatório**. Ele já vem sugerido (ex.: "Área Solicitante (Custos)", "Gestor da Área (Custos)" ou "Coordenação da Qualidade"); ajuste se necessário.
4. Clique em **Registrar Alteração**. O botão mostra "✓ Registrado!" e a linha do tempo é atualizada.

### c) Editando os dados (botão Editar)

1. Clique em **Editar** no cartão ou na janela de detalhes.
2. Altere os campos: Título do Documento \*, Código do Documento, Tipo de Documento, Status da Tramitação, N° de Revisão, Remetente / Responsável, Área / Setor, Disciplina, Data de Recebimento, Data Limite de Revisão e Observações Complementares. Na edição, apenas o **Título** é obrigatório.
3. Clique em **Salvar Alterações** (ou **Cancelar** para desistir).
4. Aparece "Dados do documento atualizados com sucesso!". O histórico registra quais campos mudaram, com o valor antigo e o novo.

> Cuidado ao alterar o **Código** ou o **Título**: eles identificam o documento. Se você colocar o código de outro documento que já existe, os dois podem ser unificados em um só cartão.

### Cancelar e reativar

- **🚫 Cancelar** pede confirmação ("Tem certeza que deseja cancelar este documento?"). Ao confirmar com **Sim, cancelar**, o documento sai do quadro e aparece por **4 segundos** o aviso "Documento cancelado com sucesso." com o botão **Desfazer**.
- Para reativar depois, clique em **Cancelados**, localize o documento e:
  - clique em **Reativar** no cartão: o documento volta com o status **Em Revisão**; ou
  - abra os detalhes e clique em **↺ Reativar Documento**: o documento volta com o status **Recebido**.

---

## 11. Exportação para Excel (CSV)

1. Vá em **Novo Registro**.
2. Na seção **Documentos Registrados Recentemente**, clique em **Exportar Excel (CSV)**.
3. O navegador baixa o arquivo **`tramitacao_documentos.csv`**.

Detalhes do arquivo:

- Colunas: Código; Título; Tipo de Documento; N° de Revisão; Status; Data de Recebimento; Data de Revisão; Remetente; Área; Disciplina; Observação.
- As colunas são separadas por **ponto e vírgula (;)**, o que faz o arquivo abrir direto em colunas no Excel em português, com acentos corretos.
- As datas saem no formato **aaaa-mm-dd** (ex.: 2026-09-28).
- O arquivo traz **todos** os documentos da base, incluindo aprovados e cancelados. Links de pasta e nomes de arquivos não são exportados.
- Se não houver documentos, aparece o aviso "Não existem registos para exportar."

> A exportação existe apenas na tela **Novo Registro**; o Painel não tem esse botão.

---

## 12. Erros comuns e boas práticas

### Erros comuns

| Situação | Causa provável | Como resolver |
|---|---|---|
| Cliquei em **Registrar Documento** e nada aconteceu, sem nenhuma mensagem. | O **Arquivo do Documento Principal** não foi selecionado. Como o campo de arquivo fica escondido atrás do botão, o navegador bloqueia o envio sem mostrar aviso. | Confira se o nome do arquivo aparece ao lado de "Arquivo do Documento Principal \*" (e não "Nenhum selecionado"). Selecione o arquivo e tente de novo. |
| Aparece um balão "Preencha este campo" ou "Selecione um item da lista". | Um campo obrigatório está vazio (Título, Tipo de Documento, Data de Recebimento ou Remetente). | Preencha o campo indicado. |
| O N° de Revisão voltou para 0. | Você clicou na aba **Novo Documento** depois de digitar o número. | Selecione a aba primeiro e só depois ajuste o número. |
| A revisão apareceu como um cartão novo, em vez de atualizar o documento existente. | O código foi digitado diferente do original (espaço a mais, letra trocada) ou ficou vazio. | Edite o cartão novo e corrija o código, ou fale com a Qualidade. Copie e cole o código do cartão original. |
| Um documento sumiu ou teve os dados trocados por outro. | Dois cadastros com o **mesmo código**, ou ambos **sem código e com o mesmo título**, são unificados em um só. | Sempre informe o código. Use títulos únicos. |
| Não aparece etiqueta de prazo no cartão nem contagem em "Vencendo"/"Atrasados". | O documento não tem **Data de Revisão (Prazo)**. | Edite o documento e informe a Data Limite de Revisão. |
| A área não aparece no filtro, ou aparece duplicada ("Custos" e "custos"). | O texto da área foi digitado de formas diferentes. | Padronize o nome da área (edite os documentos, se preciso). |
| Os arquivos não estão na pasta do SharePoint. | O envio automático pode ter falhado sem aviso. | Abra os detalhes do documento e use **Anexar Arquivos ao SharePoint** para reenviar, ou cole o link correto em **✏️ Link**. |
| Ao mudar a etapa aparece "Por favor, preencha o campo 'Definir responsável' para esta etapa." | Status de devolução ou de aprovação exige um responsável. | Preencha **Definir responsável**. |
| Os dados parecem desatualizados. | O navegador está mostrando o que ficou salvo localmente. | Clique na **engrenagem** > **Sincronizar Nuvem**. |

### Boas práticas

- **Sempre informe o Código do Documento.** Ele é a chave para localizar e revisar o documento.
- **Use títulos únicos e descritivos.** O título vira o nome da pasta no SharePoint.
- **Defina a Data de Revisão (Prazo)** para que os alertas de prazo funcionem.
- **Solicitantes:** cadastrem com o status **Recebido**. A mudança de status é feita pela Qualidade no Painel.
- **Escreva observações claras**, principalmente em revisões e devoluções ("o que mudou", "o que falta corrigir").
- **Prefira PDF** para o arquivo principal quando o documento for apenas para leitura/aprovação.
- **Confirme o envio** abrindo o documento no Painel e clicando em **Abrir Pasta no SharePoint**.
- **Qualidade:** use o bloco **Atualizar Etapa** (com observação) em vez dos botões rápidos quando a mudança precisar de justificativa.
- **Saia da conta** (engrenagem > Sair da Conta) em computadores compartilhados.

---

## 13. Perguntas frequentes

**1. Qual a diferença entre as abas "Novo Documento" e "Revisão Técnica"?**
Os campos são os mesmos. A aba **Revisão Técnica** apenas coloca o N° de Revisão em 1 (se estava em 0) e leva o cursor para o campo Código. A aba **Novo Documento** coloca o N° de Revisão em 0.

**2. O Código do Documento é obrigatório?**
Não para o sistema, mas é fortemente recomendado. Sem código, o documento é identificado apenas pelo título, o que pode causar confusão entre documentos com nomes iguais.

**3. Quais tipos de arquivo posso enviar?**
O sistema aceita qualquer tipo de arquivo. Recomendamos PDF, Word ou Excel.

**4. Posso enviar mais de um arquivo principal?**
Não. O arquivo principal é único. Os demais arquivos devem ir como **anexos complementares**.

**5. Esqueci de anexar um arquivo. E agora?**
Abra o documento no **Painel** > **Detalhes** > **Anexar Arquivos ao SharePoint**, selecione o arquivo e clique em **Criar Pasta & Salvar Arquivos no SharePoint**.

**6. Onde ficam os meus arquivos?**
No SharePoint, em uma pasta com o nome do título do documento. O arquivo principal fica na pasta e os complementares na subpasta /Anexos. O botão **Abrir Pasta no SharePoint** leva direto até ela.

**7. Como sei em que etapa está o meu documento?**
Procure o cartão no Painel (use a busca por título, código ou remetente). A coluna e a etiqueta de status mostram a etapa atual. Em **Histórico**, você vê todas as movimentações.

**8. O que significa o "↺ 2×" no cartão?**
Que o documento já foi devolvido 2 vezes para a área/solicitante.

**9. Cancelei um documento sem querer. Dá para voltar?**
Sim. Logo após cancelar, clique em **Desfazer** (disponível por 4 segundos). Depois disso, use o botão **Cancelados** e clique em **Reativar**.

**10. Posso mudar o status de um documento pelo formulário de cadastro?**
O formulário permite escolher o status inicial, mas o acompanhamento deve ser feito no **Painel** (botões rápidos, **Atualizar Etapa** ou **Editar**), para que tudo fique registrado no histórico.

**11. Por que o indicador "Aprovados" mostra um número maior que o esperado para o mês?**
Atualmente ele conta todos os documentos com status Aprovado, não só os aprovados no mês.

**12. Posso usar o DocFlow no celular?**
O sistema funciona no navegador. Para cadastro com anexos, recomendamos o computador.

**13. Esqueci a senha ou não consigo entrar.**
Procure o administrador do DocFlow. As senhas não são exibidas nem recuperadas pelo sistema.

**14. Como exporto a lista para o Excel?**
Em **Novo Registro**, clique em **Exportar Excel (CSV)**. Veja a seção 11.
