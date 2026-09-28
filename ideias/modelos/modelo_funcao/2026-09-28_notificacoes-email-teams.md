# Notificações por e-mail (Outlook) e Teams

| Campo | Valor |
|-------|-------|
| Tipo | Nova funcionalidade |
| Status | Rascunho |
| Prioridade | Média |
| Data | 2026-09-28 |
| Autor | Claude |
| Telas afetadas | Alteradas: Painel (Kanban) e modal "Atualizar Etapa" (disparo dos eventos), modal de detalhes (link direto). Nova: Minhas Notificações (preferências do usuário), acessada pelo menu do usuário na barra lateral |

---

## 1. Contexto e oportunidade

Hoje o DocFlow só "avisa" quem abre o Painel. Quem tem um documento devolvido, atribuído ou atrasado não fica sabendo, a menos que entre no sistema ou que o Eric mande mensagem à mão. Isso gera:

- **Devoluções paradas.** O documento vai para "Devolvido à Área" e a área só percebe dias depois.
- **Prazos perdidos.** Os KPIs "Vencendo" e "Atrasados" existem, mas ninguém é avisado ativamente (dor citada no documento 01: "prazos de revisão perdidos, sem alerta de atraso").
- **Cobrança manual.** O Eric gasta tempo cobrando responsáveis por e-mail e Teams, sem registro.

O Grupo Monto já usa Microsoft 365 e o DocFlow já conversa com o Power Automate, então dá para notificar sem nova infraestrutura. Alinha-se aos objetivos do [perfil do administrador](../../../doc_projeto/05-perfil-do-administrador.md): menos cobrança manual e mais controle de prazos.

**Dependências:**

- **Integridade da sincronização** (implantada, `ideias_implantadas/modelos/modelo_problema/2026-09-28_integridade-sincronizacao.md`): o status precisa chegar à linha do Excel e os documentos precisam ter ID estável; é a planilha que o fluxo de notificações lê. Sem isso, as notificações sairiam erradas.
- **Painel de indicadores** (implantado): não é dependência, mas o resumo diário pode reaproveitar a mesma lógica de "pendente de lançamento" em fase futura.
- **Autenticação corporativa** (achados C2/C3 do `doc_projeto/README.md`, ainda sem ideia registrada): o endereço de e-mail do usuário precisa ser confiável. No MVP, o e-mail vem da base de usuários; o ideal é vir do Entra ID.
- **Controle de validade dos documentos** (ainda sem ideia registrada): o gatilho "validade a vencer" só funciona quando existir o campo de validade. No MVP ele fica preparado, mas desligado até essa ideia existir.

## 2. Usuário e cenário de uso

> Como **responsável de área (Solicitante)**, quero **ser avisado no Teams ou no Outlook quando um documento meu for devolvido, atribuído a mim ou estiver para vencer** para **agir no prazo sem precisar abrir o Painel toda hora**.

> Como **administrador do SGI (Eric)**, quero **que o sistema cobre os responsáveis automaticamente** para **parar de cobrar à mão e ter evidência de que o aviso foi dado**.

**Cenário:**

Na terça, a Qualidade devolve a IT de Soldagem para a área de Produção com a observação "ajustar EPIs da etapa 4" e define o Carlos como responsável. Em até 5 minutos, o Carlos recebe no Teams um cartão "Documento devolvido para você" com o motivo e o botão "Abrir no DocFlow". Ele corrige na quinta. Na segunda seguinte, às 7h30, o Eric recebe o resumo diário por e-mail: 3 documentos vencendo esta semana, 1 atrasado (com o nome do responsável) e 2 aguardando aprovação há mais de 5 dias.

## 3. Descrição da funcionalidade

O DocFlow passa a enviar avisos pelo Outlook e pelo Teams em cinco situações:

| Gatilho | Quando dispara | Tipo |
|---------|----------------|------|
| G1. Mudança de status | Um documento muda de coluna no Kanban ou tem etapa registrada | Imediato |
| G2. Atribuição | Um responsável é definido ou trocado no "Atualizar Etapa" | Imediato |
| G3. Devolução à área | O status vai para "Devolvido à Área" (qualquer variante) | Imediato, prioridade alta |
| G4. Prazo próximo ou atraso | Data de revisão (prazo) a 5, 2 ou 0 dias; ou vencida | Agendado, 1 vez ao dia |
| G5. Validade a vencer | Validade do documento a 60, 30 ou 7 dias (depende do controle de validade) | Agendado, 1 vez ao dia |

Além disso:

