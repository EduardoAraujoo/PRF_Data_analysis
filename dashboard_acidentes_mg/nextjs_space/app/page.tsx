'use client';

import KPISection from './components/kpi-section';
import EvolutionChart from './components/evolution-chart';
import CausesChart from './components/causes-chart';
import DistributionCharts from './components/distribution-charts';
import RankingsSection from './components/rankings-section';
import CriticalAreasSection from './components/critical-areas-section';
import UploadButton from './components/upload-button';

export default function Home() {
  return (
    <div className="p-6 space-y-6">
      {/* Header com Botão de Upload */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Acidentes de Trânsito</h1>
          <p className="text-gray-600 mt-1">Análise completa de acidentes em Minas Gerais</p>
        </div>
        
        {/* Nosso novo botão dinâmico */}
        <UploadButton />
      </div>

      {/* KPIs Section */}
      <KPISection />

      {/* Main Charts - Evolution and Causes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EvolutionChart />
        </div>
        <div className="lg:col-span-1">
          <CausesChart />
        </div>
      </div>

      {/* Distribution Charts */}
      <DistributionCharts />

      {/* Rankings */}
      <RankingsSection />

      {/* Critical Areas */}
      <CriticalAreasSection />
    </div>
  );
}
