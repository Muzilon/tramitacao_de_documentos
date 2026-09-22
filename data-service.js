/**
 * DocFlow Data Service
 * Centraliza a obtenção, normalização, importação e persistência dos dados de tramitação.
 * Fonte Oficial: Planilha Excel (via Power Automate ou importação direta de arquivo .xlsx).
 */

// 1. URLs do Power Automate
// URL para envio (POST) de novos registros no formulário (Gera nova linha + pastas no SharePoint)
export const URL_WEBHOOK_POST = "https://defaultadd9956403f342bcb569ac9a4db4e9.f3.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/25/workflows/a2ea498f2b9040639632239654fabbd7/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kUvzix-PgeMqipfYBcMV10Y9SYbshheJkRAZ516j5ds";

// URL para leitura (POST/GET) das linhas da tabela do Excel no SharePoint
export const URL_WEBHOOK_GET = "https://defaultadd9956403f342bcb569ac9a4db4e9.f3.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/25/workflows/1b68cd300a364c899b8409a481147dc6/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=wg0iVgGwJvqUHQX_TbuZtRhk0FSt1XBeXMGx5t3nFpg";

// URL dedicada para ATUALIZAR STATUS (UpdateRowV2 no Power Automate) - Não usar o webhook de POST de cadastro!
export const URL_WEBHOOK_UPDATE_STATUS = "";

const CHAVE_STORAGE = 'tramitacoes';
const CHAVE_ULTIMA_SINC = 'docflow_ultima_sincronizacao';
const CHAVE_ORIGEM = 'docflow_origem_dados';
const CHAVE_MODIFICACOES_LOCAIS = 'docflow_modificacoes_locais';
export const CHAVE_HISTORICO = 'docflow_historico_alteracoes';

const ouvintesAtualizacao = [];

/**
 * Gera ou preserva um ID único e consistente para cada documento
 */
export function gerarIdDocumento(item, index = 0) {
  if (item && item.id && String(item.id).trim() !== '') {
    return String(item.id).trim();
  }
  if (item && item.codigo && String(item.codigo).trim() !== '') {
    return `DOC-${String(item.codigo).trim()}`;
  }
  return `DOC-${Date.now().toString(36).toUpperCase()}-${index + 1}`;
}

/**
 * Obtém todos os registros da base de histórico de alterações
 */
export function obterTodoHistorico() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(CHAVE_HISTORICO);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Erro ao ler histórico de alterações:", e);
    return [];
  }
}

/**
 * Salva a base completa de histórico no localStorage
 */
export function salvarTodoHistorico(lista) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(Array.isArray(lista) ? lista : []));
    }
  } catch (e) {
    console.error("Erro ao salvar histórico de alterações:", e);
  }
}

/**
 * Obtém o histórico cronológico de um documento específico pelo seu ID ou Código
 */
export function obterHistoricoDocumento(idOuCodigo) {
  if (!idOuCodigo) return [];
  const chave = String(idOuCodigo).trim().toLowerCase();
  const todoHistorico = obterTodoHistorico();

  return todoHistorico.filter(h => {
    const hId = (h.idDocumento || '').trim().toLowerCase();
    const hCod = (h.codigo || '').trim().toLowerCase();
    const hPrim = (h.id || '').trim().toLowerCase();
    return hId === chave || hCod === chave || hPrim === chave;
  }).sort((a, b) => new Date(a.dataHora || 0) - new Date(b.dataHora || 0));
}

/**
 * Adiciona um novo evento na base de histórico de alterações
 */
