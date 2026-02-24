'use client';
import { useState, useEffect } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Label } from 'recharts';
import { Brain, Activity, BookOpen, SlidersHorizontal } from 'lucide-react';

const AIPredictionChart = () => {
  const [data, setData] = useState<any>(null);
  const [reduction, setReduction] = useState(0);

  useEffect(() => {
    const factor = 1 - (reduction / 100);
    fetch(`http://localhost:8000/api/predict/lstm?factor=${factor}`).then(res => res.json()).then(json => {
      const hist = (json.historico || []).map((d: any) => ({ ...d, valor: d.acidentes, tipo: 'Histórico' }));
      const prev = (json.previsao || []).map((d: any) => ({ ...d, valor: d.predicao, tipo: 'Previsão', min: d.predicao - 5, max: d.predicao + 5 }));
      setData({ chart: [...hist, ...prev], metrics: json.metrics });
    });
  }, [reduction]);

  if (!data) return <div className="p-10 text-center font-bold text-purple-600">Sincronizando Dados 2026...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4"><Brain className="text-purple-600 w-8 h-8" /><div><h4 className="font-bold text-sm">Lógica LSTM</h4><p className="text-[10px] text-gray-500">Rede neural temporal.</p></div></div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4"><Activity className="text-cyan-500 w-8 h-8" /><div><h4 className="font-bold text-sm">Nuvem de Incerteza</h4><p className="text-[10px] text-gray-500">Sombra indica margem de erro.</p></div></div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4"><BookOpen className="text-blue-600 w-8 h-8" /><div><h4 className="font-bold text-sm">Dicionário</h4><p className="text-[10px] text-gray-500">MAE: Erro Médio Absoluto.</p></div></div>
      </div>
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between items-center mb-4"><span className="text-xs font-bold">STATUS: {data.metrics.risk_level}</span><input type="range" min="0" max="50" value={reduction} onChange={(e)=>setReduction(parseInt(e.target.value))} className="accent-purple-600" /></div>
        <div className="h-80"><ResponsiveContainer><ComposedChart data={data.chart}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" hide /><YAxis fontSize={12} /><Tooltip /><Area type="monotone" dataKey="max" baseValue="min" stroke="none" fill="#22d3ee" fillOpacity={0.15} /><Line type="monotone" dataKey="valor" stroke="#8b5cf6" strokeWidth={3} dot={false} data={data.chart.filter((d:any)=>d.tipo==='Histórico')} /><Line type="monotone" dataKey="valor" stroke="#22d3ee" strokeWidth={3} strokeDasharray="5 5" dot={false} data={data.chart.filter((d:any)=>d.tipo==='Previsão')} /></ComposedChart></ResponsiveContainer></div>
      </div>
    </div>
  );
};
export default AIPredictionChart;
