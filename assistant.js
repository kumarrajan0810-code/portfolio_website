// assistant.js
document.addEventListener('DOMContentLoaded', () => {
    const heroBioText = document.getElementById('heroBioText');
    const heroAiInput = document.getElementById('heroAiInput');
    const heroAiSubmit = document.getElementById('heroAiSubmit');
    const heroAiReset = document.getElementById('heroAiReset');
    
    if (!heroBioText || !heroAiInput) return;

    const originalBioHTML = heroBioText.innerHTML;
    let isTyping = false;
    let typeTimeout = null;

    // Intents Database (Phase 1)
    const responses = {
        intro: "Hi, I'm the AI. I can tell you about Rajan's process, projects, or background. Just ask!",
        pitch: "Rajan is a Systems Thinker with enterprise experience in AI and FinOps. He bridges PM, Dev, and Design to ship real products.",
        projects: "Rajan has shipped the Deep Dive Console, Enterprise Dashboards, and Flowcraft. Which one interests you?",
        deepdive: "Deep Dive Console: An enterprise AI platform workflow. He simplified complex data into intuitive interactions.",
        designthinking: "Rajan's process: Problem Clarity, System Flows, and precise Execution. He designs decisions, not just screens.",
        resume: "Current: UX Designer at Polestar Analytics. Edu: B.Tech DTU. Exploring the overlap of UX and product.",
        fallback: "I'm still learning! Try asking about his projects, process, or why you should hire him."
    };

    function matchIntent(input) {
        input = input.toLowerCase();
        if (input.includes('pitch') || input.includes('hire') || input.includes('why')) return 'pitch';
        if (input.includes('project') || input.includes('work') || input.includes('case study') || input.includes('best')) return 'projects';
        if (input.includes('deep dive') || input.includes('console')) return 'deepdive';
        if (input.includes('design') || input.includes('thinking') || input.includes('process') || input.includes('approach')) return 'designthinking';
        if (input.includes('resume') || input.includes('summary') || input.includes('about') || input.includes('background')) return 'resume';
        if (input.includes('hi') || input.includes('hello') || input.includes('hey')) return 'intro';
        
        return 'fallback';
    }

    function typeWriter(text) {
        if (typeTimeout) clearTimeout(typeTimeout);
        isTyping = true;
        
        heroBioText.innerHTML = '<span class="ai-typewriter-text"></span><span class="ai-typewriter-cursor"></span>';
        const textSpan = heroBioText.querySelector('.ai-typewriter-text');
        
        let i = 0;
        function type() {
            if (i < text.length) {
                textSpan.textContent += text.charAt(i);
                i++;
                typeTimeout = setTimeout(type, 20); // typing speed
            } else {
                isTyping = false;
            }
        }
        type();
    }

    function handleQuery() {
        const query = heroAiInput.value;
        if (!query.trim() || isTyping) return;
        
        const intent = matchIntent(query);
        const responseText = responses[intent];
        
        heroAiInput.value = '';
        heroAiInput.blur(); // Collapse the pill if not hovered
        
        heroAiReset.classList.remove('hidden');
        typeWriter(responseText);
    }

    heroAiSubmit.addEventListener('click', handleQuery);
    
    heroAiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleQuery();
        }
    });

    heroAiReset.addEventListener('click', () => {
        if (typeTimeout) clearTimeout(typeTimeout);
        isTyping = false;
        heroBioText.innerHTML = originalBioHTML;
        heroAiReset.classList.add('hidden');
    });
});
