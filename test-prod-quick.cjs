const { io } = require('./client/node_modules/socket.io-client');
const SERVER = 'https://quizarena-server-kdoh.onrender.com';
const SOCKET = SERVER + '/game';
const API = SERVER + '/api';

async function run() {
  const r1 = await fetch(API + '/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Host', email: 'h_' + Date.now() + '@t.com', password: 'Test1234!' })
  });
  const rd1 = await r1.json();
  const hToken = rd1.accessToken;
  console.log('Host registered:', hToken ? 'ok' : 'FAIL');

  const r2 = await fetch(API + '/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Player', email: 'p_' + Date.now() + '@t.com', password: 'Test1234!' })
  });
  const rd2 = await r2.json();
  const pToken = rd2.accessToken;
  console.log('Player registered:', pToken ? 'ok' : 'FAIL');

  const qr = await fetch(API + '/quizzes', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + hToken },
    body: JSON.stringify({title:'T',description:'d',category:'Genel',difficulty:'easy',isPublic:true,
      questions:[{type:'multiple_choice',text:'2+2=?',timeLimit:20,points:1000,explanation:'',
        answers:[{text:'3',isCorrect:false,color:'red'},{text:'4',isCorrect:true,color:'green'},{text:'5',isCorrect:false,color:'blue'},{text:'6',isCorrect:false,color:'yellow'}]}]})
  });
  const qd = await qr.json();
  console.log('Quiz:', qd.quiz?._id);

  const gr = await fetch(API + '/games', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + hToken },
    body: JSON.stringify({ quizId: qd.quiz._id })
  });
  const gd = await gr.json();
  const pin = gd.pin;
  console.log('PIN:', pin);

  // Host socket
  const host = io(SOCKET, { auth: { token: hToken }, transports: ['websocket'] });
  await new Promise((r, j) => { host.on('connect', r); host.on('connect_error', j); setTimeout(() => j('host connect timeout'), 15000); });
  console.log('Host connected');

  // host:join
  const joinRes = await new Promise((r, j) => {
    host.emit('host:join', { pin }, (res) => { r(res); });
    setTimeout(() => j('host:join timeout'), 15000);
  });
  console.log('host:join:', JSON.stringify(joinRes));

  // Player socket
  const player = io(SOCKET, { auth: { token: pToken }, transports: ['websocket'] });
  await new Promise((r, j) => { player.on('connect', r); player.on('connect_error', j); setTimeout(() => j('player connect timeout'), 15000); });
  console.log('Player connected');

  // Listen for lobby:player_joined on host
  let hostReceivedJoin = false;
  host.on('lobby:player_joined', (data) => {
    hostReceivedJoin = true;
    console.log('HOST RECEIVED lobby:player_joined:', data.participant.nickname, 'total:', data.totalCount);
  });

  // Player lobby:join
  const pjRes = await new Promise((r, j) => {
    player.emit('lobby:join', { pin, nickname: 'TestOyuncu', emoji: '🎮' }, (res) => { r(res); });
    setTimeout(() => j('lobby:join timeout'), 15000);
  });
  console.log('lobby:join:', pjRes.ok ? 'ok' : pjRes.error);

  await new Promise(r => setTimeout(r, 3000));
  console.log('Host received player_joined event:', hostReceivedJoin);

  host.disconnect();
  player.disconnect();
  console.log('\n=== TEST DONE ===');
}

run().catch(err => { console.error('FAIL:', err.message || err); process.exit(1); });
