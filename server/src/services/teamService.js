import { teamRepository } from '../repositories/teamRepository.js';

export class TeamService {
  listTeams() {
    return teamRepository.listAll();
  }

  getTeamOrThrow(value, label) {
    const team = teamRepository.findByAnyName(value);
    if (!team) {
      const error = new Error(`${label} inválida. Escolha uma das seleções disponíveis.`);
      error.statusCode = 400;
      throw error;
    }
    return team;
  }
}

export const teamService = new TeamService();
