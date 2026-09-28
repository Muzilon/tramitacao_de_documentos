// Contrato de tipos compartilhado por todos os módulos convertidos para
// TypeScript. Veja doc_projeto/02-estrutura-do-codigo.md para o modelo de
// dados original.
//
// `status` é mantido como `string` (não como união de literais) porque o
// código original trata status como texto livre em vários pontos (inclusive
// vindo direto da planilha do SharePoint). Apertar esse tipo é um passo
// futuro, não faz parte desta migração.

export interface DocumentoSGI {
  id: string;
  codigo?: string;
  titulo: string;
  status: string;
  tipoDocumento?: string;
  revisao?: string | number;
  dataRecebimento?: string;
  dataRevisao?: string;
  dataAprovacao?: string;
  dataInicio?: string;
  dataConclusao?: string;
  remetente?: string;
  area?: string;
  disciplina?: string;
  observacao?: string;
  linkAnexo?: string;
  nomePasta?: string;
  nomeArquivoPrincipal?: string;
  qtdAnexos?: number;
  dataModificacao?: string;
  [chaveExtra: string]: unknown;
}

export interface DetalheAlteracao {
  campo: string;
  antes: string;
  depois: string;
}

export interface HistoricoAcao {
  id: string;
  idDocumento: string;
  codigo?: string;
  status: string;
  statusAnterior?: string;
  dataHora: string;
  dataExibicao?: string;
  destino?: string;
  responsavel?: string;
  autor?: string;
  tipoAcao?: 'CRIACAO' | 'STATUS' | 'EDICAO' | 'ANEXO' | string;
  detalhes?: DetalheAlteracao[];
  observacao?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  perfil: string;
  area: string;
  status: string;
}

export type TipoEnvioFila = 'CADASTRO' | 'ATUALIZACAO' | 'HISTORICO' | 'ANEXOS';
export type StatusEnvioFila = 'pendente' | 'falhou';

export interface FilaEnvio {
  idFila: string;
  tipo: TipoEnvioFila;
  idDocumento: string;
  dados: unknown;
  tentativas: number;
  ultimaTentativa: string | null;
  ultimoErro: string | null;
  status: StatusEnvioFila;
}
