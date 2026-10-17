// 2D canvas backgrounds for the bespoke pages (the other dossiers use WebGL scenes in project-bg.js).
window.customBg = {
    // Branch HQ: the app's night sky (faint stars, a few constellations) plus the animated pixel office.
    'branch-hq'(canvas) {
        const ctx = canvas.getContext('2d'); let W, H, stars, lines;
        const build = () => {
            W = canvas.width = innerWidth; H = canvas.height = innerHeight;
            stars = Array.from({ length: Math.round(W * H / 9000) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.2 + .3, ph: Math.random() * 6.28, sp: Math.random() * 1.5 + .4 }));
            lines = Array.from({ length: 5 }, () => { let a = stars[(Math.random() * stars.length) | 0]; const path = [a]; for (let k = 0; k < 4; k++) { const near = stars.filter(s => s !== a && Math.hypot(s.x - a.x, s.y - a.y) < 170).sort(() => Math.random() - .5)[0]; if (!near) break; path.push(near); a = near; } return path; });
        };
        build(); addEventListener('resize', build);
        const draw = t => {
            ctx.clearRect(0, 0, W, H);
            let g = ctx.createRadialGradient(W / 2, -H * .06, 0, W / 2, -H * .06, H * .8); g.addColorStop(0, 'rgba(150,175,255,.13)'); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
            g = ctx.createRadialGradient(W * .92, H * .88, 0, W * .92, H * .88, H * .5); g.addColorStop(0, 'rgba(139,136,240,.07)'); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
            ctx.strokeStyle = 'rgba(190,205,255,.09)'; ctx.lineWidth = 1;
            lines.forEach(p => { ctx.beginPath(); p.forEach((s, k) => k ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y)); ctx.stroke(); });
            stars.forEach(s => { ctx.globalAlpha = .25 + .45 * (.5 + .5 * Math.sin(t / 1000 * s.sp + s.ph)); ctx.fillStyle = '#d6e1ff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill(); });
            ctx.globalAlpha = 1;
        };
        draw(0);
        if (!calm) (function loop(t) { draw(t); setTimeout(() => requestAnimationFrame(loop), 60); })(0);
        pixelOffice();
    },

    // Zero-Trust Vault v2: guilloche, the engraved line work used on banknotes. Static; drawn once per resize.
    'vault-v2'(canvas) {
        const ctx = canvas.getContext('2d');
        const draw = () => {
            const W = canvas.width = innerWidth, H = canvas.height = innerHeight; ctx.clearRect(0, 0, W, H);
            ctx.strokeStyle = 'rgba(181,18,27,.12)'; ctx.lineWidth = .7;
            const rosette = (cx, cy, R, k, d) => { const r = R / k; ctx.beginPath(); for (let t = 0; t <= Math.PI * 2 * k; t += .02) { const x = cx + (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t), y = cy + (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t); t ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); };
            const big = Math.min(W, H) * .5;
            [[7, .55], [9, .5], [11, .45], [13, .4]].forEach(([k, d], n) => rosette(W * .86, H * .22, big * (1 - n * .18), k, big * d * (1 - n * .1)));
            rosette(W * .06, H * .92, big * .6, 8, big * .3);
            // wave bands along the foot of the page
            for (let n = 0; n < 14; n++) { ctx.beginPath(); for (let x = 0; x <= W; x += 6) { const y = H - 30 - n * 3 + Math.sin(x / 70 + n * .35) * 9 * (1 + n * .05); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
        };
        draw(); addEventListener('resize', draw);
    },
};

// The Branch HQ office: six rooms, six teams, a file passing desk to desk. Logical 320x200, scaled up crisp.
function pixelOffice() {
    const cv = document.getElementById('office'); if (!cv) return;
    const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
    const C = { floor: '#0d1020', wall: '#252a4a', room: '#141831', desk: '#2a3052', mon: '#0a0c1c', glow: '#8b88f0', text: '#7f86b0', plant: '#3c8d63' };
    const rect = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    const label = (s, x, y) => { ctx.fillStyle = C.text; ctx.font = '7px Silkscreen, monospace'; ctx.fillText(s, x, y); };
    const rooms = [['STRATEGY', 180, 36], ['LEGAL', 250, 36], ['MARKETING', 180, 90], ['SALES', 250, 90], ['SUPPORT', 180, 144], ['LOUNGE', 250, 144]];
    const people = [['#c9a46a', '#5e5ce6'], ['#2a1a12', '#3e8f7a'], ['#3b2a1e', '#b9772f'], ['#7a3f2a', '#8b88f0'], ['#1c1c24', '#c0527a'], ['#d8c08a', '#4a6fa5']];
    const person = (x, y, [hair, shirt], bob) => { rect(x + 1, y + bob, 4, 3, '#e8b894'); rect(x, y - 1 + bob, 6, 2, hair); rect(x + 1, y + 3 + bob, 4, 3, shirt); };
    const desks = [[188, 58], [214, 58], [258, 58], [284, 58], [188, 112], [214, 112], [258, 112], [284, 112], [188, 166], [214, 166], [24, 112], [58, 112], [92, 112], [24, 160], [58, 160], [92, 160]];
    const path = [[52, 40], [214, 58], [24, 112], [92, 160], [258, 112], [188, 166]];
    const who = [['Mitchell', 'working out who does what'], ['Jamie', 'building the website'], ['Dwayne', 'writing the server'], ['Penny', 'reviewing every line'], ['Riley', 'drafting the handover'], ['Dana', 'recording what was done']];
    let step = 0, last = 0;
    const frame = t => {
        rect(0, 0, 320, 200, C.floor);
        ctx.strokeStyle = C.wall; ctx.lineWidth = 2; ctx.strokeRect(1, 1, 318, 198);
        for (let x = 10; x < 310; x += 28) rect(x, 4, 16, 6, '#1a2050'), rect(x + 3, 6, 3, 2, 'rgba(160,170,255,.6)'); // windows
        rects();
        function rects() {
            // conference + kitchen (top left)
            rect(6, 18, 100, 70, C.room); label('CONFERENCE', 10, 84); rect(24, 40, 56, 18, C.desk);
            [30, 46, 62].forEach(x => { rect(x, 34, 6, 4, '#3a4070'); rect(x, 62, 6, 4, '#3a4070'); });
            rect(112, 18, 60, 70, '#10142a'); label('KITCHEN', 130, 84); rect(118, 24, 24, 6, C.desk); rect(150, 24, 14, 12, C.desk);
            label('ENGINEERING', 10, 102);
            rooms.forEach(([n, x, y]) => { rect(x - 8, y - 8, 66, 50, C.room); label(n, x - 4, y - 1); });
        }
        desks.forEach(([x, y], k) => {
            rect(x, y, 22, 9, C.desk); rect(x + 6, y - 7, 10, 7, C.mon);
            const on = (Math.floor(t / 400) + k) % 4 !== 0; // screens flicker as people type
            rect(x + 7, y - 6, 8, 5, on ? C.glow : '#1d2147');
        });
        people.forEach((pp, k) => { const [x, y] = desks[[0, 11, 12, 6, 2, 8][k]]; person(x + 8, y + 10, pp, Math.sin(t / 300 + k) > .6 ? 1 : 0); });
        // plants
        [[8, 90], [100, 22], [304, 186], [172, 186]].forEach(([x, y]) => (rect(x, y, 6, 6, C.plant), rect(x + 1, y + 6, 4, 3, '#4a3a2a')));
        // the file moving between desks
        const [ax, ay] = path[step % path.length], [bx, by] = path[(step + 1) % path.length], k = Math.min(1, (t - last) / 1400);
        rect(ax + (bx - ax) * k, ay + (by - ay) * k, 5, 4, '#e9eaff');
        if (t - last > 1400) { last = t; step++; const [n, w] = who[(step) % who.length]; document.getElementById('office-who').textContent = n; document.getElementById('office-what').textContent = w; }
    };
    frame(0);
    if (!calm) (function loop(t) { frame(t); setTimeout(() => requestAnimationFrame(loop), 70); })(0);
}
