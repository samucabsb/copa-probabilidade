import { ChevronDown, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { norm } from '../utils/format.js';

export function TeamCombobox({ label, teams, value, onChange, blocked }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const selected = teams.find(t => t.name === value);

  const filtered = useMemo(() =>
    teams
      .filter(t => t.code !== blocked)
      .filter(t => !query
        || norm(t.displayName).includes(norm(query))
        || norm(t.name).includes(norm(query))
        || norm(t.code).includes(norm(query))
        || t.aliases.some(a => norm(a).includes(norm(query))))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR')),
  [teams, query, blocked]);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-emerald-900/60">{label}</span>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex h-14 w-full items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-left font-semibold text-slate-900 shadow-sm transition hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
      >
        <span className="truncate text-sm">
          {selected ? `${selected.flag} ${selected.displayName}` : 'Selecione…'}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {selected && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-500">
              Gr.{selected.group} #{selected.fifaRank}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && (
        <div className="absolute z-[999] mt-2 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/15">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nome ou grupo…"
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="max-h-72 overflow-auto p-1.5">
            {filtered.length === 0 && <div className="px-3 py-3 text-xs text-slate-400">Nenhuma seleção encontrada</div>}
            {filtered.map(t => (
              <button
                type="button"
                key={t.code}
                onClick={() => { onChange(t.name); setOpen(false); setQuery(''); }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-emerald-50 ${t.name === value ? 'bg-emerald-100 font-black' : 'font-semibold'}`}
              >
                <span className="flex items-center gap-2">
                  <span>{t.flag}</span>
                  <span>{t.displayName}</span>
                  <span className="rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-400">Gr.{t.group}</span>
                </span>
                <span className="text-xs font-bold text-slate-400">#{t.fifaRank}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
