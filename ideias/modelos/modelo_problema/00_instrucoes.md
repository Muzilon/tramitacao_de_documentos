# Instruções: ideias do tipo Problema

## Para que serve

Use esta pasta para registrar algo que **já existe no DocFlow e não funciona bem**, como um erro, perda de dados, retrabalho, uma regra quebrada ou uma falha de segurança.

Exemplos:
- A mudança de status não chega à planilha do SharePoint.
- O botão de enviar não faz nada quando falta o arquivo principal.
- Há senhas expostas na tela de login.

Se for algo novo, use `modelo_funcao/`. Se for só aparência ou texto de tela, use `modelo_design/`.

## Nome do arquivo

`AAAA-MM-DD_titulo-curto.md`: data de criação e título em minúsculas, sem acentos, com palavras separadas por hífen. O tipo não entra no nome, porque a pasta já diz qual é.

Exemplo: `2026-09-28_integridade-sincronizacao.md`

## Como preencher

1. Copie o modelo em branco abaixo para um arquivo novo nesta pasta.
2. **Cabeçalho:** Status começa como Rascunho. Defina a prioridade pelos critérios do [README de ideias](../../README.md) e liste as telas afetadas.
3. **Problema observado:** descreva só os fatos e os passos para reproduzir. Não entre na solução aqui.
4. **Impacto:** quem sofre, com que frequência e qual o risco para o SGI ou para os dados.
5. **Causa provável:** cite telas, arquivos e funcionalidades pelo nome, sem colar código.
6. **Proposta de solução:** se houver alternativas, indique qual é a recomendada. Se a solução for grande, divida em etapas que possam ser entregues separadamente.
7. **Critérios de aceite:** itens que o Eric consiga verificar e marcar como cumpridos ou não.
8. **Riscos:** dados existentes, efeitos colaterais e o que depende do Power Automate ou da TI.
9. **Instruções para o Antigravity:** um bloco objetivo que baste para implementar.
10. Registre a ideia no índice do [README de ideias](../../README.md).

## Status e prioridade

- **Status:** Rascunho → Aprovada (só o Eric aprova) → Em desenvolvimento → Implantada, ou Descartada.
- **Prioridade:** Alta, Média ou Baixa, conforme o README de ideias.

## Movimentação

Depois que a ideia for implementada e validada pelo Eric:
1. Mude o status para **Implantada** e preencha "Resultado da implantação".
2. Mova o arquivo para `ideias_implantadas/modelos/modelo_problema/`, mantendo o mesmo nome.
3. Tire a linha do índice de `ideias/README.md` e coloque-a no índice de `ideias_implantadas/README.md`.

## Regras para o Antigravity

**Deve:**
- Trabalhar só em ideias com status **Aprovada**.
- Mudar o status para **Em desenvolvimento** ao começar.
- Seguir a seção "Instruções para o Antigravity" e os critérios de aceite.
- Atualizar o documento se algo mudar durante a implementação.
- Preencher "Resultado da implantação" e mover o arquivo depois da validação.

**Não deve:**
- Implementar ideias em Rascunho.
- Alterar o que estiver listado em "O que não alterar".
- Colocar URLs de webhook ou senhas em documentos.
- Marcar a ideia como Implantada sem a validação do Eric.

---

<!-- ===== MODELO EM BRANCO: copie a partir daqui ===== -->

# [Título curto do problema]

| Campo | Valor |
|-------|-------|
| Tipo | Resolução de problema |
| Status | Rascunho |
| Prioridade | Alta / Média / Baixa |
| Data | AAAA-MM-DD |
| Autor | Claude |
| Telas afetadas | Ex.: Login, Painel (Kanban), Novo Documento, Revisão Técnica |

---

## 1. Problema observado

<!-- Descreva o que acontece hoje, de forma factual. Inclua passos para reproduzir, se houver. -->

## 2. Impacto

<!-- Quem sofre (Solicitante, Qualidade, Administrador) e quanto: frequência, tempo perdido, risco para o SGI ou para os dados. -->

- **Quem é afetado:**
- **Frequência:**
- **Consequência:**

## 3. Causa provável

<!-- Hipótese da causa, citando telas, arquivos ou funcionalidades envolvidas. Sem código. -->

## 4. Proposta de solução

<!-- O que deve mudar do ponto de vista do usuário e do sistema. Se houver alternativas, liste e indique a recomendada. -->

## 5. Critérios de aceite

<!-- Condições verificáveis pelo Eric. Cada item deve poder ser marcado como cumprido ou não. -->

- [ ]
- [ ]

## 6. Riscos

<!-- O que pode quebrar, efeitos colaterais, dados existentes que precisam de cuidado. -->

---

## Instruções para o Antigravity

<!-- Bloco objetivo. O Antigravity deve conseguir trabalhar lendo só esta seção e os critérios de aceite. -->

- **O que implementar:**
- **Onde (telas e arquivos):**
- **O que não alterar:**
- **Como testar:**

---

## Resultado da implantação

<!-- Preencher ao mover para ideias_implantadas/modelos/modelo_problema/. -->

- **Data da implantação:**
- **Validado por:** Eric
- **O que foi feito:**
- **Diferenças em relação à proposta:**
- **Observações e pendências:**
