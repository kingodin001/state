# Собственная графика 0.2.0

Использован встроенный imagegen (не CLI/API). Полученные PNG сохранены без изменения пикселей; приложение берёт нужные области атласа при рисовании. Цветовые варианты создаются средствами рендеринга приложения. Извлечённая графика State.io в проект не включена.

## Файлы

- `app/src/main/assets/game/art/terra-collection.png` — атлас собственных персонажей, баз, бойцов, сундуков и ресурсов.
- `app/src/main/res/drawable-nodpi/terra_icon.png` — новая иконка Android.
- `app/src/main/assets/game/art/terra-cover.png` — тот же оригинал для экрана загрузки.

## Промпт атласа

Use case: stylized-concept. Production asset type: one transparent PNG sprite atlas for a polished mobile territory conquest strategy game named Terra Storm. Generate a precisely regular 4 columns by 4 rows square sprite atlas, 16 separate ORIGINAL cute premium 3D toy-style game objects, each object centered within its own equal square cell. This is an actual asset sheet, NOT a screenshot or UI mockup. Entire sheet has true transparent alpha; no background, no labels, no letters, no numbers, no grid or borders, no drop shadows outside each cell. Keep 12% clear padding in EVERY cell and no overlap between cells. Orthographic front 3/4 view, soft clay/plastic toy materials, high-end rounded 3D rendering, crisp silhouette, bright saturated rich colors, warm key light, subtle contact shading. Match the visual grammar of glossy collectible mobile-strategy icons. Row 1 left to right: (1) adorable royal-blue uniformed field commander with peaked cap and gold shoulder boards, full body, big head, determined friendly face; (2) original friendly purple hooded futuristic navigator hero with glowing cyan goggles, full body; (3) original red and gold armored guardian knight holding small shield, full body; (4) original teal and copper engineer hero with big protective goggles and wrench, full body. Row 2: (1) detailed royal-blue miniature castle with three towers and golden flag; (2) purple crystalline sci-fi headquarters with glowing orb on tower; (3) terracotta desert fortress with gold domes and blue flags; (4) emerald observatory tower with gold rotating radar. Row 3: (1) tiny cobalt-blue helmeted rounded pawn soldier with two black dot eyes, friendly, full body; (2) tiny royal-blue and silver toy rocket with orange exhaust and fins; (3) tiny sky-blue and gold futuristic quadcopter drone; (4) tiny teal and purple armored robot pawn with luminous eyes, full body. Row 4: (1) ornate blue and gold closed reward chest with gem lock, three-quarter view; (2) beautiful open purple and gold reward chest spilling pink faceted gems; (3) small overflowing pile of bright golden coins with embossed simple lightning emblems; (4) radiant cluster of faceted pink rubies and one small cyan gem. EXACTLY 16 objects, one per grid cell, regular 4x4 cell centers, all fully within their cells, transparent background, no text, no UI, no screenshot, no existing game character likenesses.

## Промпт иконки

Use case: logo-brand / stylized-concept. Asset: finished square Android app launcher icon for an ORIGINAL mobile territory-conquest strategy game Terra Storm. No text, no typography, no numbers, no border. Full bleed glossy polished 3D toy-style icon. In the foreground a beautifully detailed royal-blue and gold miniature three-tower castle with a blue flag, built on a compact hexagonal land tile. A tiny friendly cobalt blue helmeted toy soldier with two black dot eyes at the front corner of the castle, a second small red troop on a neighboring red land tile at the lower right edge. The island board is made of interlocking map-shaped territories, vivid royal blue, coral red and pale blue, with bright white boundaries; a curving dotted line connects two territories to communicate conquest. Camera isometric close 3/4 top-down, castle occupies 65 percent of square and dominates recognizably even at 64px. Rounded premium mobile game 3D render, rich saturated colors, soft warm directional studio lighting, clean plastic-clay material, crisp edges, gold details and a bright sky-blue-to-deep-cobalt background with subtle luminous rays. Strong centered readable silhouette, everything important within central 80 percent so Android rounded icon crops are safe. ORIGINAL art, no existing game logos or branded character likenesses. Elegant expensive mobile strategy game icon, not a screenshot or a collage.


# Дополнение 0.4.0

Девять PNG созданы заново встроенным imagegen с прозрачным фоном; пять атласов и четыре значка используются непосредственно в APK. Чужие изображения не включены. Все атласы 1254×1254, изображения объектов выбираются по ячейкам; первые четыре базовых варианта категорий сохранены из нашего старого атласа.

| Файл в `app/src/main/assets/game/art/` | Содержимое |
| --- | --- |
| resource-coins.png | Золотая монета с собственным рельефом |
| resource-supply.png | Синий шестигранник с золотой стрелкой вверх |
| resource-gems.png | Розовые огранённые кристаллы |
| resource-tickets.png | Синий билет с золотыми стрелками перемотки |
| bases-a.png, bases-b.png | Две сетки 4×4, 32 собственные архитектурные миниатюры |
| fighters-a.png, fighters-b.png | Две сетки 4×4, 32 собственных бойца / аппарата |
| leaders.png | Сетка 2×2: алхимик, хрономант, паладин, изобретатель |

Направление промптов: оригинальные premium mobile strategy collectible assets, orthographic three-quarter view, richly saturated blue/gold and colorful enamel, rounded detailed toy materials, transparent background, no text or existing branded characters. Для листов: regular 4×4 (leaders 2×2) grid, independent complete objects, clear padding, no overlap; каждый объект задан отдельно. Для ресурсов: один крупный читаемый объект, золотой контур и выраженные объём / блики, прозрачный фон. Масштаб, выбор области и цвет фракции выполняет Canvas/CSS, сами PNG не перекрашены на диске.


## Семь отдельных лидеров, 0.10.0

Сгенерированы по отдельным исходным карточкам, с сохранением ракурса и пропорций, прозрачным фоном, без текста и интерфейса. Преобразованы в WebP ≤512px. Во всех запросах: один персонаж целиком, центрирован, игровая 3D/chibi-иллюстрация, прозрачный фон, без пьедестала и дополнительных персонажей.

| Файл в `app/src/main/assets/game/art/leaders` | Изменения в запросе |
|---|---|
| l_1.webp | Navy field uniform, copper buttons, teal scarf, blond moustache, saluting hat. |
| l_2.webp | Midnight teal lamellar armor, brass details, indigo helmet, asymmetric golden crescent, white goatee, saber. |
| l_3.webp | Steel/copper armor, turquoise crest, navy round shield, golden sun emblem. |
| l_berserk.webp | Dark braided beard with silver streak, moss green tunic, brass details, two steel axes. |
| l_biohazard.webp | Plum/navy coat, teal beaked mask, copper details, amber lenses, top hat, green flask and cane. |
| l_cryomancer.webp | Indigo hood, turquoise mask, silver fasteners, teal armor, cyan eyes, ice glow. |
| l_production.webp | Navy bicorne with copper cog, teal/cream coat, copper epaulettes, brown hair and moustache, bronze tipped baton. |

Иллюстрации подключены в SourceRuntime к своим именам лидеров. Боевые силуэты баз/бойцов взяты отдельно из исходных прозрачных текстур: портреты не подменяют их.
