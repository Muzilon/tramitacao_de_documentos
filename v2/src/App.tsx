import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { UploadDropzone } from './components/UploadDropzone';

function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Início</h1>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Novo Documento</h2>
            <UploadDropzone />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
