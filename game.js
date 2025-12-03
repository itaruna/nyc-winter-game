import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// Game state
const state = {
    score: 0,
    velocity: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    canJump: false,
    currentLocation: '',
    collectibles: [],
    skaters: [],
    snowflakes: [],
    lights: []
};

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById('game-container').appendChild(renderer.domElement);

// Controls
const controls = new PointerLockControls(camera, document.body);

document.addEventListener('click', () => {
    controls.lock();
});

controls.addEventListener('lock', () => {
    document.getElementById('instructions').style.opacity = '0.3';
});

controls.addEventListener('unlock', () => {
    document.getElementById('instructions').style.opacity = '1';
});

// Lighting
const ambientLight = new THREE.AmbientLight(0x4a4a6a, 0.4);
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight(0x9999ff, 0.3);
moonLight.position.set(-50, 100, -50);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 2048;
moonLight.shadow.mapSize.height = 2048;
moonLight.shadow.camera.near = 0.5;
moonLight.shadow.camera.far = 500;
moonLight.shadow.camera.left = -100;
moonLight.shadow.camera.right = 100;
moonLight.shadow.camera.top = 100;
moonLight.shadow.camera.bottom = -100;
scene.add(moonLight);

// Materials
const snowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
    metalness: 0.1
});

const iceMaterial = new THREE.MeshStandardMaterial({
    color: 0xadd8e6,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.9
});

const buildingMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a3a,
    roughness: 0.7,
    metalness: 0.2
});

const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    roughness: 0.3,
    metalness: 0.8,
    emissive: 0xffa500,
    emissiveIntensity: 0.3
});

// Ground - snowy NYC streets
function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const ground = new THREE.Mesh(groundGeometry, snowMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add some texture variation with small bumps
    const bumpCount = 500;
    for (let i = 0; i < bumpCount; i++) {
        const size = Math.random() * 0.3 + 0.1;
        const bumpGeo = new THREE.SphereGeometry(size, 8, 8);
        const bump = new THREE.Mesh(bumpGeo, snowMaterial);
        bump.position.set(
            (Math.random() - 0.5) * 180,
            size * 0.3,
            (Math.random() - 0.5) * 180
        );
        bump.scale.y = 0.3;
        scene.add(bump);
    }
}

// Bryant Park Ice Skating Rink
function createBryantPark() {
    const parkGroup = new THREE.Group();
    parkGroup.position.set(-30, 0, 0);

    // Ice rink
    const rinkGeometry = new THREE.BoxGeometry(25, 0.1, 20);
    const rink = new THREE.Mesh(rinkGeometry, iceMaterial);
    rink.position.y = 0.05;
    rink.receiveShadow = true;
    parkGroup.add(rink);

    // Rink border
    const borderMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 });
    const borders = [
        { pos: [0, 0.3, 10.2], scale: [25.5, 0.6, 0.4] },
        { pos: [0, 0.3, -10.2], scale: [25.5, 0.6, 0.4] },
        { pos: [12.7, 0.3, 0], scale: [0.4, 0.6, 20.4] },
        { pos: [-12.7, 0.3, 0], scale: [0.4, 0.6, 20.4] }
    ];

    borders.forEach(b => {
        const borderGeo = new THREE.BoxGeometry(...b.scale);
        const border = new THREE.Mesh(borderGeo, borderMaterial);
        border.position.set(...b.pos);
        border.castShadow = true;
        parkGroup.add(border);
    });

    // Warming hut (The Lodge)
    const hutGroup = new THREE.Group();
    hutGroup.position.set(0, 0, -15);

    const hutBase = new THREE.Mesh(
        new THREE.BoxGeometry(15, 4, 6),
        new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.8 })
    );
    hutBase.position.y = 2;
    hutBase.castShadow = true;
    hutGroup.add(hutBase);

    // Roof
    const roofGeo = new THREE.BoxGeometry(16, 0.5, 7);
    const roof = new THREE.Mesh(roofGeo, snowMaterial);
    roof.position.y = 4.25;
    hutGroup.add(roof);

    // Windows with warm light
    const windowPositions = [-4, 0, 4];
    windowPositions.forEach(x => {
        const windowGeo = new THREE.PlaneGeometry(1.5, 2);
        const windowMat = new THREE.MeshStandardMaterial({
            color: 0xffcc66,
            emissive: 0xffaa33,
            emissiveIntensity: 0.8
        });
        const windowMesh = new THREE.Mesh(windowGeo, windowMat);
        windowMesh.position.set(x, 2, 3.01);
        hutGroup.add(windowMesh);

        // Add warm point light
        const warmLight = new THREE.PointLight(0xffaa33, 0.5, 8);
        warmLight.position.set(x, 2, 4);
        hutGroup.add(warmLight);
    });

    parkGroup.add(hutGroup);

    // Festive string lights around the rink
    createStringLights(parkGroup, 13, 10.5, 15);

    // Christmas trees around the park
    const treePositions = [
        [-14, 0, -12], [14, 0, -12], [-14, 0, 12], [14, 0, 12],
        [-14, 0, 0], [14, 0, 0]
    ];
    treePositions.forEach(pos => {
        const tree = createChristmasTree(2 + Math.random());
        tree.position.set(...pos);
        parkGroup.add(tree);
    });

    // Sign
    createSign(parkGroup, 'BRYANT PARK', 15, 3, 0);

    scene.add(parkGroup);

    // Add AI skaters
    createSkaters(parkGroup.position, 10);
}

