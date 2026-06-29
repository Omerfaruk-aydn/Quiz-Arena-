import type { QuizServer, QuizSocket } from '../index.js';
import type {
  AnswerStats,
  GameStatus,
  LeaderboardEntry,
  ParticipantDTO,
  QuestionDTO,
  ReconnectStateDTO,
  JokerType,
  JokerResult,
} from '@quizarena/shared';
import { getTimeLimitForDifficulty } from '@quizarena/shared';
import { prisma } from '../../config/prisma.js';
import {
  addParticipant,
  recordAnswer,
  finalizeSession,
} from '../../services/gameSessionService.js';
import { setGameState, deleteGameState } from '../../services/redisService.js';
import { GameState } from './GameState.js';
import { QuestionTimer } from './QuestionTimer.js';
import { calculatePoints } from './ScoreCalculator.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

interface PlayerState {
  participantId: string;
  socketId: string;
  nickname: string;
  emoji: string;
  color: string;
  totalScore: number;
  streak: number;
  correctCount: number;
  lastPointsEarned: number;
  answered: boolean;
  selectedAnswer: number | null;
  responseTime: number;
  isConnected: boolean;
  isHost: boolean;
  jokers: { fiftyFifty: boolean; phoneAFriend: boolean; skipQuestion: boolean };
}

interface QuestionWithAnswers {
  id: string;
  text: string;
  imageUrl: string;
  timeLimit: number;
  points: number;
  explanation: string;
  answers: { id: string; text: string; isCorrect: boolean; color: string }[];
}

export class GameRoom {
  readonly pin: string;
  readonly sessionId: string;
  readonly state = new GameState();
  private players = new Map<string, PlayerState>();
  private questions: QuestionWithAnswers[] = [];
  private currentIndex = 0;
  private timer: QuestionTimer | null = null;
  private difficulty: string = 'medium';
  private readonly io: QuizServer;
  private isEndingQuestion = false;
  private isFinished = false;
  private advanceTimeout: NodeJS.Timeout | null = null;
  private questionStartedAt = 0;
  private minQuestionTimeout: NodeJS.Timeout | null = null;
  private readonly MIN_QUESTION_MS = 3000;

  constructor(
    io: QuizServer,
    pin: string,
    sessionId: string,
    _settings: { timeLimit: number; showAnswerAfterEach: boolean },
  ) {
    this.io = io;
    this.pin = pin;
    this.sessionId = sessionId;
  }

