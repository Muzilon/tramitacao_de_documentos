# Não Conformidades e Planos de Ação

| Campo | Valor |
|-------|-------|
| Tipo | Nova funcionalidade |
| Status | Rascunho |
| Prioridade | Média |
| Data | 2026-09-28 |
| Autor | Claude |
| Telas afetadas | Novas: Não Conformidades (lista e Kanban), Registro de NC (abertura, análise de causa, plano 5W2H, eficácia e encerramento) e Indicadores de NC. Alteradas: barra lateral de Painel (Kanban) e Novo Registro (novo item de menu) |

---

## 1. Contexto e oportunidade

As normas ISO 9001, 14001 e 45001 exigem que a organização reaja às não conformidades (NC), investigue a causa, tome ação corretiva, verifique a eficácia e guarde evidência de tudo isso. Hoje, no SGI da Monto, esse ciclo fica espalhado entre planilhas, e-mails e atas, controlado à mão pelo Eric. As consequências:

- **Ações esquecidas.** Prazos de ações vencem sem ninguém cobrar, e isso só aparece na auditoria.
- **Análise de causa rasa.** Sem um formulário guiado, a "causa" registrada costuma repetir o problema ("operador não seguiu o procedimento"), e a NC volta.
- **Eficácia não verificada.** A NC é encerrada quando a ação é concluída, e não quando se confirma que o problema não voltou, que é o que o auditor pede.
- **Sem ligação com o resto do SGI.** Uma NC que exige revisar um procedimento ou treinar uma equipe não fica ligada ao documento em tramitação no DocFlow nem ao indicador que a disparou.

O DocFlow já tem o padrão que resolve boa parte disso: Kanban com status, histórico de quem mudou o quê, cópia local e sincronização com planilha no SharePoint via Power Automate. A oportunidade é levar esse padrão para o ciclo de NC, em linha com o objetivo do administrador de sair do Excel e centralizar o SGI no DocFlow (ver o perfil do administrador em `doc_projeto/05-perfil-do-administrador.md`).

**Dependências e relação com outras ideias:**

- **Integridade da sincronização** (implantada, `ideias_implantadas/modelos/modelo_problema/`): o módulo de NC deve seguir as mesmas regras, ou seja, identificação por ID e nunca por posição ou título, fila de pendentes que não é descartada na sincronização e gravação que atualiza a linha em vez de sempre inserir.
- **Feedback de envio e acessibilidade** (implantada, `ideias_implantadas/modelos/modelo_design/`): reaproveitar o toast, os banners de erro e de modo offline, a validação visível dos campos, o foco visível, o Kanban acessível por teclado e o respeito a "menos animação".
- **Painel de indicadores do SGI** (implantada, `ideias_implantadas/modelos/modelo_funcao/`): a proposta previa planos de ação ligados a indicadores vermelhos na fase 3, e esta ideia é essa fase. **Atenção:** o que foi implantado é um modal com KPIs da tramitação (lead time, gargalo, devolução), e não o cadastro de indicadores do SGI com códigos e lançamentos. Por isso, no MVP o vínculo com indicador é um **campo de texto livre** (código e nome), e a abertura automática de NC a partir de indicador vermelho fica para a fase 2, quando existir o cadastro de indicadores.
- **Tramitação de documentos** (módulo atual): o vínculo com documento usa o ID do documento no DocFlow.
- **Treinamentos:** ainda não há módulo. No MVP o vínculo é texto livre (tema, público e data prevista).

## 2. Usuário e cenário de uso

> Como **administrador do SGI (Eric)**, quero **registrar cada não conformidade, conduzir a análise de causa, acompanhar o plano de ação e verificar a eficácia em um só lugar** para **não perder prazos, mostrar evidência na auditoria e evitar que o mesmo problema volte**.

> Como **responsável por uma ação**, quero **ver as ações que estão comigo, com prazo e o que precisa ser entregue** para **cumprir no prazo sem depender de e-mails de cobrança**.

**Cenário:**