// Rockefeller Center
function createRockefellerCenter() {
    const rockyGroup = new THREE.Group();
    rockyGroup.position.set(30, 0, -20);

    // Main building (30 Rock simplified)
    const buildingGeo = new THREE.BoxGeometry(20, 50, 15);
    const building = new THREE.Mesh(buildingGeo, buildingMaterial);
    building.position.y = 25;
    building.castShadow = true;
    rockyGroup.add(building);

    // Building windows (emissive panels)
    const windowRows = 15;
    const windowCols = 6;
    for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowCols; col++) {
            if (Math.random() > 0.3) { // Some windows lit
                const windowGeo = new THREE.PlaneGeometry(1.5, 2);
                const windowMat = new THREE.MeshStandardMaterial({
                    color: 0xffffcc,
                    emissive: 0xffffaa,
                    emissiveIntensity: Math.random() * 0.5 + 0.3
                });
                const windowMesh = new THREE.Mesh(windowGeo, windowMat);
                windowMesh.position.set(
                    (col - windowCols/2 + 0.5) * 2.5,
                    row * 3 + 5,
                    7.51
                );
                rockyGroup.add(windowMesh);
            }
        }
    }

    // Ice rink (smaller, famous one)
    const rinkGeo = new THREE.CylinderGeometry(12, 12, 0.1, 32);
    const rink = new THREE.Mesh(rinkGeo, iceMaterial);
    rink.position.set(0, 0.05, 20);
    rockyGroup.add(rink);

    // Rink border
    const ringGeo = new THREE.TorusGeometry(12, 0.3, 8, 32);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: 0xffd700 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.3, 20);
    rockyGroup.add(ring);

    // THE CHRISTMAS TREE!
    const christmasTree = createGiantChristmasTree();
    christmasTree.position.set(0, 0, 8);
    rockyGroup.add(christmasTree);

    // Prometheus statue (golden figure)
    const statueGroup = new THREE.Group();
    statueGroup.position.set(0, 0, 20);

    // Simplified statue
    const bodyGeo = new THREE.CapsuleGeometry(0.8, 2, 8, 16);
    const body = new THREE.Mesh(bodyGeo, goldMaterial);
    body.position.y = 2;
    body.rotation.z = Math.PI * 0.1;
    statueGroup.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const head = new THREE.Mesh(headGeo, goldMaterial);
    head.position.set(0.2, 3.5, 0);
    statueGroup.add(head);

    // Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.5, 2, 1, 16);
    const pedestal = new THREE.Mesh(pedestalGeo, goldMaterial);
    pedestal.position.y = 0.5;
    statueGroup.add(pedestal);

    rockyGroup.add(statueGroup);

    // Surrounding buildings
    const sideBuildingPositions = [
        [-18, 15, 10], [18, 15, 10]
    ];
    sideBuildingPositions.forEach(pos => {
        const sideBuildingGeo = new THREE.BoxGeometry(8, 30, 12);
        const sideBuilding = new THREE.Mesh(sideBuildingGeo, buildingMaterial);
        sideBuilding.position.set(...pos);
        sideBuilding.castShadow = true;
        rockyGroup.add(sideBuilding);
    });

    // Channel Gardens (pathway with angels)
    for (let i = 0; i < 6; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const angelGroup = createAngel();
        angelGroup.position.set(side * 4, 0, 25 + Math.floor(i/2) * 8);
        angelGroup.rotation.y = side * Math.PI / 2;
        rockyGroup.add(angelGroup);
    }

    // Sign
    createSign(rockyGroup, 'ROCKEFELLER CENTER', 0, 3, 35);

    scene.add(rockyGroup);

    // Add skaters
    createSkaters(new THREE.Vector3(30, 0, 0), 8);
}

