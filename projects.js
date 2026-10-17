// Projects built with Claude. Rendered by index.html (list) and project.html (dossier).
// Private repos have no `repo` link on purpose.
const PROJECTS = [
  {
    id: 'branch-hq', sys: 'SYS_03 // AGENTIC_AI', title: 'BRANCH HQ', accent: '#00E5A0',
    role: 'Founder, Architecture & Full-Stack Dev',
    concept: 'An Electron desktop app that turns a plain-language request into a working, running full-stack application. Everything is generated, security-scanned, reviewed and executed on the user\'s own machine, and every generation lands in a tamper-evident audit log.',
    blocks: [
      ['01 // AGENT CREW', [
        ['Michael:', 'reads the request, picks the specialists, routes the work.'],
        ['Jim / Dwight:', 'frontend (React, Vite, Tailwind) and backend (Express, encrypted lowdb; Python FastAPI too).'],
        ['Pam / Riley / Donna:', 'code review with an explicit verdict, documents (PDF, DOCX, XLSX, PPTX), and operations from real audit data.']]],
      ['02 // PIPELINE', [
        ['Gate 1:', 'deterministic Babel-AST security scan. Blocks hardcoded credentials, plaintext passwords, insecure cookies.'],
        ['Review, run, audit:', 'LLM review, real sandboxed execution with self-healing, then a SHA-256 hash-chained audit record. Each stage is reported separately and never conflated.']],
      ],
      ['03 // PROVEN, NOT ASSUMED', [
        ['Deploys:', 'a generated app was pushed to GitHub and deployed live on Render, health-checked and read back over the public URL.'],
        ['Tests:', '700+ passing. The deploy run caught a real bug (tsx missing from the production image) that previews never would have.']]],
    ],
    stack: 'Electron, React, TypeScript, Express, FastAPI, Vitest',
  },
  {
    id: 'vault-v2', sys: 'SYS_04 // CRYPTO_SEC', title: 'ZERO-TRUST VAULT V2', accent: '#FFB000',
    role: 'Security Architecture & Full-Stack Dev',
    concept: 'Client-side, zero-knowledge encryption for things that must outlive you: seed phrases, recovery codes, wills, credentials, files. Split secrets between people you trust. No server ever sees a key or plaintext.',
    live: 'https://zero-trust-vault-v2.vercel.app', repo: 'https://github.com/shrestha-droid/zero-trust-vault-v2',
    blocks: [
      ['01 // KEY SLOTS', [
        ['Unlock methods:', 'Shamir shards (any K of N, 2 to 16), an Argon2id passphrase, both together as two-factor, or a hardware passkey via WebAuthn PRF.'],
        ['Format:', 'AES-256-GCM with the header bound as associated data, key-committed (v3) and Padme-padded. No public-key crypto, so nothing quantum-weak.']],
      ],
      ['02 // HARDENING', [
        ['Isolation:', 'crypto runs in a Web Worker; strict CSP, Trusted Types, air-gap mode that enforces connect-src none.'],
        ['Forged shards:', 'given more than K shards it finds a consistent subset and names the ones that do not fit.']]],
      ['03 // EVIDENCE', [
        ['Reproducible builds:', 'a daily public job rebuilds the app and fails unless hosted and offline files match byte for byte.'],
        ['Offline:', 'builds to one self-contained HTML file. Beta; the secret-sharing library is audited, this app is not yet.']]],
    ],
    stack: 'TypeScript, WebCrypto, Argon2id (WASM), Shamir, WebAuthn, Vercel',
  },
  {
    id: 'spherex', sys: 'SYS_05 // NASA_SPACE_APPS', title: 'SPHEREX MOVING SKY', accent: '#7AB8FF',
    role: 'NASA Space Apps 2026 // Planet X and SPHEREx',
    concept: 'A public web tool that finds things that move in NASA SPHEREx all-sky images: fast main-belt asteroids and the slow distant movers a Planet X would be. Every result is graded against JPL\'s catalogue.',
    live: 'https://spherex-moving-sky.vercel.app', repo: 'https://github.com/shrestha-droid/spherex-moving-sky',
    blocks: [
      ['01 // DATA PATH', [
        ['Remote FITS:', 'streams only the header and needed pixel rows of 69 MB SPHEREx images from NASA IRSA with HTTP Range requests.'],
        ['Spectra:', 'a spectrum for each detected asteroid.']]],
      ['02 // VALIDATION', [
        ['Planet X test:', 'slow-mover detection tested on the real dwarf planet Makemake at 52.7 au.'],
        ['Honesty:', 'graded against JPL, with HOW_IT_WORKS and a point-by-point external review response in the repo.']]],
    ],
    stack: 'Python, FITS, JPL catalogue, HTML, Vercel',
  },
  {
    id: 'clps', sys: 'SYS_06 // NASA_SPACE_APPS', title: 'CLPS LUNAR MISSION BROWSER', accent: '#C8C8D8',
    role: 'NASA Space Apps 2026 // CLPS Lunar Mission Browser',
    concept: 'Compare lunar south-pole landing sites at a glance: when the Sun is up for power and when Earth is up for direct-to-Earth comms.',
    blocks: [
      ['01 // HOW IT WORKS', [
        ['Ephemeris:', 'Sun and Earth azimuth and elevation from the JPL Horizons API, observed from the lunar surface (DE441).'],
        ['Zero dependencies:', 'Python standard library fetcher plus a static viewer. data.json is committed so it runs with no network.']]],
      ['02 // KNOWN LIMITS', [
        ['Next step:', 'the horizon is a smooth sphere; the real fix is a per-azimuth horizon mask from a LOLA DEM.']]],
    ],
    stack: 'Python, JPL Horizons, HTML/JS',
  },
  {
    id: 'drishti', sys: 'SYS_07 // TRAFFIC_AI', title: 'DRISHTI (दृष्टि)', accent: '#FF9F1C',
    role: 'AI Systems Architect',
    concept: 'A working concept for an AI traffic-signal system built for Indian mixed traffic: two-wheelers, autos, buses, cycles, pedestrians and stray cattle.',
    blocks: [
      ['01 // MACHINE SIGHT DEMO', [
        ['Clay-model city:', 'a lens reveals what the cameras and model see: sensor point clouds, semantic segments, queue and flow analytics.'],
        ['Fixed-time twin:', 'runs the same demand under a fixed plan so the AI controller can be compared head to head, plus an in-browser benchmark.']]],
      ['02 // SIMULATOR', [
        ['Microscopic sim:', 'left-hand traffic, PCU-weighted queues, IDM car-following, lane changes, pedestrians, red-light jumpers, helmet violations, cattle incidents.']]],
    ],
    stack: 'JavaScript, WebGL, custom traffic simulator',
  },
  {
    id: 'bheed-drishti', sys: 'SYS_08 // CROWD_SAFETY', title: 'BHEED DRISHTI (भीड़ दृष्टि)', accent: '#FF6B35',
    role: 'AI Systems Architect', repo: 'https://github.com/shrestha-droid/Bheed-Drishti',
    concept: 'A crowd-safety digital twin for mass gatherings. A clay model of a temple town filled with thousands of simulated pilgrims, run twice side by side from the same arrivals: one on a fixed barricade plan, one run by an AI controller that watches density, forecasts it and routes the crowd.',
    blocks: [
      ['01 // THE TWIN', [
        ['Town model:', 'ghats, narrow lanes, a footbridge, barricades and gates, a railway station, a bus stand, a sadhu camp.'],
        ['A/B run:', 'identical crowd and arrivals, so the difference is the controller and nothing else.']]],
      ['02 // CONTEXT', [
        ['Built for:', 'police, district administrations, disaster-management authorities and temple trusts. Next deadline: the 2027 Nashik-Trimbakeshwar Simhastha Kumbh.'],
        ['Ships as:', 'a static site, or one self-contained HTML file.']]],
    ],
    stack: 'TypeScript, Vite, WebGL',
  },
  {
    id: 'ring0', sys: 'SYS_09 // OS_EDU', title: 'RING0', accent: '#B388FF',
    role: 'Full-Stack Dev & Interaction Design', live: 'https://shrestha-droid.github.io/ring0/', repo: 'https://github.com/shrestha-droid/ring0',
    concept: 'Operating systems, made visible. An interactive simulator for the parts of an OS course that are hard to see on a whiteboard. Rewind time, compare algorithms on the same workload, and share any scenario as a link.',
    blocks: [
      ['01 // MODULES', [
        ['CPU scheduler:', 'FCFS, SJF, SRTF, Round Robin, Priority with aging, MLFQ. Gantt chart with a lane per process, scrubbing, and a three-way compare mode.'],
        ['Virtual memory, deadlock, sync:', 'page replacement algorithms, deadlock detection and synchronization scenarios.']]],
    ],
    stack: 'TypeScript, GitHub Pages',
  },
  {
    id: 'mend', sys: 'SYS_10 // WASM_EXPLAINER', title: 'MEND', accent: '#4ADE80',
    role: 'Full-Stack Dev & C++/WASM', live: 'https://mend-azure.vercel.app',
    concept: 'A scroll-driven, interactive explainer of Reed-Solomon error correction. You scratch an image with your cursor, and a decoder written in C++ and compiled to WebAssembly finds every damaged byte and repairs it, step by step, on screen.',
    blocks: [
      ['01 // REAL, NOT ANIMATED', [
        ['RS(255,191):', 'a genuine encode, corrupt, decode loop. Pick a sample, upload an image or type a message and watch it split into blocks and heal.'],
        ['Stack:', 'C++ decoder compiled with Emscripten to WebAssembly.']]],
    ],
    stack: 'C++, WebAssembly, TypeScript, Vercel',
  },
  {
    id: 'ncii-shield', sys: 'SYS_11 // SAFETY_TECH', title: 'NCII SHIELD', accent: '#FF4D8D',
    role: 'Backend & Privacy Engineering', repo: 'https://github.com/shrestha-droid/ncii-shield',
    concept: 'Client-side perceptual hashing plus BK-tree matching scaffold for takedowns of non-consensual intimate imagery. The image never leaves the victim\'s device; only a hash does.',
    blocks: [
      ['01 // FLOW', [
        ['Local hashing:', 'the browser dHashes files itself (video as 8 sampled frames) and sends hex only.'],
        ['Matching:', 'a worker matches ingested hashes with a BK-tree (Hamming distance 10 or less).'],
        ['Consent gate:', 'a match stays pending until the registered user confirms; only then is a notice drafted (IT Rules 3(2)(b)), and sending is a dry run.']]],
    ],
    stack: 'Python (FastAPI), Next.js, BK-tree',
  },
];
