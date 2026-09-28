import React from 'react';
import { DocumentoSGI, HistoricoAcao } from '../../types';
import { format } from 'date-fns';
import { DataService } from '../../services/DataService';

interface Props {
  documento: DocumentoSGI;
  onClose: () => void;
}

export const ModalDetalhes: React.FC<Props> = ({ documento, onClose }) => {
  const [historico, setHistorico] = React.useState<HistoricoAcao[]>([]);

  React.useEffect(() => {
    const todoHistorico = DataService.obterTodoHistorico();
    const docHistorico = todoHistorico.filter(h => h.idDocumento === documento.id);
    docHistorico.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
    setHistorico(docHistorico);
  }, [documento.id]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col md:flex-row overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-10 bg-white rounded-full p-1 shadow-sm"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Coluna Esquerda: Detalhes */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 border-r border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{documento.titulo || 'Sem título'}</h2>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium border">
                {documento.codigo || 'S/ Código'}
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium border border-blue-200">
                {documento.status}
              </span>
              {documento.revisao && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium border border-purple-200">
                  Rev: {documento.revisao}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Data Recebimento</p>
                <p className="font-medium text-gray-800">
                  {documento.dataRecebimento ? format(new Date(documento.dataRecebimento), 'dd/MM/yyyy') : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Remetente</p>
                <p className="font-medium text-gray-800">{documento.remetente || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Área / Disciplina</p>
                <p className="font-medium text-gray-800">
                  {documento.area || '-'} / {documento.disciplina || '-'}
                </p>
              </div>
            </div>
          </div>

          {documento.observacao && (
            <div className="mb-8">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Observações</p>
              <div className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                {documento.observacao}
              </div>
            </div>
          )}

          {documento.linkAnexo && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Anexos</p>
              <a 
                href={documento.linkAnexo} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Abrir Anexo(s)
              </a>
            </div>
          )}
        </div>

        {/* Coluna Direita: Timeline */}
        <div className="w-full md:w-80 lg:w-96 bg-gray-50 p-6 md:p-8 overflow-y-auto">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Histórico</h3>
          
          {historico.length === 0 ? (
            <p className="text-sm text-gray-500 italic text-center py-8">Nenhum histórico encontrado.</p>
          ) : (
            <div className="relative border-l border-gray-200 ml-3 space-y-6">
              {historico.map((h, index) => (
                <div key={h.id} className="relative pl-6">
                  <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-gray-50" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-medium mb-1">
                      {format(new Date(h.dataHora), "dd/MM/yyyy HH:mm")}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 mb-0.5">
                      {h.statusAnterior ? `${h.statusAnterior} → ${h.status}` : h.status}
                    </span>
                    {h.responsavel && (
                      <span className="text-xs text-gray-600">Por: {h.responsavel}</span>
                    )}
                    {h.observacao && (
                      <p className="text-xs text-gray-500 mt-2 bg-white p-2 rounded border border-gray-100">
                        {h.observacao}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
