# Matriz de Treinamentos ligada aos documentos

| Campo | Valor |
|-------|-------|
| Tipo | Nova funcionalidade |
| Status | Rascunho |
| Prioridade | Alta |
| Data | 2026-09-28 |
| Autor | Claude |
| Telas afetadas | Novas: Treinamentos (visão pública), Gestão de Treinamentos (abas Treinamentos, Matriz, Turmas, Colaboradores, Importação). Alteradas: barra lateral de Painel (Kanban) e Novo Registro (novo item de menu); janela de detalhes do documento (aviso de treinamentos vinculados) |

> **Dependências:** reaproveita o padrão de armazenamento do [Painel de Indicadores do SGI](../../../ideias_implantadas/modelos/modelo_funcao/2026-09-28_painel-indicadores-sgi.md) (pasta de trabalho própria no SharePoint, fluxos próprios de leitura e gravação em lote, cópia local com prefixo do módulo) e a identificação por ID definida em [Integridade da sincronização](../../../ideias_implantadas/modelos/modelo_problema/2026-09-28_integridade-sincronizacao.md). Os componentes de toast, foco e contraste seguem [Feedback de envio e acessibilidade](../../../ideias_implantadas/modelos/modelo_design/2026-09-28_feedback-envio-e-acessibilidade.md). A fase 2 depende de login Microsoft (Entra ID), já apontado como pré-requisito no painel de indicadores.

---

## 1. Contexto e oportunidade

O Eric é o responsável pelos treinamentos do SGI. Hoje o controle vive em planilhas e listas de presença em papel, e isso gera quatro dores:

- **Documento revisado não gera retreinamento.** Quando um procedimento ou instrução de trabalho é aprovado em nova revisão no DocFlow, ninguém é avisado de que as pessoas treinadas na revisão anterior precisam ser retreinadas. As normas ISO 9001, 14001 e 45001 pedem competência comprovada e conscientização sobre os documentos vigentes, e essa é uma constatação comum em auditoria.
- **Não se sabe quem falta treinar.** Não existe matriz cargo × treinamento obrigatório consultável; responder "quem da Manutenção não fez a NR-10?" exige cruzar planilhas à mão.
- **Vencimentos passam despercebidos.** NRs com reciclagem (por exemplo NR-10, NR-35, NR-33, NR-12, NR-11) vencem sem alerta, com risco legal e de segurança.
- **Eficácia não é registrada de forma padronizada.** A avaliação de eficácia pedida pelas normas fica dispersa ou não acontece.

O DocFlow já é o ponto onde os documentos nascem e são revisados. Ligar treinamentos a eles fecha o ciclo "documento aprovado → pessoas treinadas → competência comprovada", que é o objetivo do administrador de tirar o SGI do Excel e dar transparência para toda a Monto.

## 2. Usuário e cenário de uso

> Como **responsável pelos treinamentos do SGI (Eric)**, quero **saber, por cargo e por colaborador, quais treinamentos obrigatórios estão em dia, vencidos ou pendentes** para **agir antes da auditoria e do vencimento legal**.

> Como **gestor de área**, quero **ver o percentual de cumprimento da minha equipe** para **liberar as pessoas certas para as turmas**.

> Como **colaborador**, quero **consultar meus treinamentos e vencimentos** para **não ficar irregular**.

**Cenário:**

A instrução de trabalho de operação da prensa é aprovada na revisão 04 no Kanban. O DocFlow avisa que o treinamento "Operação segura da prensa", vinculado a esse documento, passa a exigir retreinamento para os 23 colaboradores treinados na revisão 03. Na Gestão de Treinamentos, o Eric vê a lista, cria uma turma para a semana seguinte, registra a presença pela lista importada do Forms e, 30 dias depois, o supervisor registra a avaliação de eficácia. No mesmo painel, o Eric vê que a Manutenção está com 78% de cumprimento e que 5 pessoas têm a NR-35 vencendo em 30 dias.