- **Resumo diário (opcional):** um e-mail ou mensagem no Teams por pessoa, com tudo o que está pendente com ela. Quem ativa o resumo pode trocar os avisos imediatos de G1 por ele.
- **Preferências:** na tela Minhas Notificações, cada usuário escolhe canal (Outlook, Teams ou ambos), quais gatilhos quer, se quer o resumo diário e pode silenciar por um período ou por documento.

### 3.1 Matriz de quem recebe o quê

Legenda: **I** = aviso imediato; **R** = só no resumo diário; **—** = não recebe; **(obr.)** = não pode ser desligado.

| Gatilho | Remetente (quem cadastrou) | Responsável atual | Qualidade (fila) | Administrador (Eric) |
|---------|----------------------------|-------------------|-------------------|----------------------|
| G1. Mudança de status (geral) | I | I | R | R |
| G1a. Aprovado | I | I | — | R |
| G1b. Cancelado / Reativado | I | I | — | I |
| G2. Atribuição | — | I (obr.) | — | R |
| G3. Devolução à área | I | I (obr.) | — | R |
| G4. Prazo a 5 e 2 dias | — | I | R | R |
| G4. Prazo hoje / atrasado | I | I (obr.) | I | I (a partir de 3 dias de atraso) |
| G5. Validade a 60 e 30 dias | — | I | R | R |
| G5. Validade a 7 dias ou vencida | I | I (obr.) | I | I |

Regras da matriz: quem fez a ação nunca recebe o aviso da própria ação; se a mesma pessoa ocupa dois papéis, recebe uma única mensagem.

### 3.2 Microcopy das mensagens

Padrão: assunto curto com o código, o que aconteceu e o que fazer; um botão "Abrir no DocFlow" que leva direto ao modal de detalhes do documento (link interno montado a partir do ID do documento, nunca fixo no texto). Tom direto, sem jargão técnico. No Teams, as mesmas frases viram um cartão com título, 3 linhas de fatos e o botão.

**G1. Mudança de status**
- Assunto: `[DocFlow] {código} agora está em "{novo status}"`
- Corpo: `{Nome}, o documento {código} – {título} passou de "{status anterior}" para "{novo status}", por {autor da ação}, em {data e hora}. Observação: {observação ou "sem observação"}.`
- Botão: `Abrir no DocFlow`

**G2. Atribuição**
- Assunto: `[DocFlow] Você é o responsável por {código}`
- Corpo: `{Nome}, {autor} definiu você como responsável pelo documento {código} – {título}, na etapa "{status}". Prazo: {data de revisão ou "sem prazo definido"}.`
- Botão: `Ver o que fazer`

**G3. Devolução à área**
- Assunto: `[DocFlow] Ação necessária: {código} foi devolvido para correção`
- Corpo: `{Nome}, a Qualidade devolveu o documento {código} – {título} para a sua área. Motivo: "{observação}". Esta é a {n}ª devolução. Prazo: {data}.`
- Botão: `Abrir e corrigir`

**G4. Prazo próximo**
- Assunto: `[DocFlow] {código} vence em {n} dias`
- Corpo: `{Nome}, o prazo de revisão do documento {código} – {título} termina em {data} ({dia da semana}). Etapa atual: "{status}".`

**G4. Atraso**
- Assunto: `[DocFlow] Atrasado: {código} passou do prazo há {n} dias`
- Corpo: `{Nome}, o documento {código} – {título} deveria ter sido concluído em {data}. Etapa atual: "{status}". Se o prazo mudou, atualize a data de revisão no DocFlow.`

**G5. Validade a vencer**
- Assunto: `[DocFlow] {código} perde a validade em {n} dias`
- Corpo: `{Nome}, o documento {código} – {título} vence em {data}. Para mantê-lo vigente, inicie uma Revisão Técnica antes dessa data.`
- Botão: `Iniciar Revisão Técnica`

**Rodapé de todas as mensagens**
`Você recebeu este aviso porque é {papel} deste documento. Para mudar o que recebe, acesse Minhas Notificações no DocFlow.` Link: `Silenciar este documento`.

**Resumo diário**
- Assunto: `[DocFlow] Seu resumo de {data}: {n} pendências`
- Corpo em blocos, só os não vazios, em ordem de urgência: `Atrasados ({n})`, `Devolvidos para você ({n})`, `Vencem nos próximos 5 dias ({n})`, `Validade a vencer ({n})`, `Mudanças de ontem ({n})`. Cada linha: `{código} – {título} · {status} · {prazo}` com link.
- Se não houver nada: não envia (nunca mandar resumo vazio).

