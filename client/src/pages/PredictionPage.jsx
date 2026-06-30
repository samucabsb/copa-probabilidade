import { useState } from 'react';
import { HeaderCard } from '../components/HeaderCard.jsx';
import { FeedbackMessage } from '../components/FeedbackMessage.jsx';
import { PredictionResult } from '../components/PredictionResult.jsx';
import { HistoryPanel } from '../components/HistoryPanel.jsx';
import { useHealth } from '../hooks/useHealth.js';
import { usePrediction } from '../hooks/usePrediction.js';
import { useTeams } from '../hooks/useTeams.js';

export function PredictionPage() {
  const { teams, isLoading: teamsLoading, error: teamsError } = useTeams();
  const {
    prediction, previousPredictions, isLoading: predictionLoading, error: predictionError,
    successMessage, canGoBack, predict, goBackPrediction, setSuccessMessage,
  } = usePrediction();
  const health = useHealth();
  const [homeTeam, setHomeTeam] = useState('Brazil');
  const [awayTeam, setAwayTeam] = useState('Argentina');
  const [venue, setVenue] = useState('neutral');

  async function handlePredict() {
    await predict({ homeTeam, awayTeam, venue });
    window.setTimeout(() => setSuccessMessage(''), 3500);
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-6 md:py-10">
      <HeaderCard
        teams={teams}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        venue={venue}
        onHomeChange={setHomeTeam}
        onAwayChange={setAwayTeam}
        onVenueChange={setVenue}
        onPredict={handlePredict}
        onBackPrediction={goBackPrediction}
        canGoBack={canGoBack}
        isLoading={predictionLoading || teamsLoading}
        health={health}
        dataFreshness={prediction?.dataFreshness}
      />

      <div className="relative z-10 mt-4 space-y-3">
        <FeedbackMessage type="error">{teamsError || predictionError}</FeedbackMessage>
        <FeedbackMessage type="success">{successMessage}</FeedbackMessage>
      </div>

      {!prediction && !predictionLoading && !teamsError && (
        <div className="relative z-0 mt-6 rounded-[2rem] border border-white/70 bg-white/80 px-6 py-8 text-center shadow-lg">
          <div className="text-4xl">🌐</div>
          <div className="mt-3 text-sm font-semibold text-slate-600">
            Escolha duas das <strong className="text-slate-900">48 seleções</strong> da Copa 2026 e clique em <strong className="text-slate-900">Prever</strong>.
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Os resultados reais da Copa do Mundo 2026 já disputados são importados automaticamente, e o último jogo de cada seleção é buscado ao vivo via TheSportsDB.
          </div>
        </div>
      )}

      {prediction && <PredictionResult prediction={prediction} />}

      {previousPredictions.length > 0 && (
        <div className="mt-4">
          <HistoryPanel history={previousPredictions} />
        </div>
      )}
    </div>
  );
}