  async loadQuiz(quizId: string): Promise<void> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { difficulty: true },
    });
    if (quiz) {
      this.difficulty = quiz.difficulty;
    }
    const questions = await prisma.question.findMany({
      where: { quizId },
      orderBy: { order: 'asc' },
      include: { answers: true },
    });
    this.questions = questions.map((q) => ({
      id: q.id,
      text: q.text,
      imageUrl: q.imageUrl,
      timeLimit: q.timeLimit,
      points: q.points,
      explanation: q.explanation,
      answers: q.answers.map(
        (a: { id: string; text: string; isCorrect: boolean; color: string }) => ({
          id: a.id,
          text: a.text,
          isCorrect: a.isCorrect,
          color: a.color,
        }),
      ),
    }));
  }

  hasSocket(socketId: string): boolean {
    for (const p of this.players.values()) {
      if (p.socketId === socketId) return true;
    }
    return false;
  }

  isEmpty(): boolean {
    return this.players.size === 0;
  }

  getPlayersArray(): PlayerState[] {
    return Array.from(this.players.values());
  }

  participantCount(): number {
    return this.players.size;
  }

  async joinPlayer(socket: QuizSocket, nickname: string, emoji: string): Promise<ParticipantDTO> {
    const existing = this.players.get(socket.id);
    if (existing) {
      existing.isConnected = true;
      socket.join(`game:${this.pin}`);
      socket.join(`game:${this.pin}:players`);
      socket.data.role = 'player';
      socket.data.pin = this.pin;
      socket.data.participantId = existing.participantId;
      socket.data.nickname = existing.nickname;
      return this.toDTO(existing);
    }

    const color = generateColorFor(nickname, this.players.size);
    const doc = await addParticipant(this.sessionId, {
      nickname,
      emoji,
      color,
      socketId: socket.id,
      userId: socket.data.userId,
    });
    const player: PlayerState = {
      participantId: doc.id,
      socketId: socket.id,
      nickname,
      emoji,
      color,
      totalScore: 0,
      streak: 0,
      correctCount: 0,
      lastPointsEarned: 0,
      answered: false,
      selectedAnswer: null,
      responseTime: 0,
      isConnected: true,
      isHost: false,
      jokers: { fiftyFifty: true, phoneAFriend: true, skipQuestion: true },
    };
    this.players.set(socket.id, player);

    socket.join(`game:${this.pin}`);
    socket.join(`game:${this.pin}:players`);
    socket.data.role = 'player';
    socket.data.pin = this.pin;
    socket.data.participantId = player.participantId;
    socket.data.nickname = nickname;

    void this.saveStateToRedis();
    return this.toDTO(player);
  }

  async joinHostAsPlayer(
    socket: QuizSocket,
    nickname: string,
    emoji: string,
  ): Promise<ParticipantDTO> {
    const participant = await this.joinPlayer(socket, nickname, emoji);
    const player = this.players.get(socket.id);
    if (player) player.isHost = true;
    socket.join(`game:${this.pin}:host`);
    socket.data.role = 'host';
    return participant;
  }

  private toDTO(p: PlayerState): ParticipantDTO {
    return {
      _id: p.participantId,
      nickname: p.nickname,
      avatar: { emoji: p.emoji, color: p.color },
      totalScore: p.totalScore,
      streak: p.streak,
      isConnected: p.isConnected,
      rank: 0,
    };
  }

  broadcastPlayerList(): void {
    const list = this.getPlayersArray().map((p) => this.toDTO(p));
    this.io.to(`game:${this.pin}`).emit('lobby:player_list', { participants: list });
  }

  getParticipantsDTO(): ParticipantDTO[] {
    return this.getPlayersArray().map((p) => this.toDTO(p));
  }

  async startGame(): Promise<void> {
    this.state.transition('starting');
    await prisma.gameSession.update({
      where: { id: this.sessionId },
      data: { status: 'starting' },
    });
    await this.saveStateToRedis();
    this.io.to(`game:${this.pin}`).emit('game:starting', { countdown: 3 });
    setTimeout(() => {
      this.state.force('active');
      void prisma.gameSession.update({
        where: { id: this.sessionId },
        data: { status: 'active', startedAt: new Date() },
      });
      this.io.to(`game:${this.pin}`).emit('game:started', { pin: this.pin, status: 'active' });
      this.startNextQuestion();
    }, 4000);
  }

  startNextQuestion(): void {
    if (this.isFinished) return;
    if (this.currentIndex >= this.questions.length) {
      void this.finishGame();
      return;
    }
    this.isEndingQuestion = false;
    if (this.minQuestionTimeout) {
      clearTimeout(this.minQuestionTimeout);
      this.minQuestionTimeout = null;
    }
    this.questionStartedAt = Date.now();
    const q = this.questions[this.currentIndex];
    for (const p of this.players.values()) {
      p.answered = false;
      p.selectedAnswer = null;
      p.responseTime = 0;
    }
    this.state.force('active');

    const answersForClient = q.answers.map((a) => ({ text: a.text, color: a.color }));
    const dto: QuestionDTO = {
      _id: q.id,
      text: q.text,
      image: q.imageUrl || null,
      answers: answersForClient,
      timeLimit: getTimeLimitForDifficulty(this.difficulty),
      explanation: q.explanation || '',
    };

    this.timer?.stop();
    this.timer = new QuestionTimer(getTimeLimitForDifficulty(this.difficulty));
    this.timer.on('tick', (remaining) => {
      this.io.to(`game:${this.pin}`).emit('game:timer_tick', { remaining });
    });
    this.timer.on('end', () => {
      void this.endQuestion();
    });
    this.timer.start();
    void this.saveStateToRedis();

    this.io.to(`game:${this.pin}`).emit('game:question_start', {
      question: dto,
      index: this.currentIndex,
      total: this.questions.length,
      timeLimit: dto.timeLimit,
    });
  }

  async submitAnswer(socketId: string, answerIndex: number, responseTime: number): Promise<void> {
    const player = this.players.get(socketId);
    if (!player || player.answered) return;
    if (this.state.get() !== 'active') return;
    const q = this.questions[this.currentIndex];
    if (!q) return;
    const correctIdx = q.answers.findIndex((a) => a.isCorrect);
    const isCorrect = correctIdx === answerIndex;
    player.answered = true;
    player.selectedAnswer = answerIndex;
    player.responseTime = responseTime;

    const points = calculatePoints({
      isCorrect,
      responseTime,
      timeLimit: getTimeLimitForDifficulty(this.difficulty),
      streak: isCorrect ? player.streak : 0,
    });
    player.lastPointsEarned = points;
    if (isCorrect) {
      player.totalScore += points;
      player.streak += 1;
      player.correctCount += 1;
    } else {
      player.streak = 0;
    }

    await recordAnswer({
      sessionId: this.sessionId,
      participantId: player.participantId,
      questionId: q.id,
      selectedAnswer: answerIndex,
      isCorrect,
      responseTime,
      pointsEarned: points,
    });

    const answeredCount = this.getPlayersArray().filter((p) => p.answered).length;
    this.io.to(`game:${this.pin}`).emit('game:answer_received', { count: answeredCount });

    const distribution = [0, 0, 0, 0];
    for (const p of this.players.values()) {
      if (p.answered && p.selectedAnswer != null && p.selectedAnswer >= 0 && p.selectedAnswer < 4) {
        distribution[p.selectedAnswer] += 1;
      }
    }
    this.io.to(`game:${this.pin}:host`).emit('host:answer_distribution', { distribution });

    if (answeredCount === this.players.size) {
      const elapsed = Date.now() - this.questionStartedAt;
      if (elapsed < this.MIN_QUESTION_MS) {
        if (!this.minQuestionTimeout) {
          const delay = this.MIN_QUESTION_MS - elapsed;
          this.minQuestionTimeout = setTimeout(() => {
            this.minQuestionTimeout = null;
            void this.endQuestion();
          }, delay);
        }
      } else {
        await this.endQuestion();
      }
    }
  }

  private async endQuestion(): Promise<void> {
    if (this.isEndingQuestion) return;
    this.isEndingQuestion = true;
    if (this.minQuestionTimeout) {
      clearTimeout(this.minQuestionTimeout);
      this.minQuestionTimeout = null;
    }
    if (this.timer) {
      this.timer.stop();
      this.timer = null;
    }
    this.state.force('question_results');
    const q = this.questions[this.currentIndex];
    if (!q) {
      this.isEndingQuestion = false;
      return;
    }
    const correctAnswer = q.answers.findIndex((a) => a.isCorrect);
    const distribution = [0, 0, 0, 0];
    for (const p of this.players.values()) {
      if (p.selectedAnswer != null && p.selectedAnswer >= 0 && p.selectedAnswer < 4) {
        distribution[p.selectedAnswer] += 1;
      }
    }
    const totalAnswered = this.getPlayersArray().filter((p) => p.answered).length;
    const stats: AnswerStats = {
      distribution,
      totalAnswered,
      totalParticipants: this.players.size,
    };
    this.io.to(`game:${this.pin}`).emit('game:question_end', {
      correctAnswer,
      explanation: q.explanation || '',
      answerStats: stats,
    });

    const leaderboard = this.buildLeaderboard(correctAnswer);

    for (const p of this.players.values()) {
      const isCorrect = p.selectedAnswer === correctAnswer;
      const rank = leaderboard.find((e) => e.participantId === p.participantId)?.rank ?? 0;
      this.io.to(p.socketId).emit('game:player_result', {
        isCorrect,
        pointsEarned: p.lastPointsEarned,
        totalScore: p.totalScore,
        rank,
      });
    }

    this.io.to(`game:${this.pin}`).emit('game:leaderboard', { leaderboard });
    this.state.force('leaderboard');

    const isLast = this.currentIndex + 1 >= this.questions.length;
    this.advanceTimeout = setTimeout(() => {
      this.advanceTimeout = null;
      this.isEndingQuestion = false;
      if (this.isFinished) return;
      if (isLast) {
        void this.finishGame();
      } else {
        this.nextQuestion();
      }
    }, 5000);
  }

  private buildLeaderboard(correctAnswer: number): LeaderboardEntry[] {
    const sorted = [...this.players.values()].sort((a, b) => b.totalScore - a.totalScore);
    return sorted.map((p, i) => ({
      participantId: p.participantId,
      nickname: p.nickname,
      emoji: p.emoji,
      totalScore: p.totalScore,
      streak: p.streak,
      isCorrect: p.selectedAnswer === correctAnswer,
      pointsEarned: p.lastPointsEarned,
      rank: i + 1,
    }));
  }

  nextQuestion(): void {
    if (this.advanceTimeout) {
      clearTimeout(this.advanceTimeout);
      this.advanceTimeout = null;
    }
    this.isEndingQuestion = false;
    this.currentIndex += 1;
    this.startNextQuestion();
  }

  skipQuestion(): void {
    void this.endQuestion();
  }

  async endGame(): Promise<void> {
    if (this.isFinished) return;
    await this.finishGame();
  }

  private async finishGame(): Promise<void> {
    if (this.isFinished) return;
    this.isFinished = true;
    if (this.advanceTimeout) {
      clearTimeout(this.advanceTimeout);
      this.advanceTimeout = null;
    }
    if (this.timer) {
      this.timer.stop();
      this.timer = null;
    }
    this.state.force('finished');
    const sorted = [...this.players.values()].sort((a, b) => b.totalScore - a.totalScore);
    const finalLeaderboard = sorted.map((p, i) => ({
      participantId: p.participantId,
      nickname: p.nickname,
      emoji: p.emoji,
      totalScore: p.totalScore,
      correctAnswers: p.correctCount,
      rank: i + 1,
    }));
    await finalizeSession(this.sessionId);
    await this.clearRedisState();
    this.io.to(`game:${this.pin}`).emit('game:finished', { finalLeaderboard });
  }

  async useJoker(socketId: string, jokerType: JokerType): Promise<void> {
    const player = this.players.get(socketId);
    if (!player) return;
    if (this.state.get() !== 'active') return;
    if (player.answered) return;

    if (jokerType === 'fifty_fifty') {
      if (!player.jokers.fiftyFifty) return;
      player.jokers.fiftyFifty = false;

      const q = this.questions[this.currentIndex];
      if (!q) return;
      const wrongIndices = q.answers
        .map((a, i) => ({ a, i }))
        .filter(({ a }) => !a.isCorrect)
        .map(({ i }) => i);
      const toRemove = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);

      const result: JokerResult = { type: 'fifty_fifty', removedAnswers: toRemove };
      this.io.to(socketId).emit('game:joker_result', { result });
      await prisma.gameParticipant.update({
        where: { id: player.participantId },
        data: { jokersUsedFiftyFifty: true },
      });
    } else if (jokerType === 'phone_a_friend') {
      if (!player.jokers.phoneAFriend) return;
      player.jokers.phoneAFriend = false;

      const q = this.questions[this.currentIndex];
      if (!q) return;

      let finalHint: string;
      try {
        const { getPhoneAFriendHint } = await import('../../services/aiService.js');
        const { hint, isCorrectAnswer } = await getPhoneAFriendHint(
          q.text,
          q.answers.map((a) => ({ text: a.text, isCorrect: a.isCorrect })),
        );
        finalHint = isCorrectAnswer ? hint : `${hint} (Ama emin değilim...)`;
      } catch (err) {
        logger.warn('PhoneAFriend AI hatası, local fallback kullanılıyor', { err });
        const correctIdx = q.answers.findIndex((a) => a.isCorrect);
        const useCorrect = Math.random() < 0.5;
        const idx = useCorrect
          ? correctIdx
          : (correctIdx + 1 + Math.floor(Math.random() * (q.answers.length - 1))) %
            q.answers.length;
        const templates = [
          `Bence ${idx + 1}. seçenek doğru olabilir...`,
          `Hmm, ${idx + 1}. şık mantıklı geliyor.`,
          `${idx + 1}. seçeneği seçerdim ben olsam.`,
          `Emin değilim ama ${idx + 1}. olabilir.`,
        ];
        finalHint = templates[Math.floor(Math.random() * templates.length)];
      }

      this.io.to(socketId).emit('game:phone_a_friend_hint', { hint: finalHint });
      const result: JokerResult = { type: 'phone_a_friend' };
      this.io.to(socketId).emit('game:joker_result', { result });
      await prisma.gameParticipant.update({
        where: { id: player.participantId },
        data: { jokersUsedPhoneAFriend: true },
      });
    } else if (jokerType === 'skip_question') {
      if (!player.jokers.skipQuestion) return;
      player.jokers.skipQuestion = false;

      player.answered = true;
      player.selectedAnswer = -1;
      player.responseTime = 0;
      player.lastPointsEarned = 0;

      const result: JokerResult = { type: 'skip_question', skipped: true };
      this.io.to(socketId).emit('game:joker_result', { result });
      await prisma.gameParticipant.update({
        where: { id: player.participantId },
        data: { jokersUsedSkipQuestion: true },
      });

      const answeredCount = this.getPlayersArray().filter((p) => p.answered).length;
      if (answeredCount === this.players.size) {
        const elapsed = Date.now() - this.questionStartedAt;
        if (elapsed < this.MIN_QUESTION_MS) {
          if (!this.minQuestionTimeout) {
            const delay = this.MIN_QUESTION_MS - elapsed;
            this.minQuestionTimeout = setTimeout(() => {
              this.minQuestionTimeout = null;
              void this.endQuestion();
            }, delay);
          }
        } else {
          await this.endQuestion();
        }
      }
    }
  }

  async kickPlayer(participantId: string): Promise<void> {
    for (const [socketId, p] of this.players.entries()) {
      if (p.participantId === participantId) {
        this.io.to(socketId).emit('lobby:player_kicked', { participantId });
        const s = this.io.sockets.get(socketId);
        void s?.disconnect(true);
        this.players.delete(socketId);
        break;
      }
    }
    this.broadcastPlayerList();
  }

  async handleDisconnect(socketId: string): Promise<void> {
    const p = this.players.get(socketId);
    if (!p) return;
    p.isConnected = false;
    await prisma.gameParticipant.update({
      where: { id: p.participantId },
      data: { isConnected: false },
    });
    this.io.to(`game:${this.pin}`).emit('lobby:player_left', {
      participantId: p.participantId,
      totalCount: this.players.size,
    });
  }

  async rejoin(socket: QuizSocket, participantId: string): Promise<void> {
    const existing = [...this.players.values()].find((p) => p.participantId === participantId);
    if (!existing) throw ApiError.notFound('Katılımcı bulunamadı', 'PARTICIPANT_NOT_FOUND');
    this.players.delete(existing.socketId);
    existing.socketId = socket.id;
    existing.isConnected = true;
    this.players.set(socket.id, existing);
    socket.join(`game:${this.pin}`);
    socket.join(`game:${this.pin}:players`);
    if (existing.isHost) {
      socket.join(`game:${this.pin}:host`);
      socket.data.role = 'host';
    } else {
      socket.data.role = 'player';
    }
    socket.data.pin = this.pin;
    socket.data.participantId = participantId;
    await prisma.gameParticipant.update({
      where: { id: participantId },
      data: { isConnected: true, socketId: socket.id },
    });
    this.broadcastPlayerList();

    const remainingTime = this.timer?.getRemaining() ?? 0;
    const sorted = [...this.players.values()].sort((a, b) => b.totalScore - a.totalScore);
    const rank = sorted.findIndex((p) => p.participantId === participantId) + 1;

    const reconnectState: ReconnectStateDTO = {
      status: this.state.get(),
      currentQuestionIndex: this.currentIndex,
      totalQuestions: this.questions.length,
      remainingTime,
      timeLimit: getTimeLimitForDifficulty(this.difficulty),
      answered: existing.answered,
      selectedAnswer: existing.selectedAnswer,
      totalScore: existing.totalScore,
      rank: rank || 0,
    };

    if (this.state.is('active') && this.timer) {
      const q = this.questions[this.currentIndex];
      if (q) {
        const fullTimeLimit = getTimeLimitForDifficulty(this.difficulty);
        this.io.to(socket.id).emit('game:question_start', {
          question: {
            _id: q.id,
            text: q.text,
            image: q.imageUrl || null,
            answers: q.answers.map((a) => ({ text: a.text, color: a.color })),
            timeLimit: fullTimeLimit,
            explanation: q.explanation || '',
          },
          index: this.currentIndex,
          total: this.questions.length,
          timeLimit: fullTimeLimit,
        });
        this.io.to(socket.id).emit('game:timer_tick', { remaining: this.timer.getRemaining() });
      }
    }

    this.io.to(socket.id).emit('game:reconnected', { gameState: reconnectState });
  }

  getStatus(): GameStatus {
    return this.state.get();
  }

  private async saveStateToRedis(): Promise<void> {
    try {
      const stateSnapshot = {
        pin: this.pin,
        sessionId: this.sessionId,
        status: this.state.get(),
        currentIndex: this.currentIndex,
        totalQuestions: this.questions.length,
        players: this.getPlayersArray().map((p) => ({
          participantId: p.participantId,
          nickname: p.nickname,
          emoji: p.emoji,
          color: p.color,
          totalScore: p.totalScore,
          streak: p.streak,
          isConnected: p.isConnected,
        })),
      };
      await setGameState(this.pin, stateSnapshot, 24 * 60 * 60);
    } catch (err) {
      logger.warn('Redis state cache failed', { pin: this.pin, err });
    }
  }

  private async clearRedisState(): Promise<void> {
    try {
      await deleteGameState(this.pin);
    } catch {
      // silent
    }
  }
}

const AVATAR_COLORS = [
  '#7C3AED',
  '#EC4899',
  '#3B82F6',
  '#F59E0B',
  '#10B981',
  '#EF4444',
  '#06B6D4',
  '#8B5CF6',
];

function generateColorFor(nickname: string, index: number): string {
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) hash = (hash * 31 + nickname.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[(hash + index) % AVATAR_COLORS.length];
}
