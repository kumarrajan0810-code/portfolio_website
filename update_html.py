import re

with open('/Users/rajan/Portfolio v1/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_block = '''<!-- PLACEHOLDER SHOWCASE 2 -->
    <section class="playground-section" id="showcase-2">
        <div class="pg-scroll-wrap">
            <div class="playground-header">
                <span class="playground-label">Design Showcase</span>
                <h2 class="playground-title">Prep OS — <em>User Interface</em></h2>
                <p class="playground-subtitle">Exploring the interface and experience for Prep OS.</p>
            </div>
            <div class="pg-diagonal-canvas">
                <div class="pg-row" data-direction="-1">
                    <div class="pg-row-inner">
                        <div class="pg-card"><img src="Prep OS/Prep OS 1.png" alt="Screen 1"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 2.png" alt="Screen 2"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 3.png" alt="Screen 3"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 4.png" alt="Screen 4"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 5.png" alt="Screen 5"></div>
                        <!-- Duplicates -->
                        <div class="pg-card"><img src="Prep OS/Prep OS 1.png" alt="Screen 1"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 2.png" alt="Screen 2"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 3.png" alt="Screen 3"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 4.png" alt="Screen 4"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 5.png" alt="Screen 5"></div>
                    </div>
                </div>
                <div class="pg-row" data-direction="1">
                    <div class="pg-row-inner">
                        <div class="pg-card"><img src="Prep OS/Prep OS 6.png" alt="Screen 6"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 7.png" alt="Screen 7"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 8.png" alt="Screen 8"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 9.png" alt="Screen 9"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 1.png" alt="Screen 10"></div>
                        <!-- Duplicates -->
                        <div class="pg-card"><img src="Prep OS/Prep OS 6.png" alt="Screen 6"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 7.png" alt="Screen 7"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 8.png" alt="Screen 8"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 9.png" alt="Screen 9"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 1.png" alt="Screen 10"></div>
                    </div>
                </div>
                <div class="pg-row" data-direction="-1">
                    <div class="pg-row-inner">
                        <div class="pg-card"><img src="Prep OS/Prep OS 2.png" alt="Screen 11"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 3.png" alt="Screen 12"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 4.png" alt="Screen 13"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 5.png" alt="Screen 14"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 6.png" alt="Screen 15"></div>
                        <!-- Duplicates -->
                        <div class="pg-card"><img src="Prep OS/Prep OS 2.png" alt="Screen 11"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 3.png" alt="Screen 12"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 4.png" alt="Screen 13"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 5.png" alt="Screen 14"></div>
                        <div class="pg-card"><img src="Prep OS/Prep OS 6.png" alt="Screen 15"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>'''

pattern = re.compile(r'<!-- PLACEHOLDER SHOWCASE 2 -->.*?</section>', re.DOTALL)
new_content = pattern.sub(new_block, content)

with open('/Users/rajan/Portfolio v1/index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated index.html successfully")
