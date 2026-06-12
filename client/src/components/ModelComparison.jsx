import { percent } from '../utils/format.js';
import { Panel } from './Panel.jsx';

export function ModelComparison({ prediction }) {
  return (
    <Panel title="Comparação de modelos">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Poisson puro</div><div className="mt-2 text-3xl font-black">{prediction.comparison.purePoisson.home}-{prediction.comparison.purePoisson.away}</div><div className="text-sm text-slate-500">{percent(prediction.comparison.purePoisson.probability)}</div></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Avançado</div><div className="mt-2 text-3xl font-black">{prediction.comparison.advanced.home}-{prediction.comparison.advanced.away}</div><div className="text-sm text-emerald-700">{percent(prediction.comparison.advanced.probability)}</div></div>
      </div>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">{prediction.diagnostics.notes.map(note => <li key={note}>{note}</li>)}</ul>
      {prediction.diagnostics.warnings.length > 0 && <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Algumas informações externas não foram encontradas; o modelo usou fallback estatístico.</div>}
    </Panel>
  );
}
