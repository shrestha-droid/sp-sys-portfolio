// ---- Boot: a short, skippable sequence, once per session ----
(() => {
    const boot = document.getElementById('boot');
    let seen = false; try { seen = sessionStorage.getItem('sp-booted') === '1'; } catch {}
    if (seen || calm) return boot.remove();
    const gl = (() => { try { return !!document.createElement('canvas').getContext('webgl'); } catch { return false; } })();
    const lines = ['SP_SYS_01 // BIOS OK', `MOUNTING PROJECT INDEX ... <em>${PROJECTS.length} ENTRIES</em>`, 'LOADING DOSSIERS ... <em>OK</em>', `WEBGL ... <em>${gl ? 'OK' : 'UNAVAILABLE'}</em>`, 'OPERATOR SP_1102 ... <span>AUTHENTICATED</span>', '> WELCOME.'];
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

// ---- Background: a JARVIS-style HUD dial. Each arc of the wheel is one project, in its own colour. ----
(() => {
    const canvas = document.getElementById('bg-canvas');
    let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch { return; }
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);
    camera.position.z = 44; renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const css = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e50914';
    const tint = new THREE.Color(css()), target = new THREE.Color(css()); // the accent: ticks, rings, core. Shared so the shell's `theme` recolours it.
    const ADD = THREE.AdditiveBlending, TAU = Math.PI * 2;
    const line = (pts, op, loop = true, col = tint) => { const g = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3)); return new (loop ? THREE.LineLoop : THREE.Line)(g, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: op, blending: ADD })); };
    const arcPts = (r, a0, a1, n = 48) => { const p = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push(Math.cos(a) * r, Math.sin(a) * r, 0); } return p; };
    const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
    const glow = (size, col, op) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, opacity: op, blending: ADD, depthWrite: false })); s.scale.setScalar(size); return s; };

    const hud = new THREE.Group(); scene.add(hud);
    const spin = {}; // named rotating layers
    const layer = (name, speed) => (spin[name] = { g: new THREE.Group(), speed }, hud.add(spin[name].g), spin[name].g);

    // outer tick ring: 180 ticks, longer every 5th and 15th, like a bezel
    const ticks = []; for (let i = 0; i < 180; i++) { const a = i / 180 * TAU, r0 = 25, r1 = r0 + (i % 15 === 0 ? 1.7 : i % 5 === 0 ? 1 : .5); ticks.push(Math.cos(a) * r0, Math.sin(a) * r0, 0, Math.cos(a) * r1, Math.sin(a) * r1, 0); }
    layer('bezel', 0.0006).add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(ticks), 3)), new THREE.LineBasicMaterial({ color: tint, transparent: true, opacity: 0.55, blending: ADD })), line(arcPts(24.4, 0, TAU, 160), 0.35));

    // broken arcs of varied length, counter-rotating
    const broken = layer('broken', -0.0012); [[0.1, 1.3], [1.6, 2.1], [2.5, 4.2], [4.5, 5.3], [5.6, 6.1]].forEach(([a, b]) => broken.add(line(arcPts(21.6, a, b, 40), 0.7, false)));
    [[0.4, 0.8], [3.0, 3.4]].forEach(([a, b]) => broken.add(line(arcPts(22.4, a, b, 12), 0.9, false)));

    // the project wheel: one coloured arc per project; the colour is the project's colour
    const N = PROJECTS.length, wheel = layer('wheel', 0.0009), arcs = [];
    PROJECTS.forEach((p, i) => {
        const gap = 0.045, a0 = i / N * TAU + gap, th = TAU / N - gap * 2;
        const m = new THREE.Mesh(new THREE.RingGeometry(16.2, 17.6, 28, 1, a0, th), new THREE.MeshBasicMaterial({ color: p.accent, transparent: true, opacity: 0.4, side: THREE.DoubleSide, blending: ADD, depthWrite: false }));
        const mid = a0 + th / 2, dot = glow(2.2, p.accent, 0.9); dot.position.set(Math.cos(mid) * 18.6, Math.sin(mid) * 18.6, 0);
        const rim = line(arcPts(15.6, a0, a0 + th, 14), 0.5, false, new THREE.Color(p.accent));
        wheel.add(m, dot, rim); arcs.push({ m, dot, rim });
    });
    const sel = line(arcPts(19.6, 0, TAU, 120), 0, true, new THREE.Color('#fff')); wheel.add(sel); // a hairline that lights up for the hovered project

    // dashed ring, inner polygons, crosshair
    const dash = new THREE.LineLoop(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(arcPts(13.2, 0, TAU, 140)), 3)), new THREE.LineDashedMaterial({ color: tint, dashSize: .5, gapSize: .4, transparent: true, opacity: 0.55, blending: ADD })); dash.computeLineDistances();
    layer('dash', 0.002).add(dash);
    const poly = layer('poly', -0.0035); poly.add(line(arcPts(10, 0, TAU, 6).slice(0, 18), 0.8), line(arcPts(7.4, 0.52, TAU + 0.52, 3).slice(0, 9), 0.6), line(arcPts(10.8, 0, TAU, 96), 0.25));
    hud.add(line([-27, 0, 0, -12, 0, 0], 0.35, false), line([12, 0, 0, 27, 0, 0], 0.35, false), line([0, -27, 0, 0, -12, 0], 0.35, false), line([0, 12, 0, 0, 27, 0], 0.35, false));

    // radar sweep: a fan that fades along its trailing edge
    const fan = new THREE.CircleGeometry(13, 40, 0, 1.1), fc = new Float32Array(fan.attributes.position.count * 3);
    for (let i = 1; i < fan.attributes.position.count; i++) { const t = (i - 1) / (fan.attributes.position.count - 2), k = Math.pow(1 - t, 1.6) * 0.55; fc.set([tint.r * k, tint.g * k, tint.b * k], i * 3); }
    fan.setAttribute('color', new THREE.BufferAttribute(fc, 3));
    const sweep = new THREE.Mesh(fan, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: ADD, depthWrite: false, side: THREE.DoubleSide })); hud.add(sweep);

    // core: a faceted reactor with a pulsing glow and two small satellites
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(3.1, 1), new THREE.MeshBasicMaterial({ color: tint, wireframe: true, transparent: true, opacity: 0.8, blending: ADD }));
    const core2 = new THREE.Mesh(new THREE.OctahedronGeometry(1.7, 0), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.7, blending: ADD }));
    const halo = glow(12, tint, 0.45); hud.add(core, core2, halo);
    const sats = [0, 2.1, 4.2].map(ph => { const s = glow(1.4, 0xffffff, 0.95); hud.add(s); return { s, ph }; });

    // sparse dust, white and quiet
    const dust = new Float32Array(500 * 3); for (let i = 0; i < 500; i++) dust.set([(Math.random() - .5) * 120, (Math.random() - .5) * 80, -10 - Math.random() * 40], i * 3);
    scene.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(dust, 3)), new THREE.PointsMaterial({ size: 0.12, color: 0xffffff, transparent: true, opacity: 0.35, blending: ADD, depthWrite: false })));

    let focus = -1; window.hudFocus = i => { focus = i; if (i >= 0) sel.material.color.set(PROJECTS[i].accent); };
    window.heroTint = hex => target.set(hex);
    const fit = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
    fit(); addEventListener('resize', fit);
    let mx = 0, my = 0; addEventListener('pointermove', e => { mx = e.clientX / innerWidth * 2 - 1; my = -(e.clientY / innerHeight) * 2 + 1; });
    let t = 0;
    (function loop() {
        requestAnimationFrame(loop); t += 0.016;
        const away = Math.min(1, scrollY / innerHeight);
        tint.lerp(target, 0.06);
        if (!calm) { Object.values(spin).forEach(l => l.g.rotation.z += l.speed); sweep.rotation.z -= 0.012; core.rotation.x += 0.006; core.rotation.y += 0.009; core2.rotation.x -= 0.012; core2.rotation.z += 0.008; }
        halo.material.opacity = 0.38 + Math.sin(t * 2) * 0.1;
        sats.forEach(({ s, ph }) => s.position.set(Math.cos(t * 0.6 + ph) * 15, Math.sin(t * 0.6 + ph) * 15, 0));
        arcs.forEach(({ m, dot }, i) => { const goal = focus < 0 ? 0.42 : i === focus ? 1 : 0.14; m.material.opacity += (goal - m.material.opacity) * 0.15; dot.material.opacity += ((focus < 0 ? 0.9 : i === focus ? 1 : 0.25) - dot.material.opacity) * 0.15; dot.scale.setScalar(2.2 + (i === focus ? 1.6 + Math.sin(t * 6) * 0.3 : 0)); });
        sel.material.opacity += ((focus >= 0 ? 0.35 : 0) - sel.material.opacity) * 0.15;
        // layout: centred behind the name, then drifts right and shrinks as you scroll
        const s = (innerWidth > 900 ? Math.min(innerWidth / 1500, innerHeight / 880) * 1.05 : 0.55) * (1 - away * 0.3);
        hud.scale.setScalar(s); hud.position.x += ((innerWidth > 900 ? away * 17 : 0) - hud.position.x) * 0.05;
        hud.rotation.x += (-my * 0.25 - hud.rotation.x) * 0.05; hud.rotation.y += (mx * 0.3 - hud.rotation.y) * 0.05;
        renderer.render(scene, camera);
    })();
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
