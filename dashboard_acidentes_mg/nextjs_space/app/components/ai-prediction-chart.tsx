'use client';
import { useState, useEffect, useMemo } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, Activity, BookOpen, Target, ShieldCheck, AlertTriangle, Calendar, Filter } from 'lucide-react';

const AIPredictionChart = () => {
  const [data, setData] = useState<any>(null);
  const [reduction, setReduction] = useState(0);
  const [selectedBR, setSelectedBR] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(''); // NOVO: Estado para o mês

  useEffect(() => {
    const factor = 1 - (reduction / 100);
    fetch(`http://localhost:8000/api/predict/lstm?factor=${factor}${selectedBR ? `&br=${selectedBR}` : ''}`)
      .then(res => res.json())
      .then(json => {
        if (!json.error) {
          const prev = (json.previsao || []).map((d: any) => ({ 
            ...d, 
            valor: d.predicao, 
            min: d.predicao - 4, 
            max: d.predicao + 4,
            month: d.date.split('-')[1] // Extrai o mês (01, 02...)
          }));
          setData({ chart: prev, metrics: json.metrics, causas: json.causas_principais || [] });
        }
      }).catch(() => setData({ chart: [], metrics: {}, causas: [] }));
  }, [reduction, selectedBR]);

  // FILTRAGEM DINÂMICA POR MÊS
  const filteredData = useMemo(() => {
    if (!data?.chart) return [];
    if (!selectedMonth) return data.chart; // "Todos os Meses"
    return data.chart.filter((item: any) => item.month === selectedMonth);
  }, [data, selectedMonth]);

  if (!data) return <div className="p-10 text-center font-bold text-violet-600 animate-pulse uppercase">Sincronizando Calendário 2026...</div>;

  const getRecomendacao = () => {
    if (reduction > 30) return "Ei, coloque mais bafômetros aqui! A meta é ambiciosa.";
    if (data.metrics?.risk_level === 'CRÍTICO') return "Atenção, aumente a fiscalização de velocidade naquele trecho!";
    return "Mantenha o patrulhamento preventivo focado em ultrapassagens.";
  };

  return (
    <div className="space-y-6">
      {/* SELETORES REESTILIZADOS */}
      <div className="bg-white p-5 rounded-2xl border-b-4 border-violet-500 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-violet-600 rounded-xl text-white shadow-lg shadow-violet-200"><Calendar className="w-6 h-6" /></div>
          <div>
            <h3 className="font-black text-lg text-slate-800 leading-none">Cronograma 2026</h3>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Planejamento Mensal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* SELETOR DE MÊS */}
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-xs font-black text-violet-700 outline-none focus:border-violet-500 transition-all cursor-pointer"
          >
            <option value="">TODOS OS MESES</option>
            <option value="01">JANEIRO</option>
            <option value="02">FEVEREIRO</option>
            <option value="03">MARÇO</option>
            <option value="04">ABRIL</option>
            <option value="05">MAIO</option>
            <option value="06">JUNHO</option>
            <option value="07">JULHO</option>
            <option value="08">AGOSTO</option>
            <option value="09">SETEMBRO</option>
            <option value="10">OUTUBRO</option>
            <option value="11">NOVEMBRO</option>
            <option value="12">DEZEMBRO</option>
          </select>

          {/* SELETOR DE RODOVIA */}
          <select 
            value={selectedBR} 
            onChange={(e) => setSelectedBR(e.target.value)}
            className="bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-xs font-black text-violet-700 outline-none focus:border-violet-500 transition-all cursor-pointer"
          >
            <option value="">GERAL MG</option>
            <option value="381">BR-381</option>
            <option value="040">BR-040</option>
            <option value="116">BR-116</option>
            <option value="262">BR-262</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center bg-violet-50/50 p-5 rounded-2xl border border-violet-100 gap-6">
            <span className="text-[11px] font-black text-violet-900 uppercase tracking-tighter">Simulador de Meta Operacional</span>
            <div className="flex items-center gap-5 w-full md:w-auto">
              <input type="range" min="0" max="50" step="5" value={reduction} onChange={(e)=>setReduction(parseInt(e.target.value))} className="w-full md:w-64 accent-violet-600" />
              <span className="text-[11px] font-black text-white bg-violet-600 px-4 py-2 rounded-lg shadow-md min-w-[90px] text-center uppercase">
                Redução: {reduction}%
              </span>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer>
              <ComposedChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                   dataKey="date" 
                   tickFormatter={(v) => {
                     const parts = v.split('-');
                     return selectedMonth ? parts[2] : parts[1] + '/' + parts[0].slice(2);
                   }} 
                   fontSize={10} 
                   stroke="#94a3b8"
                />
                <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} domain={['dataMin - 3', 'dataMax + 3']} />
                <Tooltip 
                   labelFormatter={(v) => `Data: ${v}`}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area name="Incerteza" type="monotone" dataKey="max" baseValue="min" stroke="none" fill="#8b5cf6" fillOpacity={0.1} />
                <Line name="Projeção 2026" type="monotone" dataKey="valor" stroke="#8b5cf6" strokeWidth={4} dot={false} animationDuration={1000} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PLANO DE SEGURANÇA */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white">
           <div className="flex items-center gap-3 mb-6">
             <ShieldCheck className="w-6 h-6" />
             <h4 className="font-black text-xs uppercase tracking-widest">Plano de Segurança</h4>
           </div>
           <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-[13px] font-bold leading-tight">{getRecomendacao()}</p>
              </div>
              <p className="text-[10px] font-bold opacity-60 uppercase">Fatores Analisados:</p>
              {(data?.causas || []).map((c: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-[10px] font-medium bg-black/20 p-2 rounded-lg">
                   <AlertTriangle className="w-3 h-3 text-amber-400" /> {c}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
export default AIPredictionChart;
