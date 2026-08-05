#!/usr/bin/env bash
# One-shot deploy of the Maak ola-1 prototype to Vercel (Ignacio's account).
#
# Access control is the Next.js iron-session gate (/login + SITE_PASSWORD),
# NOT Vercel Deployment Protection / Password Protection (Pro plan).
# Prefer docs/deploy/VERCEL_PROTOTYPE.md → Import GitHub if CLI auth is painful.
#
# Prerequisites: `npx vercel login` on your machine (or VERCEL_TOKEN), repo root.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${VERCEL_TOKEN:-}" ]] && ! npx vercel whoami >/dev/null 2>&1; then
  echo "Not logged in. Run: npx vercel login"
  echo "Or export VERCEL_TOKEN=… and re-run this script."
  exit 1
fi

TOKEN_ARGS=()
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  TOKEN_ARGS=(--token "$VERCEL_TOKEN")
fi

if [[ ! -f .vercel/project.json ]]; then
  echo "Linking project (personal scope, repo root)…"
  npx vercel link --yes "${TOKEN_ARGS[@]}"
fi

ensure_env() {
  local name="$1"
  local value="${!name:-}"
  if [[ -z "$value" ]]; then
    echo "Missing $name. Export it or add it in Vercel → Settings → Environment Variables."
    echo "  export $name='…'"
    exit 1
  fi
  # Upsert for production + preview (non-interactive where possible)
  printf '%s' "$value" | npx vercel env add "$name" production --force "${TOKEN_ARGS[@]}" >/dev/null
  printf '%s' "$value" | npx vercel env add "$name" preview --force "${TOKEN_ARGS[@]}" >/dev/null
  echo "Set $name on production + preview"
}

# Default matches src/lib/session.ts prototype fallback.
export SITE_PASSWORD="${SITE_PASSWORD:-loqueviene}"
ensure_env SITE_PASSWORD
if [[ -z "${SESSION_SECRET:-}" ]]; then
  SESSION_SECRET="$(openssl rand -base64 48 | tr -d '\n')"
  export SESSION_SECRET
  echo "Generated SESSION_SECRET (not printed). Export it next time to keep cookies stable."
fi
ensure_env SESSION_SECRET

echo "Deploying production…"
echo "(App gate = /login with SITE_PASSWORD; do not enable Vercel Password Protection.)"
URL="$(npx vercel --prod --yes "${TOKEN_ARGS[@]}")"
echo ""
echo "Prototype URL: $URL"
echo "Open $URL/login — password is SITE_PASSWORD (default: loqueviene)."
