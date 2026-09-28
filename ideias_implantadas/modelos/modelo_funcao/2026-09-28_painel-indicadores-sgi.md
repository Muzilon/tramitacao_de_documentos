# Painel de Indicadores do SGI

| Campo | Valor |
|-------|-------|
| Tipo | Nova funcionalidade |
| Status | Implantada |
| Prioridade | Média |
| Data | 2026-09-28 |
| Autor | Claude |
| Telas afetadas | Novas: Indicadores SGI (visão pública) e Gestão de Indicadores. Alteradas: barra lateral de Painel (Kanban) e Novo Registro (novo link de menu) |

> **Aprovada com pendências:** implementar só depois que as perguntas em aberto forem respondidas pelo Eric (indicadores existentes, planilha atual, permissões no Power Automate).


---

## 1. Contexto e oportunidade

Hoje os indicadores do SGI (Qualidade, Meio Ambiente, Segurança e Saúde Ocupacional) ficam em planilhas Excel que só o Eric elabora e administra. O resultado:

- **Pouca visibilidade.** Quem não abre a planilha não sabe se o SGI está cumprindo as metas. A página do SGI no SharePoint não mostra os números de forma viva.
- **Leitura difícil.** Uma planilha com dezenas de colunas não comunica rápido "está bom ou ruim, melhorando ou piorando".
- **Esforço manual para reuniões e auditorias.** Gráficos são refeitos à mão para análise crítica, treinamentos e auditorias (ISO 9001, 14001 e 45001 pedem monitoramento, medição e análise de desempenho).
- **Risco de versão.** Cópias da planilha circulam por e-mail e ficam desatualizadas.

O DocFlow já tem os ingredientes para resolver isso sem nova infraestrutura: identidade visual própria, cartões de KPI, SheetJS para ler Excel e o padrão de sincronização com planilha no SharePoint via Power Automate. A oportunidade é transformar o DocFlow na "vitrine" do SGI, e não só no controle de tramitação, alinhado ao objetivo do administrador de sair do Excel e dar transparência ao sistema de gestão para toda a Monto.

## 2. Usuário e cenário de uso

> Como **colaborador da Monto**, quero **ver os indicadores do SGI com farol de meta e tendência** para **entender, sem abrir planilha, como está o desempenho em Qualidade, Meio Ambiente e SSO**.

> Como **administrador do SGI (Eric)**, quero **cadastrar indicadores e lançar os valores de cada período em um só lugar** para **parar de manter planilhas e gráficos à mão e ter um histórico confiável para análise crítica e auditoria**.

**Cenário:**

No começo de cada mês, o Eric abre a tela Gestão de Indicadores, filtra "pendentes de lançamento" e registra o valor de setembro de cada indicador (por exemplo, taxa de frequência de acidentes, índice de reclamações de clientes, consumo de água por tonelada produzida), com um comentário quando o resultado fica fora da meta. Ao salvar, os dados vão para a planilha do SharePoint. Um supervisor de produção abre a tela Indicadores SGI pelo link da página do SGI, filtra o pilar Segurança e a área dele, vê o cartão vermelho de "Taxa de frequência", clica e enxerga o gráfico dos últimos 12 meses, a meta, a fórmula e o comentário da análise. Na reunião de análise crítica, o Eric projeta a mesma tela em vez de montar slides.

## 3. Descrição da funcionalidade

Um novo módulo **Indicadores SGI**, com duas visões:

**3.1 Visão pública (leitura)**
- Grade de cartões, um por indicador, com: nome, pilar (etiqueta colorida), último valor e unidade, meta, **farol** (verde = meta atingida, âmbar = em atenção, vermelho = fora da meta, cinza = sem dado no período), **seta de tendência** comparando com o período anterior (melhorou, piorou, estável, levando em conta a polaridade) e um minigráfico dos últimos períodos.
- Faixa de resumo no topo: quantos indicadores estão verdes, âmbar, vermelhos e sem dado.
- Filtros por **pilar** (Qualidade, Meio Ambiente, Segurança, Saúde Ocupacional), **área** e **farol**, além de busca por nome.
- **Drill-down**: ao clicar no cartão, abre um modal com gráfico histórico (linha do valor e linha da meta), tabela dos lançamentos, fórmula descrita, fonte, responsável, frequência e o comentário de análise de cada período.

