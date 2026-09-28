# Lista mestra pública de documentos do SGI

| Campo | Valor |
|-------|-------|
| Tipo | Nova funcionalidade |
| Status | Rascunho |
| Prioridade | Média |
| Data | 2026-09-28 |
| Autor | Claude |
| Telas afetadas | Nova tela "Lista Mestra" (pública, só leitura); Painel (Kanban), com atalho para a lista |

---

## 1. Contexto e oportunidade

As normas ISO 9001, 14001 e 45001 exigem o controle da informação documentada (requisito 7.5): identificar, aprovar, disponibilizar a versão correta no ponto de uso e impedir o uso de documentos obsoletos. Hoje o DocFlow controla a tramitação até a aprovação, mas não existe um lugar único em que qualquer colaborador consulte "qual é a revisão vigente deste procedimento". Na prática a Qualidade mantém uma lista mestra paralela em planilha, com retrabalho e risco de divergência, e em auditoria é comum aparecer cópia impressa ou salva localmente de revisão antiga.

A lista mestra aproveita os dados que o DocFlow já tem (documentos com status Aprovado) e transforma o sistema na fonte oficial de consulta, reforçando o objetivo do Eric de centralizar o SGI e chegar às auditorias com evidências prontas (ver o perfil do administrador).

**Dependências:**
- Ideia implantada de integridade da sincronização (`ideias_implantadas/modelos/modelo_problema/2026-09-28_integridade-sincronizacao.md`): a lista só é confiável se os documentos forem identificados por ID e o status Aprovado estiver refletido na planilha.
- Ideia implantada do painel de indicadores (`ideias_implantadas/modelos/modelo_funcao/2026-09-28_painel-indicadores-sgi.md`): reaproveitar a mesma leitura de dados e o conceito de "próxima revisão"/vencimento, sem recalcular regras diferentes.
- Ideia implantada de feedback e acessibilidade (`ideias_implantadas/modelos/modelo_design/2026-09-28_feedback-envio-e-acessibilidade.md`): seguir a paleta com contraste corrigido e os padrões de foco e teclado.
- Achados de segurança C1 a C4 do `doc_projeto/README.md`: a tela pública não pode expor endereços de fluxo, senhas ou dados internos da tramitação.

## 2. Usuário e cenário de uso

> Como **colaborador de qualquer área**, quero **consultar a revisão vigente de um documento do SGI sem precisar de login** para **trabalhar sempre com a versão correta**.

> Como **analista da Qualidade**, quero **exportar a lista mestra em PDF e Excel** para **apresentar evidência de controle documental ao auditor**.

**Cenário:** durante a auditoria externa, o auditor pergunta qual é a revisão vigente do procedimento de controle de resíduos e pede a lista de documentos obsoletos do último ano. O Eric abre a Lista Mestra, busca pelo código, mostra a revisão e a data de aprovação, abre a aba "Obsoletos" filtrada por período e exporta os dois recortes em PDF na hora.

## 3. Descrição da funcionalidade

Uma tela nova, acessível por link próprio e sem login, que mostra em tabela todos os documentos vigentes do SGI com as colunas: código, título, tipo, área, revisão, data de aprovação, próxima revisão e link para a versão vigente.

- **Busca** por código ou título e **filtros** por tipo, área e situação da próxima revisão (em dia, vencendo em 30 dias, vencida).
- **Duas abas:** "Vigentes" (padrão) e "Obsoletos", com os documentos substituídos por revisão mais nova ou cancelados, mostrando também a data em que ficaram obsoletos e o documento/revisão que os substituiu.
- **Exportação em PDF e Excel** do que está na tela (aba e filtros aplicados), com cabeçalho de identificação (Grupo Monto, SGI, data e hora de emissão) e rodapé "Cópia não controlada quando impressa".
- **Controle de cópias:** só a versão vigente tem link de abertura. Na aba Obsoletos não há link para o arquivo.

## 4. Fluxo passo a passo

1. O colaborador abre a Lista Mestra pelo link divulgado (intranet, Teams) ou pelo atalho no Painel.
2. A tela carrega os documentos e mostra a aba "Vigentes" ordenada por código, com a data e hora da última atualização dos dados.
3. O colaborador digita na busca ou aplica filtros; a tabela e o contador de resultados se atualizam na hora.
4. Clica no link da linha e o arquivo da versão vigente abre no SharePoint em nova aba.
5. Para auditoria, a Qualidade troca para a aba "Obsoletos", aplica filtros e clica em "Exportar PDF" ou "Exportar Excel".
6. **Erros:** se os dados não carregarem, a tela mostra mensagem clara e a data da última lista válida guardada, sem tabela vazia silenciosa. Se um documento vigente não tiver link, a linha mostra "Arquivo indisponível, avise a Qualidade" em vez de um link quebrado. Se a busca não achar nada, mostra estado vazio com opção de limpar filtros.

## 5. Regras de negócio