**Tela Minhas Notificações**
- Título: `Minhas notificações`
- Subtítulo: `Escolha como e quando o DocFlow avisa você. Avisos marcados com cadeado são obrigatórios para o responsável.`
- Salvar: `Salvar preferências` → sucesso: `Preferências salvas. Valem a partir do próximo aviso.` → erro: `Não foi possível salvar agora. Suas escolhas continuam na tela; tente de novo.`
- Silenciar: `Silenciar tudo por` [1 dia | 1 semana | até eu reativar] → faixa: `Notificações silenciadas até {data}. Avisos obrigatórios continuam chegando.`

### 3.3 Como evitar spam

1. **Agrupamento (janela de 10 minutos):** vários eventos do mesmo documento para a mesma pessoa em 10 minutos viram uma única mensagem com o estado final. Mover e desfazer em seguida não gera aviso.
2. **Respeito ao "Desfazer":** o evento só entra na fila após passar o tempo do "Desfazer" do Kanban.
3. **Deduplicação:** cada aviso tem uma chave (documento + gatilho + destinatário + marco, ex.: "prazo-2d"); a mesma chave nunca é enviada duas vezes.
4. **Lembretes por marcos, não diários:** prazo a 5, 2 e 0 dias; atraso a cada 3 dias úteis, no máximo 5 lembretes; validade a 60, 30 e 7 dias.
5. **Teto por pessoa:** no máximo 10 avisos imediatos por pessoa por dia; o excedente vai para o resumo do dia seguinte.
6. **Horário comercial:** avisos agendados só em dias úteis, às 7h30; imediatos fora do horário (19h às 7h, fins de semana) esperam até 7h30.
7. **Sem autoaviso:** quem fez a ação não é avisado.
8. **Canal único por padrão:** Teams para imediatos e e-mail para o resumo; "ambos" só se o usuário escolher.
9. **Documentos cancelados ou aprovados** saem de todos os lembretes de prazo.

### 3.4 Desenho do fluxo no Power Automate

Dois fluxos novos, sem expor endereços no front-end além do padrão já adotado após a ideia de integridade da sincronização.

**Fluxo A: "DocFlow – Enfileirar notificação" (disparo por requisição do DocFlow)**

- **Entrada (enviada pelo DocFlow junto ao evento de histórico que já existe):** ID do documento, código, título, gatilho (G1, G2 ou G3), status anterior, novo status, observação, autor da ação (e-mail), responsável (e-mail), remetente (e-mail), data e hora.
- **Passos:**
  1. Validar os campos obrigatórios; se faltar algo, responder erro e não gravar.
  2. Aplicar a matriz (3.1) e montar a lista de destinatários, tirando o autor da ação.
  3. Gravar uma linha por destinatário na nova aba **FilaNotificacoes** da planilha, com status "pendente" e a chave de deduplicação.
  4. Responder ao DocFlow "enfileirado" (o DocFlow não espera o envio).
- **Saída:** confirmação com a quantidade de avisos enfileirados, ou erro. Falha aqui não bloqueia a mudança de status; é registrada e reenviada pela fila de reenvio já existente.

**Fluxo B: "DocFlow – Enviar notificações" (recorrência a cada 10 minutos, mais uma execução às 7h30 em dias úteis)**

- **Entradas:** abas FilaNotificacoes, Tramitação (prazo, status, responsável, validade), Usuários (e-mail, ativo) e PreferenciasNotificacao.
- **Passos a cada 10 minutos:**
  1. Ler a fila "pendente" com mais de 10 minutos; agrupar por destinatário e documento, ficando com o estado final.
  2. Aplicar preferências, silêncio, horário comercial e teto diário; o que não sair agora fica "adiado" ou vai para o resumo.
  3. Enviar pelo conector do Outlook (enviar e-mail a partir de uma caixa compartilhada do SGI) ou do Teams (publicar cartão em chat com o usuário, pelo bot do fluxo).
  4. Marcar cada linha como "enviado", "adiado", "suprimido" (com motivo) ou "falhou" (com erro); "falhou" tenta de novo até 3 vezes.
- **Passos às 7h30 (dias úteis):**
  1. Calcular os marcos de prazo (G4) e validade (G5) e inserir na fila com a chave de deduplicação.
  2. Montar e enviar o resumo diário de quem o ativou, só se houver itens.
  3. Enviar ao Eric um aviso se houver linhas "falhou" nas últimas 24 horas.
- **Saídas:** e-mails e cartões enviados; a aba FilaNotificacoes atualizada, que serve de **evidência de comunicação** para auditoria.

## 4. Fluxo passo a passo

