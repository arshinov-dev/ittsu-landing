(() => {
    const {
        escapeHtml,
        renderList,
        formatTitleHtml,
        formatSpecialtyTitle,
        getProgramImage,
        getProgramImageSrcset,
        renderModalLines,
        getExamLines,
        getLevelLines,
        getFormLines,
        renderPlacesSummary,
        getProfessionsClass,
        needsCoverEdgeCrop
    } = window.IZHT_UTILS || {};

    function createProgramModal({ programImageSizes }) {
        const focusableSelector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(',');
        let triggerElement = null;
        let previousBodyOverflow = '';

        function getFocusableElements() {
            const modalContent = document.getElementById('modalContent');
            if (!modalContent) return [];

            return Array.from(modalContent.querySelectorAll(focusableSelector))
                .filter(element => element.offsetParent !== null || element === document.activeElement);
        }

        function focusCloseButton() {
            const closeButton = document.querySelector('.modal-close');
            closeButton?.focus({ preventScroll: true });
        }

        function restoreTriggerFocus() {
            if (triggerElement && document.contains(triggerElement)) {
                triggerElement.focus({ preventScroll: true });
            }
            triggerElement = null;
        }

        function isOpen() {
            return document.getElementById('modalOverlay')?.classList.contains('active') || false;
        }

        function open(program, trigger = document.activeElement) {
            const modal = document.getElementById('modalOverlay');
            const modalBody = document.getElementById('modalBody');
            const aboutImageEdgeCropClass = needsCoverEdgeCrop(program) ? ' modal-about-image--edge-crop' : '';
            triggerElement = trigger instanceof HTMLElement ? trigger : document.activeElement;
            previousBodyOverflow = document.body.style.overflow;

            modalBody.innerHTML = `
                <div class="modal-layout">
                    <section class="modal-left">
                        <div class="modal-hero">
                            <div class="modal-hero-title" id="modalTitle">${formatTitleHtml(program.title)}</div>
                            <div class="modal-hero-subtitle">${escapeHtml(program.code)} ${escapeHtml(formatSpecialtyTitle(program.specialtyTitle))}</div>
                        </div>

                        <div class="modal-info-bar">
                            <div class="info-cell info-cell-exams">
                                <div class="modal-info-label">${renderModalLines(['вступительные', 'испытания'])}</div>
                                <div class="modal-info-value">${renderModalLines(getExamLines(program.exams))}</div>
                            </div>
                            <div class="info-cell">
                                <div class="modal-info-label">${renderModalLines(['срок', 'обучения'])}</div>
                                <div class="modal-info-value">${renderModalLines([program.duration])}</div>
                            </div>
                            <div class="info-cell info-cell-places">
                                ${renderPlacesSummary(program)}
                            </div>
                            <div class="info-cell">
                                <div class="modal-info-label">${renderModalLines(['форма', 'обучения'])}</div>
                                <div class="modal-info-value">${renderModalLines(getFormLines(program.formName))}</div>
                            </div>
                            <div class="info-cell info-cell-level">
                                <div class="modal-info-label">${renderModalLines(['уровень', 'образования'])}</div>
                                <div class="modal-info-value">${renderModalLines(getLevelLines(program))}</div>
                            </div>
                        </div>

                        <h3 class="modal-section-title">О профессии</h3>
                        <div class="modal-about-text">
                            <p>${escapeHtml(program.about)}</p>
                        </div>
                        <div class="modal-about-image${aboutImageEdgeCropClass}">
                            <img
                                src="${escapeHtml(getProgramImage(program, 'cover', 640))}"
                                srcset="${escapeHtml(getProgramImageSrcset(program, 'cover', [640, 1200]))}"
                                sizes="${escapeHtml(programImageSizes.modalCover)}"
                                alt="${escapeHtml(program.title)}"
                                loading="lazy"
                                decoding="async"
                            >
                        </div>
                    </section>

                    <section class="modal-right">
                        <div class="modal-section-bar">осваиваемые профессии</div>
                        <div class="modal-professions ${getProfessionsClass(program)}">
                            <img
                                src="${escapeHtml(getProgramImage(program, 'professions', 900))}"
                                srcset="${escapeHtml(getProgramImageSrcset(program, 'professions', [900, 1400]))}"
                                sizes="${escapeHtml(programImageSizes.professions)}"
                                alt="осваиваемые профессии: ${escapeHtml(program.title)}"
                                loading="lazy"
                                decoding="async"
                            >
                            <div class="modal-professions-tags">
                                ${program.professions.map(prof => `<span class="modal-profession-tag">${escapeHtml(prof)}</span>`).join('')}
                            </div>
                        </div>

                        <div class="modal-section-bar">изучаемые дисциплины</div>
                        <div class="modal-disciplines-grid">
                            ${program.disciplines.map((disc, i) => `
                                <div class="modal-discipline-item">
                                    <div class="modal-discipline-number">${i + 1}</div>
                                    <div>${escapeHtml(disc)}</div>
                                </div>
                            `).join('')}
                        </div>

                        <div class="modal-section-bar">компетенции выпускника</div>
                        <ul class="modal-competencies">
                            ${renderList(program.competencies)}
                        </ul>
                    </section>
                </div>
            `;

            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(focusCloseButton);
        }

        function close(event) {
            if (event && event.target !== event.currentTarget) return;
            if (!isOpen()) return;

            const modal = document.getElementById('modalOverlay');
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = previousBodyOverflow;
            restoreTriggerFocus();
        }

        function trapFocus(event) {
            if (!isOpen() || event.key !== 'Tab') return;

            const focusableElements = getFocusableElements();
            if (!focusableElements.length) {
                event.preventDefault();
                focusCloseButton();
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }

        function setupControls() {
            document.getElementById('modalOverlay')?.addEventListener('click', close);
            document.querySelector('.modal-close')?.addEventListener('click', () => close());
        }

        function setupKeyboardClose() {
            document.addEventListener('keydown', event => {
                if (event.key === 'Escape') {
                    close();
                    return;
                }

                trapFocus(event);
            });
        }

        return {
            open,
            close,
            setupControls,
            setupKeyboardClose
        };
    }

    window.IZHT_MODAL = {
        createProgramModal
    };
})();
