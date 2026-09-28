# Busca global com atalho Ctrl+K

| Campo | Valor |
|-------|-------|
| Tipo | Nova funcionalidade |
| Status | Rascunho |
| Prioridade | Baixa |
| Data | 2026-09-28 |
| Autor | Claude |
| Telas afetadas | Nova: janela de busca global (sobreposta a qualquer tela). Alteradas: barra lateral / cabeçalho de Painel (Kanban), Novo Documento / Revisão Técnica, Indicadores SGI e Gestão de Indicadores (botão de acesso à busca) |

---

## 1. Contexto e oportunidade

Hoje cada tela tem a sua própria forma de achar as coisas: o Painel (Kanban) tem uma busca que só filtra os cartões visíveis, e a tela Indicadores SGI tem busca por nome dentro do próprio módulo. Para encontrar "aquele procedimento de trabalho em altura" ou "o indicador de consumo de água", o usuário precisa saber em qual tela está a informação, abrir essa tela e só então procurar. Com a chegada de novos módulos (treinamentos, não conformidades), o problema cresce.

Uma busca global, aberta de qualquer tela por Ctrl+K (padrão conhecido como "command palette"), resolve isso com um único ponto de entrada. Ela se alinha aos objetivos do [perfil do administrador](../../../doc_projeto/05-perfil-do-administrador.md) de tornar o SGI acessível e transparente para toda a Monto e de reduzir o tempo que o Eric gasta respondendo "onde está o documento X?".

É uma melhoria de conforto, sem risco para dados ou conformidade, por isso a prioridade é **Baixa**.

**Dependências:**
- [Painel de Indicadores do SGI](../../../ideias_implantadas/modelos/modelo_funcao/2026-09-28_painel-indicadores-sgi.md) (implantada): fonte dos indicadores no MVP.
- [Feedback do envio e acessibilidade](../../../ideias_implantadas/modelos/modelo_design/2026-09-28_feedback-envio-e-acessibilidade.md) (implantada): padrões de foco visível, contraste e menos animação que a janela de busca deve reutilizar.
- [Integridade da sincronização](../../../ideias_implantadas/modelos/modelo_problema/2026-09-28_integridade-sincronizacao.md) (implantada): a busca abre documentos pelo ID, nunca pela posição na lista.
- Fases seguintes dependem da existência dos módulos de treinamentos e de não conformidades (NCs), que ainda não existem.

## 2. Usuário e cenário de uso

> Como **colaborador ou membro da Qualidade**, quero **digitar poucas letras em qualquer tela e ir direto ao documento ou indicador** para **não perder tempo navegando entre telas e filtros**.

**Cenário:**

Um supervisor está no Painel e lembra que precisa consultar o procedimento de "permissão de trabalho". Ele aperta Ctrl+K, digita "permisao trabaho" (sem acento e com erro). A janela mostra, no grupo **Documentos**, o procedimento correto com código e status, e no grupo **Indicadores**, "Taxa de frequência de acidentes". Ele usa as setas, aperta Enter e o detalhe do documento abre. Na próxima vez, a busca aparece em "Buscas recentes" assim que ele abre a janela.

## 3. Descrição da funcionalidade

Uma janela sobreposta, centralizada, com um campo de busca no topo e resultados abaixo.

- **Abertura:** Ctrl+K (Cmd+K no Mac) em qualquer tela logada, ou clique em um botão "Buscar" (com a dica "Ctrl+K") no cabeçalho ou na barra lateral. Esc fecha.
- **Resultados agrupados por tipo**, cada grupo com título e contagem: Documentos, Indicadores e, no futuro, Treinamentos e Não conformidades. No máximo 5 itens por grupo, com opção "Ver todos em [tela]".
- **Cada resultado mostra:** ícone do tipo, título com o trecho encontrado destacado e uma linha de apoio (documento: código, tipo e status; indicador: pilar, último valor e farol).
- **Tolerância a acentos e maiúsculas:** "manutencao" encontra "Manutenção".
- **Tolerância a erros de digitação:** aceita pequenas diferenças (uma letra trocada, faltando ou sobrando em palavras de 4 letras ou mais).
- **Buscas recentes:** com o campo vazio, mostra as últimas buscas e os últimos itens abertos, com opção de limpar.
- **Ações rápidas:** comandos que aparecem junto dos resultados quando o texto combina, ou ao digitar ">" no início. No MVP: "Novo documento", "Revisão técnica", "Ir para o Painel", "Ir para Indicadores SGI", "Exportar CSV" e, para administradores, "Lançar indicadores".
- **Acessibilidade por teclado:** uso completo sem mouse (ver RN8).