1. A Qualidade move um documento ou registra uma etapa no Painel.
2. O DocFlow salva a mudança como hoje e, passado o "Desfazer", chama o Fluxo A com os dados do evento.
3. Se a chamada falhar, o evento vai para a fila de reenvio local e o usuário vê o indicador de sincronização pendente já existente; a mudança de status não é desfeita.
4. O Fluxo B, na próxima execução, agrupa e envia os avisos respeitando preferências e regras anti-spam.
5. O destinatário recebe a mensagem, clica em "Abrir no DocFlow", faz login se necessário e cai no modal de detalhes do documento.
6. Se o documento não existir mais ou o usuário não tiver acesso, o DocFlow mostra: `Não encontramos este documento. Ele pode ter sido cancelado ou renumerado. Procure pelo código {código} no Painel.`
7. Todo dia útil, às 7h30, o Fluxo B gera os lembretes de prazo e validade e os resumos diários.
8. O usuário ajusta canais, gatilhos, resumo e silêncio em Minhas Notificações; ao salvar, as preferências vão para a planilha.

## 5. Regras de negócio

- RN1: Os destinatários seguem a matriz da seção 3.1. Avisos marcados como obrigatórios não podem ser desligados nem silenciados.
- RN2: Quem executou a ação nunca recebe o aviso dela.
- RN3: Eventos do mesmo documento para o mesmo destinatário em até 10 minutos são agrupados em uma mensagem com o estado final.
- RN4: Um evento só é enfileirado depois do prazo do "Desfazer"; ações desfeitas não geram aviso.
- RN5: Lembretes de prazo nos marcos de 5, 2 e 0 dias; atraso a cada 3 dias úteis, no máximo 5 vezes. Validade a 60, 30 e 7 dias.
- RN6: Documentos Aprovados ou Cancelados saem de todos os lembretes de prazo. A validade só vale para documentos Aprovados.
- RN7: Máximo de 10 avisos imediatos por pessoa por dia; o excedente vai para o resumo seguinte.
- RN8: Avisos só em dias úteis, das 7h30 às 19h (horário de Brasília); fora disso ficam adiados.
- RN9: O resumo diário é opcional, desligado por padrão, e nunca é enviado vazio.
- RN10: Canal padrão: Teams para imediatos e e-mail para o resumo. O usuário pode trocar.
- RN11: Silenciar é possível por 1 dia, 1 semana, até reativar, ou por documento. O administrador vê quem está silenciado.
- RN12: Usuários inativos ou sem e-mail válido não recebem; a linha fica "suprimida – sem e-mail" e aparece no aviso de falhas ao Eric.
- RN13: As mensagens nunca contêm anexos nem o conteúdo do documento; só metadados e o link para o DocFlow.
- RN14: O link da mensagem aponta para o documento pelo ID; o sistema exige login antes de abrir.
- RN15: Toda notificação (enviada, adiada, suprimida ou com falha) fica registrada na aba FilaNotificacoes por pelo menos 12 meses, como evidência para o SGI.

## 6. Dados envolvidos

| Dado | Origem | Obrigatório | Observação |
|------|--------|-------------|------------|
| E-mail do usuário | Aba Usuários (planilha) | Sim | Campo novo se não existir; no futuro vem do Entra ID |
| E-mail do responsável e do remetente | Tramitação / modal "Atualizar Etapa" | Sim para G2, G3 | Hoje o responsável é texto livre: precisa virar escolha de usuário cadastrado |
| ID estável do documento | Tramitação | Sim | Vem da ideia de integridade da sincronização |
| Data de revisão (prazo) | Tramitação | Não | Sem prazo, não há G4 |
| Data de validade | Tramitação (campo futuro) | Não | G5 fica desligado até existir o controle de validade |
| Aba FilaNotificacoes | Planilha no SharePoint | Sim | Colunas: ID do aviso, chave de deduplicação, documento, gatilho, destinatário, canal, status do envio, motivo, datas de criação e envio, tentativas |
| Aba PreferenciasNotificacao | Planilha no SharePoint | Sim | Colunas: e-mail, canal, gatilhos ativos, resumo diário (sim/não), silenciado até, documentos silenciados |
| Cópia das preferências | Navegador | Não | Só para exibir a tela rápido; a planilha é a fonte da verdade |

**Impacto no Power Automate:** dois fluxos novos (A e B), duas abas novas, uma caixa de correio compartilhada do SGI para envio e permissão para o fluxo publicar no Teams. O fluxo de histórico atual não muda.

## 7. Critérios de aceite

