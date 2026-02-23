'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, Cloud, AlertTriangle } from 'lucide-react';

const COLORS = ['#8B5CF6', '#06B6D4', '#FCD34D', '#FF6B9D', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const DistributionCharts = () => {
  const [porTipo, setPorTipo] = useState<any[]>([]);
  const [porFase, setPorFase] = useState<any[]>([]);
  const [porCondicao, setPorCondicao] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/distribuicoes');
        const jsonData = await res.json();
        
        setPorTipo(
          jsonData?.por_tipo_acidente?.slice?.(0, 8)?.map?.((item: any) => ({
            name: item?.tipo?.substring?.(0, 25) ?? '',
            value: item?.total ?? 0,
          })) ?? []
        );
        
        setPorFase(
          jsonData?.por_fase_dia?.map?.((item: any) => ({
            name: item?.fase ?? '',
            value: item?.total ?? 0,
          })) ?? []
        );
        
        setPorCondicao(
          jsonData?.por_condicao_meteorologica?.slice?.(0, 6)?.map?.((item: any) => ({
            name: item?.condicao ?? '',
            value: item?.total ?? 0,
          })) ?? []
        );
      } catch (error) {
        console.error('Erro ao carregar distribuições:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-80 animate-pulse" />
        ))}
      </div>
    );
  }

  const ChartCard = ({ title, icon: Icon, data, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
            <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '11px',
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data?.map?.((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length] ?? COLORS[0]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Distribuições</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Por Tipo de Acidente"
          icon={AlertTriangle}
          data={porTipo}
          color="#8B5CF6"
        />
        <ChartCard
          title="Por Fase do Dia"
          icon={Clock}
          data={porFase}
          color="#FCD34D"
        />
        <ChartCard
          title="Por Condição Meteorológica"
          icon={Cloud}
          data={porCondicao}
          color="#06B6D4"
        />
      </div>
    </div>
  );
};

export default DistributionCharts;
