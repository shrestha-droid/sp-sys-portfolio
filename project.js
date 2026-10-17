const i = PROJECTS.findIndex(x => x.id === new URLSearchParams(location.search).get('id'));
const p = PROJECTS[i];
const root = document.getElementById('dossier');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

if (!p) {
    root.innerHTML = '<div class="case"><h1>Not found</h1><p class="concept"><a href="index.html">Back to the portfolio</a></p></div>';
} else {
    document.title = `${p.title} | Shrestha Pandey`;
    document.documentElement.style.setProperty('--accent', p.accent);

    const nb = (q, label) => q ? `<a href="project.html?id=${q.id}"><span class="mono">${label}</span><span class="t">${esc(q.title)}</span></a>` : '<span></span>';
    root.innerHTML = `
        <article class="case">
            <p class="eyebrow mono">${esc(p.kind)} · ${p.year}</p>
            <h1>${esc(p.title)}</h1>
            <p class="role mono">${esc(p.role)}</p>
            <p class="concept">${esc(p.concept)}</p>
            ${p.live || p.repo ? `<div class="btns">
                ${p.live ? `<a class="btn" href="${esc(p.live)}" target="_blank" rel="noopener">Live site ↗</a>` : ''}
                ${p.repo ? `<a class="btn ${p.live ? 'alt' : ''}" href="${esc(p.repo)}" target="_blank" rel="noopener">Source code ↗</a>` : ''}
            </div>` : ''}
            ${p.blocks.map(([title, lines]) => `
            <section>
                <h2>${esc(title)}</h2>
                ${lines.map(([k, v]) => `<p><strong>${esc(k)}</strong> ${esc(v)}</p>`).join('')}
            </section>`).join('')}
            <section>
                <h2>Stack</h2>
                <p class="stack">${esc(p.stack)}</p>
            </section>
        </article>
        <nav class="pager" aria-label="More projects">${nb(PROJECTS[i - 1], '← Previous')}${nb(PROJECTS[i + 1], 'Next →')}</nav>`;
}
