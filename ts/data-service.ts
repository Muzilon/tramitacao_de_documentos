/**
 * DocFlow Data Service
 * Centraliza a obtenção, normalização, importação e persistência dos dados de tramitação.
 * Fonte Oficial: Planilha Excel (via Power Automate ou importação direta de arquivo .xlsx).
 *
 * Conversão para TypeScript de ../data-service.js (etapa 4 da ideia
 * ideias/modelos/modelo_problema/2026-09-29_migracao-typescript-planejada.md).
 * O comportamento é o mesmo do original, com duas exceções registradas nos
 * comentários marcados com "DIVERGÊNCIA".
 */

import {
  normalizarItemUsuario,
  salvarUsuarios,
  obterUsuarios,
  obterUsuarioAtual,
  fazerLogout
} from './auth-service.js';
import type {
  Usuario,
  DocumentoSGI,
  HistoricoAcao,
  FilaEnvio,
  TipoEnvioFila,
  DetalheAlteracao
} from './types.js';

// 1. URLs do Power Automate
// Correção de segurança (etapa 6 da ideia): os endereços não ficam mais no
// código-fonte versionado. Eles vêm de ./config.local.ts (fora do git) e são
// reexportados aqui com o mesmo nome, para que formulario.js e planner.js
// continuem importando de data-service sem nenhuma mudança.
//
// O tipo é alargado para `string` porque config.local.ts declara as constantes
// sem anotação (tipo literal), e o código abaixo compara/testa esses valores.
import {
  URL_WEBHOOK_POST as CONFIG_URL_WEBHOOK_POST,
  URL_WEBHOOK_GET as CONFIG_URL_WEBHOOK_GET,
  URL_WEBHOOK_UPDATE_STATUS as CONFIG_URL_WEBHOOK_UPDATE_STATUS,
  URL_WEBHOOK_ADD_HISTORICO as CONFIG_URL_WEBHOOK_ADD_HISTORICO,
  SENHA_PADRAO_IMPORTACAO
} from './config.local.js';

// URL para envio (POST) de novos registros no formulário (Gera nova linha + pastas no SharePoint)
export const URL_WEBHOOK_POST: string = CONFIG_URL_WEBHOOK_POST;

// URL para leitura (POST/GET) das linhas da tabela do Excel no SharePoint
export const URL_WEBHOOK_GET: string = CONFIG_URL_WEBHOOK_GET;

// URL dedicada para ATUALIZAR STATUS (UpdateRowV2 no Power Automate) - Não usar o webhook de POST de cadastro!
export const URL_WEBHOOK_UPDATE_STATUS: string = CONFIG_URL_WEBHOOK_UPDATE_STATUS;

// URL dedicada para INSERIR HISTÓRICO DE ALTERAÇÕES no Excel (Add a row into a table na aba Historico)
export const URL_WEBHOOK_ADD_HISTORICO: string = CONFIG_URL_WEBHOOK_ADD_HISTORICO;

// ========================================================
// Tipos auxiliares (locais a este módulo)
// ========================================================

/**
 * Registro de histórico como ele é de fato gravado/lido pelo sistema.
 * Difere de `HistoricoAcao` apenas em `detalhes`: registros criados localmente
 * gravam `DetalheAlteracao[]` ou `null`, e registros vindos da planilha podem
 * trazer qualquer valor (texto livre ou JSON já convertido). Por isso o campo
 * é `unknown` aqui; quem lê deve checar com `Array.isArray` (como planner.js já faz).
 */
export interface RegistroHistorico extends Omit<HistoricoAcao, 'detalhes'> {
  detalhes?: unknown;
}

/** Parâmetros aceitos por `adicionarHistoricoAlteracao`. */
export interface NovoHistoricoParams {
  idDocumento?: string;
  codigo?: string;
  status?: string;
  statusAnterior?: string;
  destino?: string;
  responsavel?: string;
  observacao?: string;
  dataHora?: string | number | Date | null;
  autor?: string;
  tipoAcao?: string;
  detalhes?: DetalheAlteracao[] | null;
  enviarNuvem?: boolean;
}

/** Qualquer objeto com os campos usados para gerar um ID de documento. */
export type ItemIdentificavel = {
  id?: unknown;
  codigo?: unknown;
  titulo?: unknown;
} | null | undefined;

export type OuvinteAtualizacao = (dados: DocumentoSGI[]) => void;

export interface InfoSincronizacao {
  ultimaSinc: string | null;
  origem: string;
  total: number;
}

export interface ResultadoImportacao {
  sucesso: true;
  total: number;
  totalHistorico: number;
  totalUsuarios: number;
  itens: DocumentoSGI[];
}

/**
 * Retorno de `buscarDadosDoPowerAutomate`. Mantido como interface única com
 * campos opcionais (e não como união discriminada) porque o chamador testa
 * `resultado.aviso` e `resultado.erro` diretamente, como no original.
 */
export interface ResultadoSincronizacao {
  sucesso: boolean;
  aviso?: string;
  erro?: string;
  total?: number;
  totalHistorico?: number;
  totalUsuarios?: number;
  itens: DocumentoSGI[];
}

export interface ArquivoBase64 {
  nome: string;
  tipo: string;
  tamanho: number;
  conteudoBase64: string;
}

export interface ResultadoEnvioArquivos {
  sucesso: true;
  linkAnexo: string;
  nomePasta: string;
}

export type TemaDocFlow = 'dark' | 'light';

/** Subconjunto da biblioteca SheetJS (carregada por <script> como window.XLSX) usado aqui. */
interface PastaDeTrabalhoXLSX {
  SheetNames: string[];
  Sheets: Record<string, unknown>;
}

interface BibliotecaXLSX {
  read(dados: Uint8Array, opcoes: { type: 'array' }): PastaDeTrabalhoXLSX;
  writeFile(pasta: unknown, nomeArquivo: string): void;
  utils: {
    sheet_to_json(planilha: unknown, opcoes?: { defval?: unknown }): unknown[];
    book_new(): unknown;
    json_to_sheet(linhas: object[]): unknown;
    book_append_sheet(pasta: unknown, planilha: unknown, nome: string): void;
  };
}

interface OpcoesDialogoAlerta {
  titulo?: string;
  mensagem: string;
  textoBotao?: string;
  onFechar?: () => void;
}

