import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { DocumentoSGI, HistoricoAcao } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { DocumentCard } from './DocumentCard';
import { DataService } from '../../services/DataService';
import { ModalDetalhes } from '../modals/ModalDetalhes';

const COLUMNS = ['Recebido', 'Em Revisão', 'Aprovado', 'Devolvido'];

export const PlannerBoard: React.FC = () => {
  const [items, setItems] = useState<DocumentoSGI[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentoSGI | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Tentar pegar do localStorage primeiro
      const localData = localStorage.getItem('tramitacoes');
      let localItems: DocumentoSGI[] = [];
      if (localData) {
        localItems = JSON.parse(localData);
      }
      
      const resposta = await DataService.buscarDadosDoPowerAutomate();
      if (resposta.sucesso) {
        const merged = DataService.mesclarTramitacoes(localItems, resposta.itens);
        setItems(merged);
        localStorage.setItem('tramitacoes', JSON.stringify(merged));
      } else {
        setItems(localItems);
      }
    } catch (e) {
      console.error('Erro ao carregar dados', e);
    } finally {
      setIsLoading(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getDocById = (id: string) => items.find(doc => doc.id === id);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeDocId = active.id as string;
    const overId = over.id as string;
    
    // Check if dragging over a column directly
    const isOverColumn = COLUMNS.includes(overId);
    
    // Find the document and the target column
    const activeDoc = getDocById(activeDocId);
    if (!activeDoc) return;

    let targetStatus = activeDoc.status;

    if (isOverColumn) {
      targetStatus = overId;
    } else {
      const overDoc = getDocById(overId);
      if (overDoc) {
        targetStatus = overDoc.status;
      }
    }

    if (activeDoc.status !== targetStatus && COLUMNS.includes(targetStatus)) {
      const statusAnterior = activeDoc.status;
      
      const newItems = items.map(doc => {
        if (doc.id === activeDocId) {
          return { ...doc, status: targetStatus, dataModificacao: new Date().toISOString() };
        }
        return doc;
      });
      
      setItems(newItems);
      localStorage.setItem('tramitacoes', JSON.stringify(newItems));
      
      // Update Historico
      const historicoReg: HistoricoAcao = {
        id: `hist-${Date.now()}`,
        idDocumento: activeDocId,
        codigo: activeDoc.codigo,
        status: targetStatus,
        statusAnterior,
        dataHora: new Date().toISOString(),
        responsavel: 'Usuário Atual', // Mock
        observacao: `Movido para ${targetStatus} no Kanban`
      };
      
      DataService.adicionarHistoricoAlteracao(historicoReg, true);
      // Fila de atualização de status seria enfileirada aqui
      DataService.enfileirarEnvio('ATUALIZACAO', activeDocId, { id: activeDocId, status: targetStatus });
    }
  };

  return (
    <div className="h-full flex flex-col pt-4 pb-8 px-6 overflow-hidden">
      <div className="mb-6 flex justify-between items-center shrink-0">
        <h2 className="text-2xl font-bold text-gray-800">Quadro de Tramitações</h2>
        <button 
          onClick={carregarDados}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all"
        >
          <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sincronizar
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {COLUMNS.map(col => (
              <KanbanColumn 
                key={col} 
                title={col} 
                items={items.filter(i => i.status === col)} 
                onDocumentClick={setSelectedDoc}
              />
            ))}
            
            <DragOverlay>
              {activeId ? (
                <div className="opacity-90 scale-105 shadow-xl rotate-2">
                  <DocumentCard 
                    documento={getDocById(activeId)!} 
                    onClick={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {selectedDoc && (
        <ModalDetalhes 
          documento={selectedDoc} 
          onClose={() => setSelectedDoc(null)} 
        />
      )}
    </div>
  );
};
