/* ==========================================
   RAJAN KUMAR — PORTFOLIO JS
   GSAP ScrollTrigger + Bento Tilt + Cursor
   ========================================== */

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// PRELOADER
// ==========================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    gsap.to(preloader, {
        opacity: 0,
        duration: 0.6,
        delay: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
            preloader.classList.add('done');
            animateHero();
        }
    });
});

// ==========================================
// CUSTOM CURSOR (Desktop only)
// ==========================================
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

if (window.matchMedia('(pointer: fine)').matches && cursorDot && cursorRing) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });

    function animateCursorRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        requestAnimationFrame(animateCursorRing);
    }
    animateCursorRing();
}

// ==========================================
// HERO ANIMATION (Zentry-style word reveal)
// ==========================================
function animateHero() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Word-by-word reveal (signature Zentry effect)
    tl.to('.hero-word', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
    }, 0.2);

    // Bio snippet
    tl.to('.hero-bio', {
        opacity: 1,
        y: 0,
        duration: 0.7,
    }, 0.9);

    // Hint text and arrow
    tl.to('.hero-hint', {
        opacity: 1,
        y: 0,
        duration: 0.8,
    }, 1.2);

    // Start typewriter after hero text is revealed
    tl.call(startTypewriter, null, 1.2);
}

// ==========================================
// TYPEWRITER ANIMATION
// ==========================================
let _typewriterStarted = false;

function startTypewriter() {
    if (_typewriterStarted) return;
    _typewriterStarted = true;

    const roles = ["UX Designer.", "Product Thinker.", "Problem Solver.", "Visual Explorer.", "System Thinker.", "Creative Coder."];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingTextEl = document.getElementById('typingText');

    function typeRole() {
        if (!typingTextEl) return;

        const currentRole = roles[roleIndex];
        let delay;

        if (isDeleting) {
            charIndex--;
            typingTextEl.textContent = currentRole.substring(0, charIndex);
            delay = 40;
        } else {
            charIndex++;
            typingTextEl.textContent = currentRole.substring(0, charIndex);
            delay = Math.random() * 40 + 70;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            // Finished typing — pause before deleting
            isDeleting = true;
            delay = 2200;
        } else if (isDeleting && charIndex === 0) {
            // Finished deleting — move to next role
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            delay = 500;
        }

        setTimeout(typeRole, delay);
    }

    typeRole();
}

// Safety fallback: start typewriter even if GSAP hero animation doesn't complete
setTimeout(function () {
    startTypewriter();
    // Also force-reveal hero words if they're still hidden
    document.querySelectorAll('.hero-word').forEach(function (w) {
        if (getComputedStyle(w).opacity === '0') {
            w.style.opacity = '1';
            w.style.transform = 'translateY(0)';
        }
    });
    var bio = document.querySelector('.hero-bio');
    if (bio && getComputedStyle(bio).opacity === '0') {
        bio.style.opacity = '1';
        bio.style.transform = 'translateY(0)';
    }
}, 4000);

