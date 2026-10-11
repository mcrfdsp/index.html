// Cores: [fundo, texto]. Ciclo: branco > preto > branco > preto...
const PALETTE = [['#ffffff', '#000000'], ['#000000', '#ffffff']];
const N = PALETTE.length;
const GROW = 0.75;   // parte do passo em que o círculo se mexe; o resto é a "pausa"
const ENTER = 0.55;  // parte do movimento em que o círculo entra inteiro; depois cresce
const SIZE = 0.4;    // raio do círculo ao entrar, em relação à altura do ecrã

const base = document.getElementById('base');
const over = base.cloneNode(true);
over.id = 'over';
over.setAttribute('aria-hidden', 'true');
over.querySelectorAll('a').forEach(a => a.tabIndex = -1);
document.body.appendChild(over);

// lê a cor guardada (0 = branco, 1 = preto) para a home arrancar igual às outras páginas
let saved = 0;
try { saved = (+localStorage.getItem('theme') || 0) % N; } catch (e) {}
let last = -1;
function save(v) {
  if (v !== last) {
    last = v;
    try { localStorage.setItem('theme', v); } catch (e) {}
    document.cookie = 'theme=' + v + '; path=/; max-age=31536000';
  }
}

let w = innerWidth, h = innerHeight, target = saved, cur = saved;
addEventListener('resize', () => { w = innerWidth; h = innerHeight; });

const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const paint = (el, c) => { el.style.setProperty('--bg', c[0]); el.style.setProperty('--fg', c[1]); };
let mon = null;                                   // o monstro que passeia (criado mais abaixo)
const tint = idx => { if (mon) paint(mon, PALETTE[idx]); };

function render(t) {
  t = ((t % N) + N) % N;
  const i = Math.floor(t);
  const g = Math.min((t - i) / GROW, 1);

  paint(base, PALETTE[i]);
  paint(over, PALETTE[(i + 1) % N]);
  tint(g > .5 ? (i + 1) % N : i);
  document.body.style.background = PALETTE[i][0];
  save(g >= .9 ? (i + 1) % N : i);

  if (g <= 0) { over.style.clipPath = 'circle(0px)'; }
  else {
    const r0 = h * SIZE;
    const R = Math.hypot(w, h) / 2 + 2;
    let cx, r;
    if (g < ENTER) {
      const p = ease(g / ENTER);
      cx = -r0 + (w / 2 + r0) * p; r = r0;
    } else {
      const p = ease((g - ENTER) / (1 - ENTER));
      cx = w / 2; r = r0 + (R - r0) * p;
    }
    over.style.clipPath = `circle(${r}px at ${cx}px ${h / 2}px)`;
  }
  over.style.pointerEvents = g > .9 ? 'auto' : 'none';
}

addEventListener('wheel', e => {
  e.preventDefault();
  target += Math.max(-120, Math.min(120, e.deltaY)) / 900;
}, { passive: false });

addEventListener('keydown', e => {
  const d = { ArrowDown: 1, ArrowRight: 1, PageDown: 1, ' ': e.shiftKey ? -1 : 1, ArrowUp: -1, ArrowLeft: -1, PageUp: -1 }[e.key];
  if (d) { e.preventDefault(); target += d * .12; }
});

let ty = null;
addEventListener('touchstart', e => ty = e.touches[0].clientY, { passive: true });
addEventListener('touchmove', e => { const y = e.touches[0].clientY; target += (ty - y) / (h * 1.2); ty = y; }, { passive: true });