// Giant Christmas Tree for Rockefeller Center
function createGiantChristmasTree() {
    const treeGroup = new THREE.Group();

    // Tree trunk
    const trunkGeo = new THREE.CylinderGeometry(0.8, 1, 3, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3520 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.5;
    treeGroup.add(trunk);

    // Tree layers (cone shapes)
    const treeMat = new THREE.MeshStandardMaterial({
        color: 0x0d5c0d,
        roughness: 0.8
    });

    const layers = [
        { radius: 6, height: 8, y: 7 },
        { radius: 5, height: 7, y: 13 },
        { radius: 4, height: 6, y: 18 },
        { radius: 3, height: 5, y: 22 },
        { radius: 2, height: 4, y: 25 }
    ];

    layers.forEach(layer => {
        const coneGeo = new THREE.ConeGeometry(layer.radius, layer.height, 16);
        const cone = new THREE.Mesh(coneGeo, treeMat);
        cone.position.y = layer.y;
        cone.castShadow = true;
        treeGroup.add(cone);
    });

    // Star on top
    const starGroup = new THREE.Group();
    starGroup.position.y = 28;

    const starMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffd700,
        emissiveIntensity: 1
    });

    // Star points
    for (let i = 0; i < 5; i++) {
        const pointGeo = new THREE.ConeGeometry(0.3, 1.5, 4);
        const point = new THREE.Mesh(pointGeo, starMat);
        point.rotation.z = Math.PI;
        point.rotation.y = (i * Math.PI * 2) / 5;
        point.position.x = Math.sin(point.rotation.y) * 0.8;
        point.position.z = Math.cos(point.rotation.y) * 0.8;
        starGroup.add(point);
    }

    const starCore = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), starMat);
    starGroup.add(starCore);

    // Star light
    const starLight = new THREE.PointLight(0xffd700, 2, 30);
    starGroup.add(starLight);

    treeGroup.add(starGroup);

    // Christmas lights on tree
    const lightColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    const lightsPerLayer = 20;

    layers.forEach((layer, layerIndex) => {
        for (let i = 0; i < lightsPerLayer; i++) {
            const angle = (i / lightsPerLayer) * Math.PI * 2;
            const radius = layer.radius * 0.85;
            const heightOffset = (Math.random() - 0.5) * layer.height * 0.6;

            const lightGeo = new THREE.SphereGeometry(0.15, 8, 8);
            const color = lightColors[Math.floor(Math.random() * lightColors.length)];
            const lightMat = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.8
            });
            const lightBulb = new THREE.Mesh(lightGeo, lightMat);
            lightBulb.position.set(
                Math.sin(angle) * radius,
                layer.y + heightOffset - layer.height/4,
                Math.cos(angle) * radius
            );
            lightBulb.userData = {
                baseEmissive: 0.8,
                phase: Math.random() * Math.PI * 2
            };
            state.lights.push(lightBulb);
            treeGroup.add(lightBulb);
        }
    });

    // Add some larger ornaments
    const ornamentColors = [0xff0000, 0xffd700, 0x4169e1, 0x9400d3];
    for (let i = 0; i < 30; i++) {
        const layerIndex = Math.floor(Math.random() * layers.length);
        const layer = layers[layerIndex];
        const angle = Math.random() * Math.PI * 2;
        const radius = layer.radius * 0.7 * Math.random();

        const ornamentGeo = new THREE.SphereGeometry(0.25 + Math.random() * 0.15, 16, 16);
        const ornamentMat = new THREE.MeshStandardMaterial({
            color: ornamentColors[Math.floor(Math.random() * ornamentColors.length)],
            roughness: 0.2,
            metalness: 0.8
        });
        const ornament = new THREE.Mesh(ornamentGeo, ornamentMat);
        ornament.position.set(
            Math.sin(angle) * radius,
            layer.y + (Math.random() - 0.5) * layer.height * 0.5,
            Math.cos(angle) * radius
        );
        treeGroup.add(ornament);
    }

    return treeGroup;
}

