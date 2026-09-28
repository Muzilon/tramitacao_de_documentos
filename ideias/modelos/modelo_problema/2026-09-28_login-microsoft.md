# Login com conta Microsoft e perfis que restringem de verdade

| Campo | Valor |
|-------|-------|
| Tipo | Resolução de problema |
| Status | Rascunho |
| Prioridade | Alta |
| Data | 2026-09-28 |
| Autor | Claude |
| Telas afetadas | Login; cabeçalho e menu de configurações (todas as páginas); Painel (Kanban) e modais de detalhe, edição, anexos, cancelados e auditoria; Novo Documento / Revisão Técnica; Painel de Indicadores do SGI |

---

## 1. Problema observado

A autenticação do DocFlow é feita inteiramente no navegador, com usuários e senhas próprios. Os fatos:

1. **Senhas em texto puro em quatro lugares:** fixas no código (lista de usuários-padrão em auth-service.js), no armazenamento do navegador (chave docflow_usuarios), na aba Usuários da planilha do SharePoint e na exportação XLSX completa, que sai com a coluna Senha.
2. **Senhas visíveis na tela de login antes de entrar.** O bloco "Acesso Rápido para Teste" mostra pílulas que preenchem e-mail e senha. Parte delas é fixa em login.html e parte é recriada com até 4 usuários ativos vindos da nuvem.
3. **Sessão forjável.** A guarda de rota (protegerPagina) só verifica se existe algum conteúdo na chave docflow_sessao_usuario. Qualquer valor escrito à mão nas ferramentas do desenvolvedor "autentica". A sessão não expira e não tem assinatura.
4. **Perfis decorativos.** O perfil (Administrador, Qualidade, Solicitante...) só aparece no badge do usuário. Qualquer pessoa logada pode aprovar, cancelar, editar, importar Excel, sincronizar e exportar.
5. **Webhooks abertos.** Os fluxos do Power Automate são chamados diretamente pelo navegador com URLs assinadas presentes no código. Quem tem a URL de leitura baixa a planilha inteira, inclusive a aba Usuários com senhas, sem login.
6. **Redirecionamento sem validação** após o login (parâmetro redirect).

**Como reproduzir (exemplos):**

- Abra a tela de login sem estar logado: e-mails e senhas aparecem nas pílulas de acesso rápido.
- Em qualquer página, abra as ferramentas do desenvolvedor, veja a chave docflow_usuarios: todas as senhas estão legíveis.
- Apague a sessão, crie à mão a chave de sessão com qualquer texto e abra o Painel: a página abre.
- Entre com um usuário de perfil Solicitante e aprove ou cancele um documento: a ação é aceita.

## 2. Impacto

- **Quem é afetado:** todos. Qualquer colaborador (ou qualquer pessoa com acesso ao endereço do site) pode se passar por outro usuário, aprovar documentos em nome da Qualidade e alterar a planilha.
- **Frequência:** permanente. A exposição existe a cada abertura da tela de login.
- **Consequência:**
  - **Conformidade do SGI:** a aprovação de informação documentada perde a validade como evidência, porque o autor registrado no histórico não é comprovado. Em auditoria, não há como provar quem aprovou.
  - **Segurança da informação:** senhas reutilizadas em outros sistemas podem vazar; dados da planilha podem ser lidos e gravados por fora do sistema.
  - **LGPD:** nomes, e-mails e áreas de colaboradores ficam acessíveis sem controle.

## 3. Causa provável

- O DocFlow não tem servidor próprio. Foi construído como site estático, com a planilha como banco de dados e o navegador como único lugar de decisão. Toda verificação feita só no navegador pode ser burlada.
- A aba Usuários da planilha funciona como cadastro de usuários e senhas, e é baixada inteira pelo fluxo de leitura (buscarDadosDoPowerAutomate) e gravada no navegador (salvarUsuarios).
- A função autenticar compara a senha em texto puro no navegador e grava a sessão sem nenhuma prova de identidade.
- Os botões de teste foram criados para agilizar o desenvolvimento e ficaram em produção.
- Nenhuma tela ou ação consulta o perfil antes de executar.

