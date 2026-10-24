const i = PROJECTS.findIndex(x => x.id === new URLSearchParams(location.search).get('id'));
const p = PROJECTS[i];
const root = document.getElementById('dossier');

// Only the fonts this project's real identity uses (themes.css), instead of every family on every page.
const FONTS = {
    'conclave': 'Instrument+Serif:ital@0;1&family=Silkscreen&family=Inter:wght@400;500;600',
    'branch-hq': 'Instrument+Serif:ital@0;1&family=Silkscreen&family=Inter:wght@400;500;600',
    'vault-v2': 'Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,600;1,6..96,400&family=Archivo:wdth,wght@62..125,400..700&family=IBM+Plex+Mono:wght@400;500',
    'ring0': 'Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600',
    'mend': 'Newsreader:ital,opsz,wght@0,6..72,300;1,6..72,300&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500',
    'spherex': 'Instrument+Serif:ital@0;1&family=Archivo:wdth,wght@62..125,400..700&family=IBM+Plex+Mono:wght@400;500',
    'drishti': 'Schibsted+Grotesk:wght@400;500;700;800&family=IBM+Plex+Mono:wght@400;500&family=Tiro+Devanagari+Hindi',
    'bheed-drishti': 'Rajdhani:wght@500;600;700&family=Hind:wght@400;500&family=IBM+Plex+Mono:wght@400;500&family=Tiro+Devanagari+Hindi',
    'ncii-shield': 'Sora:wght@400;600;800&family=IBM+Plex+Mono:wght@400;500',
    'friday': 'Rajdhani:wght@500;600;700',
    'vault-v1': 'Inter:wght@400;500;600;700',
};
if (p && FONTS[p.id]) document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: `https://fonts.googleapis.com/css2?family=${FONTS[p.id]}&display=swap` }));

if (!p) {
    root.innerHTML = '<article class="case"><h1 class="c-tag">Target not found</h1><p class="c-concept"><a href="index.html">Back to the main system</a></p></article>';
} else {
    document.title = `${p.title} | Shrestha Pandey`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', p.summary);
    document.body.classList.add('t-dossier', `t-${p.id}`);
    document.getElementById('dossier-status').textContent = `${sysCode(i)} // dossier decrypted`;
    const clock = document.getElementById('clock'), tick = () => clock.textContent = new Date().toLocaleTimeString([], { hour12: false });
    tick(); setInterval(tick, 1000);

    const nb = (q, label) => q ? `<a href="project.html?id=${q.id}"><span class="mono">${label}</span><span class="t">${esc(q.title)}</span></a>` : '<span></span>';
    const generic = () => `
        <article class="case" style="--n:${p.blocks.length + 1}">
            <header class="c-hero">
                <p class="c-kicker"><span class="dot" aria-hidden="true"></span><span>${sysCode(i)}</span><span>${esc(p.kind)}</span><span>${p.year}</span>${p.live ? '<span class="live">Live</span>' : ''}</p>
                <p class="c-name" id="title" style="view-transition-name: t-${p.id}">${esc(p.title)}</p>
                <h1 class="c-tag${p.tagline.replace(/<[^>]+>/g, '').length > 44 ? ' long' : ''}">${p.tagline}</h1>
                <p class="c-concept">${esc(p.concept)}</p>
                ${p.live || p.repo ? `<div class="btns">
                    ${p.live ? `<a class="btn main" href="${esc(p.live)}" target="_blank" rel="noopener">Live deployment ↗</a>` : ''}
                    ${p.repo ? `<a class="btn" href="${esc(p.repo)}" target="_blank" rel="noopener">Source ↗</a>` : ''}
                </div>` : ''}
            </header>
            <div class="stats">${p.stats.map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>
            ${liveWindow(p)}
            ${teleStrip(p)}
            <div class="c-body">
                ${p.blocks.map(([title, lines]) => `
                <section>
                    <h2>${esc(title)}</h2>
                    ${lines.map(([k, v]) => `<p><strong>${esc(k)}</strong> ${esc(v)}</p>`).join('')}
                </section>`).join('')}
                <section><h2>Stack</h2><p class="stack">${esc(p.stack)}</p></section>
            </div>
            ${gallery(p)}
            <section id="demo-slot"></section>
        </article>`;
    const pager = `<nav class="pager" aria-label="More projects">${nb(PROJECTS[i - 1], '◂ Previous')}${nb(PROJECTS[i + 1], 'Next ▸')}</nav>`;
    root.innerHTML = (PAGES[p.id] || generic)(p, i) + pager;

    const title = document.getElementById('title');
    if (title && !PAGES[p.id]) scramble(title, p.title, 900);
}