// Regular Christmas tree
function createChristmasTree(height = 3) {
    const treeGroup = new THREE.Group();

    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3520 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.25;
    treeGroup.add(trunk);

    const treeMat = new THREE.MeshStandardMaterial({ color: 0x0d5c0d, roughness: 0.8 });

    for (let i = 0; i < 3; i++) {
        const radius = (3 - i) * 0.4 * (height / 3);
        const coneHeight = height / 3;
        const coneGeo = new THREE.ConeGeometry(radius, coneHeight, 8);
        const cone = new THREE.Mesh(coneGeo, treeMat);
        cone.position.y = 0.5 + i * coneHeight * 0.7 + coneHeight / 2;
        cone.castShadow = true;
        treeGroup.add(cone);
    }

    // Add lights
    const lightColors = [0xff0000, 0x00ff00, 0xffff00, 0x0000ff];
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const lightGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const color = lightColors[i % lightColors.length];
        const lightMat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.6
        });
        const lightBulb = new THREE.Mesh(lightGeo, lightMat);
        lightBulb.position.set(
            Math.sin(angle) * 0.5,
            1 + Math.random() * height * 0.5,
            Math.cos(angle) * 0.5
        );
        treeGroup.add(lightBulb);
    }

    // Snow on top
    const snowCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        snowMaterial
    );
    snowCap.position.y = height + 0.3;
    snowCap.scale.y = 0.5;
    treeGroup.add(snowCap);

    return treeGroup;
}

// Create angel decoration
function createAngel() {
    const angelGroup = new THREE.Group();

    const pedestalGeo = new THREE.BoxGeometry(1, 2, 1);
    const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 1;
    angelGroup.add(pedestal);

    // Angel body
    const bodyGeo = new THREE.ConeGeometry(0.4, 1.2, 8);
    const angelMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffa500,
        emissiveIntensity: 0.3,
        metalness: 0.6,
        roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeo, angelMat);
    body.position.y = 2.8;
    angelGroup.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const head = new THREE.Mesh(headGeo, angelMat);
    head.position.y = 3.6;
    angelGroup.add(head);

    // Wings
    const wingGeo = new THREE.BoxGeometry(0.05, 0.6, 0.4);
    [-0.4, 0.4].forEach(x => {
        const wing = new THREE.Mesh(wingGeo, angelMat);
        wing.position.set(x, 3.2, 0);
        wing.rotation.z = x > 0 ? -0.3 : 0.3;
        angelGroup.add(wing);
    });

    // Trumpet
    const trumpetGeo = new THREE.ConeGeometry(0.1, 0.5, 8);
    const trumpet = new THREE.Mesh(trumpetGeo, angelMat);
    trumpet.position.set(0.3, 3.4, 0.3);
    trumpet.rotation.z = -Math.PI / 4;
    angelGroup.add(trumpet);

    return angelGroup;
}

