// Home page extras: real telemetry, the ⌘K command palette, and the printable CV.

// ---------- Telemetry (data: telemetry.js, generated from local git history) ----------
(() => {
    if (typeof TELEMETRY === 'undefined') return;
    const T = TELEMETRY, live = PROJECTS.filter(p => p.live).length;
    document.getElementById('f-commits').textContent = fmt(T.totals.commits);
    document.getElementById('tele-note').textContent = `Counted from the git history of all ${T.totals.projects} projects in the index (every branch), regenerated ${day(T.generated)}. Nothing here is estimated.`;
    const big = [[T.totals.commits, 'commits'], [T.totals.loc, 'lines of source'], [T.totals.tests, 'test cases'], [live, 'live deployments'], [T.totals.activeDays, 'days with commits'], [T.totals.peakDay, 'commits on the busiest day']];
    document.getElementById('tm-big').innerHTML = big.map(([n, l]) => `<div class="cell brk"><b data-to="${n}">0</b><span>${l}</span></div>`).join('');

    // Count up when the module scrolls into view.
    const nums = [...document.querySelectorAll('#tm-big b')];
    new IntersectionObserver((es, ob) => es.forEach(e => {
        if (!e.isIntersecting) return; ob.disconnect();
        const t0 = performance.now();
        (function run(now) { const k = calm ? 1 : Math.min(1, (now - t0) / 1400), ease = 1 - Math.pow(1 - k, 3); nums.forEach(b => b.textContent = fmt(Math.round(+b.dataset.to * ease))); if (k < 1) requestAnimationFrame(run); })(t0);
    }), { threshold: .3 }).observe(document.getElementById('tm-big'));

    // Heatmap: one cell per day from the first commit to the snapshot date, weeks as columns.
    const days = Object.keys(T.days), start = new Date(days[0] + 'T00:00:00'), end = new Date(T.generated + 'T00:00:00');
    start.setDate(start.getDate() - start.getDay()); // align to Sunday
    const max = Math.max(...Object.values(T.days)), cells = [], months = [];
    for (let d = new Date(start), col = 0; d <= end; d.setDate(d.getDate() + 1)) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` /* local date, not UTC */, n = T.days[key] || 0, lvl = n ? Math.min(4, Math.ceil(Math.log(n + 1) / Math.log(max + 1) * 4)) : 0;
        if (d.getDay() === 0) { if (d.getDate() <= 7) months.push([col + 1, d.toLocaleDateString('en-GB', { month: 'short' })]); col++; }
        cells.push(`<i class="l${lvl}" title="${day(key)} · ${n} commit${n === 1 ? '' : 's'}"></i>`);
    }
    const heat = document.getElementById('heat');
    heat.style.setProperty('--weeks', Math.ceil(cells.length / 7));
    heat.innerHTML = `<div class="heat-m">${months.map(([c, m]) => `<span style="grid-column:${c}">${m}</span>`).join('')}</div><div class="heat-g">${cells.join('')}</div>`;
    heat.setAttribute('aria-label', `${T.totals.commits} commits over ${T.totals.activeDays} active days, busiest day ${T.totals.peakDay} commits`);

    // Languages: one stacked bar plus a legend.
    const total = T.langs.reduce((s, l) => s + l[1], 0), shown = T.langs.filter(l => l[1] / total > .004);
    document.getElementById('langs').innerHTML = `<div class="lang-bar">${shown.map(([n, v, c]) => `<i style="flex:${v};background:${c}" title="${n} ${(100 * v / total).toFixed(1)}%"></i>`).join('')}</div>
        <ul class="lang-key">${shown.map(([n, v, c]) => `<li><i style="background:${c}"></i>${n}<b>${(100 * v / total).toFixed(1)}%</b></li>`).join('')}</ul>`;

    // Per project: bars on a log scale so the small ones stay visible, real numbers beside them.
    const rows = PROJECTS.map(p => [p, T.projects[p.id]]).filter(([, t]) => t).sort((a, b) => b[1].loc - a[1].loc);
    const lmax = Math.log10(Math.max(...rows.map(([, t]) => t.loc)) + 1);
    document.getElementById('per').innerHTML = rows.map(([p, t]) => `<a class="per-row" href="project.html?id=${p.id}" style="--c:${p.accent}">
        <span class="per-name"><i></i>${esc(p.title)}</span><span class="per-bar"><i style="width:${(100 * Math.log10(t.loc + 1) / lmax).toFixed(1)}%"></i></span>
        <span class="per-num">${fmt(t.loc)} <small>lines</small></span><span class="per-num">${fmt(t.commits)} <small>commits</small></span></a>`).join('');
})();

// ---------- ⌘K command palette ----------
(() => {
    const dlg = document.getElementById('palette'), q = document.getElementById('pal-q'), list = document.getElementById('pal-list');
    const go = url => () => (location.href = url), open = url => () => window.open(url, '_blank', 'noopener');
    const toast = msg => { const t = Object.assign(document.createElement('div'), { className: 'toast', textContent: msg }); document.body.append(t); setTimeout(() => t.remove(), 1800); };
    const items = [
        ...PROJECTS.map((p, i) => ({ g: 'Projects', t: p.title, s: p.kind, c: p.accent, run: go(`project.html?id=${p.id}`) })),
        ...PROJECTS.filter(p => p.live).map(p => ({ g: 'Live', t: `Run ${p.title}`, s: new URL(p.live).host, c: p.accent, run: open(p.live) })),
        ...[...document.querySelectorAll('.nav a')].map(a => ({ g: 'Go to', t: a.textContent.replace(/^\d+/, ''), s: 'section', run: () => document.querySelector(a.hash).scrollIntoView({ behavior: calm ? 'auto' : 'smooth' }) })),
        { g: 'Actions', t: 'Copy email address', s: 'shresthakp07@gmail.com', run: () => navigator.clipboard.writeText('shresthakp07@gmail.com').then(() => toast('Email copied'), () => (location.href = 'mailto:shresthakp07@gmail.com')) },
        { g: 'Actions', t: 'Download the CV (PDF)', s: 'one page', run: () => Object.assign(document.createElement('a'), { href: 'cv.pdf', download: 'Shrestha-Pandey-CV.pdf' }).click() },
        { g: 'Actions', t: 'Print the CV', s: 'the page prints as a résumé', run: () => window.print() },
        { g: 'Actions', t: 'Open the shell', s: 'or type ///', run: () => window.openShell && window.openShell() },
        { g: 'Actions', t: 'GitHub profile', s: 'github.com/shrestha-droid', run: open('https://github.com/shrestha-droid') },
        ...Object.keys(THEMES).map(n => ({ g: 'Theme', t: `Accent: ${n}`, s: THEMES[n][0], c: THEMES[n][0], run: () => { applyTheme(n); window.heroTint && window.heroTint(THEMES[n][0]); toast(`Theme ${n}`); } })),
    ];
    let shown = [], sel = 0;
    const score = (s, term) => { // subsequence match: every typed letter in order; tighter matches rank higher
        if (!term) return 1; let i = 0, gaps = 0, last = -1; s = s.toLowerCase();
        for (const ch of term) { const k = s.indexOf(ch, i); if (k < 0) return 0; gaps += last < 0 ? k : k - last - 1; last = k; i = k + 1; }
        return 1 / (1 + gaps);
    };
    const render = () => {
        const term = q.value.trim().toLowerCase();
        shown = items.map(it => ({ it, s: score(`${it.t} ${it.s} ${it.g}`, term) })).filter(x => x.s).sort((a, b) => b.s - a.s).slice(0, 40).map(x => x.it);
        sel = Math.min(sel, Math.max(0, shown.length - 1));
        let g = '';
        list.innerHTML = shown.length ? shown.map((it, k) => `${it.g !== g ? `<li class="pal-g" role="presentation">${(g = it.g)}</li>` : ''}<li role="option" id="po${k}" data-k="${k}" aria-selected="${k === sel}"${it.c ? ` style="--c:${it.c}"` : ''}><i></i><span>${esc(it.t)}</span><small>${esc(it.s)}</small></li>`).join('') : '<li class="pal-empty">No match. Try a project name, "live" or "print".</li>';
        q.setAttribute('aria-activedescendant', shown.length ? `po${sel}` : '');
        list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
    };
    const openPal = () => { if (dlg.open) return; q.value = ''; sel = 0; render(); dlg.showModal(); q.focus(); };
    const runSel = () => { const it = shown[sel]; if (!it) return; dlg.close(); it.run(); };
    q.addEventListener('input', () => { sel = 0; render(); });
    q.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % Math.max(1, shown.length); render(); }
        if (e.key === 'Enter') { e.preventDefault(); runSel(); }
    });
    list.addEventListener('click', e => { const li = e.target.closest('[data-k]'); if (li) { sel = +li.dataset.k; runSel(); } });
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); // click on the backdrop
    addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.open ? dlg.close() : openPal(); } });
    document.getElementById('open-palette').addEventListener('click', openPal);
})();

// ---------- Printable CV: the same data, laid out as a one-page résumé ----------
(() => {
    const T = typeof TELEMETRY !== 'undefined' ? TELEMETRY : null, live = PROJECTS.filter(p => p.live);
    const log = [...document.querySelectorAll('.log li')].map(li => `<li><b>${li.querySelector('h3').textContent}</b> <span>${li.querySelector('.when').textContent}</span><p>${[...li.querySelectorAll('p:not(.sub)')].map(p => p.textContent).join(' ')}</p></li>`).join('');
    const caps = [...document.querySelectorAll('.caps div')].map(d => `<li><b>${d.querySelector('dt').textContent}:</b> ${[...d.querySelectorAll('dd span')].map(s => s.textContent).join(', ')}</li>`).join('');
    document.getElementById('cv').innerHTML = `
        <header><h1>Shrestha Pandey</h1><p>AI Systems Architect · Full-Stack Developer · Founder, Concierge · Engineering, VIT Bhopal (Year 2)</p>
        <p class="cv-c">shresthakp07@gmail.com · github.com/shrestha-droid · kaggle.com/shrestha11022007 · sp-sys-portfolio.vercel.app</p></header>
        <section><h2>Profile</h2><p>${document.querySelector('#operator .lead').textContent} ${document.querySelector('#operator .about p:not(.lead)').textContent}${T ? ` Across ${T.totals.projects} projects: ${fmt(T.totals.commits)} commits, ${fmt(T.totals.loc)} lines of source and ${fmt(T.totals.tests)} test cases.` : ''}</p></section>
        <section><h2>Experience &amp; education</h2><ul class="cv-log">${log}</ul></section>
        <section><h2>Selected projects</h2><ul class="cv-p">${PROJECTS.map(p => `<li><b>${esc(p.title)}</b> <span>${esc(p.kind)}</span><p>${esc(p.summary)}${p.live ? ` <a href="${esc(p.live)}">${esc(new URL(p.live).host + new URL(p.live).pathname).replace(/\/$/, '')}</a>` : ''}</p></li>`).join('')}</ul></section>
        <section><h2>Skills</h2><ul class="cv-s">${caps}</ul></section>`;
    document.getElementById('print-cv').addEventListener('click', () => window.print());
})();