export function adicionarHistoricoAlteracao({
  idDocumento,
  codigo,
  status,
  statusAnterior = '',
  destino = '',
  responsavel = '',
  observacao = '',
  dataHora = null
}) {
  const agora = dataHora ? new Date(dataHora) : new Date();
  const dataIso = agora.toISOString();

  // Formatação amigável DD/MM/YYYY HH:mm
  const dia = String(agora.getDate()).padStart(2, '0');
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const ano = agora.getFullYear();
  const hora = String(agora.getHours()).padStart(2, '0');
  const min = String(agora.getMinutes()).padStart(2, '0');
  const dataFormatada = `${dia}/${mes}/${ano} ${hora}:${min}`;

  const novoRegistro = {
    id: `HIST-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    idDocumento: idDocumento || (codigo ? `DOC-${codigo}` : `DOC-${Date.now()}`),
    codigo: codigo || '',
    status: status || 'Recebido',
    statusAnterior: statusAnterior || '',
    dataHora: dataIso,
    dataExibicao: dataFormatada,
    destino: destino || 'Qualidade',
    responsavel: responsavel || 'Usuário Atual',
    observacao: observacao || ''
  };

  const todoHistorico = obterTodoHistorico();
  todoHistorico.push(novoRegistro);
  salvarTodoHistorico(todoHistorico);

  return novoRegistro;
}

/**
 * Garante que o documento possua pelo menos o evento inicial de criação/recebimento
 */
export function inicializarHistoricoSeNecessario(item) {
  if (!item) return;
  const idDoc = item.id || (item.codigo ? `DOC-${item.codigo}` : '');
  const hist = obterHistoricoDocumento(idDoc || item.codigo);

  if (hist.length === 0) {
    adicionarHistoricoAlteracao({
      idDocumento: idDoc,
      codigo: item.codigo,
      status: item.status || 'Recebido',
      statusAnterior: '',
      destino: item.area ? `${item.area} / Qualidade` : 'Equipe de Qualidade',
      responsavel: item.remetente || 'Cadastro Inicial',
      observacao: item.observacao || 'Registro inicial do documento.',
      dataHora: item.dataRecebimento ? `${item.dataRecebimento}T09:00:00.000Z` : null
    });
  }
}

export function obterModificacoesLocais() {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(CHAVE_MODIFICACOES_LOCAIS);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

/**
 * Consolida e desduplica itens duplicados no Excel pela chave (código ou título),
 * preservando o registro mais recente, os dados mais completos e o ID único.
 */
export function desduplicarTramitacoes(lista) {
  if (!Array.isArray(lista)) return [];
  const mapa = new Map();

  lista.forEach((item, idx) => {
    if (!item) return;
    const chave = (item.codigo || '').trim().toLowerCase() || (item.titulo || '').trim().toLowerCase();
    if (!chave) return;

    const idDoc = item.id || gerarIdDocumento(item, idx);

    if (!mapa.has(chave)) {
      mapa.set(chave, {
        ...item,
        id: idDoc
      });
    } else {
      const existente = mapa.get(chave);
      mapa.set(chave, {
        ...existente,
        ...item,
        id: existente.id || idDoc,
        codigo: item.codigo || existente.codigo,
        titulo: item.titulo || existente.titulo,
        status: item.status || existente.status,
        linkAnexo: (item.linkAnexo && item.linkAnexo.trim() !== '') ? item.linkAnexo : (existente.linkAnexo || ''),
        nomePasta: item.nomePasta || existente.nomePasta,
        nomeArquivoPrincipal: item.nomeArquivoPrincipal || existente.nomeArquivoPrincipal,
        qtdAnexos: item.qtdAnexos !== undefined && item.qtdAnexos !== null ? item.qtdAnexos : (existente.qtdAnexos || 0)
      });
    }
  });

  const consolidados = Array.from(mapa.values());
  // Inicializa o histórico para novos itens se necessário
  consolidados.forEach(item => inicializarHistoricoSeNecessario(item));

  return consolidados;
}

/**
 * Registra um callback para ser notificado sempre que os dados forem atualizados
 */
export function aoAtualizarDados(callback) {
  if (typeof callback === 'function') {
    ouvintesAtualizacao.push(callback);
  }
}

function notificarAtualizacao(dados) {
  ouvintesAtualizacao.forEach(fn => {
    try {
      fn(dados);
    } catch (e) {
      console.error("Erro ao notificar ouvinte:", e);
    }
  });
}

/**
 * Obtém os registros salvos localmente em cache
 */
export function obterTramitacoes() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(CHAVE_STORAGE);
    return raw ? desduplicarTramitacoes(JSON.parse(raw)) : [];
  } catch (e) {
    console.error("Erro ao ler dados do localStorage:", e);
    return [];
  }
}

/**
 * Salva a lista de tramitações no cache local
 */
export function salvarTramitacoes(lista, origem = 'local') {
  try {
    const listaLimpa = desduplicarTramitacoes(lista);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(listaLimpa));
      localStorage.setItem(CHAVE_ULTIMA_SINC, new Date().toISOString());
      localStorage.setItem(CHAVE_ORIGEM, origem);

      // Se a alteração foi feita no próprio sistema pelo usuário (não veio da sincronização bruta da nuvem)
      if (origem !== 'Power Automate (SharePoint)') {
        const modificacoes = obterModificacoesLocais();
        listaLimpa.forEach(item => {
          const chave = (item.codigo || '').trim().toLowerCase() || (item.titulo || '').trim().toLowerCase();
          if (chave) {
            modificacoes[chave] = {
              status: item.status,
              linkAnexo: item.linkAnexo,
              nomePasta: item.nomePasta,
              nomeArquivoPrincipal: item.nomeArquivoPrincipal,
              qtdAnexos: item.qtdAnexos,
              observacao: item.observacao,
              timestamp: Date.now()
            };
          }
        });
        localStorage.setItem(CHAVE_MODIFICACOES_LOCAIS, JSON.stringify(modificacoes));
      }
    }
    notificarAtualizacao(listaLimpa);
  } catch (e) {
    console.error("Erro ao salvar no cache local:", e);
  }
}

export function obterInfoSincronizacao() {
  const ultimaSinc = typeof localStorage !== 'undefined' ? localStorage.getItem(CHAVE_ULTIMA_SINC) : null;
  const origem = (typeof localStorage !== 'undefined' ? localStorage.getItem(CHAVE_ORIGEM) : null) || 'local';
  return {
    ultimaSinc,
    origem,
    total: obterTramitacoes().length
  };
}

/**
 * Converte data do Excel (serial numérico ou string variada) para o formato YYYY-MM-DD
 */
function normalizarData(valor) {
  if (!valor && valor !== 0) return '';

  // Trata número serial do Excel (ex: 46279 ou "46279.3333333333")
  const numSerial = typeof valor === 'number' ? valor : parseFloat(String(valor).trim());
  if (!isNaN(numSerial) && numSerial > 30000 && numSerial < 70000) {
    const dataJs = new Date(Math.round((numSerial - 25569) * 86400 * 1000));
    return dataJs.toISOString().split('T')[0];
  }

  const str = String(valor).trim();
  // Formato DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split('/');
    return `${y}-${m}-${d}`;
  }
  // Formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }
  return str;
}

/**
 * Normaliza qualquer objeto de linha vindo do Excel ou Power Automate
 * para o formato padrão do DocFlow
 */
export function normalizarItemExcel(linha) {
  if (!linha || typeof linha !== 'object') return null;

  // Busca chaves ignorando maiúsculas/minúsculas e acentos
  function getCampo(...nomesPossiveis) {
    const chavesObjeto = Object.keys(linha);
    for (const nome of nomesPossiveis) {
      const nomeLimpo = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const chaveEncontrada = chavesObjeto.find(k => {
        const kLimpo = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        return kLimpo === nomeLimpo;
      });
      if (chaveEncontrada && linha[chaveEncontrada] !== undefined && linha[chaveEncontrada] !== null) {
        return linha[chaveEncontrada];
      }
    }
    return '';
  }

  const id = getCampo('ID', 'Id', 'ID Documento', 'IdDocumento', 'id_documento', 'Identificador');
  const titulo = getCampo('Título', 'Titulo', 'Nome do Documento', 'Nome', 'titulo');
  const codigo = getCampo('Código do documento', 'Código', 'Codigo', 'Código do Documento', 'codigo');
  const status = getCampo('Status', 'Situação', 'Situacao', 'status') || 'Em Revisão';
  const tipoDocumento = getCampo('Tipo de Documento', 'Tipo', 'Tipo do Documento', 'tipoDocumento');
  const revisao = getCampo('Nº de Revisão', 'N° de Revisão', 'Nº de Revisao', 'Revisão', 'Revisao', 'Rev', 'revisao');
  const dataRecebimento = normalizarData(getCampo('Data de Recebimento', 'Recebimento', 'Data Recebimento', 'dataRecebimento'));
  const dataRevisao = normalizarData(getCampo('Data de Revisão', 'Revisão Data', 'Data Revisao', 'dataRevisao'));
  const remetente = getCampo('Remetente', 'Responsável', 'Autor', 'remetente');
  const area = getCampo('Área', 'Area', 'Setor', 'area');
  const disciplina = getCampo('Disciplina', 'disciplina');
  const observacao = getCampo('Observação', 'Observacao', 'Obs', 'observacao', 'Comentários');
  const linkAnexo = getCampo('Link Anexo', 'LinkAnexo', 'Link', 'URL', 'linkAnexo');
  const nomePasta = getCampo('Nome da Pasta', 'nomePasta', 'Pasta');
  const nomeArquivoPrincipal = getCampo('Documento Principal', 'nomeArquivoPrincipal', 'Arquivo Principal', 'Arquivo');
  const qtdAnexos = getCampo('Qtd Anexos', 'qtdAnexos', 'Anexos', 'Quantidade Anexos');

  // Ignora linhas totalmente vazias do Excel
  if (!titulo && !codigo && !remetente) {
    return null;
  }

  const codLimpo = String(codigo || '').trim();
  const idDoc = String(id || '').trim() || (codLimpo ? `DOC-${codLimpo}` : `DOC-${Date.now().toString(36).toUpperCase()}`);

  return {
    id: idDoc,
    titulo: String(titulo || 'Sem Título').trim(),
    codigo: codLimpo,
    status: String(status || 'Em Revisão').trim(),
    tipoDocumento: String(tipoDocumento || 'Procedimento').trim(),
    revisao: revisao !== '' ? String(revisao).trim() : '0',
    dataRecebimento: dataRecebimento || '',
    dataRevisao: dataRevisao || '',
    remetente: String(remetente || '').trim(),
    area: String(area || '').trim(),
    disciplina: String(disciplina || '').trim(),
    observacao: String(observacao || '').trim(),
    linkAnexo: String(linkAnexo || '').trim(),
    nomePasta: String(nomePasta || '').trim(),
    nomeArquivoPrincipal: String(nomeArquivoPrincipal || '').trim(),
    qtdAnexos: qtdAnexos ? Number(qtdAnexos) || 0 : 0
  };
}

/**
 * Normaliza linhas da aba de Histórico de Alterações
 */
export function normalizarItemHistorico(linha) {
  if (!linha || typeof linha !== 'object') return null;

  function getCampo(...nomesPossiveis) {
    const chavesObjeto = Object.keys(linha);
    for (const nome of nomesPossiveis) {
      const nomeLimpo = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const chaveEncontrada = chavesObjeto.find(k => {
        const kLimpo = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        return kLimpo === nomeLimpo;
      });
      if (chaveEncontrada && linha[chaveEncontrada] !== undefined && linha[chaveEncontrada] !== null) {
        return linha[chaveEncontrada];
      }
    }
    return '';
  }

  const id = getCampo('ID', 'Id', 'Identificador');
  const idDocumento = getCampo('ID Documento', 'IdDocumento', 'id_documento', 'ID_Documento', 'Id Item', 'ID Item');
  const codigo = getCampo('Código', 'Codigo', 'Código do Documento', 'codigo');
  const status = getCampo('Status', 'Situação', 'status');
  const statusAnterior = getCampo('Status Anterior', 'StatusAnterior', 'status_anterior');
  const dataHora = getCampo('Data/Hora', 'Data Hora', 'dataHora', 'Data', 'Data de Alteração');
  const destino = getCampo('Destino', 'destino', 'Pra onde vai', 'Para onde vai');
  const responsavel = getCampo('Responsável', 'Responsavel', 'responsavel', 'Autor');
  const observacao = getCampo('Observação', 'Observacao', 'observacao', 'Comentários');

  if (!idDocumento && !codigo && !status) return null;

  const codLimpo = String(codigo || '').trim();
  const idDoc = String(idDocumento || (codLimpo ? `DOC-${codLimpo}` : '')).trim();

  return {
    id: id ? String(id).trim() : `HIST-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    idDocumento: idDoc,
    codigo: codLimpo,
    status: String(status || 'Recebido').trim(),
    statusAnterior: String(statusAnterior || '').trim(),
    dataHora: dataHora ? String(dataHora).trim() : new Date().toISOString(),
    dataExibicao: dataHora ? String(dataHora).trim() : '',
    destino: String(destino || 'Qualidade').trim(),
    responsavel: String(responsavel || 'Usuário Atual').trim(),
    observacao: String(observacao || '').trim()
  };
}

