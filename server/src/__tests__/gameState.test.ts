import { GameState } from '../socket/gameEngine/GameState.js';

describe('GameState', () => {
  let state: GameState;

  beforeEach(() => {
    state = new GameState();
  });

  it('should start in lobby status', () => {
    expect(state.get()).toBe('lobby');
  });

  it('should allow lobby -> starting transition', () => {
    state.transition('starting');
    expect(state.get()).toBe('starting');
  });

  it('should allow starting -> active transition', () => {
    state.transition('starting');
    state.transition('active');
    expect(state.get()).toBe('active');
  });

  it('should throw on invalid transition', () => {
    expect(() => state.transition('active')).toThrow();
  });

  it('should force transition without validation', () => {
    state.force('finished');
    expect(state.get()).toBe('finished');
  });

  it('should check if status matches', () => {
    expect(state.is('lobby')).toBe(true);
    expect(state.is('active')).toBe(false);
  });

  it('should check if finished', () => {
    expect(state.isFinished()).toBe(false);
    state.force('finished');
    expect(state.isFinished()).toBe(true);
  });

  it('should allow full game lifecycle', () => {
    state.transition('starting');
    state.transition('active');
    state.force('question_results');
    state.transition('leaderboard');
    state.transition('active');
    state.force('question_results');
    state.transition('leaderboard');
    state.transition('finished');
    expect(state.get()).toBe('finished');
  });
});
