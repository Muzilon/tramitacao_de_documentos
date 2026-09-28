export interface DocumentoSGI {
  id: string;
  codigo: string;
  titulo: string;
  status: string;
  tipoDocumento?: string;
  revisao?: string;
  dataRecebimento?: string;
  dataRevisao?: string;
  remetente?: string;
  area?: string;
  disciplina?: string;
  observacao?: string;
  linkAnexo?: string;
  nomePasta?: string;
  nomeArquivoPrincipal?: string;
  qtdAnexos?: number;
  dataModificacao?: string;
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
  tipoAcao?: string;
  detalhes?: any;
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

export interface FilaEnvio {
  idFila: string;
  tipo: 'CADASTRO' | 'ATUALIZACAO' | 'HISTORICO' | 'ANEXOS';
  idDocumento: string;
  dados: any;
  tentativas: number;
  ultimaTentativa: string | null;
  ultimoErro: string | null;
  status: 'pendente' | 'falhou';
}
