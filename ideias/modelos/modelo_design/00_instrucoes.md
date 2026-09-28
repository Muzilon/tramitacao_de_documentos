# Instruções: ideias do tipo Design

## Para que serve

Use esta pasta para propor mudanças de **interface**: layout, componentes, cores, tipografia, estados de tela, textos (microcopy), responsividade e acessibilidade.

Exemplos:
- Mensagens de sucesso e erro ao enviar o cadastro.
- Tela "Minha fila".
- Layout para celular.
- Portal do SGI.

Se a mudança exige regra de negócio ou dados novos, use `modelo_funcao/`. Se é um defeito, use `modelo_problema/`.

## Nome do arquivo

`AAAA-MM-DD_titulo-curto.md`: data de criação e título em minúsculas, sem acentos, com palavras separadas por hífen. O tipo não entra no nome, porque a pasta já diz qual é.

Exemplo: `2026-09-28_feedback-envio-e-acessibilidade.md`

## Como preencher

1. Copie o modelo em branco abaixo para um arquivo novo nesta pasta.
2. **Cabeçalho:** Status começa como Rascunho. Defina a prioridade e as telas afetadas.
3. **Objetivo e situação atual:** o que incomoda hoje, com capturas de tela se possível.
4. **Proposta:**
   - **Layout:** esboço em texto ou imagem.
   - **Componentes:** reaproveite os do [guia de design](../../../doc_projeto/04-design.md).
   - **Estados:** padrão, foco, carregando, vazio, erro e sucesso.
   - **Microcopy:** os textos exatos.
5. **Paleta e tokens:** cite os tokens pelo nome. Não use cores soltas. Se precisar de cor nova, justifique e informe o contraste.
6. **Responsivo e tema escuro:** comportamento em 360px, 768px e 1024px, e aparência no tema escuro.
7. **Acessibilidade:** contraste mínimo de 4,5:1 para texto (3:1 para elementos grandes), foco visível, uso pelo teclado e rótulos para leitor de tela.
8. **Critérios de aceite visuais:** verificáveis a olho ou com uma ferramenta de contraste.
9. Registre a ideia no índice do [README de ideias](../../README.md).

## Status e prioridade

- **Status:** Rascunho → Aprovada (só o Eric aprova) → Em desenvolvimento → Implantada, ou Descartada.
- **Prioridade:** Alta, Média ou Baixa, conforme o README de ideias. Problemas de acessibilidade que impedem o uso sobem a prioridade.

## Movimentação

Depois que a ideia for implementada e validada pelo Eric:
1. Mude o status para **Implantada** e preencha "Resultado da implantação".
2. Mova o arquivo para `ideias_implantadas/modelos/modelo_design/`, mantendo o mesmo nome.
3. Atualize os índices dos dois READMEs.
4. Se tokens ou componentes mudaram, atualize também o `doc_projeto/04-design.md`.

## Regras para o Antigravity

**Deve:**
- Trabalhar só em ideias com status **Aprovada**.
- Mudar o status para **Em desenvolvimento** ao começar.
- Usar os tokens de `paleta.css`, criando tokens novos só quando o documento pedir.
- Testar no tema claro, no tema escuro e em tela de celular.
- Usar exatamente a microcopy definida no documento.

**Não deve:**
- Mudar regras de negócio ou o fluxo de dados numa ideia de design.
- Usar cores soltas em vez de tokens.
- Remover o foco visível ou reduzir o contraste abaixo do definido.
- Marcar a ideia como Implantada sem a validação do Eric.

---

<!-- ===== MODELO EM BRANCO: copie a partir daqui ===== -->

# [Título da proposta de interface]

| Campo | Valor |
|-------|-------|
| Tipo | Proposta de interface/design |
| Status | Rascunho |
| Prioridade | Alta / Média / Baixa |
| Data | AAAA-MM-DD |
| Autor | Claude |
| Telas afetadas | Ex.: Login, Painel (Kanban), Novo Documento |

---

## 1. Objetivo da mudança

<!-- Que problema de uso ou percepção a mudança resolve, em uma ou duas frases. -->

## 2. Situação atual

<!-- Como a tela está hoje. Anexe capturas de tela, se possível, e aponte o que incomoda. -->

## 3. Proposta

### 3.1 Layout

### 3.2 Componentes

<!-- Reaproveite o catálogo de componentes do 04-design.md; só crie componente novo se necessário. -->

### 3.3 Estados

<!-- Padrão, passar o mouse, foco, ativo, desabilitado, carregando, vazio, erro, sucesso. -->

### 3.4 Microcopy

| Local | Texto atual | Texto proposto |
|-------|-------------|----------------|
| | | |

## 4. Paleta e tokens

<!-- Cite as cores e os tokens do doc_projeto/04-design.md pelo nome. Não invente cores soltas. -->

## 5. Responsivo e tema escuro

<!-- Comportamento em 360px, 768px e 1024px e aparência no tema escuro. -->

## 6. Acessibilidade

<!-- Contraste mínimo, navegação por teclado, foco visível, rótulos para leitor de tela, área de clique mínima de 44px. -->

## 7. Critérios de aceite visuais

- [ ] Funciona no tema claro e no escuro.
- [ ] Funciona em tela de celular sem rolagem horizontal.
- [ ]

---

## Instruções para o Antigravity

<!-- Bloco objetivo. O Antigravity deve conseguir trabalhar lendo só esta seção, a proposta e os critérios de aceite. -->

- **O que implementar:**
- **Onde (telas e arquivos):**
- **O que não alterar:**
- **Como testar:**

---

## Resultado da implantação

<!-- Preencher ao mover para ideias_implantadas/modelos/modelo_design/. -->

- **Data da implantação:**
- **Validado por:** Eric
- **O que foi feito:**
- **Diferenças em relação à proposta:**
- **Observações e pendências:**
