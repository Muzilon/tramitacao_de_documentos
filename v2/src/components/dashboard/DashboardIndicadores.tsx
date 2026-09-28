import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const mockTempoFase = [
  { name: 'Emissão', tempo: 2 },
  { name: 'Revisão', tempo: 5 },
  { name: 'Aprovação', tempo: 3 },
  { name: 'Assinatura', tempo: 1 },
  { name: 'Arquivo', tempo: 2 },
];

const mockVolumeArea = [
  { name: 'Engenharia', value: 400 },
  { name: 'Qualidade', value: 300 },
  { name: 'Suprimentos', value: 300 },
  { name: 'Diretoria', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const DashboardIndicadores: React.FC = () => {
  return (
    <div className="flex flex-col space-y-6 bg-slate-50 p-6 rounded-lg shadow-sm h-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Painel de Indicadores SGI</h2>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow border border-slate-100 flex flex-col justify-center items-center">
          <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Lead Time Médio</span>
          <span className="text-3xl font-bold text-blue-600 mt-2">13 Dias</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-slate-100 flex flex-col justify-center items-center">
          <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Maior Gargalo</span>
          <span className="text-3xl font-bold text-orange-500 mt-2">Revisão</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-slate-100 flex flex-col justify-center items-center">
          <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Taxa de Devolução</span>
          <span className="text-3xl font-bold text-red-500 mt-2">18%</span>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Tempo Médio por Fase */}
        <div className="bg-white p-4 rounded-xl shadow border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">Tempo Médio por Fase (Dias)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockTempoFase}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="tempo" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Volume por Área */}
        <div className="bg-white p-4 rounded-xl shadow border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">Volume de Documentos por Área</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockVolumeArea}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {mockVolumeArea.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