// ==========================================
// DRAGGABLE HERO CARDS
// ==========================================
(function () {
    const cards = document.querySelectorAll('.hero-card[data-draggable]');
    const container = document.getElementById('heroCards');
    if (!cards.length || !container) return;

    let activeCard = null;
    let initialX = 0;
    let initialY = 0;
    let currentX = 0;
    let currentY = 0;
    let xOffset = 0;
    let yOffset = 0;

    cards.forEach((card, index) => {
        // Initialize position variables attached to element
        card.xOffset = 0;
        card.yOffset = 0;

        // Set initial rotation from CSS variable so GSAP can animate to it
        const rotateVal = card.style.getPropertyValue('--card-rotate').trim();

        // Use GSAP so it handles inline styles and clears conflicting CSS animations
        gsap.fromTo(card,
            {
                y: -60,
                opacity: 0,
                scale: 0.8,
                rotation: rotateVal ? (parseFloat(rotateVal) * 2) + "deg" : "0deg"
            },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                rotation: rotateVal || "0deg",
                duration: 0.8,
                delay: 1.5 + (index * 0.15),
                ease: "back.out(1.5)",
                onComplete: () => {
                    // Lock the final transform so drag works smoothly
                    card.style.transform = `translate3d(${card.xOffset}px, ${card.yOffset}px, 0) rotate(${rotateVal}) scale(1)`;
                }
            }
        );

        card.addEventListener('mousedown', dragStart);
        card.addEventListener('touchstart', dragStart, { passive: false });
    });

    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });

    function dragStart(e) {
        e.preventDefault(); // Prevent text selection while dragging
        activeCard = e.target.closest('.hero-card');
        if (!activeCard) return;

        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX - activeCard.xOffset;
            initialY = e.touches[0].clientY - activeCard.yOffset;
        } else {
            initialX = e.clientX - activeCard.xOffset;
            initialY = e.clientY - activeCard.yOffset;
        }

        activeCard.classList.add('is-dragging');

        // Instantly straighten and scale up
        activeCard.style.transform = `translate3d(${activeCard.xOffset}px, ${activeCard.yOffset}px, 0) rotate(0deg) scale(1.08)`;
    }

    function dragEnd(e) {
        if (!activeCard) return;

        initialX = currentX;
        initialY = currentY;
        activeCard.classList.remove('is-dragging');

        // Restore standard rotation and scale Drop
        const rotateVal = activeCard.style.getPropertyValue('--card-rotate') || '0deg';
        activeCard.style.transform = `translate3d(${activeCard.xOffset}px, ${activeCard.yOffset}px, 0) rotate(${rotateVal}) scale(1)`;

        activeCard = null;
    }

    function drag(e) {
        if (!activeCard) return;
        e.preventDefault();

        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        activeCard.xOffset = currentX;
        activeCard.yOffset = currentY;

        // Follow cursor while dragging
        activeCard.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(0deg) scale(1.08)`;
    }
})();

// ==========================================
// DRAGGABLE PRINCIPLE STICKY NOTES
// ==========================================
(function () {
    const notes = document.querySelectorAll('.principle-sticky[data-principle-drag]');
    const container = document.getElementById('principleNotes');
    if (!notes.length || !container) return;

    let activeNote = null;
    let initialX = 0;
    let initialY = 0;
    let currentX = 0;
    let currentY = 0;

    // Animate notes in on scroll
    notes.forEach((note, index) => {
        note.xOffset = 0;
        note.yOffset = 0;

        const rotateVal = note.style.getPropertyValue('--card-rotate').trim();

        gsap.fromTo(note,
            {
                y: 40,
                opacity: 0,
                scale: 0.8,
                rotation: rotateVal ? (parseFloat(rotateVal) * 2) + "deg" : "0deg"
            },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                rotation: rotateVal || "0deg",
                duration: 0.7,
                delay: index * 0.12,
                ease: "back.out(1.5)",
                scrollTrigger: {
                    trigger: container,
                    start: "top 80%",
                    toggleActions: "play none none none"
                },
                onComplete: () => {
                    note.style.transform = `translate3d(${note.xOffset}px, ${note.yOffset}px, 0) rotate(${rotateVal}) scale(1)`;
                }
            }
        );

        note.addEventListener('mousedown', dragStart);
        note.addEventListener('touchstart', dragStart, { passive: false });
    });

    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });

    function dragStart(e) {
        e.preventDefault();
        activeNote = e.target.closest('.principle-sticky');
        if (!activeNote) return;

        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX - activeNote.xOffset;
            initialY = e.touches[0].clientY - activeNote.yOffset;
        } else {
            initialX = e.clientX - activeNote.xOffset;
            initialY = e.clientY - activeNote.yOffset;
        }

        activeNote.classList.add('is-dragging');
        activeNote.style.transform = `translate3d(${activeNote.xOffset}px, ${activeNote.yOffset}px, 0) rotate(0deg) scale(1.08)`;
    }

    function dragEnd() {
        if (!activeNote) return;

        activeNote.classList.remove('is-dragging');
        const rotateVal = activeNote.style.getPropertyValue('--card-rotate') || '0deg';
        activeNote.style.transform = `translate3d(${activeNote.xOffset}px, ${activeNote.yOffset}px, 0) rotate(${rotateVal}) scale(1)`;
        activeNote = null;
    }

    function drag(e) {
        if (!activeNote) return;
        e.preventDefault();

        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        activeNote.xOffset = currentX;
        activeNote.yOffset = currentY;
        activeNote.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(0deg) scale(1.08)`;
    }
})();
// ==========================================
// THEME TOGGLE (Dark / Light Mode)
// ==========================================
(function () {
    const toggle = document.getElementById('themePillToggle');

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', theme);

        // Push theme update down to Three.js cube scene if loaded
        if (typeof window.updateCubeTheme === 'function') {
            window.updateCubeTheme(theme === 'dark');
        }
    }

    // Restore saved preference (or respect OS)
    const saved = localStorage.getItem('theme');
    if (saved) {
        applyTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    }

    if (toggle) {
        toggle.addEventListener('click', function () {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            applyTheme(isDark ? 'light' : 'dark');
        });
    }
})();

