{
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const G = (!reduce && window.gsap) ? window.gsap : null;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => { const n = parseFloat(String(v ?? '').replace(/\s/g, '').replace(',', '.')); return isFinite(n) && n > 0 ? n : 0; };
const root = document.documentElement;
const phone = $('#phone'), device = $('#device');

/* ---------- fecha ---------- */
const now = new Date();
const Y = now.getFullYear(), M = now.getMonth(), d = now.getDate();
const D = new Date(Y, M + 1, 0).getDate();
const left = D - d + 1;
const pad = n => String(n).padStart(2, '0');
const todayKey = `${Y}-${pad(M + 1)}-${pad(d)}`;
const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const ym = (y, m) => `${y}-${pad(m + 1)}`;
const monthName = s => { if (!s) return '—'; const [y, m] = s.split('-').map(Number); return `${MONTHS[m - 1]} ${y}`; };
const toKey = dt => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
const fromKey = k => { const [y, m, dd] = String(k).split('-').map(Number); return new Date(y, m - 1, dd); };
const addDays = (k, n) => { const dt = fromKey(k); dt.setDate(dt.getDate() + n); return toKey(dt); };
const daysBetween = (a, b) => Math.round((fromKey(b) - fromKey(a)) / 864e5);
const falls = (k, want) => { const dt = fromKey(k); return dt.getDate() === Math.min(want, new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate()); };
const niceDay = k => { const dt = fromKey(k); const diff = daysBetween(todayKey, k); return diff === 0 ? 'hoy' : diff === 1 ? 'mañana' : `${dt.getDate()} de ${MONTHS[dt.getMonth()]}`; };
const monthsLeft = s => { if (!s) return 1; const [y, m] = s.split('-').map(Number); return Math.max(1, (y - Y) * 12 + (m - 1 - M)); };

/* ---------- estado ---------- */
const KEY = 'copiloto-app-v2';
const MKEY = ym(Y, M);
const ACCOUNTS = () => [
  { n: 'Efectivo', type: 'gasto', v: 0 }, { n: 'Yape / Plin', type: 'gasto', v: 0 }, { n: 'Cuenta sueldo o débito', type: 'gasto', v: 0 },
  { n: 'Cuenta de ahorro', type: 'ahorro', v: 0 }, { n: 'Guardado en casa', type: 'ahorro', v: 0 }, { n: 'Seguro de vida o inversión', type: 'ahorro', v: 0, hint: 'lo que ya acumulaste' }
];
const SAMPLE = {
  name: 'Andrea', birthday: `1996-${pad(((M + 1) % 12) + 1)}-03`, country: 'Perú', currency: 'S/',
  income: { sueldo: 4500, bonos: 500, freelance: 800, negocio: 0, otros: 0 }, payday: 'fin',
  cards: [
    { bank: 'BCP Visa', line: 8000, close: 15, pay: 10, debt: 1832, tone: 'a' },
    { bank: 'BBVA Gold', line: 6000, close: 20, pay: 5, debt: 640, tone: 'b' }
  ],
  fixed: [
    { n: 'Alquiler', v: 1800, on: true, day: 1 }, { n: 'Internet', v: 120, on: true, day: 12 }, { n: 'Netflix', v: 45, on: true },
    { n: 'Spotify', v: 25, on: true }, { n: 'Gimnasio', v: 150, on: true }, { n: 'Educación', v: 560, on: true }
  ],
  accounts: [
    { n: 'Efectivo', type: 'gasto', v: 80 }, { n: 'Yape / Plin', type: 'gasto', v: 140 }, { n: 'Cuenta sueldo o débito', type: 'gasto', v: 900 },
    { n: 'Cuenta de ahorro', type: 'ahorro', v: 7500 }, { n: 'Guardado en casa', type: 'ahorro', v: 300 }, { n: 'Seguro de vida o inversión', type: 'ahorro', v: 0, hint: 'lo que ya acumulaste' }
  ],
  cats: ['Comida', 'Salidas', 'Viajes', 'Transporte', 'Delivery', 'Bienestar'],
  goals: [
    { name: 'Japón 2028', kind: 'Viaje', cost: 20000, saved: 7500, date: '2028-03', active: true },
    { name: 'Toyota Yaris', kind: 'Auto', cost: 65000, saved: 4000, date: '2030-06', active: false },
    { name: 'Inicial depa', kind: 'Departamento', cost: 80000, saved: 5000, date: '2031-12', active: false }
  ],
  style: 'impulso',
  expenses: [
    { v: 12, cat: 'Comida', note: 'Café de la mañana', day: todayKey, t: 1 },
    { v: 18, cat: 'Transporte', note: 'Taxi', day: todayKey, t: 2 }
  ],
  chat: [], notes: [], onboarded: true, sample: true,
  cashBase: 1120, cashAdj: 0, baseDay: todayKey, baseT: 0, evDone: todayKey, payNotice: null
};
const EMPTY = {
  name: '', birthday: '', country: 'Perú', currency: 'S/',
  income: { sueldo: 0, bonos: 0, freelance: 0, negocio: 0, otros: 0 }, payday: 'fin',
  cards: [],
  fixed: ['Alquiler', 'Internet', 'Luz y agua', 'Celular', 'Streaming', 'Gimnasio', 'Educación'].map(n => ({ n, v: 0, on: false })),
  accounts: ACCOUNTS(),
  cats: ['Comida', 'Transporte', 'Salidas', 'Delivery'],
  goals: [], style: 'impulso', expenses: [], chat: [], notes: [], onboarded: false,
  cashBase: 0, cashAdj: 0, baseDay: null, baseT: 0, evDone: null, payNotice: null
};
const clone = o => JSON.parse(JSON.stringify(o));
let S = null;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
if (!S || !S.income || !Array.isArray(S.goals)) S = clone(EMPTY);
function migrate() {
  S.notes = S.notes || []; S.chat = S.chat || [];
  if (!Array.isArray(S.accounts)) S.accounts = ACCOUNTS();
  if (S.payday === undefined) S.payday = 'fin';
  if (S.cashBase === undefined) { S.cashBase = 0; S.cashAdj = 0; S.baseDay = null; S.baseT = 0; S.evDone = null; S.payNotice = null; }
  delete S.startSpent; delete S.startMonth; delete S.age;
}
migrate();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const money = n => { const r = Math.round(n * 100) / 100; const dec = Math.abs(r) < 100 && r % 1 !== 0; return `${S.currency} ${r.toLocaleString('es-PE', { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 })}`; };

const POOL = ['Comida','Transporte','Salud','Viajes','Hogar','Mascotas','Educación','Salidas','Delivery','Tecnología','Gaming','Gadgets','Automóvil','Deportes','Streaming','Música','Libros','Arte','Plantas','Cosméticos','Belleza','Moda','Bienestar','Cuidado personal'];
const INCOME = [['sueldo','Sueldo fijo'],['bonos','Bonos'],['freelance','Freelance'],['negocio','Negocio propio'],['otros','Otros ingresos']];
const PRESETS = [
  { kind: 'Viaje', label: 'Viaje', name: 'Japón 2028', cost: 20000, date: '2028-03', icon: '<path d="M3 17l18-7-18-6 4 7z"/>' },
  { kind: 'Auto', label: 'Auto', name: 'Toyota Yaris', cost: 65000, date: '2030-06', icon: '<path d="M4 16h16l-2-6H6z"/><circle cx="8" cy="17" r="1.5"/><circle cx="16" cy="17" r="1.5"/>' },
  { kind: 'Departamento', label: 'Depa', name: 'Inicial depa', cost: 80000, date: '2031-12', icon: '<path d="M4 20V9l8-5 8 5v11z"/><path d="M10 20v-6h4v6"/>' },
  { kind: 'Otro', label: 'Otro', name: 'Mi sueño', cost: 5000, date: ym(Y + 1, M), icon: '<path d="M12 3l2.5 6 6.5.5-5 4.2 1.6 6.3L12 16.6 6.4 20l1.6-6.3-5-4.2 6.5-.5z"/>' }
];
const STYLES = [
  { id: 'impulso', t: 'Lo compro y luego veo', s: 'Te hablaré claro y con cariño, y te frenaré a tiempo.' },
  { id: 'noche', t: 'Lo pienso una noche', s: 'Te daré el dato justo para decidir con calma.' },
  { id: 'lista', t: 'Lo anoto y casi nunca lo compro', s: 'Te recordaré que también mereces disfrutar.' }
];

/* ---------- cálculos ---------- */
const paydayNum = () => S.payday === 'fin' ? 31 : Math.min(31, Math.max(1, num(S.payday) || 31));
function nextPayAfter(k) { let x = addDays(k, 1); for (let i = 0; i < 70; i++) { if (falls(x, paydayNum())) return x; x = addDays(x, 1); } return x; }
const sumAcc = type => S.accounts.filter(a => a.type === type).reduce((s, a) => s + num(a.v), 0);
const counts = e => !!S.baseDay && (e.day > S.baseDay || (e.day === S.baseDay && e.t > (S.baseT || 0)));
function anchor() { S.cashBase = sumAcc('gasto'); S.cashAdj = 0; S.baseDay = todayKey; S.evDone = todayKey; S.baseT = Date.now(); }
function base() {
  const income = Object.values(S.income).reduce((a, b) => a + num(b), 0);
  const fixed = S.fixed.filter(f => f.on).reduce((a, f) => a + num(f.v), 0);
  const fixedOnPay = S.fixed.filter(f => f.on && !num(f.day)).reduce((a, f) => a + num(f.v), 0);
  const goals = S.goals.map(g => {
    const ml = monthsLeft(g.date), need = Math.max(0, num(g.cost) - num(g.saved));
    return { ...g, ml, need, monthly: need / ml, pct: num(g.cost) ? Math.min(100, num(g.saved) / num(g.cost) * 100) : 0 };
  });
  const active = goals.filter(g => g.active);
  const contrib = active.reduce((a, g) => a + g.monthly, 0);
  return { income, fixed, fixedOnPay, avail: income - fixed, goals, active, contrib, free: income - fixed - contrib };
}
/* aplica los eventos de los días que ya pasaron: pagos fijos con fecha, tarjetas y el día de cobro */
function advance() {
  if (!S.baseDay) return;
  let k = S.evDone || S.baseDay, changed = false;
  while (k < todayKey) {
    k = addDays(k, 1); changed = true;
    S.fixed.forEach(f => { if (f.on && num(f.day) && falls(k, num(f.day))) S.cashAdj -= num(f.v); });
    S.cards.forEach(c => { if (num(c.pay) && num(c.debt) && falls(k, num(c.pay))) { S.cashAdj -= num(c.debt); c.debt = 0; } });
    if (falls(k, paydayNum())) {
      const b = base();
      S.cashAdj += b.income - b.fixedOnPay - b.contrib;
      S.payNotice = { day: k, contrib: Math.round(b.contrib), goal: b.active[0] ? b.active[0].name : '' };
    }
  }
  S.evDone = todayKey; if (changed) save();
}
function calc() {
  const b = base();
  const counted = S.expenses.filter(counts);
  const cash = num(S.cashBase) + num(S.cashAdj) - counted.reduce((a, e) => a + num(e.v), 0);
  const savings = sumAcc('ahorro');
  const nextPay = nextPayAfter(todayKey), daysLeft = Math.max(1, daysBetween(todayKey, nextPay));
  const upcoming = []; let k = addDays(todayKey, 1);
  while (k < nextPay) {
    S.fixed.forEach(f => { if (f.on && num(f.v) && num(f.day) && falls(k, num(f.day))) upcoming.push({ n: f.n, v: num(f.v), day: k }); });
    S.cards.forEach(c => { if (num(c.pay) && num(c.debt) && falls(k, num(c.pay))) upcoming.push({ n: c.bank, v: num(c.debt), day: k }); });
    k = addDays(k, 1);
  }
  const reserved = upcoming.reduce((a, u) => a + u.v, 0);
  const todayList = S.expenses.filter(e => e.day === todayKey);
  const todaySpent = counted.filter(e => e.day === todayKey).reduce((a, e) => a + num(e.v), 0);
  const freeCycle = cash + todaySpent - reserved;
  const allowance = Math.max(0, freeCycle / daysLeft);
  const restToday = allowance - todaySpent;
  const freeLeft = freeCycle - todaySpent;
  const tomorrow = daysLeft > 1 ? Math.max(0, freeLeft / (daysLeft - 1)) : null;
  const pastCounted = counted.filter(e => e.day < todayKey).reduce((a, e) => a + num(e.v), 0);
  const daysTracked = S.baseDay ? Math.max(0, daysBetween(S.baseDay, todayKey)) : 0;
  const avg = daysTracked ? pastCounted / daysTracked : 0;
  const monthExp = S.expenses.filter(e => String(e.day).startsWith(MKEY));
  return { ...b, cash, savings, nextPay, daysLeft, upcoming, reserved, todayList, todaySpent, allowance, restToday, freeLeft, tomorrow, avg, daysTracked, monthExp, ready: !!S.baseDay };
}
function impact(X) {
  const c = calc();
  const excess = Math.max(0, X - Math.max(0, c.freeLeft));
  const months = c.contrib > 0 ? excess / c.contrib : 0;
  return { c, excess, days: Math.round(months * 30.4) };
}
const human = days => days <= 0 ? 'sin retraso' : days < 45 ? `+${days} días` : `+${(days / 30.4).toFixed(1).replace('.0', '')} meses`;
const payIn = p => p >= d ? p - d : D - d + p;

/* ---------- animación ---------- */
function split(el) {
  if (el.dataset.done) return; el.dataset.done = '1';
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const f = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(p => {
        if (!p) return;
        if (/^\s+$/.test(p)) { f.append(document.createTextNode(p)); return; }
        const o = document.createElement('span'); o.className = 'w';
        const i = document.createElement('span'); i.textContent = p; o.append(i); f.append(o);
      });
      n.replaceWith(f);
    } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
  });
  walk(el);
}
function enter(scope) {
  if (!scope) return;
  $$('[data-split]', scope).forEach(split);
  if (!G) return;
  const words = $$('[data-split] .w>span', scope).filter(w => w.offsetParent);
  G.fromTo(words, { yPercent: 110, opacity: 0, filter: 'blur(6px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'expo.out', stagger: .045 });
  const rise = $$('[data-rise], [data-reveal]', scope).filter(e => e.offsetParent);
  G.fromTo(rise, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'power3.out', stagger: .07, delay: .2, clearProps: 'transform' });
}
function setClear(v) {
  if (G) G.to(root, { '--clear': v, duration: 1.8, ease: 'sine.inOut' });
  else root.style.setProperty('--clear', v);
}
function countUp(el, to) {
  if (!el) return;
  if (!G) { el.textContent = money(to); return; }
  const o = { v: 0 };
  G.to(o, { v: to, duration: 1.4, ease: 'power3.out', onUpdate: () => { el.textContent = money(o.v); } });
}
function drawRing(el, used) {
  if (!el || !G) return;
  const L = el.getTotalLength();
  G.fromTo(el, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: L * (1 - used), duration: 1.6, ease: 'power2.inOut', delay: .4 });
}
function magnet() {
  if (!G || !matchMedia('(pointer:fine)').matches) return;
  $$('.magnet').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); G.to(b, { x: (e.clientX - r.left - r.width / 2) * .18, y: (e.clientY - r.top - r.height / 2) * .3, duration: .4, ease: 'power3.out' }); });
    b.addEventListener('pointerleave', () => G.to(b, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' }));
  });
}

