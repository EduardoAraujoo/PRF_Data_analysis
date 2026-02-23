'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFilters } from './filters-context';

export default function EvolutionChart() {
  const [data, setData] = useState([]);
  const { queryString } = useFilters();

  useEffect(() => {
    fetch(`http://localhost:8000/api/evolucao?${queryString}`)
      .then(res => res.json())
      .then(data => setData(data.evolucao || []))
      .catch(err => console.error("Erro Evolução:", err));
  }, [queryString]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[450px] flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Evolução Temporal de Ocorrências</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px'}} />
            <Line type="monotone" dataKey="total_acidentes" name="Acidentes" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="total_mortos" name="Mortos" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
