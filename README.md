# Strength Training

Personal mobile-first strength app. Home shows today's Plan A/B/C workout. Progress holds history, the plan editor, and a simple review list.

## Firebase setup

1. Create a Firebase project.
2. Enable **Authentication → Google**.
3. Add authorized domains: `localhost` and `rinijo.github.io`.
4. Enable **Firestore**.
5. Add a **Web app** and copy the config values.
6. Copy `.env.example` to `.env` and fill in the `VITE_*` values. Do not commit `.env`.
7. Publish `firestore.rules` (signed-in users only):

```
allow read, write: if request.auth != null;
```

Any signed-in Google account can read and write the shared data.

## Local development

```bash
npm install
npm run dev
```

## GitHub Pages

The production URL is `https://rinijo.github.io/health-and-fitness/`.

1. In the GitHub repo, add these **Actions secrets** (same values as `.env`):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
2. Settings → Pages → Source: **GitHub Actions**.
3. Push to `main`. The workflow builds and deploys `dist`.
