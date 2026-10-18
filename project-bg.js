// Per-project WebGL backgrounds. Each scene echoes what the project does.
// Depends on: three.js r128, `p` from project.js, --accent set on :root.
if (p && window.customBg && customBg[p.id]) {
    customBg[p.id](document.getElementById('bg-canvas')); // 2D canvas scene for the bespoke pages
} else if (p) {
    const canvas = document.getElementById('bg-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    camera.position.set(0, 0, 45);

    const accent = new THREE.Color(p.accent);
    const rnd = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
    const mat = (color = accent, opacity = 0.3) => new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending });
    const wire = (color = accent, opacity = 0.25) => new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity, blending: THREE.AdditiveBlending });
    const ptsMat = (size, opacity = 0.8, vertexColors = false, color = accent) => new THREE.PointsMaterial({ size, color, vertexColors, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
    const points = (arr, m) => new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(arr, 3)), m);
    const lines = (arr, m) => new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(arr, 3)), m);

    // Mouse parallax wraps every scene; the scene's own motion lives in `g`.
    const root = new THREE.Group(), g = new THREE.Group();
    root.position.x = innerWidth > 900 ? 18 : 0; // keep the art right of the text column
    root.add(g); scene.add(root);
    let mx = 0, my = 0;
    addEventListener('mousemove', e => { mx = (e.clientX / innerWidth) * 2 - 1; my = -(e.clientY / innerHeight) * 2 + 1; });

    // Random tree as line segments + the root-to-leaf paths (for pulses).
    function makeTree(depth, branches, len, spread) {
        const segs = [], paths = [];
        (function grow(from, dir, d, path) {
            if (d === 0) { paths.push(path); return; }
            for (let i = 0; i < branches; i++) {
                const nd = dir.clone().add(new THREE.Vector3(rnd(-spread, spread), rnd(-spread * 0.4, spread * 0.8), rnd(-spread, spread))).normalize();
                const to = from.clone().addScaledVector(nd, len * (0.55 + d * 0.15));
                segs.push(from.x, from.y, from.z, to.x, to.y, to.z);
                grow(to, nd, d - 1, [...path, to]);
            }
        })(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), depth, [new THREE.Vector3(0, 0, 0)]);
        return { segs: new Float32Array(segs), paths };
    }
    // Dots that ride along the paths of a tree.
    function pulses(parent, paths, n, size) {
        const arr = new Float32Array(n * 3), st = Array.from({ length: n }, () => ({ path: paths[(Math.random() * paths.length) | 0], t: Math.random() * 5 }));
        const pts = points(arr, ptsMat(size, 1, false, 0xffffff)); parent.add(pts);
        return dt => st.forEach((s, i) => {
            s.t += dt * 1.2;
            const k = Math.floor(s.t), f = s.t - k;
            if (k >= s.path.length - 1) { s.path = paths[(Math.random() * paths.length) | 0]; s.t = 0; return; }
            const a = s.path[k], b = s.path[k + 1];
            arr[i * 3] = a.x + (b.x - a.x) * f; arr[i * 3 + 1] = a.y + (b.y - a.y) * f; arr[i * 3 + 2] = a.z + (b.z - a.z) * f;
            pts.geometry.attributes.position.needsUpdate = true;
        });
    }

    const scenes = {
        // Agent crew: a branching tree with work pulses running to the leaves.
        'branch-hq'() {
            const { segs, paths } = makeTree(5, 2, 4.2, 0.9);
            const tree = lines(segs, mat(accent, 0.6)); tree.position.y = -26; tree.scale.setScalar(1.9); g.add(tree);
            const pulse = pulses(tree, paths, 40, 0.7);
            return (t, dt) => { g.rotation.y += 0.002; pulse(dt); };
        },

        // K-of-N shards that scatter and re-converge around a locked core.
        'vault-v2'() {
            const core = new THREE.Mesh(new THREE.IcosahedronGeometry(6, 1), wire(accent, 0.4));
            const cage = new THREE.Mesh(new THREE.BoxGeometry(11, 11, 11), wire(accent, 0.2));
            g.add(core, cage);
            const N = 9, shards = Array.from({ length: N }, (_, i) => {
                const m = new THREE.Mesh(new THREE.TetrahedronGeometry(2.2), wire(0xffffff, 0.5)); g.add(m);
                return { m, a: (i / N) * Math.PI * 2, tilt: rnd(-1, 1) };
            });
            const link = new Float32Array(N * 6), ln = lines(link, mat(accent, 0.25)); g.add(ln);
            return t => {
                core.rotation.y += 0.004; cage.rotation.y -= 0.002; cage.rotation.x += 0.001;
                const gather = (Math.sin(t * 0.5) + 1) / 2; // 0 scattered .. 1 reassembled
                shards.forEach(({ m, a, tilt }, i) => {
                    const r = 11 + (1 - gather) * 16, ang = a + t * 0.3;
                    m.position.set(Math.cos(ang) * r, tilt * r * 0.5, Math.sin(ang) * r);
                    m.rotation.x += 0.02; m.rotation.y += 0.015;
                    link.set([0, 0, 0, m.position.x, m.position.y, m.position.z], i * 6);
                });
                ln.geometry.attributes.position.needsUpdate = true; ln.material.opacity = 0.1 + gather * 0.35;
            };
        },

        // The sky: fixed stars, fast main-belt movers with trails, one very slow Planet X.
        'spherex'() {
            const R = 26, star = new Float32Array(1800 * 3);
            for (let i = 0; i < 1800; i++) {
                const u = rnd(-1, 1), a = rnd(Math.PI * 2), s = Math.sqrt(1 - u * u);
                star.set([R * s * Math.cos(a), R * u, R * s * Math.sin(a)], i * 3);
            }
            g.add(points(star, ptsMat(0.22, 0.55)));
            const AST = 28, TR = 9, trail = new Float32Array(AST * (TR - 1) * 6), head = new Float32Array(AST * 3);
            const ast = Array.from({ length: AST }, () => ({ ax: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize(), ph: rnd(6.28), sp: rnd(0.15, 0.4) }));
            const base = new THREE.Vector3(1, 0, 0).multiplyScalar(R), v = new THREE.Vector3();
            const at = (a, ph, out) => out.copy(base).applyAxisAngle(a.ax, ph);
            const tl = lines(trail, mat(0xffffff, 0.45)), hd = points(head, ptsMat(0.7, 1, false, 0xffffff));
            g.add(tl, hd);
            const px = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 12), new THREE.MeshBasicMaterial({ color: accent }));
            const ring = new THREE.Mesh(new THREE.RingGeometry(1.6, 1.75, 40), new THREE.MeshBasicMaterial({ color: accent, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }));
            g.add(px, ring);
            const pa = { ax: new THREE.Vector3(0.3, 1, 0.2).normalize() };
            return t => {
                g.rotation.y += 0.0006;
                ast.forEach((s, i) => {
                    const prev = new THREE.Vector3(); at(s, s.ph + t * s.sp, prev); head.set([prev.x, prev.y, prev.z], i * 3);
                    for (let k = 1; k < TR; k++) {
                        at(s, s.ph + t * s.sp - k * 0.03, v);
                        trail.set([prev.x, prev.y, prev.z, v.x, v.y, v.z], (i * (TR - 1) + k - 1) * 6); prev.copy(v);
                    }
                });
                tl.geometry.attributes.position.needsUpdate = hd.geometry.attributes.position.needsUpdate = true;
                at(pa, 1 + t * 0.012, px.position); ring.position.copy(px.position); ring.lookAt(camera.position);
            };
        },

        // The Moon seen from the south pole, with the Sun and Earth sweeping the horizon.
        'clps'() {
            const grey = new THREE.Color('#c8c8d8'), moon = new THREE.Mesh(new THREE.SphereGeometry(12, 28, 20), wire(grey, 0.22)); g.add(moon); // the Moon stays grey; the accent is the Sun
            for (let i = 0; i < 9; i++) { // craters
                const c = new THREE.Mesh(new THREE.RingGeometry(rnd(0.8, 2), rnd(2.1, 2.4), 24), new THREE.MeshBasicMaterial({ color: grey, transparent: true, opacity: 0.25, side: THREE.DoubleSide }));
                c.position.set(rnd(-6, 6), rnd(-12, -9), rnd(-6, 6)); c.lookAt(0, 0, 0); c.position.setLength(12.1); moon.add(c);
            }
            const pole = new THREE.Vector3(0, -12, 0);
            const sun = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffd166 }));
            const earth = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), new THREE.MeshBasicMaterial({ color: 0x4da3ff }));
            const orbit = (r, col) => { const c = new THREE.Mesh(new THREE.TorusGeometry(r, 0.04, 6, 90), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35 })); c.rotation.x = Math.PI / 2; return c; };
            const sunRing = orbit(22, 0xffd166), earthRing = orbit(18, 0x4da3ff);
            sunRing.position.y = earthRing.position.y = -10; // both stay low: pole-grazing paths
            g.add(sun, earth, sunRing, earthRing);
            const beam = new Float32Array(12), bl = lines(beam, mat(0xffffff, 0.3)); g.add(bl);
            g.rotation.x = -0.9; // tilt so the south pole faces the viewer
            return t => {
                moon.rotation.y += 0.001;
                sun.position.set(Math.cos(t * 0.18) * 22, -10 + Math.sin(t * 0.18) * 5, Math.sin(t * 0.18) * 22);
                earth.position.set(Math.cos(t * 0.04 + 2) * 18, -10 + Math.sin(t * 0.09) * 3, Math.sin(t * 0.04 + 2) * 18);
                beam.set([pole.x, pole.y, pole.z, sun.position.x, sun.position.y, sun.position.z, pole.x, pole.y, pole.z, earth.position.x, earth.position.y, earth.position.z]);
                bl.geometry.attributes.position.needsUpdate = true;
            };
        },

        // A junction seen from above: queues build on red and release on green.
        'drishti'() {
            const L = 42, road = [];
            [-3, 0, 3].forEach(o => { road.push(-L, 0, o, L, 0, o, o, 0, -L, o, 0, L); });
            g.add(lines(new Float32Array(road), mat(accent, 0.18)));
            const N = 420, pos = new Float32Array(N * 3), cols = new Float32Array(N * 3);
            const kinds = [[1, 0.55, 0.1], [1, 0.8, 0.3], [0.9, 0.9, 0.9]];
            const veh = Array.from({ length: N }, (_, i) => ({ axis: i % 2, dir: (i >> 1) % 2 ? 1 : -1, lane: [-1.5, 1.5][(i >> 2) % 2], u: rnd(-L, L), v: rnd(0.12, 0.3), q: rnd(5, 18) }));
            veh.forEach((c, i) => cols.set(kinds[i % 3], i * 3));
            const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)).setAttribute('color', new THREE.BufferAttribute(cols, 3));
            g.add(new THREE.Points(geo, ptsMat(0.9, 0.9, true)));
            const sig = new Float32Array(4 * 3), sigC = new Float32Array(4 * 3);
            const sg = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(sig, 3)).setAttribute('color', new THREE.BufferAttribute(sigC, 3));
            [[5, 0, 5], [-5, 0, -5], [5, 0, -5], [-5, 0, 5]].forEach((s, i) => sig.set(s, i * 3));
            g.add(new THREE.Points(sg, ptsMat(2.2, 1, true)));
            g.rotation.x = 0.85; g.rotation.y = 0.5;
            return t => {
                const nsGreen = Math.floor(t / 6) % 2 === 0;
                [nsGreen, nsGreen, !nsGreen, !nsGreen].forEach((green, i) => sigC.set(green ? [0.2, 1, 0.4] : [1, 0.15, 0.2], i * 3));
                sg.attributes.color.needsUpdate = true;
                veh.forEach((c, i) => {
                    const green = (c.axis === 0) === nsGreen, stop = -c.q; // each car queues at its own gap behind the line
                    if (!(!green && c.u < stop && c.u + c.v >= stop)) c.u += c.v;
                    if (c.u > L) c.u = -L;
                    const w = c.u * c.dir;
                    pos.set(c.axis === 0 ? [c.lane * c.dir, 0, w] : [w, 0, c.lane * c.dir], i * 3);
                });
                geo.attributes.position.needsUpdate = true;
            };
        },

        // A crowd squeezing through a gate: speed drops at the bottleneck, colour goes hot.
        'bheed-drishti'() {
            const N = 3200, pos = new Float32Array(N * 3), cols = new Float32Array(N * 3);
            const gate = 8, W = 46, wob = x => Math.sin(x * 0.14) * 6;
            const p0 = Array.from({ length: N }, () => ({ x: rnd(-W, W), z: rnd(-1, 1), s: rnd(0.6, 1.2) }));
            const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)).setAttribute('color', new THREE.BufferAttribute(cols, 3));
            g.add(new THREE.Points(geo, ptsMat(0.35, 0.9, true)));
            const bar = [];
            for (let i = -3; i <= 3; i++) if (Math.abs(i) > 1) bar.push(gate, 0, i * 3, gate, 3, i * 3); // barricades either side of the gate
            g.add(lines(new Float32Array(bar), mat(0xffffff, 0.6)));
            const riverPts = []; for (let x = -W; x < W; x += 2) riverPts.push(x, -1, 22, x + 2, -1, 22 + Math.sin((x + 2) * 0.2) * 2);
            g.add(lines(new Float32Array(riverPts), mat(0x4da3ff, 0.45)));
            g.rotation.x = 0.8;
            return t => {
                p0.forEach((c, i) => {
                    const d = Math.abs(c.x - gate), slow = Math.min(1, 0.12 + d / 16);
                    c.x += c.s * 0.18 * slow; if (c.x > W) { c.x = -W; c.z = rnd(-1, 1); }
                    const squeeze = 0.12 + Math.min(1, d / 18); // lane narrows at the gate
                    pos.set([c.x, 0.4 * Math.sin(t + i), wob(c.x) + c.z * 9 * squeeze + Math.sin(t * 2 + i) * 0.3], i * 3);
                    const heat = 1 - slow; cols.set([1, 0.75 - heat * 0.65, 0.2 - heat * 0.15], i * 3);
                });
                geo.attributes.position.needsUpdate = geo.attributes.color.needsUpdate = true;
            };
        },

        // Protection rings: round-robin processes orbit, syscalls dive to ring 0.
        'ring0'() {
            const radii = [8, 14, 20, 26], rings = radii.map((r, i) => {
                const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.12, 8, 100), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: i === 0 ? 0.9 : 0.35 }));
                const procs = Array.from({ length: 3 + i * 2 }, (_, k) => {
                    const b = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), wire(0xffffff, 0.7)); g.add(b); return { b, a: (k / (3 + i * 2)) * 6.28 };
                });
                t.rotation.x = Math.PI / 2; g.add(t); return { r, procs, sp: 0.5 / (i + 1) * (i % 2 ? -1 : 1) };
            });
            const kernel = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), wire(accent, 0.8)); g.add(kernel);
            const sys = points(new Float32Array(3), ptsMat(1.2, 1, false, 0xffffff)); g.add(sys);
            g.rotation.x = 1.0;
            return t => {
                kernel.rotation.x += 0.01; kernel.rotation.y += 0.014;
                rings.forEach(({ r, procs, sp }) => procs.forEach(({ b, a }) => { b.position.set(Math.cos(a + t * sp) * r, 0, Math.sin(a + t * sp) * r); b.rotation.y += 0.02; }));
                const f = (t * 0.4) % 1, ang = Math.floor(t * 0.4) * 2.1; // a syscall: user ring -> kernel
                sys.geometry.attributes.position.array.set([Math.cos(ang) * 26 * (1 - f), 0, Math.sin(ang) * 26 * (1 - f)]);
                sys.geometry.attributes.position.needsUpdate = true;
            };
        },

        // A HUD around a core, with a scan plane sweeping through it.
        'friday'() {
            const m = wire(accent, 0.28);
            const core = new THREE.Mesh(new THREE.IcosahedronGeometry(10, 1), m), shell = new THREE.Mesh(new THREE.DodecahedronGeometry(17, 1), m);
            const laser = new THREE.Mesh(new THREE.PlaneGeometry(44, 44), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.18, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
            laser.rotation.x = Math.PI / 2; g.add(core, shell, laser);
            let dir = 1;
            return () => {
                core.rotation.y += 0.005; core.rotation.x += 0.002; shell.rotation.y -= 0.002; shell.rotation.z += 0.003;
                laser.position.y += 0.15 * dir; if (Math.abs(laser.position.y) > 16) dir *= -1;
            };
        },

        // A grid of bytes: scratches turn them red, the decoder heals them green.
        'mend'() {
            const C = 52, R = 30, N = C * R, pos = new Float32Array(N * 3), cols = new Float32Array(N * 3), dmg = new Float32Array(N);
            for (let i = 0; i < N; i++) pos.set([(i % C - C / 2) * 1.5, ((i / C | 0) - R / 2) * 1.5, 0], i * 3);
            const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)).setAttribute('color', new THREE.BufferAttribute(cols, 3));
            g.add(new THREE.Points(geo, ptsMat(0.7, 0.95, true)));
            g.rotation.x = -0.35; g.rotation.y = -0.35;
            return t => {
                const sx = Math.sin(t * 0.7) * 34, sy = Math.sin(t * 1.1 + 1) * 18; // the "cursor" scratching
                for (let i = 0; i < N; i++) {
                    const x = pos[i * 3], y = pos[i * 3 + 1], d = Math.hypot(x - sx, y - sy);
                    if (d < 4.5) dmg[i] = 1; else if (dmg[i] > 0) dmg[i] = Math.max(0, dmg[i] - 0.012);
                    const v = dmg[i], hot = v > 0.55;
                    // red while damaged, bright green flash as it is repaired, then settle
                    cols.set(hot ? [1, 0.15, 0.2] : [0.15 + v * 0.8, 0.5 + v * 0.5, 0.25 + v * 0.3], i * 3);
                    pos[i * 3 + 2] = Math.sin(x * 0.2 + t) * 1.2 + hot * 1.5;
                }
                geo.attributes.position.needsUpdate = geo.attributes.color.needsUpdate = true;
            };
        },

        // A shield around the device: a 64-bit dHash flickers, only the hash reaches the matcher tree.
        'ncii-shield'() {
            const shield = new THREE.Mesh(new THREE.IcosahedronGeometry(13, 2), wire(accent, 0.2)); g.add(shield);
            const inner = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 12), wire(0xffffff, 0.1)); g.add(inner);
            const G = 8, bits = new Float32Array(G * G * 3), bc = new Float32Array(G * G * 3), state = Array.from({ length: G * G }, () => Math.random() < 0.5);
            for (let i = 0; i < G * G; i++) bits.set([(i % G - G / 2 + 0.5) * 1.6, ((i / G | 0) - G / 2 + 0.5) * 1.6, 0], i * 3);
            const bg = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(bits, 3)).setAttribute('color', new THREE.BufferAttribute(bc, 3));
            const hash = new THREE.Points(bg, ptsMat(1, 1, true)); g.add(hash);
            const { segs, paths } = makeTree(4, 2, 5, 1.1); // BK-tree of known hashes
            const tree = lines(segs, mat(accent, 0.4)); tree.rotation.z = -Math.PI / 2; tree.position.set(14, 0, 0); g.add(tree);
            const pulse = pulses(tree, paths, 24, 0.6);
            let flip = 0;
            return (t, dt) => {
                shield.rotation.y += 0.003; shield.rotation.x += 0.001; inner.rotation.y -= 0.004;
                if ((flip += dt) > 0.12) { flip = 0; state[(Math.random() * 64) | 0] ^= 1; }
                state.forEach((on, i) => bc.set(on ? [1, 1, 1] : [accent.r * 0.4, accent.g * 0.4, accent.b * 0.4], i * 3));
                bg.attributes.color.needsUpdate = true; pulse(dt);
            };
        },
    };

    scenes['vault-v1'] = scenes['vault-v2']; // same idea, earlier version
    const tick = (scenes[p.id] || (() => () => {}))();
    let last = performance.now(), t = 0;
    (function loop(now) {
        requestAnimationFrame(loop);
        const dt = Math.min((now - last) / 1000, 0.1); last = now; t += dt;
        tick(t, dt);
        root.rotation.x += (-my * 0.12 - root.rotation.x) * 0.05;
        root.rotation.y += (mx * 0.15 - root.rotation.y) * 0.05;
        renderer.render(scene, camera);
    })(last);

    addEventListener('resize', () => {
        camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
        root.position.x = innerWidth > 900 ? 18 : 0;
    });
}
