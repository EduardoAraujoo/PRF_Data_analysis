'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Filters { ano: string; mes: string; condicao_met: string; tipo_acidente: string; fase_dia: string; }
interface Options { anos: string[]; condicoes_meteorologicas: string[]; tipos_acidente: string[]; fases_dia: string[]; }
interface FiltersContextType { filters: Filters; setFilters: (f: Filters) => void; queryString: string; options: Options; }

const defaultFilters: Filters = { ano: '', mes: '', condicao_met: '', tipo_acidente: '', fase_dia: '' };
const initialOptions: Options = { anos: [], condicoes_meteorologicas: [], tipos_acidente: [], fases_dia: [] };

const FiltersContext = createContext<FiltersContextType>({ 
  filters: defaultFilters, setFilters: () => {}, queryString: '', options: initialOptions 
});

export const useFilters = () => useContext(FiltersContext);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [options, setOptions] = useState<Options>(initialOptions);

  useEffect(() => {
    fetch('http://localhost:8000/api/options')
      .then(r => r.json())
      .then(data => {
        // Só atualiza se o objeto contiver as chaves esperadas (evita erros de 404/500)
        if (data && data.anos) setOptions(data);
      })
      .catch(err => console.error("Erro ao carregar opções:", err));
  }, []);

  const queryString = Object.entries(filters)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

  return <FiltersContext.Provider value={{ filters, setFilters, queryString, options }}>{children}</FiltersContext.Provider>;
}