## 4. Proposta de solução

Trocar o login próprio pelo **login com conta Microsoft corporativa (Microsoft Entra ID)**, usando a biblioteca oficial MSAL.js no navegador. Todo colaborador da Monto já tem essa conta (é a mesma do Outlook, Teams e SharePoint), então não há senha nova para criar nem para guardar. O perfil passa a vir de **grupos do Entra** e passa a **restringir** as ações.

Entregue em etapas, nesta ordem. A Etapa 0 não depende de ninguém e deve ir para produção já.

### Etapa 0: contenção imediata (sem depender da TI)

- Remover de login.html todo o bloco "Acesso Rápido para Teste", tanto as pílulas fixas quanto a recriação dinâmica a partir dos usuários da nuvem.
- Remover as senhas dos usuários-padrão em auth-service.js e deixar de gravar a senha na chave docflow_usuarios (guardar só nome, e-mail, perfil, área e status). Apagar senhas já gravadas nessa chave na primeira abertura da nova versão.
- Retirar a coluna Senha da exportação XLSX completa.
- Validar o parâmetro redirect: aceitar só páginas do próprio DocFlow (index.html, formulario.html e o painel de indicadores); qualquer outro valor vai para index.html.
- **Ação do Eric, fora do código:** trocar todas as senhas atuais da aba Usuários (elas devem ser consideradas vazadas) e, idealmente, avisar os usuários que tiverem reaproveitado senhas de outros sistemas. Regenerar as assinaturas (URLs) dos fluxos do Power Automate, porque estão no histórico do Git.

Observação: enquanto o login Microsoft não chega, o login por senha continua existindo (com as senhas novas guardadas só na planilha). É uma contenção, não a solução.

### Etapa 1: registro do aplicativo no Entra (depende da TI da Monto)

Pedido à TI (o Eric abre o chamado):

1. **Registrar um aplicativo** no Entra ID do tenant da Monto, do tipo "aplicativo de página única" (SPA), com o nome "DocFlow SGI".
2. **Endereços de retorno (redirect URIs):** o endereço de produção onde o DocFlow será hospedado e o endereço local de desenvolvimento (Live Server, porta 5501). A TI precisa saber onde o DocFlow ficará hospedado; veja as perguntas no fim.
3. **Contas aceitas:** somente contas do diretório da Monto (locatário único).
4. **Permissões:** apenas login básico (openid, profile, email e User.Read). Não pedir permissões administrativas.
5. **Grupos no token:** configurar o aplicativo para enviar os grupos de segurança do usuário (ou, alternativamente, definir **papéis do aplicativo**; veja abaixo).
6. **Criar os grupos** (ou papéis) listados no mapeamento e colocar os membros iniciais, com a lista fornecida pelo Eric.
7. **Atribuição obrigatória:** ativar "atribuição de usuário necessária", para que só quem está em um dos grupos consiga entrar.
8. Devolver ao Eric o **ID do aplicativo (client ID)** e o **ID do locatário (tenant ID)**. Esses dois valores não são segredos e podem ficar no código.

### Etapa 2: login Microsoft no navegador

- A tela de login passa a ter um único botão: **"Entrar com a conta Microsoft"**. Os campos de e-mail e senha são removidos.
- Após o login, o DocFlow lê do token o nome, o e-mail, o identificador do usuário e os grupos (ou papéis), e monta o perfil.
- A área do usuário vem da aba Usuários da planilha (casando pelo e-mail) ou, se a TI preferir, do campo departamento da conta Microsoft. Recomendado: planilha, pois o Eric controla.
- A sessão passa a ser a da MSAL (com expiração e renovação silenciosa). A guarda de rota passa a verificar se existe conta MSAL válida, e não uma chave qualquer.
- Quem entra sem nenhum grupo do DocFlow vê a mensagem "Você ainda não tem acesso ao DocFlow. Solicite à Qualidade." e não vê dados.
- O "Sair" encerra a sessão do DocFlow (sem obrigar a sair do Microsoft 365 inteiro).
- O autor gravado no histórico passa a ser o nome e o e-mail vindos da conta Microsoft.

