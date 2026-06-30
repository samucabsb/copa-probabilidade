import { ArrowLeft, Database, Globe, Loader2, Sparkles, Zap } from 'lucide-react';
import { TeamCombobox } from './TeamCombobox.jsx';
import { formatDate } from '../utils/format.js';

export function HeaderCard({
  teams, homeTeam, awayTeam, venue,
  onHomeChange, onAwayChange, onVenueChange,
  onPredict, onBackPrediction, canGoBack, isLoading,
  health, dataFreshness,
}) {
  const homeInfo = teams.find(t => t.name === homeTeam);
  const awayInfo = teams.find(t => t.name === awayTeam);
  const freshDate = dataFreshness?.home ? formatDate(dataFreshness.home) : null;

  return (
    <section className="relative z-30 overflow-visible rounded-[2.5rem] border border-white/70 bg-white p-6 shadow-2xl shadow-slate-950/8 md:p-8">
      <div className="absolute left-0 right-0 top-0 h-2 rounded-t-[2.5rem] bg-gradient-to-r from-emerald-500 via-yellow-300 to-sky-500" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow-md">
            <Sparkles className="h-3 w-3" /> v1.1.0
          </span>
          <h1 className="mt-3 text-4xl font-black leading-[0.92] tracking-tight text-slate-950 md:text-6xl">
            Previsor de Placar<br className="hidden md:block" />
            <span className="text-emerald-600"> da Copa 2026</span>
          </h1>
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">
            <Globe className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <p className="text-xs font-bold text-emerald-800">
              {freshDate
                ? `Copa do Mundo 2026 em andamento · dados até ${freshDate} · 48 seleções`
                : 'Dados ao vivo da Copa do Mundo 2026 importados automaticamente · 48 seleções'}
            </p>
          </div>
        </div>

        <div className="flex min-w-[176px] flex-col gap-2.5 rounded-2xl bg-slate-950 p-4 text-white shadow-2xl">
          <div className="flex items-center gap-2.5">
            <Database className="h-6 w-6 shrink-0 text-emerald-300" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Persistência</div>
              <div className="text-sm font-black">{health?.persistence || '…'}</div>
            </div>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 shrink-0 text-yellow-400" />
            <span className="text-xs font-bold text-slate-300">API v{health?.version || '1.1.0'}</span>
          </div>
        </div>
      </div>

      <div className="relative mt-7 grid gap-4 lg:grid-cols-[1fr_1fr_0.85fr_auto_auto] lg:items-end">
        <TeamCombobox label="Lado A" teams={teams} value={homeTeam} onChange={onHomeChange} blocked={awayInfo?.code} />
        <TeamCombobox label="Lado B" teams={teams} value={awayTeam} onChange={onAwayChange} blocked={homeInfo?.code} />
        <label>
          <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-emerald-900/60">Estádio</span>
          <select
            value={venue}
            onChange={e => onVenueChange(e.target.value)}
            className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition hover:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="neutral">Campo neutro</option>
            <option value="home">Mandante — Lado A</option>
            <option value="away">Mandante — Lado B</option>
          </select>
        </label>
        <button
          type="button"
          onClick={onPredict}
          disabled={isLoading || !teams.length}
          className="h-14 rounded-2xl bg-slate-950 px-7 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60"
        >
          {isLoading
            ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Buscando…</span>
            : <span className="inline-flex items-center gap-2"><Globe className="h-3.5 w-3.5" />Prever</span>}
        </button>
        <button
          type="button"
          onClick={onBackPrediction}
          disabled={!canGoBack || isLoading}
          className="h-14 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 disabled:opacity-40"
        >
          <span className="inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" />Voltar</span>
        </button>
      </div>
    </section>
  );
}
