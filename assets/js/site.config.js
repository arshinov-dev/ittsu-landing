window.IZHT_SITE_CONFIG = {
    mobileProgramsMedia: '(max-width: 768px)',
    reducedMotionMedia: '(prefers-reduced-motion: reduce)',
    heroSlideSizes: '(max-width: 768px) calc(100vw - 32px), (min-width: 1640px) 1548px, calc(100vw - 88px)',
    programImageSizes: {
        cover: '(max-width: 768px) calc(100vw - 32px), 420px',
        modalCover: '(max-width: 768px) calc(100vw - 56px), 520px',
        professions: '(max-width: 768px) calc(100vw - 56px), 760px'
    },
    foreignProgramNote: 'Места для приема иностранных граждан и лиц без гражданства',
    mobileProgramInitialLimits: {
        basic: 3,
        specialized: 3,
        bachelor: 2
    },
    desktopHeroSlides: [
        ...[
            'hero-15',
            'hero-25',
            'hero-01',
            'hero-02',
            'hero-03',
            'hero-04',
            'hero-05',
            'hero-06',
            'hero-07',
            'hero-08',
            'hero-09',
            'hero-10',
            'hero-11',
            'hero-12',
            'hero-13',
            'hero-14',
            'hero-16',
            'hero-17',
            'hero-18',
            'hero-19',
            'hero-20',
            'hero-21',
            'hero-22',
            'hero-23',
            'hero-24'
        ].map(name => ({
            src: `assets/img/hero/desktop/${name}-1800.jpg`,
            srcset: `assets/img/hero/desktop/${name}-900.jpg 900w, assets/img/hero/desktop/${name}-1800.jpg 1800w`
        }))
    ],
    mobileHeroSlides: [
        'p15',
        'p1',
        'p14',
        'p19',
        'p20',
        'p21',
        'p22',
        'p23',
        'p24',
        'p25',
        'p18',
        'p17',
        'p16',
        'p13',
        'p12',
        'p11',
        'p10',
        'p9',
        'p8',
        'p7',
        'p6',
        'p5',
        'p4',
        'p3',
        'p2'
    ].map(name => ({
        src: `assets/img/hero/mobile/${name}-1200.jpg`,
        srcset: `assets/img/hero/mobile/${name}-900.jpg 900w, assets/img/hero/mobile/${name}-1200.jpg 1200w, assets/img/hero/mobile/${name}-1800.jpg 1800w`
    }))
};
