const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---- Work tiles: each one is dressed in its project's theme (themes.css) ----
document.getElementById('work-list').innerHTML = PROJECTS.map((p, i) => `
    <li class="tile t-${p.id}">
        <span class="mark" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <div>
            <p class="k">${esc(p.kind)}</p>
            <h3><a href="project.html?id=${p.id}">${esc(p.title)}</a><span class="arr" aria-hidden="true">↗</span></h3>
        </div>
        <div>
            <p>${esc(p.summary)}</p>
            ${p.live || p.repo ? `<div class="ext">
                ${p.live ? `<a href="${esc(p.live)}" target="_blank" rel="noopener">Live ↗</a>` : ''}
                ${p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">Source ↗</a>` : ''}
            </div>` : ''}
        </div>
    </li>`).join('');

// ---- Ticker ----
const words = ['TypeScript', 'Python', 'C++', 'WebGL', 'WebAssembly', 'React', 'FastAPI', 'Electron', 'Shamir', 'Argon2id', 'Three.js', 'NASA data', 'Simulation', 'Next.js'];
const cols = ['--pink', '--cyan', '--lime', '--amber', '--violet'];
const row = words.map((w, i) => `<span style="--c:var(${cols[i % cols.length]})">${w}</span>`).join('');
document.getElementById('ticker').innerHTML = row + row; // doubled so the loop is seamless

// ---- Nav highlight ----
const navLinks = [...document.querySelectorAll('.nav a')];
const seen = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.setAttribute('aria-current', String(a.hash === '#' + e.target.id)));
}), { rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('header.hero, main > section, footer').forEach(s => seen.observe(s));

// ---- Hero: a rainbow torus knot and drifting dust ----
(() => {
    const canvas = document.getElementById('hero-canvas');
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch { return; } // no WebGL: the CSS glow is enough
    const hero = canvas.parentElement, scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    camera.position.z = 38;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const geo = new THREE.TorusKnotGeometry(11, 2.6, 220, 24);
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) { c.setHSL(0.92 - (i / pos.count) * 0.45, 0.9, 0.6); col.set([c.r, c.g, c.b], i * 3); } // pink -> violet -> cyan along the knot
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const knot = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, wireframe: true, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending }));
    scene.add(knot);

    const dust = new Float32Array(900 * 3), dc = new Float32Array(900 * 3);
    for (let i = 0; i < 900; i++) { dust.set([(Math.random() - .5) * 90, (Math.random() - .5) * 60, (Math.random() - .5) * 60], i * 3); c.setHSL(Math.random(), 0.9, 0.65); dc.set([c.r, c.g, c.b], i * 3); }
    const dg = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(dust, 3)).setAttribute('color', new THREE.BufferAttribute(dc, 3));
    const stars = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.28, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(stars);

    const fit = () => {
        const w = hero.clientWidth, h = hero.clientHeight;
        renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
        knot.position.set(w > 900 ? 17 : 0, w > 900 ? 0 : -14, 0); knot.scale.setScalar(w > 900 ? 1 : 0.6);
        knot.material.opacity = w > 900 ? 0.45 : 0.28; // keep text readable on phones
    };
    fit(); addEventListener('resize', fit);
    let mx = 0, my = 0;
    addEventListener('mousemove', e => { mx = e.clientX / innerWidth * 2 - 1; my = -(e.clientY / innerHeight) * 2 + 1; });
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    (function loop() {
        requestAnimationFrame(loop);
        if (scrollY > hero.clientHeight) return; // off screen
        if (!calm) { knot.rotation.x += 0.0025; knot.rotation.y += 0.0035; stars.rotation.y -= 0.0004; }
        camera.position.x += (mx * 4 - camera.position.x) * 0.04; camera.position.y += (my * 3 - camera.position.y) * 0.04; camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
    })();
})();

// ---- Hidden terminal: type /// ----
(() => {
    const cli = document.getElementById('cli'), inp = document.getElementById('cli-in'), out = document.getElementById('cli-out');
    const say = html => { const d = document.createElement('div'); d.innerHTML = html; out.append(d); out.scrollTop = out.scrollHeight; };
    let buf = '';
    const toggle = on => { cli.classList.toggle('on', on); if (on) setTimeout(() => inp.focus(), 350); else inp.blur(); };
    addEventListener('keydown', e => {
        if (e.key === 'Escape') return toggle(false);
        if (document.activeElement === inp || e.metaKey || e.ctrlKey || e.altKey || e.key.length > 1) return;
        buf = (buf + e.key).slice(-3);
        if (buf === '///') { buf = ''; toggle(!cli.classList.contains('on')); }
    });
    const cmds = {
        help: () => say('> whoami, projects, open &lt;name&gt;, hire, clear, exit'),
        whoami: () => say('> Shrestha Pandey. AI systems architect, full-stack dev, founder. Year 2 at VIT Bhopal.'),
        projects: () => PROJECTS.forEach(p => say(`> ${p.id.padEnd(14, ' ').replace(/ /g, '&nbsp;')} ${esc(p.title)}`)),
        hire: () => { say('> good choice. opening mail...'); setTimeout(() => location.href = 'mailto:shresthakp07@gmail.com', 600); },
        clear: () => { out.innerHTML = ''; },
        exit: () => toggle(false),
    };
    inp.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const raw = inp.value.trim().toLowerCase(); inp.value = '';
        say(`<span style="color:var(--fg)">$ ${esc(raw)}</span>`);
        const [cmd, ...rest] = raw.split(/\s+/);
        if (cmd === 'open') {
            const q = rest.join(' '), p = PROJECTS.find(x => x.id === q || x.title.toLowerCase().startsWith(q));
            return p ? (say(`> opening ${esc(p.title)}...`), setTimeout(() => location.href = `project.html?id=${p.id}`, 500)) : say('> no such project. try: projects');
        }
        (cmds[cmd] || (() => raw && say(`> unknown command '${esc(raw)}'. try: help`)))();
    });
})();
