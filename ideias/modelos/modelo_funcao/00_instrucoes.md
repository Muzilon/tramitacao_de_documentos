# Instruções: ideias do tipo Função

## Para que serve

Use esta pasta para propor uma **funcionalidade nova** ou uma **ampliação relevante** de algo que já existe no DocFlow.

Exemplos:
- Painel de indicadores do SGI.
- Controle de validade dos documentos.
- Matriz de treinamentos.
- Notificações por e-mail ou Teams.

Se algo existente está com defeito, use `modelo_problema/`. Se a mudança é só visual, use `modelo_design/`.

## Nome do arquivo

`AAAA-MM-DD_titulo-curto.md`: data de criação e título em minúsculas, sem acentos, com palavras separadas por hífen. O tipo não entra no nome, porque a pasta já diz qual é.

Exemplo: `2026-09-28_painel-indicadores-sgi.md`

## Como preencher

1. Copie o modelo em branco abaixo para um arquivo novo nesta pasta.
2. **Cabeçalho:** Status começa como Rascunho. Defina a prioridade e as telas afetadas (inclusive telas novas).
3. **Contexto e oportunidade:** que dor do SGI ou do Eric a funcionalidade resolve. Ligue aos objetivos do [perfil do administrador](../../../doc_projeto/05-perfil-do-administrador.md).
4. **Usuário e cenário:** uma história de usuário e um cenário real do dia a dia.
5. **Descrição e fluxo:** em linguagem de usuário, do ponto de entrada ao resultado, incluindo o que acontece em caso de erro.
6. **Regras de negócio:** numeradas (RN1, RN2...). Inclua permissões por perfil, validações e prazos.
7. **Dados envolvidos:** campos, origem e onde ficam guardados (navegador, planilha ou SharePoint), e o impacto no Power Automate.
8. **Critérios de aceite e fora do escopo:** deixe explícito o que não entra, para a ideia não crescer durante a implementação.
9. **Métricas de sucesso:** como saber, depois de implantada, que valeu a pena.
10. Em funcionalidades grandes, **separe o MVP das fases seguintes**. As "Instruções para o Antigravity" cobrem só o MVP.
11. Registre a ideia no índice do [README de ideias](../../README.md).

## Status e prioridade

- **Status:** Rascunho → Aprovada (só o Eric aprova) → Em desenvolvimento → Implantada, ou Descartada.
- **Prioridade:** Alta, Média ou Baixa, conforme o README de ideias.
- Se a ideia depender de outra, cite a dependência no Contexto.

## Movimentação

Depois que a ideia for implementada e validada pelo Eric:
1. Mude o status para **Implantada** e preencha "Resultado da implantação".
2. Mova o arquivo para `ideias_implantadas/modelos/modelo_funcao/`, mantendo o mesmo nome.
3. Atualize os índices dos dois READMEs.

Se só o MVP foi entregue, registre as fases restantes como uma nova ideia nesta pasta antes de mover o arquivo.

## Regras para o Antigravity

**Deve:**
- Trabalhar só em ideias com status **Aprovada**.
- Mudar o status para **Em desenvolvimento** ao começar.
- Implementar apenas o escopo do MVP descrito.
- Seguir o design existente (paleta e componentes do `04-design.md`).
- Atualizar o documento se algo mudar durante a implementação.

**Não deve:**
- Implementar o que está em "Fora do escopo".
- Criar dependências novas (bibliotecas, fluxos) que não estejam previstas no documento.
- Colocar URLs de webhook ou senhas em documentos.
- Marcar a ideia como Implantada sem a validação do Eric.

---

<!-- ===== MODELO EM BRANCO: copie a partir daqui ===== -->

# [Nome da funcionalidade]

| Campo | Valor |
|-------|-------|
| Tipo | Nova funcionalidade |
| Status | Rascunho |
| Prioridade | Alta / Média / Baixa |
| Data | AAAA-MM-DD |
| Autor | Claude |
| Telas afetadas | Ex.: Painel (Kanban), Novo Documento, Revisão Técnica |

---

## 1. Contexto e oportunidade

<!-- Por que agora? Que dor do SGI ou do administrador isso resolve? -->

## 2. Usuário e cenário de uso

> Como **[perfil]**, quero **[ação]** para **[benefício]**.

**Cenário:**

## 3. Descrição da funcionalidade

<!-- O que a funcionalidade faz, em linguagem de usuário. -->

## 4. Fluxo passo a passo

<!-- Do ponto de entrada até o resultado final, incluindo caminhos de erro. -->

1.
2.
3.

## 5. Regras de negócio

<!-- Permissões por perfil, validações, mudanças de status, prazos, notificações. -->

- RN1:
- RN2:

## 6. Dados envolvidos

<!-- Campos novos ou alterados, onde são guardados e impacto na sincronização com o Power Automate. -->

| Dado | Origem | Obrigatório | Observação |
|------|--------|-------------|------------|
| | | | |

## 7. Critérios de aceite

- [ ]
- [ ]

## 8. Fora do escopo

<!-- O que esta ideia deliberadamente não cobre. -->

## 9. Métricas de sucesso

<!-- Como saber, depois de implantada, que valeu a pena (tempo, volume, erros, adesão). -->

---

## Instruções para o Antigravity

<!-- Bloco objetivo. O Antigravity deve conseguir trabalhar lendo só esta seção, as regras de negócio e os critérios de aceite. -->

- **O que implementar:**
- **Onde (telas e arquivos):**
- **O que não alterar:**
- **Como testar:**

---

## Resultado da implantação

<!-- Preencher ao mover para ideias_implantadas/modelos/modelo_funcao/. -->

- **Data da implantação:**
- **Validado por:** Eric
- **O que foi feito:**
- **Diferenças em relação à proposta:**
- **Observações e pendências:**
