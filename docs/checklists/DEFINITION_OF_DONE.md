# Definition of Done

A story/PR is done when:

1. **Acceptance criteria** met and demoable on the target wave (ola 1 Vercel or ola 2 API).
2. **Boundaries respected:** Maak = Persona/Case; no SPEI/Account ownership.
3. **Quality:** lint + build green; no console/type debt introduced without note.
4. **i18n rule:** code EN, UI ES.
5. **Design:** Cursor-like zinc + warm orange tokens; both themes OK for UI work.
6. **Security:** no credentials committed; site gate ≠ RBAC; PII minimized.
7. **Traceability:** Jira MAAK issue updated; ADRs/docs updated if decision changed.
8. **Adapters:** new vendor code only under agreed adapter paths.

See also `PR_CHECKLIST.md` and `.cursor/rules/99-pr-dod.mdc`.