### Etapa 3: perfis que restringem de verdade

Ver o mapeamento abaixo. Os botões e menus não permitidos ficam **ocultos** (não apenas desabilitados), e cada ação também verifica o perfil antes de executar.

### Etapa 4: proteger os fluxos do Power Automate

Ver a seção "Impacto nos fluxos do Power Automate". Sem esta etapa, a restrição por perfil continua só no navegador e pode ser contornada por quem conhece as URLs dos fluxos.

### Mapeamento de perfis

**Recomendação:** usar **grupos de segurança do Entra**, porque a TI já administra grupos, a entrada e saída de colaboradores é automática (quem sai da empresa perde o acesso sozinho) e o Eric pode ser nomeado dono dos grupos para incluir pessoas sem abrir chamado.

| Perfil no DocFlow | Grupo do Entra (nome sugerido) | Quem |
|-------------------|--------------------------------|------|
| Administrador | SGI-DocFlow-Administradores | Eric e um substituto |
| Qualidade | SGI-DocFlow-Qualidade | Equipe de Qualidade / SGI que revisa e aprova |
| Solicitante | SGI-DocFlow-Solicitantes | Colaboradores das áreas que enviam documentos |
| Leitor | SGI-DocFlow-Leitores | Quem só consulta (gestores, auditores internos). Pode ser um grupo amplo, como "todos os colaboradores" |

- Se o usuário estiver em mais de um grupo, vale o perfil mais alto (Administrador > Qualidade > Solicitante > Leitor).
- **Alternativa:** papéis do aplicativo (Administrador, Qualidade, Solicitante, Leitor) definidos no próprio registro do app e atribuídos pela TI. Funciona igual para o DocFlow, mas cada inclusão depende da TI ou de acesso de administração ao aplicativo. Use só se a TI não quiser enviar grupos no token.
- **Transição:** enquanto os grupos não existirem, o perfil pode vir da coluna Perfil da aba Usuários da planilha, casando pelo e-mail da conta Microsoft (ver plano de transição).

### O que cada perfil pode fazer

| Ação | Administrador | Qualidade | Solicitante | Leitor |
|------|:---:|:---:|:---:|:---:|
| Ver Painel (Kanban), KPIs e Painel de Indicadores | Sim | Sim | Sim | Sim |
| Ver detalhes, timeline e auditoria de um documento | Sim | Sim | Sim | Sim |
| Cadastrar documento (Novo Documento / Revisão Técnica) | Sim | Sim | Sim | Não |
| Anexar arquivos a um documento | Sim | Sim | Só nos que enviou, enquanto estiverem Recebido ou Devolvido | Não |
| Responder devolução (reenviar documento corrigido) | Sim | Sim | Só nos que enviou | Não |
| Mover etapas (revisão, devolver, enviar para aprovação) | Sim | Sim | Não | Não |
| Aprovar documento | Sim | Sim | Não | Não |
| Editar todos os campos do documento | Sim | Sim | Não | Não |
| Cancelar e reativar documento | Sim | Sim | Não | Não |
| Sincronizar Nuvem (menu) | Sim | Sim | Sim | Sim |
| Carregar Excel (importação) | Sim | Não | Não | Não |
| Exportar CSV | Sim | Sim | Não | Não |
| Exportar planilha completa (XLSX) | Sim | Não | Não | Não |
| Gerenciar usuários e perfis | Sim (no Entra, como dono dos grupos) | Não | Não | Não |

"Enviou" = o e-mail da conta Microsoft é o do remetente do documento. Para isso, o cadastro passa a gravar também o e-mail do remetente, não só o nome.

### Impacto nos fluxos do Power Automate

