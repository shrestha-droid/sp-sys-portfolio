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
document.getElementById('count').textContent = PROJECTS.length + ' online';

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

// ---- Background: a generative flow field. Thousands of thin streaks follow a slow noise field;
// each streak carries one project's colour, so hovering a project lights its share of the field. ----
(() => {
    const canvas = document.getElementById('bg-canvas'), ctx = canvas.getContext('2d');
    const DPR = Math.min(devicePixelRatio || 1, 2), TAU = Math.PI * 2;
    // Small gradient-noise (Perlin) so the field is smooth and has no external dependency.
    const perm = new Uint8Array(512); { const p = [...Array(256).keys()].sort(() => Math.random() - .5); for (let i = 0; i < 512; i++) perm[i] = p[i & 255]; }
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10), lerp = (a, b, t) => a + (b - a) * t;
    const grad = (h, x, y) => { const u = (h & 1) ? x : -x, v = (h & 2) ? y : -y; return u + v; };
    const noise = (x, y) => { const X = Math.floor(x) & 255, Y = Math.floor(y) & 255; x -= Math.floor(x); y -= Math.floor(y); const u = fade(x), v = fade(y), A = perm[X] + Y, B = perm[X + 1] + Y;
        return lerp(lerp(grad(perm[A], x, y), grad(perm[B], x - 1, y), u), lerp(grad(perm[A + 1], x, y - 1), grad(perm[B + 1], x - 1, y - 1), u), v); };

    const colours = PROJECTS.map(p => p.accent), N = 56; // N: points kept per streak
    let W, H, parts = [], mx = -999, my = -999, focus = -1, mono = null, t = 0;
    const spawn = (p = {}) => { p.x = Math.random() * W; p.y = Math.random() * H; p.age = 0; p.max = 160 + Math.random() * 320; p.k = p.k ?? (Math.random() * colours.length) | 0; p.v = .8 + Math.random() * 1.1;
        p.tr = p.tr || new Float32Array(N * 2); for (let i = 0; i < N; i++) { p.tr[i * 2] = p.x; p.tr[i * 2 + 1] = p.y; } return p; };
    const fit = () => { W = canvas.width = Math.round(innerWidth * DPR); H = canvas.height = Math.round(innerHeight * DPR);
        parts = Array.from({ length: Math.min(750, Math.round(W * H / 5200 / DPR)) }, () => spawn()); };
    fit(); addEventListener('resize', fit);
    addEventListener('pointermove', e => { mx = e.clientX * DPR; my = e.clientY * DPR; });
    window.hudFocus = i => { focus = i; };                 // hovered project: its streaks glow, the rest recede
    window.heroTint = hex => { mono = hex; };               // `theme` in the shell: the whole field goes one colour

    const TIERS = [.12, .3, .75]; // tail, middle, head
    const draw = dt => {
        const scale = DPR * 0.0011, drift = t * 0.00005, R = 170 * DPR; // the field itself evolves over tens of seconds
        for (const p of parts) {
            const ang = noise(p.x * scale + 7.3, p.y * scale + drift) * TAU * 1.15;
            let vx = Math.cos(ang) * p.v * DPR * dt, vy = Math.sin(ang) * p.v * DPR * dt;
            const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
            if (d2 < R * R) { const d = Math.sqrt(d2) + 1, f = (1 - d / R) * 2.4 * DPR * dt; vx += (-dy / d) * f + (dx / d) * f * .5; vy += (dx / d) * f + (dy / d) * f * .5; } // the pointer stirs the field
            p.tr.copyWithin(0, 2); p.x += vx; p.y += vy; p.age += dt; p.tr[(N - 1) * 2] = p.x; p.tr[(N - 1) * 2 + 1] = p.y;
            if (p.age > p.max || p.x < -30 || p.y < -30 || p.x > W + 30 || p.y > H + 30) spawn(p);
        }
        ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        const per = Math.floor((N - 1) / TIERS.length);
        colours.forEach((col, k) => {
            const on = focus === k, dim = focus >= 0 && !on, base = dim ? .35 : on ? 1.6 : 1;
            ctx.strokeStyle = mono || col; ctx.lineWidth = (on ? 2.2 : 1.4) * DPR;
            TIERS.forEach((a, j) => {
                ctx.globalAlpha = Math.min(1, a * base);
                ctx.beginPath();
                for (const p of parts) { if (p.k !== k) continue; const s = j * per, e = j === TIERS.length - 1 ? N - 1 : (j + 1) * per; ctx.moveTo(p.tr[s * 2], p.tr[s * 2 + 1]); for (let i = s + 1; i <= e; i++) ctx.lineTo(p.tr[i * 2], p.tr[i * 2 + 1]); }
                ctx.stroke();
            });
        });
        ctx.globalAlpha = 1;
    };
    if (calm) { for (let i = 0; i < 90; i++) { t += 16; draw(1); } return; } // reduced motion: one still, pre-drawn frame
    let last = performance.now();
    (function loop(now) { requestAnimationFrame(loop); const dt = Math.min(3, (now - last) / 16.7); last = now; t += dt * 16; draw(dt); canvas.style.opacity = String(1 - Math.min(1, scrollY / innerHeight) * .55); })(last);
})();

// ---- Shell: type /// ----
(() => {
    try { applyTheme(localStorage.getItem('sp-theme')); } catch {}
    const cli = document.getElementById('cli'), inp = document.getElementById('cli-in'), out = document.getElementById('cli-out');
    const say = h => { const d = document.createElement('div'); d.innerHTML = h; out.append(d); out.scrollTop = out.scrollHeight; };
    say('> SYSTEM READY. TYPE <b>help</b> FOR PROTOCOLS.');
    const hist = []; let hi = 0, buf = '';
    const toggle = on => { cli.classList.toggle('on', on); if (on) setTimeout(() => inp.focus(), 350); else inp.blur(); };
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