// ==========================================
// NAVBAR SCROLL
// ==========================================
const navbar = document.getElementById('navbar');
const navWrapper = document.querySelector('.navbar-wrapper');

ScrollTrigger.create({
    start: 80,
    onUpdate: (self) => {
        if (self.direction === 1 && window.scrollY > 80) {
            navbar.classList.add('scrolled');
            if (navWrapper) navWrapper.classList.add('scrolled-wrapper');
        }
        if (window.scrollY <= 80) {
            navbar.classList.remove('scrolled');
            if (navWrapper) navWrapper.classList.remove('scrolled-wrapper');
        }
    }
});

// Fade out scroll indicator
ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: '30% top',
    onUpdate: (self) => {
        const indicator = document.getElementById('scrollIndicator');
        if (indicator) {
            indicator.style.opacity = 1 - self.progress * 3;
        }
    }
});

// ==========================================
// MOBILE MENU
// ==========================================
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    document.querySelectorAll('[data-mobile-nav]').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}

// ==========================================
// SCROLL REVEAL ANIMATIONS (Nimbus-style FadeIn)
// ==========================================
function createScrollReveals() {
    // Section labels
    gsap.utils.toArray('.section-label').forEach(el => {
        gsap.to(el, {
            opacity: 1, y: 0, duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
        });
    });

    // Section headings
    gsap.utils.toArray('.section-heading, .contact-heading').forEach(el => {
        gsap.to(el, {
            opacity: 1, y: 0, duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
        });
    });

    // About / Approach elements
    gsap.utils.toArray('.about-para, .about-muted, .approach-para, .approach-quote-wrap, .capabilities-header, .capability-col').forEach((el, i) => {
        gsap.to(el, {
            opacity: 1, y: 0, duration: 0.7,
            delay: i * 0.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
        });
    });

    // Badge cards (lanyard badges)
    gsap.utils.toArray('.badge-unit').forEach((el, i) => {
        gsap.to(el, {
            opacity: 1, y: 0, duration: 0.9,
            delay: i * 0.12,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
        });
    });

    // Skill groups
    gsap.utils.toArray('.skill-group').forEach((el, i) => {
        gsap.to(el, {
            opacity: 1, y: 0, duration: 0.7,
            delay: i * 0.15,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
        });
    });

    // Contact body and actions
    gsap.utils.toArray('.contact-body, .contact-actions, .contact-email').forEach((el, i) => {
        gsap.to(el, {
            opacity: 1, y: 0, duration: 0.7,
            delay: i * 0.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
        });
    });
}

createScrollReveals();

// ==========================================
// BADGE TILT (on hover)
// ==========================================
function initBadgeTilt() {
    const badges = document.querySelectorAll('.badge-card');

    badges.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const relativeX = (e.clientX - rect.left) / rect.width;
            const relativeY = (e.clientY - rect.top) / rect.height;

            const tiltX = (relativeY - 0.5) * 6;
            const tiltY = (relativeX - 0.5) * -6;

            gsap.to(card, {
                rotateX: tiltX,
                rotateY: tiltY,
                transformPerspective: 700,
                duration: 0.4,
                ease: 'power2.out',
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.6,
                ease: 'power2.out',
            });
        });
    });
}

