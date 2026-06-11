import { Activity, BarChart3, Brain, Gauge, Medal, Trophy } from 'lucide-react';
import { percent } from '../utils/format.js';
import { StatCard } from './StatCard.jsx';
import { TopScores } from './TopScores.jsx';
import { ModelComparison } from './ModelComparison.jsx';
import { RecentMatches } from './RecentMatches.jsx';

const venueLabels = { neutral: 'Campo neutro', home: 'Mandante lado A', away: 'Mandante lado B' };

function strongestOutcome(prediction) {
  return [
    { label: `${prediction.homeTeam.displayName} vence`, value: prediction.outcomes.homeWin },
    { label: 'Empate', value: prediction.outcomes.draw },
    { label: `${prediction.awayTeam.displayName} vence`, value: prediction.outcomes.awayWin }
  ].sort((a, b) => b.value - a.value)[0];
}

function ResultInfo({ title, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{title}</div>
      <div className="mt-1 text-2xl font-black">{value}</div>
    </div>
  );
}

export function PredictionResult({ prediction }) {
  const outcome = strongestOutcome(prediction);

  return (
    <section className="mt-6 space-y-6">
      <div className="rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-200">
              <Trophy className="h-3.5 w-3.5" /> Resultado mais provável
            </div>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              {prediction.homeTeam.flag} {prediction.predictedScore.home}–{prediction.predictedScore.away} {prediction.awayTeam.flag}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {prediction.homeTeam.displayName} x {prediction.awayTeam.displayName} · {venueLabels[prediction.venue] || prediction.venue}
            </p>
          </div>
          <div className="hidden h-24 w-24 place-items-center rounded-full border border-white/10 bg-[radial-gradient(circle,#ffffff_2px,transparent_2px)] bg-[length:12px_12px] md:grid">
            <Medal className="h-10 w-10 text-emerald-300" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <ResultInfo title="Placar exato" value={percent(prediction.predictedScore.probability)} />
          <ResultInfo title="Cenário mais forte" value={outcome.label} />
          <ResultInfo title="Confiança" value={`${prediction.confidence}%`} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Activity} title="Gols esperados" value={`${prediction.expectedGoals.home} x ${prediction.expectedGoals.away}`} hint="lambdas ajustados" tone="blue" />
        <StatCard icon={Gauge} title="Confiança" value={`${prediction.confidence}%`} hint="dados, cache e estabilidade" tone="amber" />
        <StatCard icon={Brain} title="Elo" value={`${prediction.elo.home} x ${prediction.elo.away}`} hint="força relativa" tone="slate" />
        <StatCard icon={BarChart3} title="Vitória / Empate" value={`${percent(prediction.outcomes.homeWin)} / ${percent(prediction.outcomes.draw)}`} hint={`${prediction.homeTeam.displayName} / empate`} tone="emerald" />
        <StatCard icon={BarChart3} title="Vitória lado B" value={percent(prediction.outcomes.awayWin)} hint={prediction.awayTeam.displayName} tone="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <TopScores prediction={prediction} />
        <ModelComparison prediction={prediction} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentMatches title={`Últimos jogos · ${prediction.homeTeam.flag} ${prediction.homeTeam.displayName}`} data={prediction.diagnostics.home} />
        <RecentMatches title={`Últimos jogos · ${prediction.awayTeam.flag} ${prediction.awayTeam.displayName}`} data={prediction.diagnostics.away} />
      </div>
    </section>
  );
}
