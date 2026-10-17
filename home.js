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
    if (window.heroTint) window.heroTint(p.accent);
}
targets.addEventListener('pointerover', e => { const li = e.target.closest('li'); if (li) show(+li.dataset.i); });
targets.addEventListener('focusin', e => { const li = e.target.closest('li'); if (li) show(+li.dataset.i); });
targets.addEventListener('pointerleave', () => window.heroTint && window.heroTint(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()));
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

// ---- Background: the arc reactor, recoloured by whatever you point at ----
(() => {
    const canvas = document.getElementById('bg-canvas');
    let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch { return; }
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(70, 1, 0.1, 400);
    camera.position.z = 36; renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const css = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e50914';
    const tint = new THREE.Color(css()), target = new THREE.Color(css());
    const mk = (geo, op) => new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: tint, wireframe: true, transparent: true, opacity: op, blending: THREE.AdditiveBlending }));
    const outer = mk(new THREE.TorusKnotGeometry(13, 3.2, 140, 18), 0.2), inner = mk(new THREE.TorusKnotGeometry(6, 1.1, 90, 12, 3, 5), 0.3), ring = mk(new THREE.TorusGeometry(21, 0.05, 6, 120), 0.3);
    scene.add(outer, inner, ring);
    const n = 700, dust = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) dust.set([(Math.random() - .5) * 110, (Math.random() - .5) * 70, (Math.random() - .5) * 70], i * 3);
    const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(dust, 3)), new THREE.PointsMaterial({ size: 0.16, color: tint, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(stars);
    window.heroTint = hex => target.set(hex);
    const fit = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
    fit(); addEventListener('resize', fit);
    let mx = 0, my = 0; addEventListener('pointermove', e => { mx = e.clientX / innerWidth * 2 - 1; my = -(e.clientY / innerHeight) * 2 + 1; });
    (function loop() {
        requestAnimationFrame(loop);
        const away = Math.min(1, scrollY / innerHeight); // drift aside as you leave the hero
        tint.lerp(target, 0.06); // every material shares this colour object
        if (!calm) { outer.rotation.x += 0.0014; outer.rotation.y += 0.0024; inner.rotation.x -= 0.004; inner.rotation.y += 0.003; ring.rotation.x += 0.002; stars.rotation.y -= 0.0003; }
        const sx = innerWidth > 900 ? away * 18 : 0;
        [outer, inner, ring].forEach(m => { m.position.x += (sx - m.position.x) * 0.05; m.scale.setScalar(innerWidth > 900 ? 1 - away * 0.25 : 0.7); });
        camera.position.x += (mx * 3 - camera.position.x) * 0.04; camera.position.y += (my * 2 - camera.position.y) * 0.04; camera.lookAt(0, 0, 0);
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
