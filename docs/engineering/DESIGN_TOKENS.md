# Design tokens (Ola 1)

Source of truth for product UI: `src/app/globals.css`.

## Not visual sources

`docs/13_*.html` are **domain/flow** references (SICLI analysis, HITL, prototypes). Do **not** copy their SPEI DS colors, Open Sans/Inter stacks, or navy marketing look into the app.

## Direction

Cursor-like tool UI: zinc neutrals, warm orange accent, Geist, first-class **light and dark**.

| Token role | Light | Dark |
|---|---|---|
| Background `--bg` | `#f7f7f8` | `#0c0c0d` |
| Surface `--surface` | `#ffffff` | `#141416` |
| Ink `--ink` | `#141414` | `#ededed` |
| Muted `--muted` | `#71717a` | `#71717a` |
| Line `--line` | `#e4e4e7` | `#27272a` |
| Primary accent | `#e85d04` | `#f97316` |
| Action (primary button) | near-black `#141414` | near-white `#ededed` |

Fonts: `Geist Sans` / `Geist Mono` via `next/font` → `--font-geist-sans` / `--font-geist-mono`.

Radius default: `--radius: 8px`. Status greens/ambers/reds are semantic only (`--ok`, `--warn`, `--fail`).

## Banned for product UI

- SPEI navy / purple / gold marketing palette
- Purple-on-white or purple→indigo gradients
- Reintroducing DS SPEI 3.0 as the app theme

Theme toggle: `src/components/ThemeToggle.tsx` + `class="dark"` on `<html>`.
