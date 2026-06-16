(() => {
    const {
        escapeHtml,
        formatSpecialtyTitle,
        isForeignProgram,
        getProgramImage,
        getProgramImageSrcset,
        needsCoverEdgeCrop
    } = window.ITTSU_UTILS || {};

    function createProgramsController({
        programs,
        mobileProgramsQuery,
        mobileProgramInitialLimits,
        programImageSizes,
        foreignProgramNote,
        revealController,
        openProgram
    }) {
        let currentLevelFilter = 'all';
        let currentFormFilter = 'all';
        let isMobileProgramsExpanded = false;
        let lastFilteredPrograms = programs;

        function createProgramCard(program, index) {
            const card = document.createElement('div');
            const revealDelay = Math.min(index, 6) * 35;
            const foreignLevelTag = isForeignProgram(program)
                ? `<span>${escapeHtml(program.levelShortName.toLowerCase())}</span>`
                : '';
            const foreignNote = isForeignProgram(program)
                ? `<p class="program-foreign-note">${escapeHtml(foreignProgramNote)}</p>`
                : '';
            const coverEdgeCropClass = needsCoverEdgeCrop(program) ? ' program-image--edge-crop' : '';

            card.className = 'program-card';
            card.style.setProperty('--reveal-delay', `${revealDelay}ms`);
            card.addEventListener('click', event => {
                openProgram(program, event.target.closest('button') || card);
            });

            card.innerHTML = `
                <div class="program-image${coverEdgeCropClass}">
                    <img
                        src="${escapeHtml(getProgramImage(program, 'cover', 640))}"
                        srcset="${escapeHtml(getProgramImageSrcset(program, 'cover', [640, 1200]))}"
                        sizes="${escapeHtml(programImageSizes.cover)}"
                        alt="${escapeHtml(program.title)}"
                        loading="lazy"
                        decoding="async"
                    >
                    <div class="program-image-tags" aria-label="Срок и форма обучения">
                        <span>${escapeHtml(program.duration)}</span>
                        <span>${escapeHtml(program.formName)}</span>
                        ${foreignLevelTag}
                    </div>
                </div>
                <div class="program-content">
                    <div class="program-code">
                        <span class="program-code-value">${escapeHtml(program.code)}</span>
                        <span class="program-direction">${escapeHtml(formatSpecialtyTitle(program.specialtyTitle))}</span>
                    </div>
                    <h3 class="program-title">${escapeHtml(program.title)}</h3>
                    ${foreignNote}
                    <button class="program-btn" type="button" aria-label="Подробнее о программе ${escapeHtml(program.title)}">Подробнее</button>
                </div>
            `;

            revealController.observe(card, revealDelay);
            return card;
        }

        function appendProgramGroup(container, title, groupPrograms, options = {}) {
            if (!groupPrograms.length) return;

            const section = document.createElement('section');

            section.className = ['program-group', options.className].filter(Boolean).join(' ');
            section.innerHTML = `
                <h3 class="program-group-title">${escapeHtml(title)}</h3>
                <div class="program-group-grid"></div>
            `;

            const groupGrid = section.querySelector('.program-group-grid');
            groupPrograms.forEach((program, index) => {
                groupGrid.appendChild(createProgramCard(program, (options.offset || 0) + index));
            });

            container.appendChild(section);
        }

        function appendMobileProgramsAction(container, remainingCount) {
            if (remainingCount <= 0) return;

            const actions = document.createElement('div');
            actions.className = 'program-group-actions programs-global-actions';
            actions.innerHTML = `
                <button class="programs-load-more" type="button">
                    Показать все программы (${remainingCount})
                </button>
            `;
            actions.querySelector('.programs-load-more')?.addEventListener('click', showAllPrograms);
            container.appendChild(actions);
        }

        function render(programsToRender) {
            const grid = document.getElementById('programsGrid');
            grid.innerHTML = '';
            lastFilteredPrograms = programsToRender;

            const foreignPrograms = programsToRender.filter(isForeignProgram);
            const regularPrograms = programsToRender.filter(program => !isForeignProgram(program));
            const shouldLimitPrograms = mobileProgramsQuery.matches && !isMobileProgramsExpanded;
            const programGroups = [
                { level: 'basic', title: 'Высшее образование' },
                { level: 'specialized', title: 'Специализированное высшее образование' },
                { level: 'bachelor', title: 'Бакалавриат' }
            ];

            let renderedRegularCount = 0;
            let totalHiddenCount = 0;
            programGroups.forEach(group => {
                const groupPrograms = regularPrograms.filter(program => program.level === group.level);
                const groupLimit = mobileProgramInitialLimits[group.level] || groupPrograms.length;
                const visibleGroupPrograms = shouldLimitPrograms
                    ? groupPrograms.slice(0, groupLimit)
                    : groupPrograms;
                totalHiddenCount += Math.max(groupPrograms.length - visibleGroupPrograms.length, 0);

                appendProgramGroup(grid, group.title, visibleGroupPrograms, {
                    level: group.level,
                    offset: renderedRegularCount
                });
                renderedRegularCount += visibleGroupPrograms.length;
            });

            const foreignLimit = mobileProgramInitialLimits.bachelor;
            const visibleForeignPrograms = shouldLimitPrograms
                ? foreignPrograms.slice(0, foreignLimit)
                : foreignPrograms;
            totalHiddenCount += Math.max(foreignPrograms.length - visibleForeignPrograms.length, 0);

            appendProgramGroup(grid, 'Образовательные программы для иностранных граждан', visibleForeignPrograms, {
                className: 'program-foreign-section',
                offset: renderedRegularCount
            });

            appendMobileProgramsAction(grid, shouldLimitPrograms ? totalHiddenCount : 0);

            if (!regularPrograms.length && !foreignPrograms.length) {
                grid.innerHTML = '<p class="programs-empty">По выбранным фильтрам программы не найдены.</p>';
            }
        }

        function resetMobileProgramLimits() {
            isMobileProgramsExpanded = false;
        }

        function renderLastFilteredPrograms() {
            render(lastFilteredPrograms);
        }

        function showAllPrograms() {
            isMobileProgramsExpanded = true;
            render(lastFilteredPrograms);
        }

        function filterByLevel(level) {
            currentLevelFilter = level;
            resetMobileProgramLimits();

            const levelSelect = document.getElementById('levelFilterSelect');
            if (levelSelect && levelSelect.value !== level) {
                levelSelect.value = level;
            }

            filterPrograms();
        }

        function filterByForm(form) {
            currentFormFilter = form;
            resetMobileProgramLimits();

            const formSelect = document.getElementById('formFilterSelect');
            if (formSelect && formSelect.value !== form) {
                formSelect.value = form;
            }

            filterPrograms();
        }

        function filterPrograms() {
            const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
            resetMobileProgramLimits();

            const filtered = programs.filter(program => {
                const searchHaystack = [
                    program.number,
                    program.code,
                    program.title,
                    program.specialtyTitle,
                    program.levelName,
                    program.formName
                ].join(' ').toLowerCase();
                const matchesLevel = currentLevelFilter === 'all' || program.level === currentLevelFilter;
                const matchesForm = currentFormFilter === 'all' || program.form === currentFormFilter;
                const matchesSearch = !searchTerm || searchHaystack.includes(searchTerm);

                return matchesLevel && matchesForm && matchesSearch;
            });

            render(filtered);
        }

        function setupFilters() {
            document.getElementById('searchInput')?.addEventListener('input', filterPrograms);
            document.getElementById('levelFilterSelect')?.addEventListener('change', event => {
                filterByLevel(event.target.value);
            });
            document.getElementById('formFilterSelect')?.addEventListener('change', event => {
                filterByForm(event.target.value);
            });
        }

        return {
            renderInitial: () => render(programs),
            renderLastFilteredPrograms,
            resetMobileProgramLimits,
            setupFilters
        };
    }

    window.ITTSU_PROGRAMS_UI = {
        createProgramsController
    };
})();
