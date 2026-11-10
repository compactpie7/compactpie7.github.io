# compactpie7.github.io

Персональный сайт-портфолио музыканта и композитора Compact_pie7. Публичный сайт на английском языке, документация на русском.

Адрес после публикации: https://compactpie7.github.io/

## Технологии

HTML5, CSS3, Vanilla JavaScript (ES-модули). Без фреймворков, сборщиков и зависимостей. Шрифты Comfortaa и Fredoka подключаются с Google Fonts.

## Структура

| Путь | Назначение |
|---|---|
| `index.html` | Единственная страница: Header, Hero, Selected Music, About, Elsewhere, Footer. |
| `style.css` | Все стили (токены в `:root`, mobile-first). |
| `js/main.js` | Точка входа скриптов, включает плеер. |
| `js/player.js` | Ядро плеера: один `HTMLAudioElement`, состояния, события. |
| `js/player-ui.js` | Привязка плеера к DOM: кнопки, прогресс, время, статус. |
| `files/` | Оригинальные медиафайлы: два `.mp3` и фоновое `.png`. Не изменять и не переименовывать. |
| `docs/` | Документация проекта. |
| `AGENTS.md` | Постоянные правила разработки. |

## Локальный запуск

ES-модули не работают при открытии через `file://`, нужен локальный сервер. Из корня проекта:

```
python -m http.server 8000
```

Затем откройте http://localhost:8000/.

## Документация

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — архитектура и принятые решения.
- [docs/DESIGN.md](docs/DESIGN.md) — визуальная система.
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) — правила разработки и чек-лист проверки.
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — публикация на GitHub Pages.

## Статус

Первая версия сайта написана, но ручная проверка в браузерах ещё не завершена. Пункты проверки перечислены в `docs/DEVELOPMENT.md`.