Numa auditoria interna da ISO 14001, o auditor encontra resíduo contaminado armazenado fora da baia. O Eric abre uma NC no DocFlow com origem "Auditoria", pilar Meio Ambiente, classificação "Menor", área Expedição, e anexa a foto. Em seguida, reúne o supervisor da área e preenche os 5 porquês na própria tela: a causa raiz é que a instrução de trabalho de resíduos não cobre o turno da noite e ninguém do turno foi treinado. No diagrama de Ishikawa simplificado, marca "Método" e "Mão de obra". Monta o plano 5W2H com duas ações: revisar a instrução de trabalho (vinculada ao documento em tramitação no DocFlow) e treinar o turno da noite (vínculo de treinamento em texto). Cada ação tem responsável e prazo. As ações aparecem no Kanban de NC, e o supervisor move a sua para "Concluída" anexando a lista de presença. Noventa dias depois, o Eric faz a verificação de eficácia com uma inspeção na área, registra "Eficaz" com a evidência e encerra a NC. Na reunião de análise crítica, ele mostra a tela Indicadores de NC: NC abertas por pilar, ações vencidas e taxa de eficácia.

## 3. Descrição da funcionalidade

Um novo módulo **Não Conformidades**, com o ciclo completo de uma NC em cinco etapas, que também são as colunas do Kanban:

**Aberta → Em análise → Plano de ação → Verificação de eficácia → Encerrada** (mais o status "Cancelada", fora do Kanban principal).

**3.1 Abertura de NC**
- Título, descrição do fato (o que, onde, quando, evidência objetiva), data de ocorrência e anexos.
- **Origem:** Auditoria interna, Auditoria externa, Indicador fora da meta (vermelho), Reclamação de cliente ou parte interessada, Incidente de SSO, Desvio ambiental, Outra.
- **Pilar:** Qualidade, Meio Ambiente, Segurança, Saúde Ocupacional (mesmos códigos Q, MA, S e SO do painel de indicadores).
- **Classificação:** tipo (Não conformidade real, Potencial/observação, Oportunidade de melhoria) e gravidade (Maior, Menor). Oportunidade de melhoria não exige análise de causa completa (ver RN6).
- Área, requisito da norma afetado (texto, ex.: "ISO 14001 – 8.1") e responsável pela NC.
- **Ação imediata (contenção):** o que foi feito na hora para conter o problema. É opcional na abertura e obrigatória antes de sair de "Em análise" quando a gravidade é Maior.

**3.2 Análise de causa (formulário simples)**
- **5 porquês:** até cinco campos encadeados ("Por que 1?" ... "Por que 5?"), sendo que o último preenchido é sugerido como causa raiz e o usuário confirma ou edita.
- **Ishikawa (6M) em lista:** para cada categoria (Método, Máquina, Mão de obra, Material, Meio ambiente, Medição), um campo para listar causas prováveis e marcar as confirmadas. Não há desenho de espinha de peixe no MVP; a tela mostra as seis categorias em cartões lado a lado.
- **Causa raiz consolidada:** texto obrigatório para avançar, com o método usado (5 porquês, Ishikawa ou ambos).
- Campo "A NC pode ocorrer em outro lugar?" (abrangência), que pode gerar ações adicionais.

**3.3 Plano de ação 5W2H**
- Uma NC pode ter várias ações. Cada ação tem: **O quê** (What), **Por quê** (Why, que já vem preenchido com a causa raiz e pode ser editado), **Onde** (Where), **Quando** (prazo, When), **Quem** (responsável, Who), **Como** (How) e **Quanto** (custo estimado, opcional, How much).
- Tipo da ação: Corretiva, Preventiva ou Melhoria.
- Status da ação: A fazer, Em andamento, Concluída, Cancelada. Ao concluir, exige descrição do que foi feito e permite anexar evidência.
- Ação com prazo vencido e não concluída fica destacada como **atrasada**.
- A NC só avança para "Verificação de eficácia" quando todas as ações estão Concluídas ou Canceladas (com justificativa).

**3.4 Verificação de eficácia**
- Ao entrar na etapa, o sistema define uma **data prevista de verificação** (padrão: 60 dias após a conclusão da última ação, editável).
- Registro da verificação: critério usado (ex.: "nenhuma reincidência em 3 inspeções", "indicador na meta por 2 meses"), resultado (**Eficaz** ou **Não eficaz**), evidência (texto e anexo), quem verificou e quando.
- **Não eficaz** devolve a NC para "Em análise", mantendo a análise e as ações anteriores no histórico, para uma nova rodada.

