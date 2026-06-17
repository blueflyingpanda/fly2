# fly2 — flight price tracker web app

A modern, minimalistic web front-end for the **flytwo** flight-price monitor (which
otherwise lives in a Telegram bot). Built with React + Vite + TypeScript + Tailwind,
with smooth Framer Motion animations, light/dark theming with a lavender accent, and
English/Russian i18n. Works both as a standalone web app (GitHub Pages) and as a
**Telegram Mini App**.

## Stack

- React 19 + Vite 6 + TypeScript
- Tailwind CSS (CSS-variable design tokens, `darkMode: "class"`)
- Framer Motion (animations), lucide-react (icons), recharts (price charts)
- Deployed to GitHub Pages via `gh-pages`

## Project structure (designed for React Native reuse)

```
src/
  core/         platform-agnostic logic — NO DOM. Reusable as-is on React Native:
    types.ts        API contract types (mirror flytwo/src/api/models.py)
    config.ts       API base URL + storage keys
    api.ts          typed API client (all endpoints)
    auth.ts         token storage + OTP / Telegram login
    telegram.ts     Telegram Mini App runtime wrapper
    storage.ts      sync key/value adapter (localStorage; swap for MMKV on RN)
    format.ts       date/currency/flag/schedule formatting
    i18n/           en + ru translations
  contexts/     Theme, Locale, Auth, Chat, Toast providers
  ui/           presentational primitives (Button, Card, Input, Modal, …)
  components/   feature views (Directions, Stats, Promo, Convert, Settings, Airports)
  hooks/        useAirports
```

To port to React Native: reuse `core/*` verbatim, replace `core/storage.ts` and
`core/telegram.ts` with native adapters, and re-implement `ui/*` + `components/*` with
native primitives. Feature logic stays in `core` + `contexts`.

## Features (parity with the bot, minus start/stop/help/auth)

| Bot command            | Web app                                              |
| ---------------------- | ---------------------------------------------------- |
| `/add`, `/remove`      | Routes tab — add (airports or link) / edit / delete  |
| `/directions`          | Routes list                                          |
| `/notify`, `/threshold`| Edit route form                                      |
| `/go`                  | "Check now" button                                   |
| `/schedule`            | Settings → Schedule (toggle, presets, custom)        |
| `/less`                | Settings → Silent mode                               |
| `/currency`            | Settings → Default currency                          |
| `/info`                | Settings → Account                                   |
| `/stats`               | Stats tab — interactive themed chart                 |
| `/convert`             | Convert tab                                           |
| `/promo`               | Promo tab                                             |
| `/airports`            | Settings → Airports (searchable list)                |

## Local development

```bash
npm install
npm run dev          # http://localhost:5173
```

The API base is auto-detected (`core/config.ts`):

- `localhost` / `127.0.0.1` → `http://localhost:8000`
- otherwise → `https://flytwo.servebeer.com`

CORS for these origins is configured in `flytwo/.env` (`CORS_ORIGINS`).

### Signing in during dev

- **Browser:** in the bot send `/auth`, then enter the returned Chat ID + 6-digit code.
- **Telegram Mini App:** opens authenticated automatically via signed `initData`.

## Build & deploy (GitHub Pages)

```bash
npm run build        # tsc -b && vite build  ->  dist/
npm run deploy       # gh-pages -d dist  ->  pushes dist/ to the gh-pages branch
```

- Repo: `github.com/blueflyingpanda/fly2` → published at
  `https://blueflyingpanda.github.io/fly2/`
- `vite.config.ts` uses `base: './'` so assets resolve under the `/fly2/` subpath.
- Enable Pages once: repo Settings → Pages → Source = `gh-pages` branch.

## Telegram Mini App setup (one-time, via @BotFather)

1. `/newapp` (or `/myapps` → your bot) and set the Web App URL to
   `https://blueflyingpanda.github.io/fly2/`.
2. Optionally add a menu button (`/setmenubutton`) pointing at the same URL.

Auth uses the existing bot token to validate `initData` server-side
(`POST /auth/telegram` in flytwo). No extra secret is required.

## Backend endpoints used

Added to `flytwo/src/api` for this app: `POST /auth/telegram`, `GET /info`,
`POST/DELETE/PATCH /directions`, `POST /go`, `GET/PUT /schedule`,
`POST /schedule/toggle`, `POST /silent/toggle`, `GET /currencies`, `PUT /currency`,
`GET /convert`, `POST /promo`, plus `?currency=` on `GET /price-history`.