## 3. Descrição da funcionalidade

Um novo módulo **Treinamentos**, com visão pública e visão de gestão.

**3.1 Cadastro de treinamentos**
- Treinamento com código, nome, tipo (procedimento interno, NR legal, integração, conscientização SGI, outros), pilar (Q, MA, S, SO), carga horária, modalidade, validade em meses (vazio = não vence) e método de avaliação de eficácia.
- **Vínculo com documentos do DocFlow**: um treinamento pode estar ligado a um ou mais documentos (pelo ID do documento). O vínculo guarda a revisão do documento em que o treinamento se baseia.

**3.2 Matriz cargo × treinamento obrigatório**
- Grade com cargos nas linhas e treinamentos nas colunas; cada célula marca "obrigatório", "recomendado" ou vazio.
- Pode ser editada na tela ou importada de planilha.

**3.3 Turmas e presença**
- Turma com treinamento, data, instrutor, local, carga horária e participantes.
- Presença por **registro digital** (o instrutor marca na tela de gestão) ou por **importação** de planilha (lista de presença digitada ou exportada do Microsoft Forms).
- Anexo opcional da lista de presença assinada (digitalizada), como evidência para auditoria.

**3.4 Avaliação de eficácia**
- Para cada participante presente: resultado "eficaz", "não eficaz" ou "pendente", data, avaliador e observação.
- Prazo configurável por treinamento (padrão 30 dias após a turma). "Não eficaz" mantém a pendência e sugere nova turma.

**3.5 Retreinamento por revisão de documento**
- Quando um documento vinculado muda para **Aprovado** com revisão maior que a registrada no vínculo, o sistema marca todos os registros daquele treinamento como "retreinamento necessário" e mostra o aviso na gestão e na janela de detalhes do documento.
- O Eric pode dispensar o retreinamento de uma revisão (por exemplo, correção só de forma), com justificativa registrada.

**3.6 Situação e percentual de cumprimento**
- Para cada par colaborador × treinamento obrigatório, a situação é: **Em dia**, **Vence em até 30 dias**, **Vencido**, **Retreinamento necessário**, **Pendente** (nunca fez) ou **Eficácia pendente**.
- Percentual de cumprimento = obrigações em dia ÷ obrigações totais, por colaborador, por área e geral.

**3.7 Vencimentos**
- Validade calculada a partir da data da turma e da validade do treinamento (ex.: NR-10 com 24 meses).
- Lista "vencendo em 30, 60 e 90 dias" e "vencidos", com filtro por área e por treinamento.

**3.8 Visões**
- **Visão pública (leitura, sem dados pessoais detalhados):** catálogo de treinamentos com os documentos vinculados, percentual de cumprimento por área (cartões com farol no mesmo estilo do painel de indicadores) e agenda das próximas turmas.
- **Visão de gestão (Administrador):** todas as abas de cadastro, matriz, turmas, colaboradores, vencimentos, retreinamentos e importação, com percentual por colaborador e exportação para Excel.

## 4. Fluxo passo a passo

**Carga inicial (gestão)**
1. O Eric abre Gestão de Treinamentos, aba Importação, e baixa a planilha-modelo (abas Colaboradores, Treinamentos, Matriz e Histórico).
2. Preenche ou cola os dados atuais e importa. O sistema mostra prévia com contagens, erros (cargo inexistente, data inválida, treinamento sem código) e duplicados.
3. Confirma; o sistema grava em lote. Linhas com erro ficam listadas para correção.

**Atualização de colaboradores (MVP: planilha do RH)**
1. O Eric importa a planilha mensal do RH (matrícula, nome, cargo, área, unidade, data de admissão, situação).
2. O sistema compara com a base: novos, alterados (mudança de cargo gera novas obrigações) e desligados (inativados, nunca apagados).
3. Mostra o resumo das diferenças e grava após confirmação.