Hoje os fluxos têm gatilho "quando uma solicitação HTTP é recebida" com URL assinada: quem tem a URL chama o fluxo, sem saber quem é. Com o login Microsoft, há três caminhos:

| Opção | Como funciona | Prós | Contras |
|-------|---------------|------|---------|
| A. Manter URLs assinadas, só regenerar | Nada muda nos fluxos | Zero esforço | Continua aberto a quem ler o código. Não resolve |
| **B. Gatilho HTTP restrito a usuários do locatário (recomendada)** | O gatilho HTTP passa a aceitar só chamadas com token da conta Microsoft de usuários da Monto. O DocFlow obtém o token pela MSAL e envia em cada chamada. O fluxo lê o e-mail de quem chamou e verifica o perfil antes de gravar | Fecha o acesso anônimo; o autor passa a ser comprovado no próprio fluxo; não exige servidor novo | Exige que a TI permita esse tipo de gatilho e ajuste o registro do app para pedir o escopo correspondente; exige licenças adequadas do Power Automate; cada fluxo precisa ser ajustado |
| C. API intermediária (por exemplo, Azure Functions) | O navegador chama uma API autenticada, que chama os fluxos ou o SharePoint | Mais robusto e escalável | Custo, hospedagem e manutenção que hoje não existem. Fica para o futuro |

Ajustes nos fluxos, na opção B (feitos pelo Eric, com apoio da TI):

- **Leitura:** parar de devolver a coluna Senha da aba Usuários (idealmente, excluir a coluna da planilha). Só devolver dados a usuários autenticados.
- **Cadastro, atualização e histórico:** gravar como autor o e-mail de quem chamou (vindo do token), e não o que o navegador informa. Recusar ações não permitidas ao perfil (por exemplo, aprovação vinda de um Solicitante).
- **Fila de envios** (implantada na ideia de integridade da sincronização): pendências antigas, criadas antes da troca, podem falhar por falta de token. Na primeira abertura da nova versão, a fila tenta reenviar já com o token do usuário atual.
- Enquanto a opção B não estiver pronta, as URLs assinadas continuam funcionando (Etapa 0 exige apenas regenerá-las).

### Plano de transição

1. **Semana 0 (imediato):** Etapa 0 em produção. Eric troca as senhas da planilha e regenera as URLs dos fluxos.
2. **Chamado à TI:** registro do app, grupos e decisão sobre o gatilho HTTP restrito (Etapas 1 e 4). Em paralelo, o Eric levanta onde o DocFlow ficará hospedado e a lista de membros de cada perfil.
3. **Piloto (1 a 2 semanas):** login Microsoft ativo, com o perfil vindo da coluna Perfil da planilha (casando pelo e-mail) e o login por senha ainda disponível num link discreto "Entrar com senha (temporário)", só para quem ainda não conseguir. Participam o Eric e 2 ou 3 usuários de cada perfil.
4. **Corte:** com o piloto validado e os grupos criados, remover definitivamente o login por senha, a função de autenticação por senha, a chave docflow_usuarios com senhas e a coluna Senha da planilha. O perfil passa a vir dos grupos.
5. **Proteção dos fluxos:** migrar os fluxos para o gatilho restrito (opção B), um por vez: leitura primeiro, depois histórico, cadastro e atualização. Depois de cada um, regenerar ou desativar a URL antiga.
6. **Comunicação:** aviso aos usuários antes do corte ("a partir de tal data, entre com a sua conta Microsoft, a mesma do Outlook").

## 5. Critérios de aceite

**Etapa 0: contenção**
- [ ] A tela de login não mostra mais nenhuma pílula de acesso rápido nem nenhuma senha, com ou sem sincronização.
- [ ] A chave docflow_usuarios não contém senhas depois de abrir a nova versão.
- [ ] O código-fonte não contém mais senhas nos usuários-padrão.
- [ ] A exportação XLSX completa não tem a coluna Senha.
- [ ] Um login com o parâmetro redirect apontando para um site externo termina no Painel do DocFlow.