/* ---------- onboarding ---------- */
const STEPS = 8; let step = 1, editing = false;
function openEdit(n) { editing = true; step = n; if (location.hash === '#perfil') renderStep(); else location.hash = 'perfil'; }
function renderStep() {
  $$('[data-step]').forEach(s => { s.hidden = Number(s.dataset.step) !== step; });
  $('#moons').hidden = editing;
  $('#moons').innerHTML = Array.from({ length: STEPS }, (_, i) => `<i class="${i + 1 < step ? 'done' : i + 1 === step ? 'now' : ''}"></i>`).join('');
  $('#stepLabel').textContent = editing ? 'Editando' : `${step} de ${STEPS}`;
  $('#nextStep').textContent = editing ? 'Guardar cambios' : step === STEPS ? 'Despejar mi cielo' : 'Seguir';
  ({ 1: r1, 2: r2, 3: r3, 4: r4, 5: r5, 6: r6, 7: r7, 8: r8 })[step]();
  setClear(editing ? .9 : .08 + step * .08);
  phone.scrollTop = 0;
  enter($(`[data-step="${step}"]`));
}
function r1() {
  $$('[data-bind]').forEach(i => { i.value = S[i.dataset.bind] ?? ''; });
  $('#currencies').innerHTML = ['S/', '$', '€', 'MX$', 'COP'].map(c => `<button type="button" class="chip" data-cur="${esc(c)}" aria-pressed="${S.currency === c}">${esc(c)}</button>`).join('');
}
function r2() {
  $('#incomeList').innerHTML = INCOME.map(([k, l]) => `<label class="field" for="inc-${k}"><span>${l}</span><input id="inc-${k}" data-inc="${k}" inputmode="decimal" value="${num(S.income[k]) || ''}" placeholder="0"></label>`).join('');
  $('#incTotal').textContent = money(base().income);
  $('#o-payday').value = S.payday === 'fin' ? '' : (num(S.payday) || '');
  $('#payFin').setAttribute('aria-pressed', S.payday === 'fin');
}
function ccHTML(c, i, edit) {
  const tone = esc(c.tone || 'a');
  const card = `<div class="cc ${tone}"><div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1"><span class="bank">${esc(c.bank || 'Mi tarjeta')}</span><small>Línea ${money(num(c.line))}</small></div>
    <div style="position:relative;z-index:1"><small>Deuda actual</small><div class="debt">${money(num(c.debt))}</div></div>
    <div class="meta" style="position:relative;z-index:1"><span>Cierra el ${num(c.close) || '—'}</span><span>Pagas el ${num(c.pay) || '—'}${num(c.pay) ? ` · en ${payIn(num(c.pay))} días` : ''}</span></div></div>`;
  if (!edit) return card;
  return `<div>${card}<div class="cc-fields" style="margin-top:16px">
    <label class="field" for="cb${i}"><span>Banco</span><input id="cb${i}" data-card="${i}" data-f="bank" value="${esc(c.bank)}"></label>
    <label class="field" for="cl${i}"><span>Línea</span><input id="cl${i}" data-card="${i}" data-f="line" inputmode="decimal" value="${num(c.line) || ''}"></label>
    <label class="field" for="cc${i}"><span>Día de cierre</span><input id="cc${i}" data-card="${i}" data-f="close" inputmode="numeric" value="${num(c.close) || ''}"></label>
    <label class="field" for="cp${i}"><span>Día de pago</span><input id="cp${i}" data-card="${i}" data-f="pay" inputmode="numeric" value="${num(c.pay) || ''}"></label>
    <label class="field" for="cd${i}" style="grid-column:1/-1"><span>Deuda actual</span><input id="cd${i}" data-card="${i}" data-f="debt" inputmode="decimal" value="${num(c.debt) || ''}"></label>
    <button type="button" class="link" data-delcard="${i}" style="justify-self:start">Quitar tarjeta</button></div></div>`;
}
function r3() { $('#ccList').innerHTML = S.cards.length ? S.cards.map((c, i) => ccHTML(c, i, true)).join('') : '<p class="lead">No registraste tarjetas. Si no usas, perfecto: una preocupación menos.</p>'; }
function r4() {
  $('#fixList').innerHTML = S.fixed.map((f, i) => `<div class="fix ${f.on ? '' : 'off'}"><button type="button" class="chip" data-fix="${i}" aria-pressed="${f.on}" style="justify-self:start">${esc(f.n)}</button>
    <label class="sr" for="fx${i}">Monto de ${esc(f.n)}</label><input id="fx${i}" data-fixv="${i}" inputmode="decimal" value="${num(f.v) || ''}" placeholder="0">
    <label class="sr" for="fd${i}">Día de pago de ${esc(f.n)}</label><input id="fd${i}" data-fixd="${i}" inputmode="numeric" value="${num(f.day) || ''}" placeholder="—"></div>`).join('');
  $('#fixTotal').textContent = money(base().fixed);
}
function accRow(a, i) {
  const custom = !ACCOUNTS().some(x => x.n === a.n);
  return `<div class="acc"><span class="n">${esc(a.n)}${a.hint ? `<small>${esc(a.hint)}</small>` : ''}</span><label class="sr" for="ac${i}">Saldo en ${esc(a.n)}</label><input id="ac${i}" data-acc="${i}" inputmode="decimal" value="${num(a.v) || ''}" placeholder="0">${custom ? `<button type="button" class="x" data-delacc="${i}" aria-label="Quitar ${esc(a.n)}">×</button>` : '<span></span>'}</div>`;
}
function accTotals() { $('#accSpendT').textContent = money(sumAcc('gasto')); $('#accSaveT').textContent = money(sumAcc('ahorro')); }
function r5() {
  $('#accSpend').innerHTML = S.accounts.map((a, i) => a.type === 'gasto' ? accRow(a, i) : '').join('');
  $('#accSave').innerHTML = S.accounts.map((a, i) => a.type === 'ahorro' ? accRow(a, i) : '').join('');
  accTotals();
}
function r6() {
  const all = [...new Set([...POOL, ...S.cats])];
  $('#catPool').innerHTML = all.map(c => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${S.cats.includes(c)}">${esc(c)}</button>`).join('');
}
function ensureGoal() { if (!S.goals.length) S.goals.push({ name: '', kind: 'Otro', cost: 0, saved: 0, date: ym(Y + 1, M), active: true }); }
function r7() {
  ensureGoal();
  const g = S.goals[0];
  $('#presets').innerHTML = PRESETS.map(p => `<button type="button" class="preset" data-preset="${p.kind}" aria-pressed="${g.kind === p.kind}"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p.icon}</svg>${p.label}</button>`).join('');
  $$('[data-goal]').forEach(i => { const k = i.dataset.goal; i.value = (k === 'cost' || k === 'saved') ? (num(g[k]) || '') : (g[k] || ''); });
  r7calc();
}
function r7calc() {
  const g = base().goals[0];
  $('#gMonthly').textContent = `${money(g.monthly)} al mes`;
  $('#gMonths').textContent = `durante ${g.ml} ${g.ml === 1 ? 'mes' : 'meses'}, hasta ${monthName(g.date)}`;
}
function r8() { $('#styles').innerHTML = STYLES.map(s => `<button type="button" class="style-opt" data-style="${s.id}" aria-pressed="${S.style === s.id}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/>${S.style === s.id ? '<circle cx="12" cy="12" r="4.5" fill="currentColor"/>' : ''}</svg><span style="display:block"><strong>${s.t}</strong><span>${s.s}</span></span></button>`).join(''); }

const perfil = $('[data-screen="perfil"]');
perfil.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.bind) S[t.dataset.bind] = t.value;
  if (t.dataset.inc) { S.income[t.dataset.inc] = num(t.value); $('#incTotal').textContent = money(base().income); }
  if (t.id === 'o-payday') { const v = Math.round(num(t.value)); S.payday = v >= 1 && v <= 31 ? v : 'fin'; $('#payFin').setAttribute('aria-pressed', S.payday === 'fin'); }
  if (t.dataset.acc) { S.accounts[t.dataset.acc].v = num(t.value); anchor(); accTotals(); }
  if (t.dataset.fixd) { const v = Math.round(num(t.value)); S.fixed[t.dataset.fixd].day = v >= 1 && v <= 31 ? v : 0; }
  if (t.dataset.card) { const c = S.cards[t.dataset.card]; c[t.dataset.f] = t.dataset.f === 'bank' ? t.value : num(t.value); const host = t.closest('.cc-fields').previousElementSibling; host.outerHTML = ccHTML(c, 0, false); }
  if (t.dataset.fixv) { S.fixed[t.dataset.fixv].v = num(t.value); $('#fixTotal').textContent = money(base().fixed); }
  if (t.dataset.goal) { const k = t.dataset.goal; S.goals[0][k] = (k === 'cost' || k === 'saved') ? num(t.value) : t.value; r7calc(); }
  save();
});
perfil.addEventListener('change', e => { if (e.target.dataset.bind) { S[e.target.dataset.bind] = e.target.value; save(); } });
perfil.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.cur) { S.currency = b.dataset.cur; r1(); }
  else if (b.dataset.delcard) { S.cards.splice(Number(b.dataset.delcard), 1); r3(); }
  else if (b.id === 'addCard') { S.cards.push({ bank: 'Nueva tarjeta', line: 3000, close: 25, pay: 15, debt: 0, tone: ['a', 'b', 'c'][S.cards.length % 3] }); r3(); }
  else if (b.dataset.fix) { const f = S.fixed[b.dataset.fix]; f.on = !f.on; r4(); }
  else if (b.id === 'addFix') { const v = $('#newFix').value.trim(); if (v) { S.fixed.push({ n: v, v: 0, on: true }); $('#newFix').value = ''; r4(); $(`#fx${S.fixed.length - 1}`).focus(); } }
  else if (b.dataset.cat) { const c = b.dataset.cat; S.cats = S.cats.includes(c) ? S.cats.filter(x => x !== c) : [...S.cats, c]; b.setAttribute('aria-pressed', S.cats.includes(c)); }
  else if (b.id === 'addCat') { const v = $('#newCat').value.trim(); if (v && !S.cats.includes(v)) { S.cats.push(v); $('#newCat').value = ''; r6(); } }
  else if (b.dataset.preset) {
    const p = PRESETS.find(x => x.kind === b.dataset.preset);
    S.goals.forEach(g => { g.active = false; });
    let i = S.goals.findIndex(g => g.kind === p.kind);
    if (i < 0) { S.goals.unshift({ name: p.name, kind: p.kind, cost: p.cost, saved: 0, date: p.date, active: true }); }
    else { const [g] = S.goals.splice(i, 1); S.goals.unshift(g); }
    S.goals[0].active = true; r7();
  }
  else if (b.dataset.style) { S.style = b.dataset.style; r8(); }
  else if (b.id === 'payFin') { S.payday = 'fin'; $('#o-payday').value = ''; b.setAttribute('aria-pressed', 'true'); }
  else if (b.dataset.addacc) { const v = $('#newAcc').value.trim(); if (!v) { $('#newAcc').focus(); return; } S.accounts.push({ n: v, type: b.dataset.addacc, v: 0 }); $('#newAcc').value = ''; r5(); $(`#ac${S.accounts.length - 1}`).focus(); }
  else if (b.dataset.delacc) { S.accounts.splice(Number(b.dataset.delacc), 1); anchor(); r5(); }
  else return;
  save();
});
function tidyGoals() {
  S.goals = S.goals.filter(g => num(g.cost) > 0);
  if (S.goals.length && !S.goals.some(g => g.active)) S.goals[0].active = true;
}
$('#nextStep').addEventListener('click', () => {
  if (step === 1 && !String(S.name || '').trim()) { $('#o-name').focus(); return; }
  if (editing) {
    if (step === 7) tidyGoals();
    editing = false; save(); location.hash = 'finanzas'; toast('Cambios guardados'); return;
  }
  if (step === STEPS) {
    tidyGoals();
    if (!S.baseDay) anchor();
    S.onboarded = true; save(); location.hash = 'calculo'; return;
  }
  step++; renderStep();
});
$('#prevStep').addEventListener('click', () => {
  if (editing) { if (step === 7) tidyGoals(); editing = false; save(); location.hash = 'finanzas'; return; }
  if (step === 1) { location.hash = 'entrar'; return; } step--; renderStep();
});

