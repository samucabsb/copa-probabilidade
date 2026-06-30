import { BacktestPanel } from '../components/BacktestPanel.jsx';

export function ModelQualityPage() {
  return (
    <div className="relative mx-auto max-w-5xl px-4 py-6 md:py-10">
      <div className="mb-5 rounded-[2rem] border border-white/70 bg-white p-6 shadow-xl md:p-8">
        <h2 className="text-2xl font-black text-slate-950 md:text-3xl">Qualidade do modelo</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Em vez de prometer um resultado "cravado", o sistema mede o próprio desempenho contra partidas
          reais já conhecidas. O backtest abaixo roda o modelo atual sobre a base local (Copa do Mundo 2026
          importada + histórico embutido) e mostra o quão bem calibradas as probabilidades estão de fato.
        </p>
      </div>
      <BacktestPanel />
    </div>
  );
}
