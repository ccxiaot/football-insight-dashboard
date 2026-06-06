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

Static demo records live in:

```text
src/data/matches.ts
src/data/syncMeta.ts
```

Replace those files or add a future sync workflow when a real data source is chosen.
