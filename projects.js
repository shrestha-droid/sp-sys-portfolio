// Project data. Rendered by index.html (list) and project.html (case study).
// Private repos have no `repo` link on purpose.
const PROJECTS = [
  {
    id: 'branch-hq', title: "Branch HQ", kind: "Desktop app · AI engineering", year: 2026, stats: [["6", "AI specialists"], ["4", "checks on every build"], ["27/32", "builds working end to end"]], summary: "AI writes the code, your auditors get the proof: every change reaches your repo as a pull request carrying the scan, tests, review, model and approver.", accent: '#a5a3ff',
    role: 'Founder, Architecture & Full-Stack Dev',
    concept: 'Branch HQ builds and changes software with AI, and every change reaches your repository as a pull request that carries what checked it: the security scan, your tests, an independent review, the model, and who approved it.',
    live: 'https://shrestha-droid.github.io/branchhq/', repo: 'https://github.com/shrestha-droid/branchhq',
    blocks: [
      ['Proof, not promises', [
        ['Security scan:', 'a deterministic scan that blocks hardcoded credentials, plaintext passwords and insecure cookies. Nothing bypasses it.'],
        ['Independent review:', 'the reviewer reads every change like a senior engineer and records a verdict. It is never the model that wrote the code.'],
        ['Real execution and record:', 'the build is started for real, a real record is saved and read back, and the result goes into a timestamped audit record.']]],
      ['Pull requests with the proof', [
        ['Delivery:', 'changes go out as pull requests on GitHub, GitHub Enterprise or GitLab. The description lists what checked them, and the same facts travel in the commit.'],
        ['AI provenance report:', 'which lines in the repository AI wrote, by which model, checked how and approved by whom, in a form an auditor can run without Branch HQ.']]],
      ['Your model, your agreement', [
        ['Bring any model:', 'your Azure OpenAI tenant, AWS Bedrock account, Anthropic, OpenAI, Google, or a model on your own hardware.'],
        ['Local by choice:', 'on a local model, zero bytes of your code leave the building.']]],
    ],
    stack: 'Electron, React, TypeScript, Express, FastAPI, Vitest',
  },
  {
    id: 'vault-v2', title: "Zero-Trust Vault v2", kind: "Web app · Cryptography", year: 2026, stats: [["2–16", "Shamir shards"], ["256 MiB", "Argon2id memory"], ["0", "keys seen by a server"]], summary: "A client-side vault that splits secrets into Shamir shards, passphrases and passkeys. No server ever sees a key.", accent: '#e5414b',
    role: 'Security Architecture & Full-Stack Dev',
    concept: 'Client-side, zero-knowledge encryption for things that must outlive you: seed phrases, recovery codes, wills, credentials, files. Split secrets between people you trust. No server ever sees a key or plaintext.',
    live: 'https://www.zerotrustvault.in', repo: 'https://github.com/shrestha-droid/zero-trust-vault-v2',
    blocks: [
      ['Key slots', [
        ['Unlock methods:', 'Shamir shards (any K of N, 2 to 16), an Argon2id passphrase, both together as two-factor, or a hardware passkey via WebAuthn PRF.'],
        ['Format:', 'AES-256-GCM with the header bound as associated data, key-committed (v3) and Padme-padded. No public-key crypto, so nothing quantum-weak.']],
      ],
      ['Hardening', [
        ['Isolation:', 'crypto runs in a Web Worker; strict CSP, Trusted Types, air-gap mode that enforces connect-src none.'],
        ['Forged shards:', 'given more than K shards it finds a consistent subset and names the ones that do not fit.']]],
      ['Evidence', [
        ['Reproducible builds:', 'a daily public job rebuilds the app and fails unless hosted and offline files match byte for byte.'],
        ['Offline:', 'builds to one self-contained HTML file. Beta; the secret-sharing library is audited, this app is not yet.']]],
    ],
    stack: 'TypeScript, WebCrypto, Argon2id (WASM), Shamir, WebAuthn, Vercel',
  },
  {
    id: 'spherex', title: "SPHEREx Moving Sky", kind: "NASA Space Apps 2026 · Astronomy", year: 2026, stats: [["69 MB", "per FITS, only needed rows fetched"], ["52.7 au", "Makemake, the Planet X test"], ["JPL", "every result graded"]], summary: "Finds moving asteroids and Planet X candidates in SPHEREx all-sky images, graded against JPL's catalogue.", accent: '#7AB8FF',
    role: 'NASA Space Apps 2026 · Planet X and SPHEREx',
    concept: 'A public web tool that finds things that move in NASA SPHEREx all-sky images: fast main-belt asteroids and the slow distant movers a Planet X would be. Every result is graded against JPL\'s catalogue.',
    live: 'https://spherex-moving-sky.vercel.app', repo: 'https://github.com/shrestha-droid/spherex-moving-sky',
    blocks: [
      ['Data path', [
        ['Remote FITS:', 'streams only the header and needed pixel rows of 69 MB SPHEREx images from NASA IRSA with HTTP Range requests.'],
        ['Spectra:', 'a spectrum for each detected asteroid.']]],
      ['Validation', [
        ['Planet X test:', 'slow-mover detection tested on the real dwarf planet Makemake at 52.7 au.'],
        ['Honesty:', 'graded against JPL, with HOW_IT_WORKS and a point-by-point external review response in the repo.']]],
    ],
    stack: 'Python, FITS, JPL catalogue, HTML, Vercel',
  },
  {
    id: 'clps', title: "CLPS Lunar Mission Browser", kind: "NASA Space Apps 2026 · Visualisation", year: 2026, stats: [["DE441", "JPL ephemeris"], ["0", "dependencies"], ["2", "bodies tracked: Sun, Earth"]], summary: "Compares lunar south-pole landing sites by when the Sun and Earth are above the horizon.", accent: '#C8C8D8',
    role: 'NASA Space Apps 2026 · CLPS Lunar Mission Browser',
    concept: 'Compare lunar south-pole landing sites at a glance: when the Sun is up for power and when Earth is up for direct-to-Earth comms.',
    blocks: [
      ['How it works', [
        ['Ephemeris:', 'Sun and Earth azimuth and elevation from the JPL Horizons API, observed from the lunar surface (DE441).'],
        ['Zero dependencies:', 'Python standard library fetcher plus a static viewer. data.json is committed so it runs with no network.']]],
      ['Known limits', [
        ['Next step:', 'the horizon is a smooth sphere; the real fix is a per-azimuth horizon mask from a LOLA DEM.']]],
    ],
    stack: 'Python, JPL Horizons, HTML/JS',
  },
  {
    id: 'drishti', title: "Drishti (दृष्टि)", kind: "Concept · Traffic AI", year: 2026, stats: [["6", "road-user types simulated"], ["2", "controllers: fixed vs AI"], ["IDM", "car-following model"]], summary: "An AI traffic-signal concept for Indian mixed traffic, with a simulator and a fixed-time twin to benchmark against.", accent: '#FF9F1C',
    role: 'AI Systems Architect',
    concept: 'A working concept for an AI traffic-signal system built for Indian mixed traffic: two-wheelers, autos, buses, cycles, pedestrians and stray cattle.',
    blocks: [
      ['Machine sight demo', [
        ['Clay-model city:', 'a lens reveals what the cameras and model see: sensor point clouds, semantic segments, queue and flow analytics.'],
        ['Fixed-time twin:', 'runs the same demand under a fixed plan so the AI controller can be compared head to head, plus an in-browser benchmark.']]],
      ['Simulator', [
        ['Microscopic sim:', 'left-hand traffic, PCU-weighted queues, IDM car-following, lane changes, pedestrians, red-light jumpers, helmet violations, cattle incidents.']]],
    ],
    stack: 'JavaScript, WebGL, custom traffic simulator',
  },
  {
    id: 'bheed-drishti', title: "Bheed Drishti (भीड़ दृष्टि)", kind: "Digital twin · Crowd safety", year: 2026, stats: [["2", "twins, one crowd"], ["1000s", "of simulated pilgrims"], ["2027", "Simhastha Kumbh"]], summary: "A crowd-safety twin of a temple town: a fixed barricade plan against an AI controller, on the same crowd.", accent: '#FF6B35',
    role: 'AI Systems Architect', repo: 'https://github.com/shrestha-droid/Bheed-Drishti',
    concept: 'A crowd-safety digital twin for mass gatherings. A clay model of a temple town filled with thousands of simulated pilgrims, run twice side by side from the same arrivals: one on a fixed barricade plan, one run by an AI controller that watches density, forecasts it and routes the crowd.',
    blocks: [
      ['The twin', [
        ['Town model:', 'ghats, narrow lanes, a footbridge, barricades and gates, a railway station, a bus stand, a sadhu camp.'],
        ['A/B run:', 'identical crowd and arrivals, so the difference is the controller and nothing else.']]],
      ['Context', [
        ['Built for:', 'police, district administrations, disaster-management authorities and temple trusts. Next deadline: the 2027 Nashik-Trimbakeshwar Simhastha Kumbh.'],
        ['Ships as:', 'a static site, or one self-contained HTML file.']]],
    ],
    stack: 'TypeScript, Vite, WebGL',
  },
  {
    id: 'ring0', title: "RING0", kind: "Web app · Education", year: 2026, stats: [["6", "CPU schedulers"], ["3", "compared side by side"], ["1 link", "shares any scenario"]], summary: "An interactive OS simulator for scheduling, paging, deadlocks and synchronization, with shareable scenarios.", accent: '#B388FF',
    role: 'Full-Stack Dev & Interaction Design', live: 'https://shrestha-droid.github.io/ring0/', repo: 'https://github.com/shrestha-droid/ring0',
    concept: 'Operating systems, made visible. An interactive simulator for the parts of an OS course that are hard to see on a whiteboard. Rewind time, compare algorithms on the same workload, and share any scenario as a link.',
    blocks: [
      ['Modules', [
        ['CPU scheduler:', 'FCFS, SJF, SRTF, Round Robin, Priority with aging, MLFQ. Gantt chart with a lane per process, scrubbing, and a three-way compare mode.'],
        ['Virtual memory, deadlock, sync:', 'page replacement algorithms, deadlock detection and synchronization scenarios.']]],
    ],
    stack: 'TypeScript, GitHub Pages',
  },
  {
    id: 'mend', title: "MEND", kind: "Interactive explainer · WebAssembly", year: 2026, stats: [["RS(255,191)", "the code"], ["32", "byte errors fixed per block"], ["C++ → WASM", "decoder in the browser"]], summary: "Scratch an image and watch a C++/WASM Reed-Solomon decoder repair it, byte by byte.", accent: '#4ADE80',
    role: 'Full-Stack Dev & C++/WASM', live: 'https://mend-azure.vercel.app',
    concept: 'A scroll-driven, interactive explainer of Reed-Solomon error correction. You scratch an image with your cursor, and a decoder written in C++ and compiled to WebAssembly finds every damaged byte and repairs it, step by step, on screen.',
    blocks: [
      ['Real, not animated', [
        ['RS(255,191):', 'a genuine encode, corrupt, decode loop. Pick a sample, upload an image or type a message and watch it split into blocks and heal.'],
        ['Stack:', 'C++ decoder compiled with Emscripten to WebAssembly.']]],
    ],
    stack: 'C++, WebAssembly, TypeScript, Vercel',
  },
  {
    id: 'ncii-shield', title: "NCII Shield", kind: "Backend · Privacy engineering", year: 2026, stats: [["0", "images leave the device"], ["≤ 10", "Hamming distance to match"], ["8", "video frames sampled"]], summary: "Client-side perceptual hashing and BK-tree matching for takedowns, with the victim confirming every match.", accent: '#FF4D8D',
    role: 'Backend & Privacy Engineering', repo: 'https://github.com/shrestha-droid/ncii-shield',
    concept: 'Client-side perceptual hashing plus BK-tree matching scaffold for takedowns of non-consensual intimate imagery. The image never leaves the victim\'s device; only a hash does.',
    blocks: [
      ['Flow', [
        ['Local hashing:', 'the browser dHashes files itself (video as 8 sampled frames) and sends hex only.'],
        ['Matching:', 'a worker matches ingested hashes with a BK-tree (Hamming distance 10 or less).'],
        ['Consent gate:', 'a match stays pending until the registered user confirms; only then is a notice drafted (IT Rules 3(2)(b)), and sending is a dry run.']]],
    ],
    stack: 'Python (FastAPI), Next.js, BK-tree',
  },
  {
    id: 'friday', title: 'Friday', kind: 'Desktop assistant · Local-first AI', year: 2026, stats: [["~90%", "less CPU on the HUD"], ["Gemini 2.5", "Flash, with tool calling"], ["Menu bar", "always-on daemon"]],
    summary: 'A local-first AI assistant that runs native system commands through a background Python daemon, behind a WebGL holographic interface.',
    accent: '#00E5FF', role: 'AI Systems Architect', repo: 'https://github.com/shrestha-droid/Friday-AI-Assistant',
    concept: 'A local-first, OS-integrated AI operating assistant with a custom WebGL holographic interface. It gets out of the browser sandbox to run native system commands through a background Python daemon.',
    blocks: [
      ['Architecture', [
        ['Backend:', 'Python 3, FastAPI, Uvicorn (async REST and WebSocket API).'],
        ['LLM:', 'Google GenAI SDK with Gemini 2.5 Flash.'],
        ['Frontend:', 'HTML, CSS, vanilla JS and Three.js. OS integration through rumps, subprocess and psutil.']]],
      ['Capabilities', [
        ['OS-level tool calling:', 'runs terminal commands and reads local files on its own.'],
        ['Multi-modal I/O:', 'voice input, a glassmorphic CLI and drag-and-drop context. Lives in the macOS menu bar as a background daemon.']]],
      ['Engineering notes', [
        ['Sandbox escape:', 'a localhost:8000 bridge connects browser Web Speech APIs to a Python process with system access.'],
        ['Tool-calling loop:', 'strict function calling through the Gemini SDK, with terminal output fed back into the model context.'],
        ['Rendering cost:', 'replaced per-frame vertex displacement with nested matrix rotations, cutting CPU use by about 90%.']]],
    ],
    stack: 'Python, FastAPI, Gemini 2.5, Three.js, macOS',
  },
  {
    id: 'vault-v1', title: 'Zero-Trust Vault (v1)', kind: 'Web app · Cryptography', year: 2026, stats: [["AES-256", "GCM"], ["Argon2id", "in WebAssembly"], ["Air-gap", "mode"]],
    summary: 'The first vault: a client-side cryptographic app with Shamir key-shattering and an air-gap mode. Rebuilt as v2.',
    accent: '#FFB000', role: 'Security Architecture & Full-Stack Dev', live: 'https://vault-hazel-gamma.vercel.app',
    concept: 'A client-side cryptographic app capable of full offline use, built so the server never holds plaintext. It combines WebAssembly key derivation with Shamir\'s Secret Sharing to keep custody of the data with the user.',
    blocks: [
      ['Architecture', [
        ['Core:', 'JavaScript (ES6+), HTML5 and DOM security.'],
        ['Cryptography:', 'WebCrypto API and WebAssembly.'],
        ['Infrastructure:', 'Supabase (PostgreSQL) with strict row-level security.']]],
      ['Crypto and protocols', [
        ['AES-256-GCM and Argon2id:', 'memory-hard key derivation in WASM to resist GPU brute force.'],
        ['Key shattering:', 'Shamir\'s Secret Sharing splits master keys across physical shards.'],
        ['Air-gap mode:', 'severs telemetry and keeps data in local storage only.']]],
      ['Hardening', [
        ['Row-level security:', 'database reads and writes are bound to authenticated JSON Web Tokens.'],
        ['DOM hardening:', 'strict CSP headers against XSS and extension injection.'],
        ['Binary round-trip:', 'a custom serializer encrypts raw binary (C++, PDF) as Base64 and rebuilds the exact bytes on decrypt.']]],
    ],
    stack: 'JavaScript, WebCrypto, WebAssembly, Supabase',
  },
];
