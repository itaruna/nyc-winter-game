import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// =============================================================================
// CONFIGURATION
// =============================================================================
const CONFIG = {
    // Movement settings - responsive and fun
    movement: {
        acceleration: 18,       // Snappy acceleration
        friction: 0.94,         // Smooth glide on ice
        maxSpeed: 20,           // Good top speed
        gravity: 18,
        jumpForce: 7,
        smoothing: 0.25         // Responsive controls
    },
    // Collectibles
    totalCollectibles: 16,
    collectRadius: 2.5,
    // Visual - optimized for performance
    fogDensity: 0.012,
    snowflakeCount: 1000        // Reduced for performance
};

// =============================================================================
// GAME STATE
// =============================================================================
const state = {
    score: 0,
    totalCollectibles: CONFIG.totalCollectibles,
    velocity: new THREE.Vector3(),
    targetVelocity: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    canJump: true,
    currentLocation: '',
    gameWon: false,
    winAnimationProgress: 0,
    // Object pools
    collectibles: [],
    skaters: [],
    snowflakes: [],
    floatingLights: []
};

// =============================================================================
// SCENE SETUP
// =============================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);
scene.fog = new THREE.FogExp2(0x0a0a1a, CONFIG.fogDensity);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 35);

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = false;  // Disable shadows for performance
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.getElementById('game-container').appendChild(renderer.domElement);

// Controls
const controls = new PointerLockControls(camera, document.body);

document.addEventListener('click', () => {
    if (!state.gameWon) {
        controls.lock();
    }
});

controls.addEventListener('lock', () => {
    document.getElementById('instructions').style.opacity = '0.3';
});

controls.addEventListener('unlock', () => {
    document.getElementById('instructions').style.opacity = '1';
});

// =============================================================================
// LIGHTING SETUP - Enhanced for magical feel
// =============================================================================
function setupLighting() {
    // Ambient - soft blue night (increased for no shadows)
    const ambientLight = new THREE.AmbientLight(0x4a4a6a, 0.7);
    scene.add(ambientLight);

    // Moon light - soft directional (no shadows for performance)
    const moonLight = new THREE.DirectionalLight(0x8888cc, 0.5);
    moonLight.position.set(-50, 80, -50);
    scene.add(moonLight);

    // Hemisphere light for sky/ground color variation
    const hemiLight = new THREE.HemisphereLight(0x4466aa, 0x222244, 0.4);
    scene.add(hemiLight);

    // Add magical floating lights (reduced count)
    createFloatingLights();
}

// =============================================================================
// MATERIALS
// =============================================================================
const materials = {
    snow: new THREE.MeshStandardMaterial({
        color: 0xeeeeff,
        roughness: 0.9,
        metalness: 0.1
    }),
    ice: new THREE.MeshStandardMaterial({
        color: 0x88ccee,
        roughness: 0.05,
        metalness: 0.4,
        transparent: true,
        opacity: 0.85
    }),
    building: new THREE.MeshStandardMaterial({
        color: 0x1a1a2a,
        roughness: 0.8,
        metalness: 0.2
    }),
    gold: new THREE.MeshStandardMaterial({
        color: 0xffd700,
        roughness: 0.2,
        metalness: 0.9,
        emissive: 0xffaa00,
        emissiveIntensity: 0.4
    }),
    wood: new THREE.MeshStandardMaterial({
        color: 0x5c4033,
        roughness: 0.9
    })
};

