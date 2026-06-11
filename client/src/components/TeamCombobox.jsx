import { ChevronDown, Flag, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { normalizeText } from '../utils/format.js';

export function TeamCombobox({ label, teams, value, onChange, blockedCode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  const selected = teams.find(team => team.name === value);
  const filteredTeams = useMemo(() => {
    return teams
      .filter(team => team.code !== blockedCode)
      .filter(team => {
        if (!query) return true;
        const q = normalizeText(query);
        return normalizeText(team.displayName).includes(q) || normalizeText(team.name).includes(q) || normalizeText(team.code).includes(q);
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR'));
  }, [teams, query, blockedCode]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(team) {
    onChange(team.name);
    setQuery('');
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-900/70">
        <Flag className="h-3.5 w-3.5" /> {label}
      </span>
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        className="flex h-14 w-full items-center justify-between rounded-2xl border border-white/70 bg-white/90 px-4 text-left text-base font-semibold text-slate-950 shadow-sm outline-none ring-emerald-600/20 transition hover:bg-white focus:border-emerald-500 focus:ring-4"
      >
        <span className="truncate">
          {selected ? `${selected.flag} ${selected.displayName} · Grupo ${selected.group} · #${selected.fifaRank}` : 'Selecione uma seleção'}
        </span>
        <ChevronDown className={`ml-3 h-4 w-4 flex-shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[999] mt-2 w-full overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl shadow-slate-950/20">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-3">
            <Search className="h-4 w-4 text-emerald-600" />
            <input
              autoFocus
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Buscar seleção..."
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="rounded-full p-1 hover:bg-slate-100" aria-label="Limpar busca">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-auto p-2">
            {filteredTeams.length === 0 && <div className="px-3 py-4 text-sm font-semibold text-slate-500">Nenhuma seleção encontrada.</div>}
            {filteredTeams.map(team => (
              <button
                key={team.code}
                type="button"
                onClick={() => handleSelect(team)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-emerald-50 ${team.name === value ? 'bg-emerald-100' : ''}`}
              >
                <span className="font-black text-slate-900">{team.flag} {team.displayName}</span>
                <span className="text-xs font-bold text-slate-500">Grupo {team.group} · #{team.fifaRank}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
