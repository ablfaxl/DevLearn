# Server API checklist (for landing + full integration)

The Next app can call Django **from the browser** via **`NEXT_PUBLIC_API_USE_PROXY=true`** (same-origin `/api-backend/*` → rewrite in `next.config.ts`, no CORS).  
The **marketing homepage** fetches featured courses **on the server** using **`INTERNAL_API_BASE_URL`** (or `API_PROXY_TARGET`), so it does not need CORS.

**Product / PRD alignment (DevLearn-style LMS):** see **`docs/PRD-devlearn-client-mapping.md`** for enrollments, classroom `/learn`, messages, grades, register, and studio redirect.

**Backend checklist (فارسی، آمادهٔ تحویل به Django):** **`docs/backend-handoff-fa.md`**

**نیازمندی‌های فرانت از بک‌اند (اولویت‌بندی‌شده، یکجا):** **`docs/frontend-needs-from-backend-fa.md`**

**قرارداد فشردهٔ Django (مسیرها + WS):** **`docs/api-contract-django-compact.md`** — جزئیات پیام WebSocket: **`docs/frontend-websocket-chat-fa.md`**

---

## Already used by this client

| Area | Method | Path | Notes |
|------|--------|------|--------|
| Admin auth | POST | `/api/v1/login/` (or override `NEXT_PUBLIC_API_TOKEN_URL`) | Expect `{ access, refresh }` JSON |
| Admin + catalog API | * | `/api/v1/courses/`, modules, lessons, contents | Bearer JWT |

---

## Recommended backend work (priority)

### 1. Public course list (high) — unlocks landing “Featured” + future public catalog

- **Today:** `GET /api/v1/courses/` may require authentication. The homepage then falls back to placeholder cards.
- **Implement one of:**
  - **A)** Allow **anonymous GET** on list (and optionally detail) with a conservative serializer (no sensitive fields), **or**
  - **B)** Add **`GET /api/v1/public/courses/`** (and optional **`GET /api/v1/public/courses/{id}/`**) with `AllowAny`, pagination same as DRF (`limit` / `offset`).
- **Optional fields** on list for richer UI: `thumbnail` / `image_url`, `price`, `category`, `slug` for SEO links.

### 2. Align public course detail with app routes (medium)

- Public app has **`/courses/[courseId]`** (demo data today). For production, either:
  - Serve detail from **`GET /api/v1/courses/{id}/`** for everyone (read-only, nested tree), **or**
  - Add **`GET /api/v1/public/courses/{id}/`** with a reduced payload.

### 3. CORS (only if you do *not* use the Next proxy)

- If the browser calls `http://127.0.0.1:8000` directly, allow **`http://localhost:3000`** (and production origin) on **`Access-Control-Allow-Origin`**, methods, headers (`Authorization`, `Content-Type`), and credentials if you use cookies later.

### 4. Newsletter / lead capture

- **`POST /api/v1/newsletter/`** with `{ "email": "..." }` — wired on the landing page; backend should match duplicate/throttle behaviour expected in `docs/frontend-needs-from-backend-fa.md`.

### 5. Stats / testimonials (low, optional)

- **`GET /api/v1/stats/`** — e.g. learners count, course count (for social proof section).
- **`GET /api/v1/testimonials/`** — curated quotes (or static JSON in CMS).

---

## JWT contract

- Client expects JSON with **`access`** and **`refresh`** from the login/token endpoint.
- If your backend uses different keys or a cookie session only, say so and the client `auth.ts` / storage can be adjusted.

---

## Env reference (client + server)

See **`.env.example`** for:

- `NEXT_PUBLIC_API_USE_PROXY` — browser → `/api-backend/*`
- `API_PROXY_TARGET` / `INTERNAL_API_BASE_URL` — Django base URL for rewrites + server fetch
- `NEXT_PUBLIC_API_BASE_URL` — direct API origin when **not** proxying
