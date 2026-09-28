import React from 'react';
import { DashboardIndicadores } from '../dashboard/DashboardIndicadores';

interface ModalDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalDashboard: React.FC<ModalDashboardProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-11/12 max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header do Modal */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Visão Gerencial</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
            aria-label="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conteúdo do Dashboard */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <DashboardIndicadores />
        </div>
        
      </div>
    </div>
  );
};
