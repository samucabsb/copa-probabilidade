
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { WORLD_CUP_TEAMS, getTeamByName } from './teams.js';
import { predictMatch } from './predictor.js';
import { cacheEngine } from './cache.js';
import { runBacktest } from './backtest.js';
const app=express(); const PORT=process.env.PORT||3333;
app.use(cors({origin:process.env.CLIENT_ORIGIN||'*'})); app.use(express.json({limit:'1mb'}));
app.get('/api/health',(_,res)=>res.json({ok:true,version:'0.1.4',cache:cacheEngine()}));
app.get('/api/teams',(_,res)=>res.json({teams:WORLD_CUP_TEAMS}));
app.get('/api/backtest',(_,res)=>res.json(runBacktest()));
app.post('/api/predict',async(req,res)=>{try{const {homeTeam:hi,awayTeam:ai,options={}}=req.body||{}; const homeTeam=getTeamByName(hi), awayTeam=getTeamByName(ai); if(!homeTeam||!awayTeam)return res.status(400).json({error:'Seleção inválida.'}); if(homeTeam.code===awayTeam.code)return res.status(400).json({error:'Escolha duas seleções diferentes.'}); res.json(await predictMatch(homeTeam,awayTeam,options,WORLD_CUP_TEAMS));}catch(e){console.error(e); res.status(500).json({error:'Falha na previsão',detail:e.message});}});
app.listen(PORT,()=>console.log(`API v0.1.4 em http://localhost:${PORT} | cache=${cacheEngine()}`));
