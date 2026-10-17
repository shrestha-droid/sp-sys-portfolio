// Small shared effects for the home page and the dossiers.
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
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
