# چک‌لیست بک‌اند برای «محصول آماده» (هم‌سو با فرانت فعلی)

این فایل را بدهید به تیم Django تا APIها با UI هم‌خوان شود. مسیرها زیر **`/api/v1/`** هستند مگر جدا گفته شود.

**قرارداد فشردهٔ یک‌صفحه‌ای (HTTP + WS):** [`api-contract-django-compact.md`](./api-contract-django-compact.md)

---

## ۱) زیرساخت و قرارداد

| نیاز | توضیح |
|------|--------|
| **JSON** | خطاها به سبک DRF: `detail`، `non_field_errors`، یا `{ "field": ["…"] }`. |
| **صفحه‌بندی** | `count`, `next`, `previous`, `results` + پشتیبانی از `limit` و `offset`. |
| **CORS** | اگر مرورگر مستقیم به Django می‌زند، origin فرانت را اجازه بده؛ یا فقط Next با **`NEXT_PUBLIC_API_USE_PROXY`** و rewrite استفاده شود. |
| **SSR** | Next از **`INTERNAL_API_BASE_URL`** (یا `API_PROXY_TARGET`) برای `stats`، featured courses، و جزئیات دوره استفاده می‌کند — از شبکهٔ سرور به API دسترسی باشد. |
| **فایل رسانه** | `file_url` برای ویدیو/صوت باید URL مطلق و قابل پخش باشد؛ برای تصویر دوره `thumbnail_url` مطلق. |

---

## ۲) احراز هویت

| متد | مسیر | بدنه | پاسخ |
|-----|------|------|------|
| `POST` | `/api/v1/login/` | `{ "username", "password" }` | `{ "access", "refresh" }` |
| `POST` | `/api/v1/refresh-token/` | `{ "refresh" }` | `{ "access" }` (+ اختیاری `refresh`) |
| `POST` | `/api/v1/auth/register/` (یا `/api/v1/register/`) | `{ "username", "email", "password", "role"? }` | ۲۰۱ یا ۲۰۰ + بدنهٔ کاربر (یا توکن اگر می‌خواهید auto-login) |

---

## ۳) عمومی (بدون JWT)

| متد | مسیر | یادداشت |
|-----|------|---------|
| `GET` | `/api/v1/courses/` | لیست با `limit`/`offset`؛ فیلدهای کارت: `id`, `title`, `description`, `slug`, `thumbnail_url`, `category`, `price`, `instructor_detail` (بدون `email` برای ناشناس قابل قبول است). |
| `GET` | `/api/v1/courses/{id}/` | درخت کامل `modules → lessons → contents` با `content_type`, `content`, `file`, **`file_url`**, `order`. |
| `GET` | `/api/v1/stats/` | `{ "courses_count", "learners_count", "instructors_count" }`. |
| `POST` | `/api/v1/newsletter/` | `{ "email" }`؛ تکراری: ۴۰۰ با `{ "email": ["…"] }`. |

---

## ۴) ثبت‌نام در دوره و یادگیری (PRD)

| متد | مسیر | احراز | یادداشت |
|-----|------|--------|---------|
| `POST` | `/api/v1/courses/{id}/enroll/` | JWT (دانشجو) | بعد از موفقیت، دانشجو باید بتواند محتوای محافظت‌شده ببیند. |
| `GET` | `/api/v1/enrollments/` | JWT | لیست دوره‌های کاربر؛ برای هاب «My learning» عالی است. |
| **توصیه‌شده** | `GET /api/v1/courses/{id}/curriculum/` | JWT + چک enrollment (یا مدرس) | درخت کامل مثل جزئی دوره؛ فرانت: `getCourseCurriculum`. |
| **مدرس/ادمین** | `GET /api/v1/courses/{id}/students/` | JWT | لیست دانشجویان؛ فرانت: `listCourseStudents`. |
| **مدرس/ادمین** | `GET /api/v1/courses/{id}/enrollments/` | JWT | لیست ثبت‌نام‌ها؛ فرانت: `listCourseEnrollments`. |

---

## ۵) پیام و نمره (PRD)

| متد | مسیر | یادداشت |
|-----|------|---------|
| `GET` | `/api/v1/messages/?limit=&offset=` | لیست پیام‌ها (فیلتر `course` اختیاری). |
| `POST` | `/api/v1/messages/` | بدنه: `{ "recipient": userId, "body": "…", "course"?: id }`. |
| `WS` | `/ws/chat/?token=<access>` | Django Channels + Daphne؛ انواع پیام JSON و Redis در production — [`frontend-websocket-chat-fa.md`](./frontend-websocket-chat-fa.md). |
| `GET` | `/api/v1/grades/?course=` | لیست نمرات (مدرس/ادمین). |
| `PATCH` | `/api/v1/grades/{id}/` | `{ "score", "feedback"? }` — فقط مدرس/ادمین. |

---

## ۶) CRUD محتوا (مدرس / ادمین — JWT)

| منبع | مسیرها |
|------|--------|
| **courses** | `GET/POST courses/`، `GET/PATCH/DELETE courses/{id}/` |
| **modules** | `GET/POST modules/`، `GET/PATCH/DELETE modules/{id}/` — فیلتر `?course=` |
| **lessons** | `GET/POST lessons/`، … — فیلتر `?module=` |
| **contents** | `GET/POST contents/` با **JSON** یا **`multipart/form-data`** (فیلدها: `lesson`, `title`, `content_type`, `order`, اختیاری `content`, فایل `file`). |

**Cascade:** حذف ماژول باید درس‌ها و محتوای زیرش را حذف کند (یا ۴۰۹ اگر سیاست دیگری دارید — با فرانت هماهنگ کنید).

---

## ۷) نقش‌ها (RBAC)

- **Student:** لیست/جزئیات عمومی، `enroll`، `messages`، مشاهدهٔ نمرهٔ خود، و (در نسخهٔ امن) curriculum فقط بعد از enroll.
- **Instructor:** CRUD روی دوره‌های خود + `grades` + پاسخ به پیام‌ها.
- **Admin:** همان instructor + دوره‌های دیگران اگر در مدل شما هست.

کلاینت `role` را در `instructor_detail.role` با مقادیر **`admin` | `instructor` | `student`** می‌خواند.

---

## ۸) چیزهایی که فرانت هنوز «دادهٔ واقعی» ندارد

- **امتیاز دوره** روی کارت‌ها: فعلاً UI ثابت `4.8` است — وقتی API `rating_avg` / `reviews_count` داد، فیلد را وصل کنید.
- **دکمهٔ جستجوی هدر** به `/courses?q=` وصل است — بک‌اند لازم نیست مگر بخواهید جستجوی سروری جدا بسازید.
- **صفحات** `/privacy` و `/terms` placeholder هستند — متن حقوقی را جایگزین کنید.

بقیهٔ جزئیات فنی: `docs/backend-api-contract-fa.md` و `docs/PRD-devlearn-client-mapping.md`.  
**فهرست اولویت‌دار «فرانت از بک‌اند چه می‌خواهد»:** `docs/frontend-needs-from-backend-fa.md`.
