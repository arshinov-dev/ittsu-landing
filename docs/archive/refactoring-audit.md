# Refactoring Audit: production-структура IZHT landing

Дата актуализации: 2026-06-17

Цель: привести репозиторий и код к production-виду, не ломая рабочий сайт и не меняя визуал без отдельного согласования.

Важно: визуальные проверки на этом этапе не выполняются. Пользователь отдельно попросил оставить визуальную проверку за ним.

## Текущее состояние

Проект остается простым статическим сайтом без сборщика:

- `index.html` - разметка страницы, подключение favicon, CSS, JS, iframe карты.
- `.editorconfig` - базовые правила форматирования файлов в репозитории.
- `README.md` - входная документация по структуре, запуску и проверкам.
- `package.json` - npm-скрипты для технических проверок без зависимостей.
- `assets/css/styles.css` - единая production-точка входа для стилей.
- `assets/js/site.config.js` - настройки сайта, responsive media query, размеры изображений и списки hero-слайдов.
- `assets/js/site.utils.js` - общие helper-функции форматирования, экранирования HTML и сборки путей.
- `assets/js/site.effects.js` - scroll reveal, плавные якоря и кнопка возврата наверх.
- `assets/js/hero.js` - hero-слайдер.
- `assets/js/program-modal.js` - модалка подробностей программы.
- `assets/js/programs.data.js` - данные образовательных программ.
- `assets/js/programs.js` - карточки программ, группировка, мобильное ограничение списка и фильтры.
- `assets/js/app.js` - точка инициализации модулей.
- `assets/img/` - runtime-изображения и иконки, которые нужны сайту.
- `scripts/check-assets.js` - техническая проверка локальных и динамических путей к runtime-ассетам.
- `scripts/check-markup.js` - проверка разметки на старые runtime-пути, inline-обработчики, порядок скриптов и ARIA модалки.
- `scripts/check-program-data.js` - проверка целостности данных образовательных программ.
- `scripts/check-structure.js` - проверка production-структуры, обязательных файлов и отсутствия старых папок/файлов.
- `maintenance/` - страницы 403/404/503 для Apache/ispmanager.
- `example.htaccess` - шаблон Apache-конфига; при деплое копируется в публичную папку как `.htaccess`.
- `robots.txt` - правила индексации и ссылка на sitemap.
- `sitemap.xml` - карта сайта для поисковых систем.
- `scripts/deploy-static.sh` - синхронизация только публичных файлов в публичную папку сайта.
- `scripts/audit-css.js` - аудит CSS-классов против runtime-разметки и JS.
- `docs/archive/` - архив документации и планов.

Текущий размер:

- `assets`: около 60 MB.
- `docs`: около 100 KB.
- весь проект без source-архива `update/`: около 796 MB.

## Что уже выполнено