// String lights
function createStringLights(parent, halfWidth, halfDepth, count) {
    const lightColors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181];

    // Create light string along perimeter
    const positions = [];
    for (let i = 0; i <= count; i++) {
        const t = i / count;
        const x = halfWidth * Math.cos(t * Math.PI * 2);
        const z = halfDepth * Math.sin(t * Math.PI * 2);
        positions.push(new THREE.Vector3(x, 3 + Math.sin(t * Math.PI * 8) * 0.2, z));
    }

    // Wire
    const wireGeo = new THREE.BufferGeometry().setFromPoints(positions);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x333333 });
    const wire = new THREE.Line(wireGeo, wireMat);
    parent.add(wire);

    // Bulbs
    positions.forEach((pos, i) => {
        if (i % 2 === 0) {
            const bulbGeo = new THREE.SphereGeometry(0.1, 8, 8);
            const color = lightColors[i % lightColors.length];
            const bulbMat = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.7
            });
            const bulb = new THREE.Mesh(bulbGeo, bulbMat);
            bulb.position.copy(pos);
            bulb.userData = { baseEmissive: 0.7, phase: i * 0.5 };
            state.lights.push(bulb);
            parent.add(bulb);

            // Small point light for every 4th bulb
            if (i % 4 === 0) {
                const pointLight = new THREE.PointLight(color, 0.3, 5);
                pointLight.position.copy(pos);
                parent.add(pointLight);
            }
        }
    });
}

// Location sign
function createSign(parent, text, x, y, z) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 492, 108);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 36px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const signGeo = new THREE.PlaneGeometry(8, 2);
    const signMat = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: 0xffd700,
        emissiveIntensity: 0.2
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(x, y, z);
    parent.add(sign);
}

// NYC Buildings skyline
function createSkyline() {
    const buildingConfigs = [
        { x: -60, z: -40, w: 15, h: 40, d: 15 },
        { x: -45, z: -50, w: 12, h: 55, d: 12 },
        { x: 60, z: -35, w: 18, h: 45, d: 14 },
        { x: 70, z: -55, w: 10, h: 60, d: 10 },
        { x: -70, z: -60, w: 14, h: 35, d: 14 },
        { x: 0, z: -70, w: 20, h: 70, d: 15 },
        { x: -30, z: -65, w: 12, h: 50, d: 12 },
        { x: 50, z: -65, w: 16, h: 48, d: 13 },
    ];

    buildingConfigs.forEach(config => {
        const buildingGeo = new THREE.BoxGeometry(config.w, config.h, config.d);
        const building = new THREE.Mesh(buildingGeo, buildingMaterial);
        building.position.set(config.x, config.h / 2, config.z);
        building.castShadow = true;
        scene.add(building);

        // Windows
        const windowRows = Math.floor(config.h / 4);
        const windowCols = Math.floor(config.w / 3);
        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                if (Math.random() > 0.4) {
                    const windowGeo = new THREE.PlaneGeometry(1, 1.5);
                    const windowMat = new THREE.MeshStandardMaterial({
                        color: 0xffffcc,
                        emissive: 0xffffaa,
                        emissiveIntensity: Math.random() * 0.4 + 0.2
                    });
                    const windowMesh = new THREE.Mesh(windowGeo, windowMat);
                    windowMesh.position.set(
                        config.x + (col - windowCols/2 + 0.5) * 2.5,
                        row * 3.5 + 3,
                        config.z + config.d/2 + 0.01
                    );
                    scene.add(windowMesh);
                }
            }
        }

        // Snow on roof
        const snowRoof = new THREE.Mesh(
            new THREE.BoxGeometry(config.w + 0.5, 0.3, config.d + 0.5),
            snowMaterial
        );
        snowRoof.position.set(config.x, config.h + 0.15, config.z);
        scene.add(snowRoof);
    });
}