/** Formato do objeto exposto em `window.DocFlowDataService`. */
export interface DocFlowDataServiceApi {
  obterTodoHistorico: typeof obterTodoHistorico;
  salvarTodoHistorico: typeof salvarTodoHistorico;
  obterHistoricoDocumento: typeof obterHistoricoDocumento;
  adicionarHistoricoAlteracao: typeof adicionarHistoricoAlteracao;
  inicializarHistoricoSeNecessario: typeof inicializarHistoricoSeNecessario;
  exportarPlanilhaCompletaExcel: typeof exportarPlanilhaCompletaExcel;
  gerarIdDocumento: typeof gerarIdDocumento;
  limparHistoricoManterUltimos: typeof limparHistoricoManterUltimos;
}

declare global {
  interface Window {
    DocFlowDataService: DocFlowDataServiceApi;
    mostrarNotificacaoToast: typeof mostrarNotificacaoToast;
    /** Não é definido em nenhum módulo hoje; o código testa antes de usar. */
    mostrarNotificacao?: (mensagem: string, tipo?: string) => void;
    /** Definido por planner.js. */
    mostrarDialogoAlerta?: (opcoes: OpcoesDialogoAlerta) => void;
    /** Legado: testado defensivamente antes de usar. */
    AuthService?: {
      obterUsuarioLogado?: () => { nome?: string } | null | undefined;
    };
    /** SheetJS, carregado via CDN nas páginas. */
    XLSX?: BibliotecaXLSX;
  }
}

// ========================================================
// Utilitários internos
// ========================================================

/** Extrai a mensagem de um erro capturado (`catch (e)` é `unknown` em TS). */
function mensagemErro(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** Lê uma propriedade de um valor desconhecido, se ele for um objeto. */
function lerPropriedade(obj: unknown, chave: string): unknown {
  return obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[chave] : undefined;
}

/**
 * Busca chaves ignorando maiúsculas/minúsculas e acentos.
 * Mesma lógica da função interna `getCampo` repetida no original.
 */
function lerCampo(registro: Record<string, unknown>, ...nomesPossiveis: string[]): unknown {
  const chavesObjeto = Object.keys(registro);
  for (const nome of nomesPossiveis) {
    const nomeLimpo = nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
    const chaveEncontrada = chavesObjeto.find(k => {
      const kLimpo = k.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
      return kLimpo === nomeLimpo;
    });
    if (chaveEncontrada && registro[chaveEncontrada] !== undefined && registro[chaveEncontrada] !== null) {
      return registro[chaveEncontrada];
    }
  }
  return '';
}

// ========================================================
// Chaves de armazenamento
// ========================================================

const CHAVE_STORAGE = 'tramitacoes';
const CHAVE_ULTIMA_SINC = 'docflow_ultima_sincronizacao';
const CHAVE_ORIGEM = 'docflow_origem_dados';
export const CHAVE_HISTORICO = 'docflow_historico_alteracoes';
export const CHAVE_FILA_ENVIOS = 'docflow_fila_envios';

// DIVERGÊNCIA: no original esta constante era usada em
// limparHistoricoManterUltimos() mas nunca declarada (ReferenceError em tempo
// de execução). Aqui ela é declarada com a mesma chave que já é removida
// abaixo no carregamento do módulo.
const CHAVE_MODIFICACOES_LOCAIS = 'docflow_modificacoes_locais';

if (typeof localStorage !== 'undefined') {
  localStorage.removeItem(CHAVE_MODIFICACOES_LOCAIS);
}

// ========================================================
// Fila de envio
// ========================================================

export function obterFilaEnvios(): FilaEnvio[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(CHAVE_FILA_ENVIOS);
    if (!raw) return [];
    const lista: unknown = JSON.parse(raw);
    return Array.isArray(lista) ? (lista as FilaEnvio[]) : [];
  } catch (_) { return []; }
}

export function salvarFilaEnvios(lista: FilaEnvio[]): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CHAVE_FILA_ENVIOS, JSON.stringify(lista));
  }
}

