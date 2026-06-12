import { CalendarDays } from 'lucide-react';
import { Panel } from './Panel.jsx';

export function RecentMatches({ title, data }) {
  const matches = data?.matches || [];
  return (
    <Panel title={title} badge={`${data.dataQuality} · ${data.matchCount} jogos`}>
      {matches.length === 0 && <p className="text-sm font-semibold text-slate-500">A API não retornou jogos recentes suficientes para esta seleção.</p>}
      {matches.slice(0, 6).map((match, index) => (
        <div key={`${match.date}-${index}`} className="mb-3 flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-3 py-3 text-sm">
          <div><div className="font-black text-slate-800">{match.homeTeam} {match.homeScore}–{match.awayScore} {match.awayTeam}</div><div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"><CalendarDays className="h-3.5 w-3.5" />{match.date || 'sem data'} · {match.competition}</div></div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-black ${match.result === 'W' ? 'bg-emerald-100 text-emerald-700' : match.result === 'D' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{match.result}</span>
        </div>
      ))}
    </Panel>
  );
}
