'use client';

import { useMemo, useState } from 'react';
import { Filter, Calendar, Clock, Cloud, RotateCcw } from 'lucide-react';

export type DashboardFilters = {
  ano?: string;                 // "2024" | "2025" | undefined
  mes?: string;                 // "01".."12" | undefined
  hora_inicio?: string;         // "00".."23" | undefined
  hora_fim?: string;            // "00".."23" | undefined
  condicao_met?: string;        // valor exato vindo do backend | undefined
};

type Props = {
  initial?: DashboardFilters;
  condicoesMeteorologicas?: string[]; // opcional (vamos ligar na API)
  onApply: (filters: DashboardFilters) => void;
  onClear: () => void;
};

const years = ['2024', '2025'];

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

export default function FiltersBar({
  initial,
  condicoesMeteorologicas = [],
  onApply,
  onClear,
}: Props) {
  const [draft, setDraft] = useState<DashboardFilters>(initial ?? {});

  const metOptions = useMemo(() => {
    const base = condicoesMeteorologicas.filter(Boolean);
    return base;
  }, [condicoesMeteorologicas]);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-900 bg-opacity-10">
              <Filter className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Filtros</h3>
              <p className="text-xs text-gray-500">Combine filtros para refinar os dados do dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDraft({});
                onClear();
              }}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200 transition-all inline-flex items-center gap-2"
              type="button"
            >
              <RotateCcw className="w-4 h-4" />
              Limpar
            </button>

            <button
              onClick={() => onApply(draft)}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all"
              type="button"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Ano */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Calendar className="w-4 h-4 text-gray-600" />
            Ano
          </div>
          <select
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
            value={draft.ano ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, ano: e.target.value || undefined }))}
          >
            <option value="">Todos</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Mês */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Calendar className="w-4 h-4 text-gray-600" />
            Mês
          </div>
          <select
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
            value={draft.mes ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, mes: e.target.value || undefined }))}
          >
            <option value="">Todos</option>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Hora (intervalo) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Clock className="w-4 h-4 text-gray-600" />
            Hora (de / até)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={draft.hora_inicio ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, hora_inicio: e.target.value || undefined }))}
            >
              <option value="">De</option>
              {hours.map((h) => <option key={h} value={h}>{h}:00</option>)}
            </select>

            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={draft.hora_fim ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, hora_fim: e.target.value || undefined }))}
            >
              <option value="">Até</option>
              {hours.map((h) => <option key={h} value={h}>{h}:59</option>)}
            </select>
          </div>
        </div>

        {/* Condição meteorológica */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Cloud className="w-4 h-4 text-gray-600" />
            Condição meteorológica
          </div>
          <select
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
            value={draft.condicao_met ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, condicao_met: e.target.value || undefined }))}
          >
            <option value="">Todas</option>
            {metOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            (Vamos preencher esta lista automaticamente pela API)
          </p>
        </div>
      </div>
    </div>
  );
}