# DocFlow: projeto e objetivo

> Documento 01 da documentação do projeto. Público: gestores, usuários e desenvolvedores do Grupo Monto.
> Todas as informações foram conferidas no código-fonte do repositório `tramitacao_de_documentos`.

---

## 1. O que é o DocFlow

O DocFlow é o sistema web de **tramitação de documentos** do Grupo Monto. Ele acompanha cada documento (procedimentos, instruções de trabalho, mapas de riscos, especificações técnicas etc.) desde o recebimento pela Qualidade até a aprovação ou o cancelamento. Em cada passo, o sistema registra quem fez a mudança, quando e com qual observação.

A aplicação é feita em **HTML, CSS e JavaScript puros**, sem etapa de build e sem servidor próprio. Os dados ficam no armazenamento local do navegador e são sincronizados com uma planilha Excel no **SharePoint** por meio de fluxos do **Power Automate**.

### O problema que resolve

Sem uma ferramenta dedicada, a tramitação de documentos costuma depender de e-mails, planilhas editadas à mão e pastas soltas. Isso causa:

- falta de visibilidade sobre **em que etapa** cada documento está e **com quem** ele está;
- prazos de revisão perdidos, sem alerta de atraso;
- retrabalho difícil de medir (quantas vezes o documento voltou para a área);
- arquivos espalhados, sem uma pasta padronizada por documento;
- ausência de histórico confiável para auditoria.

O DocFlow junta essas informações em um painel Kanban com indicadores de prazo, uma linha do tempo por documento e uma pasta no SharePoint para cada registro.

---

## 2. Objetivo e visão

### 2.1 Por que o DocFlow existe

O DocFlow nasce para apoiar o trabalho do **SGI (Sistema de Gestão Integrada)** do Grupo Monto, que abrange **Qualidade, Meio Ambiente, Segurança e Saúde Ocupacional**. Hoje boa parte da gestão do SGI vive em planilhas Excel. A meta é **sair do Excel e evoluir para um sistema**, com visão de **SaaS interno**: um produto em que qualquer colaborador da Monto possa consultar as informações do SGI com uma visualização mais clara e amigável que a de uma planilha.

### 2.2 O que já existe hoje

O primeiro módulo, e o único em funcionamento, é a **tramitação de documentos**, descrita neste documento. Os objetivos atendidos por ele são:

| # | Objetivo | Como o sistema atende |
|---|----------|-----------------------|
| 1 | Centralizar o cadastro de documentos em tramitação | Formulário único de registro (`formulario.html`) |
| 2 | Dar visibilidade da etapa atual de cada documento | Quadro Kanban com 5 colunas (`index.html`) |
| 3 | Controlar prazos de revisão | KPIs "Vencendo" e "Atrasados" e selo de prazo em cada cartão |
| 4 | Medir retrabalho | Contador de devoluções (↺ N×) em cada cartão, calculado a partir do histórico |
| 5 | Garantir rastreabilidade | Histórico de alterações com autor, data/hora, status anterior e diferenças campo a campo |
| 6 | Padronizar o armazenamento de arquivos | Criação automática de pasta por documento no SharePoint, com documento principal e anexos |
| 7 | Manter o Excel como base oficial (por enquanto) | Leitura e gravação via Power Automate, além de importação e exportação de planilhas |

### 2.3 Visão de futuro (ainda não implementado)

A tramitação é o ponto de partida. O DocFlow tem potencial para abranger outras frentes do SGI:

- **Indicadores do SGI:** painéis com os indicadores de Qualidade, Meio Ambiente, Segurança e Saúde Ocupacional, no lugar das planilhas atuais.
- **Treinamentos:** acompanhamento de treinamentos do SGI.
- **Integração com a página do SGI no SharePoint:** levar as informações do sistema para o canal onde os colaboradores já buscam o SGI.

Nenhum desses módulos existe no código hoje. Eles representam a direção do produto e serão detalhados como ideias na pasta `ideias/` do repositório.

---

## 3. Público e perfis de usuário

Os usuários ficam na aba **Usuários** do Excel (sincronizada via Power Automate ou importada de arquivo). Na primeira execução, o sistema usa uma lista padrão de contas definida em `auth-service.js`.