/* ---------- entrar ---------- */
$$('[data-auth]').forEach(b => b.addEventListener('click', () => { step = 1; editing = false; location.hash = 'perfil'; }));
$('#fEmail').addEventListener('submit', e => { e.preventDefault(); step = 1; editing = false; location.hash = 'perfil'; });

/* ---------- cálculo ---------- */
let calcTimers = [];
function renderCalc() {
  calcTimers.forEach(clearTimeout); calcTimers = [];
  const lines = $$('#calcLines li'); lines.forEach(l => l.classList.remove('lit'));
  $('#calcLines').hidden = false; $('#calcResult').hidden = true;
  setClear(.6);
  const c = calc();
  lines.forEach((l, i) => calcTimers.push(setTimeout(() => l.classList.add('lit'), 500 + i * 700)));
  calcTimers.push(setTimeout(() => {
    $('#calcLines').hidden = true; $('#calcResult').hidden = false;
    $('#calcHi').textContent = `listo, ${S.name || 'alma libre'}`;
    $('#calcSub').textContent = `${c.daysLeft} ${c.daysLeft === 1 ? 'día' : 'días'} para tu cobro`;
    const g = c.active[0];
    $('#calcExplain').textContent = `Tienes ${money(c.cash)} para gastar y faltan ${c.daysLeft} ${c.daysLeft === 1 ? 'día' : 'días'} para tu próximo cobro (${niceDay(c.nextPay)}). ${c.reserved ? `Separé ${money(c.reserved)} para lo que vence antes: ${c.upcoming.map(u => u.n).join(', ')}. ` : ''}El resto se reparte entre esos días. Cuando cobres, apartaré ${money(c.contrib)} ${g ? `para ${g.name}` : 'para tu sueño'} y empezamos de nuevo. Si un día te pasas, el siguiente se ajusta solo.`;
    countUp($('#calcNum'), c.allowance);
    setClear(1);
    enter($('#calcResult').parentElement);
  }, 500 + lines.length * 700 + 300));
}