- Документация перенесена в `docs/archive/`.
- Удалены `.DS_Store`.
- Удалены старые favicon-файлы вне актуального набора.
- Удален корневой `site.webmanifest`; актуальный manifest лежит в `assets/img/favicon/`.
- Удалены старые неиспользуемые изображения: `p26/hero-p26`, статичные `map*.jpg`, `hero-bg.jpg`, `izht-logo.png`, старые demo `program-1..4-*`.
- Удалены `images/benefit-*.jpg`, закомментированный Benefits-блок и его CSS.
- Удалены неиспользуемые mobile hero-версии `2400/3200`, которые не подключались в текущем `srcset`.
- Удален устаревший `images/README.txt`.
- Массив программ вынесен из логики в `assets/js/programs.data.js`.
- Из данных программ удалены мертвые поля `cardImage`, `aboutImage`, `professionsImage`.
- Inline-обработчики `oninput`, `onchange`, `onclick` заменены на `addEventListener`.
- Runtime-ассеты перенесены в `assets/`.
- Старые пустые runtime-папки удалены.
- Добавлен `scripts/check-assets.js` для проверки локальных ссылок, favicon manifest, hero-изображений и изображений программ.
- Добавлены `README.md` и `package.json` с командами `npm run check`, `npm run check:js`, `npm run check:assets`.
- `.gitignore` дополнен стандартными исключениями для зависимостей, build-вывода, coverage/cache и npm/yarn debug-log.
- Добавлены базовые meta description/Open Graph/Twitter-теги без визуальных изменений.
- Для модалки добавлены `role="dialog"`, `aria-modal`, `aria-labelledby` и переключение `aria-hidden`.
- Настройки сайта и списки hero-слайдов вынесены из `assets/js/app.js` в `assets/js/site.config.js`.
- Общие helper-функции вынесены из `assets/js/app.js` в `assets/js/site.utils.js`; наружу отдается только namespace `window.IZHT_UTILS`.
- `assets/js/app.js` изолирован в IIFE, чтобы его внутренние переменные не попадали в глобальный scope.
- Hero-слайдер вынесен в `assets/js/hero.js`.
- Scroll reveal, smooth anchors и back-to-top вынесены в `assets/js/site.effects.js`.
- Модалка подробностей программы вынесена в `assets/js/program-modal.js`.
- Карточки программ, группировка, мобильное раскрытие и фильтры вынесены в `assets/js/programs.js`.
- `assets/js/app.js` сокращен до orchestration-слоя.
- `scripts/check-assets.js` теперь проверяет hero-пути из `assets/js/site.config.js`, а не из отдельного дублирующего списка.
- `scripts/check-assets.js` дополнительно проверяет `url(...)` внутри подключенных CSS-файлов.
- Добавлен `.editorconfig` для единых базовых правил форматирования.
- Добавлен `scripts/check-program-data.js`, который проверяет обязательные поля, уровни/формы, уникальность номеров, массивы контента и согласованность мест.
- Добавлен `scripts/check-markup.js`, который защищает от возврата inline-обработчиков и старых путей `images/`, `script.js`, `styles.css`, `update/favicon-2/`.
- Добавлен `scripts/check-structure.js`, который защищает production-структуру от возврата `images/`, `update/`, root `script.js`, root `styles.css`, root `site.webmanifest` и `.DS_Store`.
- Добавлен `scripts/deploy-static.sh` для публикации только runtime-файлов `index.html`, `robots.txt`, `sitemap.xml`, `assets/`, `maintenance/` и `.htaccess` в публичную папку домена.
- Добавлен `scripts/check-seo.js` для проверки `robots.txt` и `sitemap.xml`.
- Добавлен `scripts/audit-css.js`; после удаления старых CSS-хвостов аудит показывает `maybeUnused=0`.
- Из CSS удалены старые неиспользуемые `.btn*`, `.container`, `.section-subtitle`, а также старые классы раскладки мест `.modal-places-grid`, `.place-*`, `.places-count-*`.
- Улучшена доступность модалки: фокус переводится на кнопку закрытия, Tab удерживается внутри модалки, после закрытия фокус возвращается на кнопку открытия.
- Кнопки `Подробнее` получили контекстный `aria-label` с названием программы.
- Добавлена инвентаризация source-архива: `docs/archive/source-assets-inventory.md`.
- Source-архив `update/` удален из production-дерева по решению владельца проекта.

## Актуальная production-структура

```text
/
  index.html
  robots.txt
  sitemap.xml
  README.md
  package.json
  example.htaccess
  maintenance/
    403.html
    404.html
    503.html
  assets/
    css/
      styles.css
    js/
      app.js
      hero.js
      program-modal.js
      programs.js
      site.config.js
      site.effects.js
      site.utils.js
      programs.data.js
    img/
      brand/
        130years-rut-ijt.svg
        max.svg
        tg.svg
        vk.svg
      favicon/
        apple-touch-icon.png
        favicon-96x96.png
        favicon.ico
        favicon.svg
        site.webmanifest
        web-app-manifest-192x192.png
        web-app-manifest-512x512.png
      hero/
        desktop/
          first-900.jpg
          first-1800.jpg
          hero-01-900.jpg
          hero-01-1800.jpg
          ...
        mobile/
          first-900.jpg
          first-1200.jpg
          first-1800.jpg
          p1-900.jpg
          p1-1200.jpg
          p1-1800.jpg
          ...
      icons/
        gos.svg
        rut.svg
      programs/
        01-cover-640.jpg
        01-cover-1200.jpg
        01-professions-900.jpg
        01-professions-1400.jpg
        ...
  scripts/
    audit-css.js
    check-assets.js
    check-markup.js
    check-program-data.js
    check-structure.js
    deploy-static.sh
  docs/
    archive/
      ai-readme.md
      plan.md
      plan2.md
      refactoring-audit.md
      source-assets-inventory.md
      style-guide.md
```

