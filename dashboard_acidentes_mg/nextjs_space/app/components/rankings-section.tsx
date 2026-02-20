'use client';

import { useEffect, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const RankingsSection = () => {
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [brs, setBrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/data/rankings.json');
        const jsonData = await res.json();
        
        setMunicipios(jsonData?.top_municipios ?? []);
        setBrs(jsonData?.top_brs ?? []);
      } catch (error) {
        console.error('Erro ao carregar rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-96 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const RankingCard = ({ title, icon: Icon, data, type, color }: any) => (
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
        <div className="space-y-3">
          {data?.map?.((item: any, index: number) => {
            const maxAcidentes = data?.[0]?.total_acidentes ?? 1;
            const percentage = ((item?.total_acidentes ?? 0) / maxAcidentes) * 100;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: index < 3 ? color : '#9CA3AF' }}
                    >
                      {item?.posicao ?? index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {type === 'municipio' ? item?.municipio : `BR-${item?.br}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item?.total_mortos ?? 0} mortos • {item?.total_feridos ?? 0} feridos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {item?.total_acidentes?.toLocaleString?.('pt-BR') ?? '0'}
                    </p>
                    <p className="text-xs text-gray-500">acidentes</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Rankings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingCard
          title="Top 10 Municípios"
          icon={MapPin}
          data={municipios}
          type="municipio"
          color="#8B5CF6"
        />
        <RankingCard
          title="Top 10 BRs"
          icon={Navigation}
          data={brs}
          type="br"
          color="#FF6B9D"
        />
      </div>
    </div>
  );
};

export default RankingsSection;
