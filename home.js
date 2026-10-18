// ---- Boot: a short, skippable sequence, once per session ----
(() => {
    const boot = document.getElementById('boot');
    let seen = false; try { seen = sessionStorage.getItem('sp-booted') === '1'; } catch {}
    if (seen || calm) return boot.remove();
    const lines = ['SP_SYS_01 // BIOS OK', `MOUNTING PROJECT INDEX ... <em>${PROJECTS.length} ENTRIES</em>`, 'LOADING DOSSIERS ... <em>OK</em>', 'RENDERER ... <em>OK</em>', 'OPERATOR SP_1102 ... <span>AUTHENTICATED</span>', '> WELCOME.'];
    let i = 0;
    const end = () => { clearInterval(iv); try { sessionStorage.setItem('sp-booted', '1'); } catch {} boot.classList.add('off'); setTimeout(() => boot.remove(), 600); };
    const iv = setInterval(() => (i < lines.length ? boot.insertAdjacentHTML('beforeend', `<div>${lines[i++]}</div>`) : end()), 170);
    boot.addEventListener('click', end); addEventListener('keydown', end, { once: true });
})();

// ---- Hero text ----
scramble(document.querySelector('#name span'), 'SHRESTHA', 900);
scramble(document.querySelector('#name .r'), 'PANDEY', 1200);
(() => { // typed subtitle
    const el = document.getElementById('sub'), text = 'AI SYSTEMS. FULL-STACK. FOUNDER.';
    if (calm) return (el.textContent = text);
    let i = 0; setTimeout(function t() { el.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(t, 55); }, 1300);
})();
document.getElementById('count').textContent = PROJECTS.length + ' indexed';
document.getElementById('livecount').textContent = PROJECTS.filter(p => p.live).length + ' live';

