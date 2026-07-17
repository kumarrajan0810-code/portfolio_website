/**
 * Music Player Interaction Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const headphonesWrap = document.getElementById('headphonesWrap');
    const musicOverlay = document.getElementById('musicOverlay');
    const musicModal = document.getElementById('musicModal');
    const playBtn = document.getElementById('playBtn');
    const vinylRecord = document.getElementById('vinylRecord');
    const progressFill = document.getElementById('progressFill');

    if (!headphonesWrap) return;

    // Open Modal
    headphonesWrap.addEventListener('click', () => {
        musicOverlay.classList.add('active');
        musicModal.classList.add('active');
    });

    // Close Modal
    musicOverlay.addEventListener('click', () => {
        musicOverlay.classList.remove('active');
        musicModal.classList.remove('active');

        // Optional: auto-pause when closing? 
        // We can let the music "play" in the background visually.
    });

    // Play / Pause Logic
    if (playBtn) {
        const playIcon = playBtn.querySelector('.play-icon');
        const pauseIcon = playBtn.querySelector('.pause-icon');
        let isPlaying = false;

        playBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;

            if (isPlaying) {
                // Play
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
                vinylRecord.classList.add('playing');
                progressFill.classList.add('playing');
            } else {
                // Pause
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                vinylRecord.classList.remove('playing');
                progressFill.classList.remove('playing');
            }
        });
    }
});
const modal = document.getElementById('aiPlaygroundModal');
const pile = document.getElementById('aiChipPile');
const tvScreen = document.getElementById('aiShowcaseScreen');
const screenIdle = document.getElementById('aiScreenIdle');
const screenContent = document.getElementById('aiScreenContent');
const domBalls = Array.from(document.querySelectorAll('.ai-ball'));

if (!trigger || !modal || !pile || !tvScreen || typeof Matter === 'undefined') return;

let isModalOpen = false;
let engine, render, runner;
let physicsBodies = [];

// Matter.js Aliases
const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Events = Matter.Events;

function initPhysics() {
    if (engine) return; // already initialized

    engine = Engine.create();
    const world = engine.world;

    const W = modal.clientWidth;
    const H = modal.clientHeight;

    render = Render.create({
        element: pile,
        engine: engine,
        options: {
            width: W,
            height: H,
            wireframes: false,
            background: 'transparent'
        }
    });

    // Hide canvas visually, but use it for mouse interactions
    render.canvas.style.position = 'absolute';
    render.canvas.style.top = '0';
    render.canvas.style.left = '0';
    render.canvas.style.opacity = '0';
    render.canvas.style.zIndex = '5'; // Above balls but below TV

    // TV needs to be above canvas so it looks correct, but we still want to drop onto it
    tvScreen.style.position = 'relative';
    tvScreen.style.zIndex = '20';
    tvScreen.style.pointerEvents = 'none'; // Let mouse pass through TV to canvas so dragging works anywhere

    // Create Walls
    const thickness = 60;
    const ground = Bodies.rectangle(W / 2, H + thickness / 2, W + 200, thickness, { isStatic: true });
    const leftWall = Bodies.rectangle(-thickness / 2, H / 2, thickness, H * 3, { isStatic: true });
    const rightWall = Bodies.rectangle(W + thickness / 2, H / 2, thickness, H * 3, { isStatic: true });
    // Add a ceiling to keep balls from flying out easily
    const ceiling = Bodies.rectangle(W / 2, -thickness * 2, W + 200, thickness, { isStatic: true });

    Composite.add(world, [ground, leftWall, rightWall, ceiling]);

    // Create Physics Balls
    domBalls.forEach((domBall, index) => {
        // Assign random sizes
        const radius = 45 + Math.random() * 25; // 45px to 70px
        const color = ballColors[index % ballColors.length];

        // Update DOM element to match
        domBall.style.width = `${radius * 2}px`;
        domBall.style.height = `${radius * 2}px`;
        domBall.style.backgroundColor = color;
        domBall.innerHTML = `<span class="ai-ball-text">${domBall.innerText}</span>`;

        // Create Matter Body
        const startX = W / 2 + (Math.random() - 0.5) * 200;
        const startY = 100 + Math.random() * -300; // start slightly above to fall

        const body = Bodies.circle(startX, startY, radius, {
            restitution: 0.6, // Bounciness
            friction: 0.1,
            density: 0.002,
            render: { fillStyle: color } // Just in case
        });

        body.domElement = domBall;
        body.industryKey = domBall.getAttribute('data-industry');
        physicsBodies.push(body);
    });

    Composite.add(world, physicsBodies);

    // Add Mouse Interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });

    Composite.add(world, mouseConstraint);
    render.mouse = mouse; // Keep mouse in sync with render

    // Sync DOM elements with Physics Bodies
    Events.on(engine, 'afterUpdate', () => {
        physicsBodies.forEach(body => {
            const dom = body.domElement;
            // Matter uses center origin, DOM uses top-left by default. 
            // We use transform translate from top-left, so offset by radius.
            const r = body.circleRadius;
            dom.style.transform = `translate(${body.position.x - r}px, ${body.position.y - r}px) rotate(${body.angle}rad)`;
        });
    });

    // Detect Drag & Drop over TV Screen
    let draggedBody = null;

    Events.on(mouseConstraint, 'startdrag', (event) => {
        draggedBody = event.body;
        if (draggedBody && draggedBody.domElement) {
            draggedBody.domElement.style.boxShadow = 'inset -4px -4px 10px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.4)';
            draggedBody.domElement.style.zIndex = '15';
        }
    });

    Events.on(mouseConstraint, 'mousemove', () => {
        if (draggedBody) {
            // Check if mouse is over TV Billboard manually since TV pointer-events is none
            const tvRect = tvScreen.getBoundingClientRect();
            const mousePos = mouse.absolute;

            // mousePos is relative to the canvas.
            // We need to compare it to the TV's bounding box relative to the modal.
            const modalRect = modal.getBoundingClientRect();
            const tvLocalY = tvRect.top - modalRect.top;
            const tvLocalX = tvRect.left - modalRect.left;

            if (
                mousePos.x > tvLocalX && mousePos.x < tvLocalX + tvRect.width &&
                mousePos.y > tvLocalY && mousePos.y < tvLocalY + tvRect.height
            ) {
                tvScreen.classList.add('drag-over');
            } else {
                tvScreen.classList.remove('drag-over');
            }
        }
    });

    Events.on(mouseConstraint, 'enddrag', (event) => {
        if (draggedBody) {
            if (draggedBody.domElement) {
                draggedBody.domElement.style.boxShadow = 'inset -4px -4px 10px rgba(0,0,0,0.3), 0 10px 20px rgba(0,0,0,0.2)';
                draggedBody.domElement.style.zIndex = '10';
            }

            if (tvScreen.classList.contains('drag-over')) {
                tvScreen.classList.remove('drag-over');
                handleDrop(draggedBody.industryKey);
            }
            draggedBody = null;
        }
    });

    // Run Engine
    Runner.run(Runner.create(), engine);
    Render.run(render);
}

function destroyPhysics() {
    if (!engine) return;
    Render.stop(render);
    Runner.stop(runner);
    Engine.clear(engine);
    if (render.canvas) render.canvas.remove();
    engine = null;
    physicsBodies = [];
}

// --- Modal Logic ---
trigger.addEventListener('click', () => {
    isModalOpen = true;
    if (overlay) overlay.classList.add('active');
    modal.classList.add('active');

    // Slight delay to allow modal to render so Canvas dimensions are correct
    setTimeout(() => {
        initPhysics();
    }, 100);
});

const closeModal = () => {
    isModalOpen = false;
    if (overlay) overlay.classList.remove('active');
    modal.classList.remove('active');

    // Reset screen state
    setTimeout(() => {
        screenIdle.style.display = 'block';
        screenContent.style.display = 'none';
        screenContent.innerHTML = '';
        destroyPhysics(); // clean up physics world so they fall again next time
    }, 500);
};

if (overlay) overlay.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('ai-physics-pile')) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) closeModal();
});

// --- TV Display Logic ---
function handleDrop(industryKey) {
    const data = industryData[industryKey];
    if (!data) return;

    screenIdle.style.display = 'none';
    screenContent.style.display = 'flex';

    screenContent.style.animation = 'none';
    screenContent.offsetHeight;
    screenContent.style.animation = null;

    screenContent.innerHTML = `
            <h2 class="ai-content-title">${data.title}</h2>
            <div class="ai-content-grid">
                <div class="ai-content-col">
                    <h4>Design Roles</h4>
                    <ul>
                        ${data.roles.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
                <div class="ai-content-col">
                    <h4>Brands & Companies</h4>
                    <ul>
                        ${data.brands.map(b => `<li>${b}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
}
});
