/**
 * DocFlow - Formulário de cadastro/revisão de documentos
 * Cuida do formulário de tramitação, dos campos de arquivo (dropzones),
 * da tabela de registros recentes, da exportação CSV e das abas
 * "Novo Documento" / "Revisão Técnica".
 *
 * Conversão para TypeScript de ../formulario.js (etapa 4 da ideia
 * ideias/modelos/modelo_problema/2026-09-29_migracao-typescript-planejada.md).
 * O comportamento é o mesmo do original; as poucas diferenças (apenas em
 * casos anormais, como um elemento ausente no HTML) estão marcadas com
 * comentários "DIVERGÊNCIA".
 */

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
  URL_WEBHOOK_POST,
  adicionarHistoricoAlteracao,
  enfileirarEnvio
} from './data-service.js';
import type { DocumentoSGI } from './types.js';

// Observação: `inicializarBarraSincronizacao` é importado pelo original mas
// nunca usado; o import é mantido para preservar o mesmo conjunto de nomes.

// ========================================================
// Tipos auxiliares (locais a este módulo)
// ========================================================

/** Resultado da conversão de um arquivo para base64 (ver `arquivoParaBase64`). */
interface ArquivoConvertido {
  nome: string;
  tipo: string;
  tamanho: number;
  conteudoBase64: string;
}

/** Dados de arquivos enviados junto com o cadastro ao Power Automate. */
interface ArquivosPayload {
  nomePasta: string;
  documentoPrincipal: ArquivoConvertido | null;
  anexosComplementares: ArquivoConvertido[];
}

/** Elementos de formulário que possuem `.value` (input, select, textarea). */
type CampoFormulario = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** Obtém um campo de formulário pelo id, ou `null` se não existir / não for um campo. */
function obterCampo(id: string): CampoFormulario | null {
  const el = document.getElementById(id);
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLTextAreaElement
  ) {
    return el;
  }
  return null;
}

/** Obtém um `<input>` pelo id, ou `null`. */
function obterInput(id: string): HTMLInputElement | null {
  const el = document.getElementById(id);
  return el instanceof HTMLInputElement ? el : null;
}

/**
 * Lê o `.value` de um campo pelo id.
 * DIVERGÊNCIA: no original, `document.getElementById(id).value` lançava
 * TypeError se o campo não existisse (deixando o botão de envio travado em
 * "Enviando..."). Aqui um campo ausente vale ''. Com o HTML atual, todos os
 * campos existem e o resultado é idêntico.
 */
function valorCampo(id: string): string {
  const campo = obterCampo(id);
  return campo ? campo.value : '';
}

protegerPagina();

