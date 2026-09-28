# Perguntas pendentes para o Eric

Marque cada caixa quando responder e escreva a resposta logo abaixo da pergunta. As ideias estão na mesma ordem do [índice de ideias](README.md#7-índice-de-ideias).

---

## Decisões transversais

Estas decisões afetam várias ideias ao mesmo tempo.

- [ ] **Armazenamento:** o painel de indicadores implantado virou um modal com KPIs da tramitação, e não o cadastro de indicadores SGI com planilha e fluxos próprios. Qual padrão vale para os novos módulos (treinamentos, NC, validade)? O cadastro real de indicadores ainda é desejado?
- [ ] **Responsável da etapa:** hoje é texto livre. Pode virar uma seleção de usuários cadastrados? (Afeta Minha fila, notificações e NC.)
- [ ] **Acesso:** o portal e as visões públicas ficam só na rede interna ou também na internet?
- [ ] **Hospedagem:** onde o DocFlow fica em produção? O login Microsoft exige um endereço HTTPS fixo.
- [ ] **TI:** registro do app no Entra, grupos, gatilho do Power Automate restrito ao locatário, domínio para web part, licenças premium.
- [ ] **Leitura pública segura:** criar um fluxo de leitura que devolva só campos públicos, e regenerar as URLs expostas.

---

## [Login com conta Microsoft](modelos/modelo_problema/2026-09-28_login-microsoft.md)

A ideia não tem seção de perguntas; estas vêm das seções 4 e 6.

- [ ] Onde o DocFlow ficará hospedado (endereço de retorno de produção para o registro do app)?
- [ ] Quem são os membros de cada perfil (lista para os grupos da TI)? Quem será o segundo Administrador?
- [ ] A TI aceita o gatilho HTTP restrito ao locatário (opção B)? Se não, a opção C, com custo, é aceitável?
- [ ] Os e-mails da aba Usuários batem com os das contas Microsoft? Quem confere a planilha antes do piloto?
- [ ] Documentos antigos sem e-mail do remetente: comparar pelo nome ou deixar anexos nesses documentos só para a Qualidade?
- [ ] Qual a data de corte a registrar como marco de autoria para a auditoria do SGI?

## [Controle de validade dos documentos](modelos/modelo_funcao/2026-09-28_controle-validade-documentos.md)

A ideia não tem seção de perguntas; estas vêm do texto.

- [ ] Os prazos sugeridos estão certos: PR 24 meses, IT 24, ET 24, MP 12, e RL, AT e LD como "Não se aplica"?
- [ ] Como será o preenchimento inicial das datas de aprovação dos documentos vigentes: em lote pela planilha ou pela lista de "Validade não definida"?

## [Matriz de treinamentos](modelos/modelo_funcao/2026-09-28_matriz-treinamentos.md)

A ideia não tem seção de perguntas; estas vêm do texto.

- [ ] Origem dos colaboradores: planilha do RH no MVP e Entra ID na fase 2, como recomendado?
- [ ] Por quanto tempo os registros de treinamento devem ser guardados (retenção, com o jurídico)?
- [ ] Qual a meta mensal de cumprimento (sugestão: 90%)?
- [ ] A TI valida a separação entre fluxo de leitura público (só agregados) e fluxo da gestão antes de carregar dados reais?

## [Notificações por e-mail e Teams](modelos/modelo_funcao/2026-09-28_notificacoes-email-teams.md)

A ideia não tem seção de perguntas; estas vêm do texto.

- [ ] A aba Usuários pode ganhar o campo de e-mail, se ainda não existir?
- [ ] Existe (ou pode ser criada) uma caixa de correio compartilhada do SGI para o envio?
- [ ] A TI libera a permissão para o fluxo publicar no Teams?

## [Lista mestra de documentos](modelos/modelo_funcao/2026-09-28_lista-mestra-documentos.md)

A ideia não tem seção de perguntas; esta vem do texto.

- [ ] Qual o prazo padrão de revisão periódica por tipo de documento (RN6)?

## [Não conformidades e planos de ação](modelos/modelo_funcao/2026-09-28_nao-conformidades-planos-acao.md)

A ideia não tem seção de perguntas; estas vêm do texto.

- [ ] O módulo só abre para responsáveis de ação fora da Qualidade depois do login Microsoft, como proposto?
- [ ] Quem preenche a configuração dos fluxos novos (leitura, gravação em lote e anexos)?

## [Minha fila](modelos/modelo_design/2026-09-28_minha-fila.md)

Da seção "Dependências e pontos em aberto".

- [ ] Enquanto o responsável não virar seleção de usuário, a comparação provisória pelo nome exato do usuário é aceitável?
- [ ] As áreas do cadastro de usuários e dos documentos podem ser padronizadas com a mesma grafia?

## [Portal do SGI](modelos/modelo_design/2026-09-28_portal-sgi.md)

Da seção "Perguntas para o Eric antes de aprovar".

- [ ] Onde vivem hoje a lista mestra, a agenda de treinamentos e o registro de NC (pasta ou lista do SharePoint, Forms, outro sistema)? Os atalhos vão apontar para lá.
- [ ] O Portal é só para a rede interna da Monto ou pode ficar acessível pela internet?
- [ ] A TI consegue liberar o domínio de hospedagem do DocFlow para a web part Incorporar do site do SGI?
- [ ] Qual o texto oficial resumido da política (até 4 linhas) e quem da equipe do SGI aparece no contato?
- [ ] "Documentos recém-revisados" deve incluir todos os tipos (inclusive mapas de riscos e especificações técnicas) ou só procedimentos e instruções de trabalho?
- [ ] A sigla "NC" junto de "Abrir" é entendida no chão de fábrica?

## [Layout para celular](modelos/modelo_design/2026-09-28_layout-mobile.md)

Da seção "Perguntas para o Eric (antes de aprovar)".

- [ ] Barra inferior (recomendada) ou menu hambúrguer no celular?
- [ ] Quais são os 4 destinos principais da barra inferior? A proposta supõe Painel, Novo, Planner e Indicadores.
- [ ] O celular deve permitir tudo (cadastrar, editar, mover fase) ou só consulta e movimentação?
- [ ] Quem usa pelo celular, com que aparelhos, e o acesso é pelo navegador ou por algum aplicativo corporativo (Teams, SharePoint)?
- [ ] Fundo da barra inferior: gradiente da sidebar ou `--cor-fundo` com borda superior?

## [Painel de auditoria](modelos/modelo_funcao/2026-09-28_painel-auditoria.md)

- [ ] A ideia não traz perguntas explícitas. Alguma observação antes de aprovar?

## [Busca global](modelos/modelo_funcao/2026-09-28_busca-global.md)

- [ ] A ideia não traz perguntas explícitas. Alguma observação antes de aprovar?
