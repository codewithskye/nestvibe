// Scroll handling for hero video and chat widget
function handleScroll() {
    const heroVideo = document.querySelector('#hero .hero-video[data-scroll-target]');
    const heroSection = document.querySelector('#hero');
    const chatWidget = document.querySelector('#chat-widget');
    
    if (!heroVideo || !heroSection || !chatWidget) return;

    const heroRect = heroSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Hero video shrink effect
    // Trigger when hero section is mostly out of view and revert when it comes back
    if (heroRect.bottom < viewportHeight * 0.2 && heroRect.top < 0) {
        heroVideo.classList.add('shrink');
    } else {
        heroVideo.classList.remove('shrink');
    }

    // Chat widget hide/show on scroll (mobile only)
    if (window.innerWidth <= 768) {
        chatWidget.classList.add('hidden');
        // Use requestAnimationFrame for smoother re-display
        let showTimer = null;
        if (showTimer) cancelAnimationFrame(showTimer);
        showTimer = requestAnimationFrame(() => {
            setTimeout(() => {
                chatWidget.classList.remove('hidden');
            }, 1000); 
        });
    }
}