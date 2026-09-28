import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DocumentoSGI } from '../../types';
import { DocumentCard } from './DocumentCard';
import clsx from 'clsx';

interface Props {
  title: string;
  items: DocumentoSGI[];
  onDocumentClick: (doc: DocumentoSGI) => void;
}

export const KanbanColumn: React.FC<Props> = ({ title, items, onDocumentClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: title,
    data: {
      type: 'Column',
      title,
    }
  });

  return (
    <div className="flex flex-col bg-gray-50/50 rounded-xl border border-gray-200 w-[320px] shrink-0 h-full max-h-full">
      <div className="p-4 border-b border-gray-200 bg-white/50 rounded-t-xl flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full font-medium">
          {items.length}
        </span>
      </div>
      
      <div 
        ref={setNodeRef}
        className={clsx(
          "flex-1 p-3 overflow-y-auto flex flex-col gap-3 transition-colors",
          isOver && "bg-blue-50/50"
        )}
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((doc) => (
            <DocumentCard key={doc.id} documento={doc} onClick={onDocumentClick} />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <div className="h-full flex items-center justify-center text-sm text-gray-400 italic">
            Nenhum documento
          </div>
        )}
      </div>
    </div>
  );
};
