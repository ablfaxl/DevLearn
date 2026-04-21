# نیازمندی‌های فرانت‌اند که بک‌اند باید تأمین کند

این سند از **دید کلاینت Next.js همین ریپو** نوشته شده: هر چیزی که UI یا `fetch` واقعاً صدا می‌زند یا برای «محصول کامل» بلافاصله بعدش لازم است.

**قرارداد فشردهٔ مسیرها و نقش‌ها (Django):** [`api-contract-compact-fa.md`](./api-contract-compact-fa.md)

**پایهٔ URL:** همهٔ مسیرهای API زیر **`/api/v1/`** (مثلاً `https://api.example.com/api/v1/…` یا از طریق پروکسی Next: `/api-backend/api/v1/…`).

---

## اولویت‌ها

| سطح | معنی |
|-----|------|
| **P0** | بدون آن لندینگ/کاتالوگ/کلاسوروم عمومی درست کار نمی‌کند. |
| **P1** | ثبت‌نام، پیام، نمره، «دوره‌های من» — برای PRD کامل. |
| **P2** | تجربهٔ بهتر (امتیاز، curriculum فقط بعد از enroll، …). |

---

## P0 — عمومی (بدون JWT)

### `GET /api/v1/courses/`

- **Query:** `limit`, `offset` (کلاینت: لندینگ `limit=6`، کاتالوگ تا `limit=200`).
- **پاسخ:** `{ "count", "next", "previous", "results": [ … ] }`.
- **هر آیتم `results` (حداقل):** `id`, `title`, `description`.
- **برای UI غنی (الزام توصیه‌شده):** `slug`, `thumbnail_url`, `category`, `price` (عدد یا رشتهٔ Decimal)، `instructor` (id)، `instructor_detail` با `{ id, username, role }` — **`email`** در پاسخ ناشناس می‌تواند نباشد.
- **احراز:** `AllowAny` برای GET (یا مسیر جداگانهٔ public مطابق `docs/server-api-checklist.md`).

### `GET /api/v1/courses/{id}/`

- **پاسخ:** همان شکل **`CourseDetail`**: دوره + `modules[]` → هر کدام `lessons[]` → هر درس `contents[]`.
- **هر `content`:** `id`, `lesson`, `title`, `content_type` (`text`|`video`|`audio`|`document`), `content`, `file`, **`file_url`** (برای پلیر ویدیو/صوت باید URL مطلق و قابل پخش باشد), `order`, `created_at`, `updated_at`.
- **۴۰۴** اگر دوره نیست.

### `GET /api/v1/stats/`

- **پاسخ JSON با کلیدهای دقیق:**  
  `courses_count`, `learners_count`, `instructors_count` (عدد).

### SSR (سرور Next، بدون CORS مرورگر)

- همان سه مسیر بالا باید از **`INTERNAL_API_BASE_URL`** یا **`API_PROXY_TARGET`** برای سرور Next قابل `fetch` باشند.

---

## P0 — احراز هویت (JWT)

### `POST /api/v1/login/` (یا مقدار `NEXT_PUBLIC_API_TOKEN_URL`)

- **بدنه:** `{ "username", "password" }`.
- **پاسخ ۲۰۰:** `{ "access": "<jwt>", "refresh": "<jwt>" }` — کلیدها دقیقاً این نام‌ها.

### `POST /api/v1/refresh-token/`

- **بدنه:** `{ "refresh": "<jwt>" }`.
- **پاسخ:** حداقل `{ "access": "<jwt>" }`؛ اگر refresh چرخش می‌خورد، `{ "refresh": "<new>" }` هم بفرستید.

### `GET /api/v1/me/`

- **احراز:** `Authorization: Bearer <access>` — بدون JWT پاسخ **۴۰۱**.
- **پاسخ (نمونه):** `id`, `username`, `email`, `first_name`, `last_name`, `role`, `is_staff`, `is_superuser` و شیء **`access`** با پرچم‌های سطح نقش:
  `can_manage_users`, `can_write_courses`, `can_use_mine_courses_query`, `can_enroll_in_courses`, `can_write_learning_content`, `can_view_grade_rosters`, `can_access_django_admin`.
- **فرانت:** یک‌بار بعد از لاگین (و دوباره بعد از تغییر نقش / به‌روزرسانی توکن) صدا بزنید و در store نگه دارید؛ برای مسیر قدیمی می‌توان `NEXT_PUBLIC_API_ME_PATH` را ست کرد.

