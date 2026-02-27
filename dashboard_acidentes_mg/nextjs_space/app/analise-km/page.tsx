"use client";

import { useState } from "react";
import { useFilters } from "../components/filters-context";
import KmChart from "../components/km-chart";
import { MapPin, Check, Route } from "lucide-react";

const PRINCIPAIS_BRS = ["381", "040", "116", "262", "050", "153", "365", "493", "146"]; 

export default function AnaliseKmPage() {
  const { filters } = useFilters();
  
  // Estados da interface (visão provisória)
  const [brSelecionada, setBrSelecionada] = useState("381");
  const [kmInicioSelecionado, setKmInicioSelecionado] = useState("");
  const [kmFimSelecionado, setKmFimSelecionado] = useState("");

  // Estados aplicados ao gráfico (pós clique)
  const [brAplicada, setBrAplicada] = useState("381");
  const [kmInicioAplicado, setKmInicioAplicado] = useState("");
  const [kmFimAplicado, setKmFimAplicado] = useState("");

  const handleAplicar = () => {
    setBrAplicada(brSelecionada);
    setKmInicioAplicado(kmInicioSelecionado);
    setKmFimAplicado(kmFimSelecionado);
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Análise Espacial: KM e Causas
        </h1>
        <p className="text-gray-500 mt-1">
          Distribuição de acidentes, severidade e causas predominantes por trechos rodoviários.
        </p>
      </div>

      <div className="w-full flex flex-wrap items-center gap-4">
        
        {/* Card de BR Transformado em <label> para ser 100% clicável */}
        <label className="flex-1 min-w-[140px] max-w-[200px] bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-purple-200 transition-all cursor-pointer">
          <div className="flex items-center gap-2 mb-1.5 text-gray-400">
            <Route size={14} className="text-purple-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Rodovia (BR)</span>
          </div>
          <select
            value={brSelecionada}
            onChange={(e) => setBrSelecionada(e.target.value)}
            className="w-full text-sm font-semibold bg-transparent outline-none text-gray-700 cursor-pointer appearance-none"
          >
            {PRINCIPAIS_BRS.map((br) => (
              <option key={br} value={br}>
                BR-{br}
              </option>
            ))}
          </select>
        </label>

        {/* Novo Card: KM Inicial */}
        <label className="flex-1 min-w-[120px] max-w-[160px] bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-purple-200 transition-all cursor-text">
          <div className="flex items-center gap-2 mb-1.5 text-gray-400">
            <MapPin size={14} className="text-purple-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">KM Inicial</span>
          </div>
          <input
            type="number"
            placeholder="Ex: 0"
            value={kmInicioSelecionado}
            onChange={(e) => setKmInicioSelecionado(e.target.value)}
            className="w-full text-sm font-semibold bg-transparent outline-none text-gray-700 placeholder-gray-300"
          />
        </label>

        {/* Novo Card: KM Final */}
        <label className="flex-1 min-w-[120px] max-w-[160px] bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-purple-200 transition-all cursor-text">
          <div className="flex items-center gap-2 mb-1.5 text-gray-400">
            <MapPin size={14} className="text-purple-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">KM Final</span>
          </div>
          <input
            type="number"
            placeholder="Ex: 100"
            value={kmFimSelecionado}
            onChange={(e) => setKmFimSelecionado(e.target.value)}
            className="w-full text-sm font-semibold bg-transparent outline-none text-gray-700 placeholder-gray-300"
          />
        </label>

        {/* Botão Aplicar */}
        <button 
          onClick={handleAplicar}
          className="flex items-center gap-2 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm h-full"
        >
          <Check size={16} /> APLICAR FILTRO
        </button>

      </div>

      {/* Gráfico recebendo as 3 propriedades aplicadas */}
      <KmChart 
        brEspecifica={brAplicada} 
        kmInicio={kmInicioAplicado} 
        kmFim={kmFimAplicado} 
      />
    </div>
  );
}