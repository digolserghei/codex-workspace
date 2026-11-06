# Ирена Дигол — персональный сайт

Сайт на русском, английском и румынском языках с адаптивами для телефонов, планшетов и десктопов. Переключатель RU / EN / RO сохраняет текущий раздел. Научные библиографические записи остаются на языке оригинала.

Исходный код: Next.js, React, TypeScript, GSAP.
Готовая сборка GitHub Pages: `docs/`.

## Локальный запуск

```sh
npm ci
npm run dev
```

## Обновление GitHub Pages

```sh
NEXT_PUBLIC_BASE_PATH=/codex-workspace npm run build
rm -rf docs
cp -R out docs
touch docs/.nojekyll
```

В Settings → Pages выберите Deploy from a branch, main, /docs.
Адрес после публикации: https://digolserghei.github.io/codex-workspace/

## Языковые версии

- Русская: https://digolserghei.github.io/codex-workspace/
- English: https://digolserghei.github.io/codex-workspace/en/
- Română: https://digolserghei.github.io/codex-workspace/ro/

Переводы содержимого: src/content/en.json, ro.json. Интерфейс: src/content/ui.json.
Проверки: npm run build; qa/check-locales.py (Chromium/Playwright, запущенный static server на порту 3000).

## Адаптивная версия

Компактное меню до 1100 px, последовательная композиция на планшетах, миниатюры под галереями до 700 px. На телефонах параллакс отключён. Меню поддерживает Tab, Escape и восстановление фокуса.

Responsive WebP: public/images/responsive. Обновление после замены фотографий: python scripts/resize-images.py (требуется Pillow). Оригинальные изображения сохранены.

Проверки: qa/check-responsive.py — Chromium с эмуляцией касаний, 14 ширин 360–1920 px, RU/EN/RO. Результаты: qa/responsive.json. Дополнительно проверены экраны 360×640 и 844×390.
