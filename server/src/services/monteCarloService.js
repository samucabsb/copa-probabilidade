import { poisson } from '../utils/math.js';

/** CDF da distribuição de Poisson até goal=10 */
function buildCdf(lambda) {
  let total = 0;
  const table = [];
  for (let g = 0; g <= 10; g++) {
    total += poisson(g, lambda);
    table.push({ g, c: total });
  }
  // Garante que o último bucket captura 100%
  table[table.length - 1].c = 1;
  return table;
}

/**
 * PRNG rápido (Mulberry32) com seed VARIÁVEL.
 * CORREÇÃO v1.0.3: antes usava seed fixo (123), tornando cada simulação idêntica.
 * Agora usa timestamp + Math.random() para seed genuinamente único por chamada.
 */
function createRng() {
  // Combina timestamp com Math.random() para máxima entropia
  const seed = (Date.now() ^ (Math.random() * 0xFFFF_FFFF | 0)) >>> 0;
  let s = seed;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function sampleGoals(cdf, rand) {
  const r = rand();
  return cdf.find(x => r <= x.c)?.g ?? 10;
}

export const monteCarloService = {
  simulate({ lambdaHome, lambdaAway, simulations = 50_000 }) {
    const rand = createRng();
    const homeCdf = buildCdf(lambdaHome);
    const awayCdf = buildCdf(lambdaAway);

    let homeWins = 0, draws = 0, awayWins = 0;

    for (let i = 0; i < simulations; i++) {
      const hg = sampleGoals(homeCdf, rand);
      const ag = sampleGoals(awayCdf, rand);
      if (hg > ag)      homeWins++;
      else if (hg === ag) draws++;
      else               awayWins++;
    }

    return {
      simulations,
      outcomes: {
        homeWin: homeWins / simulations,
        draw:    draws    / simulations,
        awayWin: awayWins / simulations,
      },
    };
  },
};
