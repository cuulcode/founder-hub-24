# TODO

Source of truth for pending work. Move items to `IN_PROGRESS.md` when started, and to `DONE.md` when complete.

## Format
`- [ ] [PRIORITY][CATEGORY] Description — status; deps/blockers`

---

## USER ACTION REQUIRED
- [ ] [CRITICAL][Manual Action] Export project to GitHub (Lovable → GitHub → Connect project) so the Android workflow can run.
- [ ] [CRITICAL][Manual Action] Set repo to **Public** (or expect a login-gated download link) so `app-debug.apk` is downloadable.
- [ ] [CRITICAL][Manual Action] Edit `src/components/DownloadAndroidButton.tsx` — replace `YOUR_GITHUB_USER` and `YOUR_REPO_NAME` with your actual GitHub org/user and repo name.
- [ ] [HIGH][Manual Action] After the first push to `main`, wait for the "Latest Android Build" Actions workflow to go green (~3–5 min). Only then does the APK link work.
- [ ] [HIGH][Manual Action] For OAuth on the native app: register the deep-link `app.lovable.394ea0a206c842e3bceaf8143da9f098://` as an allowed redirect in your auth provider settings (only relevant when/if OAuth is enabled).

## Hermes Agent Framework Integration
- [ ] [HIGH][Feature] Vendor `github.com/NousResearch/hermes-agent` orchestration into an edge function (`hermes-orchestrator`).
- [ ] [HIGH][Feature] `agent_jobs` + `agent_steps` + `agent_schedules` tables with RLS scoped to `auth.uid()`.
- [ ] [HIGH][Feature] Tool registry that wraps existing Notes/Tasks/Calendar/Kanban mutations so Hermes can act without duplicating business logic.
- [ ] [MEDIUM][Feature] Activity panel in the UI to monitor jobs/steps in real time (Supabase Realtime channel on `agent_steps`).
- [ ] [MEDIUM][Feature] pg_cron trigger for `agent_schedules` invoking the orchestrator on cadence.
- [ ] [MEDIUM][UX] "Delegate to Hermes" affordance in the existing AI chat for multi-step goals; existing chat stays as-is.

## Android / Capacitor
- [x] [HIGH][Infrastructure] Install Capacitor + Android platform packages.
- [x] [HIGH][Infrastructure] `capacitor.config.ts` with correct appId, appName, webDir=dist, hot-reload server URL.
- [x] [HIGH][Infrastructure] `.github/workflows/android.yml` builds debug APK and publishes as `app-latest` release.
- [x] [HIGH][UI] `DownloadAndroidButton` component.
- [x] [HIGH][Feature] `getAuthRedirectUrl()` helper — native uses custom scheme, web uses origin.
- [ ] [MEDIUM][UX] Mount `<DownloadAndroidButton />` in a visible location (top bar / footer) once repo details are filled in.
- [ ] [LOW][Infrastructure] Add release-signed APK workflow later (requires user to provide keystore secret).

## Known Gaps (discovered during sweep)
- [ ] [HIGH][Security] Confirm RLS + GRANTs on every public table (companies, habits, habit_completions, notes, tasks, calendar_events, kanban_*, chat_history, dictionary, allowed_emails, profiles). Run `security--run_security_scan`.
- [ ] [MEDIUM][UX] Empty states for Dashboard when no active companies exist (currently just shows nothing meaningful).
- [ ] [MEDIUM][UX] Loading skeletons instead of "Loading..." text on Index.
- [ ] [MEDIUM][Reliability] Global error boundary — currently a thrown render error blanks the app.
- [ ] [MEDIUM][A11y] Keyboard focus rings and aria-labels sweep on icon-only buttons across sidebar, kanban, notes.
- [ ] [MEDIUM][Feature] Undo toast after archiving a company (destructive-ish action, currently only confirmable).
- [ ] [LOW][Performance] Debounce interval audit — several inputs use different intervals; unify.
- [ ] [LOW][Docs] Update root README with Capacitor + APK workflow instructions.
