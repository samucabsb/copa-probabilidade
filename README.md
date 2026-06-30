# Copa Probabilidade — v1.0.2

Sistema full-stack para previsão probabilística de placares entre seleções. Esta versão entrega uma estrutura mais polida para portfólio/faculdade/entrevista, com frontend modular, backend em camadas, importador de partidas históricas, backtest, relatório visual, testes automatizados e motor estatístico avançado.

> **Aviso honesto:** futebol é probabilístico. O sistema não garante 99% de acerto. Ele melhora a qualidade da previsão usando matemática, dados recentes e validação por backtest.

## O que há na v1.0.2

- Frontend separado em componentes menores.
- Importador de partidas históricas via CSV.
- Arquivo `server/src/data/sample-matches.csv` incluído.
- Otimizador que testa combinações reais de parâmetros com base local.
- Relatório visual de backtest no site.
- Testes automatizados com `node:test`.
- Estrutura para xG real quando o dado existir no CSV/API.
- Estrutura para escalações/convocados via CSV local opcional, com fallback neutro.
- Elo dinâmico.
- Ensemble: Poisson + Dixon-Coles + Elo + forma recente + Monte Carlo.
- Cache curto para jogos recentes.
- Filtro Sub-17/U17/Under-17.
- Botão Voltar para previsão anterior.

## Instalação

```bash
npm run install:all
copy server\.env.example server\.env
npm run dev
```

No Linux/macOS:

```bash
cp server/.env.example server/.env
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3333`

## Variáveis de ambiente

```env
PORT=3333
CLIENT_ORIGIN=http://localhost:5173
THESPORTSDB_KEY=123
CACHE_TTL_HOURS=24
RECENT_EVENTS_CACHE_TTL_MINUTES=30
MONTE_CARLO_SIMULATIONS=50000
MIN_BACKTEST_MATCHES_FOR_OPTIMIZATION=8
HISTORICAL_MATCHES_CSV=src/data/sample-matches.csv
SQUAD_STRENGTH_CSV=src/data/sample-squad-strength.csv
WC2026_REFRESH_MINUTES=60
```

## Scripts

```bash
npm run dev             # roda frontend + backend
npm run check           # valida backend e build frontend
npm run test            # testes automatizados do backend
npm run import:matches  # importa sample-matches.csv para a base local
npm run import:wc2026   # importa/atualiza os resultados reais da Copa 2026 (TheSportsDB)
npm run backtest        # roda backtest com partidas locais
npm run optimize        # testa parâmetros e salva o melhor conjunto
npm run metrics         # exibe métricas salvas
```

## Como funciona

1. Ao subir, o servidor importa automaticamente os resultados reais da Copa do Mundo 2026 já disputados (fase de grupos + mata-mata em andamento) direto da TheSportsDB, e repete essa importação periodicamente (`WC2026_REFRESH_MINUTES`) enquanto o torneio rola.
2. O usuário escolhe duas seleções.
3. O backend também busca o último jogo de cada seleção ao vivo pela TheSportsDB.
4. Jogos Sub-17/U17 são descartados.
5. Jogos válidos são salvos na base local.
6. O motor combina modelos estatísticos, dando mais peso a jogos recentes (decaimento exponencial por data) e a competições de maior peso (Copa do Mundo > qualificatórias > amistosos).
7. O resultado retorna com placar provável, probabilidades, confiança, diagnóstico e a data do último jogo usado de cada seleção (`dataFreshness`).
8. O painel de backtest mostra métricas reais da base local.

## Sobre a qualidade da previsão

O sistema é bom como **previsor probabilístico experimental avançado**. Ele é melhor que um palpite simples porque usa Elo, forma recente, força do adversário, Poisson, Dixon-Coles, Monte Carlo e backtest. Porém, ele só será realmente forte quando a base histórica tiver muitas partidas reais.

Para apresentar:

> “O sistema não tenta cravar resultado. Ele calcula probabilidades com modelos estatísticos e mede o próprio desempenho com backtest.”

## Endpoints

```http
GET  /api/health
GET  /api/teams
POST /api/predictions
GET  /api/model/metrics
POST /api/model/backtest
POST /api/model/optimize
```