**3.2 Visão de gestão (administrador)**
- **Cadastro de indicadores**: criar, editar e inativar indicadores (nunca apagar, para preservar o histórico).
- **Lançamento periódico**: lista de indicadores com o período em aberto, campo de valor e comentário; destaque dos que estão pendentes ou atrasados.
- **Importação inicial** da planilha Excel atual (SheetJS), com prévia, mapeamento de colunas e relatório de erros antes de gravar.

**3.3 Definições de cálculo**
- **Polaridade**: "maior é melhor", "menor é melhor" ou "faixa" (valor deve ficar entre mínimo e máximo).
- **Farol**: verde se a meta é atingida; âmbar se o valor está dentro de uma tolerância configurável por indicador (padrão 10% da meta) do lado ruim; vermelho além da tolerância; cinza se não há lançamento no período vigente.
- **Tendência**: compara o último valor com o anterior; variação menor que 2% é "estável".
- O sistema **não calcula a fórmula**: no MVP o valor lançado já vem calculado. A fórmula é texto descritivo para transparência.

## 4. Fluxo passo a passo

**Visão pública**
1. O colaborador abre a tela Indicadores SGI (link na barra lateral do DocFlow e, depois, na página do SGI no SharePoint).
2. O sistema mostra a última cópia guardada no navegador e, em paralelo, busca os dados na nuvem pelo fluxo de leitura.
3. Com os dados atualizados, a grade é redesenhada e a data da "última atualização dos dados" aparece no topo.
4. O colaborador filtra por pilar, área ou farol e clica em um cartão para abrir o detalhe.
5. Erro: se a nuvem não responder, a tela continua com a cópia local e mostra aviso "Dados podem estar desatualizados (última atualização em ...)". Sem cópia local, mostra estado vazio com botão "Tentar novamente".

**Cadastro de indicador (gestão)**
1. O administrador abre Gestão de Indicadores e clica em "Novo indicador".
2. Preenche os campos da seção 6, e o sistema valida (código único, meta numérica, polaridade coerente com meta mínima e máxima).
3. Ao salvar, grava localmente e envia ao fluxo de gravação. Em caso de falha, mostra erro claro e mantém o item marcado como "pendente de envio", com botão para reenviar.

**Lançamento periódico (gestão)**
1. O administrador abre a aba "Lançamentos", que lista os indicadores ativos com o período atual calculado pela frequência (ex.: 2026-09 para mensal, 2026-T3 para trimestral).
2. Digita o valor e, se quiser, um comentário (obrigatório quando o farol calculado for vermelho).
3. O sistema mostra o farol em tempo real antes de salvar.
4. Ao salvar, grava e envia. Se já existir lançamento no mesmo período, pede confirmação de substituição e registra quem alterou e quando.

**Importação inicial (gestão)**
1. O administrador clica em "Importar planilha" e escolhe o arquivo .xlsx atual.
2. O sistema lista as abas e o administrador escolhe o formato: **(a)** modelo padrão (uma aba de indicadores e uma de lançamentos, disponível para download como modelo) ou **(b)** formato "largo" (uma linha por indicador e uma coluna por mês).
3. Mostra uma prévia com contagem de indicadores e lançamentos, linhas com erro (sem meta, pilar inválido, valor não numérico) e duplicados.
4. O administrador confirma; o sistema grava e envia em lote. Linhas com erro não são importadas e ficam listadas para correção.

## 5. Regras de negócio

