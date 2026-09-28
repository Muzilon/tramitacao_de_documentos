import React from 'react';
import { Home, LayoutDashboard, FilePlus, Settings } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-orange-600 text-white flex flex-col h-full">
      <div className="p-6 text-2xl font-bold border-b border-orange-700">
        DocFlow
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-700 transition-colors">
          <Home size={20} />
          <span>Início</span>
        </a>
        <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-700 transition-colors">
          <LayoutDashboard size={20} />
          <span>Quadro</span>
        </a>
        <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-700 transition-colors">
          <FilePlus size={20} />
          <span>Novo Documento</span>
        </a>
      </nav>
      <div className="p-4 border-t border-orange-700">
        <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-700 transition-colors">
          <Settings size={20} />
          <span>Configurações</span>
        </a>
      </div>
    </div>
  );
};