**Turma e presença**
1. Na aba Turmas, o Eric cria a turma e escolhe o treinamento. O sistema sugere participantes: quem tem o treinamento como obrigatório e está pendente, vencido, vencendo ou com retreinamento necessário.
2. No dia, marca presença na tela ou importa a lista. Participante não encontrado na base aparece como erro para correção.
3. Ao fechar a turma, os registros de presença passam a valer e a situação de cada participante é recalculada.

**Eficácia**
1. Na aba Eficácia, a lista mostra as avaliações pendentes com prazo.
2. O Eric (ou, na fase 2, o gestor) registra o resultado. "Não eficaz" mantém a obrigação pendente.

**Retreinamento**
1. Um documento vinculado é aprovado em nova revisão no Kanban.
2. Na próxima abertura da gestão (ou da janela de detalhes do documento), o sistema compara a revisão aprovada com a do vínculo e mostra: "IT-xxx foi para a revisão 04; 23 pessoas precisam de retreinamento".
3. O Eric confirma (atualiza a revisão do vínculo e marca os registros) ou dispensa com justificativa.

**Erros**
- Nuvem fora do ar: as telas usam a cópia local e mostram o aviso de dados possivelmente desatualizados, como no painel de indicadores.
- Gravação falha: o item fica "pendente de envio", com botão de reenviar.

## 5. Regras de negócio

- RN1: Visão pública aberta a todos, sem login, mostrando só dados agregados (percentual por área, catálogo, agenda). Nenhum nome de colaborador aparece na visão pública.
- RN2: Cadastro, matriz, turmas, presença, eficácia, importação e consulta por colaborador são só do perfil **Administrador** no MVP. Na fase 2, gestores veem apenas sua área e o colaborador vê apenas os próprios registros, ambos com login Microsoft.
- RN3: Colaborador é identificado pela **matrícula** (única, imutável). Treinamento pelo **código** (único, imutável). Registros e turmas por **ID** gerado pelo sistema, nunca pela posição na lista.
- RN4: Colaborador, treinamento e turma não são apagados, só inativados, para preservar a evidência histórica.
- RN5: A obrigação de um colaborador é derivada do cargo atual na matriz. Mudança de cargo cria as novas obrigações; as antigas deixam de contar no percentual, mas o histórico fica.
- RN6: Validade = data da turma + validade do treinamento. Sem validade, o treinamento não vence (salvo retreinamento).
- RN7: Situação segue a ordem de precedência: Retreinamento necessário > Vencido > Pendente > Eficácia pendente > Vence em até 30 dias > Em dia.
- RN8: Retreinamento é disparado só quando o documento vinculado vai para **Aprovado** com revisão maior que a do vínculo. Dispensa exige justificativa e registra quem e quando.
- RN9: Eficácia "não eficaz" não conta como cumprido. "Pendente" conta como cumprido até o prazo de avaliação; depois disso, vira "Eficácia pendente" e deixa de contar.
- RN10: Percentual de cumprimento considera só obrigações marcadas como "obrigatório" na matriz e só colaboradores ativos.
- RN11: Colaborador em afastamento (se a planilha do RH trouxer essa situação) fica fora do percentual, mas continua listado.
- RN12: Todo texto vindo da planilha é exibido como texto, nunca como HTML.
- RN13: Enquanto o login for só no navegador, a restrição da gestão é apenas de interface; a proteção real fica na permissão da pasta de trabalho no SharePoint e na validação do fluxo de gravação, como no painel de indicadores.

## 6. Dados envolvidos

### 6.1 Colaborador

| Dado | Origem | Obrigatório | Observação |
|------|--------|-------------|------------|
| Matrícula | Planilha do RH | Sim | Chave única |
| Nome | Planilha do RH | Sim | |
| Cargo | Planilha do RH | Sim | Deve existir na lista de cargos da matriz |
| Área e unidade | Planilha do RH | Sim | Usadas no percentual por área |
| E-mail corporativo | Planilha do RH | Não | Necessário para a fase 2 (login e notificações) |
| Data de admissão | Planilha do RH | Não | Para prazo de integração |
| Situação | Planilha do RH | Sim | Ativo, afastado, desligado |