## Runtime-ассеты

### Brand/header/footer

- `assets/img/brand/130years-rut-ijt.svg`
- `assets/img/brand/max.svg`
- `assets/img/brand/tg.svg`
- `assets/img/brand/vk.svg`

### Favicon

- `assets/img/favicon/favicon-96x96.png`
- `assets/img/favicon/favicon.svg`
- `assets/img/favicon/favicon.ico`
- `assets/img/favicon/apple-touch-icon.png`
- `assets/img/favicon/site.webmanifest`
- `assets/img/favicon/web-app-manifest-192x192.png`
- `assets/img/favicon/web-app-manifest-512x512.png`

### Hero

Desktop hero:

- `assets/img/hero/desktop/first-900.jpg`
- `assets/img/hero/desktop/first-1800.jpg`
- `assets/img/hero/desktop/hero-01-900.jpg` ... `hero-25-900.jpg`
- `assets/img/hero/desktop/hero-01-1800.jpg` ... `hero-25-1800.jpg`

Mobile/tablet hero:

- `assets/img/hero/mobile/first-900.jpg`
- `assets/img/hero/mobile/first-1200.jpg`
- `assets/img/hero/mobile/first-1800.jpg`
- `assets/img/hero/mobile/p1-900.jpg` ... `p25-900.jpg`
- `assets/img/hero/mobile/p1-1200.jpg` ... `p25-1200.jpg`
- `assets/img/hero/mobile/p1-1800.jpg` ... `p25-1800.jpg`

### Program images

`assets/js/site.utils.js`, `assets/js/programs.js` и `assets/js/program-modal.js` динамически строят пути:

- `assets/img/programs/{number}-cover-640.jpg`
- `assets/img/programs/{number}-cover-1200.jpg`
- `assets/img/programs/{number}-professions-900.jpg`
- `assets/img/programs/{number}-professions-1400.jpg`

Ожидаемый набор: 33 программы x 4 изображения = 132 файла.

### Apply/contact icons

- `assets/img/icons/gos.svg`
- `assets/img/icons/rut.svg`

## Source-архив

`update/` удален из production-дерева. Перед удалением он был зафиксирован в `docs/archive/source-assets-inventory.md`.

Runtime-сайт использует только `index.html`, `robots.txt`, `sitemap.xml`, `assets/`, `maintenance/` и `.htaccess`, который создается из `example.htaccess` во время деплоя.

## Проверки после текущего этапа

Минимальный набор технических проверок без визуала:

```bash
node --check assets/js/site.config.js
node --check assets/js/site.utils.js
node --check assets/js/site.effects.js
node --check assets/js/hero.js
node --check assets/js/program-modal.js
node --check assets/js/programs.data.js
node --check assets/js/programs.js
node --check assets/js/app.js
node --check scripts/audit-css.js
node --check scripts/check-assets.js
node --check scripts/check-markup.js
node --check scripts/check-program-data.js
node --check scripts/check-seo.js
node --check scripts/check-structure.js
sh -n scripts/deploy-static.sh
node scripts/check-structure.js
node scripts/check-markup.js
node scripts/check-assets.js
node scripts/check-program-data.js
node scripts/check-seo.js
npm run audit:css
npm run check
python3 -m json.tool assets/img/favicon/site.webmanifest
```

