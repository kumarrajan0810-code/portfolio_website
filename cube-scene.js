/* ==========================================
   3D RUBIK'S CUBE SCENE
   Procedural 3×3×3 segmented cube array
   with breathing animation & mouse interaction
   ========================================== */

(function () {
    'use strict';

    var container = document.getElementById('cubeContainer');
    if (!container) return;

    // ═══════════════════════════════════════════════
    //  SCENE / RENDERER / CAMERA
    // ═══════════════════════════════════════════════
    var scene = new THREE.Scene();

    var cam = new THREE.PerspectiveCamera(
        35,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );
    cam.position.set(0, 0, 14);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // ═══════════════════════════════════════════════
    //  PROCEDURAL ENVIRONMENT MAP
    // ═══════════════════════════════════════════════
    var envMap = null;

    function createProceduralEnvMap() {
        var size = 128;
        var cubeRenderTarget = new THREE.WebGLCubeRenderTarget(size, {
            format: THREE.RGBFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
        });
        var cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);

        var envScene = new THREE.Scene();

        var topLight = new THREE.HemisphereLight(0xeeeeff, 0x444466, 1.5);
        envScene.add(topLight);

        var pL1 = new THREE.PointLight(0x8888ff, 3, 50);
        pL1.position.set(10, 10, 10);
        envScene.add(pL1);

        var pL2 = new THREE.PointLight(0xffffff, 2, 50);
        pL2.position.set(-10, 5, -10);
        envScene.add(pL2);

        var pL3 = new THREE.PointLight(0x6c5ce7, 2, 50);
        pL3.position.set(-5, -10, 5);
        envScene.add(pL3);

        var gradGeo = new THREE.SphereGeometry(40, 32, 32);
        var gradMat = new THREE.MeshBasicMaterial({
            color: 0x556677,
            side: THREE.BackSide,
        });
        envScene.add(new THREE.Mesh(gradGeo, gradMat));

        cubeCamera.position.set(0, 0, 0);
        cubeCamera.update(renderer, envScene);

        envMap = cubeRenderTarget.texture;
        scene.environment = envMap;

        gradGeo.dispose();
        gradMat.dispose();
    }

    createProceduralEnvMap();

    // ═══════════════════════════════════════════════
    //  LIGHTING
    // ═══════════════════════════════════════════════
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    var keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    var fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
    fillLight.position.set(-5, 2, -3);
    scene.add(fillLight);

    var accentLight = new THREE.PointLight(0x6c5ce7, 1, 100);
    accentLight.position.set(-5, -5, -5);
    scene.add(accentLight);

    var rimLight = new THREE.PointLight(0xa29bfe, 0.6, 30);
    rimLight.position.set(6, -3, 5);
    scene.add(rimLight);

    // ═══════════════════════════════════════════════
    //  MAIN GROUP
    // ═══════════════════════════════════════════════
    var mainGroup = new THREE.Group();
    scene.add(mainGroup);
    mainGroup.rotation.x = Math.PI / 4;
    mainGroup.rotation.y = Math.PI / 4;

    function updateCubePosition() {
        var vFov = cam.fov * Math.PI / 180;
        var hHeight = 2 * Math.tan(vFov / 2) * 14; // using target z=14
        var hWidth = hHeight * cam.aspect;

        if (window.innerWidth <= 768) {
            mainGroup.position.set(0, -2, 0);
            mainGroup.scale.set(0.45, 0.45, 0.45);
        } else {
            // Position exactly halfway between center and right edge natively
            // Matches the center of the old flex-box hero-right layout
            mainGroup.position.set(hWidth / 4 + 0.5, 0, 0);
            mainGroup.scale.set(0.5, 0.5, 0.5);
        }
        cam.position.z = 14;
    }
    updateCubePosition();

    // ═══════════════════════════════════════════════
    //  CREATE CUBE SEGMENTS
    // ═══════════════════════════════════════════════
    var CSIZE = 1, CGAP = 0.08, COFF = CSIZE + CGAP;
    var boxGeo = new THREE.BoxGeometry(CSIZE, CSIZE, CSIZE);
    var edgesGeo = new THREE.EdgesGeometry(boxGeo);

    var cubes = [];

    function isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    for (var x = -1; x <= 1; x++) {
        for (var y = -1; y <= 1; y++) {
            for (var z = -1; z <= 1; z++) {

                var boxMat = new THREE.MeshPhysicalMaterial({
                    color: isDarkMode() ? 0x0a0a0a : 0xffffff,
                    roughness: isDarkMode() ? 0.15 : 0.1,
                    metalness: 0.1,
                    transparent: true,
                    opacity: isDarkMode() ? 0.85 : 0.95,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.1,
                    envMapIntensity: 0.8,
                });

                var mesh = new THREE.Mesh(boxGeo, boxMat);
                mesh.position.set(x * COFF, y * COFF, z * COFF);

                var edgeMat = new THREE.LineBasicMaterial({
                    color: isDarkMode() ? 0xc0b8fe : 0x6c5ce7,
                    transparent: true,
                    opacity: isDarkMode() ? 0.8 : 0.5,
                    linewidth: 2,
                });
                var edges = new THREE.LineSegments(edgesGeo, edgeMat);
                mesh.add(edges);

                mainGroup.add(mesh);

                cubes.push({
                    mesh: mesh, edges: edges, boxMat: boxMat, edgeMat: edgeMat,
                    homeX: x * COFF, homeY: y * COFF, homeZ: z * COFF,
                    ix: x, iy: y, iz: z,
                });
            }
        }
    }

    // ═══════════════════════════════════════════════
    //  CLICK INTERACTION — scatter & reassemble
    // ═══════════════════════════════════════════════
    var isScattered = false;
    var isAnimating = false;
    var raycaster = new THREE.Raycaster();
    var clickMouse = new THREE.Vector2();

    container.addEventListener('click', function (e) {
        e.stopPropagation();
        if (isAnimating) return;

        // Convert click to normalized device coordinates
        var rect = renderer.domElement.getBoundingClientRect();
        clickMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        clickMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        // Raycast to check if we hit a cube
        raycaster.setFromCamera(clickMouse, cam);
        var cubeMeshes = cubes.map(function(c) { return c.mesh; });
        var intersects = raycaster.intersectObjects(cubeMeshes, false);

        // Only trigger if we clicked precisely on a cube
        if (intersects.length === 0) return;

        isAnimating = true;

        if (!isScattered) {
            // Scatter
            cubes.forEach(function (c, i) {
                var dir = new THREE.Vector3(
                    c.ix + (Math.random() - 0.5),
                    c.iy + (Math.random() - 0.5),
                    c.iz + (Math.random() - 0.5)
                ).normalize();
                var dist = 3 + Math.random() * 2;
                var d = i * 0.015;

                gsap.to(c.mesh.position, {
                    x: dir.x * dist, y: dir.y * dist, z: dir.z * dist,
                    duration: 0.8, delay: d, ease: 'power3.out',
                });
                gsap.to(c.mesh.rotation, {
                    x: Math.random() * Math.PI * 2,
                    y: Math.random() * Math.PI * 2,
                    duration: 0.8, delay: d, ease: 'power2.out',
                });
            });

            isScattered = true;
            setTimeout(function () { isAnimating = false; }, 900);
        } else {
            // Reassemble
            cubes.forEach(function (c, i) {
                var d = i * 0.015;
                gsap.to(c.mesh.position, {
                    x: c.homeX, y: c.homeY, z: c.homeZ,
                    duration: 0.85, delay: d, ease: 'back.out(1.2)',
                });
                gsap.to(c.mesh.rotation, {
                    x: 0, y: 0, z: 0,
                    duration: 0.75, delay: d, ease: 'power3.out',
                });
            });

            isScattered = false;
            setTimeout(function () { isAnimating = false; }, 1000);
        }

        // Ripple effect
        var ripple = document.createElement('div');
        ripple.className = 'cube-click-ripple';
        var rect = container.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        container.appendChild(ripple);
        gsap.to(ripple, {
            scale: 3, opacity: 0, duration: 0.8, ease: 'power2.out',
            onComplete: function () { ripple.remove(); },
        });
    });

    // ═══════════════════════════════════════════════
    //  MOUSE INTERACTION
    // ═══════════════════════════════════════════════
    var mouseX = 0, mouseY = 0;
    var hoverMouse = new THREE.Vector2();

    document.addEventListener('mousemove', function (e) {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.002;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.002;

        // Convert to normalized device coordinates for raycasting
        var rect = renderer.domElement.getBoundingClientRect();
        hoverMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        hoverMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        // Check if mouse is actually over the canvas area
        if (e.clientX >= rect.left && e.clientX <= rect.right && 
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
            
            raycaster.setFromCamera(hoverMouse, cam);
            var cubeMeshes = cubes.map(function(c) { return c.mesh; });
            var intersects = raycaster.intersectObjects(cubeMeshes, false);
            
            if (intersects.length > 0) {
                document.body.classList.add('cube-hover');
            } else {
                document.body.classList.remove('cube-hover');
            }
        } else {
            document.body.classList.remove('cube-hover');
        }
    });

    // ═══════════════════════════════════════════════
    //  RENDER LOOP
    // ═══════════════════════════════════════════════
    var clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        var time = clock.getElapsedTime();

        // Mouse-follow rotation
        var baseX = Math.PI / 4;
        var baseY = Math.PI / 4;
        mainGroup.rotation.y += ((mouseX * 1.2 + baseY) - mainGroup.rotation.y) * 0.04;
        mainGroup.rotation.x += ((mouseY * 0.8 + baseX) - mainGroup.rotation.x) * 0.04;

        // Floating
        mainGroup.position.y = Math.sin(time * 0.8) * 0.2;

        // Cube breathing
        if (!isScattered && !isAnimating) {
            cubes.forEach(function (c) {
                var dist = Math.sqrt(c.homeX * c.homeX + c.homeY * c.homeY + c.homeZ * c.homeZ);
                var wave = Math.sin(time * 2 - dist * 1.5) * 0.06;
                if (dist > 0.01) {
                    var inv = 1 / dist;
                    c.mesh.position.x = c.homeX + c.homeX * inv * wave;
                    c.mesh.position.y = c.homeY + c.homeY * inv * wave;
                    c.mesh.position.z = c.homeZ + c.homeZ * inv * wave;
                }
            });
        }

        renderer.render(scene, cam);
    }

    animate();

    // ═══════════════════════════════════════════════
    //  THEME AWARENESS
    // ═══════════════════════════════════════════════
    function applyTheme(dark) {
        cubes.forEach(function (c) {
            c.boxMat.color.setHex(dark ? 0x0a0a0a : 0xffffff);
            c.boxMat.opacity = dark ? 0.7 : 0.9;
            c.boxMat.roughness = dark ? 0.15 : 0.1;
            c.boxMat.envMapIntensity = dark ? 0.8 : 0.5;
            c.edgeMat.color.setHex(dark ? 0xc0b8fe : 0x6c5ce7);
            c.edgeMat.opacity = dark ? 0.8 : 0.5;
        });

        accentLight.color.setHex(dark ? 0xa29bfe : 0x6c5ce7);
        rimLight.color.setHex(dark ? 0x6c5ce7 : 0xa29bfe);
    }

    // Expose update function to global so script.js can call it
    window.updateCubeTheme = applyTheme;

    // ═══════════════════════════════════════════════
    //  RESIZE HANDLER
    // ═══════════════════════════════════════════════
    window.addEventListener('resize', function () {
        if (!container) return;
        updateCubePosition();
        cam.aspect = container.clientWidth / container.clientHeight;
        cam.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

})();
