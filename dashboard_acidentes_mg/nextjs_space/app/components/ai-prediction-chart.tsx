'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Brain } from 'lucide-react';

const AIPredictionChart = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/predict/lstm')
      .then(res => res.json())
      .then(json => {
        const hist = json.historico.map((d: any) => ({ ...d, valor: d.acidentes, tipo: 'Histórico' }));
        const pred = json.previsao_30_dias.map((d: any) => ({ ...d, valor: d.predicao, tipo: 'Previsão' }));
        setData({ 
          chart: [...hist, ...pred], 
          metrics: { mae: json.mae, rmse: json.rmse } 
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar IA:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="h-96 flex items-center justify-center bg-white rounded-xl border border-dashed border-gray-300">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Processando Redes Neurais (LSTM)...</p>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div id="ia" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6 scroll-mt-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Previsão com Deep Learning</h3>
            <p className="text-sm text-gray-500">Tendência de acidentes para os próximos 30 dias</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase font-bold">MAE</p>
            <p className="text-lg font-mono text-purple-600">{data.metrics.mae}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase font-bold">RMSE</p>
            <p className="text-lg font-mono text-blue-600">{data.metrics.rmse}</p>
          </div>
        </div>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.chart}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="date" hide />
            <YAxis fontSize={12} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
            <Legend verticalAlign="top" align="right" iconType="circle" />
            <Line name="Histórico Real" type="monotone" dataKey="valor" stroke="#8b5cf6" strokeWidth={3} dot={false} 
                  data={data.chart.filter((d: any) => d.tipo === 'Histórico')} />
            <Line name="Previsão IA" type="monotone" dataKey="valor" stroke="#22d3ee" strokeWidth={3} strokeDasharray="5 5" 
                  dot={{ r: 4, fill: '#22d3ee' }} data={data.chart.filter((d: any) => d.tipo === 'Previsão')} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AIPredictionChart;
