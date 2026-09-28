# Painel de Prontidão para Auditoria

| Campo | Valor |
|-------|-------|
| Tipo | Nova funcionalidade |
| Status | Rascunho |
| Prioridade | Baixa |
| Data | 2026-09-28 |
| Autor | Claude |
| Telas afetadas | Nova: Prontidão para Auditoria. Alterada: barra lateral de Painel (Kanban) e das demais telas (novo link de menu) |

> **Dependências obrigatórias:** este painel **não cria dados próprios de SGI**. Ele só lê e agrega os dados de quatro outras funcionalidades:
> 1. **Controle de validade dos documentos** (ideia ainda não escrita): datas de vencimento e revisão periódica.
> 2. **Matriz de treinamentos** (ideia ainda não escrita): quem precisa ser treinado em qual documento e se já foi.
> 3. **Registro de Não Conformidades (NC)** (ideia ainda não escrita): NCs abertas, prazos e ações.
> 4. **Painel de Indicadores do SGI** (já implantada, em `ideias_implantadas/modelos/modelo_funcao/2026-09-28_painel-indicadores-sgi.md`): farol de meta.
>
> O painel só deve ser implementado depois que pelo menos validade, NC e indicadores estiverem implantados. Uma fonte que não existir aparece como "Fonte não disponível" e fica fora da nota (ver RN6).

---

## 1. Contexto e oportunidade

Antes de cada auditoria interna ou de certificação (ISO 9001, 14001 e 45001), o Eric junta à mão, de várias planilhas, a situação dos documentos, NCs, treinamentos e indicadores. Isso toma dias e a resposta a "estamos prontos?" depende da memória dele. Não há uma visão por área nem por cláusula da norma, que é justamente como o auditor pergunta.

Quando as funcionalidades de validade, treinamentos, NC e indicadores existirem, os dados estarão no DocFlow. Falta um lugar que os cruze por norma, cláusula e área. Isso atende ao objetivo do administrador de sair do Excel e dar visibilidade ao SGI (ver `doc_projeto/05-perfil-do-administrador.md`). A prioridade é Baixa porque só gera valor depois que as quatro fontes estiverem funcionando.

## 2. Usuário e cenário de uso

> Como **administrador do SGI (Eric)**, quero **ver em uma tela o que falta em cada norma, cláusula e área** para **corrigir as pendências antes da auditoria e entregar ao auditor um relatório pronto**.

> Como **gestor de área**, quero **ver a nota de prontidão da minha área e a lista do que está pendente** para **resolver o que me cabe sem esperar a Qualidade cobrar**.

**Cenário:** faltam três semanas para a auditoria de manutenção da ISO 45001. O Eric abre Prontidão para Auditoria, escolhe a norma 45001 e vê que a Manutenção está com nota 62 (vermelha): dois procedimentos vencidos, uma NC com prazo estourado e cinco colaboradores sem treinamento na instrução de bloqueio e etiquetagem. Ele manda o link filtrado para o gestor da Manutenção. Na semana da auditoria, exporta o relatório pré-auditoria e o leva para a reunião de abertura.

## 3. Descrição da funcionalidade

Uma nova tela **Prontidão para Auditoria**, apenas de leitura, com:

**3.1 Filtros no topo:** norma (ISO 9001, ISO 14001, ISO 45001 ou Todas), área, e janela de "a vencer" (padrão 30 dias).

**3.2 Resumo por norma:** um cartão por norma com a nota geral e quatro contadores: documentos vencidos ou a vencer, NCs abertas (destacando as atrasadas), treinamentos pendentes e indicadores fora da meta.

**3.3 Nota de prontidão por área:** tabela com uma linha por área, a nota de 0 a 100, farol (verde, âmbar, vermelho) e os quatro contadores. Clicar em um contador abre a lista dos itens, com link para a tela de origem.

