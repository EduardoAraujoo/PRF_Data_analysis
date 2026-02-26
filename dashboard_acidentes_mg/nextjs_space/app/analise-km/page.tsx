"use client";

import { useState } from "react";
import { useFilters } from "../components/filters-context";
import KmChart from "../components/km-chart";

const PRINCIPAIS_BRS = ["381", "040", "116", "262", "050", "153", "365", "493", "146"]; 

export default function AnaliseKmPage() {
  const { filters } = useFilters();
  
  // 1. Estado da caixinha de seleção (visão provisória)
  const [brSelecionada, setBrSelecionada] = useState("381");
  
  // 2. Estado que efetivamente ativa a busca no gráfico (após clique no botão)
  const [brAplicada, setBrAplicada] = useState("381");

  // Função disparada ao clicar no botão Aplicar
  const handleAplicar = () => {
    setBrAplicada(brSelecionada);
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Análise Espacial: KM e Causas
        </h1>
        <p className="text-muted-foreground mt-2 text-slate-500">
          Distribuição de acidentes, severidade e causas predominantes por trechos rodoviários.
        </p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-primary-purple"></span>
          <p className="text-sm font-medium text-slate-700">
            Rodovia (BR) Analisada:
          </p>
        </div>
        
        {/* Seletor de BR */}
        <select
          value={brSelecionada}
          onChange={(e) => setBrSelecionada(e.target.value)}
          className="border border-slate-300 bg-slate-50 rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-purple"
        >
          {PRINCIPAIS_BRS.map((br) => (
            <option key={br} value={br}>
              BR-{br}
            </option>
          ))}
        </select>

        {/* NOVO BOTÃO DE APLICAR */}
        <button 
          onClick={handleAplicar}
          className="bg-primary-purple hover:bg-purple-700 text-white px-5 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          Aplicar Filtro
        </button>

        <p className="text-xs text-slate-400 ml-auto hidden sm:block">
          *Selecione a rodovia e clique em Aplicar.
        </p>
      </div>

      {/* Passando a BR APLICADA (e não a apenas selecionada) para o Gráfico */}
      <KmChart brEspecifica={brAplicada} />
    </div>
  );
}