// =============================================================================
// FLOATING MAGICAL LIGHTS
// =============================================================================
function createFloatingLights() {
    const colors = [0xff6b9d, 0x6bffb8, 0xffef6b, 0x6bb8ff, 0xb86bff];
    const positions = [
        // Reduced to 8 lights for performance
        [-20, 8, 15], [20, 10, -15], [-40, 6, -20], [40, 9, 25],
        [0, 15, 0], [-25, 9, -35], [25, 11, 35], [0, 6, 40]
    ];

    positions.forEach((pos, i) => {
        const lightGroup = new THREE.Group();
        const color = colors[i % colors.length];

        // Glowing orb - reduced geometry
        const orbGeo = new THREE.SphereGeometry(0.25, 8, 8);
        const orbMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        lightGroup.add(orb);

        // Point light - reduced range
        const pointLight = new THREE.PointLight(color, 0.6, 10);
        lightGroup.add(pointLight);

        lightGroup.position.set(...pos);
        lightGroup.userData = {
            baseY: pos[1],
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 0.5,
            radius: 0.5 + Math.random() * 1
        };

        scene.add(lightGroup);
        state.floatingLights.push(lightGroup);
    });
}

// =============================================================================
// GROUND
// =============================================================================
function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const ground = new THREE.Mesh(groundGeometry, materials.snow);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Snow mounds - minimal for performance
    const bumpCount = 80;
    const bumpGeo = new THREE.SphereGeometry(1, 4, 4);

    for (let i = 0; i < bumpCount; i++) {
        const bump = new THREE.Mesh(bumpGeo, materials.snow);
        const size = Math.random() * 0.5 + 0.2;
        bump.scale.set(size, size * 0.3, size);
        bump.position.set(
            (Math.random() - 0.5) * 180,
            size * 0.15,
            (Math.random() - 0.5) * 180
        );
        scene.add(bump);
    }
}

// =============================================================================
// BRYANT PARK
// =============================================================================
function createBryantPark() {
    const parkGroup = new THREE.Group();
    parkGroup.position.set(-30, 0, 0);

    // Ice rink
    const rinkGeometry = new THREE.BoxGeometry(25, 0.1, 20);
    const rink = new THREE.Mesh(rinkGeometry, materials.ice);
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
        border
        parkGroup.add(border);
    });

    // Warming hut (The Lodge)
    createWarmingHut(parkGroup);

    // Festive string lights around the rink
    createStringLights(parkGroup, 13, 10.5, 20);

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
    createSkaters(parkGroup.position, 5);
}

function createWarmingHut(parent) {
    const hutGroup = new THREE.Group();
    hutGroup.position.set(0, 0, -15);

    const hutBase = new THREE.Mesh(
        new THREE.BoxGeometry(15, 4, 6),
        new THREE.MeshStandardMaterial({ color: 0x3a2718, roughness: 0.8 })
    );
    hutBase.position.y = 2;
    hutBase
    hutGroup.add(hutBase);

    // Roof with snow
    const roofGeo = new THREE.BoxGeometry(16, 0.5, 7);
    const roof = new THREE.Mesh(roofGeo, materials.snow);
    roof.position.y = 4.25;
    hutGroup.add(roof);

    // Windows with warm light
    const windowPositions = [-4, 0, 4];
    windowPositions.forEach(x => {
        const windowGeo = new THREE.PlaneGeometry(1.5, 2);
        const windowMat = new THREE.MeshStandardMaterial({
            color: 0xffdd88,
            emissive: 0xffaa44,
            emissiveIntensity: 1.0
        });
        const windowMesh = new THREE.Mesh(windowGeo, windowMat);
        windowMesh.position.set(x, 2, 3.01);
        hutGroup.add(windowMesh);

        // Warm point light
        const warmLight = new THREE.PointLight(0xffaa44, 0.8, 12);
        warmLight.position.set(x, 2, 5);
        hutGroup.add(warmLight);
    });

    parent.add(hutGroup);
}

