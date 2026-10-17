// Bespoke dossier pages for the two projects whose real products have a strong visual identity of their own.
// Branch HQ: night sky, pixel office, Instrument Serif. Zero-Trust Vault v2: banknote paper, Bodoni, security red.
// Each returns the page body; project.js adds the pager. Data still comes from projects.js.

const sprite = (hair, shirt, skin = '#e8b894') => {
    const rows = ['..hhhh..', '.hhhhhh.', '.hssssh.', '.sesses.', '.ssssss.', '..cccc..', '.cccccc.', '.cc..cc.', '.pp..pp.'];
    const col = { h: hair, s: skin, e: '#1a1a2e', c: shirt, p: '#2b2f4a' };
    const rects = rows.flatMap((r, y) => [...r].map((ch, x) => col[ch] ? `<rect x="${x}" y="${y}" width="1" height="1" fill="${col[ch]}"/>` : '')).join('');
    return `<svg viewBox="0 0 8 9" width="40" height="45" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
};
const blocksHtml = (p, cls) => p.blocks.map(([t, lines], n) => `
    <section class="${cls}-sec">
        <p class="${cls}-label">${String(n + 1).padStart(2, '0')} · ${esc(t)}</p>
        ${lines.map(([k, v]) => `<p class="${cls}-row"><b>${esc(k)}</b> ${esc(v)}</p>`).join('')}
    </section>`).join('');

const PAGES = {
    'branch-hq': (p, i) => {
        const team = [
            ['Lead', 'Mitchell', 'Reads the request, asks for anything important that is missing, and routes the work.', '#c9a46a', '#5e5ce6'],
            ['Frontend', 'Jamie', 'The website people actually use: pages, forms, layout and the small moments of motion.', '#2a1a12', '#3e8f7a'],
            ['Backend', 'Dwayne', 'The server, the database and the rules: logins, bookings, and nothing saved that should not be.', '#3b2a1e', '#b9772f'],
            ['Reviewer', 'Penny', 'Reads every change like a senior engineer would and records a verdict. Never the model that wrote it.', '#7a3f2a', '#8b88f0'],
            ['Documents', 'Riley', 'Proposals, reports and spreadsheets as real PDF, Word, Excel and PowerPoint files.', '#1c1c24', '#c0527a'],
            ['Operations', 'Dana', 'Answers from the real record: what was built, what passed, what is still open.', '#d8c08a', '#4a6fa5'],
        ];
        return `
        <div class="bh">
            <header class="bh-hero">
                <span class="bh-badge"><b>New</b> Pull requests with the proof attached</span>
                <p class="bh-kicker">${sysCode(i)} · ${esc(p.kind)} · ${p.year}</p>
                <h1>AI writes the code.<br>Your auditors get the <em>proof.</em></h1>
                <p class="bh-lede">${esc(p.concept)} When a bank, insurer or hospital asks which of your code AI wrote, you hand them a report they can verify without us.</p>
                <div class="bh-ctas">
                    <a class="bh-btn primary" href="${esc(p.live)}" target="_blank" rel="noopener">Visit the site ↗</a>
                    <a class="bh-btn" href="${esc(p.repo)}/releases/latest" target="_blank" rel="noopener">Latest release ↗</a>
                </div>
                <p class="bh-req">Mac with Apple silicon · Windows 10 or 11, 64-bit</p>
            </header>

            <div class="bh-stats">${p.stats.map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>

            <section class="bh-block">
                <p class="bh-kick">The office</p>
                <h2>Watch the work <em>happen.</em></h2>
                <p class="bh-sub">Every request goes to a team in a little pixel office. The lead calls a meeting, the builders' screens light up as they write, the reviewer checks the result, and the file passes from desk to desk.</p>
                <figure class="bh-office"><canvas id="office" width="320" height="200" aria-label="Animated pixel office with six departments"></canvas>
                    <figcaption><i></i><b id="office-who">Mitchell</b> <span id="office-what">working out who does what</span></figcaption></figure>
            </section>

            <section class="bh-block">
                <p class="bh-kick">The team</p>
                <h2>Six specialists. <em>One</em> conversation.</h2>
                <div class="bh-team">${team.map(([role, name, text, hair, shirt]) => `
                    <article><div class="bh-av">${sprite(hair, shirt)}</div><p class="bh-role">${role}</p><h3>${name}</h3><p>${text}</p><small>waiting</small></article>`).join('')}
                </div>
            </section>

            <section class="bh-block bh-two">
                <div>
                    <p class="bh-kick">Proof, not promises</p>
                    <h2>Nothing is handed over <em>on trust.</em></h2>
                    ${blocksHtml(p, 'bh')}
                </div>
                <aside class="bh-proof" aria-label="Example verification run">
                    <p class="bh-label">Before you see it · example run</p>
                    <ul>
                        <li><span class="ok">✓</span>Security scan<em>0 blockers</em></li>
                        <li><span class="ok">✓</span>Code review<em>approved</em></li>
                        <li><span class="ok">✓</span>Started for real<em>:8555 up</em></li>
                        <li><span class="ok">✓</span>A real record saved and read back<em>201</em></li>
                    </ul>
                    <p class="bh-verdict"><b>Verified.</b> Handed over with the proof attached.</p>
                </aside>
            </section>

            <section class="bh-block"><p class="bh-kick">Stack</p><p class="bh-stack">${esc(p.stack)}</p></section>
            <section id="demo-slot"></section>
        </div>`;
    },

    'vault-v2': (p, i) => {
        const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI'];
        const coupon = n => `<div class="vt-coupon"><span class="vt-pres">Presented</span><svg viewBox="-20 -20 40 40" width="46" height="46" aria-hidden="true">${rosette(n)}</svg><b>${numerals[n]}</b><small>${['83·91', '78·4E', '77·B2', '5B·1D'][n]}</small></div>`;
        return `
        <div class="vt">
            <div class="vt-micro" aria-hidden="true"><span>ZERO-TRUST VAULT · CERTIFICATE OF CUSTODY · NON-NEGOTIABLE · OPENS ONLY BY QUORUM · KEYS NEVER LEAVE THE HOLDER · ZERO-KNOWLEDGE · </span><span>ZERO-TRUST VAULT · CERTIFICATE OF CUSTODY · NON-NEGOTIABLE · OPENS ONLY BY QUORUM · KEYS NEVER LEAVE THE HOLDER · ZERO-KNOWLEDGE · </span></div>
            <header class="vt-hero">
                <div>
                    <p class="vt-serial">Nº 00${i + 1} · ${esc(p.kind)} · private by design</p>
                    <h1>Some secrets should outlive you. <em>None should leak.</em></h1>
                    <p class="vt-lede">${esc(p.concept)} Split the key into coupons for the people you trust: any three can open it, two learn nothing.</p>
                    <div class="vt-ctas">
                        <a class="vt-btn" href="${esc(p.live)}" target="_blank" rel="noopener">Open the live vault ↗</a>
                        <a class="vt-btn ghost" href="${esc(p.repo)}" target="_blank" rel="noopener">Source code ↗</a>
                    </div>
                    <p class="vt-fine">${esc(p.title)} · beta · the secret-sharing library is audited, the application is not yet.</p>
                </div>
                <figure class="vt-cert" aria-label="Specimen certificate of custody">
                    <p class="vt-ctitle">Zero-Trust Vault</p>
                    <h2>Certificate of Custody</h2>
                    <p class="vt-cno">Nº ZTV-7F1A-0042 · <i>specimen</i></p>
                    <dl><div><dt>Contents</dt><dd>Sealed, 1 item</dd></div><div><dt>Opens with</dt><dd>Any 3 of 5 coupons</dd></div><div><dt>Readable by issuer</dt><dd>No</dd></div></dl>
                    <div class="vt-coupons">${[0, 1, 2, 3].map(coupon).join('')}</div>
                    <svg class="vt-seal" viewBox="-50 -50 100 100" aria-hidden="true"><defs><path id="ring" d="M0,-36 a36,36 0 1,1 -0.01,0"/></defs>${rosette(5, 1.5)}<circle r="46" fill="none" stroke="#b5121b" stroke-width="1.5"/><circle r="26" fill="none" stroke="#b5121b" stroke-width="1"/><text font-size="7.4" letter-spacing="1.6" fill="#b5121b" font-family="Archivo, sans-serif" font-weight="700"><textPath href="#ring">SEALED · NON-TRANSFERABLE · ZERO-KNOWLEDGE ·</textPath></text></svg>
                </figure>
            </header>

            <div class="vt-stats">${p.stats.map(([v, l], n) => `<div><small>${numerals[n]}</small><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>

            <div class="vt-grid">
                ${p.blocks.map(([t, lines], n) => `
                <section class="vt-card"><p class="vt-label">${numerals[n]} · ${esc(t)}</p>
                    ${lines.map(([k, v]) => `<p><b>${esc(k)}</b> ${esc(v)}</p>`).join('')}
                </section>`).join('')}
            </div>
            <section class="vt-card vt-wide"><p class="vt-label">Stack</p><p class="vt-mono">${esc(p.stack)}</p></section>
            <section id="demo-slot"></section>
        </div>`;
    },
};

// A guilloche rosette: an epitrochoid traced twice with a phase offset, as in banknote printing.
function rosette(n, scale = 1) {
    const k = [5, 7, 9, 6, 8, 11][n % 6], pts = [], R = 12 * scale, r = R / k, d = R * 0.6;
    for (let t = 0; t <= Math.PI * 2 * k; t += 0.05) pts.push(`${((R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t) * 0.55).toFixed(2)},${((R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t) * 0.55).toFixed(2)}`);
    return `<polyline points="${pts.join(' ')}" fill="none" stroke="#b5121b" stroke-width="0.35" opacity=".85"/><circle r="${(R * 1.12).toFixed(1)}" fill="none" stroke="#b5121b" stroke-width="0.4"/>`;
}
