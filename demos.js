// Small working demos for the dossiers that earn one. Everything runs in the browser.
(() => {
    const slot = document.getElementById('demo-slot');
    if (!slot || typeof p === 'undefined' || !p) return;
    const demos = { 'friday': friday, 'vault-v1': vault, 'vault-v2': vault };
    if (!demos[p.id]) return slot.remove();
    demos[p.id](slot);

    function shell(title, tip, buttons = []) {
        slot.innerHTML = `<h2>${title}</h2><div class="demo brk"><div class="log2" id="dlog" aria-live="polite"></div>
            <form id="dform"><input id="din" autocomplete="off" spellcheck="false" aria-label="${title} input" placeholder="type here">${buttons.map(b => `<button type="button" id="${b[0]}">${b[1]}</button>`).join('')}<button type="submit">Send</button></form>
            <p class="tip">${tip}</p></div>`;
        const log = document.getElementById('dlog');
        return { log, input: document.getElementById('din'), form: document.getElementById('dform'),
            say: (html, cls = '') => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; log.append(d); log.scrollTop = log.scrollHeight; } };
    }

    // ---- Friday: an offline stand-in for the assistant ----
    function friday() {
        const { say, form, input } = shell('Talk to FRIDAY', 'Offline demo: canned answers, no LLM attached. The real assistant talks to Gemini and runs local commands.');
        say('FRIDAY_SYS: standing by. try "who", "projects", "tech", "concierge" or "contact".');
        const answers = [
            [/who|shrestha|about/, 'Shrestha Pandey: AI systems architect, full-stack developer, founder. Year 2 engineering at VIT Bhopal.'],
            [/project|built|work/, `${PROJECTS.length} projects indexed. Start with Branch HQ, Zero-Trust Vault v2 or SPHEREx Moving Sky. Type "open <name>" in the home shell.`],
            [/tech|stack|language/, 'TypeScript, Python, C++, React, Three.js, FastAPI, WebAssembly, WebCrypto. Friday itself: FastAPI, Gemini 2.5 Flash, Three.js.'],
            [/concierge/, 'Concierge is where Shrestha builds full-stack and AI software.'],
            [/contact|mail|hire/, 'shresthakp07@gmail.com. Or github.com/shrestha-droid.'],
            [/^(hi|hello|hey)/, 'Hello, operator.'],
        ];
        form.addEventListener('submit', e => {
            e.preventDefault(); const q = input.value.trim(); if (!q) return; input.value = '';
            say('&gt; ' + esc(q), 'u');
            const hit = answers.find(([re]) => re.test(q.toLowerCase()));
            setTimeout(() => say('FRIDAY_SYS: ' + esc(hit ? hit[1] : 'I am isolated from my main LLM backend in this demo. Try: who, projects, tech, contact.')), 450);
        });
    }

    // ---- Vault: real AES-256-GCM through WebCrypto, with a tamper test ----
    function vault() {
        const { say, form, input } = shell('Encrypt something', 'Real AES-256-GCM via WebCrypto, key from your passphrase with PBKDF2. The app itself uses Argon2id and Shamir shards. Nothing here leaves your browser.', [['dtamper', 'Flip a bit']]);
        const enc = new TextEncoder(), hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
        let last = null;
        const keyFor = async (pass, salt) => crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' }, await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']), { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
        const decrypt = async b => new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b.iv }, await keyFor(b.pass, b.salt), b.ct));
        say('VAULT_SYS: local crypto engine ready. type a secret and press send. the passphrase is "demo".');
        form.addEventListener('submit', async e => {
            e.preventDefault(); const text = input.value; if (!text) return; input.value = '';
            say('&gt; ' + esc(text), 'u');
            try {
                const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
                const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await keyFor('demo', salt), enc.encode(text)));
                last = { salt, iv, ct, pass: 'demo' };
                say(`salt ${hex(salt)}`); say(`iv&nbsp;&nbsp; ${hex(iv)}`); say(`ct&nbsp;&nbsp; ${hex(ct)}`);
                say(`roundtrip: ${esc(await decrypt(last))} <span class="ok">(decrypted, tag verified)</span>`, 'ok');
            } catch (err) { say('ERR: ' + esc(err.message), 'bad'); }
        });
        document.getElementById('dtamper').addEventListener('click', async () => {
            if (!last) return say('encrypt something first.', 'bad');
            const bad = { ...last, ct: last.ct.slice() }; bad.ct[0] ^= 1;
            say('flipped one bit of the ciphertext...');
            try { await decrypt(bad); say('decrypted?! that should not happen.', 'bad'); } catch { say('AUTH FAILED: the GCM tag does not match. one flipped bit and the whole thing is rejected.', 'bad'); }
        });
    }
})();
