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

    if (mobileProgramsQuery.addEventListener) {
        mobileProgramsQuery.addEventListener('change', handleProgramsViewportChange);
    } else {
        mobileProgramsQuery.addListener(handleProgramsViewportChange);
    }

    programModal.setupKeyboardClose();
})();
