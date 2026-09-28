# Ideias do DocFlow

Esta pasta guarda as ideias propostas para o DocFlow que ainda **não foram implantadas**. Cada ideia é um arquivo `.md` independente, guardado na pasta do seu tipo dentro de [`modelos/`](modelos/). O primeiro arquivo de cada pasta, `00_instrucoes.md`, explica como escrever aquele tipo de ideia e traz o modelo em branco.

```
ideias/
  README.md
  modelos/
    modelo_design/     00_instrucoes.md + ideias de design
    modelo_funcao/     00_instrucoes.md + ideias de função
    modelo_problema/   00_instrucoes.md + ideias de problema
ideias_implantadas/
  modelos/             mesma estrutura, para receber as ideias implantadas
```

Para entender o produto e quem decide, leia antes a [documentação do projeto](../doc_projeto/README.md) e o [perfil do administrador](../doc_projeto/05-perfil-do-administrador.md).

---

## 1. Fluxo de trabalho

| Etapa | Quem faz | O que acontece | Status no cabeçalho |
|-------|----------|----------------|---------------------|
| 1. Proposta | Claude (estrategista, consultor de SaaS e designer) | Escreve a ideia a partir do modelo do tipo certo e a registra na tabela-índice abaixo. | Rascunho |
| 2. Revisão | Eric (dono do produto) | Lê, pede ajustes se precisar e aprova ou descarta. | Aprovada ou Descartada |
| 3. Implementação | Antigravity (IA que codifica) | Implementa seguindo o documento, principalmente a seção "Instruções para o Antigravity". | Em desenvolvimento |
| 4. Validação | Eric | Testa no sistema e confirma que os critérios de aceite foram cumpridos. | Implantada |
| 5. Arquivamento | Antigravity, Claude ou Eric | Preenche "Resultado da implantação" e move o arquivo para a mesma pasta de tipo em [`ideias_implantadas/modelos/`](../ideias_implantadas/modelos/). | Implantada |

Regras gerais:

- Só o Eric muda o status para **Aprovada**. O Antigravity só trabalha em ideias aprovadas.
- Se algo mudar durante a implementação, o documento da ideia é atualizado antes (ou junto) da mudança, para continuar sendo a fonte da verdade.
- Uma ideia por arquivo. Se a ideia crescer demais, divida em arquivos menores.

---

## 2. Tipos de ideia

| Pasta | Quando usar | Instruções e modelo |
|-------|-------------|---------------------|
| `modelos/modelo_problema/` | Algo que hoje não funciona bem, gera erro, retrabalho ou confusão. | [00_instrucoes.md](modelos/modelo_problema/00_instrucoes.md) |
| `modelos/modelo_funcao/` | Funcionalidade nova ou ampliação relevante de uma existente. | [00_instrucoes.md](modelos/modelo_funcao/00_instrucoes.md) |
| `modelos/modelo_design/` | Mudança de interface, layout, componentes, cores ou textos da tela. | [00_instrucoes.md](modelos/modelo_design/00_instrucoes.md) |

---

## 3. Nome do arquivo

Formato: `AAAA-MM-DD_titulo-curto.md`, salvo na pasta do tipo. O tipo não entra no nome, porque a pasta já diz qual é.

- `AAAA-MM-DD`: data em que a ideia foi criada.
- `titulo-curto`: poucas palavras, minúsculas, sem acentos, separadas por hífen.

Exemplos:

- `modelos/modelo_problema/2026-09-28_sincronizacao-duplicada.md`
- `modelos/modelo_funcao/2026-10-02_alerta-de-prazo-por-email.md`
- `modelos/modelo_design/2026-10-05_cartoes-do-kanban.md`

---

## 4. Status

| Status | Significado |
|--------|-------------|
| Rascunho | Em escrita ou aguardando revisão do Eric. |
| Aprovada | Eric aprovou; pronta para o Antigravity. |
| Em desenvolvimento | O Antigravity está implementando. |
| Implantada | Implementada e validada pelo Eric; pronta para ir para `ideias_implantadas/`. |
| Descartada | Não será feita. Registre o motivo no próprio arquivo e mantenha-o aqui (ou apague, a critério do Eric). |

---

## 5. Prioridade

| Prioridade | Quando usar |
|------------|-------------|
| Alta | Bloqueia o trabalho, causa perda ou erro de dados, afeta a conformidade do SGI ou atinge muitos usuários todos os dias. |
| Média | Gera retrabalho ou lentidão frequente, mas existe um contorno aceitável. |
| Baixa | Melhoria de conforto, estética ou algo raro; pode esperar. |

Como decidir: pergunte (1) quantas pessoas são afetadas, (2) com que frequência, (3) qual o risco para a conformidade e para os dados e (4) quanto esforço custa. Muito impacto com pouco esforço sobe a prioridade; pouco impacto com muito esforço desce. Em caso de dúvida, o Eric decide.

---

## 6. Quando mover para `ideias_implantadas/`

Mova o arquivo somente quando **todas** as condições forem verdadeiras:

1. O Antigravity concluiu a implementação.
2. O Eric validou no sistema e todos os critérios de aceite foram atendidos.
3. O status no cabeçalho está como **Implantada**.
4. A seção "Resultado da implantação", no fim do arquivo, foi preenchida.

Ao mover, mantenha o nome do arquivo e a pasta de tipo. Por exemplo, `ideias/modelos/modelo_funcao/X.md` vai para `ideias_implantadas/modelos/modelo_funcao/X.md`. Retire a linha da tabela abaixo e adicione-a na tabela de [`ideias_implantadas/README.md`](../ideias_implantadas/README.md).

---

## 7. Índice de ideias

| Data | Tipo | Título | Prioridade | Status |
|------|------|--------|------------|--------|
| | | | | |

As três primeiras ideias (integridade da sincronização, feedback de envio e acessibilidade, painel de indicadores do SGI) já foram implantadas e estão listadas em [`ideias_implantadas/README.md`](../ideias_implantadas/README.md).
