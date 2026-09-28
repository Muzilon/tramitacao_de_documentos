# 07. Prompt para a nova conversa

Este arquivo tem duas partes, e elas têm usos diferentes:

- **Parte 1: texto para colar.** É a primeira mensagem da conversa nova, no repositório novo. Copie **só o conteúdo do bloco** (entre as linhas de abertura e fechamento), sem este cabeçalho.
- **Parte 2: notas para o Eric.** Ficam **fora** do texto para colar. Leia antes de abrir a conversa nova, mas não envie para o Claude.

---

## Parte 1. Texto para colar na primeira mensagem

> Copie tudo o que está dentro do bloco abaixo. Anexe (ou cole logo em seguida) os documentos 00 a 06 desta pasta e a pasta `agentes/`.

```text
Olá, Claude. Vamos reconstruir do zero o DocFlow, o sistema do SGI (Sistema de Gestão Integrada: Qualidade, Meio Ambiente, Segurança e Saúde Ocupacional) do Grupo Monto. Ele começou como um sistema de tramitação de documentos e a meta é virar um SaaS interno modular, que tire o SGI das planilhas Excel. Este é um repositório novo: o código é novo, mas as regras de negócio e as lições das tentativas anteriores já estão documentadas e devem ser respeitadas.

1. ESPECIFICAÇÃO: LEIA ANTES DE QUALQUER CÓDIGO

Os documentos 00 a 06 (anexados ou colados junto com esta mensagem) são a especificação completa do projeto:
- 00: leia primeiro (como usar o pacote);
- 01: visão do produto e lições aprendidas (inclui os requisitos não negociáveis e as regras de processo da seção 5);
- 02: modelo de dados, identidade dos documentos, sincronização e autenticação;
- 03: comportamento das telas, campo a campo, e os defeitos a não repetir (P-01 a P-19);
- 04: design system (tokens, barra lateral estática, Kanban, formulário, acessibilidade);
- 05: backlog de módulos e ordem de construção;
- 06: opções de stack (a decisão ainda está em aberto).

Leia todos antes de escrever qualquer linha de código. Se algo estiver ambíguo ou contraditório entre eles, pergunte em vez de supor.

2. PAPÉIS NESTA CONVERSA

- Eric: dono do produto. Decide prioridades, aprova decisões grandes (stack, modelo de dados, fonte da verdade, apagar ou mover arquivos em massa) e valida cada entrega.
- Claude (você): cuida da codificação E do UX/UI diretamente. Não é só planejamento: você implementa as telas, os componentes, as regras e os dados, seguindo o design system do documento 04.
- Antigravity (se estiver disponível nesta ferramenta ou em paralelo): apoio para novas ideias e automações. Não é quem implementa.

3. COMO VOCÊ DEVE TRABALHAR: DELEGAÇÃO POR MÓDULO

Mesmo codificando, não implemente tudo sozinho numa resposta só. Delegue a subagentes, um subagente por módulo ou tarefa, escolhendo o modelo pela complexidade:
- Fable 5.1: arquitetura e lógica complexa (modelo de dados, sincronização, permissões, regras de transição);
- Opus 5.5: implementação e UI (telas, componentes, estilos, testes de tela);
- Haiku 4.5: pesquisa (documentação de bibliotecas, APIs da Microsoft, levantamentos rápidos).
Cada tarefa delegada termina com um relatório em Markdown: o que foi feito, arquivos alterados, o que ficou pendente e como validar.

4. REGRA MAIS IMPORTANTE: CONSTRUIR POR FATIAS PEQUENAS

NUNCA faça uma reescrita total de uma vez. Nunca substitua tudo de uma vez.
Trabalhe em fatias pequenas e verificáveis: uma tela ou um fluxo por vez, cada fatia funcionando de ponta a ponta (tela, regra, dados, permissão) e validada por mim antes da próxima. Nada de estruturas decorativas (menu sem destino, botão sem ação, valor fixo no lugar de dado real) apresentadas como prontas. Esta é a lição mais cara das tentativas anteriores: uma migração que substituiu tudo de uma vez apagou uma versão que funcionava e entregou um protótipo incompleto (documento 01, seção 3.2).

5. O QUE EU QUERO NA SUA PRIMEIRA RESPOSTA (ANTES DE CODIFICAR)

a) Um resumo curto do que você entendeu da especificação e as perguntas que precisam de resposta minha antes de começar (a principal delas é a escolha de stack do documento 06; me ajude a decidir, com uma recomendação fundamentada, mas a decisão é minha).

b) Um plano de construção por fatias pequenas, seguindo a ordem do documento 05 (começando pela Fundação: tramitação + integridade de dados + login Microsoft e perfis + feedback e acessibilidade, com layout responsivo desde o início). Para cada fatia: o que entrega, como eu valido e qual subagente/modelo cuida dela. Repito: nenhuma fatia pode ser uma reescrita total.

c) Só depois de eu aprovar o plano e a stack, a configuração inicial do projeto, nesta ordem, antes de codificar o primeiro módulo:

   - CLAUDE.md (arquivo de regras do projeto), contendo no mínimo:
     * os papéis: Claude codifica e faz o UX/UI; Antigravity ajuda com ideias e automações; Eric decide;
     * o padrão de delegação por módulo e de escolha de modelo descrito acima, com relatório em Markdown ao final de cada tarefa;
     * a regra de nunca substituir tudo de uma vez: fatias pequenas, a versão nova convive com a antiga até ser validada, e remover a antiga é um passo separado aprovado por mim;
     * a exigência de webhooks, URLs assinadas, senhas, tokens e demais segredos fora do código-fonte desde o primeiro commit (variáveis de ambiente ou cofre, só no servidor; .gitignore cobrindo arquivos de ambiente; arquivo de exemplo só com placeholders; verificação automática de segredos);
     * a manutenção do CHANGELOG.md desde o início, com uma linha por mudança relevante, na data em que aconteceu;
     * o registro de decisões (ex.: docs/decisoes/, um arquivo por decisão) antes do código correspondente;
     * a obrigação de manter o próprio CLAUDE.md atualizado sempre que uma regra, tecnologia ou convenção mudar.

   - CHANGELOG.md, já com a primeira entrada (criação do repositório e da configuração inicial).

   - Agentes especializados por módulo, em .claude/agents/*.md: um arquivo por módulo do backlog do documento 05 (mais os de suporte que fizerem sentido, como revisão de segurança e acessibilidade), seguindo o padrão de frontmatter do Claude Code (name, description, tools, model) e com as instruções do módulo no corpo. Esses agentes já foram esboçados na pasta especificacao-para-novo-repositorio/agentes/ deste pacote: copie e adapte à stack escolhida, em vez de escrever do zero.

d) Só então comece a implementar a primeira fatia da Fundação.

Não copie código do repositório antigo (tramitacao_de_documentos). Ele serve apenas como referência funcional pontual, e alguns arquivos dele contêm segredos que devem ser considerados vazados.
```

