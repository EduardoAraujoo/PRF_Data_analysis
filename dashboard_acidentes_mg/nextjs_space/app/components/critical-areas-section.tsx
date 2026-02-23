'use client';
import { useEffect, useState } from 'react';
import { useFilters } from './filters-context';

export default function CriticalAreasSection() {
  const [data, setData] = useState<any>({ municipios_criticos: { dados: [] }, brs_criticas: { dados: [] } });
  const { queryString } = useFilters();

  useEffect(() => {
    fetch(`http://localhost:8000/api/areas-criticas?${queryString}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(err => console.error("Erro Áreas Críticas:", err));
  }, [queryString]);

  const Table = ({ title, items, keyName }: { title: string; items: any[]; keyName: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-2">Local</th>
            <th className="pb-2 text-right">Acidentes</th>
            <th className="pb-2 text-right">Mortos</th>
            <th className="pb-2 text-right">Índice</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, i: number) => (
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-2 font-medium text-gray-700">{item[keyName]}</td>
              <td className="py-2 text-right text-gray-600">{item.total_acidentes?.toLocaleString('pt-BR')}</td>
              <td className="py-2 text-right text-red-600 font-medium">{item.total_mortos?.toLocaleString('pt-BR')}</td>
              <td className="py-2 text-right">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.indice_gravidade > 2 ? 'bg-red-100 text-red-700' : item.indice_gravidade > 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {item.indice_gravidade?.toFixed(2)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Table title="Municípios Críticos" items={data.municipios_criticos?.dados || []} keyName="municipio" />
      <Table title="BRs Críticas" items={data.brs_criticas?.dados || []} keyName="br" />
    </div>
  );
}