- [ ] Ao devolver um documento à área com responsável definido, o responsável recebe o aviso no canal escolhido em até 15 minutos (em horário comercial), com o motivo e o botão que abre o modal de detalhes do documento certo.
- [ ] Mover um documento e clicar em "Desfazer" não gera nenhum aviso.
- [ ] Três mudanças de status seguidas no mesmo documento em menos de 10 minutos geram uma única mensagem por destinatário.
- [ ] Quem fez a ação não recebe aviso dela.
- [ ] Um documento com prazo em 2 dias gera exatamente um lembrete "vence em 2 dias" às 7h30 do dia útil correspondente, mesmo que o fluxo rode várias vezes.
- [ ] Documentos Aprovados ou Cancelados não geram lembretes de prazo.
- [ ] Um usuário que silencia por 1 semana não recebe avisos opcionais nesse período, mas continua recebendo os obrigatórios.
- [ ] O resumo diário só chega a quem o ativou e não é enviado quando não há itens.
- [ ] Cada aviso aparece na aba FilaNotificacoes com status final (enviado, adiado, suprimido ou falhou).
- [ ] Falha no Fluxo A não impede a mudança de status e é reenviada pela fila de reenvio.
- [ ] Nenhuma mensagem contém anexo, senha ou endereço de fluxo.

## 8. Fora do escopo

- Notificações dentro do próprio DocFlow (sino, central de avisos).
- Responder ou aprovar pelo e-mail ou pelo cartão do Teams (ações no cartão ficam para fase 2).
- Publicação em canais de equipe do Teams (só chat individual no MVP).
- SMS, WhatsApp ou push no celular.
- Criação do campo e das regras de validade (G5 depende da ideia de controle de validade).
- Notificações sobre indicadores do SGI (lançamento pendente) — fase futura.
- Troca da autenticação local pelo Entra ID.

## 9. Métricas de sucesso

- **Tempo médio em "Devolvido à Área":** queda de pelo menos 30% em 3 meses.
- **Documentos atrasados:** queda de pelo menos 40% no KPI "Atrasados" em 3 meses.
- **Cobranças manuais do Eric:** estimativa dele, antes e depois (meta: redução de metade).
- **Taxa de silêncio:** menos de 15% dos usuários com tudo silenciado; acima disso, os avisos estão chatos demais.
- **Falhas de envio:** menos de 2% das linhas da FilaNotificacoes com "falhou".

**MVP x fases seguintes:**

- **MVP:** G2, G3 e G4; Teams e Outlook; agrupamento, deduplicação, horário comercial e teto; tela Minhas Notificações com canal e silêncio; aba FilaNotificacoes.
- **Fase 2:** G1 para todos os status, resumo diário, silenciar por documento.
- **Fase 3:** G5 (após o controle de validade) e ações diretamente no cartão do Teams.

---

## Instruções para o Antigravity

- **O que implementar (só o MVP):**
  - No DocFlow: após o "Desfazer", enviar o evento ao Fluxo A para G2 (atribuição) e G3 (devolução), usando a mesma fila de reenvio já existente em caso de falha. Transformar o campo de responsável do "Atualizar Etapa" em escolha entre usuários ativos (guardando o e-mail).
  - Nova tela Minhas Notificações (link no menu do usuário da barra lateral) com canal (Teams, Outlook, ambos), gatilhos opcionais, silenciar por período e as mensagens de sucesso e erro da seção 3.2.
  - Abrir o modal de detalhes quando a página do Painel for acessada com o ID de um documento; se não existir, mostrar a mensagem do passo 6 da seção 4.
  - Documentar os fluxos A e B e as abas FilaNotificacoes e PreferenciasNotificacao para o Eric montar no Power Automate (entradas, passos e saídas da seção 3.4), incluindo o G4 agendado.
- **Onde (telas e arquivos):** Painel (Kanban) e modal "Atualizar Etapa" (`planner.js`), serviço de dados (`data-service.js`), nova página de preferências no padrão visual do `04-design.md`, barra lateral.
- **O que não alterar:** o fluxo de histórico e o de atualização de status existentes; a lógica de sincronização da ideia de integridade; os textos dos status. Não colocar endereços de fluxo em arquivos novos nem em documentos. Não implementar resumo diário, G1 geral nem G5.
- **Como testar:** com um usuário de teste e o próprio Eric: (1) devolver documento e conferir aviso e link; (2) mover e desfazer, sem aviso; (3) três mudanças rápidas, uma mensagem; (4) silenciar e conferir que só obrigatórios chegam; (5) desligar a rede ao devolver e confirmar o reenvio; (6) conferir a aba FilaNotificacoes; (7) documento com prazo em 2 dias recebe só um lembrete mesmo com o fluxo rodando duas vezes.

---

## Resultado da implantação

- **Data da implantação:**
- **Validado por:** Eric
- **O que foi feito:**
- **Diferenças em relação à proposta:**
- **Observações e pendências:**
