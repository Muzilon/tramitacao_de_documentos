import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DocumentoSGI } from '../../types';
import clsx from 'clsx';
import { format } from 'date-fns';

interface Props {
  documento: DocumentoSGI;
  onClick: (doc: DocumentoSGI) => void;
}

export const DocumentCard: React.FC<Props> = ({ documento, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: documento.id,
    data: {
      type: 'Document',
      documento,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Recebido': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Em Revisão': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Aprovado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Devolvido': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(documento)}
      className={clsx(
        'bg-white border rounded-lg shadow-sm p-3 cursor-grab hover:shadow-md transition-shadow',
        isDragging && 'opacity-50 ring-2 ring-blue-500 cursor-grabbing',
        'flex flex-col gap-2'
      )}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono text-gray-500">{documento.codigo || 'Sem código'}</span>
        <span className={clsx('text-[10px] px-2 py-1 rounded-full border', getStatusColor(documento.status))}>
          {documento.status}
        </span>
      </div>
      
      <h4 className="text-sm font-semibold text-gray-800 line-clamp-2" title={documento.titulo}>
        {documento.titulo || 'Sem título'}
      </h4>
      
      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
        {documento.dataRecebimento ? (
          <span>{format(new Date(documento.dataRecebimento), 'dd/MM/yyyy')}</span>
        ) : <span />}
        {documento.revisao && <span>Rev: {documento.revisao}</span>}
      </div>
    </div>
  );
};
