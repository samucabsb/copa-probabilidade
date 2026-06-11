export function Panel({ title, badge, children }) {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/105 p-5 shadow-xl backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-black text-slate-950">{title}</h3>
        {badge && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{badge}</span>}
      </div>
      {children}
    </div>
  );
}
