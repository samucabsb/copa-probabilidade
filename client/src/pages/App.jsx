import { useState } from 'react';
import { BarChart3, Target } from 'lucide-react';
import { PredictionPage } from './PredictionPage.jsx';
import { ModelQualityPage } from './ModelQualityPage.jsx';
import '../styles.css';

const TABS = [
  { id: 'prediction', label: 'Previsão', icon: Target },
  { id: 'quality', label: 'Qualidade do Modelo', icon: BarChart3 },
];

export function App() {
  const [tab, setTab] = useState('prediction');

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#ecfdf5] text-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(16,185,129,.18),transparent_32%),radial-gradient(circle_at_85%_12%,rgba(14,165,233,.14),transparent_28%),radial-gradient(circle_at_50%_90%,rgba(250,204,21,.10),transparent_35%)]" />

      <div className="relative z-20 mx-auto max-w-7xl px-4 pt-5">
        <nav className="inline-flex gap-1 rounded-2xl border border-white/70 bg-white/90 p-1 shadow-md backdrop-blur">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition ${
                tab === id ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'prediction' ? <PredictionPage /> : <ModelQualityPage />}
    </main>
  );
}
