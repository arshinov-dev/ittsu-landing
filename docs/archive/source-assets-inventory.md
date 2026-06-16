# Source Assets Inventory

Дата: 2026-06-16

Цель: зафиксировать, что лежит в `update/`, чтобы не смешивать production runtime и архив/source-материалы.

Статус на 2026-06-17: `update/` удален из production-дерева по решению владельца проекта. Этот документ оставлен как историческая инвентаризация удаленного source-архива.

## Кратко

`update/` не использовался напрямую сайтом после переноса runtime-файлов в `assets/`.

Размеры до удаления:

- `update/`: около 826 MB.
- `update/head_update/`: около 194 MB.
- `update/head_update/photos/`: около 185 MB.
- `update/photos_normal/`: около 47 MB.
- `update/сurriculums/`: около 585 MB.

Количество файлов в `update/` до удаления: 155.

## Состав

### `update/head_update/`

Содержит исходные материалы для hero/header:

- `first.jpg`;
- `photos/` с исходными hero-фотографиями.

Runtime-версии уже лежат в:

- `assets/img/hero/desktop/`;
- `assets/img/hero/mobile/`;
- `assets/img/brand/`.

### `update/photos_normal/`

Содержит дополнительные исходники hero в формате `Rectangle ... .png`.

Runtime-сайт напрямую эту папку не читает.

### `update/сurriculums/`

Содержит source-материалы по 33 программам:

- папки `01-...` - `33-...`;
- `NN-cover.*`;
- `NN-professions-bg.*`;
- `NN.md`;
- общие SVG: `border-for-cover.svg`, `example01.svg`, `example14.svg`, `example24.svg`.

Runtime-версии картинок программ уже лежат в:

- `assets/img/programs/`.

Данные программ для сайта лежат в:

- `assets/js/programs.data.js`.

## Риски

1. `update/` удален из production-дерева; восстановление возможно только из внешнего архива или истории git.
2. В имени `update/сurriculums/` первая буква `с` кириллическая, не латинская. Это легко не заметить в терминале.
3. Если когда-нибудь переносить архив в `source/`, лучше переименовать папку в ASCII: `source/curriculums/`.
4. Для production-деплоя `update/` лучше исключать, если деплой должен быть легким.

## Рекомендация

Оптимальная схема для следующего этапа:

```text
source/
  hero/
  curriculums/
```

После удаления `update/` эта схема остается вариантом только для будущего восстановления source-материалов, если они снова понадобятся.
