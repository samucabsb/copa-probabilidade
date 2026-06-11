import { Clock3, Loader2 } from 'lucide-react';
import { formatDateTime, percent } from '../utils/format.js';
import { Panel } from './Panel.jsx';

export function HistoryPanel({ history, isLoading, error }) {
  return (
    <Panel title="Histórico de previsões" badge="persistente">
      {isLoading && <div className="flex items-center gap-2 text-sm font-bold text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Carregando histórico...</div>}
      {error && <div className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}
      {!isLoading && !error && history.length === 0 && <p className="text-sm font-semibold text-slate-500">Nenhuma previsão salva ainda.</p>}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {history.map(item => {
          const prediction = item.result;
          return (
            <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-1 text-xs font-bold text-slate-500"><Clock3 className="h-3.5 w-3.5" /> {formatDateTime(item.createdAt)}</div>
              <div className="text-lg font-black text-slate-950">
                {prediction.homeTeam.flag} {prediction.homeTeam.displayName} {prediction.predictedScore.home}–{prediction.predictedScore.away} {prediction.awayTeam.displayName} {prediction.awayTeam.flag}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-500">Placar exato: {percent(prediction.predictedScore.probability)}</div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
