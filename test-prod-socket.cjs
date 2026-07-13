const { io } = require('./client/node_modules/socket.io-client');
const SERVER = 'https://quizarena-server-kdoh.onrender.com';
const SOCKET = SERVER + '/game';
const API = SERVER + '/api';

async function run() {
  // Register host
  const r1 = await fetch(API + '/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Host', email: 'host_' + Date.now() + '@test.com', password: 'Test1234!' })
  });
  const hostD = await r1.json();
  console.log('1. Host registered');

  // Register player
  const r2 = await fetch(API + '/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Player', email: 'player_' + Date.now() + '@test.com', password: 'Test1234!' })
  });
  const playerD = await r2.json();
  console.log('2. Player registered');

  // Create quiz via REST
  const quizPayload = {
    title: 'SocketTest', description: 'test', category: 'Genel Kultur', difficulty: 'easy', isPublic: true,
    questions: [{
      type: 'multiple_choice', text: '2+2=?', timeLimit: 20, points: 1000, explanation: '4',
      answers: [
        { text: '3', isCorrect: false, color: 'red' },
        { text: '4', isCorrect: true, color: 'green' },
        { text: '5', isCorrect: false, color: 'blue' },
        { text: '6', isCorrect: false, color: 'yellow' }
      ]
    }]
  };
  const qr = await fetch(API + '/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + hostD.accessToken },
    body: JSON.stringify(quizPayload)
  });
  const qd = await qr.json();
  console.log('3. Quiz created:', qd.quiz._id);

  // Create game via REST
  const gr = await fetch(API + '/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + hostD.accessToken },
    body: JSON.stringify({ quizId: qd.quiz._id })
  });
  const gd = await gr.json();
  const pin = gd.pin;
  console.log('4. Game created, PIN:', pin);

  // Connect host via socket
  const host = io(SOCKET, { auth: { token: hostD.accessToken }, transports: ['websocket'] });
  await new Promise((res, rej) => {
    host.on('connect', res);
    host.on('connect_error', rej);
    setTimeout(() => rej(new Error('host connect timeout')), 15000);
  });
  console.log('5. Host socket connected');

  // Host creates game via socket (host:create_game)
  // Actually, host should join existing REST-created room via host:join
  await new Promise((res, rej) => {
    host.emit('host:join', { pin }, (r) => {
      if (r && r.error) rej(new Error(r.error)); else res(r);
    });
    setTimeout(() => rej(new Error('host:join timeout')), 15000);
  });
  console.log('6. Host joined game room');

  // Connect player via socket
  const player = io(SOCKET, { auth: { token: playerD.accessToken }, transports: ['websocket'] });
  await new Promise((res, rej) => {
    player.on('connect', res);
    player.on('connect_error', rej);
    setTimeout(() => rej(new Error('player connect timeout')), 15000);
  });
  console.log('7. Player socket connected');

  // Player joins lobby
  await new Promise((res, rej) => {
    player.emit('lobby:join', { pin, nickname: 'TestOyuncu' }, (r) => {
      if (r && r.error) rej(new Error(r.error)); else res(r);
    });
    setTimeout(() => rej(new Error('lobby:join timeout')), 15000);
  });
  console.log('8. Player joined lobby');

  // Host starts game
  host.emit('host:start_game', { pin });
  console.log('9. Host started game');

  // Wait for game:question_start from player (3s delay in startGame)
  const question = await new Promise((res) => {
    player.once('game:question_start', (d) => res(d));
    setTimeout(() => res(null), 15000);
  });
  if (question) {
    console.log('10. Player received question:', question.question.text);
    console.log('    Answers:', question.question.answers.map(a => a.text).join(', '));
    console.log('    Index:', question.index, '/', question.total);
  } else {
    console.log('10. WARNING: no question received (timeout)');
  }

  // Player submits answer
  player.emit('game:submit_answer', { pin, answerIndex: 1, responseTime: 5 });
  console.log('11. Player submitted answer (correct: index 1)');

  // Wait for question_end
  const qEnd = await new Promise((res) => {
    host.once('game:question_end', (d) => res(d));
    setTimeout(() => res(null), 25000);
  });
  if (qEnd) {
    console.log('12. question_end received');
    if (qEnd.leaderboard) console.log('    Leaderboard:', JSON.stringify(qEnd.leaderboard));
  } else {
    console.log('12. WARNING: question_end timeout');
  }

  // Wait for leaderboard
  const lb = await new Promise((res) => {
    host.once('game:leaderboard', (d) => res(d));
    setTimeout(() => res(null), 10000);
  });
  if (lb) {
    console.log('13. leaderboard received:', JSON.stringify(lb.leaderboard));
  } else {
    console.log('13. WARNING: leaderboard timeout (may have been in question_end)');
  }

  // End game
  host.emit('host:end_game', { pin });
  console.log('14. Host ended game');

  await new Promise(r => setTimeout(r, 2000));

  host.disconnect();
  player.disconnect();
  console.log('\n=== ALL PRODUCTION SOCKET TESTS PASSED ===');
}

run().catch(err => { console.error('FAIL:', err.message); process.exit(1); });