export function enfileirarEnvio(tipo: TipoEnvioFila, idDocumento: string, payload: unknown): void {
  const fila = obterFilaEnvios();
  fila.push({
    idFila: `PEND-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    tipo: tipo, // 'CADASTRO', 'ATUALIZACAO', 'HISTORICO', 'ANEXOS'
    idDocumento: idDocumento,
    dados: payload,
    tentativas: 0,
    ultimaTentativa: null,
    ultimoErro: null,
    status: 'pendente' // 'pendente', 'falhou'
  });
  salvarFilaEnvios(fila);
  processarFilaEnvios(); // dispara tentativa assim que enfileira
}

export async function processarFilaEnvios(): Promise<void> {
  const fila = obterFilaEnvios();
  let alterado = false;

  for (let i = 0; i < fila.length; i++) {
    const item = fila[i];
    if (item.status !== 'pendente') continue;

    if (item.tentativas >= 5) {
      item.status = 'falhou';
      alterado = true;
      if (typeof window !== 'undefined' && window.mostrarNotificacao) {
        window.mostrarNotificacao(`Falha ao enviar ${item.tipo} após 5 tentativas`, 'erro');
      } else {
        console.error(`Falha ao enviar ${item.tipo} após 5 tentativas`);
      }
      continue;
    }

    let url: string | null = null;
    if (item.tipo === 'CADASTRO') url = URL_WEBHOOK_POST;
    else if (item.tipo === 'HISTORICO') url = URL_WEBHOOK_ADD_HISTORICO;
    else if (item.tipo === 'ATUALIZACAO' && URL_WEBHOOK_UPDATE_STATUS) url = URL_WEBHOOK_UPDATE_STATUS;

    if (!url) {
      item.status = 'falhou';
      item.ultimoErro = 'URL não configurada';
      alterado = true;
      continue;
    }

    try {
      item.tentativas++;
      item.ultimaTentativa = new Date().toISOString();
      const resposta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.dados)
      });

      if (resposta.ok) {
        // Sucesso, remover da fila
        fila.splice(i, 1);
        i--;
        alterado = true;
      } else {
        item.ultimoErro = `HTTP ${resposta.status}`;
        alterado = true;
        break; // Para o processamento se houver falha de rede ou servidor
      }
    } catch (e) {
      item.ultimoErro = mensagemErro(e);
      alterado = true;
      break; // Para no primeiro erro de rede
    }
  }

  if (alterado) {
    salvarFilaEnvios(fila);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', processarFilaEnvios);
  setInterval(processarFilaEnvios, 60000);
}

const ouvintesAtualizacao: OuvinteAtualizacao[] = [];

/**
 * Gera ou preserva um ID único e consistente para cada documento
 */
export function gerarIdDocumento(item: ItemIdentificavel, index: number = 0): string {
  if (item && item.id && String(item.id).trim() !== '') {
    return String(item.id).trim();
  }
  if (item && item.codigo && String(item.codigo).trim() !== '') {
    return `DOC-${String(item.codigo).trim()}`;
  }
  if (item && item.titulo && String(item.titulo).trim() !== '') {
    const slug = String(item.titulo)
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .substring(0, 25);
    return `DOC-${slug}`;
  }
  return `DOC-ITEM-${index + 1}`;
}

// ========================================================
// Histórico de alterações
// ========================================================

/**
 * Obtém todos os registros da base de histórico de alterações
 */
export function obterTodoHistorico(): RegistroHistorico[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(CHAVE_HISTORICO);
    if (!raw) return [];
    const lista: unknown = JSON.parse(raw);
    return Array.isArray(lista) ? (lista as RegistroHistorico[]) : [];
  } catch (e) {
    console.error("Erro ao ler histórico de alterações:", e);
    return [];
  }
}

/**
 * Salva a base completa de histórico no localStorage
 */
export function salvarTodoHistorico(lista: RegistroHistorico[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      // Checagem mantida do original: chamadores em JS puro podem passar qualquer valor.
      localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(Array.isArray(lista) ? lista : []));
    }
  } catch (e) {
    console.error("Erro ao salvar histórico de alterações:", e);
  }
}

/**
 * Obtém o histórico cronológico de um documento específico pelo seu ID ou Código
 */
export function obterHistoricoDocumento(idOuCodigo: unknown): RegistroHistorico[] {
  if (!idOuCodigo) return [];
  const chave = String(idOuCodigo).trim().toLowerCase();
  const chaveSemPrefixo = chave.replace(/^doc-/, '');
  const todoHistorico = obterTodoHistorico();

  return todoHistorico.filter(h => {
    const hId = (h.idDocumento || '').trim().toLowerCase();
    const hCod = (h.codigo || '').trim().toLowerCase();
    const hPrim = (h.id || '').trim().toLowerCase();

    const hIdSemPrefixo = hId.replace(/^doc-/, '');
    const hCodSemPrefixo = hCod.replace(/^doc-/, '');

    return (
      hId === chave ||
      hCod === chave ||
      hPrim === chave ||
      (chaveSemPrefixo && (hIdSemPrefixo === chaveSemPrefixo || hCodSemPrefixo === chaveSemPrefixo))
    );
  }).sort((a, b) => new Date(a.dataHora || 0).getTime() - new Date(b.dataHora || 0).getTime());
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
  dataHora = null,
  autor = '',
  tipoAcao = 'STATUS',
  detalhes = null,
  enviarNuvem = false
}: NovoHistoricoParams): RegistroHistorico {
  const agora = dataHora ? new Date(dataHora) : new Date();
  const dataIso = agora.toISOString();

  // Formatação amigável DD/MM/YYYY HH:mm
  const dia = String(agora.getDate()).padStart(2, '0');
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const ano = agora.getFullYear();
  const hora = String(agora.getHours()).padStart(2, '0');
  const min = String(agora.getMinutes()).padStart(2, '0');
  const dataFormatada = `${dia}/${mes}/${ano} ${hora}:${min}`;

  const usuarioSessao = (typeof window !== 'undefined' && window.AuthService && typeof window.AuthService.obterUsuarioLogado === 'function')
    ? window.AuthService.obterUsuarioLogado()?.nome
    : null;

  const autorFinal = autor || responsavel || usuarioSessao || 'Usuário Atual';

  const novoRegistro: RegistroHistorico = {
    id: `HIST-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    idDocumento: idDocumento || (codigo ? `DOC-${codigo}` : `DOC-${Date.now()}`),
    codigo: codigo || '',
    status: status || 'Recebido',
    statusAnterior: statusAnterior || '',
    dataHora: dataIso,
    dataExibicao: dataFormatada,
    destino: destino || 'Qualidade',
    responsavel: responsavel || autorFinal,
    autor: autorFinal,
    tipoAcao: tipoAcao || 'STATUS',
    detalhes: detalhes || null,
    observacao: observacao || ''
  };

  const todoHistorico = obterTodoHistorico();
  todoHistorico.push(novoRegistro);
  salvarTodoHistorico(todoHistorico);

  // Se houver webhook dedicado para gravar linha de histórico no Excel pelo Power Automate, envia em segundo plano APENAS quando solicitado explicitamente por ação do usuário
  if (enviarNuvem) {
    enfileirarEnvio('HISTORICO', novoRegistro.idDocumento, novoRegistro);
  }

  return novoRegistro;
}

/**
 * Garante que o documento possua pelo menos o evento inicial de criação/recebimento
 */
export function inicializarHistoricoSeNecessario(item: DocumentoSGI | null | undefined): void {
  if (!item) return;
  const idDoc = item.id || (item.codigo ? `DOC-${item.codigo}` : gerarIdDocumento(item));
  const hist = obterHistoricoDocumento(idDoc || item.codigo);

  if (hist.length === 0) {
    adicionarHistoricoAlteracao({
      idDocumento: idDoc,
      codigo: item.codigo,
      status: item.status || 'Recebido',
      statusAnterior: '',
      destino: item.area ? `${item.area} / Qualidade` : 'Equipe de Qualidade',
      responsavel: item.remetente || 'Cadastro Inicial',
      autor: item.remetente || 'Cadastro Inicial',
      tipoAcao: 'CRIACAO',
      observacao: item.observacao || 'Registro inicial do documento cadastrado no sistema.',
      dataHora: item.dataRecebimento ? `${item.dataRecebimento}T09:00:00.000Z` : null,
      enviarNuvem: false
    });
  }
}

// ========================================================
// Tramitações
// ========================================================

/**
 * Procura documento por ID (função auxiliar genérica)
 */
export function encontrarDocumentoPorId(lista: DocumentoSGI[], id: unknown): DocumentoSGI | null | undefined {
  if (!id) return null;
  const idLimpo = String(id).trim().toLowerCase();
  return lista.find(item => {
    return (item.id && String(item.id).trim().toLowerCase() === idLimpo) ||
           (item.codigo && String(item.codigo).trim().toLowerCase() === idLimpo);
  });
}

/**
 * Mescla os dados remotos e locais
 */
export function mesclarTramitacoes(listaLocal: DocumentoSGI[], listaRemota: DocumentoSGI[]): DocumentoSGI[] {
  const mapaFinal = new Map<string, DocumentoSGI>();
  const filaEnvios = obterFilaEnvios();

  const pegarTimestamp = (dataStr: string | undefined): number => {
    if (!dataStr) return 0;
    const t = new Date(dataStr).getTime();
    return isNaN(t) ? 0 : t;
  };

  // 1. Inserir remotos no mapa
  listaRemota.forEach(item => {
    if (!item.id) return;
    mapaFinal.set(item.id, { ...item });
  });

  // 2. Avaliar os locais
  listaLocal.forEach(itemLocal => {
    if (!itemLocal.id) return;

    const itemRemoto = mapaFinal.get(itemLocal.id);
    if (itemRemoto) {
      // Existe em ambos, compara dataModificacao
      const tempoLocal = pegarTimestamp(itemLocal.dataModificacao);
      const tempoRemoto = pegarTimestamp(itemRemoto.dataModificacao);

      if (tempoLocal > tempoRemoto) {
        mapaFinal.set(itemLocal.id, { ...itemLocal });
      }
    } else {
      // Existe só no local
      // Verifica se há um CADASTRO pendente na fila para este documento
      const temCadastroPendente = filaEnvios.some(
        f => f.tipo === 'CADASTRO' && f.idDocumento === itemLocal.id
      );
      if (temCadastroPendente) {
        mapaFinal.set(itemLocal.id, { ...itemLocal });
      }
    }
  });

  return Array.from(mapaFinal.values());
}

/**
 * Consolida e desduplica itens duplicados no Excel pela chave (código ou título),
 * preservando o registro mais recente, os dados mais completos e o ID único.
 */
export function desduplicarTramitacoes(lista: unknown): DocumentoSGI[] {
  if (!Array.isArray(lista)) return [];
  const mapa = new Map<string, DocumentoSGI>();

  (lista as (DocumentoSGI | null | undefined)[]).forEach((item, idx) => {
    if (!item) return;
    const idItem = (item.id || '').trim();
    const chave = idItem || (item.codigo || '').trim().toLowerCase() || (item.titulo || '').trim().toLowerCase();
    if (!chave) return;

    const idDoc = item.id || gerarIdDocumento(item, idx);

    const existente = mapa.get(chave);
    if (!existente) {
      mapa.set(chave, {
        ...item,
        id: idDoc
      });
    } else {
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
  return consolidados;
}

/**
 * Registra um callback para ser notificado sempre que os dados forem atualizados
 */
export function aoAtualizarDados(callback: OuvinteAtualizacao): void {
  // Checagem mantida do original: chamadores em JS puro podem passar qualquer valor.
  if (typeof callback === 'function') {
    ouvintesAtualizacao.push(callback);
  }
}

function notificarAtualizacao(dados: DocumentoSGI[]): void {
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
export function obterTramitacoes(): DocumentoSGI[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(CHAVE_STORAGE);
    return raw ? desduplicarTramitacoes(JSON.parse(raw) as unknown) : [];
  } catch (e) {
    console.error("Erro ao ler dados do localStorage:", e);
    return [];
  }
}

/**
 * Salva a lista de tramitações no cache local
 */
export function salvarTramitacoes(lista: DocumentoSGI[], origem: string = 'local'): void {
  try {
    const listaLimpa = desduplicarTramitacoes(lista);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(listaLimpa));
      localStorage.setItem(CHAVE_ULTIMA_SINC, new Date().toISOString());
      localStorage.setItem(CHAVE_ORIGEM, origem);
    }
    notificarAtualizacao(listaLimpa);
  } catch (e) {
    console.error("Erro ao salvar no cache local:", e);
  }
}

export function obterInfoSincronizacao(): InfoSincronizacao {
  const ultimaSinc = typeof localStorage !== 'undefined' ? localStorage.getItem(CHAVE_ULTIMA_SINC) : null;
  const origem = (typeof localStorage !== 'undefined' ? localStorage.getItem(CHAVE_ORIGEM) : null) || 'local';
  return {
    ultimaSinc,
    origem,
    total: obterTramitacoes().length
  };
}

// ========================================================
// Normalização de linhas vindas do Excel / Power Automate
// ========================================================

/**
 * Converte data do Excel (serial numérico ou string variada) para o formato YYYY-MM-DD
 */
function normalizarData(valor: unknown): string {
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
export function normalizarItemExcel(linha: unknown): DocumentoSGI | null {
  if (!linha || typeof linha !== 'object') return null;
  const registro = linha as Record<string, unknown>;
  const getCampo = (...nomes: string[]): unknown => lerCampo(registro, ...nomes);

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
  const dataModificacao = getCampo('Data Modificação', 'Data Modificacao', 'dataModificacao', 'Data de Modificação', 'DataModificacao');

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
    qtdAnexos: qtdAnexos ? Number(qtdAnexos) || 0 : 0,
    dataModificacao: dataModificacao ? String(dataModificacao).trim() : ''
  };
}

/**
 * Normaliza linhas da aba de Histórico de Alterações
 */
export function normalizarItemHistorico(linha: unknown): RegistroHistorico | null {
  if (!linha || typeof linha !== 'object') return null;
  const registro = linha as Record<string, unknown>;
  const getCampo = (...nomes: string[]): unknown => lerCampo(registro, ...nomes);

  const id = getCampo('ID', 'Id', 'Identificador');
  const idDocumento = getCampo('ID Documento', 'IdDocumento', 'id_documento', 'ID_Documento', 'Id Item', 'ID Item');
  const codigo = getCampo('Código', 'Codigo', 'Código do Documento', 'codigo');
  const status = getCampo('Status', 'Situação', 'status');
  const statusAnterior = getCampo('Status Anterior', 'StatusAnterior', 'status_anterior');
  const dataHora = getCampo('Data/Hora', 'Data Hora', 'dataHora', 'Data', 'Data de Alteração');
  const dataExibicao = getCampo('dataExibicao', 'Data de Exibição', 'Data Exibicao', 'Data Formatada');
  const destino = getCampo('Destino', 'destino', 'Pra onde vai', 'Para onde vai');
  const responsavel = getCampo('Responsável', 'Responsavel', 'responsavel');
  const autor = getCampo('Autor', 'Quem Realizou', 'Modificado Por', 'Usuario', 'Usuário') || responsavel;
  const tipoAcao = getCampo('Tipo de Ação', 'Tipo Acao', 'Tipo', 'Ação', 'Acao') || 'STATUS';
  const detalhesRaw = getCampo('Detalhes', 'Diff', 'Alteracoes', 'Alterações');
  let detalhes: unknown = null;
  if (detalhesRaw) {
    try {
      detalhes = typeof detalhesRaw === 'string' && (detalhesRaw.startsWith('{') || detalhesRaw.startsWith('['))
        ? JSON.parse(detalhesRaw) as unknown
        : detalhesRaw;
    } catch (_) {
      detalhes = detalhesRaw;
    }
  }
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
    dataExibicao: dataExibicao ? String(dataExibicao).trim() : (dataHora ? String(dataHora).trim() : ''),
    destino: String(destino || 'Qualidade').trim(),
    responsavel: String(responsavel || autor || 'Usuário Atual').trim(),
    autor: String(autor || responsavel || 'Usuário Atual').trim(),
    tipoAcao: String(tipoAcao).trim().toUpperCase(),
    detalhes: detalhes,
    observacao: String(observacao || '').trim()
  };
}

function naoNulo<T>(valor: T | null | undefined): valor is T {
  return Boolean(valor);
}

// ========================================================
// Importação / exportação de planilha
// ========================================================

/**
 * Lê um arquivo local .xlsx/.xls/.csv usando a biblioteca SheetJS (XLSX)
 * Suporta leitura simultânea da aba de Tramitações e da aba de Histórico de Alterações
 */
export async function importarArquivoExcel(arquivo: File): Promise<ResultadoImportacao> {
  const XLSX = window.XLSX;
  if (!XLSX) {
    throw new Error("Biblioteca SheetJS (XLSX) não encontrada. Verifique sua conexão com a internet.");
  }

  return new Promise<ResultadoImportacao>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        // readAsArrayBuffer garante que `result` é um ArrayBuffer aqui.
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Identifica aba principal, aba de histórico e aba de usuários se existirem
        let sheetPrincipalName = workbook.SheetNames[0];
        let sheetHistoricoName: string | null = null;
        let sheetUsuariosName: string | null = null;

        for (const sName of workbook.SheetNames) {
          const sLimpo = sName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
          if (sLimpo.includes('historico') || sLimpo.includes('alteraco') || sLimpo.includes('log')) {
            sheetHistoricoName = sName;
          } else if (sLimpo.includes('usuario') || sLimpo.includes('user')) {
            sheetUsuariosName = sName;
          } else if (sLimpo.includes('tramitac') || sLimpo.includes('base') || sLimpo.includes('document')) {
            sheetPrincipalName = sName;
          }
        }

        const wsPrincipal = workbook.Sheets[sheetPrincipalName];
        const linhasBrutas = XLSX.utils.sheet_to_json(wsPrincipal, { defval: '' });

        const tramitacoesRemotas = desduplicarTramitacoes(
          linhasBrutas.map(l => normalizarItemExcel(l)).filter(naoNulo)
        );

        const tramitacoesValidas = mesclarTramitacoes(obterTramitacoes(), tramitacoesRemotas);

        if (tramitacoesValidas.length === 0) {
          throw new Error("Nenhum documento válido encontrado na planilha. Verifique se as colunas estão preenchidas.");
        }

        // Se encontrou aba de histórico, importa os eventos
        let historicoImportado: RegistroHistorico[] = [];
        if (sheetHistoricoName && workbook.Sheets[sheetHistoricoName]) {
          const wsHist = workbook.Sheets[sheetHistoricoName];
          const linhasHistBrutas = XLSX.utils.sheet_to_json(wsHist, { defval: '' });
          historicoImportado = linhasHistBrutas.map(l => normalizarItemHistorico(l)).filter(naoNulo);

          if (historicoImportado.length > 0) {
            const histAtual = obterTodoHistorico();
            const mapaHist = new Map<string, RegistroHistorico>();
            histAtual.forEach(h => mapaHist.set(h.id, h));
            historicoImportado.forEach(h => mapaHist.set(h.id, h));
            salvarTodoHistorico(Array.from(mapaHist.values()));
          }
        }

        // Se encontrou aba de usuários, importa a base de usuários
        let usuariosImportados: Usuario[] = [];
        if (sheetUsuariosName && workbook.Sheets[sheetUsuariosName]) {
          const wsUsers = workbook.Sheets[sheetUsuariosName];
          const linhasUsersBrutas = XLSX.utils.sheet_to_json(wsUsers, { defval: '' });
          usuariosImportados = linhasUsersBrutas.map(l => normalizarItemUsuario(l)).filter(naoNulo);

          if (usuariosImportados.length > 0) {
            salvarUsuarios(usuariosImportados);
          }
        }

        salvarTramitacoes(tramitacoesValidas, `Arquivo: ${arquivo.name}`);
        resolve({
          sucesso: true,
          total: tramitacoesValidas.length,
          totalHistorico: historicoImportado.length,
          totalUsuarios: usuariosImportados.length,
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
 * Exporta a base completa com 3 abas: Tramitações, Histórico de Alterações e Usuários
 */
export function exportarPlanilhaCompletaExcel(nomeArquivo: string = 'DocFlow_Base_Completa.xlsx'): boolean {
  const XLSX = window.XLSX;
  if (!XLSX) {
    console.warn("Biblioteca SheetJS não encontrada para exportação multi-aba.");
    return false;
  }

  const tramitacoes = obterTramitacoes();
  const historico = obterTodoHistorico();
  const usuarios = obterUsuarios();

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
    "Autor": h.autor || h.responsavel || '',
    "Tipo de Ação": h.tipoAcao || 'STATUS',
    "Observação": h.observacao || '',
    "Detalhes": typeof h.detalhes === 'object' && h.detalhes !== null ? JSON.stringify(h.detalhes) : (h.detalhes || '')
  }));

  const rowsUsuarios = usuarios.map(u => ({
    "ID": u.id || '',
    "Nome": u.nome || '',
    "E-mail": u.email || '',
    "Senha": u.senha || SENHA_PADRAO_IMPORTACAO,
    "Perfil": u.perfil || 'Solicitante',
    "Área": u.area || 'Geral',
    "Status": u.status || 'Ativo'
  }));

  const wb = XLSX.utils.book_new();
  const wsTram = XLSX.utils.json_to_sheet(rowsTramitacoes);
  const wsHist = XLSX.utils.json_to_sheet(rowsHistorico);
  const wsUsers = XLSX.utils.json_to_sheet(rowsUsuarios);

  XLSX.utils.book_append_sheet(wb, wsTram, "Tramitações");
  XLSX.utils.book_append_sheet(wb, wsHist, "Histórico de Alterações");
  XLSX.utils.book_append_sheet(wb, wsUsers, "Usuários");

  XLSX.writeFile(wb, nomeArquivo);
  return true;
}

// ========================================================
// Sincronização com o Power Automate
// ========================================================

/**
 * Busca dados em tempo real da nuvem via fluxo do Power Automate
 */
export async function buscarDadosDoPowerAutomate(): Promise<ResultadoSincronizacao> {
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

    const payload: unknown = await resposta.json();

    // 1. Extração da Tabela de Tramitações
    let listaLinhas: unknown[] = [];
    if (payload && typeof payload === 'object') {
      const tramitacoes = lerPropriedade(payload, 'tramitacoes');
      const value = lerPropriedade(payload, 'value');
      const results = lerPropriedade(lerPropriedade(payload, 'd'), 'results');
      if (Array.isArray(tramitacoes)) {
        listaLinhas = tramitacoes;
      } else if (Array.isArray(value)) {
        listaLinhas = value;
      } else if (Array.isArray(payload)) {
        listaLinhas = payload;
      } else if (Array.isArray(results)) {
        listaLinhas = results;
      }
    }

    // 2. Extração da Tabela de Histórico de Alterações / Eventos
    let totalHistoricoCarregado = 0;
    if (payload && typeof payload === 'object') {
      const listaHistBruta =
        lerPropriedade(payload, 'historico') ||
        lerPropriedade(payload, 'historicoAlteracoes') ||
        lerPropriedade(payload, 'Histórico de Alterações') ||
        lerPropriedade(payload, 'Historico_Alteracoes') ||
        lerPropriedade(payload, 'Historico_Eventos') ||
        lerPropriedade(payload, 'eventos');
      if (Array.isArray(listaHistBruta) && listaHistBruta.length > 0) {
        const historicoRemoto = (listaHistBruta as unknown[]).map(l => normalizarItemHistorico(l)).filter(naoNulo);
        const historicoLocal = obterTodoHistorico();

        if (historicoRemoto.length > 0) {
          const mapaHist = new Map<string, RegistroHistorico>();
          // Coloca todos os locais no mapa
          historicoLocal.forEach(h => {
            if (h && h.id) mapaHist.set(h.id, h);
          });
          // Sobrescreve/adiciona os remotos (assim IDs iguais não duplicam)
          historicoRemoto.forEach(h => {
            if (h && h.id) mapaHist.set(h.id, h);
          });
          const historicoMesclado = Array.from(mapaHist.values());
          // Salva a mescla (sem descartar nada)
          salvarTodoHistorico(historicoMesclado);
          totalHistoricoCarregado = historicoRemoto.length;
        }
      }
    }

    // 3. Extração da Tabela de Usuários
    let totalUsuariosCarregado = 0;
    if (payload && typeof payload === 'object') {
      const listaUsersBruta =
        lerPropriedade(payload, 'usuarios') ||
        lerPropriedade(payload, 'Usuários') ||
        lerPropriedade(payload, 'users') ||
        lerPropriedade(payload, 'Usuarios') ||
        lerPropriedade(payload, 'Tabela_Usuarios');
      if (Array.isArray(listaUsersBruta) && listaUsersBruta.length > 0) {
        const usersNormalizados = (listaUsersBruta as unknown[]).map(l => normalizarItemUsuario(l)).filter(naoNulo);
        if (usersNormalizados.length > 0) {
          salvarUsuarios(usersNormalizados);
          totalUsuariosCarregado = usersNormalizados.length;
        }
      }
    }

    const tramitacoesRemotas = desduplicarTramitacoes(
      listaLinhas.map(l => normalizarItemExcel(l)).filter(naoNulo)
    );

    const tramitacoesValidas = mesclarTramitacoes(obterTramitacoes(), tramitacoesRemotas);

    if (tramitacoesValidas.length > 0) {
      salvarTramitacoes(tramitacoesValidas, 'Power Automate (SharePoint)');
    }

    return {
      sucesso: true,
      total: tramitacoesValidas.length,
      totalHistorico: totalHistoricoCarregado,
      totalUsuarios: totalUsuariosCarregado,
      itens: tramitacoesValidas
    };
  } catch (erro) {
    console.error("Erro ao buscar dados do Power Automate:", erro);
    return {
      sucesso: false,
      erro: mensagemErro(erro),
      itens: obterTramitacoes()
    };
  }
}

