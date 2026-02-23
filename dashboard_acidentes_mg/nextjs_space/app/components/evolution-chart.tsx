'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useFilters } from './filters-context';

const EvolutionChart = () => {
  const { queryString: qs } = useFilters();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/evolucao${qs ? '?' + qs : ''}`);
        const jsonData = await res.json();
        
        // Format data for chart
        const formattedData = jsonData?.evolucao?.map?.((item: any) => ({
          mes: item?.mes ?? '',
          Acidentes: item?.total_acidentes ?? 0,
          Mortos: item?.total_mortos ?? 0,
          Feridos: item?.total_feridos ?? 0,
        })) ?? [];
        
        setData(formattedData);
      } catch (error) {
        console.error('Erro ao carregar evolução:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [qs]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 h-96 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-full bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Evolução Mensal</h2>
            <p className="text-sm text-gray-500 mt-1">Série histórica de acidentes e vítimas</p>
          </div>
          <div className="p-3 bg-primary-purple bg-opacity-10 rounded-lg">
            <TrendingUp className="w-6 h-6 text-primary-purple" />
          </div>
        </div>
      </div>

      <div className="p-6">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
            <XAxis
              dataKey="mes"
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 10, fill: '#6B7280' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              verticalAlign="top"
            />
            <Bar dataKey="Acidentes" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Mortos" fill="#FF6B9D" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Feridos" fill="#06B6D4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EvolutionChart;