Não guardar CPF, data de nascimento, endereço, dados de saúde nem motivo de afastamento.

### 6.2 Treinamento e vínculo com documento

| Dado | Origem | Obrigatório | Observação |
|------|--------|-------------|------------|
| Código, nome, tipo, pilar | Gestão / importação | Sim | Código imutável |
| Carga horária, modalidade | Gestão / importação | Sim | |
| Validade em meses | Gestão / importação | Não | Vazio = não vence |
| Método e prazo de eficácia | Gestão | Sim | Prazo padrão 30 dias |
| Documentos vinculados | Gestão | Não | ID do documento do DocFlow + revisão de referência |
| Ativo | Gestão | Sim | |

### 6.3 Matriz, turma e registro

| Dado | Origem | Obrigatório | Observação |
|------|--------|-------------|------------|
| Cargo × treinamento × exigência | Gestão / importação | Sim | Obrigatório ou recomendado |
| Turma: ID, treinamento, data, instrutor, local | Gestão | Sim | |
| Anexo da lista assinada | Gestão | Não | Guardado na biblioteca do SharePoint, pelo mesmo caminho de anexos já usado |
| Registro: turma, matrícula, presença | Gestão / importação | Sim | Uma linha por participante |
| Revisão do documento na data | Sistema | Condicional | Quando há vínculo |
| Validade calculada | Sistema | Condicional | |
| Eficácia: resultado, data, avaliador, observação | Gestão | Condicional | |
| Retreinamento necessário / dispensa e justificativa | Sistema / gestão | Condicional | |
| Registrado por / em | Sistema | Sim | Rastreabilidade |

### 6.4 Armazenamento e sincronização (coerente com o painel de indicadores)

- **Pasta de trabalho própria no SharePoint** ("Treinamentos SGI"), separada da tramitação e dos indicadores, com tabelas em formato de lista (uma linha por registro, colunas fixas): Colaboradores, Cargos, Treinamentos, Vínculos, Matriz, Turmas, Registros.
- **Dois fluxos novos do Power Automate**: leitura (colaboradores ativos, cadastros e registros dos últimos 5 anos) e gravação em lote por chave (matrícula, código, ID), nunca "só adicionar linha".
- **Cópia local** no navegador em chaves com prefixo `docflow_treinamentos_`, com fila de pendentes de envio.
- **Leitura dos documentos**: o módulo usa os dados de tramitação já sincronizados (status e revisão por ID) apenas para leitura; não altera a planilha de tramitação.
- **Fase 2:** migração para SharePoint Lists junto com o painel de indicadores, com permissões nativas por grupo e "modificado por" confiável.

### 6.5 Origem dos dados de colaboradores

| Opção | Prós | Contras |
|-------|------|---------|
| **Planilha do RH (MVP)** | Já existe, traz matrícula e cargo formal, sem depender da TI | Manual, mensal, sujeita a formato variável; depende do RH enviar |
| **Microsoft Entra ID (fase 2)** | Atualização automática, e-mail e login juntos, desligado some sozinho | Cargo e área no Entra costumam estar incompletos; nem todo operacional tem conta; exige permissão da TI para leitura do diretório |

**Recomendação:** MVP com planilha do RH e matrícula como chave. Na fase 2, cruzar com o Entra ID pelo e-mail para login e notificações, mantendo a planilha do RH como fonte de cargo enquanto o cadastro do Entra não for confiável.

### 6.6 LGPD

