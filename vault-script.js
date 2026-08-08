const canvas = document.querySelector('#vault-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(45); camera.position.setX(20); 

const material = new THREE.MeshBasicMaterial({ color: 0xFFB000, wireframe: true, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xFFB000, transparent: true, opacity: 0.15 });

const coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(8, 0), material);
scene.add(coreMesh);

const shards = [], tethers = [];
for(let i = 0; i < 6; i++) {
    const shard = new THREE.Mesh(new THREE.TetrahedronGeometry(1.5, 0), material);
    shard.userData = { orbitSpeed: 0.0015 + Math.random() * 0.003, angle: Math.random() * Math.PI * 2, radius: 18 + Math.random() * 12, yOffset: (Math.random() - 0.5) * 20 };
    shards.push(shard); scene.add(shard);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([coreMesh.position, shard.position]), lineMaterial);
    tethers.push(line); scene.add(line);
}

let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => { mouseX = (e.clientX / window.innerWidth) * 2 - 1; mouseY = -(e.clientY / window.innerHeight) * 2 + 1; });

function animate() {
    requestAnimationFrame(animate);
    coreMesh.rotation.y += 0.002; coreMesh.rotation.z += 0.001;
    coreMesh.rotation.x += (mouseY * 0.3 - coreMesh.rotation.x) * 0.05;
    coreMesh.rotation.y += (mouseX * 0.3 - coreMesh.rotation.y) * 0.05;

    shards.forEach((shard, index) => {
        shard.userData.angle += shard.userData.orbitSpeed;
        shard.position.x = Math.cos(shard.userData.angle) * shard.userData.radius;
        shard.position.z = Math.sin(shard.userData.angle) * shard.userData.radius;
        shard.position.y = shard.userData.yOffset + Math.sin(shard.userData.angle * 2) * 5;
        shard.rotation.x += 0.01; shard.rotation.y += 0.01;

        const positions = tethers[index].geometry.attributes.position.array;
        positions[0] = coreMesh.position.x; positions[1] = coreMesh.position.y; positions[2] = coreMesh.position.z;
        positions[3] = shard.position.x; positions[4] = shard.position.y; positions[5] = shard.position.z;
        tethers[index].geometry.attributes.position.needsUpdate = true;
    });
    renderer.render(scene, camera);
}
animate();
window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
// --- Live Cryptograph Logic ---
// --- Live Cryptograph Easter Egg Logic ---
const cryptoChat = document.getElementById('crypto-chat');
const cryptoInput = document.getElementById('crypto-input');

if (cryptoInput) {
    cryptoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && cryptoInput.value.trim() !== '') {
            const plaintext = cryptoInput.value.trim();
            cryptoInput.value = '';
            
            // Print User Input
            cryptoChat.innerHTML += `<div class="usr-msg">> INPUT: ${plaintext}</div>`;
            cryptoChat.scrollTop = cryptoChat.scrollHeight;

            // Simulate Heavy Processing Delay for comedic effect
            setTimeout(() => {
                // A pool of hilarious mock decryption outputs
                const funnyOutputs = [
                    "> CIPHERTEXT: Error 404 - Intelligence not found in input.",
                    "> CIPHERTEXT: Decryption failed. Subject is just overthinking again.",
                    "> CIPHERTEXT: Hash successfully generated: 100% pure aura.",
                    "> CIPHERTEXT: Security breach! User's search history is leaking into the mainfram— wait, false alarm, it's just cringe.",
                    "> CIPHERTEXT: Algorithm analyzed input. Verdict: Bro really thought that would work.",
                    "> CIPHERTEXT: Encrypted successfully into 64 bits of pure stubbornness.",
                    "> CIPHERTEXT: WARNING: Input contains too much swagger. System overheating."
                ];

                // Pick a random funny output
                const randomResponse = funnyOutputs[Math.floor(Math.random() * funnyOutputs.length)];
                
                cryptoChat.innerHTML += `<div class="crypto-msg">${randomResponse}</div>`;
                cryptoChat.scrollTop = cryptoChat.scrollHeight;
            }, 600);
        }
    });
}