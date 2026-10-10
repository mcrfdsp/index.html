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

function render(t) {
  t = ((t % N) + N) % N;
  const i = Math.floor(t);
  const g = Math.min((t - i) / GROW, 1);

  paint(base, PALETTE[i]);
  paint(over, PALETTE[(i + 1) % N]);
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

(function loop() { cur += (target - cur) * .12; render(cur); requestAnimationFrame(loop); })();

