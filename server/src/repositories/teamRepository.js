import { database } from '../database/databaseAdapter.js';
import { normalize } from '../utils/normalize.js';

export class TeamRepository {
  listAll() {
    return database.getTeams();
  }

  findByAnyName(input) {
    const normalized = normalize(input);
    return this.listAll().find(team =>
      normalize(team.name) === normalized ||
      normalize(team.displayName) === normalized ||
      normalize(team.code) === normalized ||
      team.aliases.some(alias => normalize(alias) === normalized)
    );
  }
}

export const teamRepository = new TeamRepository();