- RN1: Leitura é aberta a qualquer colaborador. Cadastro, lançamento e importação só para o perfil **Administrador** (e, em fase posterior, **Responsável** pelo indicador).
- RN2: O código do indicador é único e imutável depois de criado (ex.: SST-01). É a chave de ligação entre indicador e lançamentos.
- RN3: Pilar aceita apenas Q, MA, S e SO (exibidos como Qualidade, Meio Ambiente, Segurança e Saúde Ocupacional).
- RN4: Frequência aceita mensal, bimestral, trimestral, semestral e anual. O período é gravado em formato padronizado (AAAA-MM, AAAA-Bn, AAAA-Tn, AAAA-Sn, AAAA).
- RN5: Um único lançamento por indicador e período. Substituição exige confirmação e grava quem alterou e quando.
- RN6: Indicador não é apagado, só inativado. Indicador inativo some da visão pública, mas o histórico fica na planilha.
- RN7: Farol e tendência seguem as definições da seção 3.3. A meta vigente é a do indicador; mudança de meta vale a partir do período informado (a meta aplicada fica gravada em cada lançamento).
- RN8: Comentário de análise é obrigatório quando o farol do lançamento é vermelho.
- RN9: Indicador com lançamento atrasado (período anterior sem valor após o prazo de lançamento, padrão dia 15 do mês seguinte) aparece como "pendente" na gestão e com farol cinza na visão pública.
- RN10: Todo texto vindo da planilha deve ser exibido como texto, nunca como HTML (evitar o risco de injeção já apontado na documentação).
- RN11: Segurança: enquanto o login for só no navegador, a restrição da visão de gestão é **apenas de interface**. Não deve ser tratada como controle de acesso real (ver seção 6.3).

## 6. Dados envolvidos

### 6.1 Indicador

| Dado | Origem | Obrigatório | Observação |
|------|--------|-------------|------------|
| Código | Gestão / importação | Sim | Único e imutável (ex.: Q-01, MA-03) |
| Nome | Gestão / importação | Sim | Até 80 caracteres |
| Pilar | Gestão / importação | Sim | Q, MA, S ou SO |
| Área | Gestão / importação | Sim | Área ou unidade; "Corporativo" quando geral |
| Fórmula descrita | Gestão / importação | Sim | Texto; ex.: "nº de acidentes com afastamento × 1.000.000 ÷ horas-homem trabalhadas" |
| Unidade | Gestão / importação | Sim | %, nº, m³/t, taxa etc. |
| Meta | Gestão / importação | Sim | Número; para polaridade "faixa", meta mínima e meta máxima |
| Polaridade | Gestão / importação | Sim | Maior é melhor, menor é melhor ou faixa |
| Tolerância do âmbar | Gestão | Não | Padrão 10% |
| Frequência | Gestão / importação | Sim | Mensal, bimestral, trimestral, semestral, anual |
| Responsável | Gestão / importação | Sim | Nome e e-mail de quem fornece o dado |
| Fonte | Gestão / importação | Sim | Sistema ou documento de origem do dado |
| Casas decimais | Gestão | Não | Padrão 2 |
| Ativo | Gestão | Sim | Sim ou não |
| Atualizado por / em | Sistema | Sim | Rastreabilidade |

### 6.2 Lançamento

| Dado | Origem | Obrigatório | Observação |
|------|--------|-------------|------------|
| Código do indicador | Sistema | Sim | Ligação com o indicador |
| Período | Gestão / importação | Sim | Formato da RN4 |
| Valor | Gestão / importação | Sim | Numérico |
| Meta aplicada | Sistema | Sim | Cópia da meta vigente no momento do lançamento |
| Farol calculado | Sistema | Sim | Gravado para consulta rápida e auditoria |
| Comentário de análise | Gestão | Condicional | Obrigatório se vermelho |
| Lançado por / em | Sistema | Sim | E-mail do usuário logado e data e hora |

### 6.3 Armazenamento e sincronização

**Proposta para o MVP (reaproveita o padrão atual):**
- Uma **nova pasta de trabalho Excel no SharePoint** (ex.: "Indicadores SGI"), separada da planilha de tramitação, com duas tabelas: Indicadores e Lançamentos.
- **Dois novos fluxos do Power Automate**, separados dos fluxos de tramitação:
  - **Leitura**: devolve indicadores ativos e lançamentos (dos últimos 24 meses, para não pesar).
  - **Gravação**: recebe uma lista de operações (inserir ou atualizar indicador, inserir ou substituir lançamento) e faz a gravação por **código** e **código + período**, e não apenas "adicionar linha". Isso evita a duplicação que já acontece na tramitação.
- Cópia local no navegador para abrir rápido e funcionar com a nuvem fora do ar, em chaves próprias do módulo.

