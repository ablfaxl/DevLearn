# قرارداد API بک‌اند برای کلاینت LMS (Next.js)

این سند بر اساس کد فعلی مخزن (`src/lib/api/*`, `src/lib/data/*`, ادمین و لندینگ) نوشته شده است. پایهٔ مسیرها: **`/api/v1/`**.

> **نسخهٔ فشردهٔ هماهنگ با Django:** [`api-contract-django-compact.md`](./api-contract-django-compact.md) — **WebSocket چت:** [`frontend-websocket-chat-fa.md`](./frontend-websocket-chat-fa.md).

---

## ۱) قراردادهای عمومی

| موضوع | انتظار کلاینت |
|--------|----------------|
| قالب JSON | پاسخ‌های خطا ترجیحاً DRF: `detail` (رشته)، `non_field_errors` (آرایه)، یا `{ "field": ["پیام"] }`. |
| صفحه‌بندی | `{ "count", "next", "previous", "results" }` — معمولاً `limit` و `offset` در query. |
| JWT | هدر **`Authorization: Bearer <access>`** برای درخواست‌های ادمین. |
| حذف موفق | **`204 No Content`** یا **`200`** با بدنهٔ خالی. |

---

## ۲) احراز هویت

### ۲.۱ ورود (توکن)

| متد | مسیر (پیش‌فرض) | احراز | بدنه (JSON) | پاسخ موفق (۲۰۰) | خطا |
|-----|------------------|--------|-------------|------------------|-----|
| `POST` | `/api/v1/login/` | بدون | `{ "username": "…", "password": "…" }` | `{ "access": "jwt", "refresh": "jwt" }` | ۴۰۱ / ۴۰۰ + `detail` یا فیلدها |

**تنظیم env:** اگر مسیر login فرق دارد → `NEXT_PUBLIC_API_TOKEN_URL` (مسیر کامل، یا نسبی با پروکسی).

### ۲.۲ تازه‌سازی access

| متد | مسیر | احراز | بدنه (JSON) | پاسخ موفق | خطا |
|-----|------|--------|-------------|------------|-----|
| `POST` | `/api/v1/refresh-token/` | بدون | `{ "refresh": "<refresh_jwt>" }` | حداقل `{ "access": "…" }`؛ اختیاری `{ "refresh": "…" }` برای چرخش refresh | ۴۰۱ / ۴۰۰ + `detail` |

کلاینت روی **۴۰۱** با توکن منقضی، یک بار refresh و تکرار درخواست را انجام می‌دهد. مسیرهای **`login/`** و **`refresh-token/`** از این حلقه معاف‌اند.

### ۲.۳ ثبت‌نام (جایگزین مسیر)

| متد | مسیر رایج | یادداشت |
|-----|------------|---------|
| `POST` | `/api/v1/auth/register/` | پیش‌فرض فرانت (`registerUser`) |
| `POST` | `/api/v1/register/` | در صورت پیاده‌سازی روی Django؛ با env **`NEXT_PUBLIC_API_REGISTER_PATH=register/`** |

### ۲.۴ WebSocket چت (Django Channels)

| | مسیر / رفتار |
|--|----------------|
| URL | **`WS /ws/chat/?token=<access_jwt>`** (خارج از پیشوند `/api/v1/` مگر سرور خلافش را mount کند) |
| قرارداد JSON | **`connected`** / **`send`** / **`message`** — تفصیل در [`frontend-websocket-chat-fa.md`](./frontend-websocket-chat-fa.md) |
| پروداکشن | **`CHANNEL_LAYERS` با Redis** اگر چند worker / چند پروسه؛ InMemory فقط dev |

---

## ۳) API عمومی (بدون JWT)

### ۳.۱ لیست دوره‌ها

| متد | مسیر | Query | پاسخ ۲۰۰ | یادداشت |
|-----|------|---------|-----------|---------|
| `GET` | `/api/v1/courses/` | `limit`, `offset` | `Paginated<Course>` | کاتالوگ عمومی (`listPublicCourses`)؛ لندینگ `limit=6`. |

**شکل هر `Course` در `results` (فیلدهایی که UI ممکن است بخواند):**

