# DocFlow: documentação do projeto

O DocFlow é o sistema web de **tramitação de documentos** do Grupo Monto. Ele acompanha cada documento (procedimentos, instruções de trabalho, mapas de riscos, especificações técnicas etc.) desde o recebimento pela Qualidade até a aprovação ou o cancelamento, com painel Kanban, indicadores de prazo e histórico de quem mudou o quê e quando. A aplicação é feita em HTML, CSS e JavaScript puros, guarda os dados no navegador e os sincroniza com uma planilha Excel no SharePoint por meio de fluxos do Power Automate.

Este README é o índice da documentação e o relatório final da análise do código.

---

## 1. Índice

| Documento | Público | O que cobre |
|-----------|---------|-------------|
| [01 – Projeto e objetivo](01-projeto-e-objetivo.md) | Gestores, usuários e desenvolvedores | O que é o DocFlow, objetivos, perfis de usuário, principais funcionalidades, ciclo de vida do documento (status e fluxo), integrações, como executar, estrutura dos arquivos e limitações conhecidas |
| [02 – Estrutura do código](02-estrutura-do-codigo.md) | Desenvolvedores | Stack e dependências externas, árvore de diretórios, responsabilidade de cada arquivo, principais funções por módulo, grafo de imports, ordem de inicialização, fluxos de dados, modelo de dados, armazenamento no navegador, integração com Power Automate, como rodar e fazer deploy, pontos de atenção técnicos |
| [03 – Guia de preenchimento](03-guia-de-preenchimento.md) | Usuários (Solicitantes e Qualidade) | Login, visão geral das telas, escolha entre Novo Documento e Revisão Técnica, passo a passo de cadastro, tabela campo a campo, regras de arquivos, acompanhamento no Painel, mudança de status e edição, exportação CSV, erros comuns e perguntas frequentes |
| [04 – Design](04-design.md) | Desenvolvedores e design | Princípios visuais, paleta de cores, tema claro/escuro, tipografia, espaçamento/raios/sombras, layout, catálogo de componentes, ícones, animações, responsividade, acessibilidade, guia para evoluir o sistema e pendências conhecidas |
| [05 – Perfil do administrador](05-perfil-do-administrador.md) | Todos | Quem idealizou e administra o DocFlow, responsabilidades no SGI, dores atuais, objetivos com o sistema e modelo de trabalho (dono do produto, Claude e Antigravity) |

### Pastas de ideias

- `ideias/` (na raiz do repositório): ideias de design e de funcionalidades propostas para o DocFlow.
- `ideias_implantadas/`: ideias que já foram implementadas no sistema.

O fluxo detalhado entre as duas pastas ainda será definido pelo dono do produto.

---

## 2. Como começar rápido

1. Abra a pasta do repositório no VS Code.
2. Inicie um servidor HTTP local. O projeto já traz configuração para a extensão **Live Server** na porta **5501** (`.vscode/settings.json`). Alternativas: o serve do Node ou o servidor HTTP do Python.
3. Acesse a página `login.html` no endereço local (porta 5501, ou a do servidor escolhido).
4. Entre com um usuário ativo da base.

> **Atenção:** os scripts são módulos ES, que o navegador não carrega quando o arquivo é aberto direto do disco. Abrir o `login.html` com dois cliques não funciona.

Para configurar os fluxos do Power Automate, veja a seção 7 do [documento 01](01-projeto-e-objetivo.md) e a seção 10 do [documento 02](02-estrutura-do-codigo.md).

---

## 3. Achados da análise

Os achados estão agrupados por prioridade. A coluna "Onde" indica o arquivo em que o problema foi observado.

### 3.1 Crítico — segurança

| # | Achado | Onde | Recomendação |
|---|--------|------|--------------|
| C1 | Os endereços dos fluxos do Power Automate estão no front-end e no histórico do Git. Com o endereço do fluxo de leitura, qualquer pessoa, sem login, baixa a planilha, incluindo usuários e senhas. | `data-service.js` | Regenerar as assinaturas dos fluxos e colocar autenticação real. |
| C2 | Senhas em texto claro no código (lista de usuários padrão), no armazenamento do navegador, na exportação Excel e nos botões "Acesso Rápido para Teste" da tela de login. | `auth-service.js`, `login.html` | Remover senhas do código e da interface; usar autenticação corporativa. |
| C3 | Login e proteção de página existem só no cliente: basta forjar a sessão no navegador para entrar. O perfil do usuário não restringe nenhuma ação. A sessão não expira. | `auth-service.js` | Mover autenticação e autorização para um serviço confiável. |
| C4 | XSS armazenado: dados da planilha são inseridos na página sem tratamento. Há também um redirecionamento aberto pelo parâmetro de redirect do login, e o SheetJS vem de CDN sem verificação de integridade (SRI). | `planner.js`, `formulario.js`, `login.html` | Tratar os dados antes de exibi-los; validar o destino do redirecionamento; adicionar verificação de integridade ao script do CDN. |

### 3.2 Alto — integridade de dados

