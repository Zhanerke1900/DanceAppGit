## Running the code

Frontend:

```bash
npm i
npm run dev
```

Backend:

```bash
cd server
npm i
npm run dev
```

## Deploy

### Vercel

The frontend is ready for Vercel via `vercel.json`.

Set this environment variable in Vercel:

```bash
VITE_API_URL=https://your-service.up.railway.app
```

### Railway

The backend is ready for Railway via `server/railway.json`.

For an isolated monorepo on Railway:

```bash
Root Directory: /server
Config as Code path: /server/railway.json
Start Command: npm start
```

Set these backend environment variables in Railway:

```bash
MONGO_URI=...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
QR_SECRET=...
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
FRONTEND_URLS=http://localhost:5173,https://your-frontend.vercel.app
BACKEND_URL=https://your-service.up.railway.app
FREEDOMPAY_MERCHANT_ID=...
FREEDOMPAY_SECRET_KEY=...
FREEDOMPAY_INIT_URL=https://api.freedompay.kz/init_payment
FREEDOMPAY_CURRENCY=KZT
FREEDOMPAY_TESTING_MODE=1
MAIL_PROVIDER=gmail
MAIL_LOG_FALLBACK=true
MAIL_LOG_COPY=false
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REDIRECT_URI=https://developers.google.com/oauthplayground
GMAIL_REFRESH_TOKEN=...
GMAIL_SENDER=yourgmail@gmail.com
GMAIL_FROM="DanceTime <yourgmail@gmail.com>"
```

`FRONTEND_URLS` supports multiple comma-separated origins, which is useful if you want local development and production frontend to work at the same time.

Freedom Pay uses these public backend callbacks:

```text
Result URL: https://your-service.up.railway.app/api/payment/result
Check URL: https://your-service.up.railway.app/api/payment/check
Success URL: https://your-service.up.railway.app/api/payment/success
Failure URL: https://your-service.up.railway.app/api/payment/failure
```

For Gmail API, create a Google Cloud project, enable Gmail API, create OAuth 2.0 credentials, and generate a refresh token for the Gmail account that will send mail. This provider uses HTTPS API calls, not SMTP, so it works on Railway plans where SMTP is blocked.

For Resend, create an API key and verify a sending domain or subdomain before using your `RESEND_FROM` address.

SMTP variables are still supported as a fallback for local use or hosts that allow SMTP.

If you want a temporary Railway-only workaround while Resend is broken, set:

```bash
MAIL_PROVIDER=log
```

In `log` mode the backend does not try to deliver the message externally. Instead it prints the email payload to Railway logs so you can copy verification/reset links and inspect outgoing mail content. With `MAIL_LOG_FALLBACK=true`, failed Gmail API, Resend, or SMTP sends also fall back to log output automatically. With `MAIL_LOG_COPY=true`, Railway logs get a copy of the email even when the provider reports success.