**Etapas 1 e 2: login Microsoft**
- [ ] A tela de login mostra só o botão "Entrar com a conta Microsoft", e o login funciona com uma conta da Monto.
- [ ] Uma conta sem nenhum grupo do DocFlow vê a mensagem de acesso não liberado e não vê nenhum documento.
- [ ] Criar à mão uma chave de sessão falsa no navegador não abre o Painel.
- [ ] Depois do tempo de expiração da sessão, o sistema pede login de novo (ou renova sozinho, sem erro).
- [ ] O autor gravado no histórico de uma ação é o nome e o e-mail da conta Microsoft usada.
- [ ] "Sair" leva de volta à tela de login, e voltar pelo navegador não reabre o Painel.

**Etapa 3: perfis**
- [ ] Um Leitor não vê os botões de cadastrar, anexar, mover etapa, aprovar, editar, cancelar, importar nem exportar.
- [ ] Um Solicitante cadastra documentos e anexa arquivos só nos documentos que enviou, e não vê os botões de aprovar, mover etapa, editar nem cancelar.
- [ ] Um usuário da Qualidade aprova, devolve, edita e cancela, mas não vê "Carregar Excel" nem a exportação completa.
- [ ] O Administrador vê todas as ações.
- [ ] Chamar pelo console do navegador uma ação global (por exemplo, mover status) com um perfil sem permissão é recusado com aviso.

**Etapa 4: fluxos**
- [ ] Uma chamada ao fluxo de leitura sem token é recusada.
- [ ] O fluxo de leitura não devolve senhas.
- [ ] Uma aprovação enviada ao fluxo por um Solicitante é recusada pelo próprio fluxo.
- [ ] As URLs assinadas antigas não funcionam mais.

## 6. Riscos

- **Dependência da TI:** sem o registro do app, as Etapas 1 a 4 não andam. A Etapa 0 deve ir para produção independentemente disso.
- **Hospedagem:** o login Microsoft exige endereço fixo com HTTPS cadastrado no registro do app. Se o DocFlow hoje roda de forma improvisada (ou só localmente), é preciso definir a hospedagem antes.
- **Gatilho HTTP restrito:** depende da política da TI e das licenças do Power Automate. Se não for possível, a restrição por perfil fica só no navegador (ganho real contra usuários comuns, mas não contra quem conhece as URLs) e a opção C vira o caminho, com custo.
- **E-mails divergentes:** usuários da aba Usuários com e-mail diferente do da conta Microsoft (apelidos, grafias) não terão área nem perfil no piloto. Conferir a planilha antes.
- **Histórico antigo:** eventos antigos têm o autor gravado só pelo nome. Não é possível comprovar a autoria retroativamente; registrar a data de corte como marco para a auditoria do SGI.
- **Documentos antigos sem e-mail do remetente:** a regra "só nos que enviou" do Solicitante não funciona para eles. Proposta: comparar pelo nome como alternativa, ou deixar anexos nesses documentos só para a Qualidade.
- **Fila de envios:** pendências criadas antes da troca podem falhar na Etapa 4; conferir a fila antes de cada migração de fluxo.
- **Bloqueio do Eric:** se o login Microsoft falhar, ninguém entra. Manter o Eric com acesso ao Power Automate e à planilha como contorno e ter um segundo Administrador.
- **Senhas vazadas:** a Etapa 0 tira as senhas da tela, mas elas já estão no histórico do Git e em navegadores. Por isso a troca de senhas e a regeneração das URLs são obrigatórias.

---

## Instruções para o Antigravity