// =============================================================================
// ROCKEFELLER CENTER
// =============================================================================
function createRockefellerCenter() {
    const rockyGroup = new THREE.Group();
    rockyGroup.position.set(30, 0, -20);

    // Main building (30 Rock)
    const buildingGeo = new THREE.BoxGeometry(20, 50, 15);
    const building = new THREE.Mesh(buildingGeo, materials.building);
    building.position.y = 25;
    building
    rockyGroup.add(building);

    // Building windows
    createBuildingWindows(rockyGroup, 15, 6, 20, 50, 15);

    // Ice rink
    const rinkGeo = new THREE.CylinderGeometry(12, 12, 0.1, 32);
    const rink = new THREE.Mesh(rinkGeo, materials.ice);
    rink.position.set(0, 0.05, 20);
    rockyGroup.add(rink);

    // Golden rink border
    const ringGeo = new THREE.TorusGeometry(12, 0.3, 8, 32);
    const ring = new THREE.Mesh(ringGeo, materials.gold);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.3, 20);
    rockyGroup.add(ring);

    // THE CHRISTMAS TREE!
    const christmasTree = createGiantChristmasTree();
    christmasTree.position.set(0, 0, 8);
    rockyGroup.add(christmasTree);

    // Prometheus statue
    createPrometheusStatue(rockyGroup);

    // Surrounding buildings
    const sideBuildingPositions = [[-18, 15, 10], [18, 15, 10]];
    sideBuildingPositions.forEach(pos => {
        const sideBuildingGeo = new THREE.BoxGeometry(8, 30, 12);
        const sideBuilding = new THREE.Mesh(sideBuildingGeo, materials.building);
        sideBuilding.position.set(...pos);
        sideBuilding
        rockyGroup.add(sideBuilding);
    });

    // Channel Gardens angels
    for (let i = 0; i < 6; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const angelGroup = createAngel();
        angelGroup.position.set(side * 4, 0, 25 + Math.floor(i / 2) * 8);
        angelGroup.rotation.y = side * Math.PI / 2;
        rockyGroup.add(angelGroup);
    }

    // Sign
    createSign(rockyGroup, 'ROCKEFELLER CENTER', 0, 3, 40);

    scene.add(rockyGroup);
    createSkaters(new THREE.Vector3(30, 0, 0), 4);
}

function createBuildingWindows(parent, rows, cols, offsetX, height, depth) {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (Math.random() > 0.35) {
                const windowGeo = new THREE.PlaneGeometry(1.5, 2);
                const intensity = Math.random() * 0.5 + 0.3;
                const windowMat = new THREE.MeshStandardMaterial({
                    color: 0xffffcc,
                    emissive: 0xffffaa,
                    emissiveIntensity: intensity
                });
                const windowMesh = new THREE.Mesh(windowGeo, windowMat);
                windowMesh.position.set(
                    (col - cols / 2 + 0.5) * 2.5,
                    row * 3 + 5,
                    depth / 2 + 0.01
                );
                parent.add(windowMesh);
            }
        }
    }
}

function createPrometheusStatue(parent) {
    const statueGroup = new THREE.Group();
    statueGroup.position.set(0, 0, 20);

    // Body
    const bodyGeo = new THREE.CapsuleGeometry(0.8, 2, 8, 16);
    const body = new THREE.Mesh(bodyGeo, materials.gold);
    body.position.y = 2;
    body.rotation.z = Math.PI * 0.1;
    statueGroup.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const head = new THREE.Mesh(headGeo, materials.gold);
    head.position.set(0.2, 3.5, 0);
    statueGroup.add(head);

    // Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.5, 2, 1, 16);
    const pedestal = new THREE.Mesh(pedestalGeo, materials.gold);
    pedestal.position.y = 0.5;
    statueGroup.add(pedestal);

    // Spotlight on statue
    const spotlight = new THREE.SpotLight(0xffd700, 2, 20, Math.PI / 6, 0.5);
    spotlight.position.set(0, 8, 25);
    spotlight.target = body;
    parent.add(spotlight);

    parent.add(statueGroup);
}