// Street lamps
function createStreetLamps() {
    const lampPositions = [
        [-15, 15], [15, 15], [-15, -15], [15, -15],
        [-50, 20], [50, 20], [0, 40], [0, -40],
        [-40, 30], [40, 30]
    ];

    lampPositions.forEach(([x, z]) => {
        const lampGroup = new THREE.Group();

        // Pole
        const poleGeo = new THREE.CylinderGeometry(0.1, 0.15, 5, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 2.5;
        lampGroup.add(pole);

        // Lamp head
        const headGeo = new THREE.BoxGeometry(0.8, 0.6, 0.8);
        const headMat = new THREE.MeshStandardMaterial({
            color: 0xffffcc,
            emissive: 0xffaa44,
            emissiveIntensity: 0.8
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 5.3;
        lampGroup.add(head);

        // Light
        const light = new THREE.PointLight(0xffaa44, 1, 15);
        light.position.y = 5;
        light.castShadow = true;
        lampGroup.add(light);

        lampGroup.position.set(x, 0, z);
        scene.add(lampGroup);
    });
}

// Snowfall
function createSnowfall() {
    const snowflakeCount = 2000;
    const snowflakeGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(snowflakeCount * 3);
    const velocities = [];

    for (let i = 0; i < snowflakeCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = Math.random() * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

        velocities.push({
            y: Math.random() * 0.02 + 0.01,
            x: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
        });
    }

    snowflakeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const snowflakeMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
    });

    const snowfall = new THREE.Points(snowflakeGeo, snowflakeMat);
    snowfall.userData.velocities = velocities;
    scene.add(snowfall);
    state.snowflakes.push(snowfall);
}

// AI Ice skaters
function createSkaters(rinkCenter, count) {
    const skaterColors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xa29bfe, 0xfd79a8];

    for (let i = 0; i < count; i++) {
        const skaterGroup = new THREE.Group();

        // Body
        const bodyGeo = new THREE.CapsuleGeometry(0.2, 0.6, 4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: skaterColors[i % skaterColors.length]
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.8;
        skaterGroup.add(body);

        // Head
        const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.4;
        skaterGroup.add(head);

        // Hat
        const hatGeo = new THREE.ConeGeometry(0.15, 0.3, 8);
        const hatMat = new THREE.MeshStandardMaterial({
            color: skaterColors[(i + 2) % skaterColors.length]
        });
        const hat = new THREE.Mesh(hatGeo, hatMat);
        hat.position.y = 1.65;
        skaterGroup.add(hat);

        // Initial position
        const angle = (i / count) * Math.PI * 2;
        const radius = 3 + Math.random() * 5;
        skaterGroup.position.set(
            rinkCenter.x + Math.cos(angle) * radius,
            0,
            rinkCenter.z + Math.sin(angle) * radius
        );

        skaterGroup.userData = {
            center: rinkCenter.clone(),
            angle: angle,
            radius: radius,
            speed: 0.005 + Math.random() * 0.01,
            wobble: Math.random() * Math.PI * 2
        };

        scene.add(skaterGroup);
        state.skaters.push(skaterGroup);
    }
}

// Collectible ornaments
function createCollectibles() {
    const collectiblePositions = [
        // Around Bryant Park
        [-25, 1.5, 5], [-35, 1.5, -5], [-30, 1.5, 10], [-20, 1.5, -8],
        // Around Rockefeller
        [25, 1.5, 15], [35, 1.5, 5], [30, 1.5, 25], [40, 1.5, 10],
        // Between locations
        [0, 1.5, 10], [0, 1.5, -10], [-10, 1.5, 0], [10, 1.5, 0],
        // Further out
        [-50, 1.5, 25], [50, 1.5, -15], [-20, 1.5, 35], [20, 1.5, -30]
    ];

    collectiblePositions.forEach((pos, i) => {
        const ornamentGroup = new THREE.Group();

        // Main sphere
        const sphereGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const sphere = new THREE.Mesh(sphereGeo, goldMaterial);
        ornamentGroup.add(sphere);

        // Cap
        const capGeo = new THREE.CylinderGeometry(0.1, 0.15, 0.15, 8);
        const capMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = 0.45;
        ornamentGroup.add(cap);

        // Glow
        const glowLight = new THREE.PointLight(0xffd700, 0.5, 5);
        ornamentGroup.add(glowLight);

        ornamentGroup.position.set(...pos);
        ornamentGroup.userData = {
            collected: false,
            baseY: pos[1],
            phase: i * 0.5
        };

        scene.add(ornamentGroup);
        state.collectibles.push(ornamentGroup);
    });
}

// Benches
function createBenches() {
    const benchPositions = [
        [-45, 0, 10], [-45, 0, -10], [55, 0, 0], [0, 0, 25]
    ];

    benchPositions.forEach(pos => {
        const benchGroup = new THREE.Group();

        // Seat
        const seatGeo = new THREE.BoxGeometry(2, 0.15, 0.6);
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
        const seat = new THREE.Mesh(seatGeo, woodMat);
        seat.position.y = 0.5;
        benchGroup.add(seat);

        // Back
        const backGeo = new THREE.BoxGeometry(2, 0.6, 0.1);
        const back = new THREE.Mesh(backGeo, woodMat);
        back.position.set(0, 0.85, -0.25);
        benchGroup.add(back);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.1, 0.5, 0.5);
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        [-0.8, 0.8].forEach(x => {
            const leg = new THREE.Mesh(legGeo, metalMat);
            leg.position.set(x, 0.25, 0);
            benchGroup.add(leg);
        });

        // Snow on bench
        const snowGeo = new THREE.BoxGeometry(1.8, 0.1, 0.5);
        const snow = new THREE.Mesh(snowGeo, snowMaterial);
        snow.position.y = 0.6;
        benchGroup.add(snow);

        benchGroup.position.set(...pos);
        benchGroup.rotation.y = Math.random() * Math.PI;
        scene.add(benchGroup);
    });
}

