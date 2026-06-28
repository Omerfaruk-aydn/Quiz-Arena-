import { calculatePoints } from '../socket/gameEngine/ScoreCalculator.js';

describe('ScoreCalculator', () => {
  it('should return 0 for incorrect answer', () => {
    expect(
      calculatePoints({
        isCorrect: false,
        responseTime: 1000,
        timeLimit: 30,
        streak: 0,
      }),
    ).toBe(0);
  });

  it('should return base points for correct answer with no speed bonus', () => {
    const points = calculatePoints({
      isCorrect: true,
      responseTime: 30000,
      timeLimit: 30,
      streak: 0,
    });
    expect(points).toBe(1000);
  });

  it('should add speed bonus for fast answer', () => {
    const points = calculatePoints({
      isCorrect: true,
      responseTime: 2000,
      timeLimit: 30,
      streak: 0,
    });
    expect(points).toBeGreaterThan(1000);
    expect(points).toBeLessThanOrEqual(1500);
  });

  it('should add streak bonus', () => {
    const noStreak = calculatePoints({
      isCorrect: true,
      responseTime: 30000,
      timeLimit: 30,
      streak: 0,
    });
    const withStreak = calculatePoints({
      isCorrect: true,
      responseTime: 30000,
      timeLimit: 30,
      streak: 3,
    });
    expect(withStreak).toBeGreaterThan(noStreak);
    expect(withStreak - noStreak).toBe(150);
  });

  it('should cap streak bonus at 200', () => {
    const lowStreak = calculatePoints({
      isCorrect: true,
      responseTime: 30000,
      timeLimit: 30,
      streak: 4,
    });
    const highStreak = calculatePoints({
      isCorrect: true,
      responseTime: 30000,
      timeLimit: 30,
      streak: 10,
    });
    expect(highStreak).toBe(lowStreak);
  });

  it('should handle timeLimit of 0 gracefully', () => {
    expect(
      calculatePoints({
        isCorrect: true,
        responseTime: 100,
        timeLimit: 0,
        streak: 0,
      }),
    ).toBeGreaterThan(0);
  });
});