Cada usuário tem os campos: ID, Nome, E-mail, Senha, **Perfil**, Área e Status (Ativo ou inativo). Apenas usuários com status Ativo conseguem entrar.

| Perfil | Papel esperado no processo |
|--------|----------------------------|
| **Administrador** | Gestão geral do sistema e da base (usuários, sincronização, importação de planilhas). |
| **Solicitante** | Área que envia o documento para a Qualidade, recebe devoluções para correção e aprova o documento pela área solicitante. É o perfil padrão quando a planilha não informa o perfil. |
| **Qualidade** | Equipe que recebe, revisa, devolve e aprova os documentos. |

> **Importante:** hoje o perfil é **apenas informativo**. Ele aparece no crachá do usuário e no menu de configurações, mas **não restringe nenhuma ação**. Todos os usuários logados veem e podem executar as mesmas funções. Veja a seção 9 (Limitações).

---

## 4. Principais funcionalidades

### 4.1 Login (`login.html`)
- Entrada com e-mail (ou nome) e senha.
- Opção de sessão persistente ou válida só enquanto a aba estiver aberta.
- Se o usuário não existir no cache local, o sistema busca a base de usuários no Power Automate e tenta de novo.
- Atalhos de "Acesso Rápido para Teste" que preenchem o login com usuários ativos.
- As páginas `index.html` e `formulario.html` são protegidas: sem sessão, o usuário é redirecionado ao login.

### 4.2 Painel (`index.html` + `planner.js`)
- **4 KPIs de prazo:** Total (documentos ativos), Vencendo (prazo de hoje até 5 dias), Atrasados e Aprovados.
- **Quadro Kanban com 5 colunas:** Recebido, Em Revisão, Devolvido à Área, Em Aprovação e Aprovado.
- **Documentos cancelados** saem do quadro e ficam em uma janela própria (botão "Cancelados").
- Busca por título, código ou remetente e filtro por área.
- **Cartão do documento:** código, revisão, status, tipo, selo de prazo, contador de devoluções, remetente e data.
- **Janela de detalhes:**
  - ações rápidas conforme a etapa (Iniciar Revisão, Devolver à Área, P/ Aprovação, Aprovar, Reabrir, Reativar, Cancelar);
  - "Atualizar Etapa", com escolha do status, observação e definição do responsável (obrigatória em devoluções e aprovações);
  - linha do tempo vertical com os eventos do documento;
  - edição dos dados do documento, com registro das diferenças;
  - link para a pasta no SharePoint (automático ou informado manualmente);
  - envio de documento principal e anexos para o SharePoint.
- **Janela de histórico (auditoria):** lista todos os eventos, com tipo (Cadastro Inicial, Mudança de Status, Edição de Dados, Cancelamento), autor, data e diferenças.
- Cancelamento com confirmação e opção **Desfazer** por 4 segundos.

### 4.3 Novo Registro (`formulario.html` + `formulario.js`)
- Abas "Novo Documento" e "Revisão Técnica" (a segunda sugere revisão nº 1).
- Campos: título*, código, tipo*, status, data de recebimento*, data de revisão (prazo), remetente*, nº de revisão, área, disciplina e observação (* = obrigatório).
- Upload obrigatório do **documento principal** e upload opcional de **anexos complementares**.
- Remetente e área vêm preenchidos com os dados do usuário logado.
- Tabela com os documentos já registrados e exportação em **CSV**.

### 4.4 Recursos gerais
- **Menu de configurações** (engrenagem): tema claro/escuro, origem da base e quantidade de documentos, "Sincronizar Nuvem", "Carregar Excel (.xlsx)" e "Sair da Conta".
- **Barra lateral** recolhível, com preferência salva no navegador (`sidebar.js`).
- **Importação de Excel** (.xlsx, .xls e .csv) com reconhecimento automático das abas de tramitações, histórico e usuários.
- `planner.html` apenas redireciona para `index.html` (mantido para não quebrar links antigos).

---

## 5. Ciclo de vida de um documento

### 5.1 Status existentes

Os nomes abaixo são os status oferecidos nos seletores do formulário de cadastro e da janela de detalhes do Painel. Eles estão agrupados em 5 fases:

