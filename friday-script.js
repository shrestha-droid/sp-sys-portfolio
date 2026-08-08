const canvas = document.querySelector('#hud-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(40); camera.position.setX(15); 

const material = new THREE.MeshBasicMaterial({ color: 0x00E5FF, wireframe: true, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending });

const coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(12, 1), material);
const shellMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(20, 1), material);
const hudGroup = new THREE.Group();
hudGroup.add(coreMesh); hudGroup.add(shellMesh);
scene.add(hudGroup);

const scanLaser = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.2, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
);
scanLaser.rotation.x = Math.PI / 2;
scene.add(scanLaser);

let mouseX = 0, mouseY = 0, scanDirection = 1;
document.addEventListener('mousemove', (e) => { mouseX = (e.clientX / window.innerWidth) * 2 - 1; mouseY = -(e.clientY / window.innerHeight) * 2 + 1; });

function animate() {
    requestAnimationFrame(animate);
    coreMesh.rotation.y += 0.005; coreMesh.rotation.x += 0.002;
    shellMesh.rotation.y -= 0.002; shellMesh.rotation.z += 0.003;
    hudGroup.rotation.x += (mouseY * 0.1 - hudGroup.rotation.x) * 0.05;
    hudGroup.rotation.y += (mouseX * 0.1 - hudGroup.rotation.y) * 0.05;
    
    scanLaser.position.y += 0.15 * scanDirection;
    if (scanLaser.position.y > 18 || scanLaser.position.y < -18) scanDirection *= -1;
    
    renderer.render(scene, camera);
}
animate();
window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
// --- Turing Chat Logic ---
const aiChat = document.getElementById('ai-chat');
const aiInput = document.getElementById('ai-input');

aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && aiInput.value.trim() !== '') {
        const query = aiInput.value.trim();
        aiInput.value = '';
        
        // Add User Message
        aiChat.innerHTML += `<div class="usr-msg">> USR: ${query}</div>`;
        aiChat.scrollTop = aiChat.scrollHeight;

        // Simulate AI Thinking
        setTimeout(() => {
            let response = "> FRIDAY_SYS: I am currently isolated from my main LLM backend. However, I can confirm Shrestha is a highly capable AI Systems Architect.";
            
            if (query.toLowerCase().includes("concierge")) {
                response = "> FRIDAY_SYS: Concierge is Shrestha's primary focus, involving full-stack AI integrations.";
            } else if (query.toLowerCase().includes("tech")) {
                response = "> FRIDAY_SYS: The stack includes Python, FastAPI, Gemini 2.5, WebGL, and React.";
            }

            aiChat.innerHTML += `<div class="ai-msg">${response}</div>`;
            aiChat.scrollTop = aiChat.scrollHeight;
        }, 800);
    }
});