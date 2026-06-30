import { Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useModelMetrics } from '../hooks/useModelMetrics.js';
import { pct } from '../utils/format.js';
import { Panel } from './Panel.jsx';
import { StatCard } from './StatCard.jsx';

function CalibrationRow({ label, bins, accent }) {
  const populated = (bins || []).filter(b => b.count > 0);
  if (!populated.length) return null;
  return (
    <div className="mb-3">
      <div className={`mb-1.5 text-[11px] font-black uppercase tracking-wide ${accent}`}>{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {populated.map(b => (
          <div key={`${b.min}-${b.max}`} title={`Previsto ${Math.round(b.min * 100)}–${Math.round(b.max * 100)}% · ocorreu em ${pct(b.actualRate * 100)} dos ${b.count} jogos`}
            className="rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600">
            {Math.round(b.min * 100)}–{Math.round(b.max * 100)}%: <span className="text-slate-900">{pct(b.actualRate * 100)}</span> <span className="text-slate-400">({b.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BacktestPanel() {
  const { report, params, isLoading, isRunning, error, runNewBacktest } = useModelMetrics();

  return (
    <Panel title="Qualidade do modelo — backtest real" badge="honestidade">
      <div className="mb-4 flex items-start gap-2 rounded-2xl bg-sky-50 p-3 text-xs font-semibold leading-5 text-sky-800">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
        <span>
          Futebol é probabilístico — nenhum modelo matemático crava resultado. Aqui está o desempenho REAL
          medido aplicando o modelo às partidas já conhecidas da base local (acerto de vitória/empate/derrota,
          erro médio das probabilidades e calibração por faixa).
        </span>
      </div>

      <button
        type="button"
        onClick={runNewBacktest}
        disabled={isRunning}
        className="mb-4 inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-50"
      >
        {isRunning
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Rodando backtest…</>
          : <><RefreshCw className="h-4 w-4" /> Rodar novo backtest</>}
      </button>

      {error && <div className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}
      {isLoading && !report && <div className="text-sm font-semibold text-slate-500">Carregando métricas salvas…</div>}

      {report && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <StatCard title="Acurácia 1X2" value={pct(report.accuracy1x2 * 100)} hint={`${report.matches} partidas testadas`} />
            <StatCard title="Erro Brier (médio)" value={report.avgBrier.toFixed(3)} hint="0 = perfeito · 0.33 = aleatório" />
            <StatCard title="Log Loss (médio)" value={report.avgLogLoss.toFixed(3)} hint="quanto menor, melhor calibrado" />
          </div>

          <div className="rounded-2xl bg-white p-1">
            <CalibrationRow label="Calibração — vitória do mandante" bins={report.calibration?.homeWin} accent="text-emerald-700" />
            <CalibrationRow label="Calibração — empate" bins={report.calibration?.draw} accent="text-amber-600" />
            <CalibrationRow label="Calibração — vitória do visitante" bins={report.calibration?.awayWin} accent="text-sky-700" />
          </div>

          {params && (
            <div className="mt-3 text-[11px] text-slate-400">
              Pesos ativos do ensemble: Dixon-Coles {params.dixonWeight} · Poisson {params.poissonWeight} · Elo {params.eloWeight} · Forma {params.formWeight} · Monte Carlo {params.monteCarloWeight}
            </div>
          )}
        </>
      )}

      {!report && !isLoading && (
        <p className="text-sm font-semibold text-slate-500">Nenhum backtest salvo ainda. Clique em "Rodar novo backtest".</p>
      )}
    </Panel>
  );
}