// Hot dog cart (NYC staple!)
function createHotDogCart() {
    const cartGroup = new THREE.Group();
    cartGroup.position.set(0, 0, 20);

    // Cart body
    const cartGeo = new THREE.BoxGeometry(2, 1.2, 1);
    const cartMat = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
    const cart = new THREE.Mesh(cartGeo, cartMat);
    cart.position.y = 1.2;
    cartGroup.add(cart);

    // Umbrella
    const umbrellaGeo = new THREE.ConeGeometry(1.5, 0.5, 8, 1, true);
    const umbrellaMat = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide
    });
    const umbrella = new THREE.Mesh(umbrellaGeo, umbrellaMat);
    umbrella.position.y = 2.5;
    cartGroup.add(umbrella);

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 1);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2;
    cartGroup.add(pole);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    [[-0.7, -0.6], [0.7, -0.6]].forEach(([x, z]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.3, z);
        cartGroup.add(wheel);
    });

    // Snow on umbrella
    const snowUmbrella = new THREE.Mesh(
        new THREE.ConeGeometry(1.55, 0.15, 8),
        snowMaterial
    );
    snowUmbrella.position.y = 2.55;
    cartGroup.add(snowUmbrella);

    scene.add(cartGroup);
}

// Input handling
function setupInputHandlers() {
    const onKeyDown = (event) => {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                state.moveForward = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                state.moveBackward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                state.moveLeft = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                state.moveRight = true;
                break;
            case 'Space':
                if (state.canJump) {
                    state.velocity.y = 8;
                    state.canJump = false;
                }
                break;
        }
    };

    const onKeyUp = (event) => {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                state.moveForward = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                state.moveBackward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                state.moveLeft = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                state.moveRight = false;
                break;
        }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

// Check location for UI
function checkLocation() {
    const pos = camera.position;
    let location = '';

    if (pos.x < -15 && pos.x > -45 && pos.z > -20 && pos.z < 15) {
        location = 'BRYANT PARK';
    } else if (pos.x > 15 && pos.x < 55 && pos.z > -45 && pos.z < 40) {
        location = 'ROCKEFELLER CENTER';
    }

    if (location !== state.currentLocation) {
        state.currentLocation = location;
        const indicator = document.getElementById('location-indicator');
        if (location) {
            indicator.textContent = `📍 ${location}`;
            indicator.style.opacity = '1';
        } else {
            indicator.style.opacity = '0';
        }
    }
}