**3.5 Encerramento**
- Só é possível encerrar com verificação **Eficaz** (ou, para Oportunidade de melhoria, com as ações concluídas).
- Registra data, quem encerrou e um comentário final. NC encerrada fica somente leitura; reabrir exige perfil Administrador e justificativa.

**3.6 Vínculos**
- **Documento:** escolha de um ou mais documentos da tramitação do DocFlow (busca por código ou título, gravando o ID). No detalhe da NC aparece o status atual do documento. Uma ação do tipo "revisar documento" pode ter o vínculo, e no detalhe do documento aparece a referência "NC nº ...".
- **Indicador:** no MVP, texto (código e nome do indicador). Fase 2: escolha no cadastro de indicadores e abertura sugerida quando o farol ficar vermelho.
- **Treinamento:** no MVP, texto (tema, público, data prevista). Fase 3: ligação com a futura matriz de treinamentos.

**3.7 Kanban próprio**
- Tela com duas visões alternáveis:
  - **Kanban de NC:** colunas nas cinco etapas, cartões com número, título, pilar (etiqueta colorida), gravidade, responsável, contador de ações ("2/3 concluídas") e selo de atraso.
  - **Kanban de ações:** colunas A fazer, Em andamento e Concluída, com filtro "Minhas ações", para o responsável ver só o que está com ele.
- Filtros por pilar, origem, gravidade, área, responsável e "somente atrasadas", mais busca por número ou título.
- Mover o cartão respeita as regras de transição (RN3), e se faltar algo o sistema explica o que falta em vez de mover.
- Visual e comportamento iguais ao Kanban da tramitação (cartões, cores, foco por teclado, "Desfazer").

**3.8 KPIs (tela Indicadores de NC)**
- NC abertas (total e por pilar), NC abertas no período e encerradas no período.
- Ações atrasadas (número e % do total em aberto).
- Tempo médio de encerramento (da abertura ao encerramento, em dias).
- Taxa de eficácia (Eficaz ÷ verificações realizadas).
- Reincidência (NC com a mesma causa raiz ou vinculadas como "reincidente de").
- Distribuição por origem e por categoria do Ishikawa (onde as causas se concentram).
- Filtro por período e por pilar. Os KPIs não mudam com os filtros do Kanban, só com os filtros da própria tela (evitar o problema M3 do relatório de análise).

## 4. Fluxo passo a passo

**Abertura**
1. O usuário abre Não Conformidades pela barra lateral e clica em "Nova NC".
2. Preenche os campos da abertura. O sistema valida os obrigatórios e mostra os erros junto aos campos.
3. Ao salvar, o sistema gera o número (ex.: NC-2026-014), grava localmente, envia ao fluxo de gravação e mostra o toast de sucesso. A NC aparece em "Aberta".
4. Erro: se o envio falhar, a NC fica como "pendente de envio" com botão de reenviar, e o formulário não é limpo.

**Análise**
1. O responsável move a NC para "Em análise" (ou clica em "Iniciar análise" no detalhe).
2. Preenche os 5 porquês e/ou o Ishikawa, confirma a causa raiz e a abrangência.
3. Com gravidade Maior, o sistema exige a ação imediata registrada antes de avançar.
4. Clica em "Ir para o plano de ação". Sem causa raiz, o sistema bloqueia e explica.

**Plano de ação**
1. Adiciona uma ou mais ações 5W2H, com responsável e prazo.
2. Opcionalmente, vincula documento, indicador e treinamento.
3. Os responsáveis acompanham pelo Kanban de ações e atualizam o status, anexando evidência ao concluir.
4. Quando todas as ações estão concluídas ou canceladas, o sistema libera "Enviar para verificação" e calcula a data prevista de verificação.

**Verificação e encerramento**
1. Na data prevista, a NC aparece destacada como "verificação pendente".
2. O verificador registra critério, resultado e evidência.
3. Se Eficaz, o botão "Encerrar NC" fica disponível; o administrador encerra com comentário final.
4. Se Não eficaz, a NC volta para "Em análise" com aviso "Nova rodada de análise (2ª)".