// =============================================================================
// GIANT CHRISTMAS TREE
// =============================================================================
function createGiantChristmasTree() {
    const treeGroup = new THREE.Group();

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.8, 1, 3, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3520 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.5;
    treeGroup.add(trunk);

    // Tree layers
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x0d5c0d, roughness: 0.8 });
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
        cone
        treeGroup.add(cone);
    });

    // Star on top
    const starGroup = createStar();
    starGroup.position.y = 28;
    treeGroup.add(starGroup);

    // Christmas lights on tree - reduced for performance
    const lightColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    const lightsPerLayer = 12;

    layers.forEach((layer) => {
        for (let i = 0; i < lightsPerLayer; i++) {
            const angle = (i / lightsPerLayer) * Math.PI * 2;
            const radius = layer.radius * 0.85;
            const heightOffset = (Math.random() - 0.5) * layer.height * 0.6;

            const lightGeo = new THREE.SphereGeometry(0.18, 6, 6);
            const color = lightColors[Math.floor(Math.random() * lightColors.length)];
            const lightMat = new THREE.MeshBasicMaterial({ color: color });
            const lightBulb = new THREE.Mesh(lightGeo, lightMat);
            lightBulb.position.set(
                Math.sin(angle) * radius,
                layer.y + heightOffset - layer.height / 4,
                Math.cos(angle) * radius
            );
            treeGroup.add(lightBulb);
        }
    });

    // One point light for the whole tree
    const treeLight = new THREE.PointLight(0xffffff, 1, 20);
    treeLight.position.set(0, 15, 0);
    treeGroup.add(treeLight);

    // Ornaments - reduced
    const ornamentColors = [0xff0000, 0xffd700, 0x4169e1, 0x9400d3];
    for (let i = 0; i < 20; i++) {
        const layerIndex = Math.floor(Math.random() * layers.length);
        const layer = layers[layerIndex];
        const angle = Math.random() * Math.PI * 2;
        const radius = layer.radius * 0.7 * Math.random();

        const ornamentGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const ornamentMat = new THREE.MeshStandardMaterial({
            color: ornamentColors[Math.floor(Math.random() * ornamentColors.length)],
            roughness: 0.3,
            metalness: 0.7
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

function createStar() {
    const starGroup = new THREE.Group();

    const starMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffd700,
        emissiveIntensity: 2.0
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
    const starLight = new THREE.PointLight(0xffd700, 3, 40);
    starGroup.add(starLight);

    return starGroup;
}

// =============================================================================
// REGULAR CHRISTMAS TREE
// =============================================================================
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
        const coneGeo = new THREE.ConeGeometry(radius, coneHeight, 6);
        const cone = new THREE.Mesh(coneGeo, treeMat);
        cone.position.y = 0.5 + i * coneHeight * 0.7 + coneHeight / 2;
        treeGroup.add(cone);
    }

    // Lights - simplified
    const lightColors = [0xff0000, 0x00ff00, 0xffff00, 0x0000ff];
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const lightGeo = new THREE.SphereGeometry(0.1, 4, 4);
        const color = lightColors[i % lightColors.length];
        const lightMat = new THREE.MeshBasicMaterial({ color: color });
        const lightBulb = new THREE.Mesh(lightGeo, lightMat);
        lightBulb.position.set(
            Math.sin(angle) * 0.5,
            0.8 + Math.random() * height * 0.5,
            Math.cos(angle) * 0.5
        );
        treeGroup.add(lightBulb);
    }

    // Snow cap
    const snowCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 6, 6),
        materials.snow
    );
    snowCap.position.y = height + 0.3;
    snowCap.scale.y = 0.5;
    treeGroup.add(snowCap);

    return treeGroup;
}

// =============================================================================
// ANGEL DECORATION
// =============================================================================
function createAngel() {
    const angelGroup = new THREE.Group();

    const pedestalGeo = new THREE.BoxGeometry(1, 2, 1);
    const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 1;
    angelGroup.add(pedestal);

    const angelMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffa500,
        emissiveIntensity: 0.5,
        metalness: 0.7,
        roughness: 0.3
    });

    // Body
    const bodyGeo = new THREE.ConeGeometry(0.4, 1.2, 8);
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

