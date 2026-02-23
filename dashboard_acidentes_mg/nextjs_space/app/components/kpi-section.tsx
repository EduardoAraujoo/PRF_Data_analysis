'use client';

import { useEffect, useState } from 'react';
import KPICard from './kpi-card';

interface KPI {
  id: string;
  titulo: string;
  valor: number;
  formato: string;
  tendencia: {
    valor: number;
    texto: string;
    tipo: string;
  };
  descricao: string;
}

const KPISection = () => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [evolucao, setEvolucao] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [kpisRes, evolucaoRes] = await Promise.all([
          fetch('http://localhost:8000/api/kpis'),
          fetch('http://localhost:8000/api/evolucao'),
        ]);

        const kpisData = await kpisRes.json();
        const evolucaoData = await evolucaoRes.json();

        setKpis(kpisData?.kpis ?? []);
        setEvolucao(evolucaoData?.evolucao ?? []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const colors = ['#8B5CF6', '#FCD34D', '#06B6D4', '#FF6B9D', '#3B82F6'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {kpis?.map?.((kpi, index) => {
        // Get sparkline data based on KPI type
        let sparklineData: number[] = [];
        if (kpi?.id === 'total_acidentes') {
          sparklineData = evolucao?.slice?.(-12)?.map?.((e) => e?.total_acidentes ?? 0) ?? [];
        } else if (kpi?.id === 'total_mortos') {
          sparklineData = evolucao?.slice?.(-12)?.map?.((e) => e?.total_mortos ?? 0) ?? [];
        } else if (kpi?.id === 'total_feridos') {
          sparklineData = evolucao?.slice?.(-12)?.map?.((e) => e?.total_feridos ?? 0) ?? [];
        } else if (kpi?.id === 'taxa_mortalidade') {
          sparklineData = evolucao?.slice?.(-12)?.map?.((e) => {
            const total = (e?.total_mortos ?? 0) + (e?.total_feridos ?? 0);
            return total > 0 ? ((e?.total_mortos ?? 0) / total) * 100 : 0;
          }) ?? [];
        } else if (kpi?.id === 'indice_gravidade') {
          // Simplified gravity index calculation for sparkline
          sparklineData = evolucao?.slice?.(-12)?.map?.((e) => {
            const totalVitimas = (e?.total_mortos ?? 0) + (e?.total_feridos ?? 0);
            return totalVitimas > 0 ? ((e?.total_mortos ?? 0) * 5 + (e?.total_feridos ?? 0)) / totalVitimas : 0;
          }) ?? [];
        }

        return (
          <KPICard
            key={kpi?.id}
            title={kpi?.titulo ?? ''}
            value={kpi?.valor ?? 0}
            format={kpi?.formato ?? 'numero'}
            trend={kpi?.tendencia?.texto ?? ''}
            trendType={kpi?.tendencia?.tipo ?? 'neutro'}
            description={kpi?.descricao ?? ''}
            sparklineData={sparklineData}
            color={colors?.[index] ?? colors[0]}
          />
        );
      })}
    </div>
  );
};

export default KPISection;