initBadgeTilt();

// ==========================================
// SMOOTH SCROLL
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// ==========================================
// MAGNETIC BUTTON EFFECT
// ==========================================
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(btn, {
                x: x * 0.2,
                y: y * 0.2,
                duration: 0.3,
                ease: 'power2.out',
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)',
            });
        });
    });
}

initMagneticButtons();

// ==========================================
// SKILL PILLS STAGGER ANIMATION
// ==========================================
gsap.utils.toArray('.skill-pills').forEach(container => {
    const pills = container.querySelectorAll('.skill-pill');
    gsap.set(pills, { opacity: 0, y: 15 });

    ScrollTrigger.create({
        trigger: container,
        start: 'top 80%',
        onEnter: () => {
            gsap.to(pills, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.06,
                ease: 'power3.out',
            });
        },
        once: true,
    });
});

// Badge drag & drop is now handled inline in index.html
// ==========================================


// ==========================================
// CAPABILITIES MATRIX MODAL
// ==========================================
const capabilitiesData = [
    // PRODUCT & UX (0-4)
    { category: "PRODUCT & UX", title: "Problem framing", desc: "Finding the right question before solving anything. I start by making sure we're solving the right problem for the right user at the right moment — before Figma, before wireframes." },
    { category: "PRODUCT & UX", title: "Systems thinking", desc: "Designing flows, not just screens. I look at the whole ecosystem — a change on screen A impacts screen D, and I map those dependencies to keep the user journey intact." },
    { category: "PRODUCT & UX", title: "Information architecture", desc: "Making complex things feel obvious. Enterprise platforms deal with dense data, and my job is to translate that density into intuitive structure without dumbing it down." },
    { category: "PRODUCT & UX", title: "Usability thinking", desc: "Catching what breaks before users do. I test concepts when they're still rough, because that's when feedback is most useful and iteration is cheapest." },
    { category: "PRODUCT & UX", title: "Quant research (growing)", desc: "Surveys, metrics, data-led decisions. I'm building fluency in quantitative research methods to complement my qualitative instincts." },

    // CRAFT & PROTOTYPING (5-9)
    { category: "CRAFT & PROTOTYPING", title: "Figma & high-fidelity prototyping", desc: "From rough idea to testable prototype. I build in Figma at a level that bridges concept and production, making it easy for developers to pick up." },
    { category: "CRAFT & PROTOTYPING", title: "Visual hierarchy", desc: "What you see first, second, and why. I use scale, contrast, and spacing deliberately so every screen communicates priority clearly." },
    { category: "CRAFT & PROTOTYPING", title: "Prototyping to think", desc: "Using making as a way of figuring things out. I don't wait for the 'right' idea — I prototype multiple concepts early to discover where they break and where they shine." },
    { category: "CRAFT & PROTOTYPING", title: "Sweat the details", desc: "Spacing, type, and the things most people skip. Every pixel, every token, every interaction state matters. I care about the polish because users feel it." },
    { category: "CRAFT & PROTOTYPING", title: "Design systems (growing)", desc: "Tokens, components, at-scale thinking. I'm deepening my understanding of how to build and maintain scalable design systems." },

    // AI & NEW PRACTICE (10-14)
    { category: "AI & NEW PRACTICE", title: "AI prompt design", desc: "Writing instructions that shape AI behaviour. I craft prompts that guide AI outputs toward useful, reliable, and contextually appropriate results." },
    { category: "AI & NEW PRACTICE", title: "Evaluating AI-generated UI", desc: "Knowing what to keep, fix, and throw away. Not everything AI generates is usable — I bring the design judgment to curate what actually ships." },
    { category: "AI & NEW PRACTICE", title: "Human-AI workflow design", desc: "Where AI helps and where humans must stay. I think carefully about the line between automation and human agency in every workflow." },
    { category: "AI & NEW PRACTICE", title: "Conversational UX", desc: "Designing for outputs you don't fully control. Chat interfaces, voice flows, and AI assistants require a different design mindset — one I'm actively building." },
    { category: "AI & NEW PRACTICE", title: "AI engineering basics (growing)", desc: "APIs, models, what's actually possible. I'm learning enough about the technical side to have honest conversations with engineers and set realistic expectations." },

    // COLLABORATION (15-18)
    { category: "COLLABORATION", title: "Cross-functional work", desc: "Speaking product, dev, and business fluently. I bridge the gap between stakeholders to make sure we're all pulling in the same direction." },
    { category: "COLLABORATION", title: "Presenting decisions", desc: "Showing the why, not just the what. I use prototypes and clear rationale to guide conversations, turning subjective opinions into objective, user-centric decisions." },
    { category: "COLLABORATION", title: "Giving and taking feedback", desc: "Making critique useful, not personal. I've learned that great design comes from honest feedback loops — both giving and receiving them with grace." },
    { category: "COLLABORATION", title: "Documentation & handoff", desc: "Leaving things better than you found them. Good design that nobody can understand or build is just art. I care deeply about handoff quality." }
];

