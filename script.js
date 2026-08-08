// --- 1. Three.js Background (Arc Reactor) ---
const canvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Camera centered for the master terminal layout
camera.position.setZ(30);
camera.position.setX(0); 

// Arc Reactor Torus Knot Geometry
const geometry = new THREE.TorusKnotGeometry(12, 3, 100, 16);
const material = new THREE.MeshBasicMaterial({ 
    color: 0xE50914, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.15, 
    blending: THREE.AdditiveBlending
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Mouse tracking for parallax
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Main Animation Loop
function animate() {
    requestAnimationFrame(animate);
    
    // Constant slow rotation
    mesh.rotation.x += 0.001; 
    mesh.rotation.y += 0.002;
    
    // Fluid parallax reaction to mouse movement
    mesh.rotation.x += (mouseY * 0.1 - mesh.rotation.x) * 0.05;
    mesh.rotation.y += (mouseX * 0.1 - mesh.rotation.y) * 0.05;
    
    renderer.render(scene, camera);
}
animate();

// Hyper-Responsive Window Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// --- 2. Hidden CLI Hack (///) ---
let keyBuffer = '';
const cli = document.getElementById('cli-terminal');
const cliInput = document.getElementById('cli-input');
const cliOutput = document.getElementById('cli-output');

// Rolling buffer listener for trigger sequence
document.addEventListener('keydown', (e) => {
    // Ignore modifier keys that interrupt fast typing
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;
    
    // Add the pressed key to the buffer
    keyBuffer += e.key;
    
    // Keep only the last 3 characters in the memory buffer
    if (keyBuffer.length > 3) {
        keyBuffer = keyBuffer.slice(-3);
    }

    // Trigger the CLI if the last 3 keys were '///'
    if (keyBuffer === '///') {
        cli.classList.toggle('cli-active');
        if (cli.classList.contains('cli-active')) { 
            setTimeout(() => cliInput.focus(), 100); 
        }
        keyBuffer = ''; // Clear buffer after successful trigger
    } 
    // Emergency exit for the terminal
    else if (e.key === 'Escape') {
        cli.classList.remove('cli-active');
        keyBuffer = '';
    }
});

// Process terminal commands
cliInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const cmd = cliInput.value.trim().toLowerCase();
        cliInput.value = '';
        printOutput(`root@SP_SYS:~# <span>${cmd}</span>`);
        processCommand(cmd);
    }
});

function printOutput(text) {
    const el = document.createElement('div');
    el.innerHTML = text;
    cliOutput.appendChild(el);
    cliOutput.scrollTop = cliOutput.scrollHeight; // Auto-scroll to bottom
}

function processCommand(cmd) {
    switch(cmd) {
        case 'help': 
            printOutput('> COMMANDS: whoami, status, init concierge, clear, exit'); 
            break;
        case 'whoami': 
            printOutput('> SP_1102 // DESIGNATION: AI SYSTEMS ARCHITECT'); 
            break;
        case 'status': 
            printOutput('> ALL SYSTEMS NOMINAL. WEBGL RENDERING STABLE.'); 
            break;
        case 'init concierge': 
            printOutput('> BYPASSING SECURITY... ROUTING TO CONCIERGE NODE.');
            setTimeout(() => window.location.href = 'profile.html', 1500); 
            break;
        case 'clear': 
            cliOutput.innerHTML = ''; 
            break;
        case 'exit': 
            cli.classList.remove('cli-active'); 
            break;
        default: 
            if(cmd) printOutput(`> ERR: UNKNOWN DIRECTIVE '${cmd}'.`);
    }
}