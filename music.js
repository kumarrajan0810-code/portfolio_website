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