/* ---------- hoy ---------- */
function greet() { const h = now.getHours(); return h < 12 ? 'buenos días' : h < 19 ? 'buenas tardes' : 'buenas noches'; }
function renderHoy() {
  const c = calc(), over = c.restToday < 0, g = c.goals.find(x => x.active) || c.goals[0];
  const used = c.allowance > 0 ? Math.min(1, c.todaySpent / c.allowance) : 1;
  const R = 100, C = 2 * Math.PI * R;
  const nextCard = [...S.cards].filter(x => num(x.pay)).sort((a, b) => payIn(num(a.pay)) - payIn(num(b.pay)))[0];
  const bd = S.birthday ? fromKey(S.birthday) : null;
  let bdIn = null;
  if (bd && !isNaN(bd)) { let nx = new Date(Y, bd.getMonth(), bd.getDate()); if (toKey(nx) < todayKey) nx = new Date(Y + 1, bd.getMonth(), bd.getDate()); bdIn = daysBetween(todayKey, toKey(nx)); }
  const notices = [];
  if (bdIn === 0) notices.push(`<div class="notice" data-reveal><strong>Feliz cumpleaños, ${esc(S.name)}.</strong><p>Hoy celebra sin culpa. Si quieres darte un gusto grande, pruébalo antes en el simulador.</p><div class="acts"><a class="mini on" href="#simular" style="display:inline-flex;align-items:center;text-decoration:none">Simular mi regalo</a></div></div>`);
  if (!c.ready || (c.cash <= 0 && !sumAcc('gasto'))) notices.push(`<div class="notice" data-reveal><strong>Cuéntame cuánto tienes hoy</strong><p>Con tu efectivo, Yape y cuenta de hoy calculo cuánto puedes gastar hasta tu próximo cobro.</p><div class="acts"><button type="button" class="mini on" data-edit="5">Poner mis saldos</button></div></div>`);
  if (S.payNotice) notices.push(`<div class="notice" data-reveal><strong>Cobraste el ${esc(niceDay(S.payNotice.day))}.</strong><p>${S.payNotice.contrib ? `Separé ${money(S.payNotice.contrib)}${S.payNotice.goal ? ` para ${esc(S.payNotice.goal)}` : ''}. Pásalo a tu ahorro y confírmamelo.` : 'Empezamos un ciclo nuevo.'} Si tus saldos no cuadran, ajústalos.</p><div class="acts">${S.payNotice.contrib ? '<button type="button" class="mini on" data-paid="1">Ya lo aparté</button>' : ''}<button type="button" class="mini" data-edit="5">Ajustar saldos</button><button type="button" class="mini" data-paid="0">Cerrar</button></div></div>`);
  const tip = over
    ? `Hoy te pasaste un poco. Si mañana gastas ${money(c.tomorrow ?? 0)} o menos, el mes sigue en ruta.`
    : bdIn && bdIn <= 14 ? `Tu cumpleaños es en ${bdIn} ${bdIn === 1 ? 'día' : 'días'}. Si planeas celebrarlo, apártalo desde ya o pruébalo en el simulador.`
    : nextCard ? `${esc(nextCard.bank)} cierra el día ${num(nextCard.close)}. Una compra grande justo después del cierre te da más días para pagarla.` : 'Vas bien. Lo que no gastes hoy se suma a tus próximos días.';
  $('#hoyBody').innerHTML = `
    <header class="hoy-head" data-reveal><div><p class="hand">${greet()}, ${esc(S.name || 'alma libre')}</p><p class="date">${d} de ${MONTHS[M]}</p></div><a class="gear" href="#finanzas" aria-label="Mis finanzas"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg></a></header>
    ${notices.join('')}
    <div class="hoy-grid"><div class="col col-a">
    <div class="sunwrap" data-reveal>
      <svg class="ring" viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="110" r="${R}" fill="none" stroke="rgba(233,225,246,.14)" stroke-width="5"/>
        <circle id="ringUse" cx="110" cy="110" r="${R}" fill="none" stroke="${over ? '#B9A6E8' : '#FFC6A8'}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${C * used} ${C}"/></svg>
      <div class="sun-core ${over ? 'over' : ''}"><span>${over ? 'Hoy te excediste' : 'Aún puedes gastar hoy'}</span><strong id="sunNum">${money(Math.abs(c.restToday))}</strong><span class="sub">de ${money(c.allowance)} · ${c.daysLeft} ${c.daysLeft === 1 ? 'día' : 'días'} para cobrar</span></div>
    </div>
    <span class="sun-note hand" aria-hidden="true">${over ? 'respira, mañana se despeja' : 'sin tocar tu sueño'}</span>
    <p class="nudge" data-reveal>${over
      ? `Gastaste <b>${money(c.todaySpent)}</b> y te excediste <b>${money(-c.restToday)}</b>. ${c.tomorrow !== null ? `Mañana tu presupuesto será <b>${money(c.tomorrow)}</b>.` : 'Mañana cobras y empezamos de nuevo.'} El cielo se despeja otra vez.`
      : `Llevas <b>${money(c.todaySpent)}</b> hoy. Lo que no uses se reparte en tus próximos días.`}</p>
    <p class="flowline" data-reveal>Tienes <b>${money(c.cash)}</b> para gastar hasta tu cobro, ${esc(niceDay(c.nextPay))}. ${c.reserved ? `De eso, <b>${money(c.reserved)}</b> ya tienen dueño: ${c.upcoming.map(u => `${esc(u.n)} el ${fromKey(u.day).getDate()}`).join(', ')}. ` : ''}Aparte guardas <b>${money(c.savings)}</b> en ahorros${c.contrib ? ` y en cada cobro apartas <b>${money(c.contrib)}</b> para tu sueño` : ''}.</p>
    </div><div class="col col-b">
    ${g ? `<div class="sec-t"><h2>Tu sueño principal</h2><a href="#metas">Ver ruta</a></div>
    <a class="arch" href="#metas" style="--p:${g.pct.toFixed(0)}%" data-reveal><span class="pct">${g.pct.toFixed(0)}%</span><span class="kind">${esc(g.kind)}</span><h3>${esc(g.name)}</h3>
      <div class="nums"><span>Ahorrado ${money(num(g.saved))} de ${money(num(g.cost))}</span><span>${money(g.monthly)}/mes</span></div></a>` : ''}
    ${S.cards.length ? `<div class="sec-t"><h2>Tarjetas</h2></div><div class="ccrow" data-reveal>${S.cards.map(cc => ccHTML(cc, 0, false)).join('')}</div>` : ''}
    <div class="sec-t"><h2>Lo de hoy</h2><button type="button" data-open-sheet>+ Agregar</button></div>
    <div class="receipt" data-reveal>${c.todayList.length
      ? `<ul>${c.todayList.slice().reverse().map(e => `<li><span>${esc(e.note || e.cat)}<small>${esc(e.cat)}</small></span><b>${money(num(e.v))}</b></li>`).join('')}</ul><div class="sum"><span>Total de hoy</span><span>${money(c.todayList.reduce((s, e) => s + num(e.v), 0))}</span></div>`
      : '<p class="empty">nada todavía. un día liviano.</p>'}</div>
    <a class="bubble" href="#copiloto" data-reveal><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFC6A8" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 3l2 5.5 5.5 2-5.5 2L12 18l-2-5.5L4.5 10.5l5.5-2z"/></svg><span>${tip}</span></a>
    <a class="bubble" href="#historial" style="background:rgba(233,225,246,.07)" data-reveal><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFC6A8" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg><span>Historial, diario de prueba y respaldo de tus datos</span></a>
    ${S.sample ? '<p class="fine">Estás viendo datos de ejemplo. Borra todo desde Historial y ajustes para usar los tuyos.</p>' : ''}
    </div></div>`;
  setClear(over ? .55 : 1);
  countUp($('#sunNum'), Math.abs(c.restToday));
  drawRing($('#ringUse'), used);
}

