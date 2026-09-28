# Histórico: tentativa de migração para TypeScript (revertida)

Este documento registra, para memória do projeto, uma migração de tecnologia que foi tentada, avaliada e desfeita em 28 de setembro de 2026. Ele existe para que ninguém repita o mesmo caminho sem saber o que já aconteceu.

## O que aconteceu, em ordem

1. O DocFlow, em HTML, CSS e JavaScript puros, recebeu com sucesso as três primeiras ideias aprovadas do pipeline: a integridade da sincronização, o feedback de envio e acessibilidade, e o painel de indicadores do SGI. As três foram implementadas em etapas, documentadas e movidas para `ideias_implantadas/`.
2. O Eric pediu ao Antigravity para migrar o projeto para TypeScript, porque a linguagem sem tipos estava dificultando a evolução do sistema.
3. O Antigravity criou uma pasta `v2/` com um projeto novo: Vite, React 19, TypeScript e Tailwind CSS.
4. Depois de alguns commits dentro de `v2/`, o Antigravity substituiu os arquivos da raiz do projeto pelos da `v2/`, apagando de uma vez os arquivos originais: `login.html`, `formulario.html`, `planner.html`, `auth-service.js`, `data-service.js`, `formulario.js`, `planner.js`, `sidebar.js`, `paleta.css` e `formulario.css`. Ao todo, mais de 12 mil linhas de código validado foram removidas em um único commit.
5. O Claude revisou o resultado dessa migração a pedido do Eric e encontrou uma lista de problemas graves (detalhada abaixo). A conclusão foi que a versão em TypeScript era, na prática, um protótipo incompleto e não funcional, muito atrás da versão que substituiu.
6. Como o repositório usa Git, nada foi perdido de fato: o Claude recuperou os arquivos originais do histórico de commits (do commit anterior à substituição) e os restaurou na raiz do projeto. A tentativa em TypeScript foi movida para a pasta `_arquivo_tentativa_typescript/`, para consulta futura, e não foi apagada.

## Por que a versão em TypeScript foi considerada inadequada

- **O mesmo risco de segurança que já era conhecido continuava exposto.** As URLs dos fluxos do Power Automate, com suas assinaturas, estavam copiadas em texto puro dentro do código-fonte novo, exatamente como no problema já registrado e priorizado como crítico.
- **Não havia tela de login.** O aplicativo abria direto no painel, sem nenhuma autenticação, e o código ainda tentava redirecionar para um arquivo `login.html` que não existia mais nesse projeto.
- **Não havia formulário de cadastro de documento.** Existia apenas um componente de arrastar-e-soltar de arquivos, sem campos e sem ligação com o restante do sistema.
- **O quadro Kanban tinha só 4 colunas fixas no código**, contra as 5 colunas e os 11 status do sistema original.
- **A navegação da barra lateral era decorativa** (links sem destino), porque não havia nenhuma biblioteca de rotas instalada.
- **O responsável por uma ação ficava fixo no código** (um valor de exemplo), já que não existia autenticação para saber quem estava usando o sistema.
- **O arquivo de regras do próprio Antigravity (`GEMINI.md`) não foi atualizado** para refletir a mudança de tecnologia, o que sugere que a decisão de reescrever tudo não seguiu um planejamento documentado.

## O que foi preservado

- Todo o código da tentativa em TypeScript está em [`_arquivo_tentativa_typescript/`](../_arquivo_tentativa_typescript/), incluindo o código-fonte, os arquivos de configuração e o `package.json`. As pastas geradas (`node_modules` e `dist`) ficam fora do controle de versão.
- Todo o histórico continua disponível pelos commits do Git, incluindo os commits intermediários da `v2/` e o commit que fez a substituição.
- As ideias já aprovadas e implantadas (`ideias_implantadas/`) não foram afetadas; elas descrevem corretamente o que foi implementado na versão original, que é a versão restaurada.

## Situação atual

O projeto voltou a rodar em HTML, CSS e JavaScript puros, no estado exatamente anterior à substituição, com as três ideias já implantadas presentes e funcionando. Uma eventual nova tentativa de migração de tecnologia deve:

1. Ser registrada como uma ideia no pipeline (`ideias/`), com escopo, riscos e um plano de etapas verificáveis — como já foi feito para a ideia [Login com conta Microsoft](../ideias/modelos/modelo_problema/2026-09-28_login-microsoft.md), por exemplo.
2. Corrigir os problemas de segurança já conhecidos como parte do escopo, não deixá-los para depois.
3. Ser validada por etapas, comparando cada tela nova com o comportamento da tela antiga, em vez de uma substituição única de todos os arquivos de uma vez.