// =============================================================================
// STRING LIGHTS
// =============================================================================
function createStringLights(parent, halfWidth, halfDepth, count) {
    const lightColors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181, 0xa29bfe];

    const positions = [];
    for (let i = 0; i <= count; i++) {
        const t = i / count;
        const x = halfWidth * Math.cos(t * Math.PI * 2);
        const z = halfDepth * Math.sin(t * Math.PI * 2);
        positions.push(new THREE.Vector3(x, 3.5 + Math.sin(t * Math.PI * 8) * 0.3, z));
    }

    // Wire
    const wireGeo = new THREE.BufferGeometry().setFromPoints(positions);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x222222 });
    const wire = new THREE.Line(wireGeo, wireMat);
    parent.add(wire);

    // Bulbs - simplified, no point lights
    positions.forEach((pos, i) => {
        if (i % 3 === 0) {
            const bulbGeo = new THREE.SphereGeometry(0.15, 6, 6);
            const color = lightColors[i % lightColors.length];
            const bulbMat = new THREE.MeshBasicMaterial({ color: color });
            const bulb = new THREE.Mesh(bulbGeo, bulbMat);
            bulb.position.copy(pos);
            parent.add(bulb);
        }
    });

    // Single point light for the whole string
    const stringLight = new THREE.PointLight(0xffaa66, 0.5, 15);
    stringLight.position.set(0, 3.5, 0);
    parent.add(stringLight);
}

// =============================================================================
// LOCATION SIGN
// =============================================================================
function createSign(parent, text, x, y, z) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0a1a';
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
        emissiveIntensity: 0.3
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(x, y, z);
    parent.add(sign);
}

// =============================================================================
// NYC SKYLINE
// =============================================================================
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
        const building = new THREE.Mesh(buildingGeo, materials.building);
        building.position.set(config.x, config.h / 2, config.z);
        building
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
                        config.x + (col - windowCols / 2 + 0.5) * 2.5,
                        row * 3.5 + 3,
                        config.z + config.d / 2 + 0.01
                    );
                    scene.add(windowMesh);
                }
            }
        }

        // Snow on roof
        const snowRoof = new THREE.Mesh(
            new THREE.BoxGeometry(config.w + 0.5, 0.3, config.d + 0.5),
            materials.snow
        );
        snowRoof.position.set(config.x, config.h + 0.15, config.z);
        scene.add(snowRoof);
    });
}

// =============================================================================
// STREET LAMPS
// =============================================================================
function createStreetLamps() {
    const lampPositions = [
        [-15, 15], [15, 15], [-15, -15], [15, -15],
        [-50, 20], [50, 20], [0, 40], [0, -40],
        [-40, 30], [40, 30], [-55, -10], [55, -10]
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
            emissiveIntensity: 1.0
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 5.3;
        lampGroup.add(head);

        // Light
        const light = new THREE.PointLight(0xffaa44, 1.2, 18);
        light.position.y = 5;
        lampGroup.add(light);

        lampGroup.position.set(x, 0, z);
        scene.add(lampGroup);
    });
}

// =============================================================================
// SNOWFALL
// =============================================================================
function createSnowfall() {
    const snowflakeCount = CONFIG.snowflakeCount;
    const snowflakeGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(snowflakeCount * 3);
    const velocities = [];

    for (let i = 0; i < snowflakeCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = Math.random() * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

        velocities.push({
            y: Math.random() * 0.015 + 0.008,
            x: (Math.random() - 0.5) * 0.008,
            z: (Math.random() - 0.5) * 0.008
        });
    }

    snowflakeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const snowflakeMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.25,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
    });

    const snowfall = new THREE.Points(snowflakeGeo, snowflakeMat);
    snowfall.userData.velocities = velocities;
    scene.add(snowfall);
    state.snowflakes.push(snowfall);
}

