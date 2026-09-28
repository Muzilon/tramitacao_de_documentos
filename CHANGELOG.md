# Histórico de mudanças do DocFlow

Registro cronológico do que foi feito no projeto, para consulta rápida sem precisar ler o histórico do Git. Cada entrada aponta para o documento correspondente, quando existir.

Formato da data: AAAA-MM-DD.

## 2026-09-28

- **Documentação do projeto criada.** Cinco documentos em [`doc_projeto/`](doc_projeto/): objetivo do projeto, estrutura do código, guia de preenchimento para usuários, guia de design e perfil do administrador.
- **Pipeline de ideias criado.** Estrutura em [`ideias/`](ideias/) e [`ideias_implantadas/`](ideias_implantadas/), com um modelo para cada tipo de ideia (problema, função, design).
- **Três ideias implantadas**, em etapas, no aplicativo original (HTML, CSS e JavaScript puros):
  - [Integridade da sincronização](ideias_implantadas/modelos/modelo_problema/2026-09-28_integridade-sincronizacao.md): identificação estável por ID, fila de envios com nova tentativa automática, mesclagem de dados por data de modificação e histórico acumulativo.
  - [Feedback de envio e acessibilidade](ideias_implantadas/modelos/modelo_design/2026-09-28_feedback-envio-e-acessibilidade.md): estados visuais de envio, validação inline, contraste corrigido nos botões principais e navegação por teclado.
  - [Painel de indicadores do SGI](ideias_implantadas/modelos/modelo_funcao/2026-09-28_painel-indicadores-sgi.md): um primeiro módulo de indicadores, em formato de modal, com gráficos.
- **Onze novas ideias escritas e aprovadas**, aguardando implementação: login com conta Microsoft, controle de validade dos documentos, matriz de treinamentos, notificações por e-mail e Teams, lista mestra de documentos, não conformidades e planos de ação, minha fila, portal do SGI, layout para celular, painel de auditoria e busca global. Veja o índice em [`ideias/README.md`](ideias/README.md).
- **Tentativa de migração para TypeScript, feita e revertida no mesmo dia.** O Antigravity reescreveu o projeto em React, TypeScript, Vite e Tailwind, mas a nova versão ficou incompleta (sem login, sem formulário de cadastro, com o mesmo problema de segurança de antes). A versão original foi restaurada a partir do histórico do Git. Detalhes em [`doc_projeto/08-historico-tentativa-typescript.md`](doc_projeto/08-historico-tentativa-typescript.md).

## Como manter este arquivo

Toda mudança relevante no sistema — uma ideia implantada, uma migração de tecnologia, uma correção grande — ganha uma linha nova aqui, na data em que aconteceu, com um link para o documento que a descreve em detalhe. Isso vale tanto para o Claude quanto para o Antigravity.
