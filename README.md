# Football Insight Dashboard

一个本地演示和 GitHub Pages 发布用的足球预测静态看板。项目使用原创代码、原创文案和静态样例数据，方便后续继续接入真实数据同步、AI 分析和会员功能。

## Local Demo

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm run dev -- --host 127.0.0.1
```

Local URL:

```text
http://127.0.0.1:5173/football-insight-dashboard/
```

## Verification

Run tests:

```bash
npm test -- --run
```

Build production assets:

```bash
npm run build
```

## GitHub Pages

The app uses relative built asset paths so `dist/index.html` can also be opened directly from disk:

```text
./
```

Push to `main`, then GitHub Actions will run tests, build `dist`, and deploy with GitHub Pages.

Expected Pages URL:

```text
https://ccxiaot.github.io/football-insight-dashboard/
```

## Data

Generated demo records live in:

```text
public/data/matches-current.json
public/data/matches-history.json
public/data/sync-meta.json
```

Regenerate them locally:

```bash
npm run sync:demo
npm run sync:sporttery
npm run validate:data
```

`sync:sporttery` reads China Sporttery football data from `webapi.sporttery.cn`. `sync:demo` remains available for offline demos. Bundled fallback data still exists under `src/data` so the built HTML can render when opened directly from disk with `file://`.
