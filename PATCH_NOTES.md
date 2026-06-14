# Copa Probabilidade — v1.0.3 Patch Notes

## Arquivos alterados (substitua um a um no seu projeto)

```
server/src/data/eloRatings.js           ← SUBSTITUIR  (ratings atualizados, 40+ seleções)
server/src/data/historicalMatches.js    ← NOVO        (90+ partidas embutidas, zero CSV)
server/src/server.js                    ← SUBSTITUIR  (auto-import na inicialização)
server/src/services/monteCarloService.js  ← SUBSTITUIR  (seed aleatório, bug crítico corrigido)
server/src/services/optimizerService.js   ← SUBSTITUIR  (backtest real, não mais fake)
server/src/services/predictionModelService.js ← SUBSTITUIR (altitude, squad ELO, form corrigido)
server/src/services/squadStrengthService.js   ← SUBSTITUIR (derivado do ELO, sem CSV)
server/src/services/contextService.js    ← SUBSTITUIR  (altitude Bolívia, Equador, etc.)
client/src/pages/App.jsx                ← SUBSTITUIR  (UI completamente redesenhada)
client/src/styles.css                   ← SUBSTITUIR  (animações: fadein, gauge, barras)
```

## Como usar depois de substituir

```bash
# Instalar deps (se ainda não instalou)
npm install          # na raiz
cd server && npm install
cd ../client && npm install

# Rodar
npm run dev          # ou o que você já usa

# Pronto. As 90+ partidas históricas carregam automaticamente.
# Nenhum CSV, nenhum "npm run import:matches" necessário.
```

## Bugs corrigidos nesta versão

| # | Bug | Impacto |
|---|-----|---------|
| 1 | Monte Carlo com seed fixo `rng(123)` | Todas as simulações eram idênticas entre chamadas |
| 2 | Otimizador escolhia candidato do meio sem testar nada | Parâmetros eram randomicamente ruins |
| 3 | Squad strength sempre `1.0` (CSV vazio) | Força do elenco não era considerada |
| 4 | Context service retornava `{homeFactor:1, awayFactor:1}` | Altitude ignorada completamente |
| 5 | `formOut` não normalizado (somava > 1) | Probabilidades de resultado distorcidas |
| 6 | Base histórica com 16 partidas apenas | Modelo mal calibrado por falta de dados |

## O que há de novo

- **90+ partidas embutidas**: Copa do Mundo 2022 (64 jogos), Euro 2024 (35 jogos), Copa América 2024 (11 jogos)
- **Auto-import no startup**: `server.js` chama `upsertMany()` automaticamente, sem intervenção do usuário
- **Squad strength via ELO**: Não precisa de CSV. Derivado dinamicamente dos ratings
- **Ajuste de altitude real**: Bolívia (+18%), Equador (+10%), Colômbia (+6%), Peru (+9%)
- **Seed aleatório no Monte Carlo**: Cada previsão usa entropia real (`Date.now() ^ Math.random()`)
- **Otimizador com backtest real**: Split 80/20 temporal, grid search, métrica de acerto V/E/D
- **UI completamente redesenhada**:
  - Barras de probabilidade animadas (verde/amarelo/azul)
  - Gauge circular de confiança (com cor dinâmica por faixa)
  - Indicadores de forma W/D/L (bolinhas coloridas)
  - Top 10 placares com barra visual de probabilidade
  - Layout mais limpo e legível
  - Badge de altitude quando aplicável
  - Versão `v1.0.3 ensemble` no header