## 5. Regras de negócio

- RN1: Número da NC gerado pelo sistema no formato NC-AAAA-NNN, sequencial por ano, único e imutável. A chave técnica é um ID interno (como definido na ideia de integridade da sincronização), e o número serve para exibição e busca.
- RN2: Campos obrigatórios na abertura: título, descrição, data de ocorrência, origem, pilar, tipo, gravidade, área e responsável pela NC.
- RN3: Transições permitidas: Aberta → Em análise → Plano de ação → Verificação de eficácia → Encerrada; Verificação (Não eficaz) → Em análise; qualquer etapa antes de Encerrada → Cancelada (só Administrador, com justificativa). Não é possível pular etapas nem voltar livremente pelo Kanban.
- RN4: Para sair de "Em análise", é preciso ter causa raiz e método preenchidos, além da ação imediata quando a gravidade é Maior.
- RN5: Para sair de "Plano de ação", é preciso ter ao menos uma ação, e todas devem estar Concluídas ou Canceladas com justificativa. Ação concluída exige descrição do que foi feito.
- RN6: Oportunidade de melhoria pode pular a análise de causa (vai de Aberta para Plano de ação) e a verificação de eficácia (encerra com ações concluídas).
- RN7: Prazo da ação é obrigatório e não pode ser anterior à data de criação da ação. Mudar o prazo depois de criado exige justificativa e fica no histórico ("prazo prorrogado de ... para ...").
- RN8: Ação é "atrasada" quando o prazo passou e o status não é Concluída nem Cancelada. A verificação é "pendente" quando a data prevista passou sem registro.
- RN9: Verificação de eficácia não pode ser registrada pela mesma pessoa que executou todas as ações da NC (recomendação de imparcialidade; no MVP é um aviso, não um bloqueio).
- RN10: NC encerrada ou cancelada fica somente leitura. Reabrir: só Administrador, com justificativa, e volta para "Em análise".
- RN11: Toda mudança de status, prazo, responsável ou resultado gera evento no histórico (quem, quando, de/para), no mesmo padrão do histórico da tramitação.
- RN12: Permissões (restrição de interface no MVP, ver seção 6.4): qualquer usuário logado abre NC e consulta; o responsável pela NC conduz análise e plano; o responsável por uma ação atualiza apenas as suas ações; verificação, encerramento, cancelamento e reabertura são exclusivos do Administrador.
- RN13: Todo texto vindo da planilha é exibido como texto, nunca como HTML.
- RN14: NC de SSO não deve conter nome de acidentado, diagnóstico ou dado de saúde individual. O formulário mostra um aviso fixo nesse sentido quando o pilar é Segurança ou Saúde Ocupacional.

## 6. Dados envolvidos

### 6.1 Não conformidade

| Dado | Origem | Obrigatório | Observação |
|------|--------|-------------|------------|
| ID interno | Sistema | Sim | Chave técnica; nunca muda |
| Número | Sistema | Sim | NC-AAAA-NNN |
| Título | Abertura | Sim | Até 100 caracteres |
| Descrição do fato | Abertura | Sim | O que, onde, quando, evidência |
| Data de ocorrência | Abertura | Sim | |
| Origem | Abertura | Sim | Lista da seção 3.1 |
| Pilar | Abertura | Sim | Q, MA, S, SO |
| Tipo | Abertura | Sim | Real, Potencial, Oportunidade de melhoria |
| Gravidade | Abertura | Sim | Maior ou Menor |
| Área | Abertura | Sim | Mesma lista de áreas da tramitação |
| Requisito da norma | Abertura | Não | Texto |
| Responsável pela NC | Abertura | Sim | Nome e e-mail |
| Ação imediata | Abertura / análise | Condicional | Obrigatória se Maior, antes de sair da análise |
| Status | Sistema | Sim | Etapa atual |
| Rodada de análise | Sistema | Sim | 1, 2, ... (aumenta a cada "Não eficaz") |
| 5 porquês | Análise | Não | Até 5 textos |
| Ishikawa | Análise | Não | Causas por categoria 6M, com marca de confirmada |
| Causa raiz e método | Análise | Condicional | Obrigatória para sair da análise (exceto RN6) |
| Abrangência | Análise | Não | Texto |
| Vínculos com documento | Plano | Não | Lista de IDs de documentos da tramitação |
| Vínculo com indicador | Plano | Não | Texto no MVP |
| Vínculo com treinamento | Plano | Não | Texto no MVP |
| Reincidente de | Abertura | Não | Número de NC anterior |
| Data prevista de verificação | Sistema / plano | Condicional | Padrão: 60 dias após a última ação |
| Verificação (critério, resultado, evidência, por, em) | Verificação | Condicional | |
| Encerramento (por, em, comentário) | Encerramento | Condicional | |
| Anexos | Todas as etapas | Não | Pasta da NC no SharePoint |
| Criado por / em, atualizado por / em | Sistema | Sim | Rastreabilidade |