(() => {
  // 1. URL do fluxo do Power Automate (para envio)
  const URL_WEBHOOK_POWER_AUTOMATE: string = URL_WEBHOOK_POST;

  // 2. Recupera as tramitações existentes na base
  let tramitacoes: DocumentoSGI[] = obterTramitacoes();

  // Escuta atualizações vindas da importação de Excel ou do Power Automate
  aoAtualizarDados((novosDados: DocumentoSGI[]) => {
    tramitacoes = novosDados;
    renderizarTabela();
  });

  // 3. Elementos da interface
  const formularioEl = document.getElementById('form-tramitacao');
  const formulario: HTMLFormElement | null = formularioEl instanceof HTMLFormElement ? formularioEl : null;
  const tabelaCorpo = document.getElementById('tabela-corpo');
  const btnExportar = document.getElementById('btn-exportar');
  const contadorDoc = document.getElementById('contador-documentos');

  // Função auxiliar para renderizar o badge de status
  function getStatusBadge(status: string | undefined): string {
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
  function renderizarTabela(): void {
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
  function sanitizarNomePasta(nome: string | null | undefined): string {
    return (nome || 'Documento_Sem_Titulo')
      .replace(/[\~\"\#\%\&\*\:\<\>\?\/\\\{\|\}]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function arquivoParaBase64(arquivo: File): Promise<ArquivoConvertido> {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => {
        // readAsDataURL sempre produz string; o fallback '' é o mesmo do original.
        const resultado = typeof leitor.result === 'string' ? leitor.result : '';
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
  let listaAnexosArquivos: File[] = [];

  const inputDocPrincipal = obterInput('arquivo-principal');
  const previewDocPrincipal = document.getElementById('nome-doc-principal');
  const inputAnexos = obterInput('arquivos-anexos');
  const previewQtdAnexos = document.getElementById('qtd-anexos-complementares');
  const containerAnexosLista = document.getElementById('container-anexos-lista');
  const listaAnexosSelecionados = document.getElementById('lista-anexos-selecionados');

  // Helper para formatar tamanho de arquivo
  function formatarTamanho(bytes: number): string {
    if (bytes >= 1000000) return (bytes / 1000000).toFixed(1) + ' MB';
    return Math.round(bytes / 1000) + ' KB';
  }

  // Setup do Dropzone Principal
  const dropzonePrincipal = document.getElementById('dropzone-principal');
  const dropzonePrincipalIdle = document.getElementById('dropzone-principal-idle');
  const dropzonePrincipalFilled = document.getElementById('dropzone-principal-filled');
  const extDocPrincipal = document.getElementById('ext-doc-principal');
  const tamanhoDocPrincipal = document.getElementById('tamanho-doc-principal');

  function triggerGulp(dropzone: HTMLElement): void {
    dropzone.removeAttribute('data-gulp');
    void dropzone.offsetWidth; // trigger reflow
    dropzone.setAttribute('data-gulp', 'true');
    setTimeout(() => dropzone.removeAttribute('data-gulp'), 460);
  }

  // `idleEl` e `filledEl` são aceitos (e ignorados) exatamente como no original.
  function setupDropzone(
    dropzone: HTMLElement | null,
    inputElement: HTMLInputElement | null,
    idleEl?: HTMLElement | null,
    filledEl?: HTMLElement | null
  ): void {
    if (!dropzone || !inputElement) return;

    const prevent = (e: Event): void => { e.preventDefault(); e.stopPropagation(); };

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, prevent, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => {
        dropzone.setAttribute('data-over', 'true');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => {
        dropzone.removeAttribute('data-over');
      }, false);
    });

    dropzone.addEventListener('drop', (e: DragEvent) => {
      const dt = e.dataTransfer;
      // DIVERGÊNCIA: o original acessaria `dt.files` sem checar nulo. Em um
      // evento `drop` real do navegador, `dataTransfer` nunca é nulo.
      if (!dt) return;
      const files = dt.files;
      if (files.length) {
        if (inputElement.multiple) {
          const dataTransfer = new DataTransfer();
          Array.from(files).forEach(f => dataTransfer.items.add(f));
          inputElement.files = dataTransfer.files;
        } else {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(files[0]);
          inputElement.files = dataTransfer.files;
        }
        inputElement.dispatchEvent(new Event('change'));
      }
    });
  }

  setupDropzone(dropzonePrincipal, inputDocPrincipal);

  if (inputDocPrincipal) {
    inputDocPrincipal.addEventListener('change', () => {
      // `e.target` no original é o próprio inputDocPrincipal.
      const file = inputDocPrincipal.files?.[0];
      if (file && previewDocPrincipal) {
        previewDocPrincipal.textContent = file.name;
        previewDocPrincipal.title = file.name;

        if (tamanhoDocPrincipal) tamanhoDocPrincipal.textContent = formatarTamanho(file.size);
        if (extDocPrincipal) {
          // `split` sempre devolve ao menos um item, então `pop()` nunca é undefined aqui.
          const ext = (file.name.split('.').pop() ?? '').toUpperCase();
          extDocPrincipal.textContent = ext.substring(0, 4);
        }

        if (dropzonePrincipalIdle) dropzonePrincipalIdle.style.display = 'none';
        if (dropzonePrincipalFilled) dropzonePrincipalFilled.style.display = 'flex';
        if (dropzonePrincipal) triggerGulp(dropzonePrincipal);

      } else {
        if (previewDocPrincipal) previewDocPrincipal.textContent = 'Nenhum selecionado';
        if (dropzonePrincipalIdle) dropzonePrincipalIdle.style.display = 'flex';
        if (dropzonePrincipalFilled) dropzonePrincipalFilled.style.display = 'none';
      }
    });
  }

  const dropzoneAnexos = document.getElementById('dropzone-anexos');
  const dropzoneAnexosIdle = document.getElementById('dropzone-anexos-idle');
  const dropzoneAnexosFilled = document.getElementById('dropzone-anexos-filled');
  setupDropzone(dropzoneAnexos, inputAnexos);

  function renderizarListaAnexos(): void {
    if (!listaAnexosSelecionados || !containerAnexosLista) return;
    listaAnexosSelecionados.innerHTML = '';
    if (listaAnexosArquivos.length === 0) {
      containerAnexosLista.style.display = 'none';
      if (previewQtdAnexos) previewQtdAnexos.textContent = '0 arquivos adicionados';
      if (dropzoneAnexosIdle) dropzoneAnexosIdle.style.display = 'flex';
      if (dropzoneAnexosFilled) dropzoneAnexosFilled.style.display = 'none';
      return;
    }

    containerAnexosLista.style.display = 'block';

    if (previewQtdAnexos) {
      previewQtdAnexos.textContent = `${listaAnexosArquivos.length} arquivo${listaAnexosArquivos.length > 1 ? 's' : ''}`;
    }

    if (dropzoneAnexosIdle) dropzoneAnexosIdle.style.display = 'none';
    if (dropzoneAnexosFilled) dropzoneAnexosFilled.style.display = 'flex';
    if (dropzoneAnexos) triggerGulp(dropzoneAnexos);

    listaAnexosArquivos.forEach((file, index) => {
      const tag = document.createElement('span');
      tag.className = 'anexo-tag-item';
      tag.innerHTML = `
        <span>📁 ${file.name}</span>
        <span class="anexo-tag-remove" data-index="${index}" title="Remover anexo">&times;</span>
      `;
      listaAnexosSelecionados.appendChild(tag);
    });
  }

  if (inputAnexos) {
    inputAnexos.addEventListener('change', () => {
      // `e.target` no original é o próprio inputAnexos.
      const files = Array.from(inputAnexos.files || []);
      listaAnexosArquivos.push(...files);
      renderizarListaAnexos();
      inputAnexos.value = '';
    });
  }

  if (listaAnexosSelecionados) {
    listaAnexosSelecionados.addEventListener('click', (e: MouseEvent) => {
      const alvo = e.target;
      if (alvo instanceof HTMLElement && alvo.classList.contains('anexo-tag-remove')) {
        // Sem `data-index`, o original fazia parseInt(undefined) → NaN; '' produz o mesmo NaN.
        const idx = parseInt(alvo.dataset.index ?? '', 10);
        listaAnexosArquivos.splice(idx, 1);
        renderizarListaAnexos();
      }
    });
  }

  // 7. Função para enviar os dados para o Excel e SharePoint via Power Automate
  async function enviarParaExcelSharePoint(dados: DocumentoSGI, arquivosPayload: ArquivosPayload): Promise<void> {
    if (!URL_WEBHOOK_POWER_AUTOMATE || URL_WEBHOOK_POWER_AUTOMATE.includes("COLE_AQUI")) {
      console.warn("URL do Power Automate ainda não configurado.");
      return;
    }

    try {
      // Monta o link direto da pasta do documento no SharePoint
      const baseUrlSharePoint = "https://grupomonto.sharepoint.com/sites/SGIMontoIndustrial/Repositrio%20%20Tramitao%20de%20Documentos/Documentos";
      const linkAnexoDireto = `${baseUrlSharePoint}/${encodeURIComponent(arquivosPayload.nomePasta)}`;

      // Prepara o payload contemplando os dados do formulário e os anexos para o SharePoint
      const payload: Record<string, unknown> = {
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
        "ID": dados.id,
        "Data Modificação": dados.dataModificacao,
        ...dados
      };

      enfileirarEnvio('CADASTRO', dados.id || `DOC-${dados.codigo}`, payload);

    } catch (erro) {
      console.error("Falha ao enfileirar para o Power Automate:", erro);
    }
  }

  // Estado Offline / Online
  const faixaOffline = document.getElementById('faixa-offline');
  const btnSubmitEl = document.getElementById('btn-submit');
  const btnSubmit: HTMLButtonElement | null = btnSubmitEl instanceof HTMLButtonElement ? btnSubmitEl : null;

  function atualizarStatusRede(): void {
    if (!navigator.onLine) {
      if (faixaOffline) faixaOffline.style.display = 'block';
      if (btnSubmit) btnSubmit.textContent = 'Registro pendente';
    } else {
      if (faixaOffline) faixaOffline.style.display = 'none';
      if (btnSubmit) btnSubmit.textContent = 'Registrar Documento';
    }
  }

  window.addEventListener('offline', atualizarStatusRede);
  window.addEventListener('online', atualizarStatusRede);
  atualizarStatusRede();

  // Validação
  if (formulario) {
    // O original passava o booleano `true`, que o navegador converte para "true".
    formulario.setAttribute('novalidate', 'true');
  }

  const camposObrigatorios: string[] = ['titulo', 'codigo', 'data-recebimento', 'status'];

  camposObrigatorios.forEach(id => {
    const el = obterCampo(id);
    if (!el) return;

    // blur - validação inline
    el.addEventListener('blur', () => {
      const parent = el.closest('.pill-input-box');
      if (!el.value.trim()) {
        if (parent) parent.classList.add('is-erro');
      } else {
        if (parent) parent.classList.remove('is-erro');
      }
    });

    // input/change - remoção do erro
    el.addEventListener('input', () => {
      const parent = el.closest('.pill-input-box');
      if (parent) parent.classList.remove('is-erro');
    });
    el.addEventListener('change', () => {
      const parent = el.closest('.pill-input-box');
      if (parent) parent.classList.remove('is-erro');
    });
  });

  function validarFormulario(): boolean {
    let temErro = false;
    const resumoErrosLista = document.getElementById('resumo-erros-lista');
    const resumoErros = document.getElementById('resumo-erros');

    if (resumoErrosLista) resumoErrosLista.innerHTML = '';

    camposObrigatorios.forEach(id => {
      const el = obterCampo(id);
      if (!el) return;
      if (!el.value.trim()) {
        temErro = true;
        const parent = el.closest('.pill-input-box');
        if (parent) parent.classList.add('is-erro');

        // Obter label ou nome descritivo
        const label = document.querySelector<HTMLLabelElement>(`label[for="${id}"]`);
        const nomeCampo = label ? (label.textContent ?? '').replace('*', '').trim() : id;

        if (resumoErrosLista) {
          const li = document.createElement('li');
          li.innerHTML = `<a href="#${id}">${nomeCampo}</a>`;
          resumoErrosLista.appendChild(li);
        }
      }
    });

    if (temErro) {
      if (resumoErros) {
        resumoErros.style.display = 'block';
        resumoErros.focus();
      }
    } else {
      if (resumoErros) {
        resumoErros.style.display = 'none';
      }
    }

    return !temErro;
  }

  // 8. Interceção do envio do formulário
  if (formulario) {
    formulario.addEventListener('submit', async (evento: SubmitEvent) => {
      evento.preventDefault();

      if (!validarFormulario()) {
        return;
      }

      // Botão submit feedback
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
      const filePrincipal = inputDocPrincipal?.files?.[0];
      let docPrincipalPayload: ArquivoConvertido | null = null;
      if (filePrincipal) {
        try {
          docPrincipalPayload = await arquivoParaBase64(filePrincipal);
        } catch (e) {
          console.error("Erro ao ler documento principal:", e);
        }
      }

      // Converte anexos complementares para Base64
      const anexosPayload: ArquivoConvertido[] = [];
      for (const f of listaAnexosArquivos) {
        try {
          const b64 = await arquivoParaBase64(f);
          anexosPayload.push(b64);
        } catch (e) {
          console.error("Erro ao ler anexo complementar:", e);
        }
      }

      const tituloValor = valorCampo('titulo');
      const nomePastaSanitizada = sanitizarNomePasta(tituloValor);
      const baseUrlSharePoint = "https://grupomonto.sharepoint.com/sites/SGIMontoIndustrial/Repositrio%20%20Tramitao%20de%20Documentos/Documentos";
      const linkAnexoDireto = `${baseUrlSharePoint}/${encodeURIComponent(nomePastaSanitizada)}`;

      // Criação do objeto com os dados preenchidos
      const idGerado = `DOC-${crypto.randomUUID()}`;
      const novaTramitacao: DocumentoSGI = {
        id: idGerado,
        titulo: tituloValor,
        codigo: valorCampo('codigo'),
        tipoDocumento: valorCampo('tipo-documento'),
        dataRecebimento: valorCampo('data-recebimento'),
        dataRevisao: valorCampo('data-revisao'),
        revisao: valorCampo('revisao'),
        status: valorCampo('status'),
        remetente: valorCampo('remetente'),
        area: valorCampo('area'),
        disciplina: valorCampo('disciplina'),
        observacao: valorCampo('observacao'),
        nomePasta: nomePastaSanitizada,
        nomeArquivoPrincipal: docPrincipalPayload ? docPrincipalPayload.nome : '',
        qtdAnexos: anexosPayload.length,
        linkAnexo: linkAnexoDireto,
        dataModificacao: new Date().toISOString()
      };

      // Gravação na base oficial (Array + Cache Local)
      tramitacoes.push(novaTramitacao);
      salvarTramitacoes(tramitacoes, 'Novo Registro Local');

      // Registra evento inicial no histórico de alterações (persiste e envia ao Power Automate)
      adicionarHistoricoAlteracao({
        idDocumento: idGerado,
        codigo: novaTramitacao.codigo,
        status: novaTramitacao.status || 'Recebido',
        statusAnterior: '',
        destino: novaTramitacao.area ? `${novaTramitacao.area} / Qualidade` : 'Equipe de Qualidade',
        responsavel: novaTramitacao.remetente || 'Cadastro Inicial',
        autor: novaTramitacao.remetente || 'Cadastro Inicial',
        tipoAcao: 'CRIACAO',
        observacao: novaTramitacao.observacao || 'Registro inicial do documento cadastrado no formulário.',
        enviarNuvem: true
      });

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

      // Mostra o Toast
      const msg = navigator.onLine ? "Documento registrado com sucesso!" : "Registro salvo localmente. Será sincronizado quando estiver online.";
      if (typeof window.mostrarNotificacaoToast === 'function') {
        window.mostrarNotificacaoToast(msg, 5);
      } else {
        alert(msg);
      }

      // Limpeza dos campos do formulário (com atraso)
      setTimeout(() => {
        formulario.reset();
        listaAnexosArquivos = [];
        renderizarListaAnexos();
        if (previewDocPrincipal) previewDocPrincipal.textContent = 'Nenhum selecionado';
        aplicarDadosUsuarioLogado();
      }, 5000);
    });
  }

  // 7. Exportação de dados para ficheiro CSV (Excel local)
  if (btnExportar) {
    btnExportar.addEventListener('click', () => {
      if (tramitacoes.length === 0) {
        alert('Não existem registos para exportar.');
        return;
      }

      const cabecalhos: string[] = [
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

      const linhas: string[] = tramitacoes.map((item) => [
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

      const conteudoCsv = '﻿' + [cabecalhos.join(';'), ...linhas].join('\r\n');
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
  const inputRevisao = obterInput('revisao');
  const inputCodigo = obterInput('codigo');

  if (tabNovo && tabRevisao) {
    tabNovo.addEventListener('click', () => {
      tabNovo.classList.add('active');
      tabRevisao.classList.remove('active');
      // O original atribuía o número 0; o DOM converte para '0' de qualquer forma.
      if (inputRevisao) inputRevisao.value = '0';
    });

    tabRevisao.addEventListener('click', () => {
      tabRevisao.classList.add('active');
      tabNovo.classList.remove('active');
      if (inputRevisao && (inputRevisao.value === '0' || !inputRevisao.value)) {
        inputRevisao.value = '1';
      }
      if (inputCodigo) inputCodigo.focus();
    });
  }

  // Função auxiliar para pré-preencher remetente e área do usuário logado
  function aplicarDadosUsuarioLogado(): void {
    const usuario = obterUsuarioAtual();
    if (!usuario) return;
    const inputRemetente = obterCampo('remetente');
    const inputArea = obterCampo('area');
    if (inputRemetente && usuario.nome) {
      inputRemetente.value = usuario.nome;
    }
    if (inputArea && usuario.area) {
      inputArea.value = usuario.area;
    }
  }

  // 9. Renderização inicial ao abrir a página
  renderizarTabela();
  // O original chamava configurarHeaderUsuario('header-user-badge'), mas a
  // função (em auth-service.js e .ts) não recebe parâmetros e ignorava o
  // argumento; o id 'header-user-badge' já é fixo dentro dela.
  configurarHeaderUsuario();
  inicializarMenuConfiguracoes('header-settings-dropdown');
  aplicarDadosUsuarioLogado();

  // 10. Tenta sincronizar automaticamente com a nuvem (se o webhook estiver configurado)
  buscarDadosDoPowerAutomate().then((resultado) => {
    if (resultado.sucesso) {
      console.log(`DocFlow: sincronizado com o SharePoint (${resultado.total} itens).`);
    }
  });
})();