| فیلد | نوع تقریبی | الزام برای UI فعلی |
|------|-------------|---------------------|
| `id` | عدد | بله |
| `title`, `description` | رشته | بله |
| `instructor` | عدد | خیر |
| `instructor_detail` | شیء کاربر خلاصه | خیر؛ `email` اختیاری (عمومی معمولاً حذف) |
| `slug` | رشته | خیر |
| `thumbnail` / `thumbnail_url` | رشته / URL | خیر |
| `category` | رشته یا null | خیر |
| `price` | عدد یا رشته (Decimal) | خیر |
| `created_at`, `updated_at` | ISO string | خیر |

### ۳.۲ جزئیات دوره (درخت عمومی)

| متد | مسیر | پاسخ ۲۰۰ | ۴۰۴ |
|-----|------|-----------|-----|
| `GET` | `/api/v1/courses/{id}/` | `CourseDetail` | دوره وجود ندارد |

**ساختار درخت (`CourseDetail`):**

- `Course` + **`modules[]`**
  - هر ماژول: `id`, `course`, `title`, `description`, timestamps
  - **`lessons[]`**
    - هر درس: `id`, `module`, `title`, **`content_type`** ∈ `text` \| `video` \| `audio` \| `document`, timestamps
    - **`contents[]`**
      - `id`, `lesson`, `title`, **`content_type`**, **`content`** (رشته), **`file`**, **`file_url`**, `order`, timestamps

برای **پلیر ویدیو/صوت** در صفحهٔ دوره، **`file_url`** باید URL قابل پخش در `<video>` / `<audio>` باشد (معمولاً مطلق).

### ۳.۳ آمار لندینگ

| متد | مسیر | پاسخ ۲۰۰ (کلیدها ثابت) |
|-----|------|-------------------------|
| `GET` | `/api/v1/stats/` | `{ "courses_count", "learners_count", "instructors_count" }` |

### ۳.۴ خبرنامه

| متد | مسیر | بدنه | ۲۰۰/۲۰۱ | ۴۰۰ (مثال) |
|-----|------|------|-----------|-------------|
| `POST` | `/api/v1/newsletter/` | `{ "email": "…" }` | موفق | `{ "email": ["This address is already subscribed."] }` |

---

## ۴) API ادمین / مدرس (با JWT)

همهٔ مسیرهای زیر (به‌جز موارد عمومی بالا) با **`Authorization: Bearer`** فراخوانی می‌شوند. سطح دسترسی را بک‌اند تعیین می‌کند (ادمین / مدرس مالک دوره).

### ۴.۱ دوره‌ها `courses/`

| متد | مسیر | بدنه / Query | پاسخ ۲۰۰ |
|-----|------|--------------|-----------|
| `GET` | `courses/` | `limit`, `offset` | `Paginated<Course>` |
| `GET` | `courses/{id}/` | — | `CourseDetail` |
| `POST` | `courses/` | JSON: `title`, `description`؛ اختیاری `instructor` (عدد) | شیء `Course` |
| `PATCH` | `courses/{id}/` | JSON جزئی: فعلاً UI ارسال می‌کند `title`, `description`, گاه `instructor` | شیء `Course` |
| `PUT` | `courses/{id}/` | پشتیبانی در کلاینت هست؛ فرم اصلی `PATCH` | شیء `Course` |
| `DELETE` | `courses/{id}/` | — | ۲۰۴ / بدنه خالی |

**تفاوت UI با مدل کامل بیزنس:** فیلدهایی مثل `slug`, `category`, `price`, آپلود `thumbnail` در فرم ادمین فعلی **ارسال نمی‌شوند**؛ اگر بک‌اند لازم دارد باید پیش‌فرض داشته باشد یا فرم گسترش یابد.

#### ۴.۱.۱ زیرمسیرهای دوره (JWT — مدرس/ادمین یا دانشجو مطابق بک‌اند)

| متد | مسیر | پاسخ تقریبی | کلاینت |
|-----|------|-------------|--------|
| `GET` | `courses/{id}/curriculum/` | همان شکل `CourseDetail` (درخت) وقتی enroll یا نقش مناسب | `getCourseCurriculum` |
| `GET` | `courses/{id}/students/` | `Paginated<UserBrief>` (یا معادل) | `listCourseStudents` |
| `GET` | `courses/{id}/enrollments/` | `Paginated<Enrollment>` | `listCourseEnrollments` |

### ۴.۲ ماژول‌ها `modules/`