- **Base legal:** cumprimento de obrigação legal (NRs) e execução do contrato de trabalho; não depende de consentimento.
- **Minimização:** só os campos da seção 6.1. Nenhum dado de saúde. Resultados de eficácia são descritivos de desempenho no treinamento, sem notas de avaliação pessoal fora disso.
- **Acesso:** visão pública só agregada (RN1). Dados individuais só na gestão; pasta de trabalho com acesso restrito ao SGI no SharePoint.
- **Retenção:** registros de treinamento guardados pelo prazo definido pelo SGI e pelo jurídico (evidência legal pode exigir anos após o desligamento); a definir com o Eric.
- **Direitos do titular:** o colaborador pode pedir seus registros; a gestão tem exportação por matrícula.
- **Risco atual:** enquanto os endereços dos fluxos estiverem expostos no front-end (achado C1 da documentação), o fluxo de leitura **não deve** devolver nomes; a visão pública recebe só agregados e a gestão usa um fluxo de leitura separado. Esse ponto precisa ser validado com a TI antes de carregar dados reais.

## 7. Critérios de aceite

- [ ] A visão pública abre sem login e mostra catálogo, documentos vinculados, percentual por área com farol e agenda de turmas, sem nenhum nome de colaborador.
- [ ] A gestão exige login e perfil Administrador; outros perfis veem aviso e link para a visão pública.
- [ ] É possível criar, editar e inativar treinamentos e vinculá-los a documentos do DocFlow pelo ID, com a revisão de referência.
- [ ] A matriz cargo × treinamento pode ser editada na tela e importada, e mudar um cargo recalcula as obrigações.
- [ ] A importação da planilha do RH mostra novos, alterados e desligados antes de gravar; desligados são inativados, não apagados.
- [ ] É possível criar turma com sugestão de participantes, registrar presença na tela ou por importação e anexar a lista assinada.
- [ ] A avaliação de eficácia é registrada por participante e "não eficaz" mantém a obrigação pendente.
- [ ] Aprovar em nova revisão um documento vinculado gera o aviso de retreinamento e marca os registros; dispensa exige justificativa.
- [ ] A situação por colaborador segue a precedência da RN7, e o percentual por colaborador, por área e geral segue a RN10.
- [ ] A lista de vencimentos mostra vencidos e vencendo em 30, 60 e 90 dias, com filtros.
- [ ] Falhas de gravação ficam como pendentes de envio com reenvio; nuvem fora do ar usa a cópia local com aviso.
- [ ] Texto com marcação HTML aparece literal; telas seguem paleta, tema claro e escuro e funcionam em 375px.

## 8. Fora do escopo

- Integração automática com Entra ID, ERP ou sistema de folha (fase 2).
- Login Microsoft e acesso de gestores e colaboradores (fase 2).
- Notificações por e-mail ou Teams de vencimento, retreinamento e eficácia (fase 2).
- Assinatura eletrônica de presença, QR Code e aplicativo de celular para o instrutor (fase 3).
- Provas online, trilhas de aprendizagem, EAD e emissão de certificados (fase 3).
- Gestão de custos, orçamento e fornecedores de treinamento.
- Qualquer alteração no fluxo de tramitação além do aviso somente leitura na janela de detalhes e do item de menu.

## 9. Fases

| Fase | Conteúdo |
|------|----------|
| **MVP** | Cadastro de treinamentos com vínculo a documentos; matriz cargo × treinamento; importação de colaboradores pela planilha do RH; turmas com presença digital ou importada; eficácia; retreinamento por revisão; situação, percentual e vencimentos; visão pública agregada e visão de gestão; armazenamento no padrão do painel de indicadores |
| **Fase 2** | Login Microsoft; cruzamento com Entra ID; visão do gestor (sua área) e do colaborador (seus registros); lembretes por e-mail ou Teams; migração para SharePoint Lists junto com os indicadores; indicadores de treinamento publicados no painel do SGI |
| **Fase 3** | Presença por QR Code; certificados; provas online; levantamento anual de necessidades de treinamento; relatório pronto para auditoria |

