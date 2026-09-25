import {
  protegerPagina,
  configurarHeaderUsuario,
  obterUsuarioAtual
} from './auth-service.js';
import {
  obterTramitacoes,
  salvarTramitacoes,
  aoAtualizarDados,
  inicializarBarraSincronizacao,
  inicializarMenuConfiguracoes,
  buscarDadosDoPowerAutomate,
  URL_WEBHOOK_UPDATE_STATUS,
  arquivoParaBase64,
  enviarArquivosParaSharePoint,
  obterHistoricoDocumento,
  adicionarHistoricoAlteracao,
  inicializarHistoricoSeNecessario,
  gerarIdDocumento
} from './data-service.js';

protegerPagina();

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

  // Elementos do DOM das 5 Colunas do Kanban (Opção B)
  const cardsRecebido = document.getElementById('cards-recebido');
  const cardsRevisao = document.getElementById('cards-revisao');
  const cardsDevolvido = document.getElementById('cards-devolvido');
  const cardsAprovacao = document.getElementById('cards-aprovacao');
  const cardsAprovado = document.getElementById('cards-aprovado');

  const countRecebido = document.getElementById('count-col-recebido');
  const countRevisao = document.getElementById('count-col-revisao');
  const countDevolvido = document.getElementById('count-col-devolvido');
  const countAprovacao = document.getElementById('count-col-aprovacao');
  const countAprovado = document.getElementById('count-col-aprovado');

  const inputBusca = document.getElementById('input-busca');
  const filtroArea = document.getElementById('filtro-area');

  // Elementos dos 4 KPIs focados em prazo
  const kpiTotal = document.getElementById('kpi-total');
  const kpiVencendo = document.getElementById('kpi-vencendo');
  const kpiAtrasado = document.getElementById('kpi-atrasado');
  const kpiAprovado = document.getElementById('kpi-aprovado');

  const subTotal = document.getElementById('sub-kpi-total');
  const subVencendo = document.getElementById('sub-kpi-vencendo');
  const subAtrasado = document.getElementById('sub-kpi-atrasado');
  const subAprovado = document.getElementById('sub-kpi-aprovado');

  // Retorna a classe visual do badge de acordo com a fase do status
  function obterBadgeClassStatus(statusStr) {
    if (!statusStr) return 'status-recebido';
    const s = statusStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (s === 'cancelado') return 'status-cancelado';
    if (s === 'aprovado' || s === 'aprovacao final') return 'status-aprovado';
    if (s.includes('aprovacao')) return 'status-aprovacao';
    if (s.includes('devolvido') || s.includes('solicitante') || s === 'pendente') return 'status-devolvido';
    if (s === 'recebido') return 'status-recebido';
    return 'status-revisao';
  }

  // Retorna a coluna do Kanban correspondente ao status (Opção B - 5 Colunas)
  function classificarColuna(statusStr) {
    if (!statusStr) return 'recebido';
    const s = statusStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (s === 'cancelado') return 'cancelado';
    if (s === 'aprovado' || s === 'aprovacao final') return 'aprovado';
    if (s.includes('aprovacao')) return 'aprovacao';
    if (s.includes('devolvido') || s.includes('solicitante') || s === 'pendente') return 'devolvido';
    if (s === 'recebido') return 'recebido';
    return 'revisao';
  }

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

  // Calcula o estado do prazo de revisão (atrasado / vencendo / no prazo) a partir de uma data YYYY-MM-DD
  function calcularStatusPrazo(dataRevisaoStr) {
    if (!dataRevisaoStr) return null;
    const partes = dataRevisaoStr.split('-');
    if (partes.length !== 3) return null;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const prazo = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    if (isNaN(prazo.getTime())) return null;

    const diffDias = Math.round((prazo - hoje) / 86400000);

    if (diffDias < 0) {
      const dias = Math.abs(diffDias);
      return { classe: 'prazo-atrasado', texto: `Atrasado há ${dias} dia${dias !== 1 ? 's' : ''}`, diffDias };
    }
    if (diffDias === 0) {
      return { classe: 'prazo-vencendo', texto: 'Vence hoje', diffDias };
    }
    if (diffDias <= 5) {
      return { classe: 'prazo-vencendo', texto: `Vence em ${diffDias} dia${diffDias !== 1 ? 's' : ''}`, diffDias };
    }
    return { classe: 'prazo-ok', texto: `Prazo: ${formatarData(dataRevisaoStr)}`, diffDias };
  }

  // Conta quantas vezes o documento já foi devolvido ao solicitante/área (retrabalho), a partir do histórico
  function contarDevolucoes(item, indexOriginal) {
    const idDoc = item.id || gerarIdDocumento(item, indexOriginal);
    inicializarHistoricoSeNecessario(item);
    const historico = obterHistoricoDocumento(idDoc || item.codigo);
    return historico.filter(h => {
      const s = (h.status || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return s.includes('devolvido');
    }).length;
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

  // Atualiza os 4 indicadores focados em prazo (Total ativo / Vencendo / Atrasados / Aprovados)
  function atualizarKPIs(itens) {
    let ativos = 0;
    let vencendo = 0;
    let atrasado = 0;
    let aprovado = 0;

    itens.forEach(item => {
      const col = classificarColuna(item.status);
      if (col === 'aprovado') {
        aprovado++;
        return;
      }
      ativos++;
      const infoPrazo = calcularStatusPrazo(item.dataRevisao);
      if (!infoPrazo) return;
      if (infoPrazo.classe === 'prazo-atrasado') atrasado++;
      else if (infoPrazo.classe === 'prazo-vencendo') vencendo++;
    });

    if (kpiTotal) kpiTotal.textContent = ativos;
    if (kpiVencendo) kpiVencendo.textContent = vencendo;
    if (kpiAtrasado) kpiAtrasado.textContent = atrasado;
    if (kpiAprovado) kpiAprovado.textContent = aprovado;

    if (subTotal) subTotal.textContent = 'documentos em tramitação ativa';
    if (subVencendo) subVencendo.textContent = 'prazo entre hoje e 5 dias';
    if (subAtrasado) subAtrasado.textContent = 'passaram do prazo de revisão';
    if (subAprovado) subAprovado.textContent = 'concluídos este mês';
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
  const modalQuickActions = document.getElementById('modal-quick-actions');
  const modalIdBadge = document.getElementById('modal-id-badge');
  const timelineRiverContainer = document.getElementById('timeline-river-container');
  const selectNovaEtapa = document.getElementById('select-nova-etapa');
  const inputEtapaObservacao = document.getElementById('input-etapa-observacao');
  const containerDefinirResponsavel = document.getElementById('container-definir-responsavel');
  const inputEtapaDestino = document.getElementById('input-etapa-destino');
  const btnSalvarNovaEtapa = document.getElementById('btn-salvar-nova-etapa');

  // Elementos do Modal de Auditoria e Histórico Completo
  const btnVerAuditoriaModal = document.getElementById('btn-ver-auditoria');
  const modalAuditoria = document.getElementById('modal-auditoria');
  const btnFecharAuditoria = document.getElementById('btn-fechar-auditoria');
  const btnFecharAuditoriaFooter = document.getElementById('btn-fechar-auditoria-footer');
  const modalAuditoriaCodigo = document.getElementById('modal-auditoria-codigo');
  const modalAuditoriaRevisao = document.getElementById('modal-auditoria-revisao');
  const modalAuditoriaTitulo = document.getElementById('modal-auditoria-titulo');
  const auditoriaTimelineContainer = document.getElementById('auditoria-timeline-container');

  let itemDetalheAtualIndex = null;
  let itemDetalheAtualChave = null;

  function formatarDataHora(isoOuStr) {
    if (!isoOuStr) return '-';
    try {
      const d = new Date(isoOuStr);
      if (isNaN(d.getTime())) return isoOuStr;
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const ano = d.getFullYear();
      const hora = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${ano} ${hora}:${min}`;
    } catch (_) {
      return isoOuStr;
    }
  }

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

      const statusAnterior = item.status || 'Recebido';
      const novoStatus = document.getElementById('edit-status').value;
      const novoTitulo = document.getElementById('edit-titulo').value.trim();
      const novoCodigo = document.getElementById('edit-codigo').value.trim();
      const novoTipo = document.getElementById('edit-tipo').value;
      const novoRevisao = document.getElementById('edit-revisao').value;
      const novoRemetente = document.getElementById('edit-remetente').value.trim();
      const novoArea = document.getElementById('edit-area').value.trim();
      const novoDisciplina = document.getElementById('edit-disciplina').value.trim();
      const novoDataRecebimento = document.getElementById('edit-data-recebimento').value;
      const novoDataRevisao = document.getElementById('edit-data-revisao').value;
      const novoObservacao = document.getElementById('edit-observacao').value.trim();

      const diffs = [];
      if ((item.titulo || '') !== novoTitulo) diffs.push({ campo: 'Título', antes: item.titulo || '', depois: novoTitulo });
      if ((item.codigo || '') !== novoCodigo) diffs.push({ campo: 'Código', antes: item.codigo || '', depois: novoCodigo });
      if ((item.tipoDocumento || '') !== novoTipo) diffs.push({ campo: 'Tipo', antes: item.tipoDocumento || '', depois: novoTipo });
      if ((item.status || '') !== novoStatus) diffs.push({ campo: 'Status', antes: statusAnterior, depois: novoStatus });
      if ((item.revisao ?? '') != novoRevisao) diffs.push({ campo: 'Revisão', antes: String(item.revisao ?? '0'), depois: String(novoRevisao) });
      if ((item.remetente || '') !== novoRemetente) diffs.push({ campo: 'Remetente', antes: item.remetente || '', depois: novoRemetente });
      if ((item.area || '') !== novoArea) diffs.push({ campo: 'Área', antes: item.area || '', depois: novoArea });
      if ((item.disciplina || '') !== novoDisciplina) diffs.push({ campo: 'Disciplina', antes: item.disciplina || '', depois: novoDisciplina });
      if ((item.dataRecebimento || '') !== novoDataRecebimento) diffs.push({ campo: 'Data Recebimento', antes: item.dataRecebimento || '', depois: novoDataRecebimento });
      if ((item.dataRevisao || '') !== novoDataRevisao) diffs.push({ campo: 'Data Revisão', antes: item.dataRevisao || '', depois: novoDataRevisao });
      if ((item.observacao || '') !== novoObservacao) diffs.push({ campo: 'Observações', antes: item.observacao || '', depois: novoObservacao });

      item.titulo = novoTitulo;
      item.codigo = novoCodigo;
      item.tipoDocumento = novoTipo;
      item.status = novoStatus;
      item.revisao = novoRevisao;
      item.remetente = novoRemetente;
      item.area = novoArea;
      item.disciplina = novoDisciplina;
      item.dataRecebimento = novoDataRecebimento;
      item.dataRevisao = novoDataRevisao;
      item.observacao = novoObservacao;

      const autorAcao = (typeof window !== 'undefined' && window.AuthService && typeof window.AuthService.obterUsuarioLogado === 'function')
        ? (window.AuthService.obterUsuarioLogado()?.nome || item.remetente || 'Usuário Atual')
        : (obterUsuarioAtual()?.nome || item.remetente || 'Usuário Atual');

      if (diffs.length > 0) {
        adicionarHistoricoAlteracao({
          idDocumento: item.id || gerarIdDocumento(item, itemDetalheAtualIndex),
          codigo: item.codigo,
          status: novoStatus,
          statusAnterior: statusAnterior,
          destino: item.area ? `${item.area} / Qualidade` : 'Qualidade',
          responsavel: autorAcao,
          autor: autorAcao,
          tipoAcao: statusAnterior !== novoStatus ? 'STATUS' : 'EDICAO',
          detalhes: diffs,
          observacao: statusAnterior !== novoStatus 
            ? `Status alterado para "${novoStatus}". Campos editados: ${diffs.map(d => d.campo).join(', ')}.`
            : `Edição de dados do documento (${diffs.map(d => d.campo).join(', ')}).`,
          enviarNuvem: true
        });
      }

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
      if (modalAuditoria && modalAuditoria.style.display === 'flex') fecharModalAuditoria();
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
    if (modalStatusBadge) {
      modalStatusBadge.innerHTML = `<span class="card-status-pill ${obterBadgeClassStatus(item.status)}">${item.status || 'Recebido'}</span>`;
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

    // Ações rápidas no modal para as etapas
    if (modalQuickActions) {
      let btns = '';
      const colAtual = classificarColuna(item.status);

      if (colAtual === 'cancelado') {
        btns = `
          <button class="btn-primario" style="background:#2563eb; font-size: 12px; padding: 8px 16px;" onclick="window.moverStatus(${indexOriginal}, 'Recebido'); window.abrirModalDetalhes(${indexOriginal});">
            ↺ Reativar Documento
          </button>
        `;
      } else {
        if (colAtual === 'aprovado') {
          btns = `
            <button class="btn-secundario" style="font-size: 12px; padding: 8px 16px;" onclick="window.moverStatus(${indexOriginal}, 'Em revisão da qualidade'); window.abrirModalDetalhes(${indexOriginal});">
              ↺ Reabrir Revisão
            </button>
          `;
        } else if (colAtual === 'recebido') {
          btns = `
            <button class="btn-primario" style="background: var(--cor-laranja, #F39C12); font-size: 12px; padding: 8px 16px;" onclick="window.moverStatus(${indexOriginal}, 'Em revisão da qualidade'); window.abrirModalDetalhes(${indexOriginal});">
              🔍 Iniciar Revisão
            </button>
            <button class="btn-secundario" style="font-size: 12px; padding: 8px 16px;" onclick="window.moverStatus(${indexOriginal}, 'Devolvido para área para revisão'); window.abrirModalDetalhes(${indexOriginal});">
              ↩ Devolver à Área
            </button>
          `;
        } else if (colAtual === 'revisao') {
          btns = `
            <button class="btn-secundario" style="font-size: 12px; padding: 8px 16px;" onclick="window.moverStatus(${indexOriginal}, 'Devolvido para área para revisão'); window.abrirModalDetalhes(${indexOriginal});">
              ↩ Devolver à Área
            </button>
            <button class="btn-secundario" style="font-size: 12px; padding: 8px 16px;" onclick="window.moverStatus(${indexOriginal}, 'Para aprovação da área solicitante'); window.abrirModalDetalhes(${indexOriginal});">
              📋 P/ Aprovação
            </button>
            <button class="btn-primario" style="background:#10b981; font-size: 12px; padding: 8px 16px;" onclick="window.moverStatus(${indexOriginal}, 'Aprovado'); window.abrirModalDetalhes(${indexOriginal});">
              ✓ Aprovar
            </button>
          `;
        } else if (colAtual === 'devolvido') {
          btns = `
            <button class="btn-primario" style="background: var(--cor-laranja, #F39C12); font-size: 12px; padding: 8px 16px;" onclick="window.moverStatus(${indexOriginal}, 'Em revisão da qualidade'); window.abrirModalDetalhes(${indexOriginal});">
              🔍 Retomar Revisão
            </button>
            <button class="btn-secundario" style="font-size: 12px; padding: 8px 16px;" onclick="window.moverStatus(${indexOriginal}, 'Para aprovação da área solicitante'); window.abrirModalDetalhes(${indexOriginal});">
              📋 P/ Aprovação
            </button>
          `;
        } else if (colAtual === 'aprovacao') {
          btns = `
            <button class="btn-secundario" style="font-size: 12px; padding: 8px 16px;" onclick="window.moverStatus(${indexOriginal}, 'Devolvido para correção'); window.abrirModalDetalhes(${indexOriginal});">
              ↩ Devolver p/ Correção
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

    // Renderiza a Linha do Tempo Estilo Rio Vertical
    renderizarRiverTimeline(item, indexOriginal);

    modalDetalhes.style.display = 'flex';
  };

  /**
   * Alterna expansão de detalhes de um evento na Linha do Tempo Estilo Rio
   */
  window.alternarDetalhesEventoTimeline = function(eventoId) {
    const el = document.getElementById(`detalhes-${eventoId}`);
    const hint = document.getElementById(`hint-${eventoId}`);
    if (!el) return;
    if (el.style.display === 'none' || !el.style.display) {
      el.style.display = 'block';
      if (hint) hint.textContent = '▴ Ocultar';
    } else {
      el.style.display = 'none';
      if (hint) hint.textContent = '▾ Detalhes';
    }
  };

  /**
   * Renderiza a Linha do Tempo no estilo Rio (vertical) no painel lateral de detalhes
   */
  function renderizarRiverTimeline(item, indexOriginal) {
    if (!timelineRiverContainer) return;

    const idDoc = item.id || gerarIdDocumento(item, indexOriginal);
    if (modalIdBadge) {
      modalIdBadge.textContent = idDoc;
      modalIdBadge.title = `ID da Tramitação: ${idDoc}`;
    }

    inicializarHistoricoSeNecessario(item);
    const historicoRaw = obterHistoricoDocumento(idDoc || item.codigo);

    if (historicoRaw.length === 0) {
      timelineRiverContainer.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-secondary); font-size: 13px;">Nenhuma alteração registrada ainda.</div>';
      return;
    }

    // Ordena do mais recente para o mais antigo (recente primeiro)
    const historico = [...historicoRaw].sort((a, b) => new Date(b.dataHora || 0) - new Date(a.dataHora || 0));

    const totalEventos = historico.length;
    const statusAtualNorm = (item.status || historico[0].status || '').toLowerCase().trim();
    const isParaAprovacaoQualidade = statusAtualNorm.includes('para aprovacao qualidade') || statusAtualNorm.includes('para aprovação qualidade');

    let html = '<div class="river-timeline-track">';

    // Se estiver com status atual de "Para aprovação qualidade", exibe o status "Aprovação" como próximo passo acima no topo
    if (isParaAprovacaoQualidade) {
      html += `
        <div class="river-step step-subsequent">
          <div class="river-axis-col">
            <div class="river-dot dot-subsequent" title="Próxima etapa: Aprovação">
              <span class="dot-subsequent-circle"></span>
            </div>
            <div class="river-line line-subsequent"></div>
          </div>
          <div class="river-body-col">
            <div class="river-step-card" style="opacity: 0.85; border-style: dashed;">
              <div class="river-header-row">
                <span class="river-status-badge status-badge-subsequent">Aprovação</span>
                <span class="river-subsequent-tag">Próxima Etapa</span>
              </div>
              <span class="river-subsequent-desc">Habilitado após validação da coordenação de qualidade</span>
            </div>
          </div>
        </div>
      `;
    }

    historico.forEach((evento, i) => {
      const isAtual = (i === 0);
      const dataFormatada = evento.dataExibicao || formatarDataHora(evento.dataHora) || '-';
      const temProximoAbaixo = (i < totalEventos - 1);
      const eventoId = evento.id || `hist-evt-${i}`;
      const autorExibicao = evento.autor || evento.responsavel || 'Usuário Atual';

      html += `
        <div class="river-step ${isAtual ? 'step-current' : 'step-past'}">
          <div class="river-axis-col">
            <div class="river-dot ${isAtual ? 'dot-current' : 'dot-past'}" title="${isAtual ? 'Etapa Atual: ' + evento.status : 'Etapa Anterior: ' + evento.status}">
              ${isAtual ? '<span class="pulse-ring"></span><span class="dot-core"></span>' : '<span class="dot-check">✓</span>'}
            </div>
            ${temProximoAbaixo ? '<div class="river-line line-orange"></div>' : ''}
          </div>
          <div class="river-body-col">
            <div class="river-step-card" onclick="window.alternarDetalhesEventoTimeline('${eventoId}')" title="Clique para ver os detalhes desta alteração">
              <div class="river-header-row">
                <span class="river-status-badge ${isAtual ? 'status-badge-current' : 'status-badge-past'}">${evento.status}</span>
                <span class="river-date-label">${dataFormatada}</span>
              </div>
              <div class="river-author-row">
                <span class="river-author-tag">👤 ${autorExibicao}</span>
                <span class="river-expand-hint" id="hint-${eventoId}">▾ Detalhes</span>
              </div>
              <div class="river-expanded-details" id="detalhes-${eventoId}" style="display: none;">
                <div class="river-details-box">
                  <div class="river-detail-row">
                    <strong>Realizado por:</strong>
                    <span>${autorExibicao}</span>
                  </div>
                  ${evento.statusAnterior ? `
                    <div class="river-detail-row">
                      <strong>Status anterior:</strong>
                      <span>${evento.statusAnterior}</span>
                    </div>
                  ` : ''}
                  ${evento.responsavel && evento.responsavel !== autorExibicao ? `
                    <div class="river-detail-row">
                      <strong>Responsável atribuído:</strong>
                      <span>${evento.responsavel}</span>
                    </div>
                  ` : ''}
                  ${evento.destino && evento.destino !== 'Qualidade' ? `
                    <div class="river-detail-row">
                      <strong>Destino / Encaminhamento:</strong>
                      <span>${evento.destino}</span>
                    </div>
                  ` : ''}
                  ${evento.observacao ? `
                    <div class="river-detail-row obs">
                      <strong>Observação:</strong>
                      <p>${evento.observacao}</p>
                    </div>
                  ` : '<div class="river-detail-row" style="color: #94a3b8; font-style: italic;">Sem observações registradas.</div>'}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    timelineRiverContainer.innerHTML = html;

    // Função auxiliar para verificar se o status requer definição de próximo responsável
    function statusRequerResponsavel(st) {
      if (!st) return false;
      const s = st.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return s.includes('devolvido') || 
             (s.includes('aprovacao') && (s.includes('area') || s.includes('qualidade')));
    }

    // Configura o seletor de nova etapa e controle de campos
    if (selectNovaEtapa) {
      selectNovaEtapa.value = '';
      if (inputEtapaObservacao) inputEtapaObservacao.value = '';
      if (inputEtapaDestino) inputEtapaDestino.value = '';
      if (containerDefinirResponsavel) containerDefinirResponsavel.style.display = 'none';

      selectNovaEtapa.onchange = () => {
        const val = selectNovaEtapa.value;
        const requer = statusRequerResponsavel(val);

        if (containerDefinirResponsavel) {
          containerDefinirResponsavel.style.display = requer ? 'flex' : 'none';
        }

        if (inputEtapaDestino) {
          if (!requer) {
            inputEtapaDestino.value = '';
          } else {
            const valNorm = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (valNorm.includes('devolvido')) {
              inputEtapaDestino.placeholder = `Área Solicitante (${item.area || 'Solicitante'})`;
              if (!inputEtapaDestino.value) inputEtapaDestino.value = `Área Solicitante (${item.area || 'Solicitante'})`;
            } else if (valNorm.includes('area')) {
              inputEtapaDestino.placeholder = `Gestor da Área (${item.area || 'Engenharia'})`;
              if (!inputEtapaDestino.value) inputEtapaDestino.value = `Gestor da Área (${item.area || 'Engenharia'})`;
            } else if (valNorm.includes('qualidade')) {
              inputEtapaDestino.placeholder = 'Coordenação da Qualidade';
              if (!inputEtapaDestino.value) inputEtapaDestino.value = 'Coordenação da Qualidade';
            }
          }
        }
      };
    }

    // Configura botão de registro de nova etapa
    if (btnSalvarNovaEtapa) {
      btnSalvarNovaEtapa.onclick = () => {
        const novoStatus = selectNovaEtapa ? selectNovaEtapa.value : '';
        if (!novoStatus) {
          alert('Por favor, selecione a nova etapa desejada.');
          return;
        }

        const requerResp = statusRequerResponsavel(novoStatus);
        const responsavelDefinido = (inputEtapaDestino ? inputEtapaDestino.value : '').trim();

        if (requerResp && !responsavelDefinido) {
          alert('Por favor, preencha o campo "Definir responsável" para esta etapa.');
          if (inputEtapaDestino) inputEtapaDestino.focus();
          return;
        }

        const observacaoTexto = (inputEtapaObservacao ? inputEtapaObservacao.value : '').trim();
        const usuarioLogado = (typeof window !== 'undefined' && window.AuthService && typeof window.AuthService.obterUsuarioLogado === 'function')
          ? (window.AuthService.obterUsuarioLogado()?.nome || item.remetente || 'Usuário Atual')
          : (obterUsuarioAtual()?.nome || item.remetente || 'Usuário Atual');

        const statusAnterior = item.status || 'Recebido';

        // 1. Registra no histórico
        adicionarHistoricoAlteracao({
          idDocumento: idDoc,
          codigo: item.codigo,
          status: novoStatus,
          statusAnterior: statusAnterior,
          destino: responsavelDefinido || 'Qualidade',
          responsavel: responsavelDefinido || usuarioLogado,
          autor: usuarioLogado,
          tipoAcao: 'STATUS',
          observacao: observacaoTexto || `Etapa alterada de "${statusAnterior}" para "${novoStatus}".`,
          enviarNuvem: true
        });

        // 2. Atualiza item
        item.status = novoStatus;
        salvarTramitacoes(tramitacoes, 'Atualização de Etapa');
        sincronizarComPowerAutomate(item);

        // 3. Limpa formulário de controle de etapa
        if (selectNovaEtapa) selectNovaEtapa.value = '';
        if (inputEtapaObservacao) inputEtapaObservacao.value = '';
        if (inputEtapaDestino) inputEtapaDestino.value = '';
        if (containerDefinirResponsavel) containerDefinirResponsavel.style.display = 'none';

        // 4. Atualiza interface e Kanban
        renderizarQuadro();
        renderizarRiverTimeline(item, indexOriginal);

        // Atualiza badge de status no topo do modal
        if (modalStatusBadge) {
          let bClass = 'badge-default';
          const sLower = novoStatus.toLowerCase();
          if (sLower === 'cancelado') bClass = 'badge-cancelado';
          else if (sLower === 'aprovado' || sLower === 'aprovação final') bClass = 'badge-aprovado';
          else if (sLower.includes('revisão junto à área') || sLower.includes('revisao junto a area')) bClass = 'badge-revisao-area';
          else if (sLower.includes('revis') || sLower.includes('qualidade')) bClass = 'badge-revisao';
          else if (sLower === 'pendente' || sLower.includes('solicitante') || sLower.includes('correcao') || sLower.includes('devolvido')) bClass = 'badge-pendente';
          modalStatusBadge.innerHTML = `<span class="badge ${bClass}">${novoStatus}</span>`;
        }

        btnSalvarNovaEtapa.innerHTML = '<span>✓ Registrado!</span>';
        setTimeout(() => {
          btnSalvarNovaEtapa.innerHTML = `
            <span>Registrar Alteração</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          `;
        }, 1500);
      };
    }
  }

  // Função para mover de status
  window.moverStatus = function(indexNoArrayOriginal, novoStatus) {
    if (tramitacoes[indexNoArrayOriginal]) {
      const item = tramitacoes[indexNoArrayOriginal];
      const statusAnt = item.status;
      item.status = novoStatus;

      const usuarioLogado = (typeof window !== 'undefined' && window.AuthService && typeof window.AuthService.obterUsuarioLogado === 'function')
        ? (window.AuthService.obterUsuarioLogado()?.nome || item.remetente || 'Usuário Atual')
        : (obterUsuarioAtual()?.nome || item.remetente || 'Usuário Atual');

      const isCancelado = novoStatus.toLowerCase() === 'cancelado';

      adicionarHistoricoAlteracao({
        idDocumento: item.id || gerarIdDocumento(item, indexNoArrayOriginal),
        codigo: item.codigo,
        status: novoStatus,
        statusAnterior: statusAnt,
        destino: novoStatus === 'Aprovado' ? 'Arquivo Geral / Concluído' : 'Qualidade',
        responsavel: usuarioLogado,
        autor: usuarioLogado,
        tipoAcao: isCancelado ? 'CANCELAMENTO' : 'STATUS',
        observacao: isCancelado ? 'Documento cancelado pelo usuário.' : `Status alterado de "${statusAnt}" para "${novoStatus}".`,
        enviarNuvem: true
      });

      salvarTramitacoes(tramitacoes, 'Atualização de Status');
      sincronizarComPowerAutomate(item);
      renderizarQuadro();

      if (modalDetalhes && modalDetalhes.style.display === 'flex' && itemDetalheAtualIndex === indexNoArrayOriginal) {
        renderizarRiverTimeline(item, indexNoArrayOriginal);
      }
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

    const colAtual = classificarColuna(item.status);
    const infoPrazo = colAtual !== 'aprovado' ? calcularStatusPrazo(item.dataRevisao) : null;
    const qtdDevolucoes = contarDevolucoes(item, indexOriginal);

    return `
      <div class="planner-card" onclick="window.abrirModalDetalhes(${indexOriginal})" title="Clique para ver os detalhes completos">
        <div class="card-top-line">
          <span class="card-code">${item.codigo || 'S/ CÓDIGO'}</span>
          <span class="card-rev">Rev. ${item.revisao ?? '0'}</span>
        </div>

        <h4 class="card-heading">${item.titulo}</h4>

        <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 8px; flex-wrap: wrap;">
          <span class="card-status-pill ${obterBadgeClassStatus(item.status)}">${item.status || 'Recebido'}</span>
          ${item.tipoDocumento ? `<span class="card-type-tag">${item.tipoDocumento}</span>` : ''}
        </div>

        ${(infoPrazo || qtdDevolucoes > 0) ? `
          <div class="card-prazo-row">
            ${infoPrazo ? `<span class="prazo-pill ${infoPrazo.classe}">${infoPrazo.texto}</span>` : '<span></span>'}
            ${qtdDevolucoes > 0 ? `<span class="devolucao-pill" title="Este documento já retornou ${qtdDevolucoes} vez${qtdDevolucoes !== 1 ? 'es' : ''} ao solicitante/área">↺ ${qtdDevolucoes}×</span>` : ''}
          </div>
        ` : ''}

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
          <button class="btn-card-action btn-card-auditoria" onclick="event.stopPropagation(); window.abrirModalAuditoria(${indexOriginal});" title="Ver histórico de alterações">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Histórico</span>
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
          <button class="btn-card-action btn-card-auditoria" onclick="event.stopPropagation(); window.abrirModalAuditoria(${indexOriginal});" title="Ver histórico de alterações">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Histórico</span>
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
    const colRecebidoItens = [];
    const colRevisaoItens = [];
    const colDevolvidoItens = [];
    const colAprovacaoItens = [];
    const colAprovadoItens = [];
    const colCanceladosItens = [];

    itensFiltrados.forEach(item => {
      const col = classificarColuna(item.status);
      if (col === 'cancelado') {
        colCanceladosItens.push(item);
      } else if (col === 'recebido') {
        colRecebidoItens.push(item);
      } else if (col === 'revisao') {
        colRevisaoItens.push(item);
      } else if (col === 'devolvido') {
        colDevolvidoItens.push(item);
      } else if (col === 'aprovacao') {
        colAprovacaoItens.push(item);
      } else if (col === 'aprovado') {
        colAprovadoItens.push(item);
      } else {
        colRecebidoItens.push(item);
      }
    });

    // Atualiza KPIs considerando apenas documentos ativos (não cancelados)
    const itensAtivos = itensFiltrados.filter(i => (i.status || '').toLowerCase().trim() !== 'cancelado');
    atualizarKPIs(itensAtivos);

    // Atualiza contadores das colunas principais
    if (countRecebido) countRecebido.textContent = colRecebidoItens.length;
    if (countRevisao) countRevisao.textContent = colRevisaoItens.length;
    if (countDevolvido) countDevolvido.textContent = colDevolvidoItens.length;
    if (countAprovacao) countAprovacao.textContent = colAprovacaoItens.length;
    if (countAprovado) countAprovado.textContent = colAprovadoItens.length;

    // Atualiza contador do botão e modal de cancelados
    if (countCancelados) countCancelados.textContent = colCanceladosItens.length;
    if (modalCanceladosCount) modalCanceladosCount.textContent = colCanceladosItens.length;

    // Renderiza Coluna 1: Recebido
    if (cardsRecebido) {
      cardsRecebido.innerHTML = colRecebidoItens.length === 0 
        ? '<div style="text-align: center; padding: 24px 10px; color: #94a3b8; font-size: 13px;">Nenhum documento recebido</div>'
        : colRecebidoItens.map(item => criarCartao(item, item._idx)).join('');
    }

    // Renderiza Coluna 2: Em Revisão
    if (cardsRevisao) {
      cardsRevisao.innerHTML = colRevisaoItens.length === 0 
        ? '<div style="text-align: center; padding: 24px 10px; color: #94a3b8; font-size: 13px;">Nenhum documento em revisão</div>'
        : colRevisaoItens.map(item => criarCartao(item, item._idx)).join('');
    }

    // Renderiza Coluna 3: Devolvido à Área
    if (cardsDevolvido) {
      cardsDevolvido.innerHTML = colDevolvidoItens.length === 0 
        ? '<div style="text-align: center; padding: 24px 10px; color: #94a3b8; font-size: 13px;">Nenhum documento devolvido</div>'
        : colDevolvidoItens.map(item => criarCartao(item, item._idx)).join('');
    }

    // Renderiza Coluna 4: Em Aprovação
    if (cardsAprovacao) {
      cardsAprovacao.innerHTML = colAprovacaoItens.length === 0 
        ? '<div style="text-align: center; padding: 24px 10px; color: #94a3b8; font-size: 13px;">Nenhum documento em aprovação</div>'
        : colAprovacaoItens.map(item => criarCartao(item, item._idx)).join('');
    }

    // Renderiza Coluna 5: Aprovado
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

  // ========================================================
  // Modal de Histórico Completo de Alterações (Auditoria Detalhada)
  // ========================================================
  function fecharModalAuditoria() {
    if (modalAuditoria) modalAuditoria.style.display = 'none';
  }
  window.fecharModalAuditoria = fecharModalAuditoria;

  window.abrirModalAuditoria = function(indexOriginal) {
    const item = tramitacoes[indexOriginal];
    if (!item || !modalAuditoria) return;

    const idDoc = item.id || gerarIdDocumento(item, indexOriginal);
    if (modalAuditoriaCodigo) modalAuditoriaCodigo.textContent = item.codigo || 'S/ CÓDIGO';
    if (modalAuditoriaRevisao) modalAuditoriaRevisao.textContent = `Rev. ${item.revisao ?? '0'}`;
    if (modalAuditoriaTitulo) modalAuditoriaTitulo.textContent = item.titulo || 'Documento sem título';

    inicializarHistoricoSeNecessario(item);
    const historico = obterHistoricoDocumento(idDoc || item.codigo);

    // Exibe eventos dos mais recentes para os mais antigos (recente primeiro)
    const eventosOrdenados = [...historico].sort((a, b) => new Date(b.dataHora || 0) - new Date(a.dataHora || 0));

    if (!auditoriaTimelineContainer) return;

    if (eventosOrdenados.length === 0) {
      auditoriaTimelineContainer.innerHTML = '<div class="auditoria-vazia">Nenhum evento registrado no histórico deste documento.</div>';
    } else {
      auditoriaTimelineContainer.innerHTML = eventosOrdenados.map((ev) => {
        const tipo = (ev.tipoAcao || 'STATUS').toUpperCase();
        let tipoClass = 'tipo-status';
        let tipoLabel = 'Mudança de Status';

        if (tipo === 'CRIACAO') {
          tipoClass = 'tipo-criacao';
          tipoLabel = 'Cadastro Inicial';
        } else if (tipo === 'EDICAO') {
          tipoClass = 'tipo-edicao';
          tipoLabel = 'Edição de Dados';
        } else if (tipo === 'ANEXO') {
          tipoClass = 'tipo-anexo';
          tipoLabel = 'Arquivos / SharePoint';
        } else if (tipo === 'CANCELAMENTO') {
          tipoClass = 'tipo-cancelamento';
          tipoLabel = 'Cancelamento';
        }

        const dataExib = ev.dataExibicao || formatarDataHora(ev.dataHora) || '-';
        const autor = ev.autor || ev.responsavel || 'Usuário Atual';

        // Renderiza lista de diffs se houver
        let diffHtml = '';
        if (ev.detalhes && Array.isArray(ev.detalhes) && ev.detalhes.length > 0) {
          diffHtml = `
            <ul class="auditoria-diff-list">
              ${ev.detalhes.map(d => `
                <li class="auditoria-diff-item">
                  <strong>${d.campo}:</strong> "${d.antes || 'vazio'}" ➔ "${d.depois || 'vazio'}"
                </li>
              `).join('')}
            </ul>
          `;
        }

        return `
          <div class="auditoria-item-card">
            <div class="auditoria-item-top">
              <div class="auditoria-item-meta">
                <span class="auditoria-tipo-pill ${tipoClass}">${tipoLabel}</span>
                <span class="auditoria-item-autor">👤 ${autor}</span>
              </div>
              <span class="auditoria-item-data">🕒 ${dataExib}</span>
            </div>

            <div class="auditoria-item-detalhe">
              ${ev.status ? `<strong>Status:</strong> <span style="font-weight:600;">${ev.status}</span>` : ''}
              ${ev.statusAnterior ? ` <span style="color:#94a3b8; font-size:11px;">(anterior: ${ev.statusAnterior})</span>` : ''}
              ${ev.responsavel && ev.responsavel !== autor ? ` • <strong>Responsável:</strong> ${ev.responsavel}` : ''}
              ${ev.destino && ev.destino !== 'Qualidade' ? ` • <strong>Destino:</strong> ${ev.destino}` : ''}
            </div>

            ${diffHtml}

            ${ev.observacao ? `
              <div class="auditoria-obs-box">
                "${ev.observacao}"
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    modalAuditoria.style.display = 'flex';
  };

  if (btnFecharAuditoria) {
    btnFecharAuditoria.addEventListener('click', fecharModalAuditoria);
  }

  if (btnFecharAuditoriaFooter) {
    btnFecharAuditoriaFooter.addEventListener('click', fecharModalAuditoria);
  }

  if (btnVerAuditoriaModal) {
    btnVerAuditoriaModal.addEventListener('click', () => {
      if (itemDetalheAtualIndex !== null) {
        window.abrirModalAuditoria(itemDetalheAtualIndex);
      }
    });
  }

  if (modalAuditoria) {
    modalAuditoria.addEventListener('click', (e) => {
      if (e.target === modalAuditoria) fecharModalAuditoria();
    });
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
  configurarHeaderUsuario('header-user-badge');
  inicializarMenuConfiguracoes('header-settings-dropdown');

  // Sincronização em segundo plano com o SharePoint se o webhook estiver ativo
  buscarDadosDoPowerAutomate().then((resultado) => {
    if (resultado.sucesso) {
      console.log(`DocFlow Planner: ${resultado.total} itens sincronizados da nuvem.`);
    }
  });
})();

