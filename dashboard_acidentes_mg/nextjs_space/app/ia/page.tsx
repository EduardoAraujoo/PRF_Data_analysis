'use client';
import AIPredictionChart from '../components/ai-prediction-chart';
import { FiltersProvider } from '../components/filters-context';
import { Brain, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function IAPredictionPage() {
  return (
    <FiltersProvider>
      <div className="w-full min-h-screen bg-gray-50 p-4 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-2 bg-white rounded-full border border-gray-200 text-gray-600 hover:text-primary-purple transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                Predições com Inteligência Artificial
              </h1>
              <p className="text-gray-500 mt-1">Modelos preditivos LSTM treinados com dados da PRF-MG</p>
            </div>
          </div>
        </div>

        <div className="w-full">
          <AIPredictionChart />
        </div>

        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
          <h4 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
             Nota Técnica do Modelo
          </h4>
          <p className="text-blue-700 text-sm leading-relaxed">
            As predições nesta página são processadas pelo modelo de Deep Learning (LSTM) 
            analisando tendências para 2026. Esta análise é independente dos filtros de 
            recorte mensal da Visão Geral.
          </p>
        </div>
      </div>
    </FiltersProvider>
  );
}
