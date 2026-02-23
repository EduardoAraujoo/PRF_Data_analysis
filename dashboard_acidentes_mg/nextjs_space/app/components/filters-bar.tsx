'use client';
import { useFilters } from './filters-context';
import { Calendar, Clock, Cloud, MapPin, Filter, X } from 'lucide-react';

const MESES = [
  { value: '1', label: 'Jan' }, { value: '2', label: 'Fev' }, { value: '3', label: 'Mar' },
  { value: '4', label: 'Abr' }, { value: '5', label: 'Mai' }, { value: '6', label: 'Jun' },
  { value: '7', label: 'Jul' }, { value: '8', label: 'Ago' }, { value: '9', label: 'Set' },
  { value: '10', label: 'Out' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dez' }
];

export default function FiltersBar() {
  const { filters, setFilters, options } = useFilters();
  const update = (key: string, value: string) => setFilters({ ...filters, [key]: value });
  const clear = () => setFilters({ ano: '', mes: '', condicao_met: '', tipo_acidente: '', fase_dia: '' });
  const hasFilters = Object.values(filters).some(v => v !== '');

  const FilterCard = ({ icon: Icon, label, value, onChange, optionsList, placeholder }: any) => (
    <div className="flex flex-col min-w-[140px] bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-1 text-gray-400">
        <Icon size={14} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <select 
        className="text-sm font-medium bg-transparent outline-none text-gray-700 cursor-pointer"
        value={value} 
        onChange={e => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {optionsList.map((opt: any) => (
          <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <FilterCard icon={Calendar} label="Ano" value={filters.ano} onChange={(v:any) => update('ano', v)} optionsList={options.anos} placeholder="Todos" />
      <FilterCard icon={Calendar} label="Mês" value={filters.mes} onChange={(v:any) => update('mes', v)} optionsList={MESES} placeholder="Todos" />
      <FilterCard icon={Clock} label="Fase do Dia" value={filters.fase_dia} onChange={(v:any) => update('fase_dia', v)} optionsList={options.fases_dia} placeholder="Todas" />
      <FilterCard icon={MapPin} label="Tipo" value={filters.tipo_acidente} onChange={(v:any) => update('tipo_acidente', v)} optionsList={options.tipos_acidente} placeholder="Todos" />
      <FilterCard icon={Cloud} label="Clima" value={filters.condicao_met} onChange={(v:any) => update('condicao_met', v)} optionsList={options.condicoes_meteorologicas} placeholder="Todos" />
      
      {hasFilters && (
        <button onClick={clear} className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <X size={14} /> LIMPAR
        </button>
      )}
    </div>
  );
}
