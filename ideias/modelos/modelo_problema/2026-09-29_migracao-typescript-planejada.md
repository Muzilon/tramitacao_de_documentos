# Migração para TypeScript, planejada e por etapas

| Campo | Valor |
|-------|-------|
| Tipo | Resolução de problema |
| Status | Aprovada |
| Prioridade | Média |
| Data | 2026-09-29 |
| Autor | Claude |
| Telas afetadas | Todas |

---

## 1. Problema observado

O JavaScript sem tipos do DocFlow dificulta a evolução do sistema: erros que um compilador pegaria de imediato só aparecem em uso real, e refatorações grandes (como as 11 ideias novas do pipeline) ficam mais arriscadas de fazer com segurança.

Uma primeira tentativa de resolver isso, feita em 28/09/2026, substituiu o projeto inteiro por uma reescrita em React e TypeScript num único commit. O resultado ficou muito atrás do sistema original: sem tela de login, sem formulário de cadastro, com só 4 das 11 situações de status e com o mesmo problema de segurança do endereço do webhook exposto. Essa tentativa foi desfeita; os detalhes estão em [`doc_projeto/08-historico-tentativa-typescript.md`](../../../doc_projeto/08-historico-tentativa-typescript.md).

## 2. Impacto

- **Quem é afetado:** o Eric, como único mantenedor do código, e indiretamente todos os usuários, porque um retrabalho grande atrasa as 11 ideias já aprovadas e paradas no pipeline.
- **Frequência:** acontece a cada mudança grande no sistema, enquanto o código continuar sem tipos.
- **Consequência:** sem um plano por etapas, a próxima tentativa de migração corre o mesmo risco de repetir uma reescrita completa e perder funcionalidade.

## 3. Causa provável

A tentativa anterior tentou fazer tudo de uma vez: trocar a linguagem, o framework de UI (para React), o empacotador (para Vite) e o sistema de estilos (para Tailwind) em um único movimento, sem comparar cada tela nova com o comportamento da tela antiga antes de substituir.

## 4. Proposta de solução

Migrar para TypeScript **sem trocar de framework**: manter HTML, CSS e DOM manipulado diretamente (o que já funciona e já foi corrigido nas três ideias implantadas), e usar o TypeScript apenas para compilar os arquivos `.js` de hoje para `.ts`, tipando os dados (documento, histórico, usuário, item da fila de envio) e as funções de `auth-service`, `data-service`, `formulario` e `planner`. O HTML e o CSS não mudam.

Trocar também de framework de UI (para React ou outro) é uma decisão maior, que pode vir depois, como uma ideia própria — não faz parte desta.

### Etapas, cada uma testável isoladamente antes de seguir para a próxima

1. **Preparação:** adicionar TypeScript ao projeto (compilador, configuração, script de build) num branch ou pasta separada, sem tocar nos arquivos que já funcionam.
2. **Tipos primeiro:** escrever as interfaces de `DocumentoSGI`, `HistoricoAcao`, `Usuario` e `FilaEnvio`, a partir do que já existe em `data-service.js` (os campos já usados na prática).
3. **Um módulo por vez, verificado contra o original:** converter `auth-service.js` para `.ts`. Antes de seguir, confirmar que login, logout e proteção de página continuam se comportando exatamente como antes.
4. Repetir o passo 3 para `data-service.js`, depois `sidebar.js`, depois `formulario.js`, depois `planner.js`, sempre nessa ordem (dos módulos com menos dependentes para os com mais).
5. **Só então** trocar `login.html`, `formulario.html`, `planner.html` e `index.html` para carregar os arquivos compilados, testando cada tela na sequência.
6. **Corrigir, não repetir, os problemas conhecidos.** Enquanto o código estiver sendo tocado por essa migração, os achados críticos do [`doc_projeto/README.md`](../../../doc_projeto/README.md) (C1 a C4) devem ser resolvidos como parte do trabalho, não deixados para depois: endereço do webhook fora do código-fonte (variável de ambiente, não commitada), remoção das senhas de teste da tela de login e do código.
7. Em nenhum momento os arquivos antigos são apagados antes de o novo arquivo correspondente ser validado. A troca é arquivo por arquivo, não um commit único de substituição.

## 5. Critérios de aceite

- [ ] O projeto compila TypeScript para JavaScript sem erros de tipo.
- [ ] Login, cadastro de documento, Kanban com as 5 colunas e os 11 status, modal de detalhes com histórico e o painel de indicadores continuam funcionando exatamente como hoje, tela por tela, comparados com a versão em JavaScript puro.
- [ ] Nenhum endereço de webhook nem senha aparece em texto puro no código-fonte versionado.
- [ ] Nenhum arquivo antigo foi apagado antes de o novo arquivo correspondente ser validado pelo Eric.
- [ ] Ao final, o `CHANGELOG.md` tem uma entrada descrevendo a migração e o `GEMINI.md` foi atualizado para descrever a stack real.

## 6. Riscos

- Migrar módulo por módulo é mais lento do que uma reescrita completa, mas é reversível a cada passo: se um módulo convertido quebrar algo, só ele precisa ser revertido, não o projeto inteiro.
- Se, no meio do caminho, a decisão for também trocar de framework de UI, esta ideia deve ser encerrada e uma nova ideia (maior, com o escopo de front-end completo) deve ser escrita antes de continuar.

---

## Instruções para o Antigravity

**Esta ideia está em Rascunho e não deve ser implementada ainda.** Ela existe para registrar um plano, não para autorizar o trabalho. Ela só deve ser implementada depois que o Eric mudar o status para Aprovada.

- **O que implementar:** as etapas da seção 4, em ordem, uma de cada vez, com o Eric validando cada etapa antes da próxima começar.
- **Onde (telas e arquivos):** todo o projeto, seguindo a ordem de módulos da seção 4.
- **O que não alterar:** o framework de UI (continua sem framework, DOM direto), o HTML e o CSS existentes, e a decisão de não apagar um arquivo antigo antes do novo ser validado.
- **Como testar:** comparar cada tela, campo por campo e ação por ação, com o comportamento documentado em [`doc_projeto/03-guia-de-preenchimento.md`](../../../doc_projeto/03-guia-de-preenchimento.md) antes de considerar uma etapa concluída.

---

## Resultado da implantação

<!-- Preencher ao mover para ideias_implantadas/modelos/modelo_problema/. -->

- **Data da implantação:**
- **Validado por:** Eric
- **O que foi feito:**
- **Diferenças em relação à proposta:**
- **Observações e pendências:**
