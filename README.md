# LMS Client (Next.js 16)

Frontend for the LMS platform (catalog, classroom, messaging, notifications, and admin/instructor tools).

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- HeroUI v3
- TypeScript

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev         # local dev server
pnpm build       # production build
pnpm start       # run production build
pnpm lint        # eslint
pnpm lint:fix    # eslint --fix
pnpm format      # prettier write
pnpm format:check
pnpm exec tsc --noEmit
```

## Environment

This app consumes a Django backend (`/api/v1/...`).

Common variables:

- `NEXT_PUBLIC_API_BASE_URL`
- `API_PROXY_TARGET` (rewrite target for `/api-backend/:path*`)
- `INTERNAL_API_BASE_URL` (server fallback)

Typical local setup:

- Backend: `http://127.0.0.1:8000`
- Frontend: `http://127.0.0.1:3000`

## Auth Routes

- Login: `/admin/login`
- Student register: `/register`
- Instructor register: `/register/instructor`

Registration is role-by-route:

- `/register` submits `role: "student"`
- `/register/instructor` submits `role: "instructor"`

## Theming

- Theme tokens are centralized in `src/app/globals.css`
- HeroUI semantic variables are active
- Legacy LMS tokens (`--lms-*`) are mapped to HeroUI tokens for compatibility
- App is dark-first (`color-scheme: dark`)

## Feature Notes

- Classroom content supports:
  - text (plain + HTML rendering)
  - video/audio links from `content` or `file_url`
  - YouTube/Vimeo embeds
  - document/PDF preview via iframe
- Admin overview page is wired to `GET /api/v1/admin/overview/` with platform-admin gating.