// ======================================================
//  MONSTRO QUE PASSEIA PELA HOME (menos por cima das fotos)
// ======================================================
(function () {
  const GAME_URL = 'project-5.html';   // página para onde o monstro leva
  const MS = 76;                       // tamanho do monstro (px)
  const SPEED = 42;                    // velocidade (px por segundo)
  const TEXT = "let's play!";

  // ---- peças (as mesmas do Monster Maker) ----
  const INK = '#111', ST = `stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`, ST2 = `stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
  const COLORS = ['#FFDD57', '#00BF63', '#FF3131', '#0049AD', '#FF751F', '#FF66C4', '#B0B0B0', '#38B6FF'];
  const wavy = (f, n = 140) => { let d = ''; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = f(a); d += (i ? 'L' : 'M') + (100 + r * Math.cos(a)).toFixed(1) + ' ' + (100 + r * Math.sin(a)).toFixed(1) } return d + 'Z' };
  const pixel = c => { let s = ''; for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const cx = 25 + x * 10, cy = 25 + y * 10; if (Math.hypot(cx - 100, cy - 100) < 80) s += `<rect x="${cx - 5}" y="${cy - 5}" width="10" height="10" fill="${c}" stroke="${c}" stroke-width=".6"/>` } return s };
  const SHAPES = [
    { draw: c => `<circle cx="100" cy="100" r="80" fill="${c}"/>`, face: { ey: 85, my: 130, s: 1 } },
    { draw: c => `<path d="M20 180V100a80 80 0 0 1 160 0V180q0 10-10 10H30q-10 0-10-10Z" fill="${c}"/>`, face: { ey: 95, my: 140, s: 1 } },
    { draw: c => `<rect x="25" y="25" width="150" height="150" rx="38" fill="${c}"/>`, face: { ey: 85, my: 130, s: 1 } },
    { draw: c => `<path d="${wavy(a => 76 + 6 * Math.cos(a * 10))}" fill="${c}"/>`, face: { ey: 85, my: 130, s: 1 } },
    { draw: c => `<rect x="30" y="8" width="140" height="106" rx="48" fill="${c}"/><rect x="30" y="86" width="140" height="106" rx="48" fill="${c}"/>`, face: { ey: 58, my: 140, s: .95 } },
    { draw: c => pixel(c), face: { ey: 85, my: 130, s: 1 } },
    { draw: c => `<path d="M30 170C30 90 55 30 100 30C145 30 170 90 170 170C170 190 150 190 135 178C118 166 82 166 65 178C50 190 30 190 30 170Z" fill="${c}"/>`, face: { ey: 85, my: 122, s: 1 } },
    { draw: c => `<ellipse cx="100" cy="100" rx="54" ry="88" fill="${c}"/>`, face: { ey: 80, my: 128, s: .8 } }];
  const eyeWrap = fn => () => [-1, 1].map(s => `<g transform="translate(${s * 25} 0)">${fn(s)}</g>`).join('');
  const ball = (r, extra = '') => `<circle r="${r}" fill="#fff" ${ST}/>${extra}`;
  const EYES = [
    eyeWrap(() => ball(15, `<path d="M-15 0A15 15 0 0 1 15 0Z" fill="${INK}"/>`)),
    eyeWrap(s => ball(19, `<circle cx="${s < 0 ? -5 : 6}" cy="${s < 0 ? -4 : 6}" r="6" fill="${INK}"/>`)),
    eyeWrap(() => ball(17, `<circle r="2.2" fill="${INK}"/>`)),
    eyeWrap(() => ball(16, `<circle cx="5" cy="4" r="8" fill="${INK}"/><circle cx="3" cy="2" r="2.5" fill="#fff"/>`)),
    eyeWrap(() => ball(16, `<circle r="11" fill="${INK}"/><circle cx="-4" cy="-4" r="3.2" fill="#fff"/>`)),
    eyeWrap(() => `<path d="M-16 -3H16A16 16 0 0 1 -16 -3Z" fill="#fff" ${ST}/><circle cy="5" r="6.5" fill="${INK}"/><circle cx="-2" cy="3" r="2" fill="#fff"/>`),
    eyeWrap(s => ball(15, `<circle cx="${-s * 3}" cy="3" r="6" fill="${INK}"/><path d="M${s * 18} -11L${-s * 18} 2" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`)),
    eyeWrap(() => `<circle r="16" fill="${INK}" ${ST}/><circle r="3" fill="#fff"/>`)];
  const halo = d => `<path d="${d}" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="${d}" fill="none" ${ST}/>`;
  const MOUTHS = [
    () => halo('M-24 -2Q0 16 24 -2'),
    () => `<path d="M-15 16Q-15 -16 0 -16Q15 -16 15 16Z" fill="${INK}" ${ST}/><rect x="-5" y="-12" width="10" height="7" rx="2" fill="#fff"/>`,
    () => `<rect x="-26" y="-10" width="52" height="22" rx="9" fill="#fff" ${ST}/><path d="M-13 -10V12M0 -10V12M13 -10V12M-26 1H26" fill="none" ${ST2}/>`,
    () => `<ellipse rx="17" ry="20" fill="${INK}" ${ST}/><ellipse cy="12" rx="9" ry="6" fill="#fff"/><rect x="-5" y="-17" width="10" height="6" rx="2" fill="#fff"/>`,
    () => halo('M-24 8Q0 -10 24 8'),
    () => `<path d="M-20 -6H20A20 20 0 0 1 -20 -6Z" fill="${INK}" ${ST}/><ellipse cx="6" cy="14" rx="9" ry="8" fill="#fff" ${ST}/>`,
    () => `<path d="M-26 -6Q0 4 26 -6Q22 22 0 22Q-22 22 -26 -6Z" fill="#fff" ${ST}/><path d="M-22 4Q0 12 22 4" fill="none" ${ST2}/>`,
    () => `<path d="M-20 -8Q0 -16 20 -8Q24 8 8 10Q6 22 -2 22Q-8 12 -20 -8Z" fill="#fff" ${ST}/>`];

  // ---- o monstro: o que o visitante criou no jogo, ou um ao calhas ----
  const pick = n => Math.floor(Math.random() * n);
  let M = null;
  try { M = JSON.parse(localStorage.getItem('monster')); } catch (e) {}
  const ok = (v, n) => Number.isInteger(v) && v >= 0 && v < n;
  const mine = M && ok(M.shape, 8);
  const iSh = mine ? M.shape : pick(8);
  const iCo = mine ? (ok(M.color, 8) ? M.color : 6) : pick(8);
  const iEy = mine ? (ok(M.eyes, 8) ? M.eyes : null) : pick(8);
  const iMo = mine ? (ok(M.mouth, 8) ? M.mouth : null) : pick(8);
  const sh = SHAPES[iSh], f = sh.face;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${sh.draw(COLORS[iCo])}` +
    `<g transform="translate(100 ${f.ey}) scale(${f.s})"><g class="eyes">${iEy !== null ? EYES[iEy]() : ''}</g></g>` +
    (iMo !== null ? `<g transform="translate(100 ${f.my}) scale(${f.s})">${MOUTHS[iMo]()}</g>` : '') + `</svg>`;

  // ---- estilo (injetado aqui para não mexeres no style.css) ----
  const css = document.createElement('style');
  css.textContent = `
  .walker{position:fixed;left:0;top:0;z-index:5;width:${MS}px;height:${MS}px;display:block;color:var(--fg,#000);will-change:transform;-webkit-user-drag:none;user-select:none}
  .walker .body{display:block;width:100%;height:100%;transform-origin:50% 90%}
  .walker svg{display:block;width:100%;height:100%;overflow:visible;pointer-events:none}
  .walker .bub{position:absolute;bottom:100%;left:50%;margin-bottom:6px;transform:translate(-50%,4px) scale(.9);white-space:nowrap;background:var(--bg,#fff);color:var(--fg,#000);border:1.5px solid currentColor;border-radius:999px;padding:6px 12px;font-size:11px;opacity:0;pointer-events:none;transition:opacity .15s,transform .15s}
  .walker.on .bub{opacity:1;transform:translate(-50%,0) scale(1)}
  .walker.on .body{animation:mhop .32s ease-out}
  @keyframes mhop{0%{transform:translateY(0)}40%{transform:translateY(-14px)}100%{transform:translateY(0)}}`;
  document.head.appendChild(css);

  const walker = document.createElement('a');
  walker.className = 'walker';
  walker.href = GAME_URL;
  walker.draggable = false;
  walker.setAttribute('aria-label', 'Play with the monster');
  walker.innerHTML = `<span class="bub">${TEXT}</span><span class="body">${svg}</span>`;
  document.body.appendChild(walker);
  mon = walker;
  const body = walker.querySelector('.body'), eyes = walker.querySelector('.eyes');

  // ---- zona onde pode andar: tudo menos o cabeçalho e as fotos ----
  const area = () => {
    const hb = document.querySelector('header').getBoundingClientRect().bottom;
    const wt = document.querySelector('.works').getBoundingClientRect().top;
    return { x0: 16, x1: innerWidth - MS - 16, y0: hb + 46, y1: wt - MS - 14 };
  };
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let A = area(), x, y, tx, tyy, pause = 0, phase = 0, engaged = false, armed = false, kind = 'mouse', px = 0, py = 0, t0 = performance.now(), ex = 0, ey = 0, bob = 0, tilt = 0, timer;
  const valid = () => A.y1 - A.y0 > 20 && A.x1 - A.x0 > 20;
  const newTarget = () => { A = area(); tx = rand(A.x0, A.x1); tyy = rand(A.y0, A.y1); };
  const place = () => { A = area(); walker.style.display = valid() ? '' : 'none'; x = Math.min(Math.max(x ?? rand(A.x0, A.x1), A.x0), A.x1); y = Math.min(Math.max(y ?? rand(A.y0, A.y1), A.y0), A.y1); newTarget(); };
  place();
  addEventListener('resize', place);
  addEventListener('load', place);

  // ---- o monstro pára, olha para ti e diz "let's play!" ----
  const engage = () => { engaged = true; walker.classList.add('on'); };
  const release = () => { engaged = false; armed = false; clearTimeout(timer); walker.classList.remove('on'); pause = .5; };
  walker.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') engage(); });
  walker.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') release(); });
  walker.addEventListener('focus', engage);
  walker.addEventListener('blur', release);
  walker.addEventListener('pointerdown', e => { kind = e.pointerType; px = e.clientX; py = e.clientY; });
  addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; });
  walker.addEventListener('click', e => {          // no telemóvel: 1.º toque = diz olá, 2.º toque = joga
    if (kind === 'touch' && !armed) { e.preventDefault(); armed = true; engage(); clearTimeout(timer); timer = setTimeout(release, 3500); }
  });

  function tick(now) {
    const dt = Math.min(.05, (now - t0) / 1000); t0 = now;
    let tex = 0, tey = 0, tb = 0, tt = 0;
    if (engaged) {                                   // olha para o rato / dedo
      const dx = px - (x + MS / 2), dy = py - (y + MS / 2), d = Math.hypot(dx, dy) || 1;
      tex = dx / d * 5; tey = dy / d * 4;
    } else if (!reduce && valid()) {
      if (pause > 0) { pause -= dt; }
      else {
        const dx = tx - x, dy = tyy - y, d = Math.hypot(dx, dy), step = SPEED * dt;
        if (d <= step) { pause = rand(.6, 2.2); newTarget(); }
        else {
          x += dx / d * step; y += dy / d * step; phase += dt * 9;
          tex = dx / d * 4; tey = dy / d * 3;
          tb = -Math.abs(Math.sin(phase)) * 7; tt = dx / d * 5 + Math.sin(phase) * 3;
        }
      }
    }
    ex += (tex - ex) * .2; ey += (tey - ey) * .2; bob += (tb - bob) * .3; tilt += (tt - tilt) * .2;
    walker.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    body.style.transform = `translateY(${bob.toFixed(1)}px) rotate(${tilt.toFixed(1)}deg)`;
    eyes.setAttribute('transform', `translate(${ex.toFixed(1)} ${ey.toFixed(1)})`);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

(function loop() { cur += (target - cur) * .12; render(cur); requestAnimationFrame(loop); })();
