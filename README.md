# Copa Probabilidade — Versão Final 1.0.0

Sistema full-stack para prever probabilisticamente placares entre seleções da Copa, com frontend em React, backend em Express e persistência local com SQLite quando disponível, com fallback em JSON persistente.

> **Aviso técnico**: previsão de placar exato em futebol é naturalmente incerta. O sistema retorna probabilidades e cenários prováveis, não garantias.

---

## Funcionalidades

- Seleções da Copa exibidas em português.
- Busca de seleções com campo digitável e lista em ordem alfabética.
- Previsão automática sem campos manuais de contexto.
- Modelo probabilístico com:
  - média ponderada por recência;
  - peso por tipo de competição;
  - ajuste por força do adversário;
  - Elo rating embarcado;
  - correção Dixon-Coles para placares baixos.
- Busca de jogos recentes via TheSportsDB.
- Cache persistente de respostas da API.
- Histórico persistente das previsões realizadas.
- Tratamento de loading, erro, sucesso e estado vazio.
- Layout responsivo e com dropdown corrigido para não ficar atrás de outros blocos.

---

## Arquitetura

```text
copa-probabilidade-final/
  client/                  # React + Vite
    src/
      api/                 # Cliente HTTP
      components/          # Componentes de UI
      hooks/               # Hooks de dados/estado
      utils/               # Utilitários de frontend
  server/                  # Node.js + Express
    src/
      config/              # Configuração/env
      controllers/         # Controllers HTTP
      data/                # Seeds estáticos: seleções e Elo
      database/            # Adapter, migration e seed
      middleware/          # Erros, async handler e validação
      repositories/        # Persistência
      routes/              # Rotas Express
      services/            # Regras de negócio e integrações
      utils/               # Normalização e matemática
```

---

## Banco de dados

O projeto tenta usar `node:sqlite` automaticamente. Se a versão do Node não tiver esse módulo, o sistema usa um banco JSON persistente em `.cache/database.json`.

Tabelas/coleções:

- `teams`: seleções seedadas.
- `api_cache`: cache de chamadas externas.
- `predictions`: histórico de previsões.

As migrations e o seed rodam automaticamente ao iniciar o backend.

---

## Requisitos

- Node.js 18+ para `fetch` nativo.
- Node.js 22+ recomendado para SQLite nativo via `node:sqlite`.
- npm.

---

## Instalação

```bash
npm run install:all
cp server/.env.example server/.env
```

Arquivo: `server/.env`

```env
PORT=3333
CLIENT_ORIGIN=http://localhost:5173
THESPORTSDB_KEY=123
CACHE_TTL_HOURS=24
```

A chave `123` é a chave pública/free usada pela TheSportsDB v1. Para produção, use uma chave própria.

---

## Execução em desenvolvimento

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3333`

---

## Scripts úteis

```bash
npm run install:all
npm run dev 
npm run check
```

---

## Endpoints principais

### `GET /api/health`

Retorna status da API e engine de persistência.

### `GET /api/teams`

Lista as 48 seleções em português e ordem alfabética.

### `POST /api/predictions`

Gera e salva uma previsão.

Body:

```json
{
  "homeTeam": "Brazil",
  "awayTeam": "Argentina",
  "venue": "neutral"
}
```

`venue` aceita: `neutral`, `home`, `away`.

### `GET /api/predictions/history?limit=8`

Lista as últimas previsões salvas.

---

## Limitações conhecidas

- A fonte gratuita TheSportsDB pode ter cobertura irregular para algumas seleções.
- O sistema não usa escalações, lesões, odds ou xG automaticamente nesta versão.
- O modelo é probabilístico e explicável, mas não substitui modelos profissionais com bases pagas e backtesting histórico completo.

---

## Revisão final aplicada

- Removido backtesting da interface principal.
- Corrigido z-index do dropdown de seleções.
- Corrigida listra colorida do card principal.
- Separação clara entre controllers, services, repositories, routes, hooks e componentes.
- Persistência local de cache, seleções e histórico.
- Validação de entrada no backend e feedback visual no frontend.
