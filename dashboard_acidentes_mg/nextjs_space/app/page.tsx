'use client';
import KPISection from './components/kpi-section';
import EvolutionChart from './components/evolution-chart';
import CausesChart from './components/causes-chart';
import DistributionCharts from './components/distribution-charts';
import RankingsSection from './components/rankings-section';
import CriticalAreasSection from './components/critical-areas-section';
import UploadButton from './components/upload-button';
import FiltersBar from './components/filters-bar';
import { FiltersProvider } from './components/filters-context';

export default function Home() {
  return (
    <FiltersProvider>
      <div className="w-full min-h-screen bg-gray-50 p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard de Acidentes de Trânsito</h1>
            <p className="text-gray-500 mt-1">Análise estratégica de ocorrências em Minas Gerais</p>
          </div>
          <UploadButton />
        </div>
        
        <div className="w-full">
          <FiltersBar />
        </div>

        <KPISection />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 w-full"><EvolutionChart /></div>
          <div className="xl:col-span-1 w-full"><CausesChart /></div>
        </div>

        <div className="w-full"><DistributionCharts /></div>
        <div className="w-full"><RankingsSection /></div>
        <div className="w-full"><CriticalAreasSection /></div>
      </div>
    </FiltersProvider>
  );
}
