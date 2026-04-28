/**
 * Quotes Interaction Logic
 * Lets users pick a motivational quote (q1.png - q24.png) to display on the hero section.
 */

document.addEventListener('DOMContentLoaded', () => {
    const quoteWrap = document.getElementById('quoteWrap');
    const quoteOverlay = document.getElementById('quoteOverlay');
    const quoteSelectorModal = document.getElementById('quoteSelectorModal');
    const currentQuoteImg = document.getElementById('currentQuoteImg');
    const quoteOptions = document.querySelectorAll('.quote-option');

    if (!quoteWrap || !quoteSelectorModal || !currentQuoteImg) return;

    // Open Modal
    quoteWrap.addEventListener('click', () => {
        quoteOverlay.classList.add('active');
        quoteSelectorModal.classList.add('active');
    });

    // Close Modal when clicking overlay
    quoteOverlay.addEventListener('click', () => {
        quoteOverlay.classList.remove('active');
        quoteSelectorModal.classList.remove('active');
    });

    // Handle Quote Selection
    quoteOptions.forEach(option => {
        option.addEventListener('click', () => {
            const quote = option.getAttribute('data-quote');

            // Update the main quote image src
            currentQuoteImg.src = `Quotes/${quote}.png`;

            // Close the modal gracefully
            quoteOverlay.classList.remove('active');
            quoteSelectorModal.classList.remove('active');
        });
    });
});
