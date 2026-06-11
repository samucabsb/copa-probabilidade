const VALID_VENUES = new Set(['neutral', 'home', 'away']);

export function validatePredictionRequest(req, res, next) {
  const { homeTeam, awayTeam, venue = 'neutral' } = req.body || {};

  if (!homeTeam || !awayTeam) {
    return res.status(400).json({ error: 'Informe homeTeam e awayTeam.' });
  }

  if (!VALID_VENUES.has(venue)) {
    return res.status(400).json({ error: 'venue deve ser neutral, home ou away.' });
  }

  return next();
}