// Animation loop
const clock = new THREE.Clock();
let prevTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    prevTime = time;

    // Player movement (ice skating physics - slippery!)
    if (controls.isLocked) {
        const friction = 0.98; // Slippery ice
        const acceleration = 25;

        state.velocity.x *= friction;
        state.velocity.z *= friction;
        state.velocity.y -= 20 * delta; // Gravity

        state.direction.z = Number(state.moveForward) - Number(state.moveBackward);
        state.direction.x = Number(state.moveRight) - Number(state.moveLeft);
        state.direction.normalize();

        if (state.moveForward || state.moveBackward) {
            state.velocity.z -= state.direction.z * acceleration * delta;
        }
        if (state.moveLeft || state.moveRight) {
            state.velocity.x -= state.direction.x * acceleration * delta;
        }

        controls.moveRight(-state.velocity.x * delta);
        controls.moveForward(-state.velocity.z * delta);

        camera.position.y += state.velocity.y * delta;

        if (camera.position.y < 2) {
            camera.position.y = 2;
            state.velocity.y = 0;
            state.canJump = true;
        }

        // Boundary
        camera.position.x = Math.max(-90, Math.min(90, camera.position.x));
        camera.position.z = Math.max(-90, Math.min(90, camera.position.z));
    }

    // Update skaters
    state.skaters.forEach(skater => {
        const data = skater.userData;
        data.angle += data.speed;
        data.wobble += 0.05;

        skater.position.x = data.center.x + Math.cos(data.angle) * data.radius;
        skater.position.z = data.center.z + Math.sin(data.angle) * data.radius;
        skater.rotation.y = -data.angle + Math.PI / 2;

        // Skating wobble
        skater.position.y = Math.sin(data.wobble) * 0.05;
        skater.rotation.z = Math.sin(data.wobble) * 0.1;
    });

    // Update snowfall
    state.snowflakes.forEach(snowfall => {
        const positions = snowfall.geometry.attributes.position.array;
        const velocities = snowfall.userData.velocities;

        for (let i = 0; i < positions.length / 3; i++) {
            positions[i * 3] += velocities[i].x + Math.sin(time * 0.001 + i) * 0.002;
            positions[i * 3 + 1] -= velocities[i].y;
            positions[i * 3 + 2] += velocities[i].z;

            // Reset snowflake when it hits ground
            if (positions[i * 3 + 1] < 0) {
                positions[i * 3 + 1] = 100;
                positions[i * 3] = (Math.random() - 0.5) * 200;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
            }
        }
        snowfall.geometry.attributes.position.needsUpdate = true;
    });

    // Update collectibles
    const elapsedTime = clock.getElapsedTime();
    state.collectibles.forEach(collectible => {
        if (!collectible.userData.collected) {
            // Floating animation
            collectible.position.y = collectible.userData.baseY +
                Math.sin(elapsedTime * 2 + collectible.userData.phase) * 0.3;
            collectible.rotation.y += 0.02;

            // Check collection
            const distance = camera.position.distanceTo(collectible.position);
            if (distance < 2) {
                collectible.userData.collected = true;
                collectible.visible = false;
                state.score += 10;
                document.getElementById('score').textContent = state.score;

                // Victory check
                const allCollected = state.collectibles.every(c => c.userData.collected);
                if (allCollected) {
                    document.getElementById('location-indicator').textContent = '🎄 HAPPY HOLIDAYS! You collected all the magic! 🎄';
                    document.getElementById('location-indicator').style.opacity = '1';
                }
            }
        }
    });

    // Twinkle lights
    state.lights.forEach(light => {
        if (light.userData && light.material) {
            const twinkle = Math.sin(elapsedTime * 3 + light.userData.phase) * 0.3 + 0.7;
            light.material.emissiveIntensity = light.userData.baseEmissive * twinkle;
        }
    });

    // Check location
    checkLocation();

    renderer.render(scene, camera);
}

// Window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize game
function init() {
    createGround();
    createBryantPark();
    createRockefellerCenter();
    createSkyline();
    createStreetLamps();
    createSnowfall();
    createCollectibles();
    createBenches();
    createHotDogCart();
    setupInputHandlers();

    // Hide loading
    document.getElementById('loading').style.display = 'none';

    animate();
}

init();
