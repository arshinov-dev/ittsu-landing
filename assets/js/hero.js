(() => {
    let heroSlideshowTimer;

    function setupHeroSlideshow({
        slideshowId = 'heroSlideshow',
        isMobile = false,
        reducedMotion = false,
        heroSlideSizes,
        desktopHeroSlides = [],
        mobileHeroSlides = []
    }) {
        const slideshow = document.getElementById(slideshowId);
        const heroSlides = isMobile ? mobileHeroSlides : desktopHeroSlides;

        if (heroSlideshowTimer) {
            window.clearInterval(heroSlideshowTimer);
            heroSlideshowTimer = null;
        }

        if (!slideshow || !heroSlides.length) return;

        const renderHeroImageAttrs = (slide, index) => `
            class="hero-slide${index === 0 ? ' active' : ''}"
            src="${slide.src}"
            srcset="${slide.srcset}"
            sizes="${heroSlideSizes}"
            alt=""
            aria-hidden="true"
            ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}
            decoding="async"
        `;

        const applyHeroSlideImage = (image, slide) => {
            image.srcset = slide.srcset;
            image.sizes = heroSlideSizes;
            image.src = slide.src;
        };

        const layerCount = reducedMotion || heroSlides.length === 1 ? 1 : 2;
        slideshow.innerHTML = Array.from({ length: layerCount }, (_, index) => `
            <img ${renderHeroImageAttrs(heroSlides[index] || heroSlides[0], index)}>
        `).join('');

        if (layerCount === 1) return;

        const slides = Array.from(slideshow.querySelectorAll('.hero-slide'));
        let activeLayer = 0;
        let currentSlide = 0;
        let nextSlide = 1;
        let isTransitioning = false;
        const transitionMs = 900;
        const isImageReady = image => image.complete && image.naturalWidth > 0;

        heroSlideshowTimer = window.setInterval(() => {
            if (isTransitioning) return;
            isTransitioning = true;

            const incomingLayer = 1 - activeLayer;
            const incoming = slides[incomingLayer];
            const outgoing = slides[activeLayer];

            const showIncoming = () => {
                if (!isImageReady(incoming)) {
                    nextSlide = (nextSlide + 1) % heroSlides.length;
                    applyHeroSlideImage(incoming, heroSlides[nextSlide]);
                    isTransitioning = false;
                    return;
                }

                incoming.classList.add('active');
                outgoing.classList.remove('active');
                activeLayer = incomingLayer;
                currentSlide = nextSlide;
                nextSlide = (currentSlide + 1) % heroSlides.length;
                window.setTimeout(() => {
                    applyHeroSlideImage(slides[1 - activeLayer], heroSlides[nextSlide]);
                    isTransitioning = false;
                }, transitionMs);
            };

            if (isImageReady(incoming)) {
                showIncoming();
            } else {
                incoming.addEventListener('load', showIncoming, { once: true });
                incoming.addEventListener('error', () => {
                    nextSlide = (nextSlide + 1) % heroSlides.length;
                    applyHeroSlideImage(incoming, heroSlides[nextSlide]);
                    isTransitioning = false;
                }, { once: true });
            }
        }, 4300);
    }

    window.IZHT_HERO = {
        setupHeroSlideshow
    };
})();
