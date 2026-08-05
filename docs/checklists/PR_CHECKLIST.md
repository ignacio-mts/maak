# PR checklist

- [ ] Scope matches ola (1 = mock UI/docs; 2 = API/adapters)
- [ ] No Account / SPEI / CLABE / saldos in Maak UI or API surface
- [ ] VERIFICADA vs ACTIVA language correct in copy and docs
- [ ] Code identifiers English; user-visible strings Spanish
- [ ] UI uses tokens from `src/app/globals.css` (no SPEI navy/purple/gold)
- [ ] Light **and** dark checked for UI changes
- [ ] Face/liveness only via FaceBinding port; no vendor SDK outside `src/adapters/face/`
- [ ] Password gate changes do not pretend to be RBAC
- [ ] PII: no secrets/PII in mocks beyond synthetic fixtures; no real biometrics
- [ ] `npm run lint` and `npm run build` pass (code PRs)
- [ ] Linked Jira issue (MAAK); Notion not used for tracking
