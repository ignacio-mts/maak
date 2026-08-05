---
name: maak-ux-log
description: "Use when making or changing a Maak UX/UI product decision — document it in docs/ux so agents and humans do not re-litigate."
---

# Maak UX decision log

## When to use

Any non-trivial change to flows, field ownership (operator vs LLM), copy patterns, or interaction that should persist beyond the PR chat.

## Workflow

1. Read `docs/ux/UX_PATTERNS.md` and `docs/ux/README.md`.
2. If this **changes** a settled pattern:
   - Create `docs/ux/UXDR-00N_Short_Title.md` from `docs/ux/TEMPLATE_UXDR.md`.
   - Set Status: Accepted.
   - Update the matching section in `UX_PATTERNS.md`.
   - Add a row to the index in `docs/ux/README.md`.
   - Update `.cursor/rules/40-frontend-backoffice.mdc` and/or `41-onboarding-ux.mdc` with a short must/must-not.
3. If an old UXDR is replaced: mark it `Superseded by UXDR-00N` (do not delete).
4. Tick PR checklist item for UX documentation.

## Do not

- Put UX SoT only in Notion/Slack/PR comments.
- Treat `docs/13_*.html` as visual or interaction SoT.
- Re-introduce field locking during recognition (see UXDR-002) unless a new UXDR supersedes it.
