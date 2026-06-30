import { Globe, Trophy, TrendingUp } from 'lucide-react';
import { pct, formatDate } from '../utils/format.js';
import { StatCard } from './StatCard.jsx';
import { TopScores } from './TopScores.jsx';
import { ModelComparison } from './ModelComparison.jsx';
import { RecentMatches } from './RecentMatches.jsx';

function FormDots({ results = [] }) {
  const color = r => (r === 'W' ? 'bg-emerald-500' : r === 'D' ? 'bg-amber-400' : 'bg-rose-400');
  return (
    <div className="flex items-center gap-1">
      {results.slice(0, 5).map((r, i) => (
        <span key={i} title={r === 'W' ? 'Vitória' : r === 'D' ? 'Empate' : 'Derrota'} className={`h-2.5 w-2.5 rounded-full ${color(r)}`} />
      ))}
    </div>
  );
}

function ProbabilityBar({ homeWin, draw, awayWin, homeFlag, awayFlag }) {
  const h = parseFloat(homeWin) || 0, d = parseFloat(draw) || 0, a = parseFloat(awayWin) || 0;
  return (
    <div>
      <div className="mb-2 flex justify-between text-[11px] font-black uppercase tracking-wide text-slate-500">
        <span className="text-emerald-700">{homeFlag} {pct(h)}</span>
        <span className="text-amber-600">Empate {pct(d)}</span>
        <span className="text-sky-700">{awayFlag} {pct(a)}</span>
      </div>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700" style={{ width: `${h}%` }} />
        <div className="bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-700" style={{ width: `${d}%` }} />
        <div className="bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-700" style={{ width: `${a}%` }} />
      </div>
    </div>
  );
}

function ConfidenceGauge({ value }) {
  const v = Math.min(100, Math.max(0, value || 0));
  const color = v >= 70 ? 'text-emerald-600' : v >= 45 ? 'text-amber-500' : 'text-rose-500';
  const ring  = v >= 70 ? 'stroke-emerald-500' : v >= 45 ? 'stroke-amber-400' : 'stroke-rose-400';
  const label = v >= 70 ? 'Alta' : v >= 45 ? 'Média' : 'Baixa';
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
          <circle cx="32" cy="32" r="26" fill="none" strokeWidth="8" className="stroke-slate-100" />
          <circle cx="32" cy="32" r="26" fill="none" strokeWidth="8"
            className={`${ring} transition-all duration-700`}
            strokeDasharray={`${(v / 100) * 163.4} 163.4`} strokeLinecap="round" />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-lg font-black ${color}`}>{v}</div>
      </div>
      <div className="text-center">
        <div className={`text-xs font-black ${color}`}>{label}</div>
        <div className="text-[10px] text-slate-400">Confiança</div>
      </div>
    </div>
  );
}

export function PredictionResult({ prediction: p }) {
  const homeFresh = formatDate(p.dataFreshness?.home);
  const awayFresh = formatDate(p.dataFreshness?.away);

  return (
    <section className="mt-5 animate-fadein space-y-4">
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,.18),transparent_50%),radial-gradient(circle_at_20%_80%,rgba(14,165,233,.14),transparent_45%)]" />
        <div className="relative">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-300">
              <Trophy className="h-3 w-3" /> Previsão v1.1.0
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-slate-300">
              <Globe className="h-3 w-3 text-emerald-400" /> dados ao vivo · TheSportsDB
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 py-2">
            <div className="flex flex-1 flex-col items-end gap-1.5">
              <div className="text-4xl">{p.homeTeam?.flag}</div>
              <div className="text-right text-sm font-black leading-tight text-slate-300">{p.homeTeam?.displayName}</div>
              <div className="text-right text-[10px] text-slate-500">ELO {p.elo?.home} · Gr.{p.homeTeam?.group}{homeFresh ? ` · último jogo ${homeFresh}` : ''}</div>
              <FormDots results={p.form?.home?.last5} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-6xl font-black tracking-tight md:text-7xl">
                {p.predictedScore?.home}<span className="mx-2 text-slate-600">–</span>{p.predictedScore?.away}
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-slate-300">
                {pct(p.predictedScore?.probability)} de chance exato
              </div>
            </div>
            <div className="flex flex-1 flex-col items-start gap-1.5">
              <div className="text-4xl">{p.awayTeam?.flag}</div>
              <div className="text-sm font-black leading-tight text-slate-300">{p.awayTeam?.displayName}</div>
              <div className="text-[10px] text-slate-500">ELO {p.elo?.away} · Gr.{p.awayTeam?.group}{awayFresh ? ` · último jogo ${awayFresh}` : ''}</div>
              <FormDots results={p.form?.away?.last5} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Gols esperados" value={`${p.expectedGoals?.home} x ${p.expectedGoals?.away}`} hint="λ ajustados (Poisson/Dixon-Coles)" />
        <StatCard title="Elo dinâmico" value={`${p.elo?.home} x ${p.elo?.away}`} hint="força relativa, atualizado pela base real" />
        <StatCard title="Base local" value={p.diagnostics?.localBaseMatches ?? '—'} hint="partidas acumuladas no banco" />
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-lg">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
            <TrendingUp className="h-4 w-4 text-emerald-600" />Probabilidade de Resultado
          </h3>
          <ProbabilityBar homeWin={p.outcomes?.homeWin} draw={p.outcomes?.draw} awayWin={p.outcomes?.awayWin} homeFlag={p.homeTeam?.flag} awayFlag={p.awayTeam?.flag} />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-emerald-50 p-3">
              <div className="text-xl font-black text-emerald-700">{pct(p.outcomes?.homeWin)}</div>
              <div className="truncate text-[10px] text-emerald-600">{p.homeTeam?.displayName}</div>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <div className="text-xl font-black text-amber-600">{pct(p.outcomes?.draw)}</div>
              <div className="text-[10px] text-amber-500">Empate</div>
            </div>
            <div className="rounded-xl bg-sky-50 p-3">
              <div className="text-xl font-black text-sky-700">{pct(p.outcomes?.awayWin)}</div>
              <div className="truncate text-[10px] text-sky-600">{p.awayTeam?.displayName}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center rounded-[1.75rem] border border-slate-100 bg-white px-6 py-5 shadow-lg">
          <ConfidenceGauge value={p.confidence} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopScores prediction={p} />
        <ModelComparison prediction={p} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentMatches title={`Últimos jogos · ${p.homeTeam?.displayName}`} data={p.diagnostics?.home} />
        <RecentMatches title={`Últimos jogos · ${p.awayTeam?.displayName}`} data={p.diagnostics?.away} />
      </div>
    </section>
  );
}