/* ---------- metas ---------- */
function renderMetas() {
  const c = calc();
  $('#route').innerHTML = c.goals.map((g, i) => `<div class="stop ${g.active ? 'main' : ''}">
    <div class="arch ${g.active ? '' : 'dim'}" style="--p:${g.pct.toFixed(0)}%"><span class="pct">${g.pct.toFixed(0)}%</span>
      <span class="kind">${esc(g.kind)} · ${g.active ? 'recibe tu ahorro' : 'en el horizonte'}</span><h3>${esc(g.name)}</h3>
      <div class="nums"><span>${money(num(g.saved))} de ${money(num(g.cost))}</span><span>${monthName(g.date)}</span></div>
      <div class="nums"><span>${g.active ? `Apartas ${money(g.monthly)} al mes` : `Necesitaría ${money(g.monthly)} al mes`}</span></div>
      <div class="tools">${g.active ? '' : `<button type="button" class="mini" data-main="${i}">Hacer principal</button>`}<label class="sr" for="ab${i}">Monto a abonar a ${esc(g.name)}</label><input class="abono" id="ab${i}" inputmode="decimal" placeholder="Monto"><button type="button" class="mini" data-add="${i}">Abonar</button></div>
    </div></div>`).join('');
  setClear(1);
}
$('#route').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.main) { S.goals.forEach(g => { g.active = false; }); const [g] = S.goals.splice(Number(b.dataset.main), 1); g.active = true; S.goals.unshift(g); }
  if (b.dataset.add) { const v = num($(`#ab${b.dataset.add}`).value); if (!v) { $(`#ab${b.dataset.add}`).focus(); return; } const g = S.goals[Number(b.dataset.add)]; g.saved = num(g.saved) + v; toast(`Abonaste ${money(v)} a ${g.name}`); }
  save(); renderMetas();
});
$('#ngSave').addEventListener('click', () => {
  const name = $('#ng-name').value.trim(), cost = num($('#ng-cost').value), date = $('#ng-date').value || ym(Y + 2, M);
  if (!name || !cost) { $('#ng-name').focus(); return; }
  S.goals.push({ name, kind: 'Otro', cost, saved: 0, date, active: false });
  $('#ng-name').value = ''; $('#ng-cost').value = ''; $('#newGoal').open = false;
  save(); renderMetas(); toast(`${name} ya está en tu horizonte`);
});

