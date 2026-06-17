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
        let isMobileBasicProgramsExpanded = false;
        let isMobileSpecializedProgramsExpanded = false;
        let lastFilteredPrograms = programs;

        function createProgramCard(program, index) {
            const card = document.createElement('div');
            const analytics = window.ITTSU_ANALYTICS || {};
            const programName = analytics.getProgramAnalyticsName?.(program) || `program_${program.number}`;
            const programCategory = analytics.getProgramAnalyticsCategory?.(program) || program.levelName || program.level;
            const revealDelay = Math.min(index, 6) * 35;
            const foreignLevelTag = isForeignProgram(program)
                ? `<span>${escapeHtml(program.levelShortName.toLowerCase())}</span>`
                : '';
            const foreignNote = isForeignProgram(program)
                ? `<p class="program-foreign-note">${escapeHtml(foreignProgramNote)}</p>`
                : '';
            const coverEdgeCropClass = needsCoverEdgeCrop(program) ? ' program-image--edge-crop' : '';
            const programDetailsLabel = `Подробнее о программе ${program.code} ${formatSpecialtyTitle(program.specialtyTitle)}: ${program.title}`;

            card.className = 'program-card';
            card.dataset.programName = programName;
            card.dataset.programCategory = programCategory;
            card.style.setProperty('--reveal-delay', `${revealDelay}ms`);
            card.addEventListener('click', event => {
                window.ITTSU_ANALYTICS?.trackProgramClick?.(program);
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
                    <button class="program-btn" type="button" aria-label="${escapeHtml(programDetailsLabel)}" title="${escapeHtml(programDetailsLabel)}">Подробнее</button>
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

        function appendMobileProgramsAction(container, remainingCount, onClick) {
            if (remainingCount <= 0) return;

            const actions = document.createElement('div');
            actions.className = 'program-group-actions programs-global-actions';
            actions.innerHTML = `
                <button class="programs-load-more" type="button">
                    Показать все программы (${remainingCount})
                </button>
            `;
            actions.querySelector('.programs-load-more')?.addEventListener('click', onClick);
            container.appendChild(actions);
        }

        function getProgramBuckets(programsToRender) {
            const foreignPrograms = programsToRender.filter(isForeignProgram);
            const regularPrograms = programsToRender.filter(program => !isForeignProgram(program));

            return {
                foreignPrograms,
                regularPrograms,
                basicPrograms: regularPrograms.filter(program => program.level === 'basic'),
                specializedPrograms: regularPrograms.filter(program => program.level === 'specialized'),
                bachelorPrograms: regularPrograms.filter(program => program.level === 'bachelor')
            };
        }

        function renderDesktopPrograms(grid, buckets) {
            const programGroups = [
                { level: 'basic', title: 'Высшее образование', programs: buckets.basicPrograms },
                { level: 'specialized', title: 'Специализированное высшее образование', programs: buckets.specializedPrograms },
                { level: 'bachelor', title: 'Бакалавриат', programs: buckets.bachelorPrograms }
            ];

            let renderedRegularCount = 0;
            programGroups.forEach(group => {
                appendProgramGroup(grid, group.title, group.programs, {
                    level: group.level,
                    offset: renderedRegularCount
                });
                renderedRegularCount += group.programs.length;
            });

            appendProgramGroup(grid, 'Образовательные программы для иностранных граждан', buckets.foreignPrograms, {
                className: 'program-foreign-section',
                offset: renderedRegularCount
            });
        }

        function renderMobilePrograms(grid, buckets) {
            const basicLimit = mobileProgramInitialLimits.basic || buckets.basicPrograms.length;
            const specializedLimit = mobileProgramInitialLimits.specialized || buckets.specializedPrograms.length;
            const visibleBasicPrograms = isMobileBasicProgramsExpanded
                ? buckets.basicPrograms
                : buckets.basicPrograms.slice(0, basicLimit);
            const visibleSpecializedPrograms = isMobileSpecializedProgramsExpanded
                ? buckets.specializedPrograms
                : buckets.specializedPrograms.slice(0, specializedLimit);
            const shouldHideForeignPrograms = !isMobileBasicProgramsExpanded && buckets.basicPrograms.length > 0;
            const hiddenBasicCount = Math.max(buckets.basicPrograms.length - visibleBasicPrograms.length, 0);
            const hiddenForeignCount = shouldHideForeignPrograms ? buckets.foreignPrograms.length : 0;
            const hiddenSpecializedCount = Math.max(buckets.specializedPrograms.length - visibleSpecializedPrograms.length, 0);
            let renderedCount = 0;

            appendProgramGroup(grid, 'Высшее образование', visibleBasicPrograms, {
                level: 'basic',
                offset: renderedCount
            });
            renderedCount += visibleBasicPrograms.length;

            appendMobileProgramsAction(grid, hiddenBasicCount + hiddenForeignCount, showBasicPrograms);

            if (!shouldHideForeignPrograms) {
                appendProgramGroup(grid, 'Образовательные программы для иностранных граждан', buckets.foreignPrograms, {
                    className: 'program-foreign-section',
                    offset: renderedCount
                });
                renderedCount += buckets.foreignPrograms.length;
            }

            appendProgramGroup(grid, 'Специализированное высшее образование', visibleSpecializedPrograms, {
                level: 'specialized',
                offset: renderedCount
            });
            renderedCount += visibleSpecializedPrograms.length;

            appendMobileProgramsAction(grid, hiddenSpecializedCount, showSpecializedPrograms);
        }

        function render(programsToRender) {
            const grid = document.getElementById('programsGrid');
            grid.innerHTML = '';
            lastFilteredPrograms = programsToRender;

            const buckets = getProgramBuckets(programsToRender);

            if (mobileProgramsQuery.matches) {
                renderMobilePrograms(grid, buckets);
            } else {
                renderDesktopPrograms(grid, buckets);
            }

            if (!buckets.regularPrograms.length && !buckets.foreignPrograms.length) {
                grid.innerHTML = '<p class="programs-empty">По выбранным фильтрам программы не найдены.</p>';
            }
        }

        function resetMobileProgramLimits() {
            isMobileBasicProgramsExpanded = false;
            isMobileSpecializedProgramsExpanded = false;
        }

        function renderLastFilteredPrograms() {
            render(lastFilteredPrograms);
        }

        function showBasicPrograms() {
            isMobileBasicProgramsExpanded = true;
            render(lastFilteredPrograms);
        }

        function showSpecializedPrograms() {
            isMobileSpecializedProgramsExpanded = true;
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