// =============================================================================
// AI ICE SKATERS
// =============================================================================
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
            speed: 0.003 + Math.random() * 0.006,
            wobble: Math.random() * Math.PI * 2
        };

        scene.add(skaterGroup);
        state.skaters.push(skaterGroup);
    }
}

// =============================================================================
// COLLECTIBLES
// =============================================================================
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
        const sphere = new THREE.Mesh(sphereGeo, materials.gold);
        ornamentGroup.add(sphere);

        // Cap
        const capGeo = new THREE.CylinderGeometry(0.1, 0.15, 0.15, 8);
        const capMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = 0.45;
        ornamentGroup.add(cap);

        // Glow
        const glowLight = new THREE.PointLight(0xffd700, 0.6, 6);
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

// =============================================================================
// BENCHES
// =============================================================================
function createBenches() {
    const benchPositions = [
        [-45, 0, 10], [-45, 0, -10], [55, 0, 0], [0, 0, 25]
    ];

    benchPositions.forEach(pos => {
        const benchGroup = new THREE.Group();

        const seatGeo = new THREE.BoxGeometry(2, 0.15, 0.6);
        const seat = new THREE.Mesh(seatGeo, materials.wood);
        seat.position.y = 0.5;
        benchGroup.add(seat);

        const backGeo = new THREE.BoxGeometry(2, 0.6, 0.1);
        const back = new THREE.Mesh(backGeo, materials.wood);
        back.position.set(0, 0.85, -0.25);
        benchGroup.add(back);

        const legGeo = new THREE.BoxGeometry(0.1, 0.5, 0.5);
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        [-0.8, 0.8].forEach(x => {
            const leg = new THREE.Mesh(legGeo, metalMat);
            leg.position.set(x, 0.25, 0);
            benchGroup.add(leg);
        });

        // Snow on bench
        const snowGeo = new THREE.BoxGeometry(1.8, 0.1, 0.5);
        const snow = new THREE.Mesh(snowGeo, materials.snow);
        snow.position.y = 0.6;
        benchGroup.add(snow);

        benchGroup.position.set(...pos);
        benchGroup.rotation.y = Math.random() * Math.PI;
        scene.add(benchGroup);
    });
}

// =============================================================================
// HOT DOG CART
// =============================================================================
function createHotDogCart() {
    const cartGroup = new THREE.Group();
    cartGroup.position.set(0, 0, 20);

    const cartGeo = new THREE.BoxGeometry(2, 1.2, 1);
    const cartMat = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
    const cart = new THREE.Mesh(cartGeo, cartMat);
    cart.position.y = 1.2;
    cartGroup.add(cart);

    const umbrellaGeo = new THREE.ConeGeometry(1.5, 0.5, 8, 1, true);
    const umbrellaMat = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide
    });
    const umbrella = new THREE.Mesh(umbrellaGeo, umbrellaMat);
    umbrella.position.y = 2.5;
    cartGroup.add(umbrella);

    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 1);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2;
    cartGroup.add(pole);

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
        materials.snow
    );
    snowUmbrella.position.y = 2.55;
    cartGroup.add(snowUmbrella);

    scene.add(cartGroup);
}

// =============================================================================
// INPUT HANDLING
// =============================================================================
function setupInputHandlers() {
    const onKeyDown = (event) => {
        if (state.gameWon) return;
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
                    state.velocity.y = CONFIG.movement.jumpForce;
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

// =============================================================================
// LOCATION CHECK
// =============================================================================
function checkLocation() {
    if (state.gameWon) return;

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
            indicator.textContent = `${location}`;
            indicator.style.opacity = '1';
        } else {
            indicator.style.opacity = '0';
        }
    }
}