**3.4 Checklist por cláusula:** para a norma escolhida, lista as cláusulas (ex.: 7.2 Competência, 7.5 Informação documentada, 9.1 Monitoramento, 10.2 Não conformidade e ação corretiva). Cada cláusula mostra os itens pendentes ligados a ela e um estado: "Atendida", "Com pendências" ou "Sem evidência no DocFlow". O administrador pode marcar manualmente uma cláusula como "Verificada" com observação (para requisitos que o DocFlow não controla).

**3.5 Relatório pré-auditoria exportável:** botão que gera um arquivo Excel (SheetJS, já usado no projeto) com abas: Resumo, Notas por área, Checklist por cláusula e Pendências detalhadas, com data e hora da geração e filtros usados. Uma versão para impressão (PDF pelo navegador) com o mesmo conteúdo.

## 4. Fluxo passo a passo

1. O usuário abre Prontidão para Auditoria pelo menu lateral.
2. O sistema lê os dados já carregados das quatro fontes (cópia local e, em paralelo, atualização da nuvem, como nas outras telas).
3. O sistema calcula contadores e notas e desenha resumo, tabela por área e checklist.
4. O usuário filtra por norma e área; os números se recalculam na hora.
5. O usuário clica em um contador e vê a lista de itens; clica em um item e vai para a tela de origem.
6. O administrador marca uma cláusula como Verificada e escreve a observação; o registro é salvo.
7. O usuário clica em "Exportar relatório pré-auditoria" e baixa o arquivo.
8. Erro: se uma fonte falhar ou não existir, o cartão correspondente mostra "Fonte não disponível", a nota da área é calculada sem ela e um aviso indica que a nota está parcial. Se a nuvem não responder, vale o aviso de "dados podem estar desatualizados" já usado no Painel de Indicadores.

## 5. Regras de negócio

- RN1: O painel não altera dados das fontes. Só a marcação "Verificada" da cláusula é um dado próprio.
- RN2: Documento **vencido** = data de validade anterior a hoje. **A vencer** = vence dentro da janela escolhida (padrão 30 dias). Documentos cancelados ou obsoletos não contam.
- RN3: **NC aberta** = qualquer NC não encerrada. **Atrasada** = prazo de ação vencido.
- RN4: **Treinamento pendente** = pessoa prevista na matriz sem registro de treinamento na revisão vigente do documento.
- RN5: **Indicador fora da meta** = farol vermelho no último período, conforme o Painel de Indicadores do SGI. Farol cinza (sem dado) conta como pendência de lançamento.
- RN6: **Nota por área** = média ponderada de quatro subnotas (documentos, NC, treinamentos e indicadores), cada uma igual ao percentual de itens em dia daquela fonte na área. Pesos padrão iguais (25% cada), ajustáveis pelo administrador. Fonte indisponível ou sem itens na área sai do cálculo e os pesos são redistribuídos. Itens vencidos ou atrasados pesam o dobro dos "a vencer".
- RN7: Farol da nota: verde a partir de 85, âmbar de 70 a 84, vermelho abaixo de 70 (limites ajustáveis pelo administrador).
- RN8: A ligação de cada item a norma e cláusula vem da própria fonte (ex.: tipo de documento ou pilar do indicador) ou de uma tabela de mapeamento mantida pelo administrador. Item sem mapeamento aparece em "Não classificados".
- RN9: Um item pode valer para mais de uma norma (ex.: procedimento integrado do SGI).
- RN10: Permissões: todos os perfis logados veem a tela; só o administrador marca cláusulas como Verificadas, ajusta pesos, limites e mapeamento.
- RN11: O relatório exportado leva data, hora, usuário e filtros aplicados, e não inclui senhas nem dados de login.

## 6. Dados envolvidos

