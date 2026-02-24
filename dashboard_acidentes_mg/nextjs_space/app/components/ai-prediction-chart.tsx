'use client';
import { useState, useEffect } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Brain, Activity, BookOpen, Target, ShieldAlert, ListChecks, Filter, Search } from 'lucide-react';

const AIPredictionChart = () => {
  const [data, setData] = useState<any>(null);
  const [reduction, setReduction] = useState(0);
  const [selectedBR, setSelectedBR] = useState('');

  useEffect(() => {
    const factor = 1 - (reduction / 100);
    const url = `http://localhost:8000/api/predict/lstm?factor=${factor}${selectedBR ? `&br=${selectedBR}` : ''}`;
    
    fetch(url)
      .then(res => res.json())
      .then(json => {
        // Normalização dos dados: Garantimos que o estado sempre tenha a estrutura correta
        const chartData = (json.previsao || []).map((d: any) => ({ 
          ...d, 
          valor: d.predicao || 0, 
          min: (d.predicao || 0) - 3, 
          max: (d.predicao || 0) + 3 
        }));

        setData({
          chart: chartData,
          metrics: json.metrics || {},
          // Aqui está o segredo: tentamos pegar de várias chaves possíveis ou retornamos lista vazia
          causas: json.causas_principais || json.causas || []
        });
      })
      .catch(err => {
        console.error("Erro na busca:", err);
        setData({ chart: [], metrics: {}, causas: [] });
      });
  }, [reduction, selectedBR]);

  // Enquanto o 'data' for null, mostramos o loading
  if (!data) {
    return (
      <div className="p-10 text-center font-bold text-purple-600 animate-pulse uppercase border-2 border-dashed border-purple-200 rounded-xl">
        Sincronizando Inteligência Preditiva...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CENTRAL DE LITERACIA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm"><Brain className="text-purple-600 w-5 h-5 mb-2" /><h4 className="font-bold text-[10px] uppercase">Lógica IA</h4><p className="text-[10px] text-gray-400">Modelo LSTM focado em tendências de 2026.</p></div>
        <div className="bg-white p-4 rounded-xl border shadow-sm"><Activity className="text-cyan-500 w-5 h-5 mb-2" /><h4 className="font-bold text-[10px] uppercase">Incerteza</h4><p className="text-[10px] text-gray-400">Nuvem ciano representa a margem de erro (MAE).</p></div>
        <div className="bg-white p-4 rounded-xl border shadow-sm"><BookOpen className="text-blue-600 w-5 h-5 mb-2" /><h4 className="font-bold text-[10px] uppercase">Base de Dados</h4><p className="text-[10px] text-gray-400">Rodovia: {data.metrics?.br_ativa || "Geral MG"}.</p></div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm"><Target className="text-amber-600 w-5 h-5 mb-2" /><h4 className="font-bold text-[10px] uppercase">Simulador</h4><p className="text-[10px] text-amber-700">Ajuste a meta de redução para {data.metrics?.br_ativa || "MG"}.</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-4 rounded-xl border border-dashed gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-purple-200 shadow-sm">
                <Filter className="w-4 h-4 text-purple-500" />
                <select 
                  value={selectedBR} 
                  onChange={(e) => setSelectedBR(e.target.value)}
                  className="text-xs font-black outline-none bg-transparent cursor-pointer text-gray-800"
                >
                  <option value="">GERAL (MG)</option>
                  <option value="381">BR-381 (Rod. Morte)</option>
                  <option value="040">BR-040</option>
                  <option value="116">BR-116</option>
                  <option value="262">BR-262</option>
                </select>
              </div>
              <span className="text-[10px] font-black uppercase text-purple-900 bg-purple-100 px-3 py-1.5 rounded-full">
                Meta: {reduction}%
              </span>
            </div>
            <input type="range" min="0" max="50" step="5" value={reduction} onChange={(e)=>setReduction(parseInt(e.target.value))} className="w-full md:w-40 accent-purple-600 cursor-pointer" />
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer>
              <ComposedChart data={data.chart || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickFormatter={(v) => v ? `${v.split('-')[1]}/${v.split('-')[0].slice(2)}` : ''} fontSize={10} minTickGap={50} />
                <YAxis fontSize={12} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area name="Margem Erro" type="monotone" dataKey="max" baseValue="min" stroke="none" fill="#22d3ee" fillOpacity={0.15} />
                <Line name="Tendência 2026" type="monotone" dataKey="valor" stroke="#22d3ee" strokeWidth={4} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
            <Search className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-[10px] uppercase tracking-widest text-white">
              Análise: {data.metrics?.br_ativa || "GERAL"}
            </h4>
          </div>
          <div className="space-y-4">
            {/* O SEGREDO DA CORREÇÃO: Encadeamento opcional (?.) e Fallback (|| []) */}
            {(data?.causas || []).map((c: any, i: number) => (
              <div key={i} className="p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-colors">
                <span className="text-[9px] font-bold text-cyan-400 block mb-1 uppercase">Ação p/ {c}</span>
                <p className="text-[10px] opacity-70 leading-relaxed">Operação preventiva baseada na meta de {reduction}% de redução.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPredictionChart;