---

## P1 — ثبت‌نام کاربر، ثبت‌نام در دوره، پیام، نمره

### `POST /api/v1/auth/register/`

- **بدنه:** `{ "username", "email", "password", "role"?: "student"|"instructor" }`.
- **پاسخ:** ۲۰۰/۲۰۱؛ خطاها فیلدمحور (مثلاً `{ "email": ["…"] }`).

### `POST /api/v1/courses/{id}/enroll/`

- **احراز:** Bearer (کاربر دانشجو).
- **بدنه:** `{}` یا فیلدهای اضافی اگر مدل شما لازم دارد (با فرانت هماهنگ کنید).
- **پاسخ:** شیء enrollment (کلاینت تایپ `Enrollment` دارد: حداقل `id`, `user`, `course`, `enrolled_at`).

### `GET /api/v1/enrollments/`

- **Query:** `limit`, `offset`.
- **پاسخ:** صفحه‌بندی DRF با `results` آرایهٔ `Enrollment`.
- **کاربرد فرانت:** هاب «My learning» و لیست دوره‌های من (قابل توسعه در UI).

### `GET /api/v1/messages/` و `POST /api/v1/messages/`

- **GET:** صفحه‌بندی؛ اختیاری `?course=<id>`.
- **POST بدنه:** `{ "recipient": <userId>, "body": "<string>", "course"?: <id> }`.
- **هر پیام در GET:** حداقل `id`, `sender`, `recipient`, `body`, `created_at` (+ اختیاری `course`, `read`).

#### چت‌روم (`/messages`) + WebSocket

- **گروه‌بندی گفتگو:** از روی **`GET /messages/`** (کلید = `(course اختیاری، طرف مقابل)`).
- **جهت حباب‌ها:** از **`user_id` در JWT** و در صورت اتصال WS از پیام **`{ "type": "connected", "user_id" }`** (هم‌تراز با `USER_ID_CLAIM` در SimpleJWT).
- **Realtime:** فرانت به **`WS /ws/chat/?token=<access>`** وصل می‌شود؛ ارسال زنده **`{ "type": "send", "recipient", "body", "course" }`**؛ دریافت **`{ "type": "message", "message": {…} }`**. اگر سوکت باز نباشد، **`POST /messages/`** استفاده می‌شود.
- **جزئیات کامل WS، Daphne، Redis، پروکسی:** [`frontend-websocket-chat-fa.md`](./frontend-websocket-chat-fa.md).

| نیاز | توضیح برای بک‌اند |
|------|-------------------|
| **JWT** | در payload توکن access حتماً **`user_id`** (عدد) باشد؛ اختیاری ولی مفید: **`role`** با یکی از `admin` \| `instructor` \| `student` تا قبل از لود `users/me/` هدر و هدایت درست کار کنند. |
| **شکل پیام REST/WS** | `sender` / `recipient` عدد یا nested؛ `body`؛ `created_at`. |
| **GET** | حداقل حدود **۲۰۰** پیام اخیر با `limit`/`offset`. |
| **دانشجو → مدرس** | `GET enrollments/` + دوره با **`instructor`** (و در صورت امکان `instructor_detail`). |
| **مدرس → دانشجو** | **`GET /courses/{id}/students/`** — ردیف با **`user`** + **`enrolled_at`** (CourseStudentSerializer). |
| **P2 (اختیاری)** | `GET /users/me/` یا **رشتهٔ گفتگو** رسمی (`/conversations/`) در صورت نیاز محصول. |

### `GET /api/v1/grades/` و `PATCH /api/v1/grades/{id}/`

- **GET:** فیلتر `?course=` برای مدرس.
- **PATCH بدنه:** `{ "score", "feedback"? }` — فقط مدرس/ادمین.

---

## P1 — ادمین / مدرس (JWT) — CRUD درخت دوره

همه با **`Authorization: Bearer <access>`**.

| منبع | عملیات | یادداشت کلیدی |
|--------|--------|----------------|
| `courses/` | GET لیست، GET جزئی، POST، PATCH، DELETE | PATCH فعلاً `title`, `description`, گاه `instructor` از UI می‌آید. |
| `modules/` | CRUD + `?course=` | |
| `lessons/` | CRUD + `?module=` | `content_type` یکی از چهار مقدار بالا. |
| `contents/` | GET، POST (**JSON یا multipart**)، PATCH، DELETE | **multipart:** فیلدهای فرم دقیق: `lesson`, `title`, `content_type`, `order`, اختیاری `content`, فایل **`file`**. |

