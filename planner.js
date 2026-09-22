import {
  obterTramitacoes,
  salvarTramitacoes,
  aoAtualizarDados,
  inicializarBarraSincronizacao,
  inicializarMenuConfiguracoes,
  buscarDadosDoPowerAutomate,
  URL_WEBHOOK_UPDATE_STATUS,
  arquivoParaBase64,
  enviarArquivosParaSharePoint
} from './data-service.js';

(() => {
  // 1. Webhook opcional dedicado para atualizar status no Excel (não insere linha)
  const URL_WEBHOOK_POWER_AUTOMATE = URL_WEBHOOK_UPDATE_STATUS;

  // 2. Estado local carregado da base oficial
  let tramitacoes = obterTramitacoes();

  // Escuta atualizações da planilha Excel ou do Power Automate
  aoAtualizarDados((novosDados) => {
    tramitacoes = novosDados;
    popularFiltroAreas();
    renderizarQuadro();
  });

  // Elementos do DOM
  const cardsRevisao = document.getElementById('cards-revisao');
  const cardsPendente = document.getElementById('cards-pendente');
  const cardsAprovado = document.getElementById('cards-aprovado');
  const countRevisao = document.getElementById('count-col-revisao');
  const countPendente = document.getElementById('count-col-pendente');
  const countAprovado = document.getElementById('count-col-aprovado');

  const inputBusca = document.getElementById('input-busca');
  const filtroArea = document.getElementById('filtro-area');

  // KPI elements
  const kpiTotal = document.getElementById('kpi-total');
  const kpiRevisao = document.getElementById('kpi-revisao');
  const kpiPendente = document.getElementById('kpi-pendente');
  const kpiAprovado = document.getElementById('kpi-aprovado');
  const barRevisao = document.getElementById('bar-kpi-revisao');
  const barPendente = document.getElementById('bar-kpi-pendente');
  const barAprovado = document.getElementById('bar-kpi-aprovado');
  const subRevisao = document.getElementById('sub-kpi-revisao');
  const subPendente = document.getElementById('sub-kpi-pendente');
  const subAprovado = document.getElementById('sub-kpi-aprovado');

  // Formata data YYYY-MM-DD para DD/MM/YYYY
  function formatarData(dataStr) {
    if (!dataStr) return '-';
    const partes = dataStr.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataStr;
  }

  // Gera inicial do nome para o avatar
  function obterInicial(nome) {
    if (!nome) return '?';
    return nome.trim().charAt(0).toUpperCase();
  }

  // Envia atualização de status para o Power Automate (apenas se houver fluxo específico de UpdateRow configurado)
  async function sincronizarComPowerAutomate(item) {
    if (!URL_WEBHOOK_POWER_AUTOMATE || URL_WEBHOOK_POWER_AUTOMATE.trim() === '' || URL_WEBHOOK_POWER_AUTOMATE.includes("COLE_AQUI")) {
      // Nenhum fluxo de Update configurado; não chama o fluxo de adicionar linha para não duplicar registros no Excel!
      return;
    }
    try {
      const payload = {
        "codigo": item.codigo,
        "titulo": item.titulo,
        "status": item.status
      };

      await fetch(URL_WEBHOOK_POWER_AUTOMATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Falha ao sincronizar atualização com Power Automate:", e);
    }
  }

  // Popula o select de áreas
  function popularFiltroAreas() {
    if (!filtroArea) return;
    const areas = [...new Set(tramitacoes.map(t => (t.area || '').trim()).filter(Boolean))].sort();
    
    // Preserva a seleção atual se houver
    const selecionada = filtroArea.value;
    filtroArea.innerHTML = '<option value="">Todas as Áreas</option>';
    areas.forEach(area => {
      const opt = document.createElement('option');
      opt.value = area;
      opt.textContent = area;
      if (area === selecionada) opt.selected = true;
      filtroArea.appendChild(opt);
    });
  }

  // Atualiza os indicadores KPIs no topo
  function atualizarKPIs(itens) {
    const total = itens.length;
    let rev = 0;
    let pen = 0;
    let apr = 0;

    itens.forEach(item => {
      const s = (item.status || '').toLowerCase().trim();
      if (s === 'aprovado') apr++;
      else if (s === 'pendente') pen++;
      else rev++; // padrão Em Revisão
    });

    if (kpiTotal) kpiTotal.textContent = total;
    if (kpiRevisao) kpiRevisao.textContent = rev;
    if (kpiPendente) kpiPendente.textContent = pen;
    if (kpiAprovado) kpiAprovado.textContent = apr;

    const pctRev = total > 0 ? Math.round((rev / total) * 100) : 0;
    const pctPen = total > 0 ? Math.round((pen / total) * 100) : 0;
    const pctApr = total > 0 ? Math.round((apr / total) * 100) : 0;

    if (barRevisao) barRevisao.style.width = pctRev + '%';
    if (barPendente) barPendente.style.width = pctPen + '%';
    if (barAprovado) barAprovado.style.width = pctApr + '%';

    if (subRevisao) subRevisao.textContent = `${pctRev}% do volume`;
    if (subPendente) subPendente.textContent = `${pctPen}% aguardando`;
    if (subAprovado) subAprovado.textContent = `${pctApr}% taxa de aprovação`;
  }

  // ========================================================
  // Modal Flutuante de Detalhes
  // ========================================================
  const modalDetalhes = document.getElementById('modal-detalhes');
  const btnFecharModal = document.getElementById('btn-fechar-modal');

  const modalCodigo = document.getElementById('modal-codigo');
  const modalRevisao = document.getElementById('modal-revisao');
  const modalStatusBadge = document.getElementById('modal-status-badge');
  const modalTitulo = document.getElementById('modal-titulo');
  const modalTipo = document.getElementById('modal-tipo');
  const modalRemetente = document.getElementById('modal-remetente');
  const modalAvatar = document.getElementById('modal-avatar');
  const modalAreaDisciplina = document.getElementById('modal-area-disciplina');
  const modalDataRecebimento = document.getElementById('modal-data-recebimento');
  const modalDataRevisao = document.getElementById('modal-data-revisao');
  const modalObservacao = document.getElementById('modal-observacao');
  const modalArquivoPrincipal = document.getElementById('modal-arquivo-principal');
  const modalQtdAnexos = document.getElementById('modal-qtd-anexos');
  const modalLinkSharepoint = document.getElementById('modal-link-sharepoint');
  const modalQuickActions = document.getElementById('modal-quick-actions');

  let itemDetalheAtualIndex = null;
  let itemDetalheAtualChave = null;

  function obterItemAtual() {
    if (itemDetalheAtualChave) {
      const enc = tramitacoes.find(t => 
        (t.codigo && t.codigo.trim().toLowerCase() === itemDetalheAtualChave) ||
        (t.titulo && t.titulo.trim().toLowerCase() === itemDetalheAtualChave)
      );
      if (enc) return enc;
    }
    if (itemDetalheAtualIndex !== null && tramitacoes[itemDetalheAtualIndex]) {
      return tramitacoes[itemDetalheAtualIndex];
    }
    return null;
  }

  // Elementos de Edição e Visualização do Modal
  const modalViewMode = document.getElementById('modal-view-mode');
  const modalEditMode = document.getElementById('modal-edit-mode');
  const btnEditarModal = document.getElementById('btn-editar-modal');
  const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
  const formEdicaoModal = document.getElementById('form-edicao-modal');

  // Elementos do Link do SharePoint
  const modalTextoLinkSharepoint = document.getElementById('modal-texto-link-sharepoint');
  const btnToggleLinkManual = document.getElementById('btn-toggle-link-manual');
  const painelLinkManual = document.getElementById('painel-link-manual');
  const inputLinkManual = document.getElementById('input-link-manual');
  const btnSalvarLinkManual = document.getElementById('btn-salvar-link-manual');
  const btnCancelarLinkManual = document.getElementById('btn-cancelar-link-manual');

  // Elementos de Arquivos e Upload
  const modalAlertaSemAnexos = document.getElementById('modal-alerta-sem-anexos');
  const modalFilesSummary = document.getElementById('modal-files-summary');
  const painelUploadModal = document.getElementById('painel-upload-modal');
  const modalInputFilePrincipal = document.getElementById('modal-input-file-principal');
  const modalInputFilesAnexos = document.getElementById('modal-input-files-anexos');
  const modalPreviewDocPrincipal = document.getElementById('modal-preview-doc-principal');
  const modalPreviewQtdAnexos = document.getElementById('modal-preview-qtd-anexos');
  const btnEnviarAnexosSharepoint = document.getElementById('btn-enviar-anexos-sharepoint');

  // ========================================================
  // Sistema de Diálogos Customizados (Substitui confirm e alert nativos do navegador)
  // ========================================================
  function mostrarDialogoConfirmacao({ titulo = 'Confirmação', mensagem, textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar', perigo = false, onConfirmar, onCancelar }) {
    const existente = document.getElementById('custom-dialog-overlay');
    if (existente) existente.remove();

    const overlay = document.createElement('div');
    overlay.id = 'custom-dialog-overlay';
    overlay.className = 'custom-dialog-overlay';

    overlay.innerHTML = `
      <div class="custom-dialog-box" role="dialog" aria-modal="true">
        <h4 class="custom-dialog-title">${titulo}</h4>
        <p class="custom-dialog-msg">${mensagem}</p>
        <div class="custom-dialog-actions">
          <button type="button" class="custom-dialog-btn cancelar" id="btn-dialog-cancelar">${textoCancelar}</button>
          <button type="button" class="custom-dialog-btn ${perigo ? 'confirmar-perigo' : 'confirmar-primario'}" id="btn-dialog-confirmar">${textoConfirmar}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const btnConfirmar = overlay.querySelector('#btn-dialog-confirmar');
    const btnCancelar = overlay.querySelector('#btn-dialog-cancelar');

    const fechar = () => overlay.remove();

    btnConfirmar.addEventListener('click', () => {
      fechar();
      if (typeof onConfirmar === 'function') onConfirmar();
    });

    btnCancelar.addEventListener('click', () => {
      fechar();
      if (typeof onCancelar === 'function') onCancelar();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        fechar();
        if (typeof onCancelar === 'function') onCancelar();
      }
    });

    btnConfirmar.focus();
  }
  window.mostrarDialogoConfirmacao = mostrarDialogoConfirmacao;

  function mostrarDialogoAlerta({ titulo = 'Aviso', mensagem, textoBotao = 'Entendido', onFechar }) {
    const existente = document.getElementById('custom-dialog-overlay');
    if (existente) existente.remove();

    const overlay = document.createElement('div');
    overlay.id = 'custom-dialog-overlay';
    overlay.className = 'custom-dialog-overlay';

    overlay.innerHTML = `
      <div class="custom-dialog-box" role="dialog" aria-modal="true">
        <h4 class="custom-dialog-title">${titulo}</h4>
        <p class="custom-dialog-msg">${mensagem}</p>
        <div class="custom-dialog-actions">
          <button type="button" class="custom-dialog-btn confirmar-primario" id="btn-dialog-ok">${textoBotao}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const btnOk = overlay.querySelector('#btn-dialog-ok');
    const fechar = () => {
      overlay.remove();
      if (typeof onFechar === 'function') onFechar();
    };

    btnOk.addEventListener('click', fechar);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) fechar();
    });

    btnOk.focus();
  }
  window.mostrarDialogoAlerta = mostrarDialogoAlerta;

  // ========================================================
  // Notificação Toast com Desfazer (4 Segundos)
  // ========================================================
  let toastDesfazerTimer = null;

  function mostrarToastDesfazer({ mensagem, tempoSegundos = 4, onDesfazer }) {
    const anterior = document.getElementById('toast-desfazer-container');
    if (anterior) anterior.remove();
    if (toastDesfazerTimer) clearTimeout(toastDesfazerTimer);

    const container = document.createElement('div');
    container.id = 'toast-desfazer-container';
    container.className = 'toast-desfazer-container';

    container.innerHTML = `
      <div class="toast-desfazer-box" id="toast-desfazer-box">
        <span class="toast-desfazer-texto">${mensagem}</span>
        <button type="button" class="toast-desfazer-btn" id="btn-toast-desfazer">Desfazer</button>
      </div>
    `;

    document.body.appendChild(container);

    const box = container.querySelector('#toast-desfazer-box');
    const btnDesfazer = container.querySelector('#btn-toast-desfazer');

    const fecharToast = () => {
      if (box) box.classList.add('fade-out');
      setTimeout(() => container.remove(), 280);
    };

    btnDesfazer.addEventListener('click', () => {
      clearTimeout(toastDesfazerTimer);
      fecharToast();
      if (typeof onDesfazer === 'function') onDesfazer();
    });

    toastDesfazerTimer = setTimeout(() => {
      fecharToast();
    }, tempoSegundos * 1000);
  }
  window.mostrarToastDesfazer = mostrarToastDesfazer;

  function fecharModal() {
    if (modalDetalhes) {
      modalDetalhes.style.display = 'none';
    }
    if (painelLinkManual) painelLinkManual.style.display = 'none';
    if (modalViewMode) modalViewMode.style.display = 'block';
    if (modalEditMode) modalEditMode.style.display = 'none';
  }
  window.fecharModal = fecharModal;

  if (btnFecharModal) {
    btnFecharModal.addEventListener('click', fecharModal);
  }

  if (modalDetalhes) {
    modalDetalhes.addEventListener('click', (e) => {
      if (e.target === modalDetalhes) fecharModal();
    });
  }

  // Alternância do Modo de Edição
  if (btnEditarModal) {
    btnEditarModal.addEventListener('click', () => {
      const item = obterItemAtual();
      if (!item) return;

      document.getElementById('edit-titulo').value = item.titulo || '';
      document.getElementById('edit-codigo').value = item.codigo || '';
      document.getElementById('edit-tipo').value = item.tipoDocumento || 'PR - Procedimento';
      document.getElementById('edit-status').value = item.status || 'Em Revisão';
      document.getElementById('edit-revisao').value = item.revisao ?? '0';
      document.getElementById('edit-remetente').value = item.remetente || '';
      document.getElementById('edit-area').value = item.area || '';
      document.getElementById('edit-disciplina').value = item.disciplina || '';
      document.getElementById('edit-data-recebimento').value = item.dataRecebimento || '';
      document.getElementById('edit-data-revisao').value = item.dataRevisao || '';
      document.getElementById('edit-observacao').value = item.observacao || '';

      modalViewMode.style.display = 'none';
      modalEditMode.style.display = 'block';
    });
  }

  if (btnCancelarEdicao) {
    btnCancelarEdicao.addEventListener('click', () => {
      modalEditMode.style.display = 'none';
      modalViewMode.style.display = 'block';
    });
  }

  if (formEdicaoModal) {
    formEdicaoModal.addEventListener('submit', (e) => {
      e.preventDefault();
      const item = obterItemAtual();
      if (!item) return;

      item.titulo = document.getElementById('edit-titulo').value.trim();
      item.codigo = document.getElementById('edit-codigo').value.trim();
      item.tipoDocumento = document.getElementById('edit-tipo').value;
      item.status = document.getElementById('edit-status').value;
      item.revisao = document.getElementById('edit-revisao').value;
      item.remetente = document.getElementById('edit-remetente').value.trim();
      item.area = document.getElementById('edit-area').value.trim();
      item.disciplina = document.getElementById('edit-disciplina').value.trim();
      item.dataRecebimento = document.getElementById('edit-data-recebimento').value;
      item.dataRevisao = document.getElementById('edit-data-revisao').value;
      item.observacao = document.getElementById('edit-observacao').value.trim();

      itemDetalheAtualChave = (item.codigo || '').trim().toLowerCase() || (item.titulo || '').trim().toLowerCase();

      salvarTramitacoes(tramitacoes, 'Edição de Dados');
      renderizarQuadro();

      modalEditMode.style.display = 'none';
      modalViewMode.style.display = 'block';

      const novoIndex = tramitacoes.findIndex(t => 
        (t.codigo && t.codigo.trim().toLowerCase() === itemDetalheAtualChave) ||
        (t.titulo && t.titulo.trim().toLowerCase() === itemDetalheAtualChave)
      );
      window.abrirModalDetalhes(novoIndex !== -1 ? novoIndex : itemDetalheAtualIndex);
      mostrarDialogoAlerta({ titulo: 'Sucesso', mensagem: 'Dados do documento atualizados com sucesso!' });
    });
  }

  // Painel de Link Manual do SharePoint
  function alternarPainelLinkManual(abrir) {
    if (!painelLinkManual) return;
    if (abrir) {
      const item = obterItemAtual();
      inputLinkManual.value = item?.linkAnexo || '';
      painelLinkManual.style.display = 'flex';
      inputLinkManual.focus();
    } else {
      painelLinkManual.style.display = 'none';
    }
  }

  if (btnToggleLinkManual) {
    btnToggleLinkManual.addEventListener('click', () => {
      const visivel = painelLinkManual && painelLinkManual.style.display === 'flex';
      alternarPainelLinkManual(!visivel);
    });
  }

  if (btnCancelarLinkManual) {
    btnCancelarLinkManual.addEventListener('click', () => alternarPainelLinkManual(false));
  }

  if (btnSalvarLinkManual) {
    btnSalvarLinkManual.addEventListener('click', () => {
      const item = obterItemAtual();
      if (!item) return;

      const novoLink = (inputLinkManual?.value || '').trim();
      item.linkAnexo = novoLink;

      salvarTramitacoes(tramitacoes, 'Atualização de Link Manual');
      renderizarQuadro();
      alternarPainelLinkManual(false);

      const novoIndex = tramitacoes.findIndex(t => 
        (t.codigo && t.codigo.trim().toLowerCase() === itemDetalheAtualChave) ||
        (t.titulo && t.titulo.trim().toLowerCase() === itemDetalheAtualChave)
      );
      window.abrirModalDetalhes(novoIndex !== -1 ? novoIndex : itemDetalheAtualIndex);
      mostrarDialogoAlerta({ titulo: 'Sucesso', mensagem: 'Link da pasta do SharePoint atualizado com sucesso!' });
    });
  }

  // Controles de Upload de Arquivos no Modal
  if (modalInputFilePrincipal) {
    modalInputFilePrincipal.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && modalPreviewDocPrincipal) {
        modalPreviewDocPrincipal.textContent = file.name;
      } else if (modalPreviewDocPrincipal) {
        modalPreviewDocPrincipal.textContent = 'Nenhum';
      }
    });
  }

  if (modalInputFilesAnexos) {
    modalInputFilesAnexos.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (modalPreviewQtdAnexos) {
        modalPreviewQtdAnexos.textContent = `${files.length} arquivo${files.length !== 1 ? 's' : ''}`;
      }
    });
  }

  if (btnEnviarAnexosSharepoint) {
    btnEnviarAnexosSharepoint.addEventListener('click', async () => {
      const item = obterItemAtual();
      if (!item) return;

      const filePrincipal = modalInputFilePrincipal?.files[0];
      const filesAnexos = Array.from(modalInputFilesAnexos?.files || []);

      if (!filePrincipal && filesAnexos.length === 0) {
        mostrarDialogoAlerta({ titulo: 'Atenção', mensagem: 'Selecione pelo menos o documento principal ou um anexo para enviar ao SharePoint.' });
        return;
      }

      const textoOriginal = btnEnviarAnexosSharepoint.innerHTML;
      btnEnviarAnexosSharepoint.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        </svg>
        <span>Criando Pasta e Enviando Arquivos...</span>
      `;
      btnEnviarAnexosSharepoint.disabled = true;

      try {
        let docPrincipalPayload = null;
        if (filePrincipal) {
          docPrincipalPayload = await arquivoParaBase64(filePrincipal);
        }

        const anexosPayload = [];
        for (const f of filesAnexos) {
          const b64 = await arquivoParaBase64(f);
          anexosPayload.push(b64);
        }

        const resUpload = await enviarArquivosParaSharePoint(item, docPrincipalPayload, anexosPayload);

        item.linkAnexo = resUpload.linkAnexo;
        item.nomePasta = resUpload.nomePasta;
        if (docPrincipalPayload) {
          item.nomeArquivoPrincipal = docPrincipalPayload.nome;
        } else if (filesAnexos.length > 0 && !item.nomeArquivoPrincipal) {
          item.nomeArquivoPrincipal = filesAnexos[0].name;
        }
        item.qtdAnexos = (item.qtdAnexos || 0) + anexosPayload.length;

        salvarTramitacoes(tramitacoes, 'Anexos SharePoint Salvos');
        renderizarQuadro();

        mostrarDialogoAlerta({ titulo: 'Sucesso', mensagem: 'Pasta criada e arquivos enviados com sucesso para o SharePoint!\nLink gerado e vinculado ao documento.' });
        if (modalInputFilePrincipal) modalInputFilePrincipal.value = '';
        if (modalInputFilesAnexos) modalInputFilesAnexos.value = '';
        if (modalPreviewDocPrincipal) modalPreviewDocPrincipal.textContent = 'Nenhum';
        if (modalPreviewQtdAnexos) modalPreviewQtdAnexos.textContent = '0 arquivos';

        const novoIndex = tramitacoes.findIndex(t => 
          (t.codigo && t.codigo.trim().toLowerCase() === itemDetalheAtualChave) ||
          (t.titulo && t.titulo.trim().toLowerCase() === itemDetalheAtualChave)
        );
        window.abrirModalDetalhes(novoIndex !== -1 ? novoIndex : itemDetalheAtualIndex);
      } catch (err) {
        mostrarDialogoAlerta({ titulo: 'Erro ao Enviar', mensagem: `Erro ao enviar arquivos para o SharePoint:\n${err.message}` });
      } finally {
        btnEnviarAnexosSharepoint.innerHTML = textoOriginal;
        btnEnviarAnexosSharepoint.disabled = false;
      }
    });
  }

  // ========================================================
  // Modal Flutuante de Documentos Cancelados
  // ========================================================
  const modalCancelados = document.getElementById('modal-cancelados');
  const btnAbrirCancelados = document.getElementById('btn-abrir-cancelados');
  const btnFecharCancelados = document.getElementById('btn-fechar-cancelados');
  const cardsCanceladosContainer = document.getElementById('cards-cancelados');
  const countCancelados = document.getElementById('count-cancelados');
  const modalCanceladosCount = document.getElementById('modal-cancelados-count');

  function fecharModalCancelados() {
    if (modalCancelados) modalCancelados.style.display = 'none';
  }
  window.fecharModalCancelados = fecharModalCancelados;

  function abrirModalCancelados() {
    if (modalCancelados) {
      modalCancelados.style.display = 'flex';
      renderizarQuadro();
    }
  }
  window.abrirModalCancelados = abrirModalCancelados;

  if (btnAbrirCancelados) {
    btnAbrirCancelados.addEventListener('click', abrirModalCancelados);
  }

  if (btnFecharCancelados) {
    btnFecharCancelados.addEventListener('click', fecharModalCancelados);
  }

  if (modalCancelados) {
    modalCancelados.addEventListener('click', (e) => {
      if (e.target === modalCancelados) fecharModalCancelados();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalDetalhes && modalDetalhes.style.display === 'flex') fecharModal();
      if (modalCancelados && modalCancelados.style.display === 'flex') fecharModalCancelados();
    }
  });

  window.abrirModalDetalhes = function(indexOriginal) {
    itemDetalheAtualIndex = indexOriginal;
    const item = tramitacoes[indexOriginal];
    if (!item || !modalDetalhes) return;

    itemDetalheAtualChave = (item.codigo || '').trim().toLowerCase() || (item.titulo || '').trim().toLowerCase();

    // Garante que o modal abre no modo de visualização
    if (modalViewMode) modalViewMode.style.display = 'block';
    if (modalEditMode) modalEditMode.style.display = 'none';
    if (painelLinkManual) painelLinkManual.style.display = 'none';

    if (modalCodigo) modalCodigo.textContent = item.codigo || 'S/ CÓDIGO';
    if (modalRevisao) modalRevisao.textContent = `Rev. ${item.revisao ?? '0'}`;

    // Status Badge
    let badgeClass = 'badge-default';
    const s = (item.status || '').toLowerCase().trim();
    if (s === 'cancelado') badgeClass = 'badge-cancelado';
    else if (s === 'aprovado') badgeClass = 'badge-aprovado';
    else if (s.includes('revis')) badgeClass = 'badge-revisao';
    else if (s === 'pendente') badgeClass = 'badge-pendente';

    if (modalStatusBadge) {
      modalStatusBadge.innerHTML = `<span class="badge ${badgeClass}">${item.status || 'Em Revisão'}</span>`;
    }

    if (modalTitulo) modalTitulo.textContent = item.titulo || 'Documento sem título';
    if (modalTipo) modalTipo.textContent = item.tipoDocumento || 'Documento Técnico';

    if (modalRemetente) modalRemetente.textContent = item.remetente || 'Não atribuído';
    if (modalAvatar) modalAvatar.textContent = obterInicial(item.remetente);

    const areaDisc = [item.area, item.disciplina].filter(Boolean).join(' • ') || 'Geral';
    if (modalAreaDisciplina) modalAreaDisciplina.textContent = areaDisc;

    if (modalDataRecebimento) modalDataRecebimento.textContent = formatarData(item.dataRecebimento);
    if (modalDataRevisao) modalDataRevisao.textContent = item.dataRevisao ? formatarData(item.dataRevisao) : 'Não definida';

    if (modalObservacao) modalObservacao.textContent = item.observacao || 'Nenhuma observação registrada para esta tramitação.';

    // Validação de Arquivos & Link do SharePoint
    const temLink = Boolean(item.linkAnexo && item.linkAnexo.trim() !== '');
    const temArquivos = Boolean(
      (item.nomeArquivoPrincipal && item.nomeArquivoPrincipal.trim() !== '') ||
      (item.qtdAnexos && Number(item.qtdAnexos) > 0)
    );

    // Seção de Arquivos
    if (modalArquivoPrincipal) {
      if (item.nomeArquivoPrincipal) {
        modalArquivoPrincipal.textContent = `Documento Principal: ${item.nomeArquivoPrincipal}`;
      } else if (temLink) {
        modalArquivoPrincipal.textContent = 'Documento Principal: Pasta vinculada no SharePoint';
      } else {
        modalArquivoPrincipal.textContent = 'Documento Principal: Nenhum arquivo anexado';
      }
    }

    if (modalQtdAnexos) {
      const qtd = item.qtdAnexos || 0;
      modalQtdAnexos.textContent = `Anexos Complementares: ${qtd} arquivo${qtd !== 1 ? 's' : ''} na pasta /Anexos`;
    }

    // Gerenciamento visual da seção de anexos
    if (!temArquivos && !temLink) {
      // Nenhum arquivo nem link disponível
      if (modalAlertaSemAnexos) modalAlertaSemAnexos.style.display = 'flex';
      if (modalFilesSummary) modalFilesSummary.style.display = 'none';
      if (painelUploadModal) painelUploadModal.style.display = 'block';
    } else {
      if (modalAlertaSemAnexos) modalAlertaSemAnexos.style.display = 'none';
      if (modalFilesSummary) modalFilesSummary.style.display = 'block';
      if (painelUploadModal) painelUploadModal.style.display = 'block';
    }

    // Botão de Link do SharePoint (sem cloneNode/replaceChild para não desanexar o elemento do DOM)
    const btnLinkSharepointEl = document.getElementById('modal-link-sharepoint');
    const textoLinkSharepointEl = document.getElementById('modal-texto-link-sharepoint');
    const btnToggleLinkManualEl = document.getElementById('btn-toggle-link-manual');

    if (btnLinkSharepointEl) {
      if (temLink) {
        btnLinkSharepointEl.href = item.linkAnexo;
        btnLinkSharepointEl.target = "_blank";
        btnLinkSharepointEl.onclick = null;
        if (textoLinkSharepointEl) textoLinkSharepointEl.textContent = "Abrir Pasta no SharePoint";
        if (btnToggleLinkManualEl) {
          btnToggleLinkManualEl.style.display = "inline-flex";
          btnToggleLinkManualEl.textContent = "✏️ Alterar Link";
        }
      } else {
        btnLinkSharepointEl.href = "javascript:void(0);";
        btnLinkSharepointEl.removeAttribute("target");
        btnLinkSharepointEl.onclick = (e) => {
          e.preventDefault();
          alternarPainelLinkManual(true);
        };
        if (textoLinkSharepointEl) textoLinkSharepointEl.textContent = "🔗 Inserir link da pasta do SharePoint";
        if (btnToggleLinkManualEl) {
          btnToggleLinkManualEl.style.display = "none";
        }
      }
    }

    // Ações rápidas no modal (Aprovar, Revisar, Pendente, Cancelar)
    if (modalQuickActions) {
      let btns = '';
      if (s === 'cancelado') {
        btns = `
          <button class="btn-primario" style="background:#2563eb; font-size: 12px; padding: 8px 16px;" onclick="window.moverStatus(${indexOriginal}, 'Em Revisão'); window.abrirModalDetalhes(${indexOriginal});">
            ↺ Reativar Documento
          </button>
        `;
      } else {
        if (s === 'aprovado') {
          btns = `
            <button class="btn-secundario" style="font-size: 12px; padding: 8px 16px;" onclick="window.moverStatus(${indexOriginal}, 'Em Revisão'); window.abrirModalDetalhes(${indexOriginal});">
              ↺ Reabrir Revisão
            </button>
          `;
        } else if (s === 'pendente') {
          btns = `
            <button class="btn-secundario" style="font-size: 12px; padding: 8px 16px;" onclick="window.moverStatus(${indexOriginal}, 'Em Revisão'); window.abrirModalDetalhes(${indexOriginal});">
              🔍 Em Revisão
            </button>
            <button class="btn-primario" style="background:#10b981; font-size: 12px; padding: 8px 16px;" onclick="window.moverStatus(${indexOriginal}, 'Aprovado'); window.abrirModalDetalhes(${indexOriginal});">
              ✓ Aprovar
            </button>
          `;
        } else {
          // Em Revisão
          btns = `
            <button class="btn-secundario" style="font-size: 12px; padding: 8px 16px;" onclick="window.moverStatus(${indexOriginal}, 'Pendente'); window.abrirModalDetalhes(${indexOriginal});">
              ⏳ Pendente
            </button>
            <button class="btn-primario" style="background:#10b981; font-size: 12px; padding: 8px 16px;" onclick="window.moverStatus(${indexOriginal}, 'Aprovado'); window.abrirModalDetalhes(${indexOriginal});">
              ✓ Aprovar
            </button>
          `;
        }

        // Botão Cancelar (Exclusão lógica do quadro ativo)
        btns += `
          <button class="btn-secundario" style="color: var(--cor-coral, #F1655D); border-color: rgba(241,101,93,0.35); font-size: 12px; padding: 8px 14px;" onclick="window.solicitarCancelamentoDocumento(${indexOriginal});">
            🚫 Cancelar
          </button>
        `;
      }
      modalQuickActions.innerHTML = btns;
    }

    modalDetalhes.style.display = 'flex';
  };

  // Função para mover de status
  window.moverStatus = function(indexNoArrayOriginal, novoStatus) {
    if (tramitacoes[indexNoArrayOriginal]) {
      tramitacoes[indexNoArrayOriginal].status = novoStatus;
      salvarTramitacoes(tramitacoes, 'Atualização de Status');
      sincronizarComPowerAutomate(tramitacoes[indexNoArrayOriginal]);
      renderizarQuadro();
    }
  };

  // Solicita cancelamento com caixa de diálogo retangular centralizada e toast temporário de desfazer (4 segundos)
  window.solicitarCancelamentoDocumento = function(indexOriginal) {
    const item = tramitacoes[indexOriginal];
    if (!item) return;

    mostrarDialogoConfirmacao({
      titulo: 'Cancelar documento',
      mensagem: 'Tem certeza que deseja cancelar este documento? Ele não será mais exibido no quadro ativo.',
      textoConfirmar: 'Sim, cancelar',
      textoCancelar: 'Voltar',
      perigo: true,
      onConfirmar: () => {
        const statusAnterior = item.status || 'Em Revisão';
        window.moverStatus(indexOriginal, 'Cancelado');
        window.fecharModal();

        mostrarToastDesfazer({
          mensagem: 'Documento cancelado com sucesso.',
          tempoSegundos: 4,
          onDesfazer: () => {
            window.moverStatus(indexOriginal, statusAnterior);
          }
        });
      }
    });
  };

  // Função para abrir o modal diretamente no modo de edição
  window.abrirModalEdicao = function(indexOriginal) {
    window.abrirModalDetalhes(indexOriginal);
    if (btnEditarModal) {
      btnEditarModal.click();
    }
  };

  // Cria o HTML de um cartão do Planner
  function criarCartao(item, indexOriginal) {
    const dataExibicao = item.dataRevisao ? formatarData(item.dataRevisao) : formatarData(item.dataRecebimento);
    const labelData = item.dataRevisao ? 'Revisão até' : 'Recebido em';

    return `
      <div class="planner-card" onclick="window.abrirModalDetalhes(${indexOriginal})" title="Clique para ver os detalhes completos">
        <div class="card-top-line">
          <span class="card-code">${item.codigo || 'S/ CÓDIGO'}</span>
          <span class="card-rev">Rev. ${item.revisao ?? '0'}</span>
        </div>

        <h4 class="card-heading">${item.titulo}</h4>

        ${item.tipoDocumento ? `<span class="card-type-tag">${item.tipoDocumento}</span>` : ''}

        <div class="card-meta-row">
          <div class="user-info">
            <span class="avatar-initial">${obterInicial(item.remetente)}</span>
            <span>${item.remetente || 'Não atribuído'}</span>
          </div>
          <div class="card-date" title="${labelData}">
            📅 ${dataExibicao}
          </div>
        </div>

        <div class="card-actions-quick">
          <button class="btn-card-action btn-card-edit" onclick="event.stopPropagation(); window.abrirModalEdicao(${indexOriginal});" title="Editar dados do documento">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
              <path d="m15 5 4 4"></path>
            </svg>
            <span>Editar</span>
          </button>
          <button class="btn-card-action btn-card-view" onclick="event.stopPropagation(); window.abrirModalDetalhes(${indexOriginal});" title="Exibir detalhes completos">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <circle cx="11.5" cy="14.5" r="2.8"></circle>
              <path d="m13.6 16.6 2.6 2.6"></path>
            </svg>
            <span>Detalhes</span>
          </button>
        </div>
      </div>
    `;
  }

  // Cria o HTML de um cartão Cancelado para o Modal Flutuante
  function criarCartaoCancelado(item, indexOriginal) {
    const dataExibicao = item.dataRevisao ? formatarData(item.dataRevisao) : formatarData(item.dataRecebimento);
    return `
      <div class="planner-card card-cancelado" onclick="window.abrirModalDetalhes(${indexOriginal})" title="Clique para ver os detalhes completos">
        <div class="card-top-line">
          <span class="card-code" style="color: var(--cor-coral); font-weight: 700;">${item.codigo || 'S/ CÓDIGO'}</span>
          <span class="badge badge-cancelado" style="font-size: 10px; padding: 2px 8px;">Cancelado</span>
        </div>

        <h4 class="card-heading" style="color: var(--cor-chumbo); margin: 4px 0 8px 0;">${item.titulo}</h4>

        <div class="card-meta-row">
          <div class="user-info">
            <span class="avatar-initial">${obterInicial(item.remetente)}</span>
            <span>${item.remetente || 'Não atribuído'}</span>
          </div>
          <div class="card-date" style="font-size: 11px;">
            📅 ${dataExibicao}
          </div>
        </div>

        <div class="card-actions-quick" style="justify-content: flex-end; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--cor-coral-suave);">
          <button class="btn-card-action" style="color: var(--cor-verde); border-color: rgba(102, 141, 88, 0.4); background-color: var(--cor-verde-suave);" onclick="event.stopPropagation(); window.moverStatus(${indexOriginal}, 'Em Revisão');" title="Reativar documento">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            <span>Reativar</span>
          </button>
          <button class="btn-card-action btn-card-view" onclick="event.stopPropagation(); window.abrirModalDetalhes(${indexOriginal});" title="Exibir detalhes">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <circle cx="11.5" cy="14.5" r="2.8"></circle>
              <path d="m13.6 16.6 2.6 2.6"></path>
            </svg>
            <span>Detalhes</span>
          </button>
        </div>
      </div>
    `;
  }

  // Renderiza todo o quadro
  function renderizarQuadro() {
    const termoBusca = (inputBusca?.value || '').toLowerCase().trim();
    const areaFiltro = (filtroArea?.value || '').trim();

    // Filtra preservando o índice original para permitir mover
    const itensFiltrados = tramitacoes.map((item, idx) => ({ ...item, _idx: idx })).filter(item => {
      const matchBusca = !termoBusca || 
        (item.titulo && item.titulo.toLowerCase().includes(termoBusca)) ||
        (item.codigo && item.codigo.toLowerCase().includes(termoBusca)) ||
        (item.remetente && item.remetente.toLowerCase().includes(termoBusca));

      const matchArea = !areaFiltro || item.area === areaFiltro;

      return matchBusca && matchArea;
    });

    // Separa por colunas (Cancelados são isolados do quadro ativo)
    const colRevisaoItens = [];
    const colPendenteItens = [];
    const colAprovadoItens = [];
    const colCanceladosItens = [];

    itensFiltrados.forEach(item => {
      const s = (item.status || '').toLowerCase().trim();
      if (s === 'cancelado') {
        colCanceladosItens.push(item);
      } else if (s === 'aprovado') {
        colAprovadoItens.push(item);
      } else if (s === 'pendente') {
        colPendenteItens.push(item);
      } else {
        colRevisaoItens.push(item); // Padrão: Em Revisão
      }
    });

    // Atualiza KPIs considerando apenas documentos ativos (não cancelados)
    const itensAtivos = itensFiltrados.filter(i => (i.status || '').toLowerCase().trim() !== 'cancelado');
    atualizarKPIs(itensAtivos);

    // Atualiza contadores das colunas principais
    if (countRevisao) countRevisao.textContent = colRevisaoItens.length;
    if (countPendente) countPendente.textContent = colPendenteItens.length;
    if (countAprovado) countAprovado.textContent = colAprovadoItens.length;

    // Atualiza contador do botão e modal de cancelados
    if (countCancelados) countCancelados.textContent = colCanceladosItens.length;
    if (modalCanceladosCount) modalCanceladosCount.textContent = colCanceladosItens.length;

    // Renderiza Coluna Em Revisão
    if (cardsRevisao) {
      cardsRevisao.innerHTML = colRevisaoItens.length === 0 
        ? '<div style="text-align: center; padding: 24px 10px; color: #94a3b8; font-size: 13px;">Nenhum documento em revisão</div>'
        : colRevisaoItens.map(item => criarCartao(item, item._idx)).join('');
    }

    // Renderiza Coluna Pendente
    if (cardsPendente) {
      cardsPendente.innerHTML = colPendenteItens.length === 0 
        ? '<div style="text-align: center; padding: 24px 10px; color: #94a3b8; font-size: 13px;">Nenhuma pendência ativa</div>'
        : colPendenteItens.map(item => criarCartao(item, item._idx)).join('');
    }

    // Renderiza Coluna Aprovado
    if (cardsAprovado) {
      cardsAprovado.innerHTML = colAprovadoItens.length === 0 
        ? '<div style="text-align: center; padding: 24px 10px; color: #94a3b8; font-size: 13px;">Nenhum documento aprovado</div>'
        : colAprovadoItens.map(item => criarCartao(item, item._idx)).join('');
    }

    // Renderiza Coluna Flutuante de Cancelados
    if (cardsCanceladosContainer) {
      cardsCanceladosContainer.innerHTML = colCanceladosItens.length === 0
        ? '<div style="text-align: center; padding: 40px 10px; color: #94a3b8; font-size: 13px;"><span style="font-size: 24px; display:block; margin-bottom: 8px;">🎉</span>Nenhum documento cancelado.</div>'
        : colCanceladosItens.map(item => criarCartaoCancelado(item, item._idx)).join('');
    }
  }

  // Ouvintes de eventos
  if (inputBusca) {
    inputBusca.addEventListener('input', renderizarQuadro);
  }

  if (filtroArea) {
    filtroArea.addEventListener('change', renderizarQuadro);
  }

  // Inicialização
  popularFiltroAreas();
  renderizarQuadro();
  inicializarMenuConfiguracoes('header-settings-dropdown');

  // Sincronização em segundo plano com o SharePoint se o webhook estiver ativo
  buscarDadosDoPowerAutomate().then((resultado) => {
    if (resultado.sucesso) {
      console.log(`DocFlow Planner: ${resultado.total} itens sincronizados da nuvem.`);
    }
  });
})();

