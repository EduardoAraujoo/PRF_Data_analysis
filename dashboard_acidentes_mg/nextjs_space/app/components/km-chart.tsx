// IMPORTAÇÕES MANTIDAS IGUAIS (import React, Recharts, Lucide, etc.)
"use client";

import { useEffect, useState } from "react";
import { useFilters } from "./filters-context";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AlertTriangle, MapPin } from "lucide-react";

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6'];

// ATUALIZE A DECLARAÇÃO PARA RECEBER brEspecifica
export default function KmChart({ brEspecifica }: { brEspecifica: string }) {
  const { filters } = useFilters();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<string[]>([]);
  const [insights, setInsights] = useState<{ piorTrecho: string; causaLider: string; severidade: number } | null>(null);
  
useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.ano) params.append("ano", filters.ano);
        if (filters.condicao_met) params.append("condicao_met", filters.condicao_met);
        
        // ENVIA A BR ESPECÍFICA PARA A API
        if (brEspecifica) params.append("br", brEspecifica);

        const res = await fetch(`http://localhost:8000/api/distribuicao-km?${params.toString()}`);
        const json = await res.json();

        if (json.faixas_km && json.faixas_km.length > 0) {
          const chartData: any[] = [];
          const allCauses = new Set<string>();
          let maxSeveridade = -1;
          let piorTrechoInfo = null;

          json.faixas_km.forEach((item: any) => {
            // Achatando o objeto para o formato do Recharts
            const row: any = { 
              faixa_km: item.faixa_km, 
              total: item.total_acidentes,
              severidade: item.indice_severidade,
              causa_predominante: item.causa_predominante
            };
            
            Object.entries(item.causas_detalhadas).forEach(([causa, qtd]) => {
              row[causa] = qtd;
              allCauses.add(causa);
            });
            chartData.push(row);

            // Coletando o insight do pior trecho
            if (item.indice_severidade > maxSeveridade) {
              maxSeveridade = item.indice_severidade;
              piorTrechoInfo = {
                piorTrecho: item.faixa_km,
                causaLider: item.causa_predominante,
                severidade: item.indice_severidade
              };
            }
          });

          setKeys(Array.from(allCauses));
          setData(chartData);
          setInsights(piorTrechoInfo);
        } else {
          setData([]);
          setInsights(null);
        }
      } catch (error) {
        console.error("Erro ao buscar dados de KM:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
 }, [filters, brEspecifica]);
  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Carregando dados espaciais...</div>;
  }

  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Nenhum dado de KM encontrado para os filtros selecionados. (Dica: Selecione uma BR específica).</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cards de Insights */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-900">Trecho Mais Crítico (Maior Severidade)</p>
              <p className="text-2xl font-bold text-red-700">KM {insights.piorTrecho}</p>
              <p className="text-xs text-red-600 mt-1">Índice de Severidade: {insights.severidade}</p>
            </div>
          </div>
          
          <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-900">Anomalia Identificada</p>
              <p className="text-sm text-amber-800 mt-1">
                A causa predominante no pior trecho desta rodovia é <strong>"{insights.causaLider}"</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Distribuição de Acidentes por KM (Causas Empilhadas)</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="faixa_km" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {keys.map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  stackId="a" 
                  fill={COLORS[index % COLORS.length]} 
                  radius={index === keys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}