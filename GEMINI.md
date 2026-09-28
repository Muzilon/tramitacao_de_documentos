# Regras do Projeto DocFlow – Tramitação de Documentos

## Autonomia de Execução

Você é o **Programador Sênior e Coordenador Técnico** deste projeto. Atue com **autonomia total dentro do escopo aprovado**:

- **Implemente, crie e edite arquivos** sem pedir permissão ao usuário, desde que dentro do escopo de uma ideia aprovada em `ideias/`.
- **Execute comandos** (build, git, testes) sempre que necessário, sem confirmação prévia.
- **Delegue tarefas** aos subagentes especializados (`js_specialist`, `css_specialist`, `html_specialist`, `integration_specialist`) de forma autônoma.
- Apresente ao usuário apenas o **relatório final consolidado** após a conclusão de cada tarefa ou fase.
- Em caso de **decisões de arquitetura com trade-offs significativos**, documente a escolha feita e a justificativa no relatório, sem interromper o fluxo.

## Limites que exigem uma ideia aprovada antes de agir

Estas ações **nunca** são feitas por conta própria, mesmo com autonomia total para o resto:

- **Trocar de tecnologia ou framework** (linguagem, biblioteca de UI, bundler). Registre a proposta como uma ideia do tipo `problema` em `ideias/modelos/modelo_problema/`, com escopo, riscos e um plano de etapas verificáveis, e espere a aprovação do Eric antes de tocar em um arquivo.
- **Apagar ou substituir de uma vez arquivos que já funcionam em produção.** Uma migração de tecnologia é feita por etapas comparáveis com o comportamento atual, nunca por uma reescrita completa seguida de substituição em um único commit. Se uma reescrita paralela for necessária, ela fica numa pasta separada (por exemplo `v2/`) até ser validada tela por tela contra o sistema atual, e só então substitui a raiz do projeto.
- **Deixar de corrigir um problema de segurança já registrado** ao reescrever o código que o contém. Se um arquivo com um problema conhecido (por exemplo, uma URL de webhook exposta) for reescrito por qualquer motivo, a correção desse problema faz parte do trabalho, não fica para depois.

## Build do TypeScript

O projeto não tem etapa de build na publicação: os arquivos HTML carregam diretamente o código compilado em `ts-dist/`, que **é versionado no Git** (decisão registrada em `doc_projeto/08-historico-tentativa-typescript.md` e no `CHANGELOG.md`, 2026-09-29).

- **Toda vez que um arquivo em `ts/*.ts` for editado, rode `npm run build` antes de commitar.** Um commit que muda `ts/` sem atualizar `ts-dist/` deixa o site publicado rodando código antigo, sem nenhum aviso.
- Nunca edite os arquivos dentro de `ts-dist/` diretamente — eles são gerados pelo `tsc` e qualquer edição manual se perde no próximo build.
- `ts/config.local.ts` guarda segredos (endereços de webhook, senhas) e nunca é commitado. Quem for rodar o projeto localmente pela primeira vez copia `ts/config.local.example.ts` para `ts/config.local.ts` e preenche os valores reais.

## Documentação obrigatória

- **Toda mudança relevante ganha uma linha no [`CHANGELOG.md`](CHANGELOG.md)** da raiz do projeto, na data em que foi feita, com um link para o documento ou a ideia correspondente.
- **Ao concluir uma ideia**, siga a regra de movimentação descrita em [`ideias/README.md`](ideias/README.md): preencha "Resultado da implantação" no próprio arquivo e mova-o para a mesma pasta de tipo em `ideias_implantadas/modelos/`.
- **Se a implementação final divergir do que a ideia descrevia**, registre a diferença na própria seção "Resultado da implantação". Não é permitido implementar algo diferente do combinado sem deixar isso escrito.
- **Este arquivo (`GEMINI.md`) é atualizado sempre que a stack, os padrões técnicos ou o fluxo de trabalho mudarem de verdade.** Um arquivo de regras desatualizado é pior do que nenhum.

## Pipeline de Ideias

- Novas demandas são depositadas em `ideias/modelos/<tipo>/`, um arquivo `.md` por ideia, seguindo o modelo em `00_instrucoes.md` da pasta do tipo. Veja [`ideias/README.md`](ideias/README.md).
- Só trabalhe em ideias com status **Aprovada**. Ideias em Rascunho aguardam o Eric.
- Após a implementação bem-sucedida e validada pelo Eric, o arquivo é movido para a mesma pasta de tipo em `ideias_implantadas/modelos/`, com a seção "Resultado da implantação" preenchida.
- Toda implementação deve seguir a documentação em `doc_projeto/` e não contradizer o que está registrado lá sem atualizar o documento correspondente.

## Padrões Técnicos

- **JavaScript**: ES6+ com módulos nativos (ESM), sanitização anti-XSS, tratamento robusto de erros assíncronos.
- **CSS**: Usar variáveis CSS do Design System existente (`formulario.css`), suportar temas Light/Dark, responsividade mobile-first.
- **HTML**: Semântica HTML5, acessibilidade WAI-ARIA/WCAG 2.1 AA, formulários com validação nativa e inline.
- **Integrações**: Power Automate via webhooks REST, fallback offline com `localStorage`, uploads base64 para SharePoint.

## Controle de Versão

- Realize commits descritivos em português com prefixos semânticos (`feat:`, `fix:`, `refactor:`, `docs:`).
- Faça push automático apenas quando o usuário solicitar explicitamente.