### 6.2 Ação (5W2H)

| Dado | Origem | Obrigatório | Observação |
|------|--------|-------------|------------|
| ID da ação | Sistema | Sim | Chave técnica |
| ID da NC | Sistema | Sim | Ligação com a NC |
| O quê | Plano | Sim | |
| Por quê | Plano | Sim | Pré-preenchido com a causa raiz |
| Onde | Plano | Sim | |
| Quando (prazo) | Plano | Sim | RN7 |
| Quem (responsável) | Plano | Sim | Nome e e-mail |
| Como | Plano | Sim | |
| Quanto | Plano | Não | Valor em R$ |
| Tipo | Plano | Sim | Corretiva, Preventiva, Melhoria |
| Status | Responsável | Sim | A fazer, Em andamento, Concluída, Cancelada |
| O que foi feito / evidência | Responsável | Condicional | Obrigatório ao concluir |
| Justificativa | Responsável | Condicional | Ao cancelar ou prorrogar |
| Documento vinculado | Plano | Não | ID do documento da tramitação |

### 6.3 Histórico

Eventos no mesmo formato do histórico da tramitação (ID da NC ou da ação, tipo de evento, de, para, usuário, data e hora, justificativa).

### 6.4 Armazenamento e sincronização

Coerente com o painel de indicadores e com a integridade da sincronização:

- **Nova pasta de trabalho Excel no SharePoint** (ex.: "Não Conformidades SGI"), separada da tramitação e dos indicadores, com três tabelas: NC, Ações e Histórico de NC. Tabelas no formato de lista (uma linha por registro, colunas fixas), prontas para migrar para **SharePoint Lists** junto com o login Microsoft, como recomendado no painel de indicadores.
- Campos compostos (5 porquês, Ishikawa, lista de documentos vinculados) guardados como texto estruturado em uma coluna cada, com leitura tolerante (se vier inválido, a tela mostra o campo vazio e um aviso, sem quebrar).
- **Dois novos fluxos do Power Automate:**
  - **Leitura:** devolve NC não encerradas + encerradas dos últimos 24 meses, com as ações e o histórico delas.
  - **Gravação em lote:** recebe operações (inserir ou atualizar NC por ID, inserir ou atualizar ação por ID, inserir evento de histórico) e atualiza a linha existente em vez de só adicionar. O número NC-AAAA-NNN é confirmado pelo fluxo para evitar números repetidos entre dois usuários (o número provisório local aparece como "NC-rascunho" até a confirmação).
- **Anexos:** pasta por NC na mesma biblioteca do SharePoint, por um fluxo de anexo próprio (não reaproveitar o fluxo de novo registro, por causa do problema de duplicação apontado na análise).
- **Cópia local** no navegador, em chaves próprias com prefixo `docflow_nc_`, com fila de pendentes de envio que a sincronização não descarta.
- **Limitações** iguais às do painel de indicadores: endereços dos fluxos visíveis no front-end, "quem fez" informado pelo navegador, lentidão e concorrência do Excel. Mitigação: planilha com edição restrita, validação de formato e de perfil dentro do fluxo. **Login Microsoft (Entra ID) é pré-requisito** para abrir o módulo a responsáveis de ação fora da Qualidade com confiança na trilha de auditoria.

## 7. Critérios de aceite

