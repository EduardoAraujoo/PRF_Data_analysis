'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useFilters } from './filters-context';

const COLORS = ['#8b5cf6','#06b6d4','#f59e0b','#10b981','#ef4444','#3b82f6','#ec4899','#84cc16'];

export default function DistributionCharts() {
  const [data, setData] = useState<any>({ por_tipo_acidente: [], por_fase_dia: [], por_condicao_meteorologica: [] });
  const { queryString } = useFilters();

  useEffect(() => {
    fetch(`http://localhost:8000/api/distribuicoes?${queryString}`)
      .then(r => r.json())
      .then(d => {
        if (d && !d.detail) setData(d);
      })
      .catch(err => console.error("Erro Distribuições:", err));
  }, [queryString]);

  const BarCard = ({ title, items }: { title: string; items: any[] }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={items || []} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {items?.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const PieCard = ({ title, items }: { title: string; items: any[] }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={items || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
            {items?.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <BarCard title="Por Tipo de Acidente" items={data.por_tipo_acidente} />
      <PieCard title="Por Fase do Dia" items={data.por_fase_dia} />
      <BarCard title="Por Condição Meteorológica" items={data.por_condicao_meteorologica} />
    </div>
  );
}