// =============================================================================
// WIN SCENE
// =============================================================================
function triggerWinScene() {
    state.gameWon = true;
    state.winAnimationProgress = 0;
    controls.unlock();

    // Update UI
    document.getElementById('instructions').innerHTML =
        '🎄 CONGRATULATIONS! You\'ve collected all the holiday magic! 🎄<br>Happy Holidays from NYC!';
    document.getElementById('instructions').style.opacity = '1';

    // Show win message
    const indicator = document.getElementById('location-indicator');
    indicator.innerHTML = '✨ WINNER! ✨';
    indicator.style.opacity = '1';
    indicator.style.fontSize = '2rem';
    indicator.style.color = '#ffd700';

    // Create fireworks
    createFireworks();
}

function createFireworks() {
    const fireworkColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffd700, 0xff00ff, 0x00ffff];

    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            const y = 20 + Math.random() * 30;
            const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];

            // Create explosion particles
            const particleCount = 50;
            const particleGeo = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const velocities = [];

            for (let j = 0; j < particleCount; j++) {
                positions[j * 3] = x;
                positions[j * 3 + 1] = y;
                positions[j * 3 + 2] = z;

                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                const speed = 0.2 + Math.random() * 0.3;
                velocities.push({
                    x: Math.sin(phi) * Math.cos(theta) * speed,
                    y: Math.cos(phi) * speed,
                    z: Math.sin(phi) * Math.sin(theta) * speed,
                    life: 1.0
                });
            }

            particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const particleMat = new THREE.PointsMaterial({
                color: color,
                size: 0.5,
                transparent: true,
                opacity: 1
            });

            const firework = new THREE.Points(particleGeo, particleMat);
            firework.userData = { velocities, startTime: performance.now() };
            scene.add(firework);

            // Add bright flash
            const flash = new THREE.PointLight(color, 5, 50);
            flash.position.set(x, y, z);
            scene.add(flash);

            // Fade out flash
            setTimeout(() => scene.remove(flash), 200);

            // Animate and remove firework
            const animateFirework = () => {
                const elapsed = (performance.now() - firework.userData.startTime) / 1000;
                if (elapsed > 2) {
                    scene.remove(firework);
                    return;
                }

                const positions = firework.geometry.attributes.position.array;
                firework.userData.velocities.forEach((vel, idx) => {
                    positions[idx * 3] += vel.x;
                    positions[idx * 3 + 1] += vel.y - 0.01; // gravity
                    positions[idx * 3 + 2] += vel.z;
                    vel.life -= 0.02;
                });
                firework.geometry.attributes.position.needsUpdate = true;
                firework.material.opacity = Math.max(0, 1 - elapsed / 2);

                requestAnimationFrame(animateFirework);
            };
            animateFirework();

        }, i * 500);
    }
}