- [ ] É possível abrir NC com todos os campos da seção 3.1, com validação visível e número gerado no formato NC-AAAA-NNN.
- [ ] A análise de causa oferece 5 porquês encadeados e Ishikawa 6M em lista; sem causa raiz a NC não avança (exceto oportunidade de melhoria).
- [ ] Gravidade Maior exige ação imediata antes de sair de "Em análise".
- [ ] É possível criar várias ações 5W2H por NC, com prazo, responsável e tipo; concluir exige descrição; cancelar e prorrogar exigem justificativa registrada no histórico.
- [ ] A NC só vai para verificação com todas as ações concluídas ou canceladas; a data prevista de verificação é sugerida e editável.
- [ ] Verificação "Não eficaz" devolve a NC para análise, com rodada incrementada e histórico preservado; "Eficaz" libera o encerramento.
- [ ] NC encerrada fica somente leitura; reabrir só com perfil Administrador e justificativa.
- [ ] O Kanban de NC e o Kanban de ações mostram os cartões, filtros e selo de atraso; mover um cartão para uma etapa não permitida mostra o que falta e não move.
- [ ] O filtro "Minhas ações" mostra só as ações do usuário logado.
- [ ] O vínculo com documento permite buscar documentos da tramitação, grava o ID e mostra o status atual do documento no detalhe da NC.
- [ ] A tela Indicadores de NC mostra os KPIs da seção 3.8, com filtros próprios de período e pilar, e os números batem com uma contagem manual em uma base de teste.
- [ ] Falha de envio deixa o registro como pendente, com reenvio; a sincronização não descarta pendentes.
- [ ] Texto com marcação HTML aparece literal.
- [ ] As telas seguem a paleta, o tema claro e escuro, o foco visível e o Kanban por teclado do DocFlow, e funcionam em 375px.

## 8. Fora do escopo

- Abertura automática de NC a partir de indicador vermelho e escolha do indicador no cadastro (fase 2, depende do cadastro de indicadores do SGI, que ainda não existe como previsto).
- Notificações por e-mail ou Teams de ação atribuída, atrasada ou verificação pendente (fase 2).
- Diagrama de Ishikawa desenhado (espinha de peixe gráfica), outras ferramentas (FMEA, árvore de causas, 8D) e matriz de risco (fase 3).
- Integração com matriz de treinamentos (fase 3, depende de módulo próprio).
- Portal para reclamações externas ou abertura de NC por quem não tem login.
- Comunicação de acidente à Previdência (CAT) ou qualquer registro legal de SSO; o módulo trata a NC de gestão, não o registro legal do acidente.
- Exportação de relatório de NC em PDF para auditoria (fase 2; no MVP, exportação CSV da lista).
- Migração para SharePoint Lists ou Dataverse e troca do login (ideias próprias).
- Qualquer mudança na lógica da tramitação além de mostrar a referência "NC nº ..." no detalhe do documento vinculado.

**MVP e fases:**

- **MVP:** abertura, análise (5 porquês e Ishikawa em lista), plano 5W2H, verificação, encerramento, histórico, Kanban de NC e de ações, vínculo com documento por ID e com indicador e treinamento em texto, tela de KPIs, exportação CSV, armazenamento em Excel + fluxos.
- **Fase 2:** login Microsoft; migração para SharePoint Lists; notificações e lembretes; vínculo real com o cadastro de indicadores e NC sugerida a partir de farol vermelho; relatório PDF da NC; responsáveis de ação fora da Qualidade usando o módulo.
- **Fase 3:** Ishikawa gráfico, 8D e FMEA; ligação com matriz de treinamentos; análise de reincidência por causa; integração com Power BI e com a análise crítica pela direção.

## 9. Métricas de sucesso

- **Adoção:** 100% das NC de auditoria interna e externa abertas no DocFlow a partir do primeiro ciclo de auditoria após a implantação; fim da planilha paralela de NC em três meses.
- **Prazo:** ações atrasadas abaixo de 15% do total em aberto após três meses.
- **Eficácia:** 100% das NC encerradas com verificação registrada (hoje não medido) e taxa de eficácia acompanhada mês a mês.
- **Tempo:** redução do tempo médio de encerramento (medir a linha de base na primeira extração).
- **Auditoria:** nenhuma constatação de auditoria externa sobre falta de evidência de ação corretiva ou de eficácia.
- **Qualidade de dado:** zero NC ou ação duplicada na planilha.

