import { percent } from '../utils/format.js';
import { Panel } from './Panel.jsx';

export function TopScores({ prediction }) {
  return (
    <Panel title="Top placares" badge="Dixon-Coles">
      {prediction.topScores.map((score, index) => (
        <div key={`${score.home}-${score.away}-${index}`} className="mb-3 rounded-2xl bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black text-slate-800">
            <span>#{index + 1} · {prediction.homeTeam.displayName} {score.home}–{score.away} {prediction.awayTeam.displayName}</span>
            <span>{percent(score.probability)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-lime-400 to-amber-400" style={{ width: `${Math.min(score.probability * 6, 100)}%` }} /></div>
        </div>
      ))}
    </Panel>
  );
}
