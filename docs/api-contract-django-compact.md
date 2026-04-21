# قرارداد API (فشرده) — سرور Django

همهٔ مسیرهای HTTP زیر با پیشوند **`/api/v1/`** (مگر جدا گفته شود). WebSocket در جدول جدا آمده است.

**جزئیات پیام real-time:** [`frontend-websocket-chat-fa.md`](./frontend-websocket-chat-fa.md)

---

## عمومی (بدون JWT)

| متد | مسیر |
|-----|------|
| GET | `/courses/` |
| GET | `/courses/{id}/` |
| GET | `/stats/` |
| POST | `/newsletter/` |

---

## احراز (بدون JWT روی خود endpoint)

| متد | مسیر |
|-----|------|
| POST | `/login/` |
| POST | `/register/` |
| POST | `/auth/register/` |
| POST | `/refresh-token/` |

کلاینت فعلی ثبت‌نام را پیش‌فرض روی **`/auth/register/`** می‌زند؛ با **`NEXT_PUBLIC_API_REGISTER_PATH`** می‌توان مثلاً `register/` را انتخاب کرد (در `src/lib/api/config.ts`).

---

## WebSocket (با JWT در query)

| | مسیر |
|--|------|
| WS | `/ws/chat/?token=<access_jwt>` |

**یادداشت:** اگر ASGI روی همان origin Django است، URL کامل معمولاً `ws(s)://<host>/ws/chat/?token=…` است؛ اگر از پروکسی Next عبور می‌کنید، **`NEXT_PUBLIC_WS_URL`** در فرانت یا پشتیبانی **`Upgrade`** در پروکسی.

**پیام‌ها:** بعد از اتصال `{ "type": "connected", "user_id" }`؛ ارسال `{ "type": "send", "recipient", "body", "course" }`؛ دریافت `{ "type": "message", "message": {…} }` — جزئیات: [`frontend-websocket-chat-fa.md`](./frontend-websocket-chat-fa.md).

---

## با JWT

| متد | مسیر | توضیح کوتاه |
|-----|------|--------------|
| GET | `/courses/{id}/students/` | لیست دانشجویان ثبت‌نام‌شده (مدرس/ادمین) |
| POST | `/courses/{id}/enroll/` | ثبت‌نام در دوره |
| GET | `/courses/{id}/curriculum/` | همان درخت کامل؛ فقط در صورت enroll یا مدرس/ادمین |
| GET | `/courses/{id}/enrollments/` | لیست ثبت‌نام‌ها/دانشجویان؛ فقط مدرس/ادمین دوره |
| GET | `/enrollments/` | «دوره‌های من» |
| GET, POST | `/messages/` | روی GET اختیاری: `?course=` |
| GET | `/grades/` | فهرست نمره‌ها؛ برای مدرس فیلتر `?course=` |
| GET, PATCH | `/grades/{id}/` | جزئیات یک نمره؛ به‌روزرسانی (مدرس/ادمین) |
| * | `/modules/`, `/lessons/`, `/contents/` | CRUD + فیلتر query |

اگر بک‌اند فقط یکی از **`students/`** یا **`enrollments/`** را پیاده کند، serializer متفاوت است؛ فرانت هر دو را در `src/lib/api/courses.ts` پشتیبانی می‌کند.

---

## خطا و صفحه‌بندی

- **خطا (DRF):** `detail` / `non_field_errors` / خطاهای فیلدمحور.
- **صفحه‌بندی:** `count`, `next`, `previous`, `results`.
