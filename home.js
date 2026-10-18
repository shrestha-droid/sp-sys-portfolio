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

// ---- Hero ----
(() => {
    const T = typeof TELEMETRY !== 'undefined' ? TELEMETRY.totals : null, live = PROJECTS.filter(p => p.live).length;
    document.getElementById('hero-stats').innerHTML = [`<b>${PROJECTS.length}</b> timelines`, `<b>${live}</b> running live`, ...(T ? [`<b>${fmt(T.commits)}</b> commits`, `<b>${fmt(T.loc)}</b> lines`] : [])].join('<i aria-hidden="true">/</i>');
    const ht = document.getElementById('hero-time'), tk = () => (ht.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) + ' IST');
    tk(); setInterval(tk, 30000);
})();

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

// ---- Background: a branching timeline. A trunk splits into one strand per project, in that project's colour;
// on wide screens each strand ends at a labelled node you can click. Side branches grow, get pruned and regrow. ----
(() => {
    const canvas = document.getElementById('bg-canvas'), ctx = canvas.getContext('2d'), nodesEl = document.getElementById('nodes');
    const DPR = Math.min(devicePixelRatio || 1, 2), cols = PROJECTS.map(p => p.accent), N = cols.length;
    const R = (a, b) => a + Math.random() * (b - a), accentNow = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e50914';
    let W, H, branches = [], mains = [], pulses = [], focus = -1, mono = null, trunkCol = accentNow(), t = 0, mx = 0, my = 0, smx = 0, smy = 0, nextPrune = 5;
    const wide = () => innerWidth > 900;

    nodesEl.innerHTML = PROJECTS.map((p, i) => `<a class="node" href="project.html?id=${p.id}" style="--c:${p.accent}" data-i="${i}"><i aria-hidden="true"></i><span><b>${esc(p.title)}</b><small>${p.live ? 'live' : 'local'} · ${esc(p.kind.split('·')[0].trim())}</small></span></a>`).join('');
    const nodeEls = [...nodesEl.children];
    nodesEl.addEventListener('pointerover', e => { const n = e.target.closest('.node'); if (n) window.hudFocus(+n.dataset.i); });
    nodesEl.addEventListener('pointerleave', () => window.hudFocus(-1));
    nodesEl.addEventListener('focusin', e => { const n = e.target.closest('.node'); if (n) window.hudFocus(+n.dataset.i); });

    const walk = (x, y, ang, len, heading, ph, maxSteps = 900) => { // a wandering side branch
        const pts = [x, y];
        for (let i = 0; i < maxSteps; i++) {
            ang += Math.sin(i * .06 + ph) * .03 + R(-.012, .012) + (heading - ang) * .012;
            x += Math.cos(ang) * len; y += Math.sin(ang) * len; pts.push(x, y);
            if (x > W * 1.08 || y < -H * .1 || y > H * 1.1) break;
        }
        return pts;
    };
    const curve = (sx, sy, tx, ty, len) => { // an S-curve from the split point to the node, with a slight living wobble
        const pts = [], n = Math.max(8, Math.ceil(Math.hypot(tx - sx, ty - sy) / len)), ph = R(0, 6), cx = sx + (tx - sx) * .55;
        for (let k = 0; k <= n; k++) {
            const u = k / n, a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u * u, d = u ** 3;
            const x = a * sx + b * cx + c * cx + d * tx, y = a * sy + b * sy + c * ty + d * ty, w = Math.sin(u * Math.PI * 3 + ph) * 5 * DPR * Math.sin(u * Math.PI);
            pts.push(x, y + w);
        }
        return pts;
    };
    const add = (pts, k, w, depth, delay) => { const b = { pts, n: pts.length / 2, k, w, depth, delay, g: 0, a: 1, state: 0, wait: 0, flash: 0 }; branches.push(b); return b; };

    const build = (grown = false) => {
        W = canvas.width = Math.round(innerWidth * DPR); H = canvas.height = Math.round(innerHeight * DPR);
        const len = 7 * DPR, big = wide(); branches = []; mains = [];
        const trunk = curve(-.04 * W, (big ? .7 : .62) * H, (big ? .56 : 1.05) * W, (big ? .5 : .55) * H, len); // the trunk rises gently and ends where the last strand splits off
        add(trunk, -1, 3.2 * DPR, 0, 0);
        const xAt = x => { let j = 0; while (j < trunk.length / 2 - 1 && trunk[j * 2] < x) j++; return j; };
        for (let i = 0; i < N; i++) {
            const j = xAt(W * (.18 + .34 * i / (N - 1))), sx = trunk[j * 2], sy = trunk[j * 2 + 1];
            const tx = big ? W * (.66 + (i % 2) * .055) : W * 1.12, ty = H * (big ? .12 + .74 * i / (N - 1) : .04 + .9 * i / (N - 1));
            const main = add(curve(sx, sy, tx, ty, len), i, 1.8 * DPR, 1, .5 + i * .14); main.node = [tx / DPR, ty / DPR]; mains[i] = main;
            for (let s = 0, subs = big ? 2 + (i % 2) : 1; s < subs; s++) { // side branches peel off the strand
                const m = Math.floor(R(.2, .75) * (main.n - 2)), dx = main.pts[(m + 1) * 2] - main.pts[m * 2], dy = main.pts[(m + 1) * 2 + 1] - main.pts[m * 2 + 1], dir = Math.random() < .5 ? -1 : 1, ang = Math.atan2(dy, dx);
                add(walk(main.pts[m * 2], main.pts[m * 2 + 1], ang + dir * R(.3, .6), len * .9, ang + dir * R(.6, 1.1), R(0, 6), Math.floor(R(25, 70))), i, .9 * DPR, 2, 1.4 + i * .14 + s * .3);
            }
        }
        if (grown) branches.forEach(b => { b.g = 1; b.state = 2; });
        pulses = Array.from({ length: big ? 20 : 9 }, () => ({ b: null, u: 0, sp: R(.12, .3) }));
        nodeEls.forEach((el, i) => { el.style.left = mains[i].node[0] + 'px'; el.style.top = mains[i].node[1] + 'px'; el.classList.toggle('on', grown); });
    };
    build(); addEventListener('resize', () => build(true));
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; });
    window.hudFocus = i => { focus = i; nodeEls.forEach((el, k) => el.classList.toggle('lit', k === i)); nodesEl.classList.toggle('focus', i >= 0); };
    window.heroTint = hex => { mono = hex; trunkCol = hex; };

    const pickPulse = () => { const live = branches.filter(b => b.state >= 1 && b.state <= 2 && b.g > .5 && b.depth > 0); return live.length ? live[(Math.random() * live.length) | 0] : null; };
    const step = dt => {
        t += dt; smx += (mx - smx) * Math.min(1, dt * 3); smy += (my - smy) * Math.min(1, dt * 3);
        for (const b of branches) {
            if (b.state === 0 && t >= b.delay) b.state = 1;
            if (b.state === 1) { b.g = Math.min(1, b.g + dt / (1.8 + b.depth * .6)); if (b.g >= 1) b.state = 2; }
            if (b.state === 3) { b.a -= dt / 1.4; b.flash = Math.max(0, b.flash - dt * 2); if (b.a <= 0) { b.state = 4; b.wait = R(1.5, 3.5); } }
            if (b.state === 4 && (b.wait -= dt) <= 0) { b.g = 0; b.a = 1; b.state = 1; }
        }
        mains.forEach((b, i) => nodeEls[i].classList.toggle('on', b.g >= .98));
        if (t > nextPrune) { nextPrune = t + R(3, 6); const held = branches.filter(b => b.state === 2 && b.depth >= 2); if (held.length) { const b = held[(Math.random() * held.length) | 0]; b.state = 3; b.flash = 1; } }
        for (const p of pulses) { if (!p.b || p.b.state > 2 || p.u >= p.b.g) { p.b = pickPulse(); p.u = 0; } else p.u += dt * p.sp; }
    };
    const draw = () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
        ctx.translate(-smx * 14 * DPR, -smy * 8 * DPR); nodesEl.style.transform = `translate(${(-smx * 14).toFixed(1)}px, ${(-smy * 8).toFixed(1)}px)`;
        ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = ctx.lineJoin = 'round';
        const tips = [];
        for (const b of branches) {
            if (b.state === 0 || b.a <= 0) continue;
            const m = Math.max(2, Math.floor(b.g * (b.n - 1)) + 1), col = mono || (b.k < 0 ? trunkCol : cols[b.k]);
            const f = (focus < 0 ? 1 : b.k === focus ? 2.1 : b.k < 0 ? .7 : .22) * (wide() ? 1 : .55), base = [.85, .62, .38, .28][b.depth];
            ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(b.pts[0], b.pts[1]); for (let i = 1; i < m; i++) ctx.lineTo(b.pts[i * 2], b.pts[i * 2 + 1]);
            ctx.lineWidth = b.w * 4.5; ctx.globalAlpha = Math.min(1, .07 * f) * b.a; ctx.stroke();
            ctx.lineWidth = b.w * (focus === b.k ? 1.6 : 1); ctx.globalAlpha = Math.min(1, base * f) * b.a; ctx.stroke();
            if ((b.state === 1 && b.depth > 0) || b.flash > 0) tips.push([b.pts[(m - 1) * 2], b.pts[(m - 1) * 2 + 1], col, b.flash]);
        }
        for (const [x, y, col, fl] of tips) { ctx.fillStyle = fl > 0 ? '#fff' : col; ctx.globalAlpha = fl > 0 ? fl : .85; ctx.beginPath(); ctx.arc(x, y, (fl > 0 ? 3 + 6 * (1 - fl) : 2) * DPR, 0, 6.283); ctx.fill(); }
        for (const p of pulses) {
            if (!p.b) continue; const i = Math.min(p.b.n - 1, Math.floor(p.u * (p.b.n - 1))), x = p.b.pts[i * 2], y = p.b.pts[i * 2 + 1];
            ctx.fillStyle = mono || cols[p.b.k]; ctx.globalAlpha = .2 * p.b.a; ctx.beginPath(); ctx.arc(x, y, 7 * DPR, 0, 6.283); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.globalAlpha = .9 * p.b.a; ctx.beginPath(); ctx.arc(x, y, 1.6 * DPR, 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 1;
    };
    const fade = () => { const k = Math.min(1, scrollY / innerHeight); canvas.style.opacity = String(1 - k * .8); nodesEl.style.opacity = String(1 - k * 1.6); nodesEl.style.visibility = k > .62 ? 'hidden' : ''; };
    if (calm) { build(true); draw(); addEventListener('scroll', fade, { passive: true }); return; } // reduced motion: a still, fully grown timeline
    let last = performance.now();
    (function loop(now) { requestAnimationFrame(loop); const dt = Math.min(.1, (now - last) / 1000); last = now; step(dt); draw(); fade(); })(last);
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
