const p = PROJECTS.find(x => x.id === new URLSearchParams(location.search).get('id'));
const root = document.getElementById('dossier');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

if (!p) {
    root.innerHTML = '<h1>DOSSIER NOT FOUND</h1>';
} else {
    document.title = `${p.title} | Project Dossier`;
    document.documentElement.style.setProperty('--accent', p.accent);
    document.getElementById('sys-status').textContent = p.sys;

    const links = [
        p.live && `<a href="${esc(p.live)}" target="_blank" rel="noopener" class="live-link-btn">[ INITIALIZE LIVE DEPLOYMENT ]</a>`,
        p.repo && `<a href="${esc(p.repo)}" target="_blank" rel="noopener" class="live-link-btn alt">[ SOURCE REPOSITORY ]</a>`,
    ].filter(Boolean).join('');

    root.innerHTML = `
        <header class="dossier-header">
            <h1>${esc(p.title)}</h1>
            <h2 class="role-highlight">ROLE // ${esc(p.role)}</h2>
            <p class="core-concept">${esc(p.concept)}</p>
            ${links ? `<div class="action-station">${links}</div>` : ''}
        </header>
        <section class="data-stream">
            ${p.blocks.map(([title, lines]) => `
            <div class="stream-block">
                <div class="stream-title">${esc(title)}</div>
                <div class="stream-content">
                    ${lines.map(([k, v]) => `<p>> <strong>${esc(k)}</strong> ${esc(v)}</p>`).join('')}
                </div>
            </div>`).join('')}
            <div class="stream-block">
                <div class="stream-title">STACK</div>
                <div class="stream-content"><p>> ${esc(p.stack)}</p></div>
            </div>
        </section>`;
}