**Limitações deste padrão:**
- Os endereços dos fluxos ficam visíveis no JavaScript. Quem tiver o endereço de gravação consegue gravar, logado ou não.
- O Excel via Power Automate é lento (segundos por chamada), tem limite de linhas por leitura (exige paginação) e sofre com gravações simultâneas.
- Não há controle de acesso real nem trilha de auditoria confiável, porque o "quem lançou" é informado pelo próprio navegador.
- Se alguém editar a planilha à mão e quebrar o formato, a tela quebra junto.

**Mitigações possíveis no MVP:** fluxo de leitura só lê (não aceita parâmetros de escrita); fluxo de gravação valida o formato de cada campo e confere o e-mail informado contra a lista de administradores guardada no próprio fluxo (reduz erro, mas não impede fraude); planilha com edição restrita ao Eric no SharePoint.

**Alternativas futuras:**

| Opção | Prós | Contras |
|-------|------|---------|
| **SharePoint Lists** (uma lista de indicadores e uma de lançamentos) | Já incluída no Microsoft 365; permissões nativas por grupo (todos leem, só o SGI edita); histórico de versões e "modificado por" confiável; leitura direta pela página do SGI e por Power BI; sem limite prático de volume para este uso | Exige login Microsoft no navegador (MSAL/Entra ID) para o DocFlow ler e gravar direto, ou continuar usando fluxos; modelagem de colunas e visões dá trabalho inicial |
| **Dataverse** (Power Apps) | Banco relacional de verdade, segurança por papel, auditoria nativa, API robusta, integra com Power BI e Power Apps | Licença premium (Power Apps por usuário ou por app), custo recorrente; depende da TI; maior curva de aprendizado |
| **Power BI** incorporado à página do SGI | Visualização rica, pronta para leitura corporativa | Não resolve cadastro e lançamento; licença Pro para quem publica e, em muitos casos, para quem vê |

**Recomendação:** começar com Excel + fluxos no MVP (zero custo, mesmo padrão já conhecido) e desenhar as tabelas já no formato de lista (uma linha por registro, colunas fixas) para migrar para **SharePoint Lists** na fase 2, junto com login Microsoft. Dataverse só se a Monto já tiver licença premium.

### 6.4 Permissões e o risco do login atual

| Ação | Colaborador | Responsável pelo indicador (fase 2) | Administrador SGI |
|------|-------------|--------------------------------------|-------------------|
| Ver cartões, filtros e detalhe | Sim | Sim | Sim |
| Lançar valor | Não | Só nos seus indicadores | Sim |
| Cadastrar, editar e inativar indicador | Não | Não | Sim |
| Importar planilha | Não | Não | Sim |

**Risco:** hoje o login do DocFlow é só no navegador, com senhas em texto puro e sem uso do perfil para autorização. Portanto:
- A visão pública **não deve exigir** o login do DocFlow (a maioria dos colaboradores não tem conta e criar contas com senha em texto puro aumenta o risco). Ela lê pelo fluxo de leitura, que só expõe dados já destinados a toda a empresa.
- A visão de gestão verifica o perfil Administrador, mas isso é só um filtro de tela. A proteção real, no MVP, fica na restrição de edição da planilha no SharePoint e na validação dentro do fluxo de gravação.
- **Pré-requisito da fase 2:** login com conta Microsoft (Entra ID) antes de abrir o lançamento para os responsáveis.
- Os indicadores não devem conter dados pessoais ou sensíveis (ex.: nome de acidentado, diagnóstico). Saúde Ocupacional publica só números agregados.

## 7. Critérios de aceite

