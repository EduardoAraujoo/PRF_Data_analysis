'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useFilters } from './filters-context';

const COLORS = ['#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe','#ede9fe','#7c3aed','#6d28d9','#5b21b6','#4c1d95','#3b0764'];

export default function RankingsSection() {
  const [data, setData] = useState<any>({ top_municipios: [], top_brs: [] });
  const { queryString } = useFilters();

  useEffect(() => {
    fetch(`http://localhost:8000/api/rankings?${queryString}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(err => console.error("Erro Rankings:", err));
  }, [queryString]);

  const RankCard = ({ title, items, keyName }: { title: string; items: any[]; keyName: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={items} layout="vertical" margin={{ left: 10, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey={keyName} width={140} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="total_acidentes" name="Acidentes" radius={[0, 4, 4, 0]}>
            {items.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RankCard title="Top 10 Municípios" items={data.top_municipios} keyName="municipio" />
      <RankCard title="Top 10 BRs" items={data.top_brs} keyName="br" />
    </div>
  );
}
