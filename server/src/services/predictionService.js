import { randomUUID } from 'crypto';
import { predictionRepository } from '../repositories/predictionRepository.js';
import { sportsDbService } from './sportsDbService.js';
import { teamService } from './teamService.js';
import { predictionModelService } from './predictionModelService.js';

const VALID_VENUES = new Set(['neutral', 'home', 'away']);

export class PredictionService {
  async createPrediction({ homeTeam: homeInput, awayTeam: awayInput, venue = 'neutral' }) {
    if (!VALID_VENUES.has(venue)) {
      const error = new Error('Tipo de estádio inválido. Use neutral, home ou away.');
      error.statusCode = 400;
      throw error;
    }

    const homeTeam = teamService.getTeamOrThrow(homeInput, 'Seleção do lado A');
    const awayTeam = teamService.getTeamOrThrow(awayInput, 'Seleção do lado B');

    if (homeTeam.code === awayTeam.code) {
      const error = new Error('Escolha duas seleções diferentes.');
      error.statusCode = 400;
      throw error;
    }

    const [homeData, awayData] = await Promise.all([
      sportsDbService.fetchRecentEvents(homeTeam),
      sportsDbService.fetchRecentEvents(awayTeam)
    ]);

    const result = predictionModelService.calculate({
      homeTeam,
      awayTeam,
      homeEvents: homeData.events,
      awayEvents: awayData.events,
      venue,
      teams: teamService.listTeams(),
      warnings: [homeData.warning, awayData.warning]
    });

    const prediction = {
      id: randomUUID(),
      homeTeamCode: homeTeam.code,
      awayTeamCode: awayTeam.code,
      venue,
      result,
      createdAt: Date.now()
    };

    predictionRepository.save(prediction);
    return prediction;
  }

  listRecentPredictions(limit) {
    return predictionRepository.listRecent(limit).map(prediction => ({
      id: prediction.id,
      createdAt: prediction.createdAt,
      result: prediction.result
    }));
  }
}

export const predictionService = new PredictionService();