## 4. Fluxo passo a passo

1. O usuário aperta Ctrl+K ou clica em "Buscar". A janela abre com o foco no campo e mostra buscas recentes e ações rápidas.
2. Ele digita. Após uma pausa curta, os resultados aparecem agrupados por tipo.
3. Ele navega com setas (ou mouse) e confirma com Enter (ou clique).
4. Resultado de documento: abre a janela de detalhes do documento no Painel. Indicador: abre o detalhe (drill-down) do indicador em Indicadores SGI. Ação rápida: executa a ação ou navega.
5. A busca e o item aberto são registrados em "Buscas recentes".
6. **Sem resultados:** mensagem "Nada encontrado para '...'" com sugestões ("Verifique a grafia" e a ação "Novo documento").
7. **Dados ainda carregando ou sincronização com falha:** a busca usa os dados já guardados no navegador e mostra um aviso discreto "Resultados podem estar desatualizados".

## 5. Regras de negócio

- RN1: A busca usa apenas dados já disponíveis no navegador (os mesmos que alimentam o Painel e os Indicadores). Não chama o Power Automate a cada tecla.
- RN2: Campos pesquisados. Documentos: título, código, tipo, área/setor, solicitante e responsável. Indicadores: nome, pilar, área e responsável.
- RN3: A comparação ignora acentos, maiúsculas e espaços extras. A tolerância a erro vale só para termos de 4 letras ou mais, com no máximo 1 diferença (2 para termos com 8 letras ou mais).
- RN4: Ordenação dentro de cada grupo: código exato primeiro, depois início do título, depois palavra inteira, depois correspondência aproximada. Em empate, o mais recente primeiro.
- RN5: Documentos cancelados aparecem por último, com a etiqueta do status. Indicadores inativos não aparecem.
- RN6: A busca respeita as permissões: ações e itens de gestão (ex.: "Lançar indicadores") só aparecem para o perfil administrador.
- RN7: Buscas recentes: até 8 itens, guardados só no navegador do usuário, separados por usuário logado, com botão "Limpar". Senhas ou dados sensíveis nunca são gravados.
- RN8: Teclado: Ctrl+K abre/fecha; setas para cima/baixo movem a seleção; Enter abre; Esc fecha e devolve o foco para onde estava; Tab percorre o campo e os grupos. A janela prende o foco enquanto aberta, tem papel de diálogo, o campo é anunciado como caixa de combinação com lista de resultados e o número de resultados é anunciado para leitores de tela.
- RN9: O atalho não é capturado quando o usuário está digitando em outro campo de texto que já usa Ctrl+K; nesse caso vale o botão "Buscar".
- RN10: A exibição trata todo texto vindo da planilha como texto puro (sem interpretar HTML), seguindo a correção de XSS do achado C4.

## 6. Dados envolvidos

| Dado | Origem | Obrigatório | Observação |
|------|--------|-------------|------------|
| Documentos (título, código, tipo, status, área, pessoas, ID) | Armazenamento do navegador (sincronizado com a planilha do SharePoint) | Sim | Somente leitura; abertura sempre pelo ID |
| Indicadores (nome, pilar, área, último valor, farol, ID) | Armazenamento do navegador (módulo Indicadores SGI) | Sim | Somente leitura |
| Buscas recentes | Criado pela busca | Não | Só no navegador, por usuário; não vai para a planilha |
| Treinamentos e NCs | Módulos futuros | Não | Fora do MVP |

Sem impacto no Power Automate: nenhum fluxo novo nem alterado.

## 7. Critérios de aceite

