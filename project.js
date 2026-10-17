const i = PROJECTS.findIndex(x => x.id === new URLSearchParams(location.search).get('id'));
const p = PROJECTS[i];
const root = document.getElementById('dossier');

if (!p) {
    root.innerHTML = '<article class="case"><h1>Target not found</h1><p class="concept"><a href="index.html">Back to the main system</a></p></article>';
} else {
    document.title = `${p.title} | Shrestha Pandey`;
    document.body.classList.add(`t-${p.id}`);
    document.getElementById('dossier-status').textContent = `${sysCode(i)} // dossier decrypted`;
    const clock = document.getElementById('clock'), tick = () => clock.textContent = new Date().toLocaleTimeString([], { hour12: false });
    tick(); setInterval(tick, 1000);

    const nb = (q, label) => q ? `<a href="project.html?id=${q.id}"><span class="mono">${label}</span><span class="t">${esc(q.title)}</span></a>` : '<span></span>';
    root.innerHTML = `
        <article class="case" style="--n:${p.blocks.length + 1}">
            <p class="eyebrow mono">${sysCode(i)} // ${esc(p.kind)} // ${p.year} // ${statusOf(p)}</p>
            <h1 id="title">${esc(p.title)}</h1>
            <p class="role mono">${esc(p.role)}</p>
            <p class="concept">${esc(p.concept)}</p>
            ${p.live || p.repo ? `<div class="btns">
                ${p.live ? `<a class="btn main" href="${esc(p.live)}" target="_blank" rel="noopener">Live deployment ↗</a>` : ''}
                ${p.repo ? `<a class="btn ${p.live ? '' : 'main'}" href="${esc(p.repo)}" target="_blank" rel="noopener">Source repository ↗</a>` : ''}
            </div>` : ''}
            <div class="stats brk">${p.stats.map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>
            ${p.blocks.map(([title, lines]) => `
            <section>
                <h2>${esc(title)}</h2>
                ${lines.map(([k, v]) => `<p><strong>${esc(k)}</strong> ${esc(v)}</p>`).join('')}
            </section>`).join('')}
            <section>
                <h2>Stack</h2>
                <p class="stack">${esc(p.stack)}</p>
            </section>
            <section id="demo-slot"></section>
        </article>
        <nav class="pager" aria-label="More targets">${nb(PROJECTS[i - 1], '◂ Previous target')}${nb(PROJECTS[i + 1], 'Next target ▸')}</nav>`;

    scramble(document.getElementById('title'), p.title, 1000);
}
