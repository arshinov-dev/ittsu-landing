(() => {
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderList(items, itemClass = '') {
    return items.map(item => `<li class="${itemClass}">${escapeHtml(item)}</li>`).join('');
}

function formatTitleHtml(value) {
    return escapeHtml(value).replace(/-/g, '&#8209;');
}

function formatSpecialtyTitle(value) {
    return String(value).trim();
}

function isForeignProgram(program) {
    return program.foreignOnly === true;
}

function getProgramImage(program, kind, width) {
    return `assets/img/programs/${program.number}-${kind}-${width}.jpg`;
}

function getProgramImageSrcset(program, kind, widths) {
    return widths
        .map(width => `${getProgramImage(program, kind, width)} ${width}w`)
        .join(', ');
}

function getPlacesBreakdown(program) {
    const categories = (String(program.placesLabel || '').match(/\(([^)]+)\)/)?.[1] || 'места')
        .split('/')
        .map(item => item.trim());
    const values = String(program.places || '').split('/').map(item => item.trim());

    return categories.map((category, index) => ({
        category,
        value: values[index] || '0'
    }));
}

function renderModalLines(lines) {
    return lines
        .map(line => `<span class="modal-text-line">${escapeHtml(line)}</span>`)
        .join('');
}

function getExamLines(value) {
    const exams = String(value).trim();

    if (exams === 'Внутренние вступительные испытания') {
        return ['Внутренние', 'вступительные', 'испытания'];
    }

    if (exams === 'Русский язык, Математика, Физика или Информатика') {
        return ['Русский язык,', 'Математика,', 'Физика или', 'Информатика'];
    }

    if (exams === 'Русский язык, Математика, Ин. язык или Обществознание') {
        return ['Русский язык,', 'Математика,', 'Ин. язык или', 'Обществознание'];
    }

    return exams
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
}

function getLevelLines(program) {
    if (program.level === 'specialized') {
        return ['специа-', 'лизированное', 'высшее', 'образование'];
    }

    if (program.level === 'basic') {
        return ['высшее', 'образование', '(базовое)'];
    }

    return [String(program.levelName || program.levelShortName).trim().toLowerCase()];
}

function getFormLines(value) {
    const form = String(value).trim();

    if (form === 'очно-заочная') {
        return ['очно-', 'заочная'];
    }

    return [form];
}

function renderPlacesSummary(program) {
    const places = getPlacesBreakdown(program);
    const categories = places.map(place => escapeHtml(place.category)).join('/');
    const categoryItems = places
        .map((place, index) => `
            <span class="modal-places-category">
                ${escapeHtml(place.category)}${index < places.length - 1 ? '/' : ''}
            </span>
        `)
        .join('');
    const valueItems = places.map(place => place.value).join('/');

    return `
        <div class="modal-info-label modal-places-heading">
            <span class="modal-text-line">места</span>
            <span class="modal-places-categories" aria-label="${categories}">${categoryItems}</span>
        </div>
        <div class="modal-info-value modal-places-values modal-places-count-${places.length}">
            <span class="modal-text-line">${escapeHtml(valueItems)}</span>
        </div>
    `;
}

function getProfessionsClass(program) {
    return `professions-count-${program.professions.length}`;
}

function needsCoverEdgeCrop(program) {
    return ['15', '24'].includes(String(program.number));
}

window.ITTSU_UTILS = {
    escapeHtml,
    renderList,
    formatTitleHtml,
    formatSpecialtyTitle,
    isForeignProgram,
    getProgramImage,
    getProgramImageSrcset,
    renderModalLines,
    getExamLines,
    getLevelLines,
    getFormLines,
    renderPlacesSummary,
    getProfessionsClass,
    needsCoverEdgeCrop
};
})();