- [ ] Ctrl+K (e Cmd+K) abre a janela em Painel, Novo Documento / Revisão Técnica, Indicadores SGI e Gestão de Indicadores; Esc fecha e devolve o foco.
- [ ] Existe um botão "Buscar" visível com a dica do atalho.
- [ ] Resultados aparecem agrupados em Documentos e Indicadores, com contagem e no máximo 5 por grupo.
- [ ] "manutencao" encontra "Manutenção"; "procedmento" encontra "procedimento".
- [ ] Buscar pelo código exato coloca o documento no topo.
- [ ] Enter em um documento abre o detalhe do documento certo (pelo ID); em um indicador, abre o drill-down do indicador.
- [ ] Com o campo vazio, aparecem buscas recentes e ações rápidas; "Limpar" apaga o histórico.
- [ ] As ações rápidas funcionam, e "Lançar indicadores" só aparece para administrador.
- [ ] Todo o uso é possível só com teclado; o foco é visível; um leitor de tela anuncia a quantidade de resultados.
- [ ] Com animação reduzida no sistema, a janela abre sem animação.
- [ ] Sem resultados, aparece mensagem clara com sugestões.
- [ ] A busca responde sem atraso perceptível com a base atual de documentos.

## 8. Fora do escopo

- Treinamentos e não conformidades (entram quando esses módulos existirem).
- Busca dentro do conteúdo dos arquivos anexados (PDF, Word).
- Busca no servidor ou no SharePoint; tudo é feito com os dados já no navegador.
- Filtros avançados (por data, status) dentro da janela; para isso o usuário usa "Ver todos em [tela]".
- Sinônimos e siglas (ex.: "PT" para "permissão de trabalho").
- Busca por voz, sugestões com IA e novas bibliotecas de busca.
- Alterar a busca que já existe dentro do Painel e dos Indicadores.

## 9. Métricas de sucesso

- Uso: número de aberturas da busca por semana e porcentagem de usuários que a usaram ao menos uma vez no primeiro mês.
- Eficácia: porcentagem de buscas que terminam com um item aberto (meta: acima de 70%).
- Buscas sem resultado: acompanhar os termos mais comuns para ajustar campos pesquisados ou criar sinônimos numa fase futura.
- Redução percebida pelo Eric de pedidos do tipo "onde está o documento X?".

---

## Fases seguintes

- **Fase 2:** incluir Treinamentos e Não conformidades como novos grupos, quando os módulos existirem.
- **Fase 3:** sinônimos e siglas do SGI, filtros por tipo dentro da janela (ex.: digitar "doc:"), e mais ações rápidas (mudar status, anexar arquivo).

---

## Instruções para o Antigravity

- **O que implementar:** somente o MVP: janela de busca global com Ctrl+K e botão "Buscar", cobrindo Documentos e Indicadores, com agrupamento por tipo, tolerância a acentos e a erros de digitação (RN3), ordenação (RN4), buscas recentes (RN7), ações rápidas da seção 3 e acessibilidade por teclado (RN8). Implementar a comparação aproximada em JavaScript puro, sem bibliotecas novas.
- **Onde (telas e arquivos):** um módulo novo de busca reutilizado por todas as telas logadas (index.html, formulario.html e as telas de Indicadores), lendo os dados pelos serviços já existentes (data-service.js e o serviço dos indicadores). Estilos seguindo o `04-design.md` (paleta, modais, foco visível e respeito a menos animação). Abrir documentos pela janela de detalhes já existente do Painel e indicadores pelo drill-down já existente.
- **O que não alterar:** fluxos do Power Automate, estrutura da planilha, lógica de sincronização, as buscas locais do Painel e dos Indicadores, login e sessão.
- **Como testar:** percorrer os critérios de aceite em cada tela; testar só com teclado e com um leitor de tela (Narrador do Windows ou NVDA); testar com a opção de animação reduzida ligada; testar termos sem acento e com uma letra errada; testar como usuário comum e como administrador; testar com a sincronização falhando (dados do navegador).

---

## Resultado da implantação

- **Data da implantação:**
- **Validado por:** Eric
- **O que foi feito:**
- **Diferenças em relação à proposta:**
- **Observações e pendências:**