| # | Achado | Onde |
|---|--------|------|
| A1 | O fluxo de atualização de status não está configurado: a mudança de status não atualiza a linha no Excel, só gera histórico. | `data-service.js` |
| A2 | A sincronização substitui a lista local (perde cadastros que falharam no envio) e reduz o histórico a 1 evento por documento. | `data-service.js` |
| A3 | O upload de anexos pela janela de detalhes usa o fluxo de novo registro, que insere linha, com risco de duplicar o documento (contrariando o comentário do próprio código). | `data-service.js` |
| A4 | As ações do Kanban localizam o documento pela posição na lista. Uma sincronização que reordene a lista (inclusive durante o "Desfazer" de 4 s) faz a ação cair no documento errado. | `planner.js` |
| A5 | Registros são mesclados por código (ou por título, quando não há código): um "novo" documento com código existente sobrescreve o anterior. | `data-service.js` |
| A6 | O registro de modificações locais nunca expira e bloqueia atualizações vindas da nuvem. | `data-service.js` |

### 3.3 Médio — UX e validação

| # | Achado |
|---|--------|
| M1 | O campo do arquivo principal é obrigatório, mas fica oculto; o navegador bloqueia o envio sem mensagem visível. |
| M2 | Não há feedback de sucesso ou erro após o envio (só registro no console); o formulário é limpo mesmo quando o envio falha. |
| M3 | O KPI "Aprovados – este mês" conta todos os aprovados; "Vencendo esta semana" é, na verdade, 0 a 5 dias; os filtros alteram os KPIs. |
| M4 | "Reativar" leva a status diferentes: Em Revisão pelo botão do cartão e Recebido pela janela de detalhes. |
| M5 | O status inicial pode ser Aprovado ou Cancelado já no cadastro; não há validação das transições de status. |
| M6 | Não há restrição de tipo de arquivo nem limite de tamanho no envio. |
| M7 | O formulário de edição difere do de cadastro (tem "Memorial Descritivo" e menos campos obrigatórios). |
| M8 | O CSV só trata aspas no campo Observação. |
| M9 | O código chama um serviço de autenticação com nome errado, que não existe. |

### 3.4 Médio — acessibilidade e design

| # | Achado | Onde |
|---|--------|------|
| D1 | Contraste: branco sobre o pêssego dos botões principais fica em 2,25:1; texto secundário e badges ficam abaixo de 4,5:1. | `paleta.css`, `formulario.css` |
| D2 | Não há indicação visível de foco para quem navega pelo teclado; os cards do Kanban não podem ser acessados pelo teclado. | `formulario.css`, `planner.js` |
| D3 | Não há respeito à preferência do sistema por menos animação. | CSS |
| D4 | A grade fixa de 4 colunas dos KPIs anula os ajustes responsivos; no celular, a barra lateral e o espaçamento de 40 px continuam. | `index.html` |
| D5 | Cores de status duplicadas entre `paleta.css` e `formulario.css`; uma animação referenciada não existe; o peso 800 da fonte é usado, mas não é carregado. | `paleta.css`, `formulario.css` |

### 3.5 Baixo — débito técnico

| # | Achado |
|---|--------|
| B1 | Funções duplicadas em `formulario.js` (higienização do nome da pasta e conversão de arquivo para envio). |
| B2 | Import não usado (inicialização da barra de sincronização). |
| B3 | O tipo de ação "anexo" do histórico nunca é gerado. |
| B4 | Exportação Excel completa existe, mas não tem botão na interface. |
| B5 | Dados de negócio fixos no código (limpeza de histórico e um código de documento de exemplo). |

---

## 4. Próximos passos recomendados

| Prioridade | Ação | Resolve |
|------------|------|---------|
| 1 | **Regenerar as assinaturas de todos os fluxos** do Power Automate e tirar os endereços do front-end (e do histórico do Git, quando possível). Os endereços atuais devem ser tratados como vazados. | C1 |
| 2 | Remover senhas do código, da planilha e da tela de login (incluindo o "Acesso Rápido para Teste") e trocar a autenticação local por autenticação corporativa (ex.: Microsoft Entra ID), com sessão que expira e perfis que restringem ações. | C2, C3 |
| 3 | Eliminar o XSS: tratar todo dado vindo da planilha, validar o redirecionamento do login e adicionar verificação de integridade ao SheetJS. | C4 |
| 4 | Corrigir a integridade de dados: configurar o fluxo de atualização de status, identificar documentos por ID (não por posição nem por código/título), usar um fluxo próprio para anexos e revisar a sincronização para não descartar cadastros nem histórico. | A1–A6 |
| 5 | Dar feedback claro no formulário: mensagem de sucesso/erro, não limpar em caso de falha, validação visível do arquivo principal, restrição de tipo e tamanho de arquivo e validação de status inicial e transições. | M1, M2, M5, M6 |
| 6 | Acessibilidade: ajustar a paleta para contraste mínimo de 4,5:1, adicionar indicação de foco, tornar os cards do Kanban acessíveis por teclado, respeitar a preferência por menos animação e corrigir o layout dos KPIs no celular. | D1–D4 |
| 7 | Ajustar KPIs e rótulos, unificar formulário de edição e cadastro e limpar o débito técnico listado. | M3, M4, M7–M9, D5, B1–B5 |

---

## 5. Metodologia

- A documentação foi gerada por **análise estática do código** em **28/09/2026**.
- As telas **não foram testadas no navegador**; comportamentos descritos foram inferidos do código.
- Os contrastes foram calculados pela **fórmula de luminância relativa da WCAG**.
- Por segurança, esta documentação não reproduz URLs de webhook, a URL do SharePoint nem senhas.