`scripts/check-assets.js` проверяет:

- локальные `src`/`href` в `index.html`;
- локальные `src`/`href` в `maintenance/*.html`;
- favicon manifest;
- все динамические hero-пути;
- все динамические пути изображений программ.

Визуальная проверка остается за пользователем.

Последний прогон:

- `npm run check` - успешно.
- `scripts/check-markup.js` - успешно.
- `scripts/check-structure.js` - успешно.
- `scripts/check-assets.js` - успешно, проверено 338 путей, 33 программы.
- `scripts/check-program-data.js` - успешно, проверено 33 программы.
- `scripts/audit-css.js` - успешно, `maybeUnused=0`.
- `python3 -m json.tool assets/img/favicon/site.webmanifest` - успешно.
- `.DS_Store` - не найдено.

## Оставшиеся этапы

### Этап 1. Закрыть текущий cleanup

Цель: убедиться, что после переноса в `assets/` ничего не потеряно.

- Прогнать syntax-check JS.
- Прогнать JSON-check manifest.
- Прогнать `scripts/check-assets.js`.
- Проверить отсутствие `.DS_Store`.
- Проверить `git status` и убедиться, что удаления соответствуют переносам/очистке.

### Этап 2. Source-архивы

`update/` удален из production-дерева. Если исходники понадобятся снова, их нужно восстановить из внешнего архива или истории git.

### Этап 3. JS-структура

Текущий безопасный минимум уже сделан: данные, конфигурация, helpers, hero, модалка, эффекты и список программ разделены по файлам.

Текущая структура:

```text
assets/js/
  app.js
  hero.js
  program-modal.js
  programs.js
  site.config.js
  site.utils.js
  programs.data.js
```

Дальше JS лучше трогать только точечно: например, добавить focus trap в модалку или тесты для форматирования данных. Механически дробить дальше уже нет смысла.

### Этап 4. CSS cleanup без визуальных изменений

Сейчас `styles.css` остается единой точкой входа, что безопаснее для статического сайта.

Будущий порядок секций:

1. Base/reset.
2. CSS variables/tokens.
3. Shared layout.
4. Header.
5. Hero.
6. Programs.
7. Modal.
8. Apply.
9. Contacts.
10. Footer.
11. Responsive.
12. Animations/reduced motion.

Важно: не менять значения размеров, отступов, цветов и line-height без отдельной визуальной задачи.

### Этап 5. Metadata и доступность

Без визуальных изменений можно отдельно добавить/доделать:

- canonical после появления финального домена;
- `og:image` после появления финального публичного URL;
- улучшения модалки: focus trap, возврат фокуса;
- keyboard support для карточек программ;
- audit alt/aria.

### Этап 6. Деплой-чеклист

Перед production-деплоем:

- проверить, что `assets/` содержит все runtime-файлы;
- прогнать технические проверки;
- сделать пользовательскую визуальную проверку;
- проверить favicon на iOS/Android/Desktop;
- проверить кликабельность контактов и соцсетей;
- проверить карту и внешние ссылки.

## Риски

1. Визуал может сломаться от CSS-реорганизации даже без изменения значений из-за каскада. Поэтому CSS дробить только после отдельного этапа.
2. Runtime-ассеты теперь живут в `assets/`; старые пути `images/` и `update/favicon-2/` не должны возвращаться.
3. Динамические пути в JS не видны простым HTML-валидаторам, поэтому нужен отдельный path-checker.
4. Source-архив `update/` удален из production-дерева; восстановление возможно только из внешнего архива или истории git.
5. Если сайт будут открывать напрямую через `file://`, не переводить данные программ на JSON через `fetch()` без dev server/build step.

## Краткий вывод

Основная production-проблема уже стала меньше: runtime теперь отделен от архива, данные программ отделены от логики, мусорные ассеты убраны.

Дальше лучше идти осторожно: закрывать технические проверки текущего состояния и любые будущие CSS-изменения делать только отдельными маленькими шагами. Визуал на этом этапе не трогать.