// =============================================================================
// ANIMATION LOOP
// =============================================================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1); // Cap delta to prevent large jumps
    const elapsedTime = clock.getElapsedTime();

    // Player movement - smoother physics
    if (controls.isLocked && !state.gameWon) {
        const { acceleration, friction, maxSpeed, gravity, smoothing } = CONFIG.movement;

        // Apply friction smoothly
        state.velocity.x *= Math.pow(friction, delta * 60);
        state.velocity.z *= Math.pow(friction, delta * 60);

        // Gravity
        state.velocity.y -= gravity * delta;

        // Calculate target direction
        state.direction.z = Number(state.moveForward) - Number(state.moveBackward);
        state.direction.x = Number(state.moveRight) - Number(state.moveLeft);
        state.direction.normalize();

        // Calculate target velocity
        state.targetVelocity.x = 0;
        state.targetVelocity.z = 0;

        if (state.moveForward || state.moveBackward) {
            state.targetVelocity.z = -state.direction.z * acceleration;
        }
        if (state.moveLeft || state.moveRight) {
            state.targetVelocity.x = -state.direction.x * acceleration;
        }

        // Smooth interpolation to target velocity
        state.velocity.x += (state.targetVelocity.x - state.velocity.x) * smoothing;
        state.velocity.z += (state.targetVelocity.z - state.velocity.z) * smoothing;

        // Clamp to max speed
        const horizontalSpeed = Math.sqrt(state.velocity.x ** 2 + state.velocity.z ** 2);
        if (horizontalSpeed > maxSpeed) {
            const scale = maxSpeed / horizontalSpeed;
            state.velocity.x *= scale;
            state.velocity.z *= scale;
        }

        // Apply movement
        controls.moveRight(-state.velocity.x * delta);
        controls.moveForward(-state.velocity.z * delta);
        camera.position.y += state.velocity.y * delta;

        // Ground check
        if (camera.position.y < 2) {
            camera.position.y = 2;
            state.velocity.y = 0;
            state.canJump = true;
        }

        // Boundary
        camera.position.x = Math.max(-90, Math.min(90, camera.position.x));
        camera.position.z = Math.max(-90, Math.min(90, camera.position.z));
    }

    // Win animation - camera slowly rises and looks at tree
    if (state.gameWon) {
        state.winAnimationProgress += delta * 0.3;
        const progress = Math.min(state.winAnimationProgress, 1);

        // Slowly rise and look at Rockefeller tree
        const targetPos = new THREE.Vector3(30, 15 + progress * 10, 30);
        camera.position.lerp(targetPos, 0.02);

        const treePos = new THREE.Vector3(30, 15, -12);
        camera.lookAt(treePos);
    }

    // Update skaters
    state.skaters.forEach(skater => {
        const data = skater.userData;
        data.angle += data.speed;
        data.wobble += 0.03;

        skater.position.x = data.center.x + Math.cos(data.angle) * data.radius;
        skater.position.z = data.center.z + Math.sin(data.angle) * data.radius;
        skater.rotation.y = -data.angle + Math.PI / 2;
        skater.position.y = Math.sin(data.wobble) * 0.04;
        skater.rotation.z = Math.sin(data.wobble) * 0.08;
    });

    // Update floating magical lights
    state.floatingLights.forEach(light => {
        const data = light.userData;
        light.position.y = data.baseY + Math.sin(elapsedTime * data.speed + data.phase) * data.radius;
        light.position.x += Math.sin(elapsedTime * 0.3 + data.phase) * 0.005;
        light.position.z += Math.cos(elapsedTime * 0.3 + data.phase) * 0.005;
    });

    // Update snowfall - simplified for performance
    state.snowflakes.forEach(snowfall => {
        const positions = snowfall.geometry.attributes.position.array;
        const velocities = snowfall.userData.velocities;
        const len = positions.length / 3;

        for (let i = 0; i < len; i++) {
            positions[i * 3 + 1] -= velocities[i].y;

            if (positions[i * 3 + 1] < 0) {
                positions[i * 3 + 1] = 80;
                positions[i * 3] = (Math.random() - 0.5) * 200;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
            }
        }
        snowfall.geometry.attributes.position.needsUpdate = true;
    });

    // Update collectibles
    state.collectibles.forEach(collectible => {
        if (!collectible.userData.collected) {
            collectible.position.y = collectible.userData.baseY +
                Math.sin(elapsedTime * 2 + collectible.userData.phase) * 0.3;
            collectible.rotation.y += 0.015;

            // Check collection
            const distance = camera.position.distanceTo(collectible.position);
            if (distance < CONFIG.collectRadius) {
                collectible.userData.collected = true;
                collectible.visible = false;
                state.score += 10;
                document.getElementById('score').textContent = state.score;

                // Check win condition
                const collected = state.collectibles.filter(c => c.userData.collected).length;
                if (collected >= state.totalCollectibles) {
                    triggerWinScene();
                }
            }
        }
    });

    checkLocation();
    renderer.render(scene, camera);
}

// =============================================================================
// WINDOW RESIZE
// =============================================================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// =============================================================================
// INITIALIZE GAME
// =============================================================================
function init() {
    setupLighting();
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

    // Update UI with total collectibles
    document.getElementById('score').textContent = '0';

    // Hide loading
    document.getElementById('loading').style.display = 'none';

    animate();
}

init();
