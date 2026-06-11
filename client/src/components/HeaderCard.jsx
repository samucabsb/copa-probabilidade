import { Database, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { TeamCombobox } from './TeamCombobox.jsx';

export function HeaderCard({ teams, homeTeam, awayTeam, venue, onHomeChange, onAwayChange, onVenueChange, onPredict, isLoading, health }) {
  const homeInfo = teams.find(team => team.name === homeTeam);
  const awayInfo = teams.find(team => team.name === awayTeam);

  return (
    <section className="relative z-30 overflow-visible rounded-[2.4rem] border border-white/70 bg-white/100 p-6 shadow-2xl shadow-slate-950/10 backdrop-blur md:p-8">
      <div className="absolute left-0 right-0 top-0 h-2 rounded-t-[2.4rem] bg-gradient-to-r from-emerald-500 via-yellow-300 to-sky-500" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-60 w-60 rounded-full bg-gradient-to-br from-emerald-400/25 to-sky-400/20 blur-sm" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-4xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg">
              <Sparkles className="h-3.5 w-3.5" /> versão final 1.0.0
            </span>
          </div>
          <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-slate-950 md:text-7xl">Previsor de placar da Copa</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            Busque seleções pelo nome em português, escolha o estádio e deixe o sistema calcular automaticamente com cache, Elo, força do adversário, pesos por competição/recência e Dixon-Coles.
          </p>
        </div>

        <div className="grid min-w-[190px] gap-3 rounded-[1.75rem] bg-slate-950 p-4 text-white shadow-2xl">
          <div className="flex items-center gap-3">
            <Database className="h-7 w-7 text-emerald-300" />
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Persistência</div>
              <div className="font-black">{health?.persistence || '...'}</div>
            </div>
          </div>
          <div className="h-px bg-white/10" />
          <div className="text-xs font-semibold text-slate-300">API v{health?.version || '1.0.0'}</div>
        </div>
      </div>

      <div className="relative mt-8 grid gap-4 lg:grid-cols-[1fr_1fr_0.9fr_auto] lg:items-end">
        <TeamCombobox label="Lado A" teams={teams} value={homeTeam} onChange={onHomeChange} blockedCode={awayInfo?.code} />
        <TeamCombobox label="Lado B" teams={teams} value={awayTeam} onChange={onAwayChange} blockedCode={homeInfo?.code} />
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-900/70">
            <ShieldCheck className="h-3.5 w-3.5" /> Estádio
          </span>
          <select
            value={venue}
            onChange={event => onVenueChange(event.target.value)}
            className="h-14 w-full rounded-2xl border border-white/70 bg-white/90 px-4 text-base font-semibold text-slate-950 shadow-sm outline-none ring-emerald-600/20 transition hover:bg-white focus:border-emerald-500 focus:ring-4"
          >
            <option value="neutral">Campo neutro</option>
            <option value="home">Mandante lado A</option>
            <option value="away">Mandante lado B</option>
          </select>
        </label>
        <button
          onClick={onPredict}
          disabled={isLoading || !teams.length}
          className="h-14 rounded-2xl bg-slate-950 px-8 text-base font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Calculando</span> : 'Prever'}
        </button>
      </div>
    </section>
  );
}
