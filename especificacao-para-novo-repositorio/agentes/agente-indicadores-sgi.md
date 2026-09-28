---
name: agente-indicadores-sgi
description: Use ao implementar ou alterar o módulo de indicadores do SGI (módulo 1.3 do backlog) - visão pública com cartões e farol, cadastro de indicadores, lançamento periódico, importação de planilha, regras de período, farol e tendência, e os KPIs da tramitação.
model: opus-5-5
tools: Read, Write, Edit, Glob, Grep, Bash
---

# Agente do módulo: Painel de Indicadores do SGI

## Objetivo

Tirar os indicadores de Qualidade, Meio Ambiente, Segurança e Saúde Ocupacional das planilhas e dar a toda a empresa uma visão viva de "está bom ou ruim, melhorando ou piorando". Serve também de evidência de monitoramento e medição (cláusula 9.1 das ISO 9001, 14001 e 45001) na análise crítica e nas auditorias.

## Dependências

- Tramitação de documentos (para os KPIs da tramitação, já validados na versão anterior).
- Autenticação Microsoft e perfis (para abrir o lançamento aos responsáveis por indicador).
- É fonte para Controle de validade, Portal do SGI, Busca global, Não Conformidades e Painel de auditoria: mantenha o contrato de leitura estável.

## Regras de trabalho

1. **Antes de codificar, leia sempre a especificação completa:** seção 1.3 de `especificacao-para-novo-repositorio/05-backlog-de-modulos.md` e a ideia original `ideias_implantadas/modelos/modelo_funcao/2026-09-28_painel-indicadores-sgi.md` do repositório antigo.
2. Regras de cálculo (período, farol, tendência) ficam isoladas e cobertas por testes. Indicador só é inativado, nunca apagado; a meta aplicada é gravada em cada lançamento.
3. **Nunca implemente fora do escopo deste módulo sem avisar** o Claude principal. Mudanças de esquema passam pelo `agente-arquitetura-dados`; componentes novos, pelo `agente-ux-ui`.
4. **Ao concluir, atualize sempre o `CHANGELOG.md` do projeto** com uma linha datada e o link para a especificação. Depois, peça revisão ao `agente-qa-revisao`.
