(() => {
  // 1. Webhook do Power Automate
  const URL_WEBHOOK_POWER_AUTOMATE = "https://defaultadd9956403f342bcb569ac9a4db4e9.f3.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/25/workflows/a2ea498f2b9040639632239654fabbd7/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kUvzix-PgeMqipfYBcMV10Y9SYbshheJkRAZ516j5ds";

  // 2. Estado local
  let tramitacoes = JSON.parse(localStorage.getItem('tramitacoes')) || [];

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

  // Envia atualização de status para o Power Automate
  async function sincronizarComPowerAutomate(item) {
    if (!URL_WEBHOOK_POWER_AUTOMATE || URL_WEBHOOK_POWER_AUTOMATE.includes("COLE_AQUI")) return;
    try {
      const payload = {
        "Título": item.titulo,
        "Código do documento": item.codigo,
        "Status": item.status,
        "Data de Recebimento": item.dataRecebimento,
        "Tipo de Documento": item.tipoDocumento,
        "Data de Revisão": item.dataRevisao,
        "Remetente": item.remetente,
        "Área": item.area,
        "Disciplina": item.disciplina,
        "Nº de Revisão": item.revisao,
        "N° de Revisão": item.revisao,
        "Observação": item.observacao,
        ...item
      };

      await fetch(URL_WEBHOOK_POWER_AUTOMATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Falha ao sincronizar com Power Automate:", e);
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

  function fecharModal() {
    if (modalDetalhes) {
      modalDetalhes.style.display = 'none';
    }
  }

  if (btnFecharModal) {
    btnFecharModal.addEventListener('click', fecharModal);
  }

  if (modalDetalhes) {
    modalDetalhes.addEventListener('click', (e) => {
      if (e.target === modalDetalhes) fecharModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalDetalhes && modalDetalhes.style.display === 'flex') {
      fecharModal();
    }
  });

  window.abrirModalDetalhes = function(indexOriginal) {
    const item = tramitacoes[indexOriginal];
    if (!item || !modalDetalhes) return;

    if (modalCodigo) modalCodigo.textContent = item.codigo || 'S/ CÓDIGO';
    if (modalRevisao) modalRevisao.textContent = `Rev. ${item.revisao ?? '0'}`;

    // Status Badge
    let badgeClass = 'badge-default';
    const s = (item.status || '').toLowerCase().trim();
    if (s === 'aprovado') badgeClass = 'badge-aprovado';
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

    // Arquivos
    if (modalArquivoPrincipal) {
      modalArquivoPrincipal.textContent = item.nomeArquivoPrincipal 
        ? `Documento Principal: ${item.nomeArquivoPrincipal}` 
        : 'Documento Principal: Arquivo anexado';
    }

    if (modalQtdAnexos) {
      const qtd = item.qtdAnexos || 0;
      modalQtdAnexos.textContent = `Anexos Complementares: ${qtd} arquivo${qtd !== 1 ? 's' : ''} na pasta /Anexos`;
    }

    // Link do SharePoint
    const baseUrlSharePoint = "https://grupomonto.sharepoint.com/sites/SGIMontoIndustrial/Repositrio%20%20Tramitao%20de%20Documentos/Documentos";
    const nomePasta = item.nomePasta || (item.titulo || '').replace(/[\~\"\#\%\&\*\:\<\>\?\/\\\{\|\}]/g, '-').trim();
    const linkFinal = item.linkAnexo || `${baseUrlSharePoint}/${encodeURIComponent(nomePasta)}`;

    if (modalLinkSharepoint) {
      modalLinkSharepoint.href = linkFinal;
    }

    // Ações rápidas no modal
    if (modalQuickActions) {
      let btns = '';
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
      modalQuickActions.innerHTML = btns;
    }

    modalDetalhes.style.display = 'flex';
  };

  // Função para mover de status
  window.moverStatus = function(indexNoArrayOriginal, novoStatus) {
    if (tramitacoes[indexNoArrayOriginal]) {
      tramitacoes[indexNoArrayOriginal].status = novoStatus;
      localStorage.setItem('tramitacoes', JSON.stringify(tramitacoes));
      sincronizarComPowerAutomate(tramitacoes[indexNoArrayOriginal]);
      renderizarQuadro();
    }
  };

  // Cria o HTML de um cartão do Planner
  function criarCartao(item, indexOriginal) {
    const s = (item.status || '').toLowerCase().trim();
    let botoesAcao = '';

    if (s === 'aprovado') {
      botoesAcao = `
        <button class="btn-status-quick" onclick="event.stopPropagation(); window.moverStatus(${indexOriginal}, 'Em Revisão')">
          ↺ Reabrir
        </button>
      `;
    } else if (s === 'pendente') {
      botoesAcao = `
        <button class="btn-status-quick" onclick="event.stopPropagation(); window.moverStatus(${indexOriginal}, 'Em Revisão')">
          🔍 Analisar
        </button>
        <button class="btn-status-quick" style="color: #16a34a;" onclick="event.stopPropagation(); window.moverStatus(${indexOriginal}, 'Aprovado')">
          ✓ Aprovar
        </button>
      `;
    } else {
      // Em Revisão
      botoesAcao = `
        <button class="btn-status-quick" style="color: #0284c7;" onclick="event.stopPropagation(); window.moverStatus(${indexOriginal}, 'Pendente')">
          ⏳ Pendente
        </button>
        <button class="btn-status-quick" style="color: #16a34a;" onclick="event.stopPropagation(); window.moverStatus(${indexOriginal}, 'Aprovado')">
          ✓ Aprovar
        </button>
      `;
    }

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
          ${botoesAcao}
          <button class="btn-status-quick" style="background:#eff6ff; color:#2563eb; border-color:#bfdbfe;" onclick="event.stopPropagation(); window.abrirModalDetalhes(${indexOriginal});">
            🔍 Detalhes
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

    // Atualiza KPIs
    atualizarKPIs(itensFiltrados);

    // Separa por colunas
    const colRevisaoItens = [];
    const colPendenteItens = [];
    const colAprovadoItens = [];

    itensFiltrados.forEach(item => {
      const s = (item.status || '').toLowerCase().trim();
      if (s === 'aprovado') colAprovadoItens.push(item);
      else if (s === 'pendente') colPendenteItens.push(item);
      else colRevisaoItens.push(item);
    });

    // Atualiza contadores das colunas
    if (countRevisao) countRevisao.textContent = colRevisaoItens.length;
    if (countPendente) countPendente.textContent = colPendenteItens.length;
    if (countAprovado) countAprovado.textContent = colAprovadoItens.length;

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
})();

