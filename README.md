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
VITE_API_URL=https://your-render-backend.onrender.com
```

### Render

The backend is ready for Render via `render.yaml`.

Set these backend environment variables in Render:

```bash
MONGO_URI=...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
QR_SECRET=...
FRONTEND_URL=https://your-frontend.vercel.app
FRONTEND_URLS=http://localhost:5173,https://your-frontend.vercel.app
BACKEND_URL=https://your-render-backend.onrender.com
SMTP_HOST=...
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
```

`FRONTEND_URLS` supports multiple comma-separated origins, which is useful if you want local development and production frontend to work at the same time.
