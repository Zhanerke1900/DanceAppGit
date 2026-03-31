# DanceTime auth setup

## What was fixed
- `/api/auth/me` now returns the authenticated user correctly.
- `verify-email` page is now rendered in the frontend.
- `reset-password` page is now rendered in the frontend.
- forgot-password flow in `AuthModal` now handles loading/errors.

## Why verification emails were not arriving
Your backend already supports verification emails, but `server/.env` contains placeholder SMTP values.
Replace them with a real mailbox and app password.

## Recommended SMTP setup (Gmail)
1. Create/use a Gmail account for the project.
2. Turn on 2-Step Verification in Google account settings.
3. Generate a 16-character App Password.
4. Put the real values into `server/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_real_gmail@gmail.com
SMTP_PASS=your_16_char_app_password
SMTP_FROM="DanceTime <your_real_gmail@gmail.com>"
```

## Start the project
### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
npm install
npm run dev
```

## Database
Registered users are already stored in MongoDB in the `users` collection.
Your connection string is:
```env
MONGO_URI=mongodb://127.0.0.1:27017/dancetime
```


## Expected flow
1. User signs up.
2. User document is created in MongoDB with `emailVerified: false`.
3. Backend sends a verification email.
4. User clicks the link.
5. Backend marks `emailVerified: true`.
6. Only then can the user log in.
