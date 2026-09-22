(() => {
  // 1. Recupera as tramitações existentes no LocalStorage ou inicia uma lista vazia
  const tramitacoes = JSON.parse(localStorage.getItem('tramitacoes')) || [];

  // 2. Elementos da interface
  const formulario = document.getElementById('form-tramitacao');
  const tabelaCorpo = document.getElementById('tabela-corpo');

  // 3. Função responsável por desenhar as linhas na tabela
  function renderizarTabela() {
    if (!tabelaCorpo) return;

    tabelaCorpo.innerHTML = ''; // Limpa o corpo da tabela antes de desenhar

    tramitacoes.forEach((item) => {
      const linha = document.createElement('tr');

      linha.innerHTML = `
        <td>${item.codigo || '-'}</td>
        <td><strong>${item.titulo}</strong></td>
        <td>${item.tipoDocumento || '-'}</td>
        <td>${item.revisao ?? '0'}</td>
        <td>${item.status || '-'}</td>
        <td>${item.remetente || '-'}</td>
        <td>${item.area || '-'}</td>
      `;

      tabelaCorpo.appendChild(linha);
    });
  }

  // 4. Interceção do envio do formulário
  if (formulario) {
    formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();

      const novaTramitacao = {
        titulo: document.getElementById('titulo').value,
        codigo: document.getElementById('codigo').value,
        tipoDocumento: document.getElementById('tipo-documento').value,
        dataRecebimento: document.getElementById('data-recebimento').value,
        dataRevisao: document.getElementById('data-revisao').value,
        revisao: document.getElementById('revisao').value,
        status: document.getElementById('status').value,
        remetente: document.getElementById('remetente').value,
        area: document.getElementById('area').value,
        disciplina: document.getElementById('disciplina').value,
        observacao: document.getElementById('observacao').value
      };

      tramitacoes.push(novaTramitacao);
      localStorage.setItem('tramitacoes', JSON.stringify(tramitacoes));

      formulario.reset();
      renderizarTabela();
    });
  }

  // 5. Executa a listagem inicial ao carregar a página
  renderizarTabela();
})();
(() => {
  // 1. Recupera as tramitações existentes no LocalStorage ou inicia uma lista vazia
  const tramitacoes = JSON.parse(localStorage.getItem('tramitacoes')) || [];

  // 2. Elementos da interface
  const formulario = document.getElementById('form-tramitacao');
  const tabelaCorpo = document.getElementById('tabela-corpo');
  const btnExportar = document.getElementById('btn-exportar');

  // 3. Função responsável por desenhar as linhas na tabela
  function renderizarTabela() {
    if (!tabelaCorpo) return;

    tabelaCorpo.innerHTML = '';

    tramitacoes.forEach((item) => {
      const linha = document.createElement('tr');

      linha.innerHTML = `
        <td>${item.codigo || '-'}</td>
        <td><strong>${item.titulo}</strong></td>
        <td>${item.tipoDocumento || '-'}</td>
        <td>${item.revisao ?? '0'}</td>
        <td>${item.status || '-'}</td>
        <td>${item.remetente || '-'}</td>
        <td>${item.area || '-'}</td>
      `;

      tabelaCorpo.appendChild(linha);
    });
  }

  // 4. Interceção do envio do formulário
  if (formulario) {
    formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();

      const novaTramitacao = {
        titulo: document.getElementById('titulo').value,
        codigo: document.getElementById('codigo').value,
        tipoDocumento: document.getElementById('tipo-documento').value,
        dataRecebimento: document.getElementById('data-recebimento').value,
        dataRevisao: document.getElementById('data-revisao').value,
        revisao: document.getElementById('revisao').value,
        status: document.getElementById('status').value,
        remetente: document.getElementById('remetente').value,
        area: document.getElementById('area').value,
        disciplina: document.getElementById('disciplina').value,
        observacao: document.getElementById('observacao').value
      };

      tramitacoes.push(novaTramitacao);
      localStorage.setItem('tramitacoes', JSON.stringify(tramitacoes));

      formulario.reset();
      renderizarTabela();
    });
  }

  // 5. Função para gerar e descarregar o ficheiro CSV
  if (btnExportar) {
    btnExportar.addEventListener('click', () => {
      if (tramitacoes.length === 0) {
        alert('Não existem registos para exportar.');
        return;
      }

      // Cabeçalhos das colunas
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

      // Formatação de cada linha
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

      // Inclusão do marcador BOM (\uFEFF) para garantir a correta renderização de acentos no Excel
      const conteudoCsv = '\uFEFF' + [cabecalhos.join(';'), ...linhas].join('\r\n');

      // Criação do ficheiro descarregável
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

  // 6. Executa a listagem inicial
  renderizarTabela();
})();