let currentSkillId = 0;
const skillOverlay = document.getElementById('skillOverlay');
const skillDetailModal = document.getElementById('skillDetailModal');
const skillPrevBtn = document.getElementById('skillPrevBtn');
const skillNextBtn = document.getElementById('skillNextBtn');
const skillDetailCategory = document.getElementById('skillDetailCategory');
const skillDetailTitle = document.getElementById('skillDetailTitle');
const skillDetailDesc = document.getElementById('skillDetailDesc');

function updateSkillContent(id) {
    const data = capabilitiesData[id];
    if (!data) return;

    // Animate content change
    gsap.to([skillDetailCategory, skillDetailTitle, skillDetailDesc], {
        opacity: 0,
        y: 10,
        duration: 0.2,
        onComplete: () => {
            skillDetailCategory.textContent = data.category;
            skillDetailTitle.textContent = data.title;
            skillDetailDesc.textContent = data.desc;

            gsap.to([skillDetailCategory, skillDetailTitle, skillDetailDesc], {
                opacity: 1,
                y: 0,
                duration: 0.3,
                stagger: 0.05
            });
        }
    });
}

function openSkillDetail(id) {
    currentSkillId = parseInt(id);
    const data = capabilitiesData[currentSkillId];
    if (data) {
        skillDetailCategory.textContent = data.category;
        skillDetailTitle.textContent = data.title;
        skillDetailDesc.textContent = data.desc;
        gsap.set([skillDetailCategory, skillDetailTitle, skillDetailDesc], { opacity: 1, y: 0 });
    }

    skillOverlay.classList.add('active');
    skillDetailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSkillDetail() {
    skillOverlay.classList.remove('active');
    skillDetailModal.classList.remove('active');
    document.body.style.overflow = '';
}

function nextSkill() {
    currentSkillId = (currentSkillId + 1) % capabilitiesData.length;
    updateSkillContent(currentSkillId);
}

function prevSkill() {
    currentSkillId = (currentSkillId - 1 + capabilitiesData.length) % capabilitiesData.length;
    updateSkillContent(currentSkillId);
}

// Event Listeners
document.querySelectorAll('.capability-card').forEach(card => {
    card.addEventListener('click', () => {
        openSkillDetail(card.getAttribute('data-skill-id'));
    });
});

if (skillNextBtn) skillNextBtn.addEventListener('click', nextSkill);
if (skillPrevBtn) skillPrevBtn.addEventListener('click', prevSkill);

if (skillOverlay) {
    skillOverlay.addEventListener('click', closeSkillDetail);
}

document.addEventListener('keydown', (e) => {
    if (!skillDetailModal || !skillDetailModal.classList.contains('active')) return;

    if (e.key === 'Escape') closeSkillDetail();
    if (e.key === 'ArrowRight') nextSkill();
    if (e.key === 'ArrowLeft') prevSkill();
});