## 10. Métricas de sucesso

- **Cobertura:** 100% dos cargos com matriz definida e 100% dos treinamentos legais cadastrados em 60 dias.
- **Cumprimento:** percentual geral de cumprimento medido todo mês, com meta a definir pelo Eric (sugestão: 90%).
- **Vencimentos:** zero NR vencida sem alerta prévio de 30 dias.
- **Retreinamento:** 100% das revisões de documentos vinculados com retreinamento concluído ou dispensa justificada em até 60 dias.
- **Eficácia:** 90% das avaliações registradas dentro do prazo.
- **Auditoria:** nenhuma constatação de auditoria sobre evidência de competência no ciclo seguinte.
- **Esforço:** redução pela metade do tempo do Eric para responder "quem falta treinar".

---

## Instruções para o Antigravity

- **O que implementar (somente o MVP):**
  1. Serviço de dados do módulo com cópia local, leitura e gravação em lote por chave (matrícula, código, ID), fila de pendentes de envio e reenvio, seguindo o mesmo desenho do serviço do painel de indicadores.
  2. Funções puras e isoladas da tela para: obrigações por colaborador, validade, situação (RN7), percentual (RN10) e detecção de retreinamento (RN8).
  3. Visão pública com catálogo, cartões de percentual por área com farol e agenda de turmas, usando apenas agregados.
  4. Visão de gestão com abas Treinamentos, Matriz, Turmas (presença e eficácia), Colaboradores (situação individual e vencimentos) e Importação (modelo padrão, planilha do RH e lista de presença, com prévia e relatório de erros; botão para baixar o modelo).
  5. Aviso somente leitura "treinamentos vinculados / retreinamento pendente" na janela de detalhes do documento.
- **Onde (telas e arquivos):** novos `treinamentos.html` e `treinamentos.js` (pública, sem proteção de página); novos `treinamentos-gestao.html` e `treinamentos-gestao.js` (proteção de página e perfil Administrador via `auth-service.js`); novo `treinamentos-service.js` (endereços dos fluxos como configuração vazia, chaves locais com prefixo `docflow_treinamentos_`, importação com SheetJS); novo `treinamentos.css` com os tokens de `paleta.css` e o estilo de cartão já usado nos indicadores; item "Treinamentos" na barra lateral das páginas existentes; reaproveitar toast, diálogos e Chart.js já carregados no projeto.
- **O que não alterar:** lógica de tramitação, fluxos e chaves locais existentes; `auth-service.js` além da leitura de sessão e perfil; tokens existentes de `paleta.css`; o módulo de indicadores. Não inserir texto da planilha como HTML. Não colocar endereços de fluxos, senhas ou dados reais de colaboradores no código.
- **Como testar:**
  1. Importar planilha de teste com 3 áreas, 5 cargos, 30 colaboradores fictícios, 8 treinamentos (2 com validade de NR) e histórico parcial; conferir situações e percentuais.
  2. Importar uma segunda planilha do RH com um novo, uma mudança de cargo e um desligado; conferir o resumo e o recálculo.
  3. Criar turma, marcar presença, registrar eficácia "não eficaz" e conferir que a obrigação continua pendente.
  4. Aprovar no Kanban uma nova revisão de documento vinculado e conferir o aviso, a marcação de retreinamento e a dispensa com justificativa.
  5. Conferir vencimentos em casos de borda (vence hoje, em 30 dias, vencido ontem).
  6. Abrir a visão pública sem sessão e confirmar que nenhum nome aparece; abrir a gestão sem sessão e com perfil não administrador.
  7. Simular falha do fluxo de gravação e conferir pendentes e reenvio; verificar tema claro e escuro em 1280px, 980px e 375px.

---

## Resultado da implantação

- **Data da implantação:**
- **Validado por:** Eric
- **O que foi feito:**
- **Diferenças em relação à proposta:**
- **Observações e pendências:**
