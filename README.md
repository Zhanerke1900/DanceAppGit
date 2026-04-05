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
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM="DanceTime <onboarding@your-domain.com>"
```

`FRONTEND_URLS` supports multiple comma-separated origins, which is useful if you want local development and production frontend to work at the same time.

For Resend, create an API key and verify a sending domain or subdomain before using your `RESEND_FROM` address.

SMTP variables are still supported as a fallback, but Resend is the recommended option for hosted deployments.