| Fase | Status | Coluna do Kanban |
|------|--------|------------------|
| 1. Entrada & Triagem | Recebido | Recebido |
| 2. Em Análise Técnica (Qualidade) | Em revisão da qualidade | Em Revisão |
| | Em revisão junto à área | Em Revisão |
| | Em Revisão (exibido como "Em Revisão (Geral)") | Em Revisão |
| 3. Devolvido para a Área | Devolvido para área para revisão | Devolvido à Área |
| | Devolvido para correção | Devolvido à Área |
| | Em revisão do solicitante | Devolvido à Área |
| 4. Em Validação & Aprovação | Para aprovação da área solicitante | Em Aprovação |
| | Para aprovação qualidade | Em Aprovação |
| 5. Conclusão & Arquivo | Aprovado | Aprovado |
| | Cancelado | Fora do quadro (janela "Cancelados") |

**Regras de classificação no Kanban.** O Painel decide a coluna de cada documento pelo texto do status, ignorando maiúsculas e acentos:

- "cancelado" vai para Cancelados;
- "aprovado" ou "aprovação final" vai para Aprovado;
- qualquer texto que contenha "aprovação" vai para Em Aprovação;
- texto que contenha "devolvido" ou "solicitante", ou que seja exatamente "pendente", vai para Devolvido à Área;
- "recebido" vai para Recebido;
- **qualquer outro texto** vai para Em Revisão.

Por isso, status vindos do Excel com outros nomes também aparecem no quadro. Uma linha do Excel sem status é tratada como "Em Revisão". No formulário, o status inicial é "Recebido".

### 5.2 Fluxo típico

- **Recebido**
  - Iniciar Revisão → Em revisão da qualidade
  - Devolver à Área → Devolvido para área para revisão
- **Em revisão da qualidade**
  - P/ Aprovação → Para aprovação da área solicitante
  - Aprovar → Aprovado
  - Devolver à Área → Devolvido para área para revisão
- **Devolvido para área para revisão**
  - Retomar Revisão → Em revisão da qualidade
  - P/ Aprovação → Para aprovação da área solicitante
- **Para aprovação da área solicitante**
  - Aprovar → Aprovado
  - Devolver p/ Correção → Devolvido para correção
- **Aprovado**
  - Reabrir Revisão → Em revisão da qualidade
- **Em qualquer etapa ativa:** Cancelar → Cancelado; a partir de Cancelado, Reativar → Recebido.

Transições oferecidas pelas **ações rápidas** da janela de detalhes:

| Coluna atual | Ações disponíveis | Novo status |
|--------------|-------------------|-------------|
| Recebido | Iniciar Revisão / Devolver à Área | Em revisão da qualidade / Devolvido para área para revisão |
| Em Revisão | Devolver à Área / P/ Aprovação / Aprovar | Devolvido para área para revisão / Para aprovação da área solicitante / Aprovado |
| Devolvido à Área | Retomar Revisão / P/ Aprovação | Em revisão da qualidade / Para aprovação da área solicitante |
| Em Aprovação | Devolver p/ Correção / Aprovar | Devolvido para correção / Aprovado |
| Aprovado | Reabrir Revisão | Em revisão da qualidade |
| Cancelado | Reativar Documento | Recebido (na janela de detalhes) ou Em Revisão (no botão "Reativar" do cartão cancelado) |
| Qualquer etapa ativa | Cancelar (com confirmação e "Desfazer") | Cancelado |

Além das ações rápidas, o campo **"Atualizar Etapa"** permite escolher **qualquer** status da lista. Não existe trava de fluxo: o sistema aceita qualquer transição.

Quando o documento está em "Para aprovação qualidade", a linha do tempo mostra "Aprovação" como próxima etapa prevista.

### 5.3 Histórico de alterações

Toda mudança gera um evento com: ID, ID do documento, código, status, status anterior, data/hora, destino, responsável, autor, **tipo de ação** (criação, mudança de status, edição ou cancelamento), diferenças e observação. O evento é salvo no navegador e, nas ações do usuário, também é enviado ao Excel pelo fluxo de histórico.

---

## 6. Integrações (visão geral)

O DocFlow conversa com o SharePoint e o Excel por meio de quatro fluxos do Power Automate:

| Fluxo | O que faz | Situação |
|-------|-----------|----------|
| **Novo registro** | Recebe o cadastro do documento e os arquivos, cria a linha na tabela do Excel e a pasta do documento no SharePoint (com o arquivo principal e a subpasta de anexos). | Configurado |
| **Leitura** | Devolve as linhas das abas de Tramitações, Histórico e Usuários para o navegador. | Configurado |
| **Histórico** | Inclui uma linha na aba de Histórico a cada ação do usuário. | Configurado |
| **Atualizar status** | Atualizaria a linha existente do documento na tabela principal. | **Não configurado**: as mudanças de status não atualizam a linha da tabela principal |

Os endereços dos fluxos ficam configurados em `data-service.js`.

**Pasta do documento no SharePoint.** O link da pasta é montado a partir do endereço da biblioteca "Repositório Tramitação de Documentos" mais o título higienizado do documento. Esse endereço está repetido em `data-service.js` e em dois pontos de `formulario.js`.

**Sincronização.** O painel, o formulário e o login buscam os dados automaticamente ao abrir. O usuário também pode sincronizar pelo menu de engrenagem. Alterações feitas localmente (status, links, anexos, observação) têm prioridade sobre o que vier da nuvem.

**Excel por arquivo.** Sem Power Automate, é possível carregar um arquivo Excel pelo menu. Existe também uma exportação completa em 3 abas no código, mas nenhum botão da interface a chama hoje. A leitura e a escrita de Excel usam a biblioteca SheetJS, carregada de CDN.

> **Segurança:** os endereços dos fluxos contêm uma assinatura de acesso. Quem tiver o endereço consegue acionar o fluxo. Não copie esses endereços para documentos, e-mails ou chats.

---

## 7. Como executar

### Pré-requisitos
- Navegador atual (Chrome ou Edge).
- Acesso à internet para a biblioteca SheetJS, a fonte Inter (Google Fonts) e os fluxos do Power Automate.
- Um servidor HTTP local simples. Os scripts são módulos ES, que os navegadores não carregam quando o arquivo é aberto direto do disco. **Abrir o `login.html` com dois cliques não funciona.**

### Passo a passo
1. Abra a pasta do repositório no VS Code.
2. Inicie um servidor local. O projeto já traz configuração para a extensão **Live Server** na porta **5501** (`.vscode/settings.json`). Outra opção é usar o serve do Node ou o servidor HTTP do Python na pasta.
3. Acesse a página `login.html` no endereço local (porta 5501, ou a porta do servidor escolhido).
4. Entre com um usuário ativo da base. Após o login, você cai no Painel (`index.html`) ou na página indicada no endereço de redirecionamento.

### Configurando os fluxos
1. No Power Automate, crie (ou reaproveite) os fluxos com gatilho **"Quando uma solicitação HTTP é recebida"**:
   - **Novo registro:** recebe os dados do documento e os arquivos, adiciona a linha na tabela do Excel e cria a pasta com os arquivos.
   - **Leitura:** devolve as tramitações e, opcionalmente, o histórico e os usuários.
   - **Histórico:** adiciona uma linha na aba de Histórico.
   - **Atualizar status** (opcional, ainda não configurado): atualiza a linha do documento pelo código.
2. Copie o endereço de cada gatilho e cole na configuração correspondente em `data-service.js`.
3. Se um fluxo ficar sem endereço, o sistema segue funcionando só com os dados do navegador. A leitura mostra um aviso sugerindo carregar o Excel manualmente.
4. Se o site ou a biblioteca do SharePoint mudar, atualize o endereço da pasta nos pontos citados na seção 6.

---

## 8. Estrutura dos arquivos

| Arquivo | Responsabilidade |
|---------|------------------|
| `login.html` | Tela de login |
| `index.html` | Painel: KPIs, Kanban e janelas de detalhes, edição, cancelados e auditoria |
| `formulario.html` | Formulário de novo registro e tabela de documentos |
| `planner.html` | Redirecionador legado para `index.html` |
| `auth-service.js` | Usuários, autenticação, sessão e proteção de páginas |
| `data-service.js` | Fluxos do Power Automate, persistência local, normalização, sincronização, importação de Excel, histórico, tema e menu de configurações |
| `planner.js` | Lógica do Painel e do Kanban |
| `formulario.js` | Lógica do formulário e da exportação CSV |
| `sidebar.js` | Barra lateral recolhível |
| `paleta.css` / `formulario.css` | Paleta de cores (claro e escuro) e estilos da aplicação |