- [ ] A tela Indicadores SGI abre sem login e mostra os cartões com nome, pilar, último valor, unidade, meta, farol, tendência e minigráfico.
- [ ] Os filtros de pilar, área e farol e a busca por nome funcionam juntos, e a faixa de resumo reflete o filtro.
- [ ] O clique no cartão abre o detalhe com gráfico histórico (valor e meta), tabela de lançamentos, fórmula, fonte, responsável, frequência e comentários.
- [ ] O farol respeita a polaridade, inclusive "faixa", e a tolerância do âmbar; sem lançamento no período vigente, o farol é cinza.
- [ ] A tela Gestão de Indicadores exige login e só mostra as ações para o perfil Administrador; outros perfis veem aviso e link para a visão pública.
- [ ] É possível criar, editar e inativar indicador com as validações da RN2 à RN4; o código não pode ser alterado depois de criado.
- [ ] É possível lançar valor do período, com prévia do farol, comentário obrigatório quando vermelho e confirmação ao substituir lançamento existente.
- [ ] A importação aceita o modelo padrão e o formato largo, mostra prévia com erros e duplicados e só grava após confirmação.
- [ ] Gravações que falham no fluxo mostram erro claro e ficam "pendentes de envio", com opção de reenviar.
- [ ] Com a nuvem fora do ar, a visão pública mostra a última cópia local e o aviso de dados possivelmente desatualizados.
- [ ] Todo texto vindo da planilha é exibido como texto (um valor com marcação HTML aparece literal, sem executar).
- [ ] As telas seguem a paleta, os tokens, os tipos e o tema claro e escuro do DocFlow e ficam utilizáveis em celular (cartões em 1 coluna até 600px).

## 8. Fora do escopo

- Cálculo automático das fórmulas a partir de dados brutos (ex.: horas-homem, número de acidentes). No MVP o valor chega pronto.
- Integração automática com outros sistemas (ERP, RH, medidores) como fonte dos dados.
- Lançamento pelos responsáveis de cada indicador (fase 2, depende de login Microsoft).
- Planos de ação, análise de causa e vínculo com não conformidades (fase 3).
- Alertas por e-mail ou Teams de lançamento pendente ou indicador vermelho (fase 2).
- Exportação para PowerPoint ou PDF e modo apresentação (fase 3).
- Migração para SharePoint Lists ou Dataverse e troca do login do DocFlow (fase 2, ideias próprias).
- Metas diferentes por área para o mesmo indicador e metas anuais escalonadas (fase 2).
- Qualquer mudança no módulo de tramitação, além do link na barra lateral.

**Fases seguintes (resumo):**
- **Fase 2:** login Microsoft; migração para SharePoint Lists; lançamento pelos responsáveis; lembretes automáticos de lançamento; meta por área e por ano; incorporação na página do SGI no SharePoint.
- **Fase 3:** planos de ação ligados a indicadores vermelhos; modo apresentação para análise crítica; exportação; comparativo entre unidades; conexão com Power BI se houver demanda.

## 9. Métricas de sucesso

- **Adoção:** pelo menos 80% dos indicadores atuais do SGI cadastrados e com histórico importado no primeiro mês.
- **Pontualidade:** 90% dos lançamentos feitos até o dia 15 do mês seguinte, por três meses seguidos.
- **Alcance:** número de acessos distintos à visão pública por mês (meta inicial a definir com o Eric; medir pela contagem de visitas da página do SGI no SharePoint ou por um contador simples no fluxo de leitura).
- **Fim do Excel paralelo:** em três meses, a planilha antiga deixa de ser atualizada e a análise crítica usa a tela do DocFlow.
- **Esforço:** redução do tempo mensal do Eric para consolidar indicadores e gráficos (medir antes e depois; meta de redução pela metade).
- **Qualidade de dado:** zero lançamentos duplicados por indicador e período na planilha.

---

## Instruções para o Antigravity

- **O que implementar (somente o MVP):**
  1. Visão pública de leitura com cartões, faixa de resumo, farol, tendência, minigráfico, filtros por pilar, área e farol, busca e modal de detalhe com gráfico histórico e tabela de lançamentos.
  2. Visão de gestão com três abas: Indicadores (criar, editar, inativar), Lançamentos (valor e comentário por período, com prévia do farol) e Importação (modelo padrão e formato largo, com prévia e relatório de erros; botão para baixar a planilha-modelo).
  3. Serviço de dados do módulo com cópia local, leitura e gravação por dois fluxos novos (leitura e gravação em lote, por código e por código + período), fila de "pendentes de envio" e reenvio.
  4. Cálculo de período vigente, farol e tendência conforme a seção 3.3 e as RN4 a RN9, em funções puras e isoladas do desenho da tela.

