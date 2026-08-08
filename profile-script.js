const canvas = document.querySelector('#profile-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Pushing the camera to the left (-12) so the Multiverse Tree appears on the right side of your screen
camera.position.set(-12, -5, 45); 

const treeGroup = new THREE.Group();
scene.add(treeGroup);

// --- 1. Generate the Multiverse Tree ---
const branchesCount = 200;
const pointsPerBranch = 50;

const timelineMaterial = new THREE.LineBasicMaterial({
    color: 0xB200FF, // Vibrant Temporal Purple
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending
});

for (let i = 0; i < branchesCount; i++) {
    const points = [];
    const angle = Math.random() * Math.PI * 2;
    const spread = Math.random() * 2;
    const wildness = 1 + Math.random() * 3;

    for (let j = 0; j <= pointsPerBranch; j++) {
        const y = (j / pointsPerBranch) * 80 - 40; 
        const radius = Math.pow(Math.abs(y * 0.15), 2.5) * spread + 0.5;
        
        const x = Math.cos(angle + (y * 0.05 * wildness)) * radius;
        const z = Math.sin(angle + (y * 0.05 * wildness)) * radius;
        
        points.push(new THREE.Vector3(x, y, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const branch = new THREE.Line(geometry, timelineMaterial);
    treeGroup.add(branch);
}

// --- 2. Generate Temporal Dust ---
const dustGeo = new THREE.BufferGeometry();
const dustCount = 800;
const dustArray = new Float32Array(dustCount * 3);
for(let i = 0; i < dustCount * 3; i++) {
    dustArray[i] = (Math.random() - 0.5) * 100;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustArray, 3));
const dustMat = new THREE.PointsMaterial({
    size: 0.15,
    color: 0xE8D5FF,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
});
const temporalDust = new THREE.Points(dustGeo, dustMat);
scene.add(temporalDust);

// --- 3. Temporal Glitch & Parallax Logic ---
let mouseX = 0, mouseY = 0;
let clickChaos = 0; // Tracks destabilization level

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Rapid clicking increases chaos
document.addEventListener('click', () => {
    clickChaos += 0.5; 
    if (clickChaos > 2) {
        document.body.classList.add('glitch-active');
        timelineMaterial.color.setHex(0xFF003C); // Turn tree aggressive red
    }
});

let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.002;

    // Cool down chaos over time
    if (clickChaos > 0) clickChaos -= 0.01;
    if (clickChaos <= 2 && document.body.classList.contains('glitch-active')) {
        document.body.classList.remove('glitch-active');
        timelineMaterial.color.setHex(0xB200FF); // Restore purple
    }

    // Standard rotation and breathing effect
    treeGroup.rotation.y += 0.002;
    temporalDust.rotation.y -= 0.001;
    treeGroup.scale.y = 1 + Math.sin(time * 2) * 0.02;

    // Apply Chaos / Glitch shake
    let shake = clickChaos > 2 ? (Math.random() - 0.5) * 0.15 : 0;
    
    // Fluid parallax reaction to mouse
    treeGroup.rotation.x += (mouseY * 0.15 - treeGroup.rotation.x) * 0.05 + shake;
    treeGroup.rotation.z += (mouseX * 0.1 - treeGroup.rotation.z) * 0.05 + shake;
    temporalDust.rotation.x += (mouseY * 0.1 - temporalDust.rotation.x) * 0.05;

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});