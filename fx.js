// Small shared effects for the home page and the dossiers.
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]still\b/.test(location.search); // ?still renders static frames (used for the OG image)
const sysCode = i => 'SYS_' + String(i + 3).padStart(2, '0'); // SYS_00..02 were the original identity/Friday/Vault slots
const statusOf = p => (p.live ? 'LIVE' : p.repo ? 'OPEN SOURCE' : 'NOT PUBLIC');

// Decrypt-style text reveal: scrambled glyphs resolve left to right.
function scramble(el, text = el.textContent, ms = 900) {
    if (calm) { el.textContent = text; return Promise.resolve(); }
    const glyphs = '█▓▒░<>/\\[]{}=+*^?#_', t0 = performance.now();
    return new Promise(done => {
        (function tick(now) {
            const k = Math.min(1, (now - t0) / ms), fixed = Math.floor(k * text.length);
            el.textContent = text.slice(0, fixed) + [...text.slice(fixed)].map(c => c === ' ' || c === '\n' ? c : glyphs[(Math.random() * glyphs.length) | 0]).join('');
            k < 1 ? requestAnimationFrame(tick) : (el.textContent = text, done());
        })(t0);
    });
}

// Sync accent from the user's saved shell theme (set with `theme` in the shell).
const THEMES = { red: ['#e50914', '#ff6b73'], cyan: ['#00e5ff', '#7df9ff'], amber: ['#ffb000', '#ffd36b'], green: ['#00e5a0', '#7cffcb'], violet: ['#b388ff', '#d6bfff'], pink: ['#ff4d8d', '#ffb3d1'] };
function applyTheme(name) {
    const t = THEMES[name]; if (!t) return false;
    document.documentElement.style.setProperty('--accent', t[0]); document.documentElement.style.setProperty('--accent2', t[1]);
    try { localStorage.setItem('sp-theme', name); } catch {}
    return true;
}
try { applyTheme(localStorage.getItem('sp-theme')); } catch {}

// ---- Shared dossier pieces: live window, media gallery, per-project git telemetry ----
const fmt = n => n.toLocaleString('en-US');
const day = d => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const CAPTIONS = { 'branch-hq-home-office': 'The office: every request goes to a team you can watch work', 'branch-hq-chat': 'A request, routed by the lead to the builders', 'branch-hq-projects-start': 'Working on your own repository', 'branch-hq-site': 'The landing page', 'ring0-demo': 'Recorded: three schedulers on one workload', 'mend-demo': 'Recorded: an image scratched and repaired by the decoder' };
const shotOf = id => `media/${id}.webp`;

function liveWindow(p) {
    const poster = p.media && p.media[0], host = p.live ? new URL(p.live).host + new URL(p.live).pathname.replace(/\/$/, '') : '';
    if (!poster) return '';
    return `<figure class="live-win" data-live="${p.embed && p.live ? esc(p.live) : ''}">
        <div class="lw-bar"><span class="lw-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="lw-url">${p.live ? `https://<b>${esc(host)}</b>` : 'local build · not deployed'}</span>${p.live ? `<a href="${esc(p.live)}" target="_blank" rel="noopener">Open ↗</a>` : ''}</div>
        <div class="lw-stage"><img src="${shotOf(poster)}" alt="${esc(p.title)}, captured from ${p.live ? 'the live deployment' : 'the running app'}" loading="lazy" decoding="async">
            ${p.embed && p.live ? `<button class="lw-boot" type="button" aria-label="Run the live ${esc(p.title)} inside this page"><span>▶ Boot live instance</span><small>runs the real deployment inside this page</small></button>` : ''}</div>
        ${!p.embed && p.live ? `<p class="lw-note">This site refuses to be framed (X-Frame-Options: DENY), as a vault should. Open it in its own tab.</p>` : ''}
    </figure>`;
}
function gallery(p) {
    const rest = (p.media || []).slice(1);
    return rest.length ? `<div class="gallery">${rest.map(m => `<figure><img src="${shotOf(m)}" alt="${esc(CAPTIONS[m] || p.title)}" loading="lazy" decoding="async"><figcaption>${esc(CAPTIONS[m] || 'Live deployment')}</figcaption></figure>`).join('')}</div>` : '';
}
function teleStrip(p) {
    const t = typeof TELEMETRY !== 'undefined' && TELEMETRY.projects[p.id]; if (!t) return '';
    return `<div class="tele" aria-label="Engineering record from git history"><span><b>${fmt(t.commits)}</b>commits</span><span><b>${fmt(t.loc)}</b>lines of source</span>${t.tests ? `<span><b>${fmt(t.tests)}</b>test cases</span>` : ''}<span><b>${day(t.first)}</b>→ ${day(t.last)}</span></div>`;
}
document.addEventListener('click', e => { // boot a live window on request, so nothing heavy loads until asked
    const b = e.target.closest('.lw-boot'); if (!b) return;
    const win = b.closest('.live-win'), url = win.dataset.live, f = document.createElement('iframe');
    Object.assign(f, { src: url, title: 'Live deployment', loading: 'eager', allow: 'clipboard-write; fullscreen' });
    f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads');
    b.replaceWith(f); f.focus();
});
