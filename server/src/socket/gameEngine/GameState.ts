import type { GameStatus } from '@quizarena/shared';

const ALLOWED_TRANSITIONS: Record<GameStatus, GameStatus[]> = {
  lobby: ['starting'],
  starting: ['active', 'lobby'],
  active: ['question_results'],
  question_results: ['leaderboard', 'active'],
  leaderboard: ['active', 'finished'],
  finished: [],
};

export class GameState {
  private status: GameStatus = 'lobby';

  get(): GameStatus {
    return this.status;
  }

  canTransition(to: GameStatus): boolean {
    return ALLOWED_TRANSITIONS[this.status].includes(to);
  }

  transition(to: GameStatus): void {
    if (!this.canTransition(to)) {
      throw new Error(`Geçersiz geçiş: ${this.status} -> ${to}`);
    }
    this.status = to;
  }

  force(to: GameStatus): void {
    this.status = to;
  }

  is(status: GameStatus): boolean {
    return this.status === status;
  }

  isFinished(): boolean {
    return this.status === 'finished';
  }
}
