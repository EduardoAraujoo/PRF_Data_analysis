'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, Navigation, Skull } from 'lucide-react';

const CriticalAreasSection = () => {
  const [municipiosCriticos, setMunicipiosCriticos] = useState<any[]>([]);
  const [brsCriticas, setBrsCriticas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/data/areas_criticas.json');
        const jsonData = await res.json();
        
        setMunicipiosCriticos(jsonData?.municipios_criticos?.dados ?? []);
        setBrsCriticas(jsonData?.brs_criticas?.dados ?? []);
      } catch (error) {
        console.error('Erro ao carregar áreas críticas:', error);
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

  const getSeverityColor = (value: number) => {
    if (value >= 2.5) return '#EF4444'; // red
    if (value >= 2.0) return '#F59E0B'; // orange
    return '#FCD34D'; // yellow
  };

  const getMortalityColor = (value: number) => {
    if (value >= 10) return '#EF4444'; // red
    if (value >= 7) return '#F59E0B'; // orange
    return '#FCD34D'; // yellow
  };

  const CriticalCard = ({ title, subtitle, icon: Icon, data, type }: any) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Icon className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {data?.map?.((item: any, index: number) => {
            const value = type === 'gravidade' ? item?.indice_gravidade : item?.taxa_mortalidade;
            const color = type === 'gravidade' ? getSeverityColor(value ?? 0) : getMortalityColor(value ?? 0);

            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-red-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {item?.posicao ?? index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {type === 'gravidade' ? item?.municipio : `BR-${item?.br}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item?.total_acidentes ?? 0} acidentes • {item?.total_mortos ?? 0} mortos
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className="text-2xl font-bold"
                    style={{ color }}
                  >
                    {value?.toFixed?.(2) ?? '0'}
                  </div>
                  <p className="text-xs text-gray-500">
                    {type === 'gravidade' ? 'Índice' : 'Taxa %'}
                  </p>
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
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-8 h-8 text-red-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Áreas Críticas</h2>
          <p className="text-sm text-gray-500">Locais de maior risco e gravidade</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CriticalCard
          title="Municípios Críticos"
          subtitle="Maior índice de gravidade"
          icon={MapPin}
          data={municipiosCriticos}
          type="gravidade"
        />
        <CriticalCard
          title="BRs Críticas"
          subtitle="Maior taxa de mortalidade"
          icon={Skull}
          data={brsCriticas}
          type="mortalidade"
        />
      </div>
    </div>
  );
};

export default CriticalAreasSection;
