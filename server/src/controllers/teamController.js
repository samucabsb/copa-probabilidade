import { teamService } from '../services/teamService.js';export const listTeams=(req,res)=>res.json({teams:teamService.listTeams()});