**حذف آبشاری:** حذف ماژول → حذف درس‌ها و محتوا (یا خطای قابل پیش‌بینی که UI بعداً هندل کند).

---

## P1 — خبرنامه (اختیاری ولی در UI هست)

### `POST /api/v1/newsletter/`

- **بدنه:** `{ "email": "…" }`.
- **تکراری:** ۴۰۰ با `{ "email": ["…"] }`.

---

## P2 — بهبود تجربه (بعداً وصل کنید)

| نیاز | توضیح |
|------|--------|
| **`rating_avg` / `reviews_count`** روی لیست/جزئی دوره | الان کارت کاتالوگ امتیاز ثابت نمایشی دارد. |
| **`GET …/curriculum/` فقط با enroll** | الان `/learn` از همان جزئیات عمومی استفاده می‌کند؛ برای قفل واقعی محتوا این endpoint را با JWT و چک enrollment پیاده کنید. |
| **`published` روی دوره** | فیلتر لیست عمومی تا پیش‌نویس دیده نشود. |

---

## خطاها و صفحه‌بندی (قرارداد عمومی)

- **خطا:** DRF-style — `detail` (رشته)، `non_field_errors` (آرایه)، یا `{ "fieldName": ["…"] }`.
- **صفحه‌بندی:** `count`, `next`, `previous`, `results`.
- **حذف موفق:** `204` یا `200` با بدنه خالی.

---

## متغیرهای محیطی (تیم DevOps / بک‌اند)

| متغیر | نقش |
|--------|-----|
| `NEXT_PUBLIC_API_USE_PROXY=true` | مرورگر → همان origin `/api-backend/` → rewrite به Django (بدون CORS). |
| `API_PROXY_TARGET` / `INTERNAL_API_BASE_URL` | آدرس Django برای rewrite و برای fetch سرور Next. |
| `NEXT_PUBLIC_API_BASE_URL` | وقتی پروکسی خاموش است؛ همچنین برای `next/image` روی دامنهٔ مدیا. |
| `NEXT_PUBLIC_API_TOKEN_URL` | اگر login جای غیر `/api/v1/login/` باشد. |
| `NEXT_PUBLIC_API_REGISTER_PATH` | مسیر نسبی ثبت‌نام زیر `/api/v1/` (پیش‌فرض `auth/register/`؛ برای `POST /register/` مقدار `register/`). |
| `NEXT_PUBLIC_WS_URL` | مبدأ WebSocket چت، مثلاً `ws://127.0.0.1:8000` وقتی HTTP از پروکسی Next می‌رود ولی سوکت مستقیم به Django است. |
| `NEXT_PUBLIC_API_ME_PATH` | مسیر پروفایل کاربر زیر `/api/v1/` (پیش‌فرض **`me/`**؛ برای بک‌اند قدیمی مثلاً `users/me/` یا `profile/`). |
| `NEXT_PUBLIC_DJANGO_ADMIN_URL` | آدرس پایهٔ Django Admin (بدون اسلش انتهایی)، مثلاً `http://127.0.0.1:8000/admin`؛ اگر خالی باشد از `NEXT_PUBLIC_API_BASE_URL` + `/admin` ساخته می‌شود. |
| `NEXT_PUBLIC_APP_NAME` | نام برند در هدر/فوتر. |

---

## مراجع تفصیلی در همین ریپو

| فایل |
|------|
| `docs/api-contract-django-compact.md` — قرارداد یک‌صفحه‌ای HTTP + WS |
| `docs/frontend-websocket-chat-fa.md` — پیشنهاد شکل پیام WebSocket چت |
| `docs/backend-handoff-fa.md` — چک‌لیست فشردهٔ همان موارد |
| `docs/backend-api-contract-fa.md` — جداول متد/مسیر دقیق‌تر |
| `docs/PRD-devlearn-client-mapping.md` — نگاشت PRD به مسیرهای فرانت |
| `src/lib/api/types.ts` — شکل دقیق فیلدهای TypeScript |

اگر بک‌اند مسیر یا نام فیلدی متفاوت دارد، **همان یک جا** (`auth.ts`, `courses.ts`, `enrollments.ts`, …) را عوض کنید یا به فرانت بگویید تا env/adapter اضافه شود.
