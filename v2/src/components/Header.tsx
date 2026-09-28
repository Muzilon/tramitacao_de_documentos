import React from 'react';
import { Search } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between">
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Buscar documentos..."
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {/* User profile, notifications, etc. can go here */}
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
          U
        </div>
      </div>
    </header>
  );
};