| Dado | Origem | Obrigatório | Observação |
|------|--------|-------------|------------|
| Validade dos documentos | Ideia de controle de validade | Sim | Só leitura |
| Matriz e registros de treinamento | Ideia de matriz de treinamentos | Não (nota parcial sem ela) | Só leitura |
| Não conformidades | Ideia de registro de NC | Sim | Só leitura |
| Farol dos indicadores | Painel de Indicadores do SGI | Sim | Só leitura |
| Lista de cláusulas por norma | Nova tabela de configuração | Sim | Carga inicial com as cláusulas principais das três normas; editável pelo administrador |
| Mapeamento item x norma x cláusula | Nova tabela de configuração | Sim | Mantida pelo administrador |
| Verificação manual de cláusula | Nova, digitada pelo administrador | Não | Norma, cláusula, data, usuário, observação |
| Pesos e limites da nota | Nova configuração | Sim | Valores padrão das RN6 e RN7 |

Armazenamento: as três tabelas novas ficam no navegador e são sincronizadas com a planilha do SharePoint em abas novas, pelo mesmo padrão de fluxos do Power Automate já usado (sem criar fluxo novo, se o fluxo atual aceitar abas adicionais; caso contrário, avaliar com o Eric). Os cálculos são feitos no navegador e não são gravados.

## 7. Critérios de aceite

- [ ] A tela mostra, por norma, os quatro contadores e a nota geral.
- [ ] A tabela por área mostra nota, farol e contadores, e o cálculo segue RN6 e RN7.
- [ ] Clicar em um contador lista os itens com link para a tela de origem.
- [ ] O checklist por cláusula mostra o estado de cada cláusula e aceita a marcação Verificada só pelo administrador.
- [ ] A exportação gera Excel com as quatro abas e a versão para impressão tem o mesmo conteúdo.
- [ ] Com uma fonte indisponível, a tela funciona, avisa "nota parcial" e não quebra.
- [ ] Nenhum dado das fontes é alterado pelo painel.
- [ ] Segue a paleta, os cartões e o tema claro e escuro de `04-design.md`.

## 8. Fora do escopo

- Criar ou editar documentos, NCs, treinamentos ou indicadores (isso é das ideias de origem).
- Planejamento de auditorias (agenda, auditores, programa anual) e registro de constatações do auditor.
- Texto integral das normas (direitos autorais); só número e título curto das cláusulas.
- Envio automático de alertas por e-mail ou Teams.
- Histórico da nota ao longo do tempo (candidato a fase 2).

## 9. Métricas de sucesso

- Tempo de preparação para auditoria cai de dias para poucas horas (relato do Eric).
- Nenhuma constatação de auditoria sobre documento vencido ou treinamento pendente que já aparecia no painel.
- Todas as áreas com nota verde na semana anterior à auditoria.
- Relatório pré-auditoria usado nas próximas duas auditorias.

---

## Instruções para o Antigravity

- **O que implementar:** a tela Prontidão para Auditoria (seções 3 e 4), o cálculo das RN2 a RN7, a marcação de cláusula Verificada, as três tabelas de configuração e a exportação Excel e para impressão. Não implementar antes de validade, NC e indicadores estarem implantados.
- **Onde (telas e arquivos):** nova página e novo módulo JS próprios, reaproveitando o serviço de dados e o SheetJS existentes; link na barra lateral das telas atuais; estilos conforme `04-design.md`.
- **O que não alterar:** a lógica e os dados das funcionalidades de origem; os fluxos do Power Automate além de acrescentar abas, se previsto; nenhuma URL ou senha em código ou documento.
- **Como testar:** montar dados de exemplo com itens vencidos, a vencer, NC atrasada, treinamento pendente e indicador vermelho em duas áreas; conferir contadores e notas à mão; desligar uma fonte e verificar o aviso de nota parcial; exportar e conferir as abas; testar com perfil não administrador (sem marcação de cláusula).

---

## Resultado da implantação

- **Data da implantação:**
- **Validado por:** Eric
- **O que foi feito:**
- **Diferenças em relação à proposta:**
- **Observações e pendências:**
