import { EventEmitter } from 'events';

export interface QuestionTimerEvents {
  tick: (remaining: number) => void;
  end: () => void;
}

export class QuestionTimer extends EventEmitter {
  private intervalId: NodeJS.Timeout | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  private remaining: number;
  private readonly timeLimit: number;
  private readonly startTime: number;
  private running = false;

  constructor(timeLimitSeconds: number) {
    super();
    this.timeLimit = Math.max(1, Math.floor(timeLimitSeconds));
    this.remaining = this.timeLimit;
    this.startTime = Date.now();
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.emit('tick', this.remaining);
    this.intervalId = setInterval(() => {
      this.remaining -= 1;
      this.emit('tick', this.remaining);
      if (this.remaining <= 5 && this.remaining > 0) {
        // son 5 saniye UI'da işaretlenebilir
      }
    }, 1000);
    this.timeoutId = setTimeout(() => {
      this.stop();
      this.emit('end');
    }, this.timeLimit * 1000);
  }

  getRemaining(): number {
    return this.remaining;
  }

  elapsed(): number {
    return Date.now() - this.startTime;
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }
}
