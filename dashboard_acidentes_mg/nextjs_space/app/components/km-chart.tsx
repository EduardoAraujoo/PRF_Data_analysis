"use client";

import { useEffect, useState } from "react";
import { useFilters } from "./filters-context";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AlertTriangle, MapPin } from "lucide-react";

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6'];

// COMPONENTE NOVO: Tooltip Customizado para mostrar o Total
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Pega a linha completa de dados do KM atual
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-xl rounded-xl min-w-[200px]">
        <p className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-2">Trecho: KM {label}</p>
        
        {/* Aqui mostramos o Total Geral do KM em destaque */}
        <p className="text-sm font-bold text-gray-700 mb-3 flex justify-between">
          Total de Acidentes: <span className="text-purple-600 text-base">{data.total}</span>
        </p>
        
        {/* Aqui listamos as causas detalhadas */}
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-xs flex justify-between gap-4">
              <span style={{ color: entry.color }} className="font-medium">{entry.name}</span>
              <span className="font-bold text-gray-700">{entry.value}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function KmChart({ brEspecifica, kmInicio, kmFim }: { brEspecifica: string, kmInicio: string, kmFim: string }) {
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
        if (brEspecifica) params.append("br", brEspecifica);
        if (kmInicio) params.append("km_inicio", kmInicio);
        if (kmFim) params.append("km_fim", kmFim);

        const res = await fetch(`http://localhost:8000/api/distribuicao-km?${params.toString()}`);
        const json = await res.json();

        if (json.faixas_km && json.faixas_km.length > 0) {
          const chartData: any[] = [];
          const allCauses = new Set<string>();
          let maxSeveridade = -1;
          let piorTrechoInfo = null;

          json.faixas_km.forEach((item: any) => {
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
  }, [filters, brEspecifica, kmInicio, kmFim]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm">
        <p className="text-gray-400 font-medium">Analisando malha rodoviária...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
        <p className="text-gray-400 font-medium">
          Nenhum dado de KM encontrado para este trecho ou rodovia.<br/>
          <span className="text-sm">(Dica: Verifique se o KM Final é maior que o Inicial e clique em Aplicar)</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50/50 border border-red-100 p-5 rounded-xl flex items-start gap-4 shadow-sm transition-all hover:shadow-md">
            <div className="p-3 bg-red-100 rounded-xl text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-900 mb-1">Trecho Mais Crítico</p>
              <p className="text-3xl font-black text-red-700">KM {insights.piorTrecho}</p>
              <p className="text-xs font-semibold text-red-600 mt-2 bg-red-100 inline-block px-2 py-1 rounded-md">
                Severidade: {insights.severidade}
              </p>
            </div>
          </div>
          
          <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-xl flex items-start gap-4 shadow-sm transition-all hover:shadow-md">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-amber-900 mb-1">Anomalia Identificada</p>
              <p className="text-sm text-amber-800 mt-2 leading-relaxed">
                A causa predominante no trecho mais perigoso avaliado é <strong className="font-black text-amber-900">"{insights.causaLider}"</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Volume de Acidentes e Causas por KM</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="faixa_km" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              {/* Aqui nós passamos o nosso Tooltip Customizado para o Recharts */}
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: '500' }} />
              {keys.map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  stackId="a" 
                  fill={COLORS[index % COLORS.length]} 
                  radius={index === keys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  barSize={40}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}