/* ---------- simulador ---------- */
const SIMS = [{ l: 'Nuevo iPhone', v: 4200 }, { l: 'Viaje a Cusco', v: 2500 }, { l: 'Concierto', v: 380 }, { l: 'Cena especial', v: 180 }];
let simV = 4200;
function renderSim() {
  $('#simPresets').innerHTML = SIMS.map(s => `<button type="button" class="chip" data-sim="${s.v}" aria-pressed="${simV === s.v && !$('#simAmount').value}">${esc(s.l)} · ${money(s.v)}</button>`).join('');
  const r = impact(simV), c = r.c, main = c.goals.find(g => g.active);
  const ok = r.excess <= 0;
  $('#verdict').innerHTML = `<p class="hand">${ok ? 'sí, te cabe' : r.days < 45 ? 'se puede, con un costo' : 'piénsalo una noche'}</p>
    <p>${ok ? `Lo pagas con lo que te queda libre hasta tu cobro (${money(Math.max(0, c.freeLeft))}). Tus sueños no se mueven.`
      : `Hasta tu cobro te quedan libres ${money(Math.max(0, c.freeLeft))}. Los otros ${money(r.excess)} saldrían de tus ahorros (${money(c.savings)})${main ? ` o del dinero para ${esc(main.name)}` : ''}.`}</p>`;
  $('#impacts').innerHTML = c.goals.map(g => {
    const base = Math.min(100, g.ml / (g.ml + r.days / 30.4) * 100);
    return `<div class="impact"><strong>${esc(g.name)}</strong><em>${human(r.days)}</em><div class="bar"><i style="width:${base.toFixed(1)}%"></i>${r.days > 0 ? `<b style="left:${base.toFixed(1)}%;right:0"></b>` : ''}</div></div>`;
  }).join('');
  $('#simNote').textContent = c.goals.length > 1 ? 'Tus sueños avanzan uno tras otro, así que un retraso en el principal corre todo el horizonte.' : '';
  setClear(ok ? 1 : .6);
}
$('#simPresets').addEventListener('click', e => { const b = e.target.closest('[data-sim]'); if (!b) return; simV = Number(b.dataset.sim); $('#simAmount').value = ''; renderSim(); });
$('#simAmount').addEventListener('input', e => { const v = num(e.target.value); if (v) { simV = v; renderSim(); } });

/* ---------- copiloto ---------- */
const SUGS = ['¿Puedo comprar este iPhone?', 'Hoy gasté mucho', '¿Me alcanzará para mi viaje?', '¿Cómo optimizo mis tarjetas?', '¿Estoy gastando de más?'];
const softly = () => ({ impulso: 'Te lo digo con cariño: ', noche: 'Dato para tu noche de pensarlo: ', lista: 'Y ojo, también mereces disfrutar: ' })[S.style] || '';
function answer(q) {
  const t = q.toLowerCase(), c = calc(), g = c.goals.find(x => x.active) || c.goals[0];
  const m = t.match(/\d[\d.,]*/); const amt = m ? num(m[0].replace(/[.,](?=\d{3}(\D|$))/g, '')) : 0;
  const avg = c.avg || c.allowance;
  if (/iphone|comprar|compro|puedo/.test(t)) {
    const X = amt || (/iphone/.test(t) ? 4200 : 0);
    if (!X) return 'Dime cuánto cuesta y te digo cómo mueve tus sueños. Por ejemplo: <b>¿Puedo comprar unas zapatillas de 380?</b>';
    const r = impact(X);
    if (r.excess <= 0) return `<b>Sí.</b> Valor: ${money(X)}. Te cabe en lo que te queda libre hasta tu cobro (${money(c.freeLeft)}). ${g ? esc(g.name) : 'Tu sueño'} no se mueve.`;
    return `${softly()}puedes, pero tiene precio. Valor: ${money(X)}. Hasta tu cobro te quedan libres ${money(Math.max(0, c.freeLeft))}; el resto saldría de tus ahorros (${money(c.savings)}).<br>Impacto: ${g ? esc(g.name) : 'tu sueño'} <b>${human(r.days)}</b>${c.goals.length > 1 ? ', y todo tu horizonte se corre igual' : ''}.`;
  }
  if (/gast[ée] mucho|me pas[ée]|exced/.test(t)) {
    const diff = avg ? Math.round((c.todaySpent / avg - 1) * 100) : 0;
    return `Hoy llevas ${money(c.todaySpent)}, ${diff >= 0 ? `<b>${diff}% más</b>` : `<b>${-diff}% menos</b>`} que ${c.avg ? `tu promedio diario desde que empezaste (${money(avg)})` : `tu presupuesto de hoy (${money(avg)})`}. ${c.tomorrow !== null ? `Mañana tu presupuesto será <b>${money(c.tomorrow)}</b>.` : 'Mañana cobras y empezamos de nuevo.'}`;
  }
  if (/viaje|alcanz|meta|sueño/.test(t)) {
    if (!g) return 'Aún no tienes un sueño registrado. Créalo en la sección Sueños.';
    return `Vas al <b>${g.pct.toFixed(0)}%</b> de ${esc(g.name)}: ${money(num(g.saved))} de ${money(num(g.cost))}. Si apartas ${money(g.monthly)} cada mes, llegas en <b>${monthName(g.date)}</b>. ${c.free < 0 ? 'Ojo: hoy tu ahorro no alcanza para eso; revisemos tus fijos.' : 'Con lo que tienes hoy, sí te alcanza.'}`;
  }
  if (/tarjeta/.test(t)) {
    if (!S.cards.length) return 'No tienes tarjetas registradas. Sin deudas que vigilar.';
    return S.cards.map(cc => { const use = num(cc.line) ? Math.round(num(cc.debt) / num(cc.line) * 100) : 0; return `<b>${esc(cc.bank)}</b>: usas el ${use}% de tu línea y pagas en ${payIn(num(cc.pay))} días. Compra grande justo después del día ${num(cc.close)} (cierre) para ganar más días de pago.${use > 30 ? ' Intenta bajar del 30% de uso.' : ''}`; }).join('<br><br>');
  }
  if (/de m[áa]s|gastando/.test(t)) {
    if (!c.avg) return `Aún no tengo suficientes días registrados para compararte. Por ahora: puedes gastar <b>${money(c.allowance)}</b> al día hasta tu cobro.`;
    return c.avg > c.allowance * 1.05 ? `${softly()}sí, un poco. Gastas en promedio ${money(c.avg)} al día y para llegar a tu cobro te tocan <b>${money(c.tomorrow ?? c.allowance)}</b> diarios.` : `Vas bien: gastas en promedio ${money(c.avg)} al día y tu presupuesto diario es ${money(c.allowance)}.`;
  }
  return 'Puedo decirte cuánto gastar hoy, si te alcanza para un sueño, cómo mueve una compra tus metas o cómo usar mejor tus tarjetas. ¿Qué quieres saber?';
}
function renderChat() {
  if (!S.chat.length) S.chat = [{ me: false, h: `Hola ${esc(S.name || '')}. Soy tu copiloto. Pregúntame antes de comprar y te digo cómo mueve tus sueños.` }];
  $('#chat').innerHTML = S.chat.map(m => `<div class="msg ${m.me ? 'me' : 'ai'}">${m.me ? esc(m.h) : m.h}</div>`).join('');
  $('#sugs').innerHTML = SUGS.map(s => `<button type="button" class="chip" data-q="${esc(s)}">${esc(s)}</button>`).join('');
  setClear(.9);
}
function ask(q) {
  if (!q.trim()) return;
  S.chat.push({ me: true, h: q.trim() });
  S.chat.push({ me: false, h: answer(q) });
  S.chat = S.chat.slice(-30); save(); renderChat();
  const last = $('#chat').lastElementChild;
  if (G) G.from(last, { y: 16, opacity: 0, duration: .6, ease: 'power3.out' });
  phone.scrollTo({ top: phone.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
}
$('#sugs').addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (b) ask(b.dataset.q); });
$('#askForm').addEventListener('submit', e => { e.preventDefault(); const i = $('#askInput'); ask(i.value); i.value = ''; });

