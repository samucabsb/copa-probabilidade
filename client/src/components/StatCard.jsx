export function StatCard({ icon: Icon, title, value, hint, tone = 'emerald' }) {
  const tones = {
    emerald: 'from-emerald-500/15 to-green-200/20 text-emerald-700',
    blue: 'from-sky-500/15 to-blue-200/20 text-sky-700',
    amber: 'from-amber-500/20 to-yellow-200/20 text-amber-700',
    rose: 'from-rose-500/15 to-red-200/20 text-rose-700',
    slate: 'from-slate-500/10 to-slate-200/20 text-slate-700'
  };

  return (
    <div className="group relative overflow-hidden rounded-[1.65rem] border border-white/70 bg-white/105 p-5 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl">
      <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${tones[tone]} opacity-80`} />
      <div className="relative">
        <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-500">
          <span className={`grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br ${tones[tone]}`}><Icon className="h-4 w-4" /></span>
          {title}
        </div>
        <div className="text-3xl font-black tracking-tight text-slate-950">{value}</div>
        <div className="mt-1 text-xs font-medium text-slate-500">{hint}</div>
      </div>
    </div>
  );
}
