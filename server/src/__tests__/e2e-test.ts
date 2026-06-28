import { io } from '../../client/node_modules/socket.io-client/build/cjs/index.js';

const SERVER = 'http://localhost:4000';
const SOCKET_URL = 'http://localhost:4000/game';
const API = 'http://localhost:4000/api';

let passed = 0;
let failed = 0;
function ok(label) {
  passed++;
  console.log(`  ✅ ${label}`);
}
function fail(label, err) {
  failed++;
  console.log(`  ❌ ${label}: ${err}`);
}

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${data.message || JSON.stringify(data)}`);
  return data;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function connectSocket(token) {
  return new Promise((resolve, reject) => {
    const s = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
    const timeout = setTimeout(() => {
      s.disconnect();
      reject(new Error('socket connect timeout'));
    }, 5000);
    s.on('connect', () => {
      clearTimeout(timeout);
      resolve(s);
    });
    s.on('connect_error', (e) => {
      clearTimeout(timeout);
      reject(e);
    });
  });
}

async function run() {
  console.log('\n🧪 === QUIZARENA KAPSAMLI TEST ===\n');

  // ── 1. AUTH TESTS ──
  console.log('📋 1. AUTH TESTS');

  let token, token2;
  try {
    const reg = await api('POST', '/auth/register', {
      name: 'Tester1',
      email: 'test1@test.com',
      password: '12345678',
      confirmPassword: '12345678',
      role: 'student',
    });
    ok('Kayıt başarılı');
    token = (await api('POST', '/auth/login', { email: 'test1@test.com', password: '12345678' }))
      .accessToken;
    ok('Login başarılı');
  } catch (e) {
    fail('Auth', e.message);
  }

  try {
    const me = await api('GET', '/auth/me', null, token);
    ok(`me endpoint: ${me.user.name}`);
  } catch (e) {
    fail('me endpoint', e.message);
  }

  try {
    const reg2 = await api('POST', '/auth/register', {
      name: 'Tester2',
      email: 'test2@test.com',
      password: '12345678',
      confirmPassword: '12345678',
      role: 'student',
    }).catch(() => null);
    token2 = (await api('POST', '/auth/login', { email: 'test2@test.com', password: '12345678' }))
      .accessToken;
    ok('2. kullanıcı login');
  } catch (e) {
    fail('2. kullanıcı auth', e.message);
  }

  // ── 2. AI QUIZ GENERATION ──
  console.log('\n📋 2. AI SORU ÜRETIMI');

  let aiQuestions;
  try {
    const ai = await api(
      'POST',
      '/ai/generate',
      { difficulty: 'easy', questionCount: 3, includeImages: false },
      token,
    );
    aiQuestions = ai.questions;
    ok(`${aiQuestions.length} soru üretildi`);
    for (const q of aiQuestions) {
      console.log(`     📝 ${q.text} (${q.type}, ${q.answers.length} şık)`);
    }
  } catch (e) {
    fail('AI üretim', e.message);
  }

  // ── 3. QUIZ CRUD ──
  console.log('\n📋 3. QUIZ CRUD');

  let quizId;
  try {
    const colors = ['red', 'blue', 'yellow', 'green'];
    const questions = (aiQuestions || []).map((q, i) => ({
      type: q.type,
      text: q.text,
      answers: q.answers.map((a, j) => ({
        text: a.text,
        isCorrect: a.isCorrect,
        color: colors[j % 4],
      })),
      timeLimit: 30,
      points: 1000,
      explanation: q.explanation,
    }));
    const quiz = await api(
      'POST',
      '/quizzes',
      {
        title: 'E2E Test Quiz',
        description: 'Test quiz',
        difficulty: 'easy',
        isPublic: true,
        questions,
      },
      token,
    );
    quizId = quiz.quiz._id;
    ok(`Quiz oluşturuldu: ${quizId}, ${quiz.quiz.questions.length} soru`);
  } catch (e) {
    fail('Quiz oluşturma', e.message);
  }

  try {
    const quiz = await api('GET', `/quizzes/${quizId}`, null, token);
    ok(`Quiz getirildi: ${quiz.quiz.title}, ${quiz.quiz.questions.length} soru`);
  } catch (e) {
    fail('Quiz getirme', e.message);
  }

  try {
    const list = await api('GET', '/quizzes', null, token);
    ok(`Quiz listesi: ${list.total} quiz`);
  } catch (e) {
    fail('Quiz listesi', e.message);
  }

  try {
    const updated = await api(
      'PUT',
      `/quizzes/${quizId}`,
      { title: 'E2E Test Quiz Updated' },
      token,
    );
    ok(`Quiz güncellendi: ${updated.quiz.title}`);
  } catch (e) {
    fail('Quiz güncelleme', e.message);
  }

  // ── 4. GAME SESSION ──
  console.log('\n📋 4. OYUN OLUŞTURMA');

  let pin, sessionId;
  try {
    const game = await api('POST', '/games', { quizId }, token);
    pin = game.pin;
    sessionId = game.sessionId;
    ok(`Oyun oluşturuldu - PIN: ${pin}, Status: ${game.status}`);
  } catch (e) {
    fail('Oyun oluşturma', e.message);
  }

  try {
    const check = await api('GET', `/games/${pin}`, null, token);
    ok(`PIN doğrulama - Quiz: ${check.session.quiz.title}, Katılımcı: ${check.participantsCount}`);
  } catch (e) {
    fail('PIN doğrulama', e.message);
  }

  // ── 5. SOCKET.IO TESTS ──
  console.log('\n📋 5. SOCKET.IO TESTS');

  let hostSocket, playerSocket1, playerSocket2;
  try {
    hostSocket = await connectSocket(token);
    ok('Host socket bağlandı');
  } catch (e) {
    fail('Host socket', e.message);
  }

  try {
    playerSocket1 = await connectSocket(token2);
    ok('Oyuncu1 socket bağlandı');
  } catch (e) {
    fail('Oyuncu1 socket', e.message);
  }

  // Host joins lobby
  try {
    await new Promise((resolve, reject) => {
      hostSocket.emit('host:create_game', { quizId }, (res) => {
        if (res.ok) {
          pin = res.pin;
          resolve(res);
        } else reject(new Error(res.error));
      });
    });
    ok(`Host oyun oluşturdu - PIN: ${pin}`);
  } catch (e) {
    fail('Host create_game', e.message);
  }

  // Player joins lobby
  let participantId;
  try {
    participantId = await new Promise((resolve, reject) => {
      playerSocket1.emit('lobby:join', { pin, nickname: 'Oyuncu1', emoji: '🦊' }, (res) => {
        if (res.ok) resolve(res.participant?._id);
        else reject(new Error(res.error));
      });
    });
    ok(`Oyuncu1 lobiye katıldı - ID: ${participantId}`);
  } catch (e) {
    fail('Oyuncu1 katılma', e.message);
  }

  // Player2 joins
  let participantId2;
  try {
    participantId2 = await new Promise((resolve, reject) => {
      playerSocket2 = io(SOCKET_URL, { auth: { token: token2 }, transports: ['websocket'] });
      playerSocket2.on('connect', () => {
        playerSocket2.emit('lobby:join', { pin, nickname: 'Oyuncu2', emoji: '🐻' }, (res) => {
          if (res.ok) resolve(res.participant?._id);
          else reject(new Error(res.error));
        });
      });
      playerSocket2.on('connect_error', reject);
    });
    ok(`Oyuncu2 lobiye katıldı - ID: ${participantId2}`);
  } catch (e) {
    fail('Oyuncu2 katılma', e.message);
  }

  // Check lobby player list
  try {
    const players = await new Promise((resolve, reject) => {
      hostSocket.emit('lobby:ready', {});
      setTimeout(() => resolve('timeout'), 1000);
    });
    ok('Lobi hazır');
  } catch (e) {
    fail('Lobi hazır', e.message);
  }

  // Start game
  let questionData;
  try {
    questionData = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('start_game timeout')), 10000);
      playerSocket1.once('game:question_start', (data) => {
        clearTimeout(timeout);
        resolve(data);
      });
      hostSocket.emit('host:start_game', { pin });
    });
    ok(
      `Oyun başladı - Soru ${questionData.index + 1}/${questionData.total}, Süre: ${questionData.timeLimit}s`,
    );
    console.log(`     📝 ${questionData.question.text}`);
  } catch (e) {
    fail('Oyun başlatma', e.message);
  }

  // Submit answers
  try {
    const answers = await new Promise((resolve, reject) => {
      let count = 0;
      const results = [];
      const timeout = setTimeout(() => reject(new Error('answer timeout')), 5000);

      playerSocket1.once('game:player_result', (r) => {
        results.push({ player: 'P1', ...r });
        count++;
        if (count >= 2) {
          clearTimeout(timeout);
          resolve(results);
        }
      });
      playerSocket2.once('game:player_result', (r) => {
        results.push({ player: 'P2', ...r });
        count++;
        if (count >= 2) {
          clearTimeout(timeout);
          resolve(results);
        }
      });

      playerSocket1.emit('game:submit_answer', { pin, answerIndex: 0, responseTime: 2000 });
      playerSocket2.emit('game:submit_answer', { pin, answerIndex: 1, responseTime: 3000 });
    });
    for (const a of answers) {
      ok(
        `${a.player} cevapladı: ${a.isCorrect ? '✅ Doğru' : '❌ Yanlış'}, +${a.pointsEarned} puan, Toplam: ${a.totalScore}`,
      );
    }
  } catch (e) {
    fail('Cevaplama', e.message);
  }

  // Wait for question_end
  try {
    const qEnd = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('question_end timeout')), 10000);
      playerSocket1.once('game:question_end', (data) => {
        clearTimeout(timeout);
        resolve(data);
      });
    });
    ok(
      `Soru bitti - Doğru: ${qEnd.correctAnswer}, Açıklama: ${qEnd.explanation.substring(0, 50)}...`,
    );
  } catch (e) {
    fail('Soru sonu', e.message);
  }

  // Wait for leaderboard
  try {
    const lb = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('leaderboard timeout')), 10000);
      playerSocket1.once('game:leaderboard', (data) => {
        clearTimeout(timeout);
        resolve(data);
      });
    });
    ok(`Leaderboard: ${lb.leaderboard.length} oyuncu`);
    for (const e of lb.leaderboard) {
      console.log(`     🏆 #${e.rank} ${e.nickname}: ${e.totalScore} puan`);
    }
  } catch (e) {
    fail('Leaderboard', e.message);
  }

  // Joker test - 50/50
  try {
    const jokerResult = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('joker timeout')), 5000);
      playerSocket1.once('game:question_start', () => {
        // Next question started, try joker
        playerSocket1.once('game:joker_result', (data) => {
          clearTimeout(timeout);
          resolve(data);
        });
        playerSocket1.emit('game:use_joker', { pin, type: 'fifty_fifty' }, () => {});
      });
      // Trigger next question from host
      hostSocket.emit('host:next_question', { pin });
    });
    ok(`50/50 Joker: ${jokerResult.result.removedAnswers?.length} şık kaldırıldı`);
  } catch (e) {
    fail('50/50 Joker', e.message);
  }

  // End game
  try {
    const finished = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('end_game timeout')), 10000);
      playerSocket1.once('game:finished', (data) => {
        clearTimeout(timeout);
        resolve(data);
      });
      hostSocket.emit('host:end_game', { pin });
    });
    ok(`Oyun bitti - ${finished.finalLeaderboard.length} oyuncu`);
    for (const e of finished.finalLeaderboard) {
      console.log(
        `     🏆 #${e.rank} ${e.nickname}: ${e.totalScore} puan, ${e.correctAnswers} doğru`,
      );
    }
  } catch (e) {
    fail('Oyun bitirme', e.message);
  }

  // Cleanup
  hostSocket?.disconnect();
  playerSocket1?.disconnect();
  playerSocket2?.disconnect();

  // ── RESULTS ──
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 TEST SONUÇLARI: ✅ ${passed} başarılı, ❌ ${failed} başarısız`);
  console.log(`${'='.repeat(50)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