---

## Parte 2. Notas para o Eric (não colar)

### Por que a construção por fatias é a regra mais importante

A tentativa de migração para React/TypeScript não falhou por causa da tecnologia: falhou porque o agente trocou a raiz inteira do projeto pela versão nova num único commit, apagando mais de 12 mil linhas de código que funcionavam. O que entrou no lugar era um protótipo sem login, sem formulário de cadastro, com o Kanban incompleto e com os mesmos segredos expostos. Já a migração incremental do dia seguinte, feita módulo a módulo sem apagar nada antes de validar, funcionou (documento 01, seções 3.2 e 3.3).

Por isso a regra aparece duas vezes no texto para colar e vai também para o `CLAUDE.md`. Na prática, desconfie de qualquer resposta que proponha "montar a estrutura toda primeiro e depois ligar as partes". Cada entrega deve ser uma fatia que você consegue abrir, testar e aprovar.

### Decisão pendente: a stack (documento 06)

Antes de abrir a conversa nova, ou logo na primeira resposta do Claude, você precisa escolher entre os três caminhos do documento 06:

1. **TypeScript sem framework:** mais simples e de menor risco; fica mais trabalhoso quando o número de módulos crescer.
2. **Framework de UI (React, Vue ou similar) com TypeScript, feito com disciplina:** escala melhor para telas complexas (Kanban, formulários dinâmicos, modais), mas é o caminho que falhou da última vez. Só vale com o plano por fatias.
3. **Power Apps / Power Platform:** integração nativa com o Microsoft 365. Em troca, você tem menos controle sobre o design e pode precisar de licenças; não foi avaliado a fundo.

Junto com a stack vem a decisão de onde os dados moram (documento 02, seção 5.3: SharePoint Lists, banco próprio atrás de uma API ou Dataverse). O texto para colar pede que o Claude recomende uma opção com justificativa, mas não comece a codificar antes da sua aprovação. Vale conversar antes com a TI da Monto sobre licenças, hospedagem com HTTPS e o registro do aplicativo no Entra ID, porque essas respostas pesam na escolha.

### Os agentes em `agentes/` são um ponto de partida

Os arquivos de agente esboçados em `especificacao-para-novo-repositorio/agentes/` foram escritos antes de a stack ser escolhida. Por isso:

- o Claude deve **ajustá-los à stack escolhida** (ferramentas permitidas, convenções de pastas, comandos de build e teste, bibliotecas) ao copiá-los para `.claude/agents/`;
- o campo de modelo de cada agente deve seguir a regra de complexidade (Fable 5.1 para arquitetura e lógica complexa, Opus 5.5 para implementação e UI, Haiku 4.5 para pesquisa);
- se você escolher o caminho Power Platform, boa parte dos agentes de implementação muda de natureza, e é normal que alguns sejam fundidos ou descartados;
- sempre que um agente for alterado, a mudança deve entrar no `CHANGELOG.md`, como qualquer outra regra do projeto.

### Checklist rápido antes de enviar a primeira mensagem

- [ ] Documentos 00 a 06 anexados ou colados junto.
- [ ] Pasta `agentes/` anexada ou copiada para o repositório novo.
- [ ] Repositório novo criado, vazio, sem nenhum arquivo copiado do repositório antigo.
- [ ] Assinaturas dos fluxos do Power Automate antigos regeneradas (os endereços antigos devem ser considerados vazados).
- [ ] Uma ideia inicial de qual stack você prefere, mesmo que ainda não seja definitiva.
