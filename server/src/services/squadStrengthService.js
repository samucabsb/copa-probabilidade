import path from 'path';import { env } from '../config/env.js';import { parseCsvFile } from '../utils/csv.js';
let cache=null;function load(){if(cache)return cache;cache=new Map();for(const r of parseCsvFile(path.resolve(env.squadStrengthCsv))){cache.set(r.teamName,{factor:Number(r.factor)||1,source:'csv',notes:r.notes||''});}return cache;}
export const squadStrengthService={factorForTeam(teamName){return load().get(teamName)||{factor:1,source:'fallback neutro'}}};
