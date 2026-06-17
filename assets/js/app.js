(() => {
    const siteConfig = window.ITTSU_SITE_CONFIG || {};
    const {
        createRevealController,
        setupSmoothAnchors,
        setupBackToTop
    } = window.ITTSU_EFFECTS || {};
    const { setupHeroSlideshow } = window.ITTSU_HERO || {};
    const { createProgramModal } = window.ITTSU_MODAL || {};
    const { createProgramsController } = window.ITTSU_PROGRAMS_UI || {};
    const programs = window.ITTSU_PROGRAMS || [];
    const metrikaCounterId = 109911928;
    const cookieConsentStorageKey = 'miit_cookie_consent';

    function reachMetrikaGoal(goalName, params) {
        if (!goalName) return;

        const counter = window[`yaCounter${metrikaCounterId}`];

        if (counter && typeof counter.reachGoal === 'function') {
            counter.reachGoal(goalName, params);
            return;
        }

        if (typeof window.ym === 'function') {
            if (params) {
                window.ym(metrikaCounterId, 'reachGoal', goalName, params);
            } else {
                window.ym(metrikaCounterId, 'reachGoal', goalName);
            }
        }
    }

    function getProgramAnalyticsCategory(program) {
        if (program.level === 'bachelor' || program.foreignOnly === true) {
            return 'бакалавриат для иностранцев';
        }

        const categories = {
            basic: 'высшее базовое',
            specialized: 'высшее специализированное'
        };

        return categories[program.level] || String(program.levelName || program.level || '').trim().toLowerCase();
    }

    function getProgramAnalyticsPrefix(program) {
        const prefixes = {
            'высшее базовое': 'vysshee_bazovoe',
            'высшее специализированное': 'vysshee_specializirovannoe',
            'бакалавриат для иностранцев': 'bakalavriat_dlya_inostrantsev'
        };

        return prefixes[getProgramAnalyticsCategory(program)] || 'program';
    }

    function slugify(value) {
        const letters = {
            а: 'a',
            б: 'b',
            в: 'v',
            г: 'g',
            д: 'd',
            е: 'e',
            ё: 'e',
            ж: 'zh',
            з: 'z',
            и: 'i',
            й: 'i',
            к: 'k',
            л: 'l',
            м: 'm',
            н: 'n',
            о: 'o',
            п: 'p',
            р: 'r',
            с: 's',
            т: 't',
            у: 'u',
            ф: 'f',
            х: 'h',
            ц: 'c',
            ч: 'ch',
            ш: 'sh',
            щ: 'sch',
            ъ: '',
            ы: 'y',
            ь: '',
            э: 'e',
            ю: 'yu',
            я: 'ya'
        };

        return String(value)
            .trim()
            .toLowerCase()
            .split('')
            .map(char => letters[char] ?? char)
            .join('')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/_{2,}/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, 80);
    }

    function getProgramAnalyticsName(program) {
        return [
            getProgramAnalyticsPrefix(program),
            program.number,
            slugify(program.title)
        ].filter(Boolean).join('_');
    }

    function trackProgramClick(program) {
        reachMetrikaGoal('program_click', {
            program_name: getProgramAnalyticsName(program),
            category: getProgramAnalyticsCategory(program)
        });
    }

    function getStoredCookieConsent() {
        try {
            return window.localStorage.getItem(cookieConsentStorageKey) === 'true';
        } catch (error) {
            return false;
        }
    }

    function storeCookieConsent() {
        try {
            window.localStorage.setItem(cookieConsentStorageKey, 'true');
        } catch (error) {
            return;
        }
    }

    function setupCookieConsent() {
        const banner = document.querySelector('[data-cookie-banner]');
        const acceptButton = banner?.querySelector('[data-cookie-accept]');

        if (!banner || !acceptButton) return;

        banner.hidden = getStoredCookieConsent();

        acceptButton.addEventListener('click', () => {
            storeCookieConsent();
            banner.hidden = true;
        });
    }

    function getContactScope(link) {
        const contactBlock = link.closest('[data-contact-type]');
        const contactType = contactBlock?.getAttribute('data-contact-type');

        if (contactType === 'consultant') return 'consult';
        if (contactType === 'admissions') return 'main';

        const href = (link.getAttribute('href') || '').toLowerCase();

        if (href.includes('ittsu@rut-miit.ru') || href.includes('+79168833483')) {
            return 'consult';
        }

        return 'main';
    }

    function getLinkMetrikaGoal(link) {
        const explicitGoal = link.getAttribute('data-metrika-goal');

        if (explicitGoal) return explicitGoal;

        const href = link.getAttribute('href') || '';
        const normalizedHref = href.replace(/\/$/, '');

        if (normalizedHref === 'https://www.miit.ru/admissions/office') {
            return 'admissions_office_click';
        }

        if (href.includes('tel:')) {
            return getContactScope(link) === 'consult' ? 'phone_consult_click' : 'phone_main_click';
        }

        if (href.includes('mailto:')) {
            return getContactScope(link) === 'consult' ? 'email_consult_click' : 'email_main_click';
        }

        return '';
    }

    function setupMetrikaGoalTracking() {
        document.addEventListener('click', event => {
            const link = event.target.closest('a');

            if (!link) return;

            reachMetrikaGoal(getLinkMetrikaGoal(link));
        });
    }

    window.ITTSU_ANALYTICS = {
        reachGoal: reachMetrikaGoal,
        trackProgramClick,
        getProgramAnalyticsName,
        getProgramAnalyticsCategory
    };

    const mobileProgramsQuery = window.matchMedia(siteConfig.mobileProgramsMedia || '(max-width: 768px)');
    const reducedMotionQuery = window.matchMedia(siteConfig.reducedMotionMedia || '(prefers-reduced-motion: reduce)');
    const heroSlideSizes = siteConfig.heroSlideSizes || '(max-width: 768px) calc(100vw - 32px), (min-width: 1640px) 1548px, calc(100vw - 88px)';
    const programImageSizes = siteConfig.programImageSizes || {};
    const foreignProgramNote = siteConfig.foreignProgramNote || 'Места для приема иностранных граждан и лиц без гражданства';
    const mobileProgramInitialLimits = siteConfig.mobileProgramInitialLimits || {};
    const desktopHeroSlides = siteConfig.desktopHeroSlides || [];
    const mobileHeroSlides = siteConfig.mobileHeroSlides || [];
    const revealController = createRevealController(reducedMotionQuery);
    const programModal = createProgramModal({ programImageSizes });
    const programsController = createProgramsController({
        programs,
        mobileProgramsQuery,
        mobileProgramInitialLimits,
        programImageSizes,
        foreignProgramNote,
        revealController,
        openProgram: programModal.open
    });

    function setupScrollReveal() {
        revealController.setup([
            '.programs-header',
            '.program-card',
            '.apply-heading',
            '.apply-route',
            '.footer-contact-card',
            '.footer-map-card',
            '.site-footer-panel'
        ]);
    }

    function refreshHeroSlideshow() {
        setupHeroSlideshow({
            isMobile: mobileProgramsQuery.matches,
            reducedMotion: reducedMotionQuery.matches,
            heroSlideSizes,
            desktopHeroSlides,
            mobileHeroSlides
        });
    }

    function handleProgramsViewportChange() {
        programsController.resetMobileProgramLimits();
        refreshHeroSlideshow();
        programsController.renderLastFilteredPrograms();
    }

    programsController.setupFilters();
    programModal.setupControls();
    refreshHeroSlideshow();
    programsController.renderInitial();
    setupScrollReveal();
    setupSmoothAnchors();
    setupBackToTop({ reducedMotionQuery });
    setupCookieConsent();
    setupMetrikaGoalTracking();

    if (mobileProgramsQuery.addEventListener) {
        mobileProgramsQuery.addEventListener('change', handleProgramsViewportChange);
    } else {
        mobileProgramsQuery.addListener(handleProgramsViewportChange);
    }

    programModal.setupKeyboardClose();
})();
