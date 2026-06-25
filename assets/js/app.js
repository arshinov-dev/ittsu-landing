(() => {
    const siteConfig = window.IZHT_SITE_CONFIG || {};
    const {
        createRevealController,
        setupSmoothAnchors,
        setupBackToTop
    } = window.IZHT_EFFECTS || {};
    const { setupHeroSlideshow } = window.IZHT_HERO || {};
    const { createProgramModal } = window.IZHT_MODAL || {};
    const { createProgramsController } = window.IZHT_PROGRAMS_UI || {};
    const programs = window.IZHT_PROGRAMS || [];
    const metrikaCounterId = 109911928;
    const cookieConsentStorageKey = 'miit_cookie_consent';
    const programSearchTrackingDelay = 700;
    const viewedSections = new Set();
    let programSearchTrackingTimer = 0;
    let lastTrackedProgramSearch = '';

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

        if (normalizedHref === 'https://www.rut-miit.ru') {
            return 'institute_site_click';
        }

        if (normalizedHref === 'https://www.gosuslugi.ru') {
            return 'gosuslugi_click';
        }

        if (href.includes('tel:')) {
            return getContactScope(link) === 'consult' ? 'phone_consult_click' : 'phone_main_click';
        }

        if (href.includes('mailto:')) {
            return getContactScope(link) === 'consult' ? 'email_consult_click' : 'email_main_click';
        }

        return '';
    }

    function getSelectedOptionText(select) {
        return select?.selectedOptions?.[0]?.textContent?.trim() || '';
    }

    function getProgramFilterParams(changedFilter) {
        const levelSelect = document.getElementById('levelFilterSelect');
        const formSelect = document.getElementById('formFilterSelect');

        return {
            changed_filter: changedFilter,
            level: levelSelect?.value || 'all',
            level_label: getSelectedOptionText(levelSelect),
            form: formSelect?.value || 'all',
            form_label: getSelectedOptionText(formSelect)
        };
    }

    function getSectionAnalyticsName(sectionId) {
        return String(sectionId).replace(/-/g, '_');
    }

    function setupMetrikaGoalTracking() {
        document.addEventListener('click', event => {
            const link = event.target.closest('a');
            const explicitGoalElement = event.target.closest('button[data-metrika-goal]');
            const loadMoreButton = event.target.closest('.programs-load-more');

            if (link) {
                reachMetrikaGoal(getLinkMetrikaGoal(link));
            }

            if (explicitGoalElement) {
                reachMetrikaGoal(explicitGoalElement.getAttribute('data-metrika-goal'));
            }

            if (loadMoreButton) {
                const remainingCount = Number((loadMoreButton.textContent || '').match(/\d+/)?.[0] || 0);
                reachMetrikaGoal('programs_load_more_click', {
                    remaining_count: remainingCount,
                    program_group: loadMoreButton.getAttribute('data-program-group') || ''
                });
            }
        });
    }

    function setupProgramSearchTracking() {
        const searchInput = document.getElementById('searchInput');

        if (!searchInput) return;

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();

            window.clearTimeout(programSearchTrackingTimer);

            if (query.length < 2) return;

            programSearchTrackingTimer = window.setTimeout(() => {
                if (query === lastTrackedProgramSearch) return;

                lastTrackedProgramSearch = query;
                reachMetrikaGoal('program_search_used', { query });
            }, programSearchTrackingDelay);
        });
    }

    function setupProgramFilterTracking() {
        document.getElementById('levelFilterSelect')?.addEventListener('change', () => {
            reachMetrikaGoal('program_filter_change', getProgramFilterParams('level'));
        });
        document.getElementById('formFilterSelect')?.addEventListener('change', () => {
            reachMetrikaGoal('program_filter_change', getProgramFilterParams('form'));
        });
    }

    function setupSectionViewTracking() {
        if (!('IntersectionObserver' in window)) return;

        const sections = ['programs', 'how-to-apply', 'contacts']
            .map(id => document.getElementById(id))
            .filter(Boolean);

        if (!sections.length) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const section = getSectionAnalyticsName(entry.target.id);
                if (viewedSections.has(section)) return;

                viewedSections.add(section);
                reachMetrikaGoal('section_view', { section });
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.35
        });

        sections.forEach(section => observer.observe(section));
    }

    window.IZHT_ANALYTICS = {
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
    setupProgramSearchTracking();
    setupProgramFilterTracking();
    setupSectionViewTracking();

    if (mobileProgramsQuery.addEventListener) {
        mobileProgramsQuery.addEventListener('change', handleProgramsViewportChange);
    } else {
        mobileProgramsQuery.addListener(handleProgramsViewportChange);
    }

    programModal.setupKeyboardClose();
})();