O navegador guarda localmente as tramitações, o histórico, as modificações locais, a data da última sincronização, a origem dos dados, os usuários, a sessão, o tema e a preferência da barra lateral.

---

## 9. Limitações conhecidas

Todos os itens abaixo foram conferidos no código.

### Segurança e acesso
| Limitação | Onde |
|-----------|------|
| **A autenticação é só local, no navegador.** Não há servidor, SSO nem integração com Microsoft Entra ID. A senha é comparada no próprio navegador com a lista de usuários guardada localmente. | `auth-service.js` |
| **As senhas ficam em texto puro** no código (usuários padrão), no armazenamento do navegador, na aba Usuários do Excel e nos atalhos de login rápido. Usuário sem senha na planilha recebe uma senha padrão. | `auth-service.js`, `login.html`, `data-service.js` |
| **A tela de login mostra contas de teste** com a senha embutida no botão. | `login.html` |
| **Os perfis não controlam permissões.** Qualquer usuário logado pode aprovar, cancelar, editar e importar. O perfil só é usado para exibição. | `auth-service.js`, `data-service.js` |
| **A sessão não expira.** O horário de entrada é gravado, mas nunca é verificado. | `auth-service.js` |
| **Os endereços assinados dos fluxos ficam expostos** no JavaScript enviado ao navegador. | `data-service.js` |
| Os dados da planilha são inseridos na página sem tratamento, o que abre risco de injeção de HTML ou script. | `planner.js`, `formulario.js` |

### Dados e sincronização
| Limitação | Onde |
|-----------|------|
| **Mudanças de status não atualizam a linha da tabela principal no Excel**, porque o fluxo de atualização não está configurado. Só o histórico é enviado. | `data-service.js`, `planner.js` |
| **A sincronização substitui o histórico local** e mantém **apenas o último evento de cada documento** quando a nuvem devolve histórico. A linha do tempo completa se perde no navegador. | `data-service.js` |
| A edição de dados (título, datas, área etc.) é salva localmente, mas a sincronização só preserva status, links, anexos e observação. Os demais campos voltam ao valor do Excel. | `data-service.js` |
| Os dados ficam **por navegador e por máquina**. Dois usuários só veem as mesmas informações depois de sincronizar com a nuvem. | `data-service.js` |
| A chave de desduplicação é o **código** (ou, sem código, o **título**). Dois documentos diferentes com o mesmo código ou título se fundem em um só. | `data-service.js` |
| O formulário grava o documento localmente antes do envio. Se o Power Automate falhar, o erro não é mostrado ao usuário. | `formulario.js` |
| Existem dados fixos de exemplo e filtros específicos para casos reais (por exemplo, um código de documento e a área de Suprimentos) dentro da lógica de sincronização e limpeza de histórico. | `data-service.js` |

### Interface e indicadores
| Limitação | Onde |
|-----------|------|
| **Não há suporte formal a dispositivos móveis.** Existem alguns ajustes responsivos, mas não há layout pensado para celular. Por exemplo, a grade de KPIs tem 4 colunas fixas, o que anula o ajuste para 2 colunas em telas pequenas. | `formulario.css`, `index.html` |
| O Kanban **não permite arrastar e soltar**. A mudança de etapa é feita por botões e pelo campo "Atualizar Etapa". | `planner.js` |
| **Não há validação do fluxo**: qualquer status pode ser escolhido a partir de qualquer outro. | `index.html`, `planner.js` |
| O KPI "Aprovados" diz "concluídos este mês", mas conta **todos** os aprovados, sem filtro de data. Os rótulos "Total Cadastrado" e "Vencendo esta semana" também não batem exatamente com o cálculo (ativos não aprovados; prazo de 0 a 5 dias). | `planner.js`, `index.html` |
| A exportação do formulário gera apenas **CSV**. A exportação completa em Excel existe no código, mas não está ligada a nenhum botão. | `formulario.js`, `data-service.js` |
| É preciso ter internet para a biblioteca SheetJS e a fonte, carregadas de CDN. Sem ela, a importação e a exportação de Excel falham. | `index.html`, `formulario.html` |
