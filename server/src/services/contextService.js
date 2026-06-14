/**
 * Ajustes contextuais reais — v1.0.3
 *
 * Altitude é o maior fator externo não capturado por ELO/forma.
 * Estudos da FIFA mostram que jogos acima de 2500m reduzem a
 * performance do time visitante em ~8–18% nos gols marcados.
 */

/** Altitude dos principais estádios (metros) */
const HIGH_ALTITUDE_TEAMS = {
  'Bolivia':   3_640,  // Estadio Hernando Siles, La Paz
  'Ecuador':   2_850,  // Estadio Olímpico Atahualpa, Quito
  'Colombia':  2_600,  // Estadio El Campín, Bogotá
  'Peru':      3_476,  // Estadio Monumental de Lima / Cusco FC
};

/** Penalidade ao time visitante por cada metro de altitude (linear) */
const ALTITUDE_PENALTY_PER_METER = 0.000_04; // ~4% por 1000m acima de 2000m

/**
 * Calcula ajustes de contexto para a partida.
 *
 * @param {{ homeTeam: {name:string}, awayTeam: {name:string}, venue: string }} ctx
 * @returns {{ homeFactor: number, awayFactor: number, altitudeEffect: boolean, notes: string[] }}
 */
export const contextService = {
  contextAdjustment({ homeTeam, awayTeam, venue } = {}) {
    let homeFactor = 1.0;
    let awayFactor = 1.0;
    const notes    = [];

    // Só aplica altitude quando há mandante real
    if (venue === 'home' && homeTeam?.name) {
      const altMeters = HIGH_ALTITUDE_TEAMS[homeTeam.name];
      if (altMeters) {
        // Boost ao time da casa por altitude; penalidade ao visitante
        const effect = clamp((altMeters - 2_000) * ALTITUDE_PENALTY_PER_METER, 0, 0.18);
        homeFactor  += effect * 0.4;  // casa beneficia menos (já adaptada)
        awayFactor  -= effect;         // visitante sofre mais
        notes.push(`Altitude (${altMeters}m): vantagem de ${(effect * 100).toFixed(0)}% para ${homeTeam.name}`);
      }
    }

    return {
      homeFactor:     clamp(homeFactor, 0.85, 1.18),
      awayFactor:     clamp(awayFactor, 0.75, 1.0),
      altitudeEffect: notes.length > 0,
      notes,
    };
  },
};

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