// ========================================================
// Gerenciamento de Tema (Modo Claro / Modo Escuro)
// ========================================================
const CHAVE_TEMA = 'docflow_theme';

export function obterTemaAtual(): TemaDocFlow {
  try {
    const temaSalvo = localStorage.getItem(CHAVE_TEMA);
    if (temaSalvo === 'dark' || temaSalvo === 'light') return temaSalvo;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (e) {}
  return 'light';
}

export function definirTema(novoTema: string): void {
  const tema: TemaDocFlow = novoTema === 'dark' ? 'dark' : 'light';
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

export function aplicarTemaSalvo(): TemaDocFlow {
  const tema = obterTemaAtual();
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', tema);
  }
  return tema;
}

// Aplica imediatamente ao carregar o script no navegador
if (typeof document !== 'undefined') {
  aplicarTemaSalvo();
}

/**
 * Exibe uma notificação push tipo toast discreta no topo da tela (posição idêntica ao push de cancelamento)
 * Sem botão de desfazer, com visual sutil e encerramento automático.
 */
export function mostrarNotificacaoToast(mensagem: string = 'Sincronização concluída', tempoSegundos: number = 3): void {
  if (typeof document === 'undefined') return;

  const anterior = document.getElementById('toast-push-container');
  if (anterior) anterior.remove();

  const container = document.createElement('div');
  container.id = 'toast-push-container';
  container.className = 'toast-push-container';

  container.innerHTML = `
    <div class="toast-push-box" id="toast-push-box">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="toast-push-icone">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span class="toast-push-texto">${mensagem}</span>
    </div>
  `;

  document.body.appendChild(container);

  const box = container.querySelector('#toast-push-box');
  const fechar = (): void => {
    if (box) box.classList.add('fade-out');
    setTimeout(() => {
      if (container && container.parentNode) container.remove();
    }, 280);
  };

  setTimeout(fechar, tempoSegundos * 1000);
}

if (typeof window !== 'undefined') {
  window.mostrarNotificacaoToast = mostrarNotificacaoToast;
}

// ========================================================
// Menu de configurações (engrenagem no cabeçalho)
// ========================================================

/**
 * Inicialização do componente de configurações (Menu de Engrenagens no topo)
 */
export function inicializarMenuConfiguracoes(dropdownId: string = 'header-settings-dropdown'): void {
  const dropdown = document.getElementById(dropdownId);
  const wrapper = document.getElementById('header-settings-wrapper');
  const btnToggle = document.getElementById('btn-settings-toggle');

  if (!dropdown) return;

  const usuarioLogado = obterUsuarioAtual();
  const info = obterInfoSincronizacao();
  const textoOrigem = info.origem.includes('Arquivo')
    ? info.origem
    : (info.origem === 'Power Automate (SharePoint)' ? 'Nuvem (SharePoint)' : 'Cache Local');
  const temaAtual = obterTemaAtual();

  const userSectionHtml = usuarioLogado ? `
      <!-- Seção: Usuário Logado -->
      <div class="dropdown-user-section">
        <div class="dropdown-user-avatar" title="${usuarioLogado.perfil || 'Usuário'}">
          ${(usuarioLogado.nome || 'U').charAt(0).toUpperCase()}
        </div>
        <div class="dropdown-user-info">
          <span class="dropdown-user-name" title="${usuarioLogado.nome}">${usuarioLogado.nome}</span>
          <span class="dropdown-user-role">${usuarioLogado.perfil || 'Usuário'} • ${usuarioLogado.area || 'DocFlow'}</span>
        </div>
      </div>
      <div class="dropdown-divider"></div>
  ` : '';

  const logoutActionHtml = usuarioLogado ? `
          <button type="button" id="btn-dropdown-logout" class="dropdown-action-item danger" title="Encerrar sessão no DocFlow">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Sair da Conta</span>
          </button>
  ` : `
          <a href="login.html" class="dropdown-action-item" title="Fazer login no DocFlow">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            <span>Fazer Login</span>
          </a>
  `;

  dropdown.innerHTML = `
    <div class="dropdown-settings-content">
      ${userSectionHtml}
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

          ${logoutActionHtml}
        </div>
      </div>
    </div>
  `;

  // Eventos de troca de tema
  const btnLight = dropdown.querySelector<HTMLButtonElement>('#btn-theme-light');
  const btnDark = dropdown.querySelector<HTMLButtonElement>('#btn-theme-dark');
  if (btnLight) {
    btnLight.addEventListener('click', () => definirTema('light'));
  }
  if (btnDark) {
    btnDark.addEventListener('click', () => definirTema('dark'));
  }

  // Evento do botão Sincronizar Nuvem
  const btnNuvem = dropdown.querySelector<HTMLButtonElement>('#btn-dropdown-sinc-nuvem');
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

      const avisar = (msg: string, tit: string = 'Sincronização'): void => {
        if (typeof window !== 'undefined' && typeof window.mostrarDialogoAlerta === 'function') {
          window.mostrarDialogoAlerta({ titulo: tit, mensagem: msg });
        } else {
          alert(msg);
        }
      };

      if (resultado.sucesso) {
        if (wrapper) wrapper.classList.remove('dropdown-fixado');
        mostrarNotificacaoToast("Sincronização concluída");
      } else if (resultado.aviso) {
        avisar(`${resultado.aviso}\n\nDica: você também pode clicar em "Carregar Excel (.xlsx)" para abrir a sua planilha diretamente!`, 'Aviso de Sincronização');
      } else {
        avisar(`Erro ao sincronizar com o Power Automate:\n${resultado.erro || 'Falha de conexão'}`, 'Erro de Sincronização');
      }

      inicializarMenuConfiguracoes(dropdownId);
    });
  }

  // Evento do input de arquivo Excel
  const inputFile = dropdown.querySelector<HTMLInputElement>('#input-excel-file-dropdown');
  if (inputFile) {
    inputFile.addEventListener('change', async (e) => {
      const alvo = e.target as HTMLInputElement;
      const file = alvo.files ? alvo.files[0] : undefined;
      if (!file) return;

      const avisar = (msg: string, tit: string = 'Importação'): void => {
        if (typeof window !== 'undefined' && typeof window.mostrarDialogoAlerta === 'function') {
          window.mostrarDialogoAlerta({ titulo: tit, mensagem: msg });
        } else {
          alert(msg);
        }
      };

      try {
        await importarArquivoExcel(file);
        if (wrapper) wrapper.classList.remove('dropdown-fixado');
        mostrarNotificacaoToast("Sincronização concluída");
        inicializarMenuConfiguracoes(dropdownId);
      } catch (err) {
        avisar(`Erro ao processar o arquivo Excel:\n${mensagemErro(err)}`, 'Erro na Importação');
      } finally {
        inputFile.value = '';
      }
    });
  }

  // Evento do botão de Logout
  const btnLogout = dropdown.querySelector<HTMLButtonElement>('#btn-dropdown-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      fazerLogout();
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
      if (!wrapper.contains(e.target as Node | null)) {
        wrapper.classList.remove('dropdown-fixado');
      }
    });
  }
}

