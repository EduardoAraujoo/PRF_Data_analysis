'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useFilters } from './filters-context';

const COLORS = ['#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe','#ede9fe'];

export default function CausesChart() {
  const [data, setData] = useState<any[]>([]);
  const { queryString } = useFilters();

  useEffect(() => {
    fetch(`http://localhost:8000/api/causas?${queryString}`)
      .then(r => r.json())
      .then(d => setData(d.top_causas || []))
      .catch(err => console.error("Erro Causas:", err));
  }, [queryString]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
      <h3 className="text-lg font-semibold mb-4">Top 5 Causas de Acidentes</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="causa" width={160} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(v: any, n: any, p: any) => [`${v} (${p.payload.percentual}%)`, 'Acidentes']} />
          <Bar dataKey="total_acidentes" radius={[0, 4, 4, 0]}>
            {data.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