- RN1: Entra na aba Vigentes apenas o documento com status Aprovado e que seja a revisão mais alta do seu código. Documentos em tramitação (Recebido, Em Revisão etc.) não aparecem.
- RN2: Quando uma nova revisão de um código é aprovada, a anterior sai automaticamente de Vigentes e vai para Obsoletos, com a data de aprovação da nova como data de obsolescência.
- RN3: Documento Cancelado que já tenha sido aprovado antes vai para Obsoletos com motivo "Cancelado".
- RN4: A lista é só leitura para todos. Nenhuma ação de edição, status ou anexo existe nesta tela.
- RN5: Obsoletos nunca exibem link para o arquivo (controle de cópias). A consulta ao arquivo obsoleto continua restrita à Qualidade pelo Painel.
- RN6: A próxima revisão é calculada pela data de aprovação somada ao prazo de revisão periódica do tipo de documento (valor padrão a confirmar com o Eric), ou usa a data informada no cadastro quando existir. Mesma regra usada no painel de indicadores.
- RN7: Situação da próxima revisão: "Vencida" (data passada), "Vencendo" (até 30 dias), "Em dia" (demais). Sinalizada por cor e texto, nunca só por cor.
- RN8: A tela pública mostra somente as colunas definidas; não exibe solicitante, responsáveis, observações, histórico nem dados de usuários.
- RN9: Toda exportação traz data e hora de emissão e o aviso "Cópia não controlada quando impressa"; o PDF inclui a identificação dos filtros aplicados.
- RN10: Se houver dois documentos aprovados com o mesmo código e revisão, a tela mostra ambos com alerta visual para a Qualidade corrigir (não escolhe um em silêncio).

## 6. Dados envolvidos

| Dado | Origem | Obrigatório | Observação |
|------|--------|-------------|------------|
| Código | Cadastro do documento | Sim | Chave de agrupamento das revisões |
| Título | Cadastro | Sim | |
| Tipo | Cadastro | Sim | Procedimento, instrução de trabalho, mapa de riscos etc. |
| Área | Cadastro | Sim | Filtro |
| Revisão | Cadastro | Sim | Precisa ser numérica ou comparável para achar a mais alta |
| Data de aprovação | Histórico de status (mudança para Aprovado) | Sim | Depende do fluxo de atualização de status gravar na planilha |
| Próxima revisão | Calculada (RN6) ou campo do cadastro | Não | Campo novo opcional na planilha, se o Eric preferir data manual |
| Link da versão vigente | Arquivo principal no SharePoint | Sim para vigentes | Não exibido em obsoletos |
| Data de obsolescência e substituto | Calculados (RN2, RN3) | Não | Não precisam ser gravados; derivados na leitura |

Armazenamento: leitura da mesma planilha do SharePoint já sincronizada; a tela guarda no navegador apenas a última lista válida para exibir em caso de falha. Impacto no Power Automate: a leitura pública não deve usar o fluxo que devolve a planilha inteira (inclui usuários). É necessário um fluxo ou visão de leitura que retorne só as colunas da RN8.

## 7. Critérios de aceite

- [ ] A tela abre sem login e mostra só documentos Aprovados na revisão mais alta de cada código.
- [ ] As oito colunas definidas aparecem; nenhum dado interno (RN8) é exibido nem trafega para a tela.
- [ ] Busca por código ou título e filtros por tipo, área e situação da próxima revisão funcionam juntos.
- [ ] Ao aprovar nova revisão, a anterior passa para Obsoletos após a sincronização.
- [ ] Aba Obsoletos não tem nenhum link para arquivo.
- [ ] Exportações PDF e Excel respeitam aba e filtros e trazem data de emissão e aviso de cópia não controlada.
- [ ] Falha de carregamento, arquivo sem link e busca sem resultado têm mensagens claras.
- [ ] Tela navegável por teclado, com contraste mínimo de 4,5:1 e usável no celular.

## 8. Fora do escopo

- Distribuição controlada com registro de ciência ("li e entendi") por colaborador.
- Controle de cópias impressas numeradas.
- Alertas por e-mail de revisão vencida (pode virar ideia própria).
- Acesso ao conteúdo de documentos obsoletos pela tela pública.
- Documentos externos (normas, legislação) e registros do SGI.
- Autenticação corporativa (tratada nos achados C1 a C3).

## 9. Métricas de sucesso

- A planilha paralela de lista mestra da Qualidade deixa de ser mantida em até 2 meses.
- Zero constatações de auditoria sobre uso de documento obsoleto ou lista mestra desatualizada no ciclo seguinte.
- Tempo para responder "qual é a revisão vigente?" em auditoria cai para menos de 1 minuto.
- Número de acessos à tela por mês (adesão das áreas).

---

## Instruções para o Antigravity

- **O que implementar:** tela nova "Lista Mestra", pública e só leitura, com abas Vigentes e Obsoletos, busca, filtros, estado vazio e de erro, e exportação PDF e Excel do recorte exibido, seguindo RN1 a RN10. Atalho para ela no Painel.
- **Onde (telas e arquivos):** página HTML própria com script e estilos próprios, reaproveitando a camada de dados existente (`data-service.js`) e a paleta (`paleta.css`) conforme o `doc_projeto/04-design.md`. Para Excel, reaproveitar o SheetJS já usado; para PDF, preferir a impressão do navegador com folha de estilo de impressão, sem biblioteca nova (se não for suficiente, pedir aprovação ao Eric antes).
- **O que não alterar:** regras de tramitação, Kanban, formulários, autenticação atual e fluxos existentes do Power Automate. Não expor o fluxo de leitura completo nem colocar endereços de fluxo ou senhas nesta página.
- **Como testar:** criar documentos de teste com o mesmo código em revisões diferentes (uma aprovada, outra em tramitação, uma cancelada) e conferir quem aparece em cada aba; aprovar nova revisão e ver a anterior migrar; testar busca e filtros combinados; exportar PDF e Excel e conferir cabeçalho, aviso e filtros; simular falha de rede; navegar só pelo teclado e em largura de celular; conferir nas ferramentas do navegador que a resposta de dados não contém colunas internas.

---

## Resultado da implantação

- **Data da implantação:**
- **Validado por:** Eric
- **O que foi feito:**
- **Diferenças em relação à proposta:**
- **Observações e pendências:**
