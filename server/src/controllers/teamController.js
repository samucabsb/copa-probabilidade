import { teamService } from '../services/teamService.js';

export function listTeams(req, res) {
  res.json({ teams: teamService.listTeams() });
}
