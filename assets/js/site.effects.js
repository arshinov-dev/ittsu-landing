(() => {
    function createRevealController(reducedMotionQuery) {
        let observer;

        function observe(element, delay = 0) {
            if (!element) return;

            element.classList.add('reveal-on-scroll');
            element.style.setProperty('--reveal-delay', `${delay}ms`);

            if (reducedMotionQuery.matches) {
                element.classList.add('is-visible');
                return;
            }

            if (observer) {
                requestAnimationFrame(() => {
                    observer.observe(element);
                });
            }
        }

        function setup(selectors) {
            const revealElements = document.querySelectorAll(selectors.join(','));

            if (reducedMotionQuery.matches) {
                revealElements.forEach(element => {
                    element.classList.add('reveal-on-scroll', 'is-visible');
                });
                return;
            }

            observer = new IntersectionObserver((entries, currentObserver) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add('is-visible');
                    currentObserver.unobserve(entry.target);
                });
            }, {
                threshold: 0.14,
                rootMargin: '0px 0px -56px 0px'
            });

            revealElements.forEach((element, index) => {
                const delay = element.classList.contains('program-card')
                    ? Number.parseFloat(element.style.getPropertyValue('--reveal-delay')) || 0
                    : (index % 4) * 70;
                observe(element, delay);
            });
        }

        return {
            observe,
            setup
        };
    }

    function setupSmoothAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (!href || href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    function setupBackToTop({ reducedMotionQuery, threshold = 620 }) {
        const button = document.querySelector('.back-to-top');
        if (!button) return;

        const updateVisibility = () => {
            button.classList.toggle('is-visible', window.scrollY > threshold);
        };

        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: reducedMotionQuery.matches ? 'auto' : 'smooth'
            });
        });

        window.addEventListener('scroll', updateVisibility, { passive: true });
        updateVisibility();
    }

    window.ITTSU_EFFECTS = {
        createRevealController,
        setupSmoothAnchors,
        setupBackToTop
    };
})();