---

## Instruções para o Antigravity

- **O que implementar (somente o MVP):**
  1. Cadastro e detalhe de NC com as cinco etapas (abertura, análise, plano, verificação, encerramento), seguindo as RN1 a RN14.
  2. Formulário de análise com 5 porquês e Ishikawa 6M em lista, e causa raiz consolidada.
  3. Ações 5W2H ligadas à NC, com status, evidência, justificativas e cálculo de atraso.
  4. Tela com Kanban de NC e Kanban de ações (alternáveis), filtros, "Minhas ações" e validação de transições.
  5. Vínculo com documento da tramitação por ID (busca por código ou título) e referência "NC nº ..." no detalhe do documento; vínculos de indicador e treinamento em texto.
  6. Tela Indicadores de NC com os KPIs da seção 3.8 e filtros próprios.
  7. Serviço de dados do módulo com cópia local, fila de pendentes, leitura e gravação em lote por ID e fluxo de anexos próprio; exportação CSV da lista de NC com tratamento correto de aspas em todos os campos.
  8. Regras de transição, atraso, data de verificação e KPIs em funções puras, separadas do desenho da tela.

- **Onde (telas e arquivos):**
  - Novos `nao-conformidades.html` e `nao-conformidades.js`: lista, Kanban de NC e de ações, e o detalhe da NC em modal ou painel lateral com as etapas.
  - Novos `nc-indicadores.html` e `nc-indicadores.js`: KPIs (gráficos com a mesma biblioteca de gráficos já usada no painel de indicadores).
  - Novo `nc-service.js`: configuração dos fluxos em branco (a ser preenchida pelo Eric, no mesmo estilo de `data-service.js`), chaves locais com prefixo `docflow_nc_`, normalização, fila de pendentes e regras de negócio.
  - Novo `nc.css`: estilos só do módulo, com os tokens de `paleta.css`, os mesmos cartões e colunas do Kanban da tramitação e as etiquetas de pilar usadas no painel de indicadores.
  - Barra lateral: item "Não Conformidades" em `index.html` e `formulario.html`, com ícone no padrão atual; as páginas novas usam `sidebar.js` e a proteção de página de `auth-service.js`.
  - Detalhe do documento na tramitação: apenas exibir a referência às NC vinculadas (leitura da cópia local do módulo de NC).
  - Reaproveitar toast, banners de erro e offline, validação visível e padrões de acessibilidade já implantados.

- **O que não alterar:**
  - A lógica de tramitação, os fluxos e as chaves locais existentes, exceto a exibição da referência de NC no detalhe do documento.
  - `auth-service.js`, além de ler sessão e perfil pelas funções já exportadas.
  - `paleta.css` e `formulario.css`, salvo para acrescentar tokens que faltem, sem mudar os existentes.
  - Não inserir texto vindo da planilha como HTML; não colocar endereços de fluxos, senhas ou dados reais no código.

- **Como testar:**
  1. Percorrer uma NC completa (abertura → encerramento) e conferir o histórico de cada passo.
  2. Tentar avançar sem causa raiz, sem ação imediata (gravidade Maior) e com ação aberta: o sistema deve bloquear e explicar.
  3. Registrar verificação "Não eficaz" e conferir o retorno à análise, com rodada 2 e dados anteriores preservados.
  4. Criar uma oportunidade de melhoria e conferir que ela pula a análise e a verificação.
  5. Criar ação com prazo no passado via ajuste de data de teste e conferir o selo de atraso e o KPI de ações atrasadas.
  6. Vincular um documento da tramitação e conferir o status no detalhe da NC e a referência no detalhe do documento.
  7. Simular falha do fluxo de gravação, sincronizar em seguida e conferir que a pendência não some.
  8. Colocar marcação HTML no título e conferir que aparece como texto.
  9. Conferir os KPIs contra uma contagem manual de uma base de teste com ao menos 10 NC.
  10. Verificar tema claro e escuro, teclado no Kanban e larguras de 1280px, 980px e 375px.

---

## Resultado da implantação

- **Data da implantação:**
- **Validado por:** Eric
- **O que foi feito:**
- **Diferenças em relação à proposta:**
- **Observações e pendências:**
