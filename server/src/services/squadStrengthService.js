import { ELO_RATINGS } from '../data/eloRatings.js';
import { clamp } from '../utils/math.js';

const WORLD_AVG = 1800;

/**
 * Fator de força de elenco derivado do ELO dinâmico.
 * Não requer CSV. Usa os ratings atualizados pela base histórica.
 *
 * Escala: 0.80 (muito fraco) → 1.00 (médio) → 1.25 (elite)
 * Uma diferença de 400 ELO (~elite vs fraco) representa ±22% nos lambdas.
 */
export const squadStrengthService = {
  /**
   * @param {string} teamName
   * @param {Record<string,number>} [dynamicRatings] — ratings atualizados pelo eloService
   * @returns {{ factor: number, elo: number, source: string }}
   */
  factorForTeam(teamName, dynamicRatings = {}) {
    const elo = dynamicRatings[teamName] ?? ELO_RATINGS[teamName] ?? WORLD_AVG;

    // Mapeamento suave: cada 100 ELO acima/abaixo da média = ±5.5% nos gols
    const raw    = 1 + (elo - WORLD_AVG) / 1800;
    const factor = clamp(raw, 0.80, 1.25);

    return { factor, elo, source: 'elo-derived' };
  },
};
