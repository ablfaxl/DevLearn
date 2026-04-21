# PRD DevLearn ↔ پیاده‌سازی فعلی کلاینت (Next.js)

نسخهٔ PRD مرجع: **۱.۰** (Udemy/Coursera-like LMS). این سند نگاشت **موجودیت‌ها و جریان‌ها** به مسیرها و ماژول‌های همین ریپو است.

## موجودیت‌ها (ERD PRD) و وضعیت در کد

| PRD | کلاینت / API |
|-----|----------------|
| **User** (Student/Instructor) | `UserBrief` در `types.ts`؛ نقش‌ها `admin` \| `instructor` \| `student`. ثبت‌نام: `POST …/auth/register/` → `registerUser()` در `auth.ts`؛ صفحه `/register`. |
| **Course** | همان مدل `Course` / `CourseDetail`؛ لیست عمومی و ادمین؛ جزئیات `/courses/[id]`. |
| **Enrollment** | تایپ `Enrollment`؛ `enrollInCourse()` → **`POST /api/v1/courses/{id}/enroll/`**؛ لیست **`GET /api/v1/enrollments/`** (اختیاری). UI: `CourseEnrollPanel` در صفحهٔ دوره. |
| **Module → Lesson → Content** | درخت در `CourseDetail`؛ ادمین CRUD موجود؛ **Classroom** در `/learn/courses/[id]` با آکاردئون + پلیر. |
| **Grade** | تایپ `Grade`؛ `listGrades`، `updateGrade` → `grades/` (بک‌اند باید پیاده کند). UI اختصاصی نمره‌دهی در ادمین هنوز اضافه نشده. |
| **Message** | تایپ `Message`؛ `listMessages` / `sendMessage` → `messages/`؛ صفحه `/messages` (لیست + اسکلت compose). |

## صفحات PRD ↔ مسیر Next

| PRD | مسیر | توضیح |
|-----|------|--------|
| Landing & Search | `/` + جستجو در هدر | جستجو → `/courses?q=…` با `HeaderSearch`. |
| Course Detail | `/courses/[courseId]` | سرفصل + ثبت‌نام + لینک classroom. |
| Learning Dashboard (Course Player) | `/learn/courses/[courseId]` | پلیر/متن وسط، درخت ماژول/درس/محتوا در سایدبار (`CourseLearnWorkspace`). فعلاً داده از **`getPublicCourseDetail`** (مثل PRD public curriculum)؛ وقتی بک‌اند **فقط-enrolled** داد، همان کامپوننت را به `GET courses/{id}/curriculum/` یا endpoint احرازشده وصل کنید. |
| Instructor Studio | `/studio` | **`redirect` → `/admin/courses`**. |
| Messaging UI | `/messages` | لیست از API؛ فرم ارسال کامل بعد از مشخص شدن فیلدهای بک‌اند. |
| ثبت‌نام | `/register` | فرم → `auth/register/` سپس ریدایرکت به `/admin/login?registered=1`. |

## APIهایی که کلاینت فراخوانی می‌کند (انتظار از Django)

همه زیر **`/api/v1/`** (مگر خلافش در env تنظیم شود):

1. **`POST auth/register/`** — بدنه: `username`, `email`, `password`, اختیاری `role`.
2. **`POST courses/{id}/enroll/`** — ثبت‌نام (JWT دانشجو/کاربر).
3. **`GET enrollments/`** — دوره‌های من (اختیاری برای هاب `/learn`).
4. **`GET|POST messages/`** — inbox / ارسال (`MessageSendPayload`: `recipient`, `body`, اختیاری `course`).
5. **`GET|PATCH grades/`** — لیست و به‌روزرسانی نمره.

منطق **فقط دانشجویان enrolled** و **Cascade حذف** سمت سرور است؛ کلاینت فقط قرارداد HTTP را مصرف می‌کند.

## چیزهایی که PRD می‌خواهد و هنوز در UI کامل نیست

- داشبورد «دوره‌های من» با دادهٔ واقعی **`enrollments/`**.
- فرم کامل **ارسال پیام** (نیاز به `recipient` از API یا لیست مخاطبین).
- صفحهٔ **نمره** برای مدرس (جدول دانشجو + `PATCH grades/{id}/`).
- **پیشرفت درس** (progress bar) per lesson — فقط در PRD ذکر شده، در کد نیست.
- **RBAC جدا برای student vs admin login** — فعلاً یک JWT و `/admin/login`؛ می‌توان بعداً `/login` دانشجو اضافه کرد.

برای جزئیات قرارداد کلی API قبلی، `docs/backend-api-contract-fa.md` و `docs/server-api-checklist.md` را ببینید.