/* ---------- hoja de gasto ---------- */
let exCat = null;
function openSheet() {
  exCat = S.cats[0] || 'Comida';
  $('#exCur').textContent = S.currency;
  $('#exAmount').value = ''; $('#exNote').value = ''; $('#exDate').value = todayKey; $('#exDate').max = todayKey;
  const cats = [...S.cats, ...POOL.filter(c => !S.cats.includes(c)).slice(0, 3)];
  $('#exCats').innerHTML = cats.map(c => `<button type="button" class="chip" data-ex="${esc(c)}" aria-pressed="${c === exCat}">${esc(c)}</button>`).join('');
  preview();
  $('#sheet').classList.add('on'); $('#scrim').classList.add('on'); $('#sheet').setAttribute('aria-hidden', 'false'); $('#sheet').inert = false;
  setTimeout(() => $('#exAmount').focus(), 350);
}
function closeSheet() { $('#sheet').classList.remove('on'); $('#scrim').classList.remove('on'); $('#sheet').setAttribute('aria-hidden', 'true'); $('#sheet').inert = true; }
function preview() {
  const v = num($('#exAmount').value), c = calc(), rest = c.restToday - v;
  $('#exPreview').textContent = !v ? `Hoy aún tienes ${money(Math.max(0, c.restToday))}.` : rest >= 0 ? `Después de esto te quedan ${money(rest)} para hoy.` : `Con esto te pasas ${money(-rest)} hoy. Mañana se ajusta solo.`;
}
$('#fab').addEventListener('click', openSheet);
$('#railAdd').addEventListener('click', openSheet);
$('#hoyBody').addEventListener('click', e => {
  if (e.target.closest('[data-open-sheet]')) return openSheet();
  const ed = e.target.closest('[data-edit]'); if (ed) return openEdit(Number(ed.dataset.edit));
  const pd = e.target.closest('[data-paid]');
  if (pd) {
    if (pd.dataset.paid === '1' && S.payNotice) { const g = S.goals.find(x => x.active); if (g) { g.saved = num(g.saved) + S.payNotice.contrib; toast(`Sumé ${money(S.payNotice.contrib)} a ${g.name}`); } }
    S.payNotice = null; save(); renderHoy();
  }
});
$('#scrim').addEventListener('click', closeSheet);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#sheet').classList.contains('on')) closeSheet(); });
$('#exAmount').addEventListener('input', preview);
$('#exCats').addEventListener('click', e => { const b = e.target.closest('[data-ex]'); if (!b) return; exCat = b.dataset.ex; $$('#exCats .chip').forEach(x => x.setAttribute('aria-pressed', x === b)); });
let lastT = null;
$('#sheet').addEventListener('submit', e => {
  e.preventDefault();
  const v = num($('#exAmount').value); if (!v) { $('#exAmount').focus(); return; }
  lastT = Date.now();
  S.expenses.push({ v, cat: exCat, note: $('#exNote').value.trim(), day: ($('#exDate').value && $('#exDate').value <= todayKey) ? $('#exDate').value : todayKey, t: lastT });
  save(); closeSheet();
  if (location.hash === '#historial') renderHist(); else if (location.hash !== '#hoy') location.hash = 'hoy'; else renderHoy();
  toast(`Guardado: ${money(v)} en ${exCat}`, true);
});

/* ---------- toast ---------- */
let toastTimer;
function toast(msg, undo) {
  $('#toastText').textContent = msg; $('#toastUndo').hidden = !undo;
  $('#toast').classList.add('on'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('on'), 4200);
}
$('#toastUndo').addEventListener('click', () => {
  S.expenses = S.expenses.filter(x => x.t !== lastT); save();
  $('#toast').classList.remove('on'); if (location.hash === '#hoy') renderHoy();
});

/* ---------- reiniciar ---------- */
function armReset(btn, label) {
  btn.addEventListener('click', () => {
    if (btn.dataset.armed) { S = clone(EMPTY); save(); step = 1; btn.textContent = label; delete btn.dataset.armed; location.hash = 'inicio'; go(); return; }
    btn.dataset.armed = '1'; btn.textContent = 'Se borra todo. Toca otra vez para confirmar';
    setTimeout(() => { btn.textContent = label; delete btn.dataset.armed; }, 4000);
  });
}
armReset($('#wipeData'), 'Borrar todo');
$('#loadSample').addEventListener('click', () => { S = clone(SAMPLE); save(); location.hash = 'hoy'; go(); });

