'use client';
import FiltersBar from '../components/filters-bar';
import { FiltersProvider } from '../components/filters-context';

export default function LinearProfilePage() {
  return (
    <FiltersProvider>
      <div className="w-full min-h-screen bg-gray-50 p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Perfil de Risco por Quilômetro</h1>
          <p className="text-gray-500 mt-1">Análise linear de densidade de acidentes e hotspots por rodovia</p>
        </div>
        
        <div className="w-full">
          <FiltersBar />
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[400px] flex items-center justify-center text-gray-400 italic text-center">
           Aguardando implementação do Gráfico de Área (Passo 5)... <br/>
           Os dados serão consumidos de /api/v1/analytics/linear-profile/{br}
        </div>
      </div>
    </FiltersProvider>
  );
}