/**
 * Função mantida para compatibilidade retroativa com código existente.
 * Atualiza o menu de configurações e, se ainda houver container de barra legado, atualiza-o também.
 */
export function inicializarBarraSincronizacao(containerId: string = 'barra-sincronizacao'): void {
  // Sempre inicializa o menu de configurações no header
  inicializarMenuConfiguracoes('header-settings-dropdown');

  // Se a barra legada ainda existir no DOM por algum motivo, preenche ou remove
  const barraLegada = document.getElementById(containerId);
  if (barraLegada) {
    // Esvazia para não poluir o corpo da página
    barraLegada.innerHTML = '';
  }
}

// ========================================================
// Envio de arquivos ao SharePoint
// ========================================================

/**
 * Sanitiza o nome para ser usado como pasta no SharePoint
 */
export function sanitizarNomePasta(nome: string | null | undefined): string {
  return (nome || 'Documento_Sem_Titulo')
    .replace(/[\~\"\#\%\&\*\:\<\>\?\/\\\{\|\}]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converte um objeto File do navegador para Base64
 */
export function arquivoParaBase64(arquivo: File): Promise<ArquivoBase64> {
  return new Promise<ArquivoBase64>((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      // readAsDataURL garante que `result` é uma string aqui.
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

/**
 * Envia arquivos ao Power Automate para criar a pasta e salvar os arquivos no SharePoint.
 * Retorna o link da pasta gerado.
 */
export async function enviarArquivosParaSharePoint(
  dados: DocumentoSGI,
  docPrincipalPayload: ArquivoBase64 | null | undefined,
  anexosPayload: ArquivoBase64[] = []
): Promise<ResultadoEnvioArquivos> {
  const webhookUrl = URL_WEBHOOK_UPDATE_STATUS || URL_WEBHOOK_POST;
  if (!webhookUrl || webhookUrl.includes("COLE_AQUI")) {
    throw new Error("Webhook de atualização do Power Automate não configurado.");
  }

  const nomePastaSanitizada = sanitizarNomePasta(dados.nomePasta || dados.titulo);
  const baseUrlSharePoint = "https://grupomonto.sharepoint.com/sites/SGIMontoIndustrial/Repositrio%20%20Tramitao%20de%20Documentos/Documentos";
  const linkAnexoDireto = `${baseUrlSharePoint}/${encodeURIComponent(nomePastaSanitizada)}`;

  const arquivosPayload: ArquivoBase64[] = [];
  if (docPrincipalPayload) arquivosPayload.push(docPrincipalPayload);
  if (anexosPayload && anexosPayload.length > 0) {
    arquivosPayload.push(...anexosPayload);
  }

  const payload = {
    id: dados.id,
    codigo: dados.codigo,
    dataModificacao: new Date().toISOString(),
    campos: {
       qtdAnexos: (dados.qtdAnexos || 0) + arquivosPayload.length,
       linkAnexo: linkAnexoDireto,
       nomePasta: nomePastaSanitizada
    },
    anexos: arquivosPayload
  };

  const resposta = await fetch(webhookUrl, {
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
      const respJson: unknown = await resposta.json();
      if (respJson) {
        const linkAnexo = lerPropriedade(respJson, 'linkAnexo');
        const LinkAnexo = lerPropriedade(respJson, 'LinkAnexo');
        const link = lerPropriedade(respJson, 'link');
        const url = lerPropriedade(respJson, 'url');
        const nomePasta = lerPropriedade(respJson, 'nomePasta');
        if (linkAnexo) linkFinal = String(linkAnexo);
        else if (LinkAnexo) linkFinal = String(LinkAnexo);
        else if (link) linkFinal = String(link);
        else if (url) linkFinal = String(url);
        if (nomePasta) pastaFinal = String(nomePasta);
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

// ========================================================
// Manutenção do histórico
// ========================================================

/**
 * Limpa o histórico de alterações mantendo estritamente o último status oficial dos documentos reais
 */
export function limparHistoricoManterUltimos(): RegistroHistorico[] {
  const limpo: RegistroHistorico[] = [
    {
      id: "HIST-MR-IND-0001-SGA-001",
      idDocumento: "DOC-MR-IND-0001-SGA-001",
      codigo: "MR-IND-0001-SGA-001",
      status: "Em Revisão",
      statusAnterior: "",
      dataHora: "2026-09-14T09:00:00.000Z",
      dataExibicao: "14/09/2026 06:00",
      destino: "SGA / Qualidade",
      responsavel: "Claudia dos Santos",
      autor: "Claudia dos Santos",
      tipoAcao: "STATUS",
      detalhes: null,
      observacao: "Registro inicial do documento cadastrado no sistema."
    },
    {
      id: "HIST-MR-IND-0001-CTO-001",
      idDocumento: "DOC-MR-IND-0001-CTO-001",
      codigo: "MR-IND-0001-CTO-001",
      status: "Em Revisão",
      statusAnterior: "",
      dataHora: "2026-09-14T09:00:00.000Z",
      dataExibicao: "14/09/2026 06:00",
      destino: "Custos / Qualidade",
      responsavel: "Polyana",
      autor: "Polyana",
      tipoAcao: "STATUS",
      detalhes: null,
      observacao: "Registro inicial do documento cadastrado no sistema."
    },
    {
      id: "HIST-SUPRIMENTOS",
      idDocumento: "DOC-MATRIZ_DE_RISCOS_E_OP",
      codigo: "",
      status: "Em Revisão",
      statusAnterior: "",
      dataHora: "2026-09-07T09:00:00.000Z",
      dataExibicao: "07/09/2026 06:00",
      destino: "Suprimentos / Qualidade",
      responsavel: "Giovane",
      autor: "Giovane",
      tipoAcao: "STATUS",
      detalhes: null,
      observacao: "Documento finalizando sua emissão, faltando apenas as riscos referente ao Diligenciamento"
    }
  ];

  salvarTodoHistorico(limpo);
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(CHAVE_MODIFICACOES_LOCAIS);
  }
  return limpo;
}

if (typeof window !== 'undefined') {
  window.DocFlowDataService = {
    obterTodoHistorico,
    salvarTodoHistorico,
    obterHistoricoDocumento,
    adicionarHistoricoAlteracao,
    inicializarHistoricoSeNecessario,
    exportarPlanilhaCompletaExcel,
    gerarIdDocumento,
    limparHistoricoManterUltimos
  };
}