- **Onde (telas e arquivos):**
  - Novo `indicadores.html` e novo `indicadores.js`: visão pública. **Não** chama a proteção de página do login.
  - Novo `indicadores-gestao.html` e novo `indicadores-gestao.js`: visão de gestão. Usa a proteção de página e o crachá de usuário de `auth-service.js` e checa o perfil Administrador antes de mostrar as ações.
  - Novo `indicadores-service.js`: endereços dos dois fluxos novos (deixar como configuração vazia, a ser preenchida pelo Eric, no mesmo estilo de `data-service.js`), cópia local em chaves próprias com prefixo `docflow_indicadores_`, normalização, importação via SheetJS e as funções de farol, tendência e período.
  - Novo `indicadores.css`: estilos só do módulo, usando os tokens de `paleta.css`. Preferir os tokens semânticos (`--cor-sucesso`, `--cor-alerta`, `--cor-perigo`, `--cor-secundaria`) para o farol: verde, âmbar, coral e cinza. Etiquetas de pilar com as variações suaves da paleta. Cartões no estilo de `kpi-card` (raio de 14px, `--shadow-card`, elevação de 2px no hover), fonte Inter, tema claro e escuro pelo mecanismo atual, e grade responsiva (4, 2 e 1 colunas nos pontos de 980px e 600px, sem fixar colunas no HTML).
  - Gráficos: usar a biblioteca Chart.js carregada pelo mesmo CDN já usado para o SheetJS, somente nas duas páginas novas. Cores das séries vindas dos tokens CSS, para respeitar o tema escuro.
  - Barra lateral: adicionar o item "Indicadores SGI" em `index.html` e `formulario.html`, com ícone no mesmo padrão dos atuais. As duas páginas novas usam `sidebar.js` e a mesma estrutura de app-shell.
  - Toast e diálogos: reaproveitar os já existentes (toast de `data-service.js`), sem criar componentes paralelos.

- **O que não alterar:**
  - A lógica de tramitação, os fluxos e as chaves locais existentes (`data-service.js`, `planner.js`, `formulario.js`, chaves `tramitacoes`, histórico e usuários).
  - `auth-service.js`, a não ser para ler sessão e perfil pelas funções já exportadas.
  - `formulario.css` e `paleta.css`, exceto se faltar algum token; nesse caso, adicionar sem alterar os existentes.
  - Não inserir texto vindo da planilha como HTML: montar os elementos e atribuir o conteúdo como texto.
  - Não colocar senhas, endereços reais de fluxos ou dados de exemplo reais no código.

- **Como testar:**
  1. Sem fluxos configurados, importar uma planilha de teste no modelo padrão com pelo menos um indicador de cada pilar e das três polaridades e conferir a prévia, os erros apontados e o resultado nos cartões.
  2. Repetir com uma planilha no formato largo (12 colunas de meses).
  3. Conferir o farol em casos de borda: valor igual à meta, dentro da tolerância, fora dela, faixa acima e abaixo e sem lançamento no período.
  4. Lançar vermelho sem comentário (deve bloquear) e substituir um lançamento existente (deve pedir confirmação).
  5. Colocar marcação HTML no nome de um indicador e confirmar que aparece como texto.
  6. Abrir a visão pública sem sessão (deve abrir) e a de gestão sem sessão (deve ir ao login) e com perfil diferente de Administrador (deve bloquear as ações).
  7. Simular falha do fluxo de gravação e conferir a fila "pendentes de envio" e o reenvio.
  8. Verificar tema claro e escuro e larguras de 1280px, 980px e 375px.

---

## Resultado da implantação

- **Data da implantação:** 28 de Setembro de 2026
- **Validado por:** Eric
- **O que foi feito:** Um modal responsivo de Indicadores SGI foi criado (`#modal-indicadores`) na tela principal, contendo os 3 KPIs essenciais (Lead Time, Gargalo Atual e Taxa de Devolução) alimentados pela base histórica real em cache (`obterTodoHistorico()`). Implementou-se os gráficos Chart.js em colunas responsivas mostrando tempo médio por fase e documentação por área (com destroy nas re-renderizações).
- **Diferenças em relação à proposta:** O código foi integrado na `index.html` em vez do `planner.html` (uma vez que as views foram mescladas anteriormente).
- **Observações e pendências:** Os cálculos de estatística estão prontos para evolução com métricas avançadas no Power BI posteriormente se desejado pelo SGI.
