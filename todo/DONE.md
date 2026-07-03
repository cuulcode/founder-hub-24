# DONE

Completed work with date and short implementation notes.

## 2026-07-03 — Capacitor Android + APK CI pipeline
- Installed `@capacitor/core`, `@capacitor/android`, `@capacitor/cli`.
- Added `capacitor.config.ts` (appId `app.lovable.394ea0a206c842e3bceaf8143da9f098`, appName `founder-hub-24`, `webDir: "dist"`, hot-reload server URL pointing at the Lovable sandbox preview).
- Added `.github/workflows/android.yml`: on push to `main`, installs Node 20 + Java 17 + Android SDK, runs `npm install`, `npm run build`, `npx cap add android` (idempotent), `npx cap sync android`, `./gradlew assembleDebug`, then publishes `app-debug.apk` to the `app-latest` release via `softprops/action-gh-release@v2` (`prerelease: false`, `make_latest: true`).
- Added `src/components/DownloadAndroidButton.tsx` with `<a href download>` pointing at `releases/download/app-latest/app-debug.apk`. Repo user/name are placeholders and must be filled in by the user.
- Added `src/lib/platform.ts` exposing `isNative()` and `getAuthRedirectUrl()` — native returns `app.lovable.394ea0a206c842e3bceaf8143da9f098://...`, web returns `${origin}${path}`. Use this for `supabase.auth.signInWithOAuth({ options: { redirectTo } })`.

## 2026-07-03 — Project tracking system
- Created `/todo` with `TODO.md`, `IN_PROGRESS.md`, `DONE.md`. Populated initial sweep of gaps (Hermes integration, security, UX, a11y).
