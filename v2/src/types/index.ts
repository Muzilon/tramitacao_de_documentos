export interface DocumentoSGI {
  id: string;
  codigo: string;
  titulo: string;
  status: string;
  dataRecebimento: string;
  dataModificacao: string;
}

export interface HistoricoAcao {
  id: string;
  documentoId: string;
  acao: string;
  dataAcao: string;
  usuario: string;
}
