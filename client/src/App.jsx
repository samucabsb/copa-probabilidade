import { useState } from 'react';
import { HeaderCard } from './components/HeaderCard.jsx';
import { FeedbackMessage } from './components/FeedbackMessage.jsx';
import { PredictionResult } from './components/PredictionResult.jsx';
import { HistoryPanel } from './components/HistoryPanel.jsx';
import { useHealth } from './hooks/useHealth.js';
import { usePrediction } from './hooks/usePrediction.js';
import { usePredictionHistory } from './hooks/usePredictionHistory.js';
import { useTeams } from './hooks/useTeams.js';
import React from 'react';

export function App() {
  const { teams, isLoading: teamsLoading, error: teamsError } = useTeams();
  const { prediction, isLoading: predictionLoading, error: predictionError, successMessage, predict, setSuccessMessage } = usePrediction();
  const historyState = usePredictionHistory();
  const health = useHealth();

  const [homeTeam, setHomeTeam] = useState('Brazil');
  const [awayTeam, setAwayTeam] = useState('Argentina');
  const [venue, setVenue] = useState('neutral');

  async function handlePredict() {
    const savedPrediction = await predict({ homeTeam, awayTeam, venue });
    if (savedPrediction) historyState.refresh();
    window.setTimeout(() => setSuccessMessage(''), 3500);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#ecfdf5] text-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(16,185,129,.24),transparent_32%),radial-gradient(circle_at_85%_12%,rgba(14,165,233,.20),transparent_28%),radial-gradient(circle_at_50%_90%,rgba(250,204,21,.18),transparent_35%)]" />
      <div className="pointer-events-none fixed left-[-6rem] top-40 h-72 w-72 rounded-full border-[32px] border-white/35" />
      <div className="pointer-events-none fixed right-[-5rem] top-24 h-56 w-56 rounded-full border-[26px] border-emerald-300/25" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 md:py-8">
        <HeaderCard
          teams={teams}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          venue={venue}
          onHomeChange={setHomeTeam}
          onAwayChange={setAwayTeam}
          onVenueChange={setVenue}
          onPredict={handlePredict}
          isLoading={predictionLoading || teamsLoading}
          health={health}
        />

        <div className="relative z-10 mt-4 space-y-3">
          <FeedbackMessage type="error">{teamsError || predictionError}</FeedbackMessage>
          <FeedbackMessage type="success">{successMessage}</FeedbackMessage>
        </div>

        {prediction && <PredictionResult prediction={prediction} />}

        <div className="relative z-0 mt-6">
          <HistoryPanel history={historyState.history} isLoading={historyState.isLoading} error={historyState.error} />
        </div>
      </div>
    </main>
  );
}
