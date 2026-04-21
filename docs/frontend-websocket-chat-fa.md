# WebSocket چت — قرارداد فرانت با Django (Channels + Daphne)

بک‌اند با **channels** و **daphne**، `ASGI_APPLICATION`، لایهٔ کانال (در dev معمولاً **InMemory**؛ در production چند worker بدون **Redis** broadcast بین پروسه‌ها کار نمی‌کند).

**کد مرجع سمت سرور:** `core/asgi.py`، `courses/routing.py` (`/ws/chat/`)، `courses/consumers.py` (`ChatConsumer`)، `courses/middleware_jwt_ws.py` (خواندن `?token=<access_jwt>` و پر کردن `scope["user"]`).

---

## ۱) نصب و اجرای سرور (برای تیم فرانت / DevOps)

بعد از `git pull` روی بک‌اند:

```bash
pip install -r requirements.txt   # channels, daphne
python manage.py runserver
# یا
daphne -b 127.0.0.1 -p 8000 core.asgi:application
```

---

## ۲) URL اتصال (مرورگر)

نمونهٔ محلی:

```text
ws://127.0.0.1:8000/ws/chat/?token=<access_jwt>
```

روی HTTPS سایت: **`wss://`** همان هاست API.

- توکن همان **`access`** برگشتی از **`POST /api/v1/login/`** است.
- **SIMPLE_JWT:** روی بک‌اند `USER_ID_CLAIM = "user_id"` با claim فرانت و پیام **`connected`** یکی است.

### پروکسی Next (فقط HTTP)

اگر مرورگر API را از **`/api-backend/`** می‌گیرد ولی WebSocket به Next وصل نمی‌شود، یکی از این دو را انجام دهید:

1. **WebSocket را هم** از reverse proxy به Django با پشتیبانی از `Upgrade` تونل کنید، یا  
2. در فرانت متغیر **`NEXT_PUBLIC_WS_URL`** را بگذارید (مثلاً `ws://127.0.0.1:8000`) تا سوکت **مستقیم** به هاست API باز شود.

در `src/lib/api/config.ts` تابع **`getWsChatUrl`** و **`getWsOrigin`** این منطق را پیاده کرده‌اند.

---

## ۳) اولین پیام از سرور (بعد از `open`)

برای تراز حباب‌ها با JWT:

```json
{ "type": "connected", "user_id": <number> }
```

---

## ۴) ارسال پیام زنده (کلاینت → سرور)

```json
{
  "type": "send",
  "recipient": <number>,
  "body": "<string>",
  "course": <number | null>
}
```

سرور پیام را در مدل **همان `Message` REST** ذخیره می‌کند و برای **فرستنده و گیرنده** (اگر آنلاین باشد) broadcast می‌کند.

---

## ۵) دریافت پیام (سرور → کلاینت)

```json
{
  "type": "message",
  "message": { "... همان شکل شیء REST Message ..." }
}
```

کلاینت با **`coerceMessage`** در `src/lib/api/messages.ts` آن را نرمال می‌کند.

### سایر نوع‌ها

| `type` | نقش |
|--------|-----|
| `ping` | در صورت JSON؛ فرانت می‌تواند `{ "type": "pong" }` برگرداند (در کنار ping سطح WebSocket). |
| `error` | نمایش خطا؛ بدنه ممکن است `detail` یا `message` (رشته) داشته باشد. |

---

## ۶) REST — تاریخچه و fallback

- **تاریخچه:** `GET /api/v1/messages/?limit=200&offset=0` (و فیلتر `course` در صورت نیاز).  
- **ارسال بدون WS یا در صورت قطع سوکت:** `POST /api/v1/messages/` با همان بدنهٔ REST.

---

## ۷) مدرس — گفتگو با دانشجوی خاص

1. `GET /api/v1/courses/{id}/students/` (فقط مدرس همان دوره یا ادمین) — پاسخ با **`user`** + **`enrolled_at`**.  
2. سپس همان **`send`** روی WebSocket (یا `POST /messages/`) با **`recipient` = user.id**.

فرانت: **`listCourseStudents`** در `src/lib/api/courses.ts`؛ UI چت در مودال «گفتگوی جدید» بخش **با دانشجو**.

---

## ۸) فرانت این ریپو

- هوک **`useChatWebSocket`** در `src/lib/realtime/use-chat-websocket.ts`  
- صفحهٔ **`ChatRoom`** (`src/components/messages/chat-room.tsx`) در صورت **`open`** بودن سوکت، ارسال را اول با WS انجام می‌دهد وگرنه REST.
