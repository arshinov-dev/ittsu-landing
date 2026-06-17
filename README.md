# Поступай в ИТТСУ РУТ

Статический лендинг приемной кампании ИТТСУ РУТ.

## Структура

- `index.html` - основная HTML-страница.
- `robots.txt` - правила индексации и ссылка на sitemap.
- `sitemap.xml` - карта сайта для поисковых систем.
- `.editorconfig` - базовые правила форматирования файлов в репозитории.
- `assets/css/styles.css` - стили сайта.
- `assets/js/site.config.js` - настройки сайта и списки hero-слайдов.
- `assets/js/site.utils.js` - общие helper-функции форматирования и сборки путей.
- `assets/js/site.effects.js` - scroll/reveal/back-to-top поведение.
- `assets/js/hero.js` - hero-слайдер.
- `assets/js/program-modal.js` - модалка подробностей программы.
- `assets/js/programs.data.js` - данные образовательных программ.
- `assets/js/programs.js` - карточки программ, группировка, фильтры.
- `assets/js/app.js` - точка инициализации модулей.
- `assets/img/` - runtime-ассеты сайта.
- `maintenance/` - страницы 403/404/503 для Apache/ispmanager.
- `example.htaccess` - шаблон Apache-конфига; при деплое копируется в публичную папку как `.htaccess`.
- `scripts/check-assets.js` - проверка локальных и динамических путей к ассетам.
- `scripts/check-markup.js` - проверка разметки на старые runtime-пути, inline-обработчики и порядок скриптов.
- `scripts/check-program-data.js` - проверка целостности данных программ.
- `scripts/check-seo.js` - проверка `robots.txt` и `sitemap.xml`.
- `scripts/check-structure.js` - проверка production-структуры и отсутствия старых папок/файлов.
- `scripts/deploy-static.sh` - синхронизация только публичных файлов в папку сайта.
- `scripts/audit-css.js` - аудит CSS-классов против runtime-разметки и JS.
- `docs/archive/` - архив документации и рабочих планов.
- `package.json` -  зависимости и npm-скрипты проекта.
- `README.md` - этот файл. 

## Требования

Для работы со скриптами проверки и деплоя необходим [Node.js](https://nodejs.org/) (версия 18+). Также убедитесь, что установлен `git`.

## Проверки

Перед запуском `npm run check` установите зависимости:

```bash
npm install
npm run check
```

Команда проверяет синтаксис JS, наличие ассетов и целостность данных программ.

Можно запускать отдельно:

```bash
npm run check:js
npm run check:deploy
npm run check:structure
npm run check:markup
npm run check:assets
npm run check:data
npm run check:seo
npm run audit:css
```

## Запуск локально

Сайт можно открыть как статический `index.html` или поднять простой локальный сервер:

```bash
npx http-server -p 8000
# или, если установлен Python:
python3 -m http.server 8000
# или PHP (если доступен):
php -S 127.0.0.1:8000
```

## Деплой

На сервере репозиторий лучше держать вне публичной папки сайта, например в `~/repos/ittsu-landing`.
В публичную папку домена копируются только:

```text
index.html
robots.txt
sitemap.xml
assets/
maintenance/
.htaccess
```

Первый clone:

```bash
git clone --depth 1 --branch main <repo-url> ~/repos/ittsu-landing
```

Публикация:

```bash
cd ~/repos/ittsu-landing
PUBLIC_DIR=/path/to/public_html sh scripts/deploy-static.sh
```

Обновление:

```bash
cd ~/repos/ittsu-landing
git pull --depth 1 --ff-only
PUBLIC_DIR=/path/to/public_html sh scripts/deploy-static.sh
```

Так `.git`, `docs/`, `scripts/`, `README.md` и `package.json` остаются вне публичного web-root.

`scripts/deploy-static.sh` работает как зеркало публичной сборки:

1. Создает временную staging-папку.
2. Кладет туда `index.html`, `robots.txt`, `sitemap.xml`, `assets/`, `maintenance/`.
3. Копирует `example.htaccess` как `.htaccess`.
4. Через `rsync -a --delete` делает публичную папку точной копией staging.

Из-за `--delete` лишние файлы в публичной папке будут удаляться. Это удобно для чистого статического сайта. Если hosting-панель хранит в web-root служебные файлы, их нужно добавить в исключения deploy-скрипта перед первым запуском.

## Maintenance и страницы ошибок

Страницы ошибок лежат в `maintenance/`, а Apache берет их из `.htaccess`:

```apache
ErrorDocument 403 /maintenance/403.html
ErrorDocument 404 /maintenance/404.html
ErrorDocument 503 /maintenance/503.html
```

Чтобы включить режим технических работ:

1. В `example.htaccess` замените `123.45.67.89` на ваш внешний IP.
2. Раскомментируйте 4 строки в блоке технических работ.
3. Выполните deploy.

Чтобы выключить maintenance, закомментируйте эти строки обратно и снова выполните deploy.
