/**
 * Robot Avatar Interaction Logic
 * Uses individual face images (R1.png - R9.png) from the Robot folder.
 */

document.addEventListener('DOMContentLoaded', () => {
    const robotWrap = document.getElementById('robotWrap');
    const robotOverlay = document.getElementById('robotOverlay');
    const robotSelectorModal = document.getElementById('robotSelectorModal');
    const currentRobot = robotWrap ? robotWrap.querySelector('.current-robot') : null;
    const robotOptions = document.querySelectorAll('.robot-option');

    if (!robotWrap || !robotSelectorModal) return;

    // Open Modal
    robotWrap.addEventListener('click', () => {
        robotOverlay.classList.add('active');
        robotSelectorModal.classList.add('active');
    });

    // Close Modal when clicking overlay
    robotOverlay.addEventListener('click', () => {
        robotOverlay.classList.remove('active');
        robotSelectorModal.classList.remove('active');
    });

    // Handle Robot Selection
    robotOptions.forEach(option => {
        option.addEventListener('click', () => {
            const face = option.getAttribute('data-face');

            // Update the main robot's background image
            currentRobot.style.backgroundImage = `url('Robot/${face}.png')`;

            // Close the modal gracefully
            robotOverlay.classList.remove('active');
            robotSelectorModal.classList.remove('active');
        });
    });
});