/**
 * Lê um arquivo local .xlsx/.xls/.csv usando a biblioteca SheetJS (XLSX)
 * Suporta leitura simultânea da aba de Tramitações e da aba de Histórico de Alterações
 */
export async function importarArquivoExcel(arquivo) {
  if (!window.XLSX) {
    throw new Error("Biblioteca SheetJS (XLSX) não encontrada. Verifique sua conexão com a internet.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = window.XLSX.read(data, { type: 'array' });

        // Identifica aba principal e aba de histórico se existirem
        let sheetPrincipalName = workbook.SheetNames[0];
        let sheetHistoricoName = null;

        for (const sName of workbook.SheetNames) {
          const sLimpo = sName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (sLimpo.includes('historico') || sLimpo.includes('alteraco') || sLimpo.includes('log')) {
            sheetHistoricoName = sName;
          } else if (sLimpo.includes('tramitac') || sLimpo.includes('base') || sLimpo.includes('document')) {
            sheetPrincipalName = sName;
          }
        }

        const wsPrincipal = workbook.Sheets[sheetPrincipalName];
        const linhasBrutas = window.XLSX.utils.sheet_to_json(wsPrincipal, { defval: '' });

        const tramitacoesValidas = desduplicarTramitacoes(
          linhasBrutas.map(normalizarItemExcel).filter(Boolean)
        );

        if (tramitacoesValidas.length === 0) {
          throw new Error("Nenhum documento válido encontrado na planilha. Verifique se as colunas estão preenchidas.");
        }

        // Se encontrou aba de histórico, importa os eventos
        let historicoImportado = [];
        if (sheetHistoricoName && workbook.Sheets[sheetHistoricoName]) {
          const wsHist = workbook.Sheets[sheetHistoricoName];
          const linhasHistBrutas = window.XLSX.utils.sheet_to_json(wsHist, { defval: '' });
          historicoImportado = linhasHistBrutas.map(normalizarItemHistorico).filter(Boolean);

          if (historicoImportado.length > 0) {
            const histAtual = obterTodoHistorico();
            const mapaHist = new Map();
            histAtual.forEach(h => mapaHist.set(h.id, h));
            historicoImportado.forEach(h => mapaHist.set(h.id, h));
            salvarTodoHistorico(Array.from(mapaHist.values()));
          }
        }

        salvarTramitacoes(tramitacoesValidas, `Arquivo: ${arquivo.name}`);
        resolve({
          sucesso: true,
          total: tramitacoesValidas.length,
          totalHistorico: historicoImportado.length,
          itens: tramitacoesValidas
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(arquivo);
  });
}

/**
 * Exporta a base completa com duas abas: Tramitações e Histórico de Alterações
 */
export function exportarPlanilhaCompletaExcel(nomeArquivo = 'DocFlow_Tramitacoes_e_Historico.xlsx') {
  if (!window.XLSX) {
    console.warn("Biblioteca SheetJS não encontrada para exportação multi-aba.");
    return false;
  }

  const tramitacoes = obterTramitacoes();
  const historico = obterTodoHistorico();

  const rowsTramitacoes = tramitacoes.map(t => ({
    "ID": t.id || `DOC-${t.codigo || '0'}`,
    "Código": t.codigo || '',
    "Título": t.titulo || '',
    "Status": t.status || 'Em Revisão',
    "Tipo de Documento": t.tipoDocumento || '',
    "Nº de Revisão": t.revisao ?? '0',
    "Data de Recebimento": t.dataRecebimento || '',
    "Data de Revisão": t.dataRevisao || '',
    "Remetente": t.remetente || '',
    "Área": t.area || '',
    "Disciplina": t.disciplina || '',
    "Observação": t.observacao || '',
    "Link Anexo": t.linkAnexo || ''
  }));

  const rowsHistorico = historico.map(h => ({
    "ID": h.id,
    "ID Documento": h.idDocumento,
    "Código": h.codigo || '',
    "Status": h.status,
    "Status Anterior": h.statusAnterior || '',
    "Data/Hora": h.dataExibicao || h.dataHora,
    "Destino": h.destino || '',
    "Responsável": h.responsavel || '',
    "Observação": h.observacao || ''
  }));

  const wb = window.XLSX.utils.book_new();
  const wsTram = window.XLSX.utils.json_to_sheet(rowsTramitacoes);
  const wsHist = window.XLSX.utils.json_to_sheet(rowsHistorico);

  window.XLSX.utils.book_append_sheet(wb, wsTram, "Tramitações");
  window.XLSX.utils.book_append_sheet(wb, wsHist, "Histórico de Alterações");

  window.XLSX.writeFile(wb, nomeArquivo);
  return true;
}

/**
 * Busca dados em tempo real da nuvem via fluxo do Power Automate
 */
export async function buscarDadosDoPowerAutomate() {
  if (!URL_WEBHOOK_GET || URL_WEBHOOK_GET.trim() === '' || URL_WEBHOOK_GET.includes('COLE_AQUI')) {
    return {
      sucesso: false,
      aviso: "URL do fluxo de leitura do Power Automate ainda não configurada.",
      itens: obterTramitacoes()
    };
  }

  try {
    // A maioria dos fluxos HTTP do Power Automate utiliza o método POST
    let resposta = await fetch(URL_WEBHOOK_GET, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({})
    });

    // Se o webhook tiver sido explicitamente configurado com GET, faz fallback
    if (!resposta.ok && resposta.status === 400) {
      resposta = await fetch(URL_WEBHOOK_GET, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
    }

    if (!resposta.ok) {
      throw new Error(`Falha HTTP ${resposta.status}: ${resposta.statusText}`);
    }

    const payload = await resposta.json();
    
    // Trata se o Power Automate devolver { value: [...] } ou diretamente a lista [...]
    const listaLinhas = Array.isArray(payload) ? payload : (payload.value || payload.d?.results || []);
    
    const modificacoes = obterModificacoesLocais();

    const tramitacoesValidas = desduplicarTramitacoes(
      listaLinhas.map(normalizarItemExcel).filter(Boolean)
    ).map(itemRemoto => {
      const chave = (itemRemoto.codigo || '').trim().toLowerCase() || (itemRemoto.titulo || '').trim().toLowerCase();
      const mod = modificacoes[chave];
      if (!mod) return itemRemoto;

      // Preserva a decisão do usuário (ex: Cancelado ou novo status movido pelo usuário), links e arquivos
      return {
        ...itemRemoto,
        status: mod.status || itemRemoto.status,
        linkAnexo: (mod.linkAnexo && mod.linkAnexo.trim() !== '') ? mod.linkAnexo : (itemRemoto.linkAnexo || ''),
        nomePasta: mod.nomePasta || itemRemoto.nomePasta || '',
        nomeArquivoPrincipal: mod.nomeArquivoPrincipal || itemRemoto.nomeArquivoPrincipal || '',
        qtdAnexos: mod.qtdAnexos !== undefined ? mod.qtdAnexos : itemRemoto.qtdAnexos,
        observacao: mod.observacao || itemRemoto.observacao || ''
      };
    });

    if (tramitacoesValidas.length > 0) {
      salvarTramitacoes(tramitacoesValidas, 'Power Automate (SharePoint)');
    }

    return {
      sucesso: true,
      total: tramitacoesValidas.length,
      itens: tramitacoesValidas
    };
  } catch (erro) {
    console.error("Erro ao buscar dados do Power Automate:", erro);
    return {
      sucesso: false,
      erro: erro.message,
      itens: obterTramitacoes()
    };
  }
}

// ========================================================
// Gerenciamento de Tema (Modo Claro / Modo Escuro)
// ========================================================
const CHAVE_TEMA = 'docflow_theme';

export function obterTemaAtual() {
  try {
    const temaSalvo = localStorage.getItem(CHAVE_TEMA);
    if (temaSalvo === 'dark' || temaSalvo === 'light') return temaSalvo;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (e) {}
  return 'light';
}

export function definirTema(novoTema) {
  const tema = novoTema === 'dark' ? 'dark' : 'light';
  try {
    localStorage.setItem(CHAVE_TEMA, tema);
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', tema);
  
  // Atualiza botões ativos no menu se estiverem renderizados
  const btnClaro = document.getElementById('btn-theme-light');
  const btnEscuro = document.getElementById('btn-theme-dark');
  if (btnClaro && btnEscuro) {
    if (tema === 'dark') {
      btnEscuro.classList.add('active');
      btnClaro.classList.remove('active');
    } else {
      btnClaro.classList.add('active');
      btnEscuro.classList.remove('active');
    }
  }
}

export function aplicarTemaSalvo() {
  const tema = obterTemaAtual();
  document.documentElement.setAttribute('data-theme', tema);
  return tema;
}

// Aplica imediatamente ao carregar o script
aplicarTemaSalvo();

/**
 * Inicialização do componente de configurações (Menu de Engrenagens no topo)
 */
export function inicializarMenuConfiguracoes(dropdownId = 'header-settings-dropdown') {
  const dropdown = document.getElementById(dropdownId);
  const wrapper = document.getElementById('header-settings-wrapper');
  const btnToggle = document.getElementById('btn-settings-toggle');

  if (!dropdown) return;

  const info = obterInfoSincronizacao();
  const textoOrigem = info.origem.includes('Arquivo') 
    ? info.origem 
    : (info.origem === 'Power Automate (SharePoint)' ? 'Nuvem (SharePoint)' : 'Cache Local');
  const temaAtual = obterTemaAtual();

  dropdown.innerHTML = `
    <div class="dropdown-settings-content">
      <!-- Seção: Aparência / Modo Escuro -->
      <div class="dropdown-section">
        <div class="dropdown-section-header">
          <span class="dropdown-section-title">Aparência</span>
        </div>
        <div class="theme-toggle-pills" role="radiogroup" aria-label="Tema">
          <button type="button" class="theme-pill-btn ${temaAtual === 'light' ? 'active' : ''}" data-theme-val="light" id="btn-theme-light" title="Modo Claro">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <span>Claro</span>
          </button>
          <button type="button" class="theme-pill-btn ${temaAtual === 'dark' ? 'active' : ''}" data-theme-val="dark" id="btn-theme-dark" title="Modo Escuro">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            <span>Escuro</span>
          </button>
        </div>
      </div>

      <div class="dropdown-divider"></div>

      <!-- Seção: Sincronização & Origem dos Dados -->
      <div class="dropdown-section">
        <div class="dropdown-section-header">
          <span class="dropdown-section-title">Dados & Sincronização</span>
        </div>
        <div class="dropdown-base-badge">
          <span class="sinc-status-dot"></span>
          <span class="dropdown-base-texto">Base: <strong>${textoOrigem}</strong> (${info.total} docs)</span>
        </div>
        <div class="dropdown-action-list">
          <button type="button" id="btn-dropdown-sinc-nuvem" class="dropdown-action-item" title="Sincronizar com o Excel no SharePoint">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            <span>Sincronizar Nuvem</span>
          </button>

          <label for="input-excel-file-dropdown" class="dropdown-action-item excel" title="Carregar planilha .xlsx salva no seu computador/OneDrive">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="8" y1="13" x2="16" y2="13"></line>
              <line x1="8" y1="17" x2="16" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Carregar Excel (.xlsx)</span>
            <input type="file" id="input-excel-file-dropdown" accept=".xlsx, .xls, .csv" style="display: none;" />
          </label>
        </div>
      </div>
    </div>
  `;

  // Eventos de troca de tema
  const btnLight = dropdown.querySelector('#btn-theme-light');
  const btnDark = dropdown.querySelector('#btn-theme-dark');
  if (btnLight) {
    btnLight.addEventListener('click', () => definirTema('light'));
  }
  if (btnDark) {
    btnDark.addEventListener('click', () => definirTema('dark'));
  }

  // Evento do botão Sincronizar Nuvem
  const btnNuvem = dropdown.querySelector('#btn-dropdown-sinc-nuvem');
  if (btnNuvem) {
    btnNuvem.addEventListener('click', async () => {
      const originalHTML = btnNuvem.innerHTML;
      btnNuvem.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        </svg>
        <span>Buscando...</span>
      `;
      btnNuvem.disabled = true;

      const resultado = await buscarDadosDoPowerAutomate();
      btnNuvem.innerHTML = originalHTML;
      btnNuvem.disabled = false;

      const avisar = (msg, tit = 'Sincronização') => {
        if (typeof window !== 'undefined' && typeof window.mostrarDialogoAlerta === 'function') {
          window.mostrarDialogoAlerta({ titulo: tit, mensagem: msg });
        } else {
          alert(msg);
        }
      };

      if (resultado.sucesso) {
        avisar(`Sincronização concluída com sucesso!\n${resultado.total} registros carregados do Excel no SharePoint.`, 'Sincronização Nuvem');
      } else if (resultado.aviso) {
        avisar(`${resultado.aviso}\n\nDica: você também pode clicar em "Carregar Excel (.xlsx)" para abrir a sua planilha diretamente!`, 'Aviso de Sincronização');
      } else {
        avisar(`Erro ao sincronizar com o Power Automate:\n${resultado.erro || 'Falha de conexão'}`, 'Erro de Sincronização');
      }

      inicializarMenuConfiguracoes(dropdownId);
    });
  }

  // Evento do input de arquivo Excel
  const inputFile = dropdown.querySelector('#input-excel-file-dropdown');
  if (inputFile) {
    inputFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const avisar = (msg, tit = 'Importação') => {
        if (typeof window !== 'undefined' && typeof window.mostrarDialogoAlerta === 'function') {
          window.mostrarDialogoAlerta({ titulo: tit, mensagem: msg });
        } else {
          alert(msg);
        }
      };

      try {
        const resultado = await importarArquivoExcel(file);
        avisar(`Planilha carregada com sucesso!\n${resultado.total} documentos importados para a base.`, 'Planilha Importada');
        inicializarMenuConfiguracoes(dropdownId);
      } catch (err) {
        avisar(`Erro ao processar o arquivo Excel:\n${err.message}`, 'Erro na Importação');
      } finally {
        inputFile.value = '';
      }
    });
  }

  // Evento de clique para fixar/alternar o dropdown em dispositivos de toque ou clique
  if (btnToggle && wrapper && !btnToggle.dataset.configured) {
    btnToggle.dataset.configured = 'true';
    btnToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      wrapper.classList.toggle('dropdown-fixado');
    });

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('dropdown-fixado');
      }
    });
  }
}

/**
 * Função mantida para compatibilidade retroativa com código existente.
 * Atualiza o menu de configurações e, se ainda houver container de barra legado, atualiza-o também.
 */
export function inicializarBarraSincronizacao(containerId = 'barra-sincronizacao') {
  // Sempre inicializa o menu de configurações no header
  inicializarMenuConfiguracoes('header-settings-dropdown');

  // Se a barra legada ainda existir no DOM por algum motivo, preenche ou remove
  const barraLegada = document.getElementById(containerId);
  if (barraLegada) {
    // Esvazia para não poluir o corpo da página
    barraLegada.innerHTML = '';
  }
}

/**
 * Sanitiza o nome para ser usado como pasta no SharePoint
 */
export function sanitizarNomePasta(nome) {
  return (nome || 'Documento_Sem_Titulo')
    .replace(/[\~\"\#\%\&\*\:\<\>\?\/\\\{\|\}]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converte um objeto File do navegador para Base64
 */
export function arquivoParaBase64(arquivo) {
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

/**
 * Envia arquivos ao Power Automate para criar a pasta e salvar os arquivos no SharePoint.
 * Retorna o link da pasta gerado.
 */
export async function enviarArquivosParaSharePoint(dados, docPrincipalPayload, anexosPayload = []) {
  if (!URL_WEBHOOK_POST || URL_WEBHOOK_POST.includes("COLE_AQUI")) {
    throw new Error("Webhook de envio do Power Automate não configurado.");
  }

  const nomePastaSanitizada = sanitizarNomePasta(dados.nomePasta || dados.titulo);
  const baseUrlSharePoint = "https://grupomonto.sharepoint.com/sites/SGIMontoIndustrial/Repositrio%20%20Tramitao%20de%20Documentos/Documentos";
  const linkAnexoDireto = `${baseUrlSharePoint}/${encodeURIComponent(nomePastaSanitizada)}`;

  const payload = {
    ...dados,
    "Título": dados.titulo,
    "Código do documento": dados.codigo || '',
    "Status": dados.status || 'Em Revisão',
    "Data de Recebimento": dados.dataRecebimento || '',
    "Tipo de Documento": dados.tipoDocumento || '',
    "Data de Revisão": dados.dataRevisao || '',
    "Remetente": dados.remetente || '',
    "Área": dados.area || '',
    "Disciplina": dados.disciplina || '',
    "Nº de Revisão": dados.revisao || '0',
    "N° de Revisão": dados.revisao || '0',
    "Observação": dados.observacao || '',
    "LinkAnexo": linkAnexoDireto,
    "Link Anexo": linkAnexoDireto,
    "linkAnexo": linkAnexoDireto,
    "nomePasta": nomePastaSanitizada,
    "Nome da Pasta": nomePastaSanitizada,
    "documentoPrincipal": docPrincipalPayload || null,
    "Documento Principal": docPrincipalPayload || null,
    "anexosComplementares": anexosPayload || [],
    "Anexos Complementares": anexosPayload || []
  };

  const resposta = await fetch(URL_WEBHOOK_POST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!resposta.ok) {
    throw new Error(`Falha no envio HTTP ${resposta.status}: ${resposta.statusText}`);
  }

  let linkFinal = linkAnexoDireto;
  let pastaFinal = nomePastaSanitizada;

  try {
    const contentType = resposta.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const respJson = await resposta.json();
      if (respJson) {
        if (respJson.linkAnexo) linkFinal = respJson.linkAnexo;
        else if (respJson.LinkAnexo) linkFinal = respJson.LinkAnexo;
        else if (respJson.link) linkFinal = respJson.link;
        else if (respJson.url) linkFinal = respJson.url;
        if (respJson.nomePasta) pastaFinal = respJson.nomePasta;
      }
    }
  } catch (_) {
    // Se o webhook retornar resposta não JSON ou vazia (ex: 202 Accepted), mantém o link calculado
  }

  return {
    sucesso: true,
    linkAnexo: linkFinal,
    nomePasta: pastaFinal
  };
}

if (typeof window !== 'undefined') {
  window.DocFlowDataService = {
    obterTodoHistorico,
    salvarTodoHistorico,
    obterHistoricoDocumento,
    adicionarHistoricoAlteracao,
    inicializarHistoricoSeNecessario,
    exportarPlanilhaCompletaExcel,
    gerarIdDocumento
  };
}

