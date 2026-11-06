# Ирена Дигол — персональный сайт

Русская десктопная версия, включая правки версии 2.

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
