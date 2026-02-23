'use client';
import { useFilters } from './filters-context';
import { Calendar, Clock, Cloud, MapPin, X } from 'lucide-react';

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
    <div className="flex-1 min-w-[160px] bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-purple-200 transition-all">
      <div className="flex items-center gap-2 mb-1.5 text-gray-400">
        <Icon size={14} className="text-purple-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <select 
        className="w-full text-sm font-semibold bg-transparent outline-none text-gray-700 cursor-pointer appearance-none"
        value={value} 
        onChange={e => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {/* Adicionado o fallback || [] para evitar o erro de map undefined */}
        {(optionsList || []).map((opt: any) => (
          <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="w-full flex flex-wrap items-center gap-4">
      <FilterCard icon={Calendar} label="Ano" value={filters.ano} onChange={(v:any) => update('ano', v)} optionsList={options.anos} placeholder="Todos os Anos" />
      <FilterCard icon={Calendar} label="Mês" value={filters.mes} onChange={(v:any) => update('mes', v)} optionsList={MESES} placeholder="Todos os Meses" />
      <FilterCard icon={Clock} label="Fase do Dia" value={filters.fase_dia} onChange={(v:any) => update('fase_dia', v)} optionsList={options.fases_dia} placeholder="Todas as Fases" />
      <FilterCard icon={MapPin} label="Tipo" value={filters.tipo_acidente} onChange={(v:any) => update('tipo_acidente', v)} optionsList={options.tipos_acidente} placeholder="Todos os Tipos" />
      <FilterCard icon={Cloud} label="Clima" value={filters.condicao_met} onChange={(v:any) => update('condicao_met', v)} optionsList={options.condicoes_meteorologicas} placeholder="Todas as Condições" />
      
      {hasFilters && (
        <button onClick={clear} className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all">
          <X size={16} /> LIMPAR
        </button>
      )}
    </div>
  );
}
