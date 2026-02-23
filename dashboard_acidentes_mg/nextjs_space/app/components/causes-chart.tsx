'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertCircle } from 'lucide-react';

const COLORS = ['#3B82F6', '#FF6B9D', '#06B6D4', '#FCD34D', '#8B5CF6', '#10B981'];

const CausesChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/causas');
        const jsonData = await res.json();
        
        // Get top 5 causes for better visualization
        const topCausas = jsonData?.top_causas?.slice?.(0, 5)?.map?.((item: any) => ({
          name: item?.causa?.substring?.(0, 30) ?? '',
          value: item?.total_acidentes ?? 0,
          percentual: item?.percentual ?? 0,
        })) ?? [];
        
        setData(topCausas);
      } catch (error) {
        console.error('Erro ao carregar causas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 h-96 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-full bg-gray-100 rounded" />
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.[0]) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{payload?.[0]?.name}</p>
          <p className="text-sm text-gray-600">Acidentes: {payload?.[0]?.value?.toLocaleString?.()}</p>
          <p className="text-sm text-gray-600">Percentual: {payload?.[0]?.payload?.percentual?.toFixed?.(2)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Causas Principais</h2>
            <p className="text-sm text-gray-500 mt-1">Top 5 causas de acidentes</p>
          </div>
          <div className="p-3 bg-primary-blue bg-opacity-10 rounded-lg">
            <AlertCircle className="w-6 h-6 text-primary-blue" />
          </div>
        </div>
      </div>

      <div className="p-6 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ percentual }) => `${percentual?.toFixed?.(1) ?? 0}%`}
              labelLine={false}
            >
              {data?.map?.((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length] ?? COLORS[0]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 10 }}
              iconType="circle"
              align="center"
              verticalAlign="bottom"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CausesChart;
