'use client';
import { useEffect, useState } from 'react';
import { useFilters } from './filters-context';

const CriticalAreas = () => {
  const [causas, setCausas] = useState([]);
  const [areas, setAreas] = useState([]);
  const { queryString } = useFilters();

  useEffect(() => {
    fetch(`http://localhost:8000/api/causas?${queryString}`).then(r => r.json()).then(d => setCausas(d.causas || []));
    fetch(`http://localhost:8000/api/areas-criticas?${queryString}`).then(r => r.json()).then(d => setAreas(d.areas_criticas || []));
  }, [queryString]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Top Causas de Acidentes</h3>
        <div className="space-y-2">
          {causas.map((c: any, i) => (
            <div key={i} className="flex justify-between items-center p-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600">{c.causa}</span>
              <span className="text-sm font-bold text-red-500">{c.total}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Municípios Críticos (BR + Cidade)</h3>
        <div className="space-y-2">
          {areas.map((a: any, i) => (
            <div key={i} className="flex justify-between items-center p-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600">BR {a.br} - {a.municipio}</span>
              <span className="text-sm font-bold text-violet-600">{a.total_acidentes} acidentes</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CriticalAreas;
