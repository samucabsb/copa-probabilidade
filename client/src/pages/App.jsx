import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  ArrowLeft, BarChart3, Brain, ChevronDown, Database,
  Globe, Loader2, RefreshCw, Search, Sparkles, Trophy, TrendingUp, Zap
} from 'lucide-react';
import '../styles.css';

const API  = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
const pct  = v => `${Number(v || 0).toFixed(1)}%`;
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

async function req(path, opt = {}) {
  const r = await fetch(API + path, { headers: { 'Content-Type': 'application/json' }, ...opt });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Erro na requisição');
  return d;
}

// ─── Combobox ─────────────────────────────────────────────────────────────────
function TeamCombo({ label, teams, value, onChange, blocked }) {
  const [open, setOpen] = useState(false);
  const [q, setQ]       = useState('');
  const ref             = useRef(null);
  const selected        = teams.find(t => t.name === value);

  const filtered = useMemo(() =>
    teams
      .filter(t => t.code !== blocked)
      .filter(t => !q || norm(t.displayName).includes(norm(q)) || norm(t.name).includes(norm(q)) || norm(t.code).includes(norm(q)) || t.aliases.some(a => norm(a).includes(norm(q))))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR')),
  [teams, q, blocked]);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-emerald-900/60">{label}</span>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex h-14 w-full items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-left font-semibold text-slate-900 shadow-sm transition hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
      >
        <span className="truncate text-sm">
          {selected ? `${selected.flag} ${selected.displayName}` : 'Selecione…'}
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {selected && <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-500">Gr.{selected.group} #{selected.fifaRank}</span>}
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && (
        <div className="absolute z-[999] mt-2 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/15">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
            <Search className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nome ou grupo…"
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400" />
          </div>
          <div className="max-h-72 overflow-auto p-1.5">
            {filtered.length === 0 && <div className="px-3 py-3 text-xs text-slate-400">Nenhuma seleção encontrada</div>}
            {filtered.map(t => (
              <button key={t.code}
                onClick={() => { onChange(t.name); setOpen(false); setQ(''); }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-emerald-50 ${t.name === value ? 'bg-emerald-100 font-black' : 'font-semibold'}`}>
                <span className="flex items-center gap-2">
                  <span>{t.flag}</span>
                  <span>{t.displayName}</span>
                  <span className="rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-400">Gr.{t.group}</span>
                </span>
                <span className="text-xs font-bold text-slate-400">#{t.fifaRank}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Form dots ─────────────────────────────────────────────────────────────────
function FormDots({ results = [] }) {
  const c = r => r === 'W' ? 'bg-emerald-500' : r === 'D' ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="flex items-center gap-1">
      {results.slice(0, 5).map((r, i) => (
        <span key={i} title={r === 'W' ? 'Vitória' : r === 'D' ? 'Empate' : 'Derrota'} className={`h-2.5 w-2.5 rounded-full ${c(r)}`} />
      ))}
    </div>
  );
}

// ─── Barra de probabilidade ───────────────────────────────────────────────────
function ProbabilityBar({ homeWin, draw, awayWin, homeFlag, awayFlag }) {
  const h = parseFloat(homeWin) || 0, d = parseFloat(draw) || 0, a = parseFloat(awayWin) || 0;
  return (
    <div>
      <div className="mb-2 flex justify-between text-[11px] font-black uppercase tracking-wide text-slate-500">
        <span className="text-emerald-700">{homeFlag} {pct(h)}</span>
        <span className="text-amber-600">Empate {pct(d)}</span>
        <span className="text-sky-700">{awayFlag} {pct(a)}</span>
      </div>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700" style={{ width: `${h}%` }} />
        <div className="bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-700" style={{ width: `${d}%` }} />
        <div className="bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-700" style={{ width: `${a}%` }} />
      </div>
    </div>
  );
}

// ─── Gauge circular ──────────────────────────────────────────────────────────
function ConfidenceGauge({ value }) {
  const v = Math.min(100, Math.max(0, value || 0));
  const color = v >= 70 ? 'text-emerald-600' : v >= 45 ? 'text-amber-500' : 'text-rose-500';
  const ring  = v >= 70 ? 'stroke-emerald-500' : v >= 45 ? 'stroke-amber-400' : 'stroke-rose-400';
  const label = v >= 70 ? 'Alta' : v >= 45 ? 'Média' : 'Baixa';
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
          <circle cx="32" cy="32" r="26" fill="none" strokeWidth="8" className="stroke-slate-100" />
          <circle cx="32" cy="32" r="26" fill="none" strokeWidth="8"
            className={`${ring} transition-all duration-700`}
            strokeDasharray={`${(v / 100) * 163.4} 163.4`} strokeLinecap="round" />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-lg font-black ${color}`}>{v}</div>
      </div>
      <div className="text-center">
        <div className={`text-xs font-black ${color}`}>{label}</div>
        <div className="text-[10px] text-slate-400">Confiança</div>
      </div>
    </div>
  );
}

// ─── Top placares ──────────────────────────────────────────────────────────────
function TopScoresCard({ topScores, homeTeam, awayTeam }) {
  const maxP = parseFloat(topScores?.[0]?.probability) || 1;
  return (
    <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-lg">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
        <BarChart3 className="h-4 w-4 text-emerald-600" />Top 10 Placares Mais Prováveis
      </h3>
      <div className="space-y-1.5">
        {(topScores || []).map((s, i) => {
          const bw = (parseFloat(s.probability) / maxP) * 100, top = i === 0;
          return (
            <div key={i} className={`relative overflow-hidden rounded-xl p-2.5 ${top ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-slate-50'}`}>
              <div className={`absolute inset-y-0 left-0 rounded-xl ${top ? 'bg-emerald-100' : 'bg-slate-100'}`} style={{ width: `${bw}%`, opacity: 0.9 }} />
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-5 shrink-0 text-center text-xs font-black ${top ? 'text-emerald-700' : 'text-slate-400'}`}>#{i+1}</span>
                  <span className={`truncate text-sm font-black ${top ? 'text-emerald-900' : 'text-slate-700'}`}>
                    {homeTeam?.flag} {s.home} — {s.away} {awayTeam?.flag}
                  </span>
                  {top && <span className="shrink-0 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">top</span>}
                </div>
                <span className={`shrink-0 text-sm font-black ${top ? 'text-emerald-700' : 'text-slate-500'}`}>{pct(s.probability)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Diagnóstico com fontes de dados ──────────────────────────────────────────
function DiagnosticCard({ diagnostics, homeTeam, awayTeam }) {
  const hMatches = diagnostics?.home?.matchCount ?? 0;
  const aMatches = diagnostics?.away?.matchCount ?? 0;
  const hWarning = diagnostics?.warnings?.find(w => w?.includes(homeTeam?.displayName));
  const aWarning = diagnostics?.warnings?.find(w => w?.includes(awayTeam?.displayName));

  return (
    <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-lg">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
        <Brain className="h-4 w-4 text-sky-600" />Diagnóstico · Fontes de Dados
      </h3>

      {/* Status ao vivo */}
      <div className="mb-3 rounded-xl bg-emerald-50 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-black text-emerald-800">
          <Globe className="h-3.5 w-3.5 text-emerald-600" />
          Dados ao vivo — TheSportsDB
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-lg p-2 text-center ${hWarning ? 'bg-amber-100' : 'bg-emerald-100'}`}>
            <div className="text-base font-black text-emerald-900">{hMatches}</div>
            <div className="text-[10px] text-emerald-700">{homeTeam?.displayName} partidas</div>
            {hWarning && <div className="mt-1 text-[9px] text-amber-700">⚠ sem perfil TheSportsDB</div>}
          </div>
          <div className={`rounded-lg p-2 text-center ${aWarning ? 'bg-amber-100' : 'bg-emerald-100'}`}>
            <div className="text-base font-black text-emerald-900">{aMatches}</div>
            <div className="text-[10px] text-emerald-700">{awayTeam?.displayName} partidas</div>
            {aWarning && <div className="mt-1 text-[9px] text-amber-700">⚠ sem perfil TheSportsDB</div>}
          </div>
        </div>
        <div className="mt-2 text-[10px] text-emerald-700">
          Cache: 30 min · Renovado automaticamente a cada previsão
        </div>
      </div>

      {/* Modelo */}
      <div className="space-y-1.5 text-xs text-slate-600">
        {(diagnostics?.notes || []).map((n, i) => (
          <div key={i} className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
            <span>{n}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 p-2.5 text-center">
          <div className="text-base font-black text-slate-900">{diagnostics?.localBaseMatches ?? '—'}</div>
          <div className="text-[10px] text-slate-500">Partidas acumuladas</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-2.5 text-center">
          <div className="text-base font-black text-slate-900">
            {diagnostics?.monteCarlo?.simulations ? (diagnostics.monteCarlo.simulations / 1000).toFixed(0) + 'k' : '—'}
          </div>
          <div className="text-[10px] text-slate-500">Simulações MC</div>
        </div>
      </div>
    </div>
  );
}

// ─── Resultado ────────────────────────────────────────────────────────────────
function PredictionResult({ p }) {
  return (
    <section className="mt-5 space-y-4 animate-fadein">
      {/* Placar */}
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,.18),transparent_50%),radial-gradient(circle_at_20%_80%,rgba(14,165,233,.14),transparent_45%)]" />
        <div className="relative">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-300">
              <Trophy className="h-3 w-3" /> Previsão v1.0.3
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-slate-300">
              <Globe className="h-3 w-3 text-emerald-400" /> dados ao vivo · TheSportsDB
            </span>
          </div>
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="flex flex-1 flex-col items-end gap-1.5">
              <div className="text-4xl">{p.homeTeam?.flag}</div>
              <div className="text-right text-sm font-black text-slate-300 leading-tight">{p.homeTeam?.displayName}</div>
              <div className="text-right text-[10px] text-slate-500">ELO {p.elo?.home} · Gr.{p.homeTeam?.group}</div>
              <FormDots results={p.form?.home?.last5} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-6xl font-black tracking-tight md:text-7xl">
                {p.predictedScore?.home}<span className="mx-2 text-slate-600">–</span>{p.predictedScore?.away}
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-slate-300">
                {pct(p.predictedScore?.probability)} de chance exato
              </div>
            </div>
            <div className="flex flex-1 flex-col items-start gap-1.5">
              <div className="text-4xl">{p.awayTeam?.flag}</div>
              <div className="text-sm font-black text-slate-300 leading-tight">{p.awayTeam?.displayName}</div>
              <div className="text-[10px] text-slate-500">ELO {p.elo?.away} · Gr.{p.awayTeam?.group}</div>
              <FormDots results={p.form?.away?.last5} />
            </div>
          </div>
          <div className="mt-3 flex justify-center gap-8 text-center">
            <div><div className="text-lg font-black">{p.expectedGoals?.home}</div><div className="text-[10px] text-slate-500">λ {p.homeTeam?.displayName}</div></div>
            <div className="text-slate-700">·</div>
            <div><div className="text-lg font-black">{p.expectedGoals?.away}</div><div className="text-[10px] text-slate-500">λ {p.awayTeam?.displayName}</div></div>
          </div>
        </div>
      </div>

      {/* Probabilidades + gauge */}
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-lg">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
            <TrendingUp className="h-4 w-4 text-emerald-600" />Probabilidade de Resultado
          </h3>
          <ProbabilityBar homeWin={p.outcomes?.homeWin} draw={p.outcomes?.draw} awayWin={p.outcomes?.awayWin} homeFlag={p.homeTeam?.flag} awayFlag={p.awayTeam?.flag} />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-emerald-50 p-3">
              <div className="text-xl font-black text-emerald-700">{pct(p.outcomes?.homeWin)}</div>
              <div className="truncate text-[10px] text-emerald-600">{p.homeTeam?.displayName}</div>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <div className="text-xl font-black text-amber-600">{pct(p.outcomes?.draw)}</div>
              <div className="text-[10px] text-amber-500">Empate</div>
            </div>
            <div className="rounded-xl bg-sky-50 p-3">
              <div className="text-xl font-black text-sky-700">{pct(p.outcomes?.awayWin)}</div>
              <div className="truncate text-[10px] text-sky-600">{p.awayTeam?.displayName}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center rounded-[1.75rem] border border-slate-100 bg-white px-6 py-5 shadow-lg">
          <ConfidenceGauge value={p.confidence} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopScoresCard topScores={p.topScores} homeTeam={p.homeTeam} awayTeam={p.awayTeam} />
        <DiagnosticCard diagnostics={p.diagnostics} homeTeam={p.homeTeam} awayTeam={p.awayTeam} />
      </div>
    </section>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export function App() {
  const [teams,      setTeams]      = useState([]);
  const [health,     setHealth]     = useState(null);
  const [home,       setHome]       = useState('Brazil');
  const [away,       setAway]       = useState('Argentina');
  const [venue,      setVenue]      = useState('neutral');
  const [prediction, setPrediction] = useState(null);
  const [stack,      setStack]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  useEffect(() => {
    req('/teams').then(d => setTeams((d.teams || []).sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR')))).catch(e => setError(e.message));
    req('/health').then(setHealth).catch(() => {});
  }, []);

  async function predict() {
    setLoading(true); setError(''); setSuccess('');
    try {
      const d = await req('/predictions', { method: 'POST', body: JSON.stringify({ homeTeam: home, awayTeam: away, venue }) });
      setStack(s => prediction ? [prediction, ...s].slice(0, 10) : s);
      setPrediction(d.result);
      setSuccess('✓ Dados buscados ao vivo — previsão gerada.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function goBack() {
    setStack(s => {
      if (!s.length) return s;
      const [last, ...rest] = s;
      setPrediction(last);
      setSuccess('Previsão anterior restaurada.');
      setTimeout(() => setSuccess(''), 2500);
      return rest;
    });
  }

  const homeInfo = teams.find(t => t.name === home);
  const awayInfo = teams.find(t => t.name === away);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#ecfdf5] text-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(16,185,129,.18),transparent_32%),radial-gradient(circle_at_85%_12%,rgba(14,165,233,.14),transparent_28%),radial-gradient(circle_at_50%_90%,rgba(250,204,21,.10),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 md:py-10">

        <section className="relative z-30 overflow-visible rounded-[2.5rem] border border-white/70 bg-white p-6 shadow-2xl shadow-slate-950/8 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow-md">
                <Sparkles className="h-3 w-3" /> v1.0.3
              </span>
              <h1 className="mt-3 text-4xl font-black leading-[0.92] tracking-tight text-slate-950 md:text-6xl">
                Previsor de Placar<br className="hidden md:block" />
                <span className="text-emerald-600"> da Copa 2026</span>
              </h1>
              {/* Banner explicando que dados são ao vivo */}
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">
                <Globe className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <p className="text-xs font-bold text-emerald-800">
                  Dados ao vivo buscados da internet automaticamente a cada previsão · Cache 30 min · 48 seleções
                </p>
              </div>
            </div>

            <div className="flex min-w-[176px] flex-col gap-2.5 rounded-2xl bg-slate-950 p-4 text-white shadow-2xl">
              <div className="flex items-center gap-2.5">
                <Database className="h-6 w-6 text-emerald-300 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Persistência</div>
                  <div className="text-sm font-black">{health?.persistence || '…'}</div>
                </div>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400 shrink-0" />
                <span className="text-xs font-bold text-slate-300">API v{health?.version || '1.0.3'}</span>
              </div>
            </div>
          </div>

          <div className="relative mt-7 grid gap-4 lg:grid-cols-[1fr_1fr_0.85fr_auto_auto] lg:items-end">
            <TeamCombo label="Lado A" teams={teams} value={home} onChange={setHome} blocked={awayInfo?.code} />
            <TeamCombo label="Lado B" teams={teams} value={away} onChange={setAway} blocked={homeInfo?.code} />
            <label>
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-emerald-900/60">Estádio</span>
              <select value={venue} onChange={e => setVenue(e.target.value)}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition hover:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30">
                <option value="neutral">Campo neutro</option>
                <option value="home">Mandante — Lado A</option>
                <option value="away">Mandante — Lado B</option>
              </select>
            </label>
            <button onClick={predict} disabled={loading || !teams.length}
              className="h-14 rounded-2xl bg-slate-950 px-7 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60">
              {loading
                ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Buscando…</span>
                : <span className="inline-flex items-center gap-2"><Globe className="h-3.5 w-3.5" />Prever</span>}
            </button>
            <button onClick={goBack} disabled={!stack.length || loading}
              className="h-14 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 disabled:opacity-40">
              <span className="inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" />Voltar</span>
            </button>
          </div>
        </section>

        {error   && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}
        {success && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{success}</div>}

        {!prediction && !loading && (
          <div className="mt-6 rounded-[2rem] border border-white/70 bg-white/80 px-6 py-8 text-center shadow-lg">
            <div className="text-4xl">🌐</div>
            <div className="mt-3 text-sm font-semibold text-slate-600">
              Escolha duas das <strong className="text-slate-900">48 seleções</strong> da Copa 2026 e clique em <strong className="text-slate-900">Prever</strong>.
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Os jogos mais recentes de cada seleção são buscados automaticamente da internet via TheSportsDB.
            </div>
          </div>
        )}

        {prediction && <PredictionResult p={prediction} />}
      </div>
    </main>
  );
}
