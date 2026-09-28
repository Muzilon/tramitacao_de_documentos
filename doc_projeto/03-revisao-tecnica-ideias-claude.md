# Revisão Técnica e Análise de Integração (Ideias do Claude)

## 1. Visão Geral das Propostas
As seguintes ideias foram adicionadas em `ideias/` e analisadas para implementação:
1. `2026-09-28_design_feedback-envio-e-acessibilidade.md`: Foca na melhoria da interface, acessibilidade, feedback de submissão de formulários, validações e novos tokens CSS de contraste.
2. `2026-09-28_funcao_painel-indicadores-sgi.md`: Propõe um novo módulo para gestão e exibição de Indicadores do SGI, separado da tramitação de documentos, com novas páginas (visão pública e gestão), gráficos e integração via fluxos.
3. `2026-09-28_problema_integridade-sincronizacao.md`: Apresenta uma solução arquitetural crítica para a divergência de dados entre o frontend e a planilha do SharePoint, introduzindo IDs estáveis, fila de envios pendentes e merge de modificações.

## 2. Análise da Base de Código Atual e Conexão das Propostas
A arquitetura atual do sistema (em arquivos como `formulario.html`, `formulario.js`, `planner.html/js`, `data-service.js`, `auth-service.js` e `formulario.css`) baseia-se em armazenamento local sincronizado pontualmente via webhooks do Power Automate. 
- O frontend envia atualizações e reescreve o estado local frequentemente pela função `buscarDadosDoPowerAutomate`, o que tem gerado conflitos graves com perda de tracking e falhas silenciosas. A **Ideia 3** aborda especificamente essas falhas na fundação do serviço de dados.
- A estilização atual e a acessibilidade, como o feedback de forms ocultos de upload, dependem de validações HTML5 padrão bloqueadas em componentes customizados (ex: `hidden-file-input`). A **Ideia 1** moderniza isso (novos tokens de CSS e classes), resolvendo falhas de contraste (ex: botões pêssego/branco) e melhorando o feedback do usuário diretamente no DOM sem quebrar o layout *pill*.
- O SGI requer visões autônomas. Criar isso dentro das telas do DocFlow seria uma má prática e pesaria a aplicação. A **Ideia 2** respeita a arquitetura e conecta-se via novo módulo (`indicadores.html/js`), consumindo a infra de autenticação do `auth-service.js` de forma modular, o que é sustentável.

## 3. Análise Crítica de Integração por Ideia

### Ideia 1: Feedback do Envio e Acessibilidade (Design)
- **Resumo do Objetivo:** Aprimorar feedback visual e acessibilidade (WCAG 2.1) com novas cores de contraste, foco via teclado, suporte a redução de movimentos, além de evitar a limpeza do formulário em caso de falha de conexão.
- **Impacto na Arquitetura:** 
  - *Visual e Estrutural:* Adição de tokens em `paleta.css` e novas classes CSS (ex: `pill-dropzone`, `is-erro`).
  - *Manipulação DOM:* `formulario.js` precisará prevenir `reset()` até que haja confirmação do `data-service.js`. Ocultação do input file requer uma abordagem via técnica visual acessível, não `display: none`.
- **Riscos e Pontos de Atenção:** A remoção do comportamento nativo de balões do navegador exigirá uma rotina robusta de validação via JS para evitar envio de forms com bugs. O uso do contorno de foco global (`:focus-visible`) não deve quebrar contêineres e sidebars.
- **Avaliação:** **Aprovada integralmente.** Elevada qualidade técnica, focada no usuário e baixo risco arquitetural com grande valor.
- **Estratégia de Implementação:**
  - **css_specialist:** Criar os tokens `paleta.css` e classes em `formulario.css`, e suportar `prefers-reduced-motion`.
  - **html_specialist:** Adicionar a área dropzone e nós HTML para renderização das mensagens inline no `formulario.html` e Kanban (`index.html`).
  - **js_specialist:** Implementar rotinas de navegação por teclado (`planner.js`) e interceptação de validação personalizada.

### Ideia 2: Painel de Indicadores do SGI
- **Resumo do Objetivo:** Novo módulo autônomo e visual (dashboard e admin) para substituir as planilhas manuais dos KPIs de Qualidade, Saúde Ocupacional e Segurança, integrado por novos webhooks.
- **Impacto na Arquitetura:**
  - *Dados/Integrações:* Criação de um ambiente separado (`indicadores-service.js`, `indicadores.js`, `indicadores-gestao.js`) consumindo dados independentes com SheetJS e Chart.js por CDN.
- **Riscos e Pontos de Atenção:**
  - *Volume LocalStorage:* Cacheamento intensivo de gráficos e histórico pode estourar cotas de `localStorage`.
  - *Segurança:* Como os webhooks ficam no client-side, e as regras dependem unicamente da checagem em `auth-service.js`, usuários mal-intencionados poderiam forjar chamadas HTTP. A evolução para SharePoint Lists (Fase 2) é fundamental.
- **Avaliação:** **Aprovada com ressalvas.** O MVP em fluxos via Power Automate atende a urgência, mas as brechas de acesso sem login Microsoft requerem atenção extra nas validações do backend.
- **Estratégia de Implementação:**
  - **html_specialist & css_specialist:** Estruturar `indicadores.html` e css próprio baseando-se nos tokens globais para responsividade.
  - **js_specialist:** Criar scripts autônomos para lógicas Chart.js e cálculo de farol de performance (tendências).
  - **integration_specialist:** Construir as integrações HTTP e isolar chamadas usando `indicadores-service.js`.

### Ideia 3: Integridade de Dados e Sincronização
- **Resumo do Objetivo:** Criar um modelo de integridade forte adotando IDs estáveis por documento, fila de submissões (`docflow_fila_envios`) assíncrona, e política de "merge por tempo" em vez de substituição total para salvar dados em falhas de rede.
- **Impacto na Arquitetura:**
  - *Estrutural e Dados:* Intervenção severa no core `data-service.js`. A lógica de identificação por posições do array no `planner.js` muda obrigatoriamente para IDs.
  - *Integração:* Introdução do fluxo HTTP `URL_WEBHOOK_UPDATE_STATUS`, com o modelo de enfileiramento antes da execução assíncrona.
- **Riscos e Pontos de Atenção:** A transição de base de código legada que possuía IDs atrelados ao código/título precisará de testes regressivos densos para garantir compatibilidade retroativa, impedindo a perca dos rastreamentos atuais. Desativar chaves locais repentinamente pode provocar um descarte involuntário caso haja filas locais.
- **Avaliação:** **Aprovada integralmente (Prioridade Máxima).** Resolve o débito técnico mais perigoso do projeto atualmente.
- **Estratégia de Implementação:**
  - **integration_specialist:** Liderar e refatorar `data-service.js` para adicionar fila local, algoritmo de merge usando `dataModificacao`, e ID Generator persistente, abolindo chave `docflow_modificacoes_locais`.
  - **js_specialist:** Adaptar as interações em `planner.js` para agir através de UUIDs nas buscas de array no "Desfazer" e drag-and-drop, eliminando índices, e coordenar os toasts de erros na UI.
