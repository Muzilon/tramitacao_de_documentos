import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PlannerBoard } from './components/kanban/PlannerBoard';

function App() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden bg-gray-100">
          <PlannerBoard />
        </main>
      </div>
    </div>
  );
}

export default App;