| متد | مسیر | Query / بدنه | پاسخ |
|-----|------|----------------|------|
| `GET` | `modules/` | `course`, `limit`, `offset` | `Paginated<Module>` |
| `GET` | `modules/{id}/` | — | `Module` |
| `POST` | `modules/` | JSON: `course`, `title`, `description` | `Module` |
| `PATCH`/`PUT` | `modules/{id}/` | JSON جزئی/کامل | `Module` |
| `DELETE` | `modules/{id}/` | — | ۲۰۴ |

### ۴.۳ درس‌ها `lessons/`

| متد | مسیر | Query / بدنه | پاسخ |
|-----|------|----------------|------|
| `GET` | `lessons/` | `module`, `limit`, `offset` | `Paginated<Lesson>` |
| `GET` | `lessons/{id}/` | — | ترجیحاً `Lesson` + `contents` اگر serializer بدهد |
| `POST` | `lessons/` | JSON: `module`, `title`, `content_type` | `Lesson` |
| `PATCH`/`PUT` | `lessons/{id}/` | JSON | `Lesson` |
| `DELETE` | `lessons/{id}/` | — | ۲۰۴ |

### ۴.۴ محتواها `contents/`

| متد | مسیر | بدنه | پاسخ |
|-----|------|------|------|
| `GET` | `contents/` | `lesson`, `limit`, `offset` | `Paginated<Content>` |
| `GET` | `contents/{id}/` | — | `Content` |
| `POST` | `contents/` | **الف)** JSON یا **ب)** `multipart/form-data` — جدول زیر | `Content` |
| `PATCH` | `contents/{id}/` | JSON یا `multipart` | `Content` |
| `DELETE` | `contents/{id}/` | — | ۲۰۴ |

**`POST` با JSON (`createContentJson`):**

```json
{
  "lesson": 1,
  "title": "…",
  "content_type": "text",
  "content": "…",
  "order": 0
}
```

**`POST` با `multipart` (`createContentMultipart`) — نام فیلدها دقیقاً این‌ها:**

| فیلد فرم | نوع | الزام در فرم ادمین |
|-----------|-----|---------------------|
| `lesson` | رشتهٔ عددی | بله |
| `title` | رشته | بله |
| `content_type` | یکی از `text`/`video`/`audio`/`document` | بله |
| `order` | رشتهٔ عددی | بله |
| `content` | رشته | اختیاری؛ برای `text` در UI اجباری منطقی است |
| `file` | فایل | اختیاری؛ برای آپلود مدیا/سند |

**`PATCH` با `multipart`:** همان الگو برای به‌روزرسانی فایل (`updateContentMultipart`).

---

## ۵) فراخوانی از سرور Next (SSR)

این درخواست‌ها از **Node** به آدرس **`INTERNAL_API_BASE_URL`** یا **`API_PROXY_TARGET`** می‌روند (بدون JWT):

| متد | مسیر | کاربرد |
|-----|------|--------|
| `GET` | `/api/v1/courses/?limit=6` | کارت‌های Featured |
| `GET` | `/api/v1/stats/` | نوار آمار |
| `GET` | `/api/v1/courses/{id}/` | متادیتا/صفحهٔ جزئیات در صورت استفادهٔ سروری |

CORS برای این مسیر لازم نیست؛ باید از شبکهٔ سرور Next به Django دسترسی باشد.

---

## ۶) نقش کاربر در JSON (`UserBrief`)

کلاینت انتظار دارد در صورت وجود:

```json
{
  "id": 1,
  "username": "…",
  "role": "admin" | "instructor" | "student",
  "email": "…"
}
```

فیلد **`email`** در پاسخ‌های ناشناس می‌تواند حذف شود.

---

## ۷) چیزهایی که این کلاینت هنوز به API وصل نکرده

- جستجوی هدر سایت  
- ثبت‌نام / پرداخت / enroll (دکمه‌ها placeholder)  
- CRUD روی `slug` / `category` / `price` / `thumbnail` در فرم دورهٔ ادمین  

برای تکمیل بیزنس، یا API با پیش‌فرض‌ها پر شود یا UI گسترش یابد.

---

## ۸) مرجع کد تایپ‌ها در مخزن

تعریف دقیق فیلدها: **`src/lib/api/types.ts`**.
