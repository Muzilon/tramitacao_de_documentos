# Agentes do Claude Code para a reconstrução do DocFlow

Esta pasta traz um **ponto de partida** para os subagentes do Claude Code no repositório novo. Na reconstrução, quem codifica é o Claude: o Claude principal planeja e coordena, e delega a implementação de cada módulo do backlog (`../05-backlog-de-modulos.md`) a um subagente especializado nesse módulo.

## Como usar

1. Copie os arquivos `agente-*.md` desta pasta para `.claude/agents/` na raiz do repositório novo (este `README.md` não precisa ser copiado).
2. **Ajuste os nomes de modelo.** Os valores `fable-5-1` e `opus-5-5` no campo `model` do frontmatter são indicativos: troque pelos modelos disponíveis no Claude Code quando o projeto for construído (ou use `inherit` para herdar o modelo da conversa principal). A regra é: modelo mais forte para arquitetura e lógica complexa, modelo padrão para o restante.
3. Ajuste os caminhos citados nos prompts (`especificacao-para-novo-repositorio/...`, `ideias/modelos/...`, `docs/decisoes/`) para onde esses documentos ficarem no repositório novo.
4. Revise o campo `tools` conforme a política de permissões do projeto. O agente de QA é propositalmente somente leitura (sem `Write`/`Edit`).

## Formato de cada arquivo

Frontmatter YAML com `name`, `description` (quando o Claude principal deve acionar o agente), `model` e `tools`, seguido do system prompt em Markdown. Todo agente de módulo contém: objetivo do módulo, dependências, instrução para ler a especificação completa antes de codificar, proibição de implementar fora do escopo sem avisar e obrigação de atualizar o `CHANGELOG.md` ao concluir.

## Fluxo sugerido

1. Claude principal escolhe o próximo módulo pela ordem de construção do documento 05.
2. Aciona o agente do módulo; este recorre ao `agente-arquitetura-dados` (esquema, API, integrações, permissões) e ao `agente-ux-ui` (componentes e telas) quando precisar.
3. Ao fim de cada fatia, o `agente-qa-revisao` revisa contra os critérios de aceite antes de a entrega ser dada como pronta.
4. Decisões grandes (modelo de dados, fonte da verdade, framework, remoção de código) continuam sendo do Eric e são registradas antes do código.

## Índice dos 17 agentes

### Agentes de base

| Agente | Módulo | Quando acionar | Model |
|--------|--------|----------------|-------|
| `agente-arquitetura-dados` | Transversal | Modelo de dados, sincronização, integrações (Power Automate/SharePoint ou outra fonte), autenticação, autorização no servidor, segredos | fable-5-1 |
| `agente-ux-ui` | Transversal | Componentes, telas, estados visuais, acessibilidade, responsividade, aplicação do design system e do Figma | opus-5-5 |
| `agente-qa-revisao` | Transversal | Ao fim de cada entrega: critérios de aceite, regressões, nada apagado antes de validado | opus-5-5 |

### Agentes de módulo

| Agente | Módulo (seção do doc 05) | Quando acionar | Model |
|--------|--------------------------|----------------|-------|
| `agente-integridade-sincronizacao` | 1.1 Integridade e sincronização dos dados | ID estável, concorrência, idempotência, fila de reenvio, histórico acumulativo | fable-5-1 |
| `agente-feedback-acessibilidade` | 1.2 Feedback de envio, validação e acessibilidade | Estados de envio, modo offline, validação inline, contraste, foco, teclado | opus-5-5 |
| `agente-indicadores-sgi` | 1.3 Painel de Indicadores do SGI | Cartões e farol, cadastro e lançamento de indicadores, importação, KPIs da tramitação | opus-5-5 |
| `agente-autenticacao-microsoft` | 2.1 Autenticação Microsoft e perfis | Login Entra ID, sessão, perfis por grupo, função única de permissão | fable-5-1 |
| `agente-controle-validade` | 2.2 Controle de validade e revisão periódica | Periodicidade, estados de validade, revisão periódica, KPI de validade | opus-5-5 |
| `agente-matriz-treinamentos` | 2.3 Matriz de treinamentos | Treinamentos, matriz cargo x treinamento, turmas, eficácia, retreinamento | opus-5-5 |
| `agente-nao-conformidades` | 3.1 Não Conformidades e Planos de Ação | Ciclo da NC, análise de causa, 5W2H, eficácia, Kanbans e KPIs de NC | opus-5-5 |
| `agente-notificacoes` | 3.2 Notificações por e-mail e Teams | Gatilhos, destinatários, anti-spam, preferências, registro de envios | fable-5-1 |
| `agente-minha-fila` | 3.3 Tela inicial "Minha fila" | Blocos "Comigo", "Devolvidos", "Prazos", ações rápidas, tela inicial por perfil | opus-5-5 |
| `agente-lista-mestra` | 3.4 Lista mestra pública | Vigentes e obsoletos, filtros, exportação, endpoint público | opus-5-5 |
| `agente-portal-sgi` | 3.5 Portal do SGI | Página pública, atalhos, "Como estamos", conteúdo configurável, modo faixa | opus-5-5 |
| `agente-layout-mobile` | 3.6 Layout para celular | Faixas de largura, navegação, Kanban no celular, modal e formulário móveis | opus-5-5 |
| `agente-busca-global` | 3.7 Busca global (Ctrl+K) | Janela de busca, agrupamento, tolerância a erros, ações rápidas por perfil | opus-5-5 |
| `agente-painel-auditoria` | 3.8 Painel de prontidão para auditoria | Notas por norma e área, checklist por cláusula, relatório pré-auditoria | opus-5-5 |

**Divisão de modelos:** 4 agentes com `fable-5-1` (arquitetura e dados, integridade e sincronização, autenticação, notificações) e 13 com `opus-5-5`.
