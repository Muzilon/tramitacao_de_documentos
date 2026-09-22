import {
  obterTramitacoes,
  salvarTramitacoes,
  aoAtualizarDados,
  inicializarBarraSincronizacao,
  inicializarMenuConfiguracoes,
  buscarDadosDoPowerAutomate,
  URL_WEBHOOK_POST
} from './data-service.js';

(() => {
  // 1. URL do fluxo do Power Automate (para envio)
  const URL_WEBHOOK_POWER_AUTOMATE = URL_WEBHOOK_POST;

  // 2. Recupera as tramitações existentes na base
  let tramitacoes = obterTramitacoes();

  // Escuta atualizações vindas da importação de Excel ou do Power Automate
  aoAtualizarDados((novosDados) => {
    tramitacoes = novosDados;
    renderizarTabela();
  });

  // 3. Elementos da interface
  const formulario = document.getElementById('form-tramitacao');
  const tabelaCorpo = document.getElementById('tabela-corpo');
  const btnExportar = document.getElementById('btn-exportar');
  const contadorDoc = document.getElementById('contador-documentos');

  // Função auxiliar para renderizar o badge de status
  function getStatusBadge(status) {
    const statusLimpo = (status || '').trim().toLowerCase();
    if (statusLimpo === 'cancelado') {
      return `<span class="badge badge-cancelado">${status}</span>`;
    }
    if (statusLimpo === 'aprovado') {
      return `<span class="badge badge-aprovado">${status}</span>`;
    }
    if (statusLimpo === 'em revisão' || statusLimpo === 'em revisao') {
      return `<span class="badge badge-revisao">${status}</span>`;
    }
    if (statusLimpo === 'pendente') {
      return `<span class="badge badge-pendente">${status}</span>`;
    }
    return `<span class="badge badge-default">${status || '-'}</span>`;
  }

  // 4. Função para desenhar as linhas na tabela
  function renderizarTabela() {
    if (!tabelaCorpo) return;

    if (contadorDoc) {
      const qtd = tramitacoes.length;
      contadorDoc.textContent = qtd === 0 ? 'Nenhum documento registrado' : `${qtd} documento${qtd > 1 ? 's' : ''} registrado${qtd > 1 ? 's' : ''}`;
    }

    tabelaCorpo.innerHTML = '';

    if (tramitacoes.length === 0) {
      tabelaCorpo.innerHTML = `
        <tr>
          <td colspan="7" class="tabela-vazia">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: #cbd5e1;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <p>Nenhum documento cadastrado ainda.</p>
          </td>
        </tr>
      `;
      return;
    }

    tramitacoes.forEach((item) => {
      const linha = document.createElement('tr');
      const areaDisciplina = [item.area, item.disciplina].filter(Boolean).join(' • ') || '-';

      linha.innerHTML = `
        <td><span class="tabela-codigo">${item.codigo || '-'}</span></td>
        <td><strong class="tabela-titulo-doc">${item.titulo || '-'}</strong></td>
        <td>${item.tipoDocumento || '-'}</td>
        <td style="text-align: center; font-weight: 500;">${item.revisao ?? '0'}</td>
        <td>${getStatusBadge(item.status)}</td>
        <td>${item.remetente || '-'}</td>
        <td>${areaDisciplina}</td>
      `;

      tabelaCorpo.appendChild(linha);
    });
  }

  // 5. Utilitários para tratamento de arquivos e pastas
  function sanitizarNomePasta(nome) {
    return (nome || 'Documento_Sem_Titulo')
      .replace(/[\~\"\#\%\&\*\:\<\>\?\/\\\{\|\}]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function arquivoParaBase64(arquivo) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => {
        const resultado = leitor.result || '';
        const base64Data = resultado.includes(',') ? resultado.split(',')[1] : resultado;
        resolve({
          nome: arquivo.name,
          tipo: arquivo.type || 'application/octet-stream',
          tamanho: arquivo.size,
          conteudoBase64: base64Data
        });
      };
      leitor.onerror = (err) => reject(err);
      leitor.readAsDataURL(arquivo);
    });
  }

  // 6. Gerenciamento dos campos de arquivos na interface
  let listaAnexosArquivos = [];

  const inputDocPrincipal = document.getElementById('arquivo-principal');
  const previewDocPrincipal = document.getElementById('nome-doc-principal');
  const inputAnexos = document.getElementById('arquivos-anexos');
  const previewQtdAnexos = document.getElementById('qtd-anexos-complementares');
  const containerAnexosLista = document.getElementById('container-anexos-lista');
  const listaAnexosSelecionados = document.getElementById('lista-anexos-selecionados');

  if (inputDocPrincipal) {
    inputDocPrincipal.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && previewDocPrincipal) {
        previewDocPrincipal.textContent = file.name;
        previewDocPrincipal.title = file.name;
      } else if (previewDocPrincipal) {
        previewDocPrincipal.textContent = 'Nenhum selecionado';
      }
    });
  }

  function renderizarListaAnexos() {
    if (!listaAnexosSelecionados || !containerAnexosLista) return;
    listaAnexosSelecionados.innerHTML = '';
    if (listaAnexosArquivos.length === 0) {
      containerAnexosLista.style.display = 'none';
      if (previewQtdAnexos) previewQtdAnexos.textContent = '0 anexos adicionados';
      return;
    }
    containerAnexosLista.style.display = 'block';
    if (previewQtdAnexos) {
      previewQtdAnexos.textContent = `${listaAnexosArquivos.length} anexo${listaAnexosArquivos.length > 1 ? 's' : ''}`;
    }

    listaAnexosArquivos.forEach((file, index) => {
      const tag = document.createElement('span');
      tag.className = 'anexo-tag-item';
      tag.innerHTML = `
        <span>📎 ${file.name}</span>
        <span class="anexo-tag-remove" data-index="${index}" title="Remover anexo">&times;</span>
      `;
      listaAnexosSelecionados.appendChild(tag);
    });
  }

  if (inputAnexos) {
    inputAnexos.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      listaAnexosArquivos.push(...files);
      renderizarListaAnexos();
      inputAnexos.value = '';
    });
  }

  if (listaAnexosSelecionados) {
    listaAnexosSelecionados.addEventListener('click', (e) => {
      if (e.target.classList.contains('anexo-tag-remove')) {
        const idx = parseInt(e.target.dataset.index, 10);
        listaAnexosArquivos.splice(idx, 1);
        renderizarListaAnexos();
      }
    });
  }

  // 7. Função para enviar os dados para o Excel e SharePoint via Power Automate
  async function enviarParaExcelSharePoint(dados, arquivosPayload) {
    if (!URL_WEBHOOK_POWER_AUTOMATE || URL_WEBHOOK_POWER_AUTOMATE.includes("COLE_AQUI")) {
      console.warn("URL do Power Automate ainda não configurado.");
      return;
    }

    try {
      // Monta o link direto da pasta do documento no SharePoint
      const baseUrlSharePoint = "https://grupomonto.sharepoint.com/sites/SGIMontoIndustrial/Repositrio%20%20Tramitao%20de%20Documentos/Documentos";
      const linkAnexoDireto = `${baseUrlSharePoint}/${encodeURIComponent(arquivosPayload.nomePasta)}`;

      // Prepara o payload contemplando os dados do formulário e os anexos para o SharePoint
      const payload = {
        "Título": dados.titulo,
        "Código do documento": dados.codigo,
        "Status": dados.status,
        "Data de Recebimento": dados.dataRecebimento,
        "Tipo de Documento": dados.tipoDocumento,
        "Data de Revisão": dados.dataRevisao,
        "Remetente": dados.remetente,
        "Área": dados.area,
        "Disciplina": dados.disciplina,
        "Nº de Revisão": dados.revisao,
        "N° de Revisão": dados.revisao,
        "Observação": dados.observacao,
        "LinkAnexo": linkAnexoDireto,
        "Link Anexo": linkAnexoDireto,
        "linkAnexo": linkAnexoDireto,
        "nomePasta": arquivosPayload.nomePasta,
        "Nome da Pasta": arquivosPayload.nomePasta,
        "documentoPrincipal": arquivosPayload.documentoPrincipal,
        "Documento Principal": arquivosPayload.documentoPrincipal,
        "anexosComplementares": arquivosPayload.anexosComplementares,
        "Anexos Complementares": arquivosPayload.anexosComplementares,
        ...dados
      };

      const resposta = await fetch(URL_WEBHOOK_POWER_AUTOMATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (resposta.ok) {
        console.log("Registro e arquivos enviados ao SharePoint com sucesso!");
      } else {
        console.error("Erro ao enviar para o Power Automate:", resposta.status, resposta.statusText);
      }
    } catch (erro) {
      console.error("Falha na ligação com o Power Automate:", erro);
    }
  }

  // 8. Interceção do envio do formulário
  if (formulario) {
    formulario.addEventListener('submit', async (evento) => {
      evento.preventDefault();

      // Botão submit feedback
      const btnSubmit = document.getElementById('btn-submit');
      let conteudoOriginal = '';
      if (btnSubmit) {
        conteudoOriginal = btnSubmit.innerHTML;
        btnSubmit.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
          <span>Enviando com Anexos...</span>
        `;
        btnSubmit.disabled = true;
      }

      // Converte documento principal para Base64
      const filePrincipal = inputDocPrincipal?.files[0];
      let docPrincipalPayload = null;
      if (filePrincipal) {
        try {
          docPrincipalPayload = await arquivoParaBase64(filePrincipal);
        } catch (e) {
          console.error("Erro ao ler documento principal:", e);
        }
      }

      // Converte anexos complementares para Base64
      const anexosPayload = [];
      for (const f of listaAnexosArquivos) {
        try {
          const b64 = await arquivoParaBase64(f);
          anexosPayload.push(b64);
        } catch (e) {
          console.error("Erro ao ler anexo complementar:", e);
        }
      }

      const tituloValor = document.getElementById('titulo').value;
      const nomePastaSanitizada = sanitizarNomePasta(tituloValor);
      const baseUrlSharePoint = "https://grupomonto.sharepoint.com/sites/SGIMontoIndustrial/Repositrio%20%20Tramitao%20de%20Documentos/Documentos";
      const linkAnexoDireto = `${baseUrlSharePoint}/${encodeURIComponent(nomePastaSanitizada)}`;

      // Criação do objeto com os dados preenchidos
      const novaTramitacao = {
        titulo: tituloValor,
        codigo: document.getElementById('codigo').value,
        tipoDocumento: document.getElementById('tipo-documento').value,
        dataRecebimento: document.getElementById('data-recebimento').value,
        dataRevisao: document.getElementById('data-revisao').value,
        revisao: document.getElementById('revisao').value,
        status: document.getElementById('status').value,
        remetente: document.getElementById('remetente').value,
        area: document.getElementById('area').value,
        disciplina: document.getElementById('disciplina').value,
        observacao: document.getElementById('observacao').value,
        nomePasta: nomePastaSanitizada,
        nomeArquivoPrincipal: docPrincipalPayload ? docPrincipalPayload.nome : '',
        qtdAnexos: anexosPayload.length,
        linkAnexo: linkAnexoDireto
      };

      // Gravação na base oficial (Array + Cache Local)
      tramitacoes.push(novaTramitacao);
      salvarTramitacoes(tramitacoes, 'Novo Registro Local');

      // Atualização imediata da tabela no ecrã
      renderizarTabela();

      // Envio em segundo plano para o SharePoint via Power Automate
      await enviarParaExcelSharePoint(novaTramitacao, {
        nomePasta: nomePastaSanitizada,
        documentoPrincipal: docPrincipalPayload,
        anexosComplementares: anexosPayload
      });

      // Restaura botão
      if (btnSubmit) {
        btnSubmit.innerHTML = conteudoOriginal;
        btnSubmit.disabled = false;
      }

      // Limpeza dos campos do formulário
      formulario.reset();
      listaAnexosArquivos = [];
      renderizarListaAnexos();
      if (previewDocPrincipal) previewDocPrincipal.textContent = 'Nenhum selecionado';
    });
  }

  // 7. Exportação de dados para ficheiro CSV (Excel local)
  if (btnExportar) {
    btnExportar.addEventListener('click', () => {
      if (tramitacoes.length === 0) {
        alert('Não existem registos para exportar.');
        return;
      }

      const cabecalhos = [
        'Código',
        'Título',
        'Tipo de Documento',
        'N° de Revisão',
        'Status',
        'Data de Recebimento',
        'Data de Revisão',
        'Remetente',
        'Área',
        'Disciplina',
        'Observação'
      ];

      const linhas = tramitacoes.map((item) => [
        `"${item.codigo || ''}"`,
        `"${item.titulo || ''}"`,
        `"${item.tipoDocumento || ''}"`,
        `"${item.revisao ?? '0'}"`,
        `"${item.status || ''}"`,
        `"${item.dataRecebimento || ''}"`,
        `"${item.dataRevisao || ''}"`,
        `"${item.remetente || ''}"`,
        `"${item.area || ''}"`,
        `"${item.disciplina || ''}"`,
        `"${(item.observacao || '').replace(/"/g, '""')}"`
      ].join(';'));

      const conteudoCsv = '\uFEFF' + [cabecalhos.join(';'), ...linhas].join('\r\n');
      const blob = new Blob([conteudoCsv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute('download', 'tramitacao_documentos.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  // 8. Alternância de abas no topo (Novo Documento vs Revisão Técnica)
  const tabNovo = document.getElementById('tab-novo');
  const tabRevisao = document.getElementById('tab-revisao');
  const inputRevisao = document.getElementById('revisao');
  const inputCodigo = document.getElementById('codigo');

  if (tabNovo && tabRevisao) {
    tabNovo.addEventListener('click', () => {
      tabNovo.classList.add('active');
      tabRevisao.classList.remove('active');
      if (inputRevisao) inputRevisao.value = 0;
    });

    tabRevisao.addEventListener('click', () => {
      tabRevisao.classList.add('active');
      tabNovo.classList.remove('active');
      if (inputRevisao && (inputRevisao.value === '0' || !inputRevisao.value)) {
        inputRevisao.value = 1;
      }
      if (inputCodigo) inputCodigo.focus();
    });
  }

  // 9. Renderização inicial ao abrir a página
  renderizarTabela();
  inicializarMenuConfiguracoes('header-settings-dropdown');

  // 10. Tenta sincronizar automaticamente com a nuvem (se o webhook estiver configurado)
  buscarDadosDoPowerAutomate().then((resultado) => {
    if (resultado.sucesso) {
      console.log(`DocFlow: sincronizado com o SharePoint (${resultado.total} itens).`);
    }
  });
})();