// ---- Project index + inspector ----
const targets = document.getElementById('targets'), insp = document.getElementById('insp');
targets.innerHTML = PROJECTS.map((p, i) => `
    <li data-i="${i}" style="--hot:${p.accent}">
        <a class="target" href="project.html?id=${p.id}">
            <span class="idx">${sysCode(i)}</span>
            <span><h3>${esc(p.title)}</h3><span class="k mono">${esc(p.kind)}</span></span>
            <span class="pill ${p.live ? 'live' : p.repo ? 'src' : ''}">${statusOf(p)}</span>
        </a>
        <div class="mlinks">${p.live ? `<a href="${esc(p.live)}" target="_blank" rel="noopener">Live ↗</a>` : ''}${p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">Source ↗</a>` : ''}</div>
    </li>`).join('');

function show(i) {
    const p = PROJECTS[i];
    targets.querySelectorAll('li').forEach(li => li.classList.toggle('on', +li.dataset.i === i));
    insp.style.setProperty('--hot', p.accent);
    insp.innerHTML = `
        ${p.media && p.media[0] ? `<figure class="i-shot"><img src="${shotOf(p.media[0])}" alt="" decoding="async"></figure>` : ''}
        <p class="sys mono">${sysCode(i)} // ${esc(p.kind)}</p>
        <h3>${esc(p.title)}</h3>
        <p class="mono">${statusOf(p)} · ${p.year}</p>
        <p class="sum">${esc(p.summary)}</p>
        <div class="st">${p.stats.map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>
        <div class="go">
            <a class="btn main" href="project.html?id=${p.id}">Open dossier →</a>
            ${p.live ? `<a class="btn" href="${esc(p.live)}" target="_blank" rel="noopener">Live ↗</a>` : ''}
            ${p.repo ? `<a class="btn" href="${esc(p.repo)}" target="_blank" rel="noopener">Source ↗</a>` : ''}
        </div>`;
}
targets.addEventListener('pointerover', e => { const li = e.target.closest('li'); if (li) { show(+li.dataset.i); window.hudFocus && window.hudFocus(+li.dataset.i); } });
targets.addEventListener('focusin', e => { const li = e.target.closest('li'); if (li) { show(+li.dataset.i); window.hudFocus && window.hudFocus(+li.dataset.i); } });
targets.addEventListener('pointerleave', () => window.hudFocus && window.hudFocus(-1));
show(0);

// ---- Clock, progress, pointer coordinates, nav highlight ----
const clock = document.getElementById('clock'), prog = document.getElementById('prog'), coords = document.getElementById('coords');
const tick = () => clock.textContent = new Date().toLocaleTimeString([], { hour12: false });
tick(); setInterval(tick, 1000);
addEventListener('scroll', () => prog.style.scale = (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) + ' 1', { passive: true });
addEventListener('pointermove', e => coords.textContent = `X ${(e.clientX / innerWidth * 2 - 1).toFixed(2)} · Y ${(-(e.clientY / innerHeight) * 2 + 1).toFixed(2)}`);
const navLinks = [...document.querySelectorAll('.nav a')];
const seenObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) navLinks.forEach(a => a.setAttribute('aria-current', String(a.hash === '#' + e.target.id))); }), { rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('main > section').forEach(s => seenObs.observe(s));

// ---- Background: a branching timeline. One luminous trunk splits into a strand per project (each in its colour);
// strands grow, carry pulses, get pruned and regrow. Hover a project to light its branch. ----
(() => {
    const canvas = document.getElementById('bg-canvas'), ctx = canvas.getContext('2d');
    const DPR = Math.min(devicePixelRatio || 1, 2), cols = PROJECTS.map(p => p.accent), N = cols.length;
    const R = (a, b) => a + Math.random() * (b - a), accentNow = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e50914';
    let W, H, branches = [], pulses = [], focus = -1, mono = null, trunkCol = accentNow(), t = 0, mx = 0, my = 0, smx = 0, smy = 0, nextPrune = 4;

    // A strand wanders: a slow sine sway plus jitter, eased toward a heading so it keeps travelling outward.
    const walk = (x, y, ang, len, heading, ph, maxSteps = 900) => {
        const pts = [x, y];
        for (let i = 0; i < maxSteps; i++) {
            ang += Math.sin(i * .06 + ph) * .03 + R(-.012, .012) + (heading - ang) * .012;
            x += Math.cos(ang) * len; y += Math.sin(ang) * len; pts.push(x, y);
            if (x > W * 1.08 || y < -H * .1 || y > H * 1.1) break;
        }
        return pts;
    };
    const add = (pts, k, w, depth, delay) => { const b = { pts, n: pts.length / 2, k, w, depth, delay, g: 0, a: 1, state: 0, wait: 0, flash: 0 }; branches.push(b); return b; };

    const build = (grown = false) => {
        W = canvas.width = Math.round(innerWidth * DPR); H = canvas.height = Math.round(innerHeight * DPR);
        const len = 7 * DPR, small = innerWidth < 700; branches = []; pulses = [];
        const trunk = walk(-.04 * W, .5 * H, 0, len, 0, R(0, 6), Math.round(W * .62 / len));
        add(trunk, -1, 3.4 * DPR, 0, 0);
        for (let i = 0; i < N; i++) {
            const f = .16 + .56 * i / (N - 1), j = Math.floor(f * (trunk.length / 2 - 1)), side = i % 2 ? 1 : -1;
            const spread = (.22 + .6 * ((i >> 1) / (N / 2))) * side + R(-.06, .06); // alternate above/below, wider the later they split
            const main = walk(trunk[j * 2], trunk[j * 2 + 1], spread * .4, len, spread * .5, R(0, 6));
            add(main, i, 1.9 * DPR, 1, .6 + i * .13);
            for (let s = 0, subs = small ? 2 : 3 + (i % 3); s < subs; s++) {
                const m = Math.floor(R(.12, .8) * (main.length / 2 - 2)), dir = Math.random() < .5 ? -1 : 1;
                const sub = walk(main[m * 2], main[m * 2 + 1], spread * .5 + dir * R(.2, .5), len * .9, spread * .5 + dir * R(.5, 1), R(0, 6), Math.floor(R(30, 90)));
                add(sub, i, 1 * DPR, 2, 1.3 + i * .13 + s * .25);
                if (!small && Math.random() < .55) { const m2 = Math.floor(R(.3, .8) * (sub.length / 2 - 2)); add(walk(sub[m2 * 2], sub[m2 * 2 + 1], spread * .5 + dir * R(.6, 1.1), len * .8, spread * .5 + dir * R(.8, 1.4), R(0, 6), Math.floor(R(15, 40))), i, .7 * DPR, 3, 2 + i * .13 + s * .25); }
            }
        }
        if (grown) branches.forEach(b => { b.g = 1; b.state = 2; });
        pulses = Array.from({ length: small ? 10 : 22 }, () => ({ b: null, u: 0, sp: R(.1, .26) }));
    };
    build(); addEventListener('resize', () => build(true));
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; });
    window.hudFocus = i => { focus = i; };                                    // hovered project: its branch glows, the rest recede
    window.heroTint = hex => { mono = hex; trunkCol = hex; };                 // `theme` in the shell: everything goes one colour

    const pickPulseBranch = () => { const live = branches.filter(b => b.state >= 1 && b.state <= 2 && b.g > .5 && b.depth > 0); return live.length ? live[(Math.random() * live.length) | 0] : null; };
    const step = dt => { // dt in seconds
        t += dt; smx += (mx - smx) * Math.min(1, dt * 3); smy += (my - smy) * Math.min(1, dt * 3);
        for (const b of branches) {
            if (b.state === 0 && t >= b.delay) b.state = 1;
            if (b.state === 1) { b.g = Math.min(1, b.g + dt / (2.2 + b.depth * .7)); if (b.g >= 1) b.state = 2; }
            if (b.state === 3) { b.a -= dt / 1.4; b.flash = Math.max(0, b.flash - dt * 2); if (b.a <= 0) { b.state = 4; b.wait = R(1.5, 3.5); } }
            if (b.state === 4 && (b.wait -= dt) <= 0) { b.g = 0; b.a = 1; b.state = 1; }
        }
        if (t > nextPrune) { // a strand is pruned: it flashes, fades, then a new one grows in its place
            nextPrune = t + R(3, 6);
            const held = branches.filter(b => b.state === 2 && b.depth >= 2); if (held.length) { const b = held[(Math.random() * held.length) | 0]; b.state = 3; b.flash = 1; }
        }
        for (const p of pulses) { if (!p.b || p.b.state > 2 || p.u >= p.b.g) { p.b = pickPulseBranch(); p.u = 0; } else p.u += dt * p.sp; }
    };
    const draw = () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
        ctx.translate(-smx * 14 * DPR, -smy * 8 * DPR); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = ctx.lineJoin = 'round';
        const tip = [];
        for (const b of branches) {
            if (b.state === 0 || b.a <= 0) continue;
            const m = Math.max(2, Math.floor(b.g * (b.n - 1)) + 1), col = mono || (b.k < 0 ? trunkCol : cols[b.k]);
            const f = (focus < 0 ? 1 : b.k === focus ? 2 : b.k < 0 ? .8 : .28) * (innerWidth < 700 ? .55 : 1), base = [.9, .6, .42, .3][b.depth];
            ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(b.pts[0], b.pts[1]); for (let i = 1; i < m; i++) ctx.lineTo(b.pts[i * 2], b.pts[i * 2 + 1]);
            ctx.lineWidth = b.w * 4; ctx.globalAlpha = Math.min(1, .07 * f) * b.a; ctx.stroke();      // soft halo
            ctx.lineWidth = b.w * (focus === b.k ? 1.5 : 1); ctx.globalAlpha = Math.min(1, base * f) * b.a; ctx.stroke();  // the strand
            if (b.state === 1 || b.flash > 0) tip.push([b.pts[(m - 1) * 2], b.pts[(m - 1) * 2 + 1], col, b.flash]);
        }
        ctx.globalAlpha = 1;
        for (const [x, y, col, fl] of tip) { ctx.fillStyle = fl > 0 ? '#fff' : col; ctx.globalAlpha = fl > 0 ? fl : .8; ctx.beginPath(); ctx.arc(x, y, (fl > 0 ? 3 + 6 * (1 - fl) : 2) * DPR, 0, 6.283); ctx.fill(); }
        for (const p of pulses) { // a bright bead travelling out along a strand
            if (!p.b) continue; const i = Math.min(p.b.n - 1, Math.floor(p.u * (p.b.n - 1))), x = p.b.pts[i * 2], y = p.b.pts[i * 2 + 1], col = mono || cols[p.b.k];
            ctx.fillStyle = col; ctx.globalAlpha = .18 * p.b.a; ctx.beginPath(); ctx.arc(x, y, 7 * DPR, 0, 6.283); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.globalAlpha = .85 * p.b.a; ctx.beginPath(); ctx.arc(x, y, 1.6 * DPR, 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 1;
    };
    if (calm) { build(true); draw(); return; } // reduced motion: a fully grown, still timeline
    let last = performance.now();
    (function loop(now) { requestAnimationFrame(loop); const dt = Math.min(.1, (now - last) / 1000); last = now; step(dt); draw(); canvas.style.opacity = String(1 - Math.min(1, scrollY / innerHeight) * .6); })(last);
})();

// ---- Shell: type /// ----
(() => {
    try { applyTheme(localStorage.getItem('sp-theme')); } catch {}
    const cli = document.getElementById('cli'), inp = document.getElementById('cli-in'), out = document.getElementById('cli-out');
    const say = h => { const d = document.createElement('div'); d.innerHTML = h; out.append(d); out.scrollTop = out.scrollHeight; };
    say('> SYSTEM READY. TYPE <b>help</b> FOR PROTOCOLS.');
    const hist = []; let hi = 0, buf = '';
    const toggle = on => { cli.classList.toggle('on', on); if (on) setTimeout(() => inp.focus(), 350); else inp.blur(); };
    window.openShell = () => toggle(true);
    addEventListener('keydown', e => {
        if (e.key === 'Escape') return toggle(false);
        if (document.activeElement === inp || e.metaKey || e.ctrlKey || e.altKey || e.key.length > 1) return;
        buf = (buf + e.key).slice(-3);
        if (buf === '///') { buf = ''; toggle(!cli.classList.contains('on')); }
    });
    const find = q => PROJECTS.find(p => p.id === q || p.title.toLowerCase().startsWith(q));
    const cmds = {
        help: () => say(`> <b>whoami</b> · <b>projects</b> · <b>open</b> &lt;name&gt; · <b>live</b> · <b>theme</b> &lt;${Object.keys(THEMES).join('|')}&gt; · <b>status</b> · <b>hire</b> · <b>clear</b> · <b>exit</b>`),
        whoami: () => say('> SP_1102 // Shrestha Pandey. AI systems architect, full-stack dev, founder. Year 2 at VIT Bhopal.'),
        status: () => say(`> ALL SYSTEMS NOMINAL. ${PROJECTS.length} PROJECTS INDEXED, ${PROJECTS.filter(p => p.live).length} LIVE.`),
        projects: () => PROJECTS.forEach((p, i) => say(`> ${sysCode(i)}  <b>${esc(p.id.padEnd(14)).replace(/ /g, '&nbsp;')}</b> ${esc(p.title)}`)),
        live: () => PROJECTS.filter(p => p.live).forEach(p => say(`> ${esc(p.title)} <a href="${esc(p.live)}" target="_blank" rel="noopener">${esc(p.live)}</a>`)),
        hire: () => { say('> EXCELLENT CHOICE. OPENING COMMS...'); setTimeout(() => location.href = 'mailto:shresthakp07@gmail.com', 700); },
        clear: () => { out.innerHTML = ''; },
        exit: () => toggle(false),
        theme: a => applyTheme(a) ? (say(`> THEME ${esc(a.toUpperCase())} APPLIED.`), window.heroTint && window.heroTint(THEMES[a][0])) : say('> OPTIONS: ' + Object.keys(THEMES).join(', ')),
        open: a => { const p = find(a); p ? (say(`> ROUTING TO ${esc(p.title.toUpperCase())}...`), setTimeout(() => location.href = `project.html?id=${p.id}`, 600)) : say('> NO SUCH TARGET. TRY: projects'); },
    };
    inp.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); hi = Math.max(0, Math.min(hist.length, hi + (e.key === 'ArrowUp' ? -1 : 1))); inp.value = hist[hi] || ''; return; }
        if (e.key === 'Tab') { e.preventDefault(); const v = inp.value.trim().toLowerCase(), pool = [...Object.keys(cmds), ...PROJECTS.map(p => 'open ' + p.id)], m = pool.filter(c => c.startsWith(v)); if (m.length === 1) inp.value = m[0]; else if (m.length) say('> ' + m.join('  ')); return; }
        if (e.key !== 'Enter') return;
        const raw = inp.value.trim().toLowerCase(); inp.value = ''; if (raw) { hist.push(raw); hi = hist.length; }
        say(`root@SP_SYS:~# <b>${esc(raw)}</b>`);
        const [c, ...rest] = raw.split(/\s+/);
        (cmds[c] || (() => raw && say(`> ERR: UNKNOWN DIRECTIVE '${esc(raw)}'.`)))(rest.join(' '));
    });
    cli.addEventListener('click', () => inp.focus());
})();
