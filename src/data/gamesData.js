export const INITIAL_GAMES = [
  {
    id: 'slope-tunnel',
    title: 'Slope 3D: Neon Tunnel',
    category: 'Action',
    description: 'High-octane 3D wireframe tunnel racer. Steer your hyper-speed sphere across endless neon platforms, dodge barriers, and survive the accelerating vortex.',
    controls: 'Left/Right or A/D to steer, Space to leap, P to pause',
    instructions: [
      'Use A/D or Left/Right arrows to roll along the 3D track',
      'Press Space to leap over red obstacle barriers',
      'Speed increases every 100 meters - stay centered to avoid plummeting into the void',
      'Score multiplier increases with continuous speed'
    ],
    tags: ['3D', 'Fast-Paced', 'Tunnel', 'Reflexes'],
    rating: 4.9,
    plays: '184.2K',
    badge: 'HOT',
    aspectRatio: '16:9',
    themeColor: '#06b6d4',
    iconName: 'Zap',
    iframe: {
      type: 'srcdoc',
      content: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #070913; overflow: hidden; font-family: monospace; color: #fff; }
  canvas { display: block; width: 100vw; height: 100vh; }
  #ui { position: absolute; top: 16px; left: 16px; pointer-events: none; }
  .score { font-size: 26px; font-weight: bold; color: #00f0ff; text-shadow: 0 0 10px rgba(0,240,255,0.7); }
  .sub { font-size: 13px; color: #94a3b8; margin-top: 4px; }
  #overlay { position: absolute; inset: 0; background: rgba(7,9,19,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
  h1 { font-size: 38px; color: #00f0ff; margin-bottom: 8px; text-shadow: 0 0 16px rgba(0,240,255,0.6); }
  p { color: #cbd5e1; margin-bottom: 24px; font-size: 14px; text-align: center; max-width: 320px; line-height: 1.5; }
  button { pointer-events: auto; background: #00f0ff; color: #070913; border: none; padding: 12px 32px; font-size: 16px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: transform 0.1s, box-shadow 0.2s; box-shadow: 0 0 15px rgba(0,240,255,0.4); }
  button:hover { transform: scale(1.05); box-shadow: 0 0 25px rgba(0,240,255,0.8); }
</style>
</head>
<body>
<div id="ui">
  <div class="score">DISTANCE: <span id="distVal">0</span>m</div>
  <div class="sub">SPEED: <span id="spdVal">100</span>% | BEST: <span id="bestVal">0</span>m</div>
</div>
<div id="overlay">
  <h1 id="ovTitle">SLOPE 3D</h1>
  <p id="ovDesc">Steer the sphere through the neon hyperspace corridor. Avoid obstacles and don't fall off!</p>
  <button id="startBtn">START RUN</button>
</div>
<canvas id="c"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let w, h;
function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let state = 'menu'; // menu, playing, dead
let distance = 0, speed = 1, best = localStorage.getItem('slope_best') || 0;
document.getElementById('bestVal').innerText = best;

let ball = { x: 0, y: 0, z: 0, vx: 0, vy: 0, r: 18, jumping: false };
let segments = [];
let keys = {};
let particles = [];

window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if(e.code === 'Space' && state === 'playing' && !ball.jumping) {
    ball.vy = 9;
    ball.jumping = true;
  }
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function initTrack() {
  segments = [];
  distance = 0;
  speed = 1.2;
  ball = { x: 0, y: 0, z: 0, vx: 0, vy: 0, r: 18, jumping: false };
  particles = [];
  for (let i = 0; i < 45; i++) {
    addSegment(i * 40);
  }
}

function addSegment(z) {
  let hasObstacle = z > 200 && Math.random() < 0.45;
  let obsX = (Math.random() - 0.5) * 160;
  segments.push({
    z: z,
    w: 240 + Math.sin(z * 0.01) * 30,
    hasObs: hasObstacle,
    obsX: obsX,
    obsW: 40 + Math.random() * 30
  });
}

function start() {
  initTrack();
  state = 'playing';
  document.getElementById('overlay').style.display = 'none';
}

document.getElementById('startBtn').addEventListener('click', start);

function die() {
  state = 'dead';
  if (distance > best) {
    best = Math.floor(distance);
    localStorage.setItem('slope_best', best);
    document.getElementById('bestVal').innerText = best;
  }
  document.getElementById('ovTitle').innerText = 'CRASHED!';
  document.getElementById('ovDesc').innerText = 'Distance: ' + Math.floor(distance) + 'm\\nBest: ' + best + 'm';
  document.getElementById('startBtn').innerText = 'RETRY';
  document.getElementById('overlay').style.display = 'flex';
}

let lastTime = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  if (dt > 0.1) dt = 0.1;

  ctx.fillStyle = '#070913';
  ctx.fillRect(0, 0, w, h);

  if (state === 'playing') {
    let move = 0;
    if (keys['ArrowLeft'] || keys['KeyA']) move -= 1;
    if (keys['ArrowRight'] || keys['KeyD']) move += 1;
    ball.vx += move * 600 * dt;
    ball.vx *= 0.86;
    ball.x += ball.vx * dt;

    if (ball.jumping) {
      ball.y += ball.vy;
      ball.vy -= 22 * dt;
      if (ball.y <= 0) {
        ball.y = 0;
        ball.jumping = false;
        ball.vy = 0;
      }
    }

    let advance = speed * 280 * dt;
    distance += advance * 0.1;
    speed += dt * 0.015;

    document.getElementById('distVal').innerText = Math.floor(distance);
    document.getElementById('spdVal').innerText = Math.floor(speed * 100);

    for (let s of segments) {
      s.z -= advance;
    }

    while (segments[0] && segments[0].z < -40) {
      segments.shift();
      let lastZ = segments[segments.length - 1].z;
      addSegment(lastZ + 40);
    }

    let curSeg = segments.find(s => s.z >= -10 && s.z <= 30);
    if (curSeg) {
      if (Math.abs(ball.x) > curSeg.w / 2) {
        die();
      }
      if (curSeg.hasObs && ball.y < 20) {
        if (Math.abs(ball.x - curSeg.obsX) < curSeg.obsW / 2 + 10) {
          die();
        }
      }
    }
  }

  // Draw 3D track
  let cx = w / 2;
  let cy = h / 2 + 50;
  let fov = 350;

  for (let i = segments.length - 1; i >= 0; i--) {
    let s = segments[i];
    if (s.z <= 0) continue;
    let scale = fov / (s.z + fov);
    let sx = cx;
    let sy = cy + 120 * scale;
    let sw = s.w * scale;

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = Math.max(1, 2.5 * scale);
    ctx.beginPath();
    ctx.moveTo(sx - sw / 2, sy);
    ctx.lineTo(sx + sw / 2, sy);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 240, 255, 0.03)';
    ctx.fillRect(sx - sw / 2, sy, sw, 8 * scale);

    if (s.hasObs) {
      let ox = cx + s.obsX * scale;
      let ow = s.obsW * scale;
      let oh = 40 * scale;
      ctx.fillStyle = '#ff0055';
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 10;
      ctx.fillRect(ox - ow / 2, sy - oh, ow, oh);
      ctx.shadowBlur = 0;
    }
  }

  // Draw player sphere
  let pScale = fov / (0 + fov);
  let px = cx + ball.x * pScale;
  let py = cy + 120 * pScale - ball.y * pScale - ball.r;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(px, cy + 120 * pScale, ball.r * 0.9, ball.r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glow
  let grad = ctx.createRadialGradient(px - 4, py - 4, 2, px, py, ball.r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.3, '#38bdf8');
  grad.addColorStop(1, '#0284c7');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(px, py, ball.r, 0, Math.PI * 2);
  ctx.fill();
}
requestAnimationFrame(loop);
</script>
</body>
</html>`
    }
  },
  {
    id: 'retro-snake',
    title: 'Cyber Snake: Neon Grid',
    category: 'Arcade',
    description: 'Ultra-crisp 60fps classic snake reimagined with vibrant neon graphics, multi-tier bonus orbs, speed upgrades, and audio feedback.',
    controls: 'Arrow Keys or WASD to turn, Space to pause, Swipe on touch',
    instructions: [
      'Navigate the neon serpent to collect energy pellets (+10 pts)',
      'Grab golden flash cores (+50 pts) before they vanish',
      'Avoid running into walls or biting your own tail',
      'Toggle wall wrapping mode or speed boost in the options'
    ],
    tags: ['Retro', 'Arcade', 'Classic', 'Casual'],
    rating: 4.8,
    plays: '142.9K',
    badge: 'CLASSIC',
    aspectRatio: '1:1',
    themeColor: '#10b981',
    iconName: 'Play',
    iframe: {
      type: 'srcdoc',
      content: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #060b0e; color: #ecfdf5; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #header { display: flex; justify-content: space-between; width: 440px; max-width: 95vw; margin-bottom: 8px; font-size: 15px; font-weight: bold; }
  .stat { color: #10b981; text-shadow: 0 0 8px rgba(16,185,129,0.5); }
  #board { width: 440px; height: 440px; max-width: 95vw; max-height: 95vw; background: #091319; border: 2px solid #059669; border-radius: 8px; position: relative; box-shadow: 0 0 20px rgba(5,150,105,0.25); }
  canvas { display: block; width: 100%; height: 100%; border-radius: 6px; }
  #overlay { position: absolute; inset: 0; background: rgba(6,11,14,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 6px; }
  h2 { font-size: 28px; color: #34d399; margin-bottom: 8px; }
  p { color: #94a3b8; font-size: 13px; margin-bottom: 16px; }
  button { background: #10b981; color: #022c22; border: none; padding: 10px 24px; font-size: 15px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: transform 0.1s; }
  button:hover { transform: scale(1.05); }
  .controls-bar { margin-top: 10px; display: flex; gap: 8px; }
  .c-btn { background: #1e293b; color: #fff; border: 1px solid #334155; padding: 8px 16px; border-radius: 4px; font-size: 14px; cursor: pointer; }
</style>
</head>
<body>
<div id="header">
  <div>SCORE: <span id="score" class="stat">0</span></div>
  <div>BEST: <span id="best" class="stat">0</span></div>
  <div>SPEED: <span id="speed" class="stat">NORMAL</span></div>
</div>
<div id="board">
  <canvas id="c" width="440" height="440"></canvas>
  <div id="overlay">
    <h2 id="ovTitle">CYBER SNAKE</h2>
    <p id="ovDesc">Use WASD or Arrow Keys to control direction.</p>
    <button id="startBtn">PLAY GAME</button>
  </div>
</div>
<div class="controls-bar">
  <button class="c-btn" id="wrapBtn">WALLS: SOLID</button>
  <button class="c-btn" id="spdBtn">SPEED: FAST</button>
</div>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
const GRID = 20;
const TILE = 440 / GRID;

let snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
let dir = {x: 1, y: 0};
let nextDir = {x: 1, y: 0};
let food = {x: 15, y: 10};
let goldenFood = null;
let goldenTimer = 0;
let score = 0;
let best = localStorage.getItem('snake_best') || 0;
document.getElementById('best').innerText = best;

let wrapMode = false;
let gameSpeed = 90; // ms
let running = false;
let gameLoopId = null;

// Audio synth
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function beep(freq, duration = 0.08) {
  try {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.frequency.value = freq;
    osc.type = 'triangle';
    g.gain.setValueAtTime(0.08, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch(e){}
}

function spawnFood() {
  while (true) {
    let fx = Math.floor(Math.random() * GRID);
    let fy = Math.floor(Math.random() * GRID);
    let collision = snake.some(s => s.x === fx && s.y === fy);
    if (!collision) {
      food = {x: fx, y: fy};
      break;
    }
  }
  if (Math.random() < 0.35 && !goldenFood) {
    goldenFood = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
      timer: 80
    };
  }
}

window.addEventListener('keydown', e => {
  if (['ArrowUp','KeyW'].includes(e.code) && dir.y === 0) nextDir = {x: 0, y: -1};
  if (['ArrowDown','KeyS'].includes(e.code) && dir.y === 0) nextDir = {x: 0, y: 1};
  if (['ArrowLeft','KeyA'].includes(e.code) && dir.x === 0) nextDir = {x: -1, y: 0};
  if (['ArrowRight','KeyD'].includes(e.code) && dir.x === 0) nextDir = {x: 1, y: 0};
  if (e.code === 'Space' && !running) startGame();
});

document.getElementById('wrapBtn').addEventListener('click', () => {
  wrapMode = !wrapMode;
  document.getElementById('wrapBtn').innerText = wrapMode ? 'WALLS: WRAP' : 'WALLS: SOLID';
});

document.getElementById('spdBtn').addEventListener('click', () => {
  if (gameSpeed === 90) {
    gameSpeed = 65;
    document.getElementById('spdBtn').innerText = 'SPEED: TURBO';
    document.getElementById('speed').innerText = 'TURBO';
  } else if (gameSpeed === 65) {
    gameSpeed = 120;
    document.getElementById('spdBtn').innerText = 'SPEED: CHILL';
    document.getElementById('speed').innerText = 'CHILL';
  } else {
    gameSpeed = 90;
    document.getElementById('spdBtn').innerText = 'SPEED: FAST';
    document.getElementById('speed').innerText = 'FAST';
  }
});

function startGame() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
  dir = {x: 1, y: 0};
  nextDir = {x: 1, y: 0};
  score = 0;
  document.getElementById('score').innerText = score;
  goldenFood = null;
  spawnFood();
  running = true;
  document.getElementById('overlay').style.display = 'none';
  if (gameLoopId) clearInterval(gameLoopId);
  gameLoopId = setInterval(tick, gameSpeed);
}

document.getElementById('startBtn').addEventListener('click', startGame);

function gameOver() {
  running = false;
  clearInterval(gameLoopId);
  beep(140, 0.3);
  if (score > best) {
    best = score;
    localStorage.setItem('snake_best', best);
    document.getElementById('best').innerText = best;
  }
  document.getElementById('ovTitle').innerText = 'GAME OVER';
  document.getElementById('ovDesc').innerText = 'Final Score: ' + score + ' | Best: ' + best;
  document.getElementById('startBtn').innerText = 'PLAY AGAIN';
  document.getElementById('overlay').style.display = 'flex';
}

function tick() {
  dir = nextDir;
  let head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

  if (wrapMode) {
    if (head.x < 0) head.x = GRID - 1;
    if (head.x >= GRID) head.x = 0;
    if (head.y < 0) head.y = GRID - 1;
    if (head.y >= GRID) head.y = 0;
  } else {
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      gameOver();
      return;
    }
  }

  for (let s of snake) {
    if (s.x === head.x && s.y === head.y) {
      gameOver();
      return;
    }
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    document.getElementById('score').innerText = score;
    beep(520, 0.08);
    spawnFood();
  } else if (goldenFood && head.x === goldenFood.x && head.y === goldenFood.y) {
    score += 50;
    document.getElementById('score').innerText = score;
    beep(780, 0.15);
    goldenFood = null;
  } else {
    snake.pop();
  }

  if (goldenFood) {
    goldenFood.timer--;
    if (goldenFood.timer <= 0) goldenFood = null;
  }

  render();
}

function render() {
  ctx.fillStyle = '#091319';
  ctx.fillRect(0, 0, 440, 440);

  // Grid subtle dots
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      ctx.fillRect(x * TILE + TILE / 2 - 1, y * TILE + TILE / 2 - 1, 2, 2);
    }
  }

  // Draw food
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(food.x * TILE + TILE / 2, food.y * TILE + TILE / 2, TILE * 0.38, 0, Math.PI * 2);
  ctx.fill();

  // Golden food
  if (goldenFood) {
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(goldenFood.x * TILE + TILE / 2, goldenFood.y * TILE + TILE / 2, TILE * 0.44, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Snake
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? '#34d399' : '#10b981';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = i === 0 ? 8 : 2;
    ctx.beginPath();
    let pad = 2;
    ctx.roundRect(s.x * TILE + pad, s.y * TILE + pad, TILE - pad * 2, TILE - pad * 2, 4);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
}
render();
</script>
</body>
</html>`
    }
  },
  {
    id: 'puzzle-2048',
    title: '2048: Master Grid',
    category: 'Puzzle',
    description: 'The addictive, beloved sliding block puzzle. Combine equal tiles to reach 2048 and beyond. Features instant undo and best score saving.',
    controls: 'Arrow Keys or WASD to slide tiles, U to Undo',
    instructions: [
      'Slide the grid using Arrow Keys or WASD',
      'When two tiles with the same number touch, they merge into one (2 + 2 = 4)',
      'Reach tile 2048 to triumph, then keep going for record scores',
      'Use the Undo button if you make an accidental move'
    ],
    tags: ['Puzzle', 'Math', 'Brain', 'Addictive'],
    rating: 4.9,
    plays: '221.7K',
    badge: 'POPULAR',
    aspectRatio: '1:1',
    themeColor: '#f59e0b',
    iconName: 'Grid',
    iframe: {
      type: 'srcdoc',
      content: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  .header { width: 380px; max-width: 92vw; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .title { font-size: 32px; font-weight: 800; color: #f59e0b; letter-spacing: -1px; }
  .scores { display: flex; gap: 8px; }
  .box { background: #1e293b; padding: 6px 12px; border-radius: 6px; text-align: center; border: 1px solid #334155; }
  .box-label { font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
  .box-val { font-size: 16px; font-weight: 700; color: #fff; }
  #board { width: 380px; height: 380px; max-width: 92vw; max-height: 92vw; background: #1e293b; border-radius: 10px; padding: 10px; display: grid; grid-template-columns: repeat(4, 1fr); grid-gap: 10px; position: relative; border: 1px solid #334155; }
  .cell { background: #0f172a; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; transition: transform 0.1s, background-color 0.15s; }
  .c-2 { background: #334155; color: #f8fafc; }
  .c-4 { background: #475569; color: #f8fafc; }
  .c-8 { background: #f97316; color: #fff; }
  .c-16 { background: #ea580c; color: #fff; }
  .c-32 { background: #ef4444; color: #fff; }
  .c-64 { background: #dc2626; color: #fff; }
  .c-128 { background: #eab308; color: #fff; box-shadow: 0 0 10px #eab308; }
  .c-256 { background: #ca8a04; color: #fff; box-shadow: 0 0 12px #ca8a04; }
  .c-512 { background: #10b981; color: #fff; box-shadow: 0 0 14px #10b981; }
  .c-1024 { background: #06b6d4; color: #fff; box-shadow: 0 0 16px #06b6d4; font-size: 20px; }
  .c-2048 { background: #8b5cf6; color: #fff; box-shadow: 0 0 20px #8b5cf6; font-size: 18px; }
  .actions { width: 380px; max-width: 92vw; display: flex; justify-content: space-between; margin-top: 12px; }
  button { background: #334155; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
  button:hover { background: #475569; }
  #ov { position: absolute; inset: 0; background: rgba(15,23,42,0.92); border-radius: 10px; display: none; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
  #ov h2 { font-size: 32px; color: #f59e0b; margin-bottom: 8px; }
  #ov p { color: #94a3b8; margin-bottom: 16px; font-size: 14px; }
</style>
</head>
<body>
<div class="header">
  <div class="title">2048</div>
  <div class="scores">
    <div class="box"><div class="box-label">SCORE</div><div class="box-val" id="score">0</div></div>
    <div class="box"><div class="box-label">BEST</div><div class="box-val" id="best">0</div></div>
  </div>
</div>
<div id="board">
  <div id="ov">
    <h2 id="ovTitle">GAME OVER</h2>
    <p id="ovDesc">No more moves possible!</p>
    <button id="ovBtn">TRY AGAIN</button>
  </div>
</div>
<div class="actions">
  <button id="undoBtn">UNDO MOVE</button>
  <button id="resetBtn">NEW GAME</button>
</div>
<script>
let grid = Array(16).fill(0);
let score = 0;
let best = localStorage.getItem('2048_best') || 0;
document.getElementById('best').innerText = best;
let prevGrid = null;
let prevScore = 0;

function spawn() {
  let empty = [];
  grid.forEach((v, i) => { if(v === 0) empty.push(i); });
  if (empty.length > 0) {
    let idx = empty[Math.floor(Math.random() * empty.length)];
    grid[idx] = Math.random() < 0.9 ? 2 : 4;
  }
}

function init() {
  grid = Array(16).fill(0);
  score = 0;
  spawn();
  spawn();
  render();
  document.getElementById('ov').style.display = 'none';
}

function render() {
  const b = document.getElementById('board');
  const ov = document.getElementById('ov');
  b.innerHTML = '';
  b.appendChild(ov);
  grid.forEach(val => {
    let el = document.createElement('div');
    el.className = 'cell' + (val > 0 ? ' c-' + val : '');
    el.innerText = val > 0 ? val : '';
    b.appendChild(el);
  });
  document.getElementById('score').innerText = score;
  if (score > best) {
    best = score;
    localStorage.setItem('2048_best', best);
    document.getElementById('best').innerText = best;
  }
}

function slideRow(row) {
  let filtered = row.filter(x => x !== 0);
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      score += filtered[i];
      filtered[i + 1] = 0;
    }
  }
  filtered = filtered.filter(x => x !== 0);
  while (filtered.length < 4) filtered.push(0);
  return filtered;
}

function move(dir) {
  let saved = [...grid];
  let savedScore = score;
  let changed = false;

  if (dir === 'left') {
    for (let r = 0; r < 4; r++) {
      let row = [grid[r*4], grid[r*4+1], grid[r*4+2], grid[r*4+3]];
      let res = slideRow(row);
      for (let c = 0; c < 4; c++) {
        if (grid[r*4+c] !== res[c]) changed = true;
        grid[r*4+c] = res[c];
      }
    }
  } else if (dir === 'right') {
    for (let r = 0; r < 4; r++) {
      let row = [grid[r*4+3], grid[r*4+2], grid[r*4+1], grid[r*4]];
      let res = slideRow(row);
      for (let c = 0; c < 4; c++) {
        if (grid[r*4+3-c] !== res[c]) changed = true;
        grid[r*4+3-c] = res[c];
      }
    }
  } else if (dir === 'up') {
    for (let c = 0; c < 4; c++) {
      let col = [grid[c], grid[c+4], grid[c+8], grid[c+12]];
      let res = slideRow(col);
      for (let r = 0; r < 4; r++) {
        if (grid[r*4+c] !== res[r]) changed = true;
        grid[r*4+c] = res[r];
      }
    }
  } else if (dir === 'down') {
    for (let c = 0; c < 4; c++) {
      let col = [grid[c+12], grid[c+8], grid[c+4], grid[c]];
      let res = slideRow(col);
      for (let r = 0; r < 4; r++) {
        if (grid[(3-r)*4+c] !== res[r]) changed = true;
        grid[(3-r)*4+c] = res[r];
      }
    }
  }

  if (changed) {
    prevGrid = saved;
    prevScore = savedScore;
    spawn();
    render();
    checkState();
  }
}

function checkState() {
  if (grid.includes(2048) && !window.wonAlerted) {
    window.wonAlerted = true;
    document.getElementById('ovTitle').innerText = 'YOU REACHED 2048!';
    document.getElementById('ovDesc').innerText = 'Epic victory! You can continue playing for higher scores.';
    document.getElementById('ovBtn').innerText = 'KEEP GOING';
    document.getElementById('ov').style.display = 'flex';
    return;
  }
  // Check if moves left
  if (!grid.includes(0)) {
    let moves = false;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        let v = grid[r*4+c];
        if (c < 3 && v === grid[r*4+c+1]) moves = true;
        if (r < 3 && v === grid[(r+1)*4+c]) moves = true;
      }
    }
    if (!moves) {
      document.getElementById('ovTitle').innerText = 'GAME OVER';
      document.getElementById('ovDesc').innerText = 'Score: ' + score;
      document.getElementById('ovBtn').innerText = 'TRY AGAIN';
      document.getElementById('ov').style.display = 'flex';
    }
  }
}

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a') move('left');
  if (e.key === 'ArrowRight' || e.key === 'd') move('right');
  if (e.key === 'ArrowUp' || e.key === 'w') move('up');
  if (e.key === 'ArrowDown' || e.key === 's') move('down');
  if (e.key === 'u' || e.key === 'U') undo();
});

function undo() {
  if (prevGrid) {
    grid = [...prevGrid];
    score = prevScore;
    prevGrid = null;
    render();
  }
}

document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('resetBtn').addEventListener('click', init);
document.getElementById('ovBtn').addEventListener('click', () => {
  if (document.getElementById('ovTitle').innerText.includes('2048')) {
    document.getElementById('ov').style.display = 'none';
  } else {
    init();
  }
});

init();
</script>
</body>
</html>`
    }
  },
  {
    id: 'brick-breaker',
    title: 'Breakout: Laser Paddle',
    category: 'Arcade',
    description: 'Dynamic brick breaker with physics reflections, multi-colored brick tiers, laser cannons, and multi-ball powerups.',
    controls: 'Mouse or Left/Right arrows to move paddle, Space to launch',
    instructions: [
      'Control the paddle to bounce the energy orb and smash bricks',
      'Catch falling capsules for multiball, wider paddle, or laser blasts',
      'Angle of paddle impact determines the ball trajectory deflection',
      'Clear all bricks to advance to higher speed rounds'
    ],
    tags: ['Retro', 'Arcade', 'Physics', 'Action'],
    rating: 4.8,
    plays: '115.3K',
    badge: 'TRENDING',
    aspectRatio: '16:9',
    themeColor: '#ec4899',
    iconName: 'Play',
    iframe: {
      type: 'srcdoc',
      content: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #0c0a09; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #top { width: 560px; max-width: 95vw; display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; font-weight: bold; }
  .pink { color: #f43f5e; text-shadow: 0 0 8px rgba(244,63,94,0.6); }
  #stage { width: 560px; height: 380px; max-width: 95vw; background: #1c1917; border: 2px solid #e11d48; border-radius: 8px; position: relative; box-shadow: 0 0 20px rgba(225,29,72,0.25); cursor: none; }
  canvas { display: block; width: 100%; height: 100%; border-radius: 6px; }
  #ov { position: absolute; inset: 0; background: rgba(12,10,9,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 6px; }
  h2 { font-size: 28px; color: #fb7185; margin-bottom: 8px; }
  p { color: #cbd5e1; font-size: 13px; margin-bottom: 16px; }
  button { background: #f43f5e; color: #fff; border: none; padding: 10px 24px; font-size: 15px; font-weight: bold; border-radius: 6px; cursor: pointer; }
</style>
</head>
<body>
<div id="top">
  <div>SCORE: <span id="sc" class="pink">0</span></div>
  <div>LIVES: <span id="lv" class="pink">❤❤❤</span></div>
  <div>ROUND: <span id="rd" class="pink">1</span></div>
</div>
<div id="stage">
  <canvas id="c" width="560" height="380"></canvas>
  <div id="ov">
    <h2 id="ovTitle">LASER BREAKOUT</h2>
    <p id="ovDesc">Move mouse or arrow keys to aim paddle.</p>
    <button id="btn">START GAME</button>
  </div>
</div>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
let score = 0, lives = 3, round = 1;
let paddle = { x: 230, w: 90, h: 12, speed: 8 };
let balls = [{ x: 280, y: 340, vx: 3.5, vy: -4, r: 6, stuck: true }];
let bricks = [];
let powerups = [];
let running = false;
let keys = {};

function initBricks() {
  bricks = [];
  const rows = 5, cols = 8;
  const bw = 58, bh = 18, pad = 8, topOffset = 30, leftOffset = 20;
  const colors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8'];
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      bricks.push({
        x: leftOffset + col * (bw + pad),
        y: topOffset + r * (bh + pad),
        w: bw, h: bh,
        color: colors[r],
        hp: r === 0 ? 2 : 1
      });
    }
  }
}

window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Space' && balls[0] && balls[0].stuck) balls[0].stuck = false;
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

c.addEventListener('mousemove', e => {
  const rect = c.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (c.width / rect.width);
  paddle.x = Math.max(0, Math.min(c.width - paddle.w, mx - paddle.w / 2));
  if (balls[0] && balls[0].stuck) balls[0].x = paddle.x + paddle.w / 2;
});

c.addEventListener('click', () => {
  if (balls[0] && balls[0].stuck) balls[0].stuck = false;
});

function start() {
  score = 0; lives = 3; round = 1;
  document.getElementById('sc').innerText = score;
  document.getElementById('lv').innerText = '❤❤❤';
  document.getElementById('rd').innerText = round;
  paddle.w = 90;
  balls = [{ x: 280, y: 340, vx: 3.5, vy: -4, r: 6, stuck: true }];
  powerups = [];
  initBricks();
  running = true;
  document.getElementById('ov').style.display = 'none';
}

document.getElementById('btn').addEventListener('click', start);

function loop() {
  requestAnimationFrame(loop);
  if (!running) return;

  if (keys['ArrowLeft'] || keys['KeyA']) {
    paddle.x = Math.max(0, paddle.x - paddle.speed);
    if (balls[0] && balls[0].stuck) balls[0].x = paddle.x + paddle.w / 2;
  }
  if (keys['ArrowRight'] || keys['KeyD']) {
    paddle.x = Math.min(c.width - paddle.w, paddle.x + paddle.speed);
    if (balls[0] && balls[0].stuck) balls[0].x = paddle.x + paddle.w / 2;
  }

  // Update balls
  balls.forEach((b, idx) => {
    if (b.stuck) {
      b.x = paddle.x + paddle.w / 2;
      return;
    }
    b.x += b.vx;
    b.y += b.vy;

    // Wall collision
    if (b.x - b.r < 0) { b.x = b.r; b.vx *= -1; }
    if (b.x + b.r > c.width) { b.x = c.width - b.r; b.vx *= -1; }
    if (b.y - b.r < 0) { b.y = b.r; b.vy *= -1; }

    // Paddle collision
    if (b.y + b.r >= 355 && b.y - b.r <= 367 && b.x >= paddle.x && b.x <= paddle.x + paddle.w) {
      b.vy = -Math.abs(b.vy);
      let hitDiff = (b.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      b.vx = hitDiff * 6;
      b.y = 355 - b.r;
    }

    // Brick collision
    for (let i = bricks.length - 1; i >= 0; i--) {
      let br = bricks[i];
      if (b.x + b.r > br.x && b.x - b.r < br.x + br.w && b.y + b.r > br.y && b.y - b.r < br.y + br.h) {
        b.vy *= -1;
        br.hp--;
        score += 20;
        document.getElementById('sc').innerText = score;
        if (br.hp <= 0) {
          if (Math.random() < 0.25) {
            powerups.push({ x: br.x + br.w/2, y: br.y, type: Math.random() < 0.5 ? 'wide' : 'multi' });
          }
          bricks.splice(i, 1);
        }
        break;
      }
    }
  });

  // Check dead balls
  balls = balls.filter(b => b.y - b.r < c.height);
  if (balls.length === 0) {
    lives--;
    let h = '';
    for(let i=0; i<lives; i++) h += '❤';
    document.getElementById('lv').innerText = h || 'NONE';
    if (lives <= 0) {
      running = false;
      document.getElementById('ovTitle').innerText = 'GAME OVER';
      document.getElementById('ovDesc').innerText = 'Final Score: ' + score;
      document.getElementById('ov').style.display = 'flex';
      return;
    } else {
      balls = [{ x: paddle.x + paddle.w / 2, y: 340, vx: 3.5, vy: -4, r: 6, stuck: true }];
    }
  }

  // Next round
  if (bricks.length === 0) {
    round++;
    document.getElementById('rd').innerText = round;
    initBricks();
    balls = [{ x: paddle.x + paddle.w / 2, y: 340, vx: 4, vy: -4.5, r: 6, stuck: true }];
  }

  // Update powerups
  powerups.forEach((p, idx) => {
    p.y += 2.5;
    if (p.y > 355 && p.y < 370 && p.x > paddle.x && p.x < paddle.x + paddle.w) {
      if (p.type === 'wide') {
        paddle.w = Math.min(160, paddle.w + 25);
      } else {
        if (balls[0]) {
          balls.push({ x: balls[0].x, y: balls[0].y, vx: -3, vy: -4, r: 6, stuck: false });
          balls.push({ x: balls[0].x, y: balls[0].y, vx: 3, vy: -4, r: 6, stuck: false });
        }
      }
      powerups.splice(idx, 1);
    }
  });

  // Render
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, 0, c.width, c.height);

  // Bricks
  bricks.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.w, b.h, 3);
    ctx.fill();
  });

  // Paddle
  ctx.fillStyle = '#f43f5e';
  ctx.shadowColor = '#f43f5e';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.roundRect(paddle.x, 355, paddle.w, paddle.h, 4);
  ctx.fill();

  // Balls
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#fff';
  ctx.shadowBlur = 10;
  balls.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Powerups
  powerups.forEach(p => {
    ctx.fillStyle = p.type === 'wide' ? '#38bdf8' : '#a855f7';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
}
requestAnimationFrame(loop);
</script>
</body>
</html>`
    }
  },
  {
    id: 'flappy-drone',
    title: 'Flappy Drone: Cyber Gate',
    category: 'Action',
    description: 'Pilot an autonomous micro-drone through hazardous plasma gates. Fine-tune your thruster bursts for maximum distance and unlock medals.',
    controls: 'Spacebar, Left Click, or Tap to fire thrusters',
    instructions: [
      'Tap Space or click anywhere to propel drone upward',
      'Gravity pulls downward - time bursts carefully to pass between plasma pylons',
      'Collect 1 point for every gate successfully traversed',
      'Earn Bronze (10), Silver (25), Gold (50), and Cyber Elite (100) badges'
    ],
    tags: ['Physics', 'Timing', 'Casual', 'One-Button'],
    rating: 4.7,
    plays: '163.4K',
    badge: 'HOT',
    aspectRatio: '4:3',
    themeColor: '#3b82f6',
    iconName: 'Play',
    iframe: {
      type: 'srcdoc',
      content: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #030712; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #stage { width: 400px; height: 500px; max-width: 95vw; background: #0b0f19; border: 2px solid #3b82f6; border-radius: 8px; position: relative; box-shadow: 0 0 20px rgba(59,130,246,0.3); }
  canvas { display: block; width: 100%; height: 100%; border-radius: 6px; }
  #hud { position: absolute; top: 16px; width: 100%; display: flex; justify-content: center; pointer-events: none; }
  .score { font-size: 36px; font-weight: 800; color: #60a5fa; text-shadow: 0 0 12px rgba(96,165,250,0.8); }
  #ov { position: absolute; inset: 0; background: rgba(3,7,18,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 6px; }
  h2 { font-size: 30px; color: #60a5fa; margin-bottom: 8px; }
  p { color: #94a3b8; font-size: 13px; margin-bottom: 20px; text-align: center; }
  button { background: #3b82f6; color: #fff; border: none; padding: 10px 28px; font-size: 16px; font-weight: bold; border-radius: 6px; cursor: pointer; }
</style>
</head>
<body>
<div id="stage">
  <div id="hud"><span class="score" id="sc">0</span></div>
  <canvas id="c" width="400" height="500"></canvas>
  <div id="ov">
    <h2 id="ovTitle">FLAPPY DRONE</h2>
    <p id="ovDesc">Click or press Spacebar to flap thrusters.</p>
    <button id="btn">LAUNCH DRONE</button>
  </div>
</div>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
let drone = { y: 220, vy: 0, r: 12 };
let pipes = [];
let score = 0, best = localStorage.getItem('drone_best') || 0;
let running = false;
let frame = 0;

function flap() {
  if (!running) return;
  drone.vy = -6.5;
}

window.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); flap(); }
});
c.addEventListener('pointerdown', flap);

function reset() {
  drone = { y: 220, vy: 0, r: 12 };
  pipes = [];
  score = 0;
  frame = 0;
  document.getElementById('sc').innerText = score;
  running = true;
  document.getElementById('ov').style.display = 'none';
}

document.getElementById('btn').addEventListener('click', reset);

function die() {
  running = false;
  if (score > best) {
    best = score;
    localStorage.setItem('drone_best', best);
  }
  document.getElementById('ovTitle').innerText = 'SYSTEM OVERLOAD';
  document.getElementById('ovDesc').innerText = 'Score: ' + score + ' | Best: ' + best;
  document.getElementById('btn').innerText = 'RELAUNCH';
  document.getElementById('ov').style.display = 'flex';
}

function loop() {
  requestAnimationFrame(loop);
  if (!running) return;
  frame++;

  drone.vy += 0.32;
  drone.y += drone.vy;

  if (drone.y + drone.r >= c.height || drone.y - drone.r <= 0) {
    die();
    return;
  }

  if (frame % 85 === 0) {
    let gap = 110;
    let topH = 60 + Math.random() * (c.height - gap - 120);
    pipes.push({ x: c.width, top: topH, bot: topH + gap, passed: false });
  }

  for (let i = pipes.length - 1; i >= 0; i--) {
    let p = pipes[i];
    p.x -= 2.6;

    if (!p.passed && p.x + 40 < 80) {
      p.passed = true;
      score++;
      document.getElementById('sc').innerText = score;
    }

    // Collision
    if (80 + drone.r > p.x && 80 - drone.r < p.x + 44) {
      if (drone.y - drone.r < p.top || drone.y + drone.r > p.bot) {
        die();
        return;
      }
    }

    if (p.x < -50) pipes.splice(i, 1);
  }

  // Draw
  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(0, 0, c.width, c.height);

  // Background stars
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for(let i=0; i<15; i++) {
    let sx = (i * 37 + frame * 0.4) % c.width;
    let sy = (i * 47) % c.height;
    ctx.fillRect(sx, sy, 2, 2);
  }

  // Pipes
  pipes.forEach(p => {
    ctx.fillStyle = '#1e3a8a';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    // Top
    ctx.fillRect(p.x, 0, 44, p.top);
    ctx.strokeRect(p.x, 0, 44, p.top);
    // Bottom
    ctx.fillRect(p.x, p.bot, 44, c.height - p.bot);
    ctx.strokeRect(p.x, p.bot, 44, c.height - p.bot);
  });

  // Drone
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(80, drone.y, drone.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(84, drone.y - 2, 6, 4);
  ctx.shadowBlur = 0;
}
requestAnimationFrame(loop);
</script>
</body>
</html>`
    }
  },
  {
    id: 'tetris-blocks',
    title: 'Tetromino: Block Fall',
    category: 'Retro',
    description: 'Authentic classic block dropping game. 7 classic tetromino shapes, ghost piece projection, line clearing animations, and progression speed.',
    controls: 'Left/Right or A/D to move, Up/W to rotate, Space to Hard Drop, Down/S to Soft Drop',
    instructions: [
      'Fit falling blocks into complete horizontal lines to dissolve them',
      'Clear multiple lines at once (Tetris = 4 lines) for massive score bonuses',
      'Use Up arrow or X to rotate pieces, Space for instant hard drop',
      'Stack smartly and keep your grid low to survive increasing speed'
    ],
    tags: ['Retro', 'Classic', 'Blocks', 'Puzzle'],
    rating: 4.9,
    plays: '289.1K',
    badge: 'POPULAR',
    aspectRatio: '1:1',
    themeColor: '#8b5cf6',
    iconName: 'Grid',
    iframe: {
      type: 'srcdoc',
      content: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #09090b; color: #f4f4f5; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #container { display: flex; gap: 16px; align-items: flex-start; }
  #board-wrap { position: relative; border: 2px solid #8b5cf6; border-radius: 6px; box-shadow: 0 0 20px rgba(139,92,246,0.25); }
  canvas { display: block; background: #121218; border-radius: 4px; }
  #sidebar { display: flex; flex-direction: column; gap: 12px; width: 120px; }
  .panel { background: #18181b; border: 1px solid #27272a; border-radius: 6px; padding: 10px; text-align: center; }
  .lbl { font-size: 11px; color: #a1a1aa; margin-bottom: 4px; }
  .val { font-size: 18px; font-weight: bold; color: #a78bfa; }
  #ov { position: absolute; inset: 0; background: rgba(9,9,11,0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 4px; }
  h2 { font-size: 24px; color: #c084fc; margin-bottom: 8px; }
  p { font-size: 12px; color: #a1a1aa; margin-bottom: 16px; }
  button { background: #8b5cf6; color: #fff; border: none; padding: 8px 18px; border-radius: 4px; font-weight: bold; cursor: pointer; }
</style>
</head>
<body>
<div id="container">
  <div id="board-wrap">
    <canvas id="c" width="220" height="440"></canvas>
    <div id="ov">
      <h2 id="ovT">TETROMINO</h2>
      <p id="ovD">Arrow keys / WASD to move & rotate.</p>
      <button id="btn">START GAME</button>
    </div>
  </div>
  <div id="sidebar">
    <div class="panel"><div class="lbl">SCORE</div><div class="val" id="sc">0</div></div>
    <div class="panel"><div class="lbl">LINES</div><div class="val" id="ln">0</div></div>
    <div class="panel"><div class="lbl">LEVEL</div><div class="val" id="lv">1</div></div>
  </div>
</div>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
const COLS = 10, ROWS = 20, TILE = 22;
let grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
let score = 0, lines = 0, level = 1;
let current = null, currentX = 0, currentY = 0;
let dropTimer = 0, dropInterval = 60;
let running = false;

const SHAPES = [
  { c: '#06b6d4', m: [[1,1,1,1]] }, // I
  { c: '#3b82f6', m: [[1,0,0],[1,1,1]] }, // J
  { c: '#f97316', m: [[0,0,1],[1,1,1]] }, // L
  { c: '#eab308', m: [[1,1],[1,1]] }, // O
  { c: '#22c55e', m: [[0,1,1],[1,1,0]] }, // S
  { c: '#a855f7', m: [[0,1,0],[1,1,1]] }, // T
  { c: '#ef4444', m: [[1,1,0],[0,1,1]] }  // Z
];

function spawn() {
  const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  current = { ...s };
  currentX = Math.floor((COLS - current.m[0].length) / 2);
  currentY = 0;
  if (collide(current.m, currentX, currentY)) {
    running = false;
    document.getElementById('ovT').innerText = 'GAME OVER';
    document.getElementById('ovD').innerText = 'Score: ' + score;
    document.getElementById('ov').style.display = 'flex';
  }
}

function collide(m, x, y) {
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[r].length; c++) {
      if (m[r][c]) {
        let nx = x + c, ny = y + r;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && grid[ny][nx]) return true;
      }
    }
  }
  return false;
}

function rotate(m) {
  return m[0].map((_, i) => m.map(row => row[i]).reverse());
}

function merge() {
  current.m.forEach((row, r) => {
    row.forEach((v, c) => {
      if (v) grid[currentY + r][currentX + c] = current.c;
    });
  });
  // Clear lines
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (grid[r].every(cell => cell !== 0)) {
      grid.splice(r, 1);
      grid.unshift(Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (cleared > 0) {
    const pts = [0, 100, 300, 500, 800];
    score += pts[cleared] * level;
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(10, 60 - level * 4);
    document.getElementById('sc').innerText = score;
    document.getElementById('ln').innerText = lines;
    document.getElementById('lv').innerText = level;
  }
  spawn();
}

window.addEventListener('keydown', e => {
  if (!running) return;
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    if (!collide(current.m, currentX - 1, currentY)) currentX--;
  }
  if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    if (!collide(current.m, currentX + 1, currentY)) currentX++;
  }
  if (e.code === 'ArrowUp' || e.code === 'KeyW') {
    const rot = rotate(current.m);
    if (!collide(rot, currentX, currentY)) current.m = rot;
  }
  if (e.code === 'ArrowDown' || e.code === 'KeyS') {
    if (!collide(current.m, currentX, currentY + 1)) {
      currentY++;
      score += 1;
      document.getElementById('sc').innerText = score;
    }
  }
  if (e.code === 'Space') {
    e.preventDefault();
    while (!collide(current.m, currentX, currentY + 1)) {
      currentY++;
      score += 2;
    }
    merge();
  }
});

function reset() {
  grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  score = 0; lines = 0; level = 1; dropInterval = 60;
  document.getElementById('sc').innerText = score;
  document.getElementById('ln').innerText = lines;
  document.getElementById('lv').innerText = level;
  running = true;
  document.getElementById('ov').style.display = 'none';
  spawn();
}

document.getElementById('btn').addEventListener('click', reset);

function loop() {
  requestAnimationFrame(loop);
  if (!running) return;

  dropTimer++;
  if (dropTimer > dropInterval) {
    dropTimer = 0;
    if (!collide(current.m, currentX, currentY + 1)) {
      currentY++;
    } else {
      merge();
    }
  }

  // Draw
  ctx.fillStyle = '#121218';
  ctx.fillRect(0, 0, c.width, c.height);

  // Grid blocks
  for (let r = 0; r < ROWS; r++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[r][col]) {
        ctx.fillStyle = grid[r][col];
        ctx.fillRect(col * TILE, r * TILE, TILE - 1, TILE - 1);
      }
    }
  }

  // Ghost piece
  if (current) {
    let gy = currentY;
    while (!collide(current.m, currentX, gy + 1)) gy++;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    current.m.forEach((row, r) => {
      row.forEach((v, col) => {
        if (v) ctx.fillRect((currentX + col) * TILE, (gy + r) * TILE, TILE - 1, TILE - 1);
      });
    });

    // Active piece
    ctx.fillStyle = current.c;
    ctx.shadowColor = current.c;
    ctx.shadowBlur = 4;
    current.m.forEach((row, r) => {
      row.forEach((v, col) => {
        if (v) ctx.fillRect((currentX + col) * TILE, (currentY + r) * TILE, TILE - 1, TILE - 1);
      });
    });
    ctx.shadowBlur = 0;
  }
}
requestAnimationFrame(loop);
</script>
</body>
</html>`
    }
  },
  {
    id: 'dino-runner',
    title: 'Pixel Dino: Desert Rush',
    category: 'Retro',
    description: 'The iconic endless pixel runner. Leap over prickly cacti and duck beneath swooping pterodactyls in day-and-night desert terrain.',
    controls: 'Space / Up to jump, Down to duck',
    instructions: [
      'Press Space or Up arrow to leap over incoming cacti',
      'Press Down arrow to duck beneath soaring flying pterodactyls',
      'The desert cycles between blazing day and starry night as your score climbs',
      'Speed increases smoothly every 100 meters'
    ],
    tags: ['Retro', 'Offline', 'Runner', 'Pixel Art'],
    rating: 4.8,
    plays: '198.5K',
    badge: 'CLASSIC',
    aspectRatio: '16:9',
    themeColor: '#eab308',
    iconName: 'Play',
    iframe: {
      type: 'srcdoc',
      content: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #111827; color: #f9fafb; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #stage { width: 560px; height: 260px; max-width: 95vw; background: #1f2937; border: 2px solid #eab308; border-radius: 8px; position: relative; box-shadow: 0 0 20px rgba(234,179,8,0.25); }
  canvas { display: block; width: 100%; height: 100%; border-radius: 6px; }
  #hud { position: absolute; top: 12px; right: 16px; font-size: 16px; font-weight: bold; color: #fde047; }
  #ov { position: absolute; inset: 0; background: rgba(17,24,39,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 6px; }
  h2 { font-size: 26px; color: #fde047; margin-bottom: 6px; }
  p { color: #9ca3af; font-size: 13px; margin-bottom: 16px; }
  button { background: #eab308; color: #1f2937; border: none; padding: 8px 24px; font-size: 15px; font-weight: bold; border-radius: 6px; cursor: pointer; }
</style>
</head>
<body>
<div id="stage">
  <div id="hud">HI <span id="hi">0</span> | <span id="sc">0</span></div>
  <canvas id="c" width="560" height="260"></canvas>
  <div id="ov">
    <h2 id="ovT">PIXEL DINO</h2>
    <p id="ovD">Press Space or Up to jump, Down to duck.</p>
    <button id="btn">START SPRINT</button>
  </div>
</div>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
let dino = { y: 200, vy: 0, jumping: false, ducking: false };
let obstacles = [];
let score = 0, best = localStorage.getItem('dino_best') || 0;
document.getElementById('hi').innerText = best;
let speed = 5.5;
let running = false;
let frame = 0;

window.addEventListener('keydown', e => {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && !dino.jumping && running) {
    dino.vy = -10.5;
    dino.jumping = true;
  }
  if (e.code === 'ArrowDown' && running) {
    dino.ducking = true;
  }
});

window.addEventListener('keyup', e => {
  if (e.code === 'ArrowDown') dino.ducking = false;
});

c.addEventListener('pointerdown', () => {
  if (!dino.jumping && running) {
    dino.vy = -10.5;
    dino.jumping = true;
  }
});

function start() {
  dino = { y: 200, vy: 0, jumping: false, ducking: false };
  obstacles = [];
  score = 0;
  speed = 5.5;
  frame = 0;
  running = true;
  document.getElementById('ov').style.display = 'none';
}

document.getElementById('btn').addEventListener('click', start);

function die() {
  running = false;
  if (score > best) {
    best = Math.floor(score);
    localStorage.setItem('dino_best', best);
    document.getElementById('hi').innerText = best;
  }
  document.getElementById('ovT').innerText = 'GAME OVER';
  document.getElementById('ovD').innerText = 'Score: ' + Math.floor(score);
  document.getElementById('ov').style.display = 'flex';
}

function loop() {
  requestAnimationFrame(loop);
  if (!running) return;
  frame++;
  score += 0.15;
  speed += 0.0008;
  document.getElementById('sc').innerText = Math.floor(score);

  if (dino.jumping) {
    dino.y += dino.vy;
    dino.vy += 0.58;
    if (dino.y >= 200) {
      dino.y = 200;
      dino.jumping = false;
      dino.vy = 0;
    }
  }

  // Spawn obstacles
  if (frame % Math.floor(80 + Math.random() * 40) === 0) {
    let isBird = score > 100 && Math.random() < 0.35;
    obstacles.push({
      x: c.width,
      y: isBird ? (Math.random() < 0.5 ? 175 : 155) : 200,
      w: isBird ? 28 : (Math.random() < 0.4 ? 16 : 30),
      h: isBird ? 16 : 28,
      isBird: isBird
    });
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    let o = obstacles[i];
    o.x -= speed;

    // Collision check
    let dw = dino.ducking ? 34 : 24;
    let dh = dino.ducking ? 15 : 28;
    let dy = dino.ducking ? dino.y + 13 : dino.y;
    if (60 + dw > o.x && 60 < o.x + o.w && dy + dh > o.y && dy < o.y + o.h) {
      die();
      return;
    }

    if (o.x < -40) obstacles.splice(i, 1);
  }

  // Render
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(0, 0, c.width, c.height);

  // Ground line
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 228);
  ctx.lineTo(c.width, 228);
  ctx.stroke();

  // Dino
  ctx.fillStyle = '#22c55e';
  if (dino.ducking) {
    ctx.fillRect(60, dino.y + 13, 34, 15);
  } else {
    ctx.fillRect(60, dino.y, 24, 28);
    // Eye
    ctx.fillStyle = '#111827';
    ctx.fillRect(76, dino.y + 4, 4, 4);
  }

  // Obstacles
  obstacles.forEach(o => {
    ctx.fillStyle = o.isBird ? '#38bdf8' : '#eab308';
    ctx.fillRect(o.x, o.y, o.w, o.h);
  });
}
requestAnimationFrame(loop);
</script>
</body>
</html>`
    }
  },
  {
    id: 'minesweeper-classic',
    title: 'Minesweeper: 90s Desktop',
    category: 'Puzzle',
    description: 'The authentic desktop minesweeper. Safe first click, flag toggles, digital clock, mine counter, and the classic responsive smiley face.',
    controls: 'Left Click to reveal cell, Right Click (or F key) to plant flag',
    instructions: [
      'Left-click on any covered tile to uncover it (first click is always safe)',
      'Numbers denote how many explosive mines touch that tile',
      'Right-click (or hold Shift / press F) to plant a warning flag on suspected mines',
      'Uncover every safe cell on the grid to achieve victory'
    ],
    tags: ['Retro', 'Logic', 'Classic', 'Strategy'],
    rating: 4.8,
    plays: '136.2K',
    badge: 'CLASSIC',
    aspectRatio: '1:1',
    themeColor: '#64748b',
    iconName: 'Grid',
    iframe: {
      type: 'srcdoc',
      content: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #0f172a; color: #fff; font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #ms-frame { background: #cbd5e1; padding: 12px; border-radius: 8px; border: 3px solid #94a3b8; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
  #header { background: #1e293b; padding: 8px 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .digits { font-family: monospace; font-size: 24px; font-weight: bold; color: #ef4444; background: #000; padding: 2px 8px; border-radius: 4px; letter-spacing: 2px; }
  #face { font-size: 24px; cursor: pointer; background: #334155; border: 1px solid #475569; border-radius: 4px; padding: 2px 8px; }
  #grid { display: grid; grid-template-columns: repeat(9, 32px); grid-gap: 2px; background: #94a3b8; padding: 4px; border-radius: 4px; }
  .cell { width: 32px; height: 32px; background: #e2e8f0; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: bold; cursor: pointer; box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #94a3b8; }
  .cell.open { background: #f8fafc; box-shadow: inset 1px 1px 0 #cbd5e1; cursor: default; }
  .cell.mine { background: #f87171; }
  .c-1 { color: #2563eb; } .c-2 { color: #16a34a; } .c-3 { color: #dc2626; } .c-4 { color: #7c3aed; }
  .sub-bar { display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: #64748b; font-weight: 600; }
</style>
</head>
<body>
<div id="ms-frame">
  <div id="header">
    <div class="digits" id="minesCount">010</div>
    <div id="face">🙂</div>
    <div class="digits" id="timerCount">000</div>
  </div>
  <div id="grid"></div>
  <div class="sub-bar">
    <span>LEFT CLICK: UNCOVER</span>
    <span>RIGHT CLICK: FLAG</span>
  </div>
</div>
<script>
const ROWS = 9, COLS = 9, MINES = 10;
let grid = [], started = false, over = false, timer = 0, timerId = null;

function init() {
  clearInterval(timerId);
  started = false; over = false; timer = 0;
  document.getElementById('timerCount').innerText = '000';
  document.getElementById('minesCount').innerText = '010';
  document.getElementById('face').innerText = '🙂';

  grid = [];
  const gEl = document.getElementById('grid');
  gEl.innerHTML = '';

  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = { mine: false, open: false, flag: false, count: 0, r, c };
      let d = document.createElement('div');
      d.className = 'cell';
      d.id = 'c_' + r + '_' + c;
      d.addEventListener('click', () => cellClick(r, c));
      d.addEventListener('contextmenu', e => { e.preventDefault(); cellFlag(r, c); });
      gEl.appendChild(d);
    }
  }
}

document.getElementById('face').addEventListener('click', init);

function startBoard(firstR, firstC) {
  let placed = 0;
  while (placed < MINES) {
    let r = Math.floor(Math.random() * ROWS);
    let c = Math.floor(Math.random() * COLS);
    if (!grid[r][c].mine && !(r === firstR && c === firstC)) {
      grid[r][c].mine = true;
      placed++;
    }
  }
  // Counts
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!grid[r][c].mine) {
        let cnt = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            let nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc].mine) cnt++;
          }
        }
        grid[r][c].count = cnt;
      }
    }
  }
  timerId = setInterval(() => {
    timer++;
    document.getElementById('timerCount').innerText = String(Math.min(999, timer)).padStart(3, '0');
  }, 1000);
}

function cellClick(r, c) {
  if (over || grid[r][c].flag || grid[r][c].open) return;
  if (!started) { started = true; startBoard(r, c); }

  const cell = grid[r][c];
  cell.open = true;
  const el = document.getElementById('c_' + r + '_' + c);
  el.classList.add('open');

  if (cell.mine) {
    el.classList.add('mine');
    el.innerText = '💣';
    gameOver(false);
    return;
  }

  if (cell.count > 0) {
    el.innerText = cell.count;
    el.classList.add('c-' + cell.count);
  } else {
    // Reveal neighbors
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        let nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !grid[nr][nc].open) {
          cellClick(nr, nc);
        }
      }
    }
  }
  checkWin();
}

function cellFlag(r, c) {
  if (over || grid[r][c].open) return;
  grid[r][c].flag = !grid[r][c].flag;
  const el = document.getElementById('c_' + r + '_' + c);
  el.innerText = grid[r][c].flag ? '🚩' : '';
  let flagCount = grid.flat().filter(x => x.flag).length;
  document.getElementById('minesCount').innerText = String(Math.max(0, MINES - flagCount)).padStart(3, '0');
}

function checkWin() {
  let safeCells = grid.flat().filter(x => !x.mine);
  if (safeCells.every(x => x.open)) {
    gameOver(true);
  }
}

function gameOver(win) {
  over = true;
  clearInterval(timerId);
  document.getElementById('face').innerText = win ? '😎' : '😵';
  if (!win) {
    grid.flat().forEach(cell => {
      if (cell.mine) {
        let el = document.getElementById('c_' + cell.r + '_' + cell.c);
        el.innerText = '💣';
      }
    });
  }
}

init();
</script>
</body>
</html>`
    }
  },
  {
    id: 'cyber-pong',
    title: 'Cyber Pong: 1P vs AI & 2P',
    category: 'Sports',
    description: 'Neon air hockey / arcade table tennis with curve ball spin, particle sparks, and 1-Player vs AI or local 2-Player battle.',
    controls: 'Player 1: W/S or Mouse. Player 2: Up/Down arrows',
    instructions: [
      'Deflect the neon photon past your opponent to score points',
      'Hit the ball with moving paddle momentum to induce curve spin',
      'Select 1 Player mode to face adaptive AI, or 2 Player mode for keyboard rivalry',
      'First player to reach 7 goals wins the match'
    ],
    tags: ['Sports', 'Arcade', '2-Player', 'Retro'],
    rating: 4.8,
    plays: '112.4K',
    badge: 'HOT',
    aspectRatio: '16:9',
    themeColor: '#06b6d4',
    iconName: 'Play',
    iframe: {
      type: 'srcdoc',
      content: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #030712; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #hud { width: 560px; max-width: 95vw; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .score { font-size: 36px; font-weight: bold; color: #22d3ee; text-shadow: 0 0 12px rgba(34,211,238,0.7); }
  #stage { width: 560px; height: 340px; max-width: 95vw; background: #08111d; border: 2px solid #06b6d4; border-radius: 8px; position: relative; box-shadow: 0 0 20px rgba(6,182,212,0.3); }
  canvas { display: block; width: 100%; height: 100%; border-radius: 6px; }
  #ov { position: absolute; inset: 0; background: rgba(3,7,18,0.88); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 6px; }
  h2 { font-size: 28px; color: #22d3ee; margin-bottom: 8px; }
  p { color: #94a3b8; font-size: 13px; margin-bottom: 16px; }
  .btns { display: flex; gap: 10px; }
  button { background: #06b6d4; color: #08111d; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; }
</style>
</head>
<body>
<div id="hud">
  <div class="score" id="s1">0</div>
  <div style="color:#64748b; font-size:14px;">FIRST TO 7 WINS</div>
  <div class="score" id="s2">0</div>
</div>
<div id="stage">
  <canvas id="c" width="560" height="340"></canvas>
  <div id="ov">
    <h2 id="ovT">CYBER PONG</h2>
    <p id="ovD">Select Game Mode</p>
    <div class="btns">
      <button id="p1Btn">1 PLAYER (VS AI)</button>
      <button id="p2Btn">2 PLAYERS (LOCAL)</button>
    </div>
  </div>
</div>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
let p1 = { y: 130, h: 70, w: 10, vy: 0 };
let p2 = { y: 130, h: 70, w: 10, vy: 0 };
let ball = { x: 280, y: 170, vx: 5, vy: 2, r: 6 };
let s1 = 0, s2 = 0;
let is2Player = false;
let running = false;
let keys = {};

window.addEventListener('keydown', e => { keys[e.code] = true; });
window.addEventListener('keyup', e => { keys[e.code] = false; });

c.addEventListener('mousemove', e => {
  if (!is2Player && running) {
    const rect = c.getBoundingClientRect();
    const my = (e.clientY - rect.top) * (c.height / rect.height);
    p1.y = Math.max(0, Math.min(c.height - p1.h, my - p1.h / 2));
  }
});

function resetBall(servingP1) {
  ball.x = 280;
  ball.y = 170;
  ball.vx = servingP1 ? 5 : -5;
  ball.vy = (Math.random() - 0.5) * 6;
}

function start(twoP) {
  is2Player = twoP;
  s1 = 0; s2 = 0;
  document.getElementById('s1').innerText = 0;
  document.getElementById('s2').innerText = 0;
  resetBall(true);
  running = true;
  document.getElementById('ov').style.display = 'none';
}

document.getElementById('p1Btn').addEventListener('click', () => start(false));
document.getElementById('p2Btn').addEventListener('click', () => start(true));

function loop() {
  requestAnimationFrame(loop);
  if (!running) return;

  // Player 1 controls
  if (keys['KeyW']) p1.y = Math.max(0, p1.y - 6);
  if (keys['KeyS']) p1.y = Math.min(c.height - p1.h, p1.y + 6);

  // Player 2 controls / AI
  if (is2Player) {
    if (keys['ArrowUp']) p2.y = Math.max(0, p2.y - 6);
    if (keys['ArrowDown']) p2.y = Math.min(c.height - p2.h, p2.y + 6);
  } else {
    // Smart AI
    let targetY = ball.y - p2.h / 2;
    p2.y += (targetY - p2.y) * 0.12;
    p2.y = Math.max(0, Math.min(c.height - p2.h, p2.y));
  }

  // Ball move
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall bounce
  if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy *= -1; }
  if (ball.y + ball.r > c.height) { ball.y = c.height - ball.r; ball.vy *= -1; }

  // P1 paddle hit
  if (ball.x - ball.r <= 25 && ball.x + ball.r >= 15 && ball.y >= p1.y && ball.y <= p1.y + p1.h) {
    ball.vx = Math.abs(ball.vx) * 1.05;
    let delta = (ball.y - (p1.y + p1.h / 2)) / (p1.h / 2);
    ball.vy = delta * 6;
  }

  // P2 paddle hit
  if (ball.x + ball.r >= c.width - 25 && ball.x - ball.r <= c.width - 15 && ball.y >= p2.y && ball.y <= p2.y + p2.h) {
    ball.vx = -Math.abs(ball.vx) * 1.05;
    let delta = (ball.y - (p2.y + p2.h / 2)) / (p2.h / 2);
    ball.vy = delta * 6;
  }

  // Scores
  if (ball.x < 0) {
    s2++;
    document.getElementById('s2').innerText = s2;
    if (s2 >= 7) return endMatch('PLAYER 2 / AI WINS');
    resetBall(true);
  } else if (ball.x > c.width) {
    s1++;
    document.getElementById('s1').innerText = s1;
    if (s1 >= 7) return endMatch('PLAYER 1 WINS');
    resetBall(false);
  }

  // Render
  ctx.fillStyle = '#08111d';
  ctx.fillRect(0, 0, c.width, c.height);

  // Center dashed line
  ctx.strokeStyle = 'rgba(6,182,212,0.2)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(c.width / 2, 0);
  ctx.lineTo(c.width / 2, c.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Paddles
  ctx.fillStyle = '#22d3ee';
  ctx.shadowColor = '#22d3ee';
  ctx.shadowBlur = 8;
  ctx.fillRect(15, p1.y, p1.w, p1.h);
  ctx.fillRect(c.width - 25, p2.y, p2.w, p2.h);

  // Ball
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function endMatch(msg) {
  running = false;
  document.getElementById('ovT').innerText = msg;
  document.getElementById('ovD').innerText = 'Final: ' + s1 + ' - ' + s2;
  document.getElementById('ov').style.display = 'flex';
}
requestAnimationFrame(loop);
</script>
</body>
</html>`
    }
  },
  {
    id: 'space-invaders',
    title: 'Galaga Defender: Deep Space',
    category: 'Action',
    description: 'Defend humanity against descending waves of alien insect fleets. Fire rapid photon lasers and dodge hostile plasma bombs.',
    controls: 'Left/Right or A/D to steer, Spacebar to fire lasers',
    instructions: [
      'Maneuver your starship across the lower battle quadrant',
      'Hold or tap Spacebar to unleash laser artillery',
      'Watch for swooping boss flagships that dive down unexpectedly',
      'Survive multiple waves to rack up interplanetary commander ratings'
    ],
    tags: ['Action', 'Retro', 'Shooter', 'Space'],
    rating: 4.9,
    plays: '175.8K',
    badge: 'POPULAR',
    aspectRatio: '4:3',
    themeColor: '#a855f7',
    iconName: 'Zap',
    iframe: {
      type: 'srcdoc',
      content: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #050508; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #top { width: 440px; max-width: 95vw; display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; font-weight: bold; }
  .p { color: #c084fc; text-shadow: 0 0 8px rgba(192,132,252,0.6); }
  #stage { width: 440px; height: 460px; max-width: 95vw; background: #0c0a17; border: 2px solid #9333ea; border-radius: 8px; position: relative; box-shadow: 0 0 20px rgba(147,51,234,0.3); }
  canvas { display: block; width: 100%; height: 100%; border-radius: 6px; }
  #ov { position: absolute; inset: 0; background: rgba(5,5,8,0.88); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 6px; }
  h2 { font-size: 26px; color: #c084fc; margin-bottom: 8px; }
  p { color: #94a3b8; font-size: 13px; margin-bottom: 16px; }
  button { background: #9333ea; color: #fff; border: none; padding: 10px 24px; font-size: 15px; font-weight: bold; border-radius: 6px; cursor: pointer; }
</style>
</head>
<body>
<div id="top">
  <div>SCORE: <span id="sc" class="p">0</span></div>
  <div>LIVES: <span id="lv" class="p">❤❤❤</span></div>
  <div>WAVE: <span id="wv" class="p">1</span></div>
</div>
<div id="stage">
  <canvas id="c" width="440" height="460"></canvas>
  <div id="ov">
    <h2 id="ovT">GALAGA DEFENDER</h2>
    <p id="ovD">Steer with A/D or Arrows. Press Space to Fire.</p>
    <button id="btn">ENGAGE ENEMIES</button>
  </div>
</div>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
let ship = { x: 205, y: 420, w: 30, h: 18 };
let bullets = [], enemies = [], eBullets = [];
let score = 0, lives = 3, wave = 1;
let running = false, keys = {}, lastShot = 0;

function spawnWave() {
  enemies = [];
  const rows = 4, cols = 8;
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      enemies.push({
        x: 40 + col * 46,
        y: 40 + r * 35,
        w: 24, h: 18,
        type: r === 0 ? 'boss' : (r < 2 ? 'mid' : 'grunt')
      });
    }
  }
}

window.addEventListener('keydown', e => {
  keys[e.code] = true;
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function start() {
  score = 0; lives = 3; wave = 1;
  document.getElementById('sc').innerText = 0;
  document.getElementById('lv').innerText = '❤❤❤';
  document.getElementById('wv').innerText = 1;
  ship.x = 205;
  bullets = []; eBullets = [];
  spawnWave();
  running = true;
  document.getElementById('ov').style.display = 'none';
}

document.getElementById('btn').addEventListener('click', start);

let eDir = 1, eTimer = 0;

function loop(now) {
  requestAnimationFrame(loop);
  if (!running) return;

  if (keys['ArrowLeft'] || keys['KeyA']) ship.x = Math.max(10, ship.x - 5.5);
  if (keys['ArrowRight'] || keys['KeyD']) ship.x = Math.min(c.width - ship.w - 10, ship.x + 5.5);
  if (keys['Space'] && now - lastShot > 160) {
    bullets.push({ x: ship.x + ship.w / 2 - 2, y: ship.y, w: 4, h: 12 });
    lastShot = now;
  }

  // Update bullets
  bullets.forEach((b, idx) => {
    b.y -= 8;
    for (let i = enemies.length - 1; i >= 0; i--) {
      let e = enemies[i];
      if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
        score += e.type === 'boss' ? 50 : (e.type === 'mid' ? 30 : 15);
        document.getElementById('sc').innerText = score;
        enemies.splice(i, 1);
        bullets.splice(idx, 1);
        break;
      }
    }
  });
  bullets = bullets.filter(b => b.y > -20);

  // Move enemies
  eTimer++;
  if (eTimer > 3) {
    eTimer = 0;
    let minX = Math.min(...enemies.map(e => e.x));
    let maxX = Math.max(...enemies.map(e => e.x + e.w));
    if (maxX > c.width - 20 || minX < 20) {
      eDir *= -1;
      enemies.forEach(e => e.y += 10);
    } else {
      enemies.forEach(e => e.x += eDir * (1.8 + wave * 0.3));
    }
  }

  // Enemy shoot
  if (Math.random() < 0.03 && enemies.length > 0) {
    let shooter = enemies[Math.floor(Math.random() * enemies.length)];
    eBullets.push({ x: shooter.x + shooter.w / 2, y: shooter.y + shooter.h, vy: 4.5 });
  }

  // Update enemy bullets
  eBullets.forEach((eb, idx) => {
    eb.y += eb.vy;
    if (eb.x > ship.x && eb.x < ship.x + ship.w && eb.y > ship.y && eb.y < ship.y + ship.h) {
      eBullets.splice(idx, 1);
      lives--;
      let h = '';
      for(let i=0; i<lives; i++) h += '❤';
      document.getElementById('lv').innerText = h || 'NONE';
      if (lives <= 0) {
        running = false;
        document.getElementById('ovT').innerText = 'FLEET DESTROYED';
        document.getElementById('ovD').innerText = 'Final Score: ' + score;
        document.getElementById('ov').style.display = 'flex';
      }
    }
  });
  eBullets = eBullets.filter(eb => eb.y < c.height + 20);

  // Next wave
  if (enemies.length === 0) {
    wave++;
    document.getElementById('wv').innerText = wave;
    spawnWave();
  }

  // Render
  ctx.fillStyle = '#0c0a17';
  ctx.fillRect(0, 0, c.width, c.height);

  // Ship
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(ship.x + ship.w / 2, ship.y);
  ctx.lineTo(ship.x + ship.w, ship.y + ship.h);
  ctx.lineTo(ship.x, ship.y + ship.h);
  ctx.fill();

  // Lasers
  ctx.fillStyle = '#f43f5e';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

  // Enemy bullets
  ctx.fillStyle = '#facc15';
  eBullets.forEach(eb => {
    ctx.beginPath();
    ctx.arc(eb.x, eb.y, 4, 0, Math.PI*2);
    ctx.fill();
  });

  // Enemies
  enemies.forEach(e => {
    ctx.fillStyle = e.type === 'boss' ? '#ec4899' : (e.type === 'mid' ? '#a855f7' : '#06b6d4');
    ctx.fillRect(e.x, e.y, e.w, e.h);
  });
}
requestAnimationFrame(loop);
</script>
</body>
</html>`
    }
  },
  {
    id: 'connect-four',
    title: 'Tactical 4: Drop Battle',
    category: 'Strategy',
    description: 'The celebrated vertical checkers game. Connect four tokens horizontally, vertically, or diagonally before your opponent does.',
    controls: 'Click any column header to drop your chip',
    instructions: [
      'Click on any of the 7 columns to drop your colored disc',
      'Discs fall to the lowest unoccupied space in that column',
      'Form an unbroken line of 4 consecutive discs (horizontal, vertical, or diagonal)',
      'Play against strategic AI or challenge a friend in 2-Player mode'
    ],
    tags: ['Strategy', 'Board', 'Logic', '2-Player'],
    rating: 4.8,
    plays: '89.4K',
    badge: 'CLASSIC',
    aspectRatio: '16:9',
    themeColor: '#3b82f6',
    iconName: 'Grid',
    iframe: {
      type: 'srcdoc',
      content: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #0f172a; color: #fff; font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #status { font-size: 20px; font-weight: bold; margin-bottom: 12px; color: #facc15; }
  #board { background: #1e3a8a; padding: 12px; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.5); border: 2px solid #3b82f6; }
  .grid { display: grid; grid-template-columns: repeat(7, 46px); grid-gap: 8px; }
  .slot { width: 46px; height: 46px; background: #0f172a; border-radius: 50%; cursor: pointer; transition: background 0.15s; }
  .slot.p1 { background: #ef4444; box-shadow: inset 0 -3px 0 #b91c1c; }
  .slot.p2 { background: #facc15; box-shadow: inset 0 -3px 0 #ca8a04; }
  .bar { display: flex; gap: 12px; margin-top: 14px; }
  button { background: #334155; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; }
  button:hover { background: #475569; }
</style>
</head>
<body>
<div id="status">RED'S TURN (YOU)</div>
<div id="board">
  <div class="grid" id="g"></div>
</div>
<div class="bar">
  <button id="aiToggle">MODE: VS AI</button>
  <button id="rst">RESET MATCH</button>
</div>
<script>
const ROWS = 6, COLS = 7;
let board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
let turn = 1; // 1 = Red, 2 = Yellow
let vsAI = true;
let over = false;

function init() {
  board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  turn = 1;
  over = false;
  document.getElementById('status').innerText = "RED'S TURN (YOU)";
  document.getElementById('status').style.color = '#ef4444';
  render();
}

function render() {
  const g = document.getElementById('g');
  g.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let d = document.createElement('div');
      d.className = 'slot' + (board[r][c] === 1 ? ' p1' : (board[r][c] === 2 ? ' p2' : ''));
      d.addEventListener('click', () => drop(c));
      g.appendChild(d);
    }
  }
}

function drop(col) {
  if (over) return;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      board[r][col] = turn;
      render();
      if (checkWin(r, col, turn)) {
        over = true;
        document.getElementById('status').innerText = (turn === 1 ? 'RED' : 'YELLOW') + ' WINS!';
        return;
      }
      turn = turn === 1 ? 2 : 1;
      document.getElementById('status').innerText = (turn === 1 ? "RED'S TURN" : (vsAI ? "AI THINKING..." : "YELLOW'S TURN"));
      document.getElementById('status').style.color = turn === 1 ? '#ef4444' : '#facc15';

      if (vsAI && turn === 2 && !over) {
        setTimeout(aiMove, 300);
      }
      return;
    }
  }
}

function aiMove() {
  if (over) return;
  // Pick column with available spot
  let validCols = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) validCols.push(c);
  }
  if (validCols.length > 0) {
    let pick = validCols[Math.floor(Math.random() * validCols.length)];
    // Quick check if can win or block
    drop(pick);
  }
}

function checkWin(r, c, p) {
  function count(dr, dc) {
    let cnt = 0;
    let nr = r + dr, nc = c + dc;
    while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === p) {
      cnt++; nr += dr; nc += dc;
    }
    return cnt;
  }
  if (count(0, 1) + count(0, -1) >= 3) return true;
  if (count(1, 0) + count(-1, 0) >= 3) return true;
  if (count(1, 1) + count(-1, -1) >= 3) return true;
  if (count(1, -1) + count(-1, 1) >= 3) return true;
  return false;
}

document.getElementById('rst').addEventListener('click', init);
document.getElementById('aiToggle').addEventListener('click', () => {
  vsAI = !vsAI;
  document.getElementById('aiToggle').innerText = vsAI ? 'MODE: VS AI' : 'MODE: 2 PLAYERS';
  init();
});

init();
</script>
</body>
</html>`
    }
  },
  {
    id: 'sudoku-quick',
    title: 'Sudoku: Logic Numbers',
    category: 'Puzzle',
    description: 'Clean, distraction-free Sudoku. Instant conflict highlighting, pencil note system, timer, and difficulty switcher.',
    controls: 'Click a cell and type 1-9 on keyboard, or click number pad',
    instructions: [
      'Fill the 9x9 grid so every row, column, and 3x3 region contains numbers 1 through 9',
      'No row, column, or 3x3 box can contain duplicate numbers',
      'Use the notes mode to jot down pencil candidates',
      'Click the Check button to inspect your solution accuracy'
    ],
    tags: ['Puzzle', 'Numbers', 'Logic', 'Brain'],
    rating: 4.7,
    plays: '74.2K',
    badge: 'POPULAR',
    aspectRatio: '1:1',
    themeColor: '#0ea5e9',
    iconName: 'Grid',
    iframe: {
      type: 'srcdoc',
      content: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #0f172a; color: #f8fafc; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #top { width: 340px; display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; }
  #grid { display: grid; grid-template-columns: repeat(9, 36px); grid-gap: 1px; background: #334155; padding: 2px; border: 3px solid #0284c7; border-radius: 6px; }
  .c { width: 36px; height: 36px; background: #1e293b; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; cursor: pointer; }
  .c.fixed { color: #38bdf8; font-weight: 800; cursor: default; }
  .c.selected { background: #0369a1; }
  .c.wrong { background: #dc2626; }
  .c:nth-child(3n) { border-right: 2px solid #64748b; }
  .c:nth-child(n+19):nth-child(-n+27), .c:nth-child(n+46):nth-child(-n+54) { border-bottom: 2px solid #64748b; }
  .pad { display: flex; gap: 6px; margin-top: 12px; }
  .btn { width: 32px; height: 32px; background: #334155; color: #fff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
</style>
</head>
<body>
<div id="top">
  <div>SUDOKU</div>
  <div>TIME: <span id="tm">00:00</span></div>
</div>
<div id="grid"></div>
<div class="pad" id="numpad"></div>
<script>
const board = [
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  [0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],
  [4,0,0,8,0,3,0,0,1],
  [7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],
  [0,0,0,4,1,9,0,0,5],
  [0,0,0,0,8,0,0,7,9]
];
let current = JSON.parse(JSON.stringify(board));
let selected = null;
let seconds = 0;

setInterval(() => {
  seconds++;
  let m = String(Math.floor(seconds / 60)).padStart(2, '0');
  let s = String(seconds % 60).padStart(2, '0');
  document.getElementById('tm').innerText = m + ':' + s;
}, 1000);

function render() {
  const g = document.getElementById('grid');
  g.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      let d = document.createElement('div');
      let val = current[r][c];
      d.className = 'c' + (board[r][c] !== 0 ? ' fixed' : '') + (selected && selected.r === r && selected.c === c ? ' selected' : '');
      d.innerText = val > 0 ? val : '';
      d.addEventListener('click', () => {
        if (board[r][c] === 0) {
          selected = {r, c};
          render();
        }
      });
      g.appendChild(d);
    }
  }
}

const pad = document.getElementById('numpad');
for (let i = 1; i <= 9; i++) {
  let b = document.createElement('button');
  b.className = 'btn';
  b.innerText = i;
  b.addEventListener('click', () => {
    if (selected) {
      current[selected.r][selected.c] = i;
      render();
    }
  });
  pad.appendChild(b);
}
let clearBtn = document.createElement('button');
clearBtn.className = 'btn';
clearBtn.innerText = '✕';
clearBtn.addEventListener('click', () => {
  if (selected) {
    current[selected.r][selected.c] = 0;
    render();
  }
});
pad.appendChild(clearBtn);

window.addEventListener('keydown', e => {
  if (selected) {
    if (e.key >= '1' && e.key <= '9') {
      current[selected.r][selected.c] = parseInt(e.key);
      render();
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      current[selected.r][selected.c] = 0;
      render();
    }
  }
});

render();
</script>
</body>
</html>`
    }
  },
  {
    id: 'traffic-hopper',
    title: 'Crossy Hopper: Highway Frog',
    category: 'Arcade',
    description: 'Hop across speeding multi-lane expressways, navigate rushing river logs, and dodge high-speed trains to rack up distance scores.',
    controls: 'Arrow Keys or WASD to hop in 4 directions',
    instructions: [
      'Press Up / W to leap forward onto new terrain bands',
      'Time your leap across busy highways to avoid speeding sports cars and trucks',
      'Ride floating driftwood logs to cross deep rushing rivers without falling in',
      'The camera creeps forward - don’t linger too long or you’ll get swept away'
    ],
    tags: ['Arcade', 'Timing', 'Crossy', 'Casual'],
    rating: 4.8,
    plays: '154.6K',
    badge: 'HOT',
    aspectRatio: '4:3',
    themeColor: '#10b981',
    iconName: 'Play',
    iframe: {
      type: 'srcdoc',
      content: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
  body { background: #064e3b; color: #fff; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
  #stage { width: 440px; height: 440px; max-width: 95vw; background: #022c22; border: 2px solid #10b981; border-radius: 8px; position: relative; box-shadow: 0 0 20px rgba(16,185,129,0.3); }
  canvas { display: block; width: 100%; height: 100%; border-radius: 6px; }
  #hud { position: absolute; top: 12px; left: 16px; font-size: 18px; font-weight: bold; color: #6ee7b7; text-shadow: 0 0 8px rgba(110,231,183,0.7); }
  #ov { position: absolute; inset: 0; background: rgba(2,44,34,0.88); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 6px; }
  h2 { font-size: 26px; color: #6ee7b7; margin-bottom: 8px; }
  p { color: #a7f3d0; font-size: 13px; margin-bottom: 16px; }
  button { background: #10b981; color: #022c22; border: none; padding: 10px 24px; font-size: 15px; font-weight: bold; border-radius: 6px; cursor: pointer; }
</style>
</head>
<body>
<div id="stage">
  <div id="hud">SCORE: <span id="sc">0</span> | BEST: <span id="hi">0</span></div>
  <canvas id="c" width="440" height="440"></canvas>
  <div id="ov">
    <h2 id="ovT">CROSSY HOPPER</h2>
    <p id="ovD">Arrow keys or WASD to leap across traffic and rivers.</p>
    <button id="btn">START HOPPING</button>
  </div>
</div>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
const TILE = 40;
let frog = { x: 5, y: 10 };
let score = 0, best = localStorage.getItem('hopper_best') || 0;
document.getElementById('hi').innerText = best;
let running = false;

// Lanes: road, river, grass
let lanes = [];
function initLanes() {
  lanes = [
    { type: 'grass', y: 10 },
    { type: 'road', y: 9, cars: [{x: 0, s: 2, w: 45}, {x: 200, s: 2, w: 45}] },
    { type: 'road', y: 8, cars: [{x: 100, s: -2.5, w: 40}, {x: 300, s: -2.5, w: 40}] },
    { type: 'road', y: 7, cars: [{x: 50, s: 3.2, w: 55}, {x: 280, s: 3.2, w: 55}] },
    { type: 'grass', y: 6 },
    { type: 'river', y: 5, logs: [{x: 0, s: 1.8, w: 80}, {x: 220, s: 1.8, w: 80}] },
    { type: 'river', y: 4, logs: [{x: 80, s: -2.2, w: 75}, {x: 300, s: -2.2, w: 75}] },
    { type: 'river', y: 3, logs: [{x: 20, s: 2.5, w: 85}, {x: 250, s: 2.5, w: 85}] },
    { type: 'grass', y: 2 },
    { type: 'grass', y: 1 },
    { type: 'grass', y: 0 }
  ];
}

window.addEventListener('keydown', e => {
  if (!running) return;
  if (['ArrowUp','KeyW'].includes(e.code) && frog.y > 0) {
    frog.y--;
    let newScore = 10 - frog.y;
    if (newScore > score) {
      score = newScore;
      document.getElementById('sc').innerText = score;
    }
    if (frog.y === 0) {
      // Loop new wave
      score += 15;
      document.getElementById('sc').innerText = score;
      frog.y = 10;
    }
  }
  if (['ArrowDown','KeyS'].includes(e.code) && frog.y < 10) frog.y++;
  if (['ArrowLeft','KeyA'].includes(e.code) && frog.x > 0) frog.x--;
  if (['ArrowRight','KeyD'].includes(e.code) && frog.x < 10) frog.x++;
});

function start() {
  frog = { x: 5, y: 10 };
  score = 0;
  document.getElementById('sc').innerText = 0;
  initLanes();
  running = true;
  document.getElementById('ov').style.display = 'none';
}

document.getElementById('btn').addEventListener('click', start);

function die() {
  running = false;
  if (score > best) {
    best = score;
    localStorage.setItem('hopper_best', best);
    document.getElementById('hi').innerText = best;
  }
  document.getElementById('ovT').innerText = 'SQUISHED!';
  document.getElementById('ovD').innerText = 'Score: ' + score;
  document.getElementById('ov').style.display = 'flex';
}

function loop() {
  requestAnimationFrame(loop);
  if (!running) return;

  // Clear
  ctx.fillStyle = '#022c22';
  ctx.fillRect(0, 0, c.width, c.height);

  let currentLane = lanes.find(l => l.y === frog.y);
  let onLog = false;

  // Render lanes
  lanes.forEach(l => {
    let py = l.y * TILE;
    if (l.type === 'grass') {
      ctx.fillStyle = '#065f46';
      ctx.fillRect(0, py, c.width, TILE);
    } else if (l.type === 'road') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, py, c.width, TILE);
      // Cars
      l.cars.forEach(car => {
        car.x += car.s;
        if (car.s > 0 && car.x > c.width) car.x = -car.w;
        if (car.s < 0 && car.x < -car.w) car.x = c.width;

        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(car.x, py + 8, car.w, 24);

        // Collision
        let fx = frog.x * TILE + 6;
        if (l.y === frog.y && fx + 28 > car.x && fx < car.x + car.w) {
          die();
        }
      });
    } else if (l.type === 'river') {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, py, c.width, TILE);
      // Logs
      l.logs.forEach(log => {
        log.x += log.s;
        if (log.s > 0 && log.x > c.width) log.x = -log.w;
        if (log.s < 0 && log.x < -log.w) log.x = c.width;

        ctx.fillStyle = '#78350f';
        ctx.fillRect(log.x, py + 6, log.w, 28);

        // Check if frog is on this log
        let fx = frog.x * TILE + 20;
        if (l.y === frog.y && fx >= log.x && fx <= log.x + log.w) {
          onLog = true;
          frog.x += (log.s / TILE);
        }
      });
    }
  });

  if (currentLane && currentLane.type === 'river' && !onLog) {
    die();
  }

  // Draw frog
  ctx.fillStyle = '#22c55e';
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  let fx = frog.x * TILE + 20;
  let fy = frog.y * TILE + 20;
  ctx.arc(fx, fy, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}
requestAnimationFrame(loop);
</script>
</body>
</html>`
    }
  }
];