- **O que implementar:** as etapas da seção 4, uma de cada vez e na ordem, com um commit por etapa, sem avançar antes da validação do Eric.
  0. **Contenção:** remover o bloco "Acesso Rápido para Teste" de login.html (HTML fixo e a recriação dinâmica no módulo embutido); remover as senhas dos usuários-padrão em auth-service.js; fazer normalizarItemUsuario e salvarUsuarios descartarem a senha; limpar senhas já gravadas em docflow_usuarios na inicialização; retirar a coluna Senha de exportarPlanilhaCompletaExcel; validar o parâmetro redirect aceitando só páginas do próprio DocFlow. Não mexer no restante do login por senha ainda.
  1. **Configuração MSAL:** carregar a MSAL.js (msal-browser) por CDN, com versão fixa e verificação de integridade (SRI). Criar um arquivo de configuração com client ID, tenant ID e endereços de retorno (preenchidos pelo Eric; sem segredos).
  2. **Login Microsoft:** reescrever auth-service.js mantendo a mesma interface pública (obterUsuarioAtual, estaAutenticado, fazerLogout, protegerPagina, configurarHeaderUsuario e o global DocFlowAuth), para não quebrar planner.js, formulario.js e data-service.js. Trocar autenticar por login com redirecionamento pela MSAL. protegerPagina passa a exigir conta MSAL válida e a interromper o carregamento da página. Montar o usuário a partir do token (nome, e-mail, grupos ou papéis) e da aba Usuários (área), casando pelo e-mail. Criar a tela de "acesso não liberado". Durante o piloto, manter o login por senha atrás de um interruptor de configuração, desligado por padrão após o corte.
  3. **Perfis:** criar em auth-service.js uma função única de permissão (por exemplo, "pode(ação, documento)") com a tabela da seção 4 e o mapeamento de grupos para perfis em configuração. Usá-la para ocultar botões e menus em planner.js (ações rápidas, timeline, edição, cancelados, anexos), formulario.js (cadastro, exportação CSV) e no menu de configurações de data-service.js (Carregar Excel), e para recusar as ações globais expostas (moverStatus, solicitarCancelamentoDocumento etc.). Gravar o e-mail do remetente no cadastro.
  4. **Fluxos:** quando o Eric informar que um fluxo foi migrado, fazer a chamada daquele fluxo (inclusive pela fila de envios) obter o token pela MSAL e enviá-lo no cabeçalho de autorização. Tratar recusa por permissão com aviso claro, sem nova tentativa infinita na fila.
- **Onde (telas e arquivos):** login.html, auth-service.js (principal), data-service.js (usuários, exportação, menu, chamadas aos fluxos e fila), planner.js, formulario.js, index.html e formulario.html (script da MSAL) e a página do painel de indicadores. Atualizar as seções 4.1, 7.1, 8.3, 9, 10 e 12.1 de doc_projeto/02-estrutura-do-codigo.md ao fim de cada etapa.
- **O que não alterar:**
  - As URLs dos webhooks: não trocar, apagar nem adicionar. Quem troca é o Eric.
  - Nenhum segredo no código: client ID e tenant ID podem ficar; senha, chave secreta de aplicativo ou URL assinada, nunca.
  - O comportamento da fila de envios, do merge e do histórico (ideia de integridade da sincronização), exceto a inclusão do token.
  - Layout, cores e status do Kanban; a interface pública de auth-service.js.
  - Não pedir à MSAL permissões além de openid, profile, email e User.Read (mais o escopo do Power Automate, só na Etapa 4).
- **Como testar:**
  - Etapa 0: rodar pelo Live Server (porta 5501) e conferir login.html, a chave docflow_usuarios, a exportação XLSX e o redirect.
  - Etapas 1 a 3: exigem o registro do app pela TI com o endereço local cadastrado. Testar com uma conta de cada grupo (pedir à TI contas de teste ou usar colegas do piloto) e percorrer os critérios de aceite de perfis. Tentar forjar a sessão e chamar ações pelo console.
  - Etapa 4: testar cada fluxo com e sem token, e com perfis sem permissão.
  - Repetir os critérios de aceite das etapas anteriores e da ideia de integridade da sincronização (regressão).

---

## Resultado da implantação

- **Data da implantação:**
- **Validado por:** Eric
- **O que foi feito:**
- **Diferenças em relação à proposta:**
- **Observações e pendências:**