/* ---------- historial, diario y respaldo ---------- */
function dayLabel(k) {
  const [y, m, dd] = k.split('-').map(Number);
  const dt = new Date(y, m - 1, dd), diff = Math.round((new Date(Y, M, d) - dt) / 864e5);
  return diff === 0 ? 'Hoy' : diff === 1 ? 'Ayer' : `${dd} de ${MONTHS[m - 1]}`;
}
function renderHist() {
  const c = calc();
  const total = c.monthExp.reduce((a, e) => a + num(e.v), 0);
  const byCat = {}; c.monthExp.forEach(e => { byCat[e.cat] = (byCat[e.cat] || 0) + num(e.v); });
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]); const max = cats.length ? cats[0][1] : 1;
  $('#histSummary').innerHTML = `<p class="flowline">En ${MONTHS[M]} registraste <b>${money(total)}</b> en gastos del día a día. Hasta tu cobro te quedan <b>${money(Math.max(0, c.freeLeft))}</b> libres.</p>
    ${cats.length ? `<div class="impacts" style="margin-top:18px">${cats.map(([k, v]) => `<div class="impact"><strong>${esc(k)}</strong><em>${money(v)}</em><div class="bar"><i style="width:${(v / max * 100).toFixed(1)}%"></i></div></div>`).join('')}</div>` : ''}`;
  const all = [...S.expenses].sort((a, b) => (b.day > a.day ? 1 : b.day < a.day ? -1 : b.t - a.t)).slice(0, 120);
  const days = [...new Set(all.map(e => e.day))];
  $('#histList').innerHTML = days.length ? days.map(k => {
    const items = all.filter(e => e.day === k);
    return `<h3 class="dayh">${dayLabel(k)}</h3><div class="receipt"><ul>${items.map(e => `<li><span>${esc(e.note || e.cat)}<small>${esc(e.cat)}</small></span><span style="display:flex;gap:10px;align-items:center"><b>${money(num(e.v))}</b><button type="button" class="mini" data-del="${e.t}" aria-label="Borrar ${esc(e.note || e.cat)}">Borrar</button></span></li>`).join('')}</ul><div class="sum"><span>Total</span><span>${money(items.reduce((a, e) => a + num(e.v), 0))}</span></div></div>`;
  }).join('') : '<p class="lead">Aún no registras gastos. Usa el botón + cada vez que gastes algo.</p>';
  $('#notes').innerHTML = S.notes.length ? S.notes.map((n, i) => `<li><span class="hand">${dayLabel(n.d)}</span><span>${esc(n.t)}</span><button type="button" class="mini" data-delnote="${i}" aria-label="Borrar nota">×</button></li>`).join('') : '<li class="fine">Tu diario está vacío.</li>';
  setClear(1);
}
$('#histList').addEventListener('click', e => {
  const b = e.target.closest('[data-del]'); if (!b) return;
  S.expenses = S.expenses.filter(x => String(x.t) !== b.dataset.del); save(); renderHist(); toast('Gasto borrado');
});
$('#noteForm').addEventListener('submit', e => {
  e.preventDefault(); const v = $('#noteInput').value.trim(); if (!v) return;
  S.notes.push({ d: todayKey, t: v }); $('#noteInput').value = ''; save(); renderHist();
});
$('#notes').addEventListener('click', e => { const b = e.target.closest('[data-delnote]'); if (!b) return; S.notes.splice(Number(b.dataset.delnote), 1); save(); renderHist(); });
$('#copyNotes').addEventListener('click', () => {
  const txt = S.notes.map(n => `${n.d}: ${n.t}`).join('\n') || '(sin notas)';
  if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => toast('Diario copiado. Pégamelo en el chat')).catch(() => toast('No pude copiar. Mantén presionado el texto para copiarlo'));
});
$('#exportData').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }));
  a.download = `copiloto-respaldo-${todayKey}.json`; document.body.append(a); a.click(); a.remove();
  toast('Respaldo descargado');
});
$('#importData').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try { const data = JSON.parse(r.result); if (!data.income || !Array.isArray(data.goals) || !Array.isArray(data.expenses)) throw 0; S = data; migrate(); save(); toast('Respaldo cargado'); go(); }
    catch (err) { toast('Ese archivo no es un respaldo de Copiloto'); }
  };
  r.readAsText(f); e.target.value = '';
});

/* ---------- mis finanzas ---------- */
function age(b) { const dt = fromKey(b); if (isNaN(dt)) return ''; let a = Y - dt.getFullYear(); if (M < dt.getMonth() || (M === dt.getMonth() && d < dt.getDate())) a--; return a; }
function renderFin() {
  const c = calc(), g = c.goals.find(x => x.active);
  const st = STYLES.find(s => s.id === S.style) || STYLES[0];
  const debt = S.cards.reduce((a, x) => a + num(x.debt), 0);
  const fx = S.fixed.filter(f => f.on && num(f.v));
  const bd = S.birthday ? fromKey(S.birthday) : null;
  const sec = (n, hand, big, det, btn) => `<div class="fin" data-reveal><p class="hand">${hand}</p><div class="big">${big}</div><p class="det">${det}</p><button type="button" class="mini" data-edit="${n}">${btn || 'Editar'}</button></div>`;
  $('#finBody').innerHTML = [
    sec(1, 'sobre ti', esc(S.name || '—'), `${bd && !isNaN(bd) ? `Cumpleaños: ${bd.getDate()} de ${MONTHS[bd.getMonth()]} · ${age(S.birthday)} años · ` : ''}${esc(S.country)} · ${esc(S.currency)}`),
    sec(5, 'tu dinero hoy', money(c.cash), `Para gastar ahora · ahorros ${money(c.savings)}. Actualízalo si tus saldos no cuadran.`, 'Actualizar saldos'),
    sec(2, 'lo que entra', `${money(c.income)}<span class="det"> /mes</span>`, `Cobras ${S.payday === 'fin' ? 'a fin de mes' : `el día ${num(S.payday)}`} · próximo cobro ${esc(niceDay(c.nextPay))}`),
    sec(4, 'gastos fijos', `${money(c.fixed)}<span class="det"> /mes</span>`, fx.length ? fx.map(f => `${esc(f.n)}${num(f.day) ? ` (día ${num(f.day)})` : ''}`).join(' · ') : 'Sin gastos fijos registrados'),
    sec(3, 'tarjetas', S.cards.length ? money(debt) : 'Sin tarjetas', S.cards.length ? S.cards.map(x => `${esc(x.bank)}: paga el ${num(x.pay) || '—'}`).join(' · ') + '. Actualiza la deuda cuando llegue tu estado de cuenta.' : 'Agrega una si usas crédito'),
    sec(7, 'sueño principal', g ? esc(g.name) : 'Sin sueño aún', g ? `${money(num(g.saved))} de ${money(num(g.cost))} · ${money(g.monthly)} al mes` : 'Crea uno para que tu ahorro tenga destino'),
    sec(6, 'tus categorías', `${S.cats.length}`, S.cats.map(esc).join(' · ')),
    sec(8, 'tono del copiloto', esc(st.t), esc(st.s))
  ].join('');
  setClear(1);
}
$('#finBody').addEventListener('click', e => { const b = e.target.closest('[data-edit]'); if (b) openEdit(Number(b.dataset.edit)); });

/* ---------- rutas ---------- */
const SCREENS = ['inicio', 'entrar', 'perfil', 'calculo', 'hoy', 'metas', 'simular', 'copiloto', 'historial', 'finanzas'];
const APP = ['hoy', 'metas', 'simular', 'copiloto', 'historial', 'finanzas'];
const CLEAR = { inicio: 0, entrar: .08 };
const RENDER = { perfil: renderStep, calculo: renderCalc, hoy: renderHoy, metas: renderMetas, simular: renderSim, copiloto: renderChat, historial: renderHist, finanzas: renderFin };
function go() {
  let h = location.hash.slice(1);
  if (!SCREENS.includes(h)) h = S.onboarded ? 'hoy' : 'inicio';
  if (APP.includes(h) && !S.onboarded) h = 'inicio';
  closeSheet(); advance();
  $$('.screen').forEach(s => s.classList.toggle('on', s.dataset.screen === h));
  device.classList.toggle('in-app', APP.includes(h));
  $$('.tabbar a, .rail a').forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#' + h ? 'page' : 'false'));
  $$('.flow a').forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + h)));
  phone.scrollTop = 0;
  if (h in CLEAR) setClear(CLEAR[h]);
  if (RENDER[h]) RENDER[h]();
  if (h !== 'perfil') enter($(`[data-screen="${h}"]`));
}
addEventListener('hashchange', go);
magnet();
go();
}
