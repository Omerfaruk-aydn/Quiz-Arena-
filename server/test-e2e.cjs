const { io } = require('../client/node_modules/socket.io-client');

const SERVER = 'http://localhost:4000';
const SOCKET_URL = 'http://localhost:4000/game';
const API = 'http://localhost:4000/api';

let passed = 0;
let failed = 0;
function ok(label) { passed++; console.log(`  ✅ ${label}`); }
function fail(label, err) { failed++; console.log(`  ❌ ${label}: ${err}`); }

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${data.message || data.code || JSON.stringify(data)}`);
  return data;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function connectSocket(token) {
  return new Promise((resolve, reject) => {
    const s = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
    const timeout = setTimeout(() => { s.disconnect(); reject(new Error('socket timeout 5s')); }, 5000);
    s.on('connect', () => { clearTimeout(timeout); resolve(s); });
    s.on('connect_error', (e) => { clearTimeout(timeout); reject(new Error(e.message)); });
  });
}

function emit(socket, event, data) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`${event} timeout 5s`)), 5000);
    socket.emit(event, data, (res) => {
      clearTimeout(timeout);
      if (res && res.ok !== undefined) {
        res.ok ? resolve(res) : reject(new Error(res.error || 'not ok'));
      } else {
        resolve(res);
      }
    });
  });
}

function waitFor(socket, event, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`${event} wait timeout ${timeoutMs}ms`)), timeoutMs);
    socket.once(event, (data) => { clearTimeout(timeout); resolve(data); });
  });
}

async function run() {
  console.log('\n🧪 === QUIZARENA E2E TEST ===\n');

  // ── 1. AUTH ──
  console.log('📋 1. AUTH');

  let token, token2;
  try {
    await api('POST', '/auth/register', { name: 'TestHost', email: 'host2@test.com', password: '12345678', confirmPassword: '12345678', role: 'teacher' }).catch(() => {});
    const r = await api('POST', '/auth/login', { email: 'host2@test.com', password: '12345678' });
    token = r.accessToken;
    ok(`Host login - ${r.user.name}`);
  } catch (e) { fail('Host login', e.message); }

  try {
    await api('POST', '/auth/register', { name: 'Oyuncu1', email: 'player1@test.com', password: '12345678', confirmPassword: '12345678', role: 'student' }).catch(() => {});
    const r = await api('POST', '/auth/login', { email: 'player1@test.com', password: '12345678' });
    token2 = r.accessToken;
    ok(`Oyuncu login - ${r.user.name}`);
  } catch (e) { fail('Oyuncu login', e.message); }

  try {
    const me = await api('GET', '/auth/me', null, token);
    ok(`me endpoint: ${me.user.email}`);
  } catch (e) { fail('me endpoint', e.message); }

  // ── 2. AI ──
  console.log('\n📋 2. AI SORU ÜRETIMI');

  let aiQuestions;
  try {
    const ai = await api('POST', '/ai/generate', { difficulty: 'easy', questionCount: 3, includeImages: false }, token);
    aiQuestions = ai.questions;
    ok(`${aiQuestions.length} soru üretildi`);
    aiQuestions.forEach(q => console.log(`     📝 ${q.text.substring(0, 60)}...`));
  } catch (e) { fail('AI üretim', e.message); }

  // ── 3. QUIZ CRUD ──
  console.log('\n📋 3. QUIZ CRUD');

  const colors = ['red', 'blue', 'yellow', 'green'];
  let quizId;
  try {
    const questions = aiQuestions.map((q) => ({
      type: q.type,
      text: q.text,
      answers: q.answers.map((a, j) => ({ text: a.text, isCorrect: a.isCorrect, color: colors[j % 4] })),
      timeLimit: 30,
      points: 1000,
      explanation: q.explanation,
    }));
    const r = await api('POST', '/quizzes', { title: 'E2E Test Quiz', description: 'Test', difficulty: 'easy', isPublic: true, questions }, token);
    quizId = r.quiz._id;
    ok(`Quiz oluşturuldu: ${quizId}, ${r.quiz.questions.length} soru`);
  } catch (e) { fail('Quiz oluşturma', e.message); }

  try {
    const r = await api('GET', `/quizzes/${quizId}`, null, token);
    ok(`Quiz getirildi: ${r.quiz.title}, ${r.quiz.questions.length} soru`);
  } catch (e) { fail('Quiz getirme', e.message); }

  try {
    const r = await api('PUT', `/quizzes/${quizId}`, { title: 'E2E Test Quiz V2' }, token);
    ok(`Quiz güncellendi: ${r.quiz.title}`);
  } catch (e) { fail('Quiz güncelleme', e.message); }

  try {
    const r = await api('GET', '/quizzes', null, token);
    ok(`Quiz listesi: ${r.total} quiz`);
  } catch (e) { fail('Quiz listesi', e.message); }

  // ── 4. GAME via API ──
  console.log('\n📋 4. OYUN OLUŞTURMA (API)');

  let pin;
  try {
    const r = await api('POST', '/games', { quizId }, token);
    pin = r.pin;
    ok(`Oyun oluşturuldu - PIN: ${pin}, Status: ${r.status}`);
  } catch (e) { fail('Oyun oluşturma', e.message); }

  try {
    const r = await api('GET', `/games/${pin}`, null, token);
    ok(`PIN doğrulama - Quiz: ${r.session.quiz.title}, Status: ${r.session.status}`);
  } catch (e) { fail('PIN doğrulama', e.message); }

  // ── 5. SOCKET.IO FULL GAME FLOW ──
  console.log('\n📋 5. SOCKET.IO - TAM OYUN AKIŞI');

  let hostSocket, p1Socket, p2Socket;
  let gamePin;

  // Connect sockets
  try {
    hostSocket = await connectSocket(token);
    ok('Host socket bağlandı');
  } catch (e) { fail('Host socket', e.message); }

  try {
    p1Socket = await connectSocket(token2);
    ok('Oyuncu1 socket bağlandı');
  } catch (e) { fail('Oyuncu1 socket', e.message); }

  // Create game via socket
  try {
    const r = await emit(hostSocket, 'host:create_game', { quizId });
    gamePin = r.pin;
    ok(`Host socket oyun oluşturdu - PIN: ${gamePin}`);
  } catch (e) { fail('Host create_game', e.message); }

  // Player1 joins
  let p1Id;
  try {
    const r = await emit(p1Socket, 'lobby:join', { pin: gamePin, nickname: 'Oyuncu1', emoji: '🦊' });
    p1Id = r.participant?._id;
    ok(`Oyuncu1 lobiye katıldı`);
  } catch (e) { fail('Oyuncu1 katılma', e.message); }

  // Player2 joins
  try {
    p2Socket = io(SOCKET_URL, { auth: { token: token2 }, transports: ['websocket'] });
    await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('p2 connect timeout')), 5000);
      p2Socket.on('connect', () => { clearTimeout(t); resolve(); });
      p2Socket.on('connect_error', (e) => { clearTimeout(t); reject(new Error(e.message)); });
    });
    const r = await emit(p2Socket, 'lobby:join', { pin: gamePin, nickname: 'Oyuncu2', emoji: '🐻' });
    ok(`Oyuncu2 lobiye katıldı`);
  } catch (e) { fail('Oyuncu2 katılma', e.message); }

  // Start game (triggers countdown -> question_start)
  try {
    // Set up listeners BEFORE emitting start_game
    const startingPromise = waitFor(p1Socket, 'game:starting', 5000);
    const questionPromise = waitFor(p1Socket, 'game:question_start', 15000);

    hostSocket.emit('host:start_game', { pin: gamePin });

    const starting = await startingPromise;
    ok(`Countdown başladı: ${starting.countdown}`);
    await sleep(4000); // Wait for countdown (3-2-1) + question_start

    const q1 = await questionPromise;
    ok(`Oyun başladı - Soru ${q1.index + 1}/${q1.total}, Süre: ${q1.timeLimit}s`);
    console.log(`     📝 ${q1.question.text.substring(0, 70)}`);
  } catch (e) { fail('Oyun başlatma', e.message); }

  // Submit answers
  try {
    const p1Result = waitFor(p1Socket, 'game:player_result', 10000);
    const p2Result = waitFor(p2Socket, 'game:player_result', 10000);

    p1Socket.emit('game:submit_answer', { pin: gamePin, answerIndex: 0, responseTime: 2000 });
    p2Socket.emit('game:submit_answer', { pin: gamePin, answerIndex: 1, responseTime: 3000 });

    const [r1, r2] = await Promise.all([p1Result, p2Result]);
    ok(`Oyuncu1: ${r1.isCorrect ? '✅ Doğru' : '❌ Yanlış'} +${r1.pointsEarned} puan (Toplam: ${r1.totalScore})`);
    ok(`Oyuncu2: ${r2.isCorrect ? '✅ Doğru' : '❌ Yanlış'} +${r2.pointsEarned} puan (Toplam: ${r2.totalScore})`);
  } catch (e) { fail('Cevaplama', e.message); }

  // Question end + leaderboard (set up listeners together)
  try {
    const qEndPromise = waitFor(p1Socket, 'game:question_end', 10000);
    const lbPromise = waitFor(p1Socket, 'game:leaderboard', 10000);
    const qEnd = await qEndPromise;
    ok(`Soru bitti - Doğru cevap: ${qEnd.correctAnswer}, Açıklama: ${qEnd.explanation.substring(0, 40)}...`);
    const lb = await lbPromise;
    ok(`Leaderboard: ${lb.leaderboard.length} oyuncu`);
    lb.leaderboard.forEach(e => console.log(`     🏆 #${e.rank} ${e.nickname}: ${e.totalScore} puan`));
  } catch (e) { fail('Soru sonu + leaderboard', e.message); }

  // Next question + 50/50 joker
  try {
    hostSocket.emit('host:next_question', { pin: gamePin });
    const q2 = await waitFor(p1Socket, 'game:question_start', 10000);
    ok(`2. soru başladı: ${q2.question.text.substring(0, 50)}...`);

    const jokerPromise = waitFor(p1Socket, 'game:joker_result', 5000);
    p1Socket.emit('game:use_joker', { pin: gamePin, type: 'fifty_fifty' }, () => {});
    const jokerRes = await jokerPromise;
    ok(`50/50 Joker: ${jokerRes.result.removedAnswers?.length} şık kaldırıldı`);
  } catch (e) { fail('2. soru + joker', e.message); }

  // Submit 2nd question answers
  try {
    const p1Result = waitFor(p1Socket, 'game:player_result', 10000);
    const p2Result = waitFor(p2Socket, 'game:player_result', 10000);
    p1Socket.emit('game:submit_answer', { pin: gamePin, answerIndex: 2, responseTime: 1500 });
    p2Socket.emit('game:submit_answer', { pin: gamePin, answerIndex: 2, responseTime: 2500 });
    const [r1, r2] = await Promise.all([p1Result, p2Result]);
    ok(`Soru 2 - Oyuncu1: ${r1.isCorrect ? '✅' : '❌'} +${r1.pointsEarned}, Oyuncu2: ${r2.isCorrect ? '✅' : '❌'} +${r2.pointsEarned}`);
  } catch (e) { fail('Soru 2 cevaplama', e.message); }

  // Wait for question_end + leaderboard for Q2
  try {
    const qEnd2Promise = waitFor(p1Socket, 'game:question_end', 10000);
    const lb2Promise = waitFor(p1Socket, 'game:leaderboard', 10000);
    await qEnd2Promise;
    const lb2 = await lb2Promise;
    ok(`Soru 2 Leaderboard: #1 ${lb2.leaderboard[0]?.nickname} ${lb2.leaderboard[0]?.totalScore} puan`);
  } catch (e) { fail('Soru 2 sonu', e.message); }

  // 3rd question (last) + phone_a_friend joker
  try {
    hostSocket.emit('host:next_question', { pin: gamePin });
    const q3 = await waitFor(p1Socket, 'game:question_start', 10000);
    ok(`3. soru başladı: ${q3.question.text.substring(0, 50)}...`);

    const hintPromise = waitFor(p1Socket, 'game:phone_a_friend_hint', 60000);
    p1Socket.emit('game:use_joker', { pin: gamePin, type: 'phone_a_friend' }, () => {});
    const hintRes = await hintPromise;
    ok(`Arkımı Ara joker: "${hintRes.hint.substring(0, 50)}..."`);
  } catch (e) { fail('Soru 3 joker', e.message); }

  // Submit 3rd question
  try {
    const p1Result = waitFor(p1Socket, 'game:player_result', 10000);
    const p2Result = waitFor(p2Socket, 'game:player_result', 10000);
    p1Socket.emit('game:submit_answer', { pin: gamePin, answerIndex: 0, responseTime: 1000 });
    p2Socket.emit('game:submit_answer', { pin: gamePin, answerIndex: 1, responseTime: 4000 });
    const [r1, r2] = await Promise.all([p1Result, p2Result]);
    ok(`Soru 3 - Oyuncu1: ${r1.isCorrect ? '✅' : '❌'} +${r1.pointsEarned}, Oyuncu2: ${r2.isCorrect ? '✅' : '❌'} +${r2.pointsEarned}`);
  } catch (e) { fail('Soru 3 cevaplama', e.message); }

  // Final leaderboard + game finished
  try {
    const qEnd3Promise = waitFor(p1Socket, 'game:question_end', 10000);
    const lb3Promise = waitFor(p1Socket, 'game:leaderboard', 10000);
    await qEnd3Promise;
    await lb3Promise;

    // End the game
    const finishedPromise = waitFor(p1Socket, 'game:finished', 10000);
    hostSocket.emit('host:end_game', { pin: gamePin });
    const finished = await finishedPromise;
    ok(`Oyun bitti! ${finished.finalLeaderboard.length} oyuncu`);
    finished.finalLeaderboard.forEach(e => console.log(`     🏆 #${e.rank} ${e.nickname}: ${e.totalScore} puan, ${e.correctAnswers} doğru`));
  } catch (e) { fail('Oyun bitiş', e.message); }

  // Cleanup
  hostSocket?.disconnect();
  p1Socket?.disconnect();
  p2Socket?.disconnect();

  // ── RESULTS ──
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`  📊 TEST SONUÇLARI: ✅ ${passed} başarılı | ❌ ${failed} başarısız`);
  console.log(`${'═'.repeat(50)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error('💥 Fatal:', e); process.exit(1); });
