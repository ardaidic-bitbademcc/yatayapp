#!/usr/bin/env bash
set -euo pipefail

# GitHub Secrets Setter for this repo
# - Requires: gh CLI authenticated (gh auth status)
# - Usage:
#   SECRETS_FILE="scripts/secrets/.env.secrets" ./scripts/set-github-secrets.sh [owner/repo]
#   or export variables in your shell and run without SECRETS_FILE
#
# Supported secrets (repo-level):
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   DEMO_SETUP_TOKEN
#   VERCEL_TOKEN
#   VERCEL_ORG_ID
#   VERCEL_PROJECT_ID
#
# Optional:
#   DRY_RUN=1   # Only print what would be set

REPO_SLUG=${1:-}
if [[ -z "${REPO_SLUG}" ]]; then
  origin_url=$(git config --get remote.origin.url || true)
  if [[ -z "${origin_url}" ]]; then
    echo "[ERR] Could not determine repo slug. Pass owner/repo as first arg." >&2
    exit 1
  fi
  # Parse owner/repo from URL forms
  if [[ "${origin_url}" =~ ^https://github.com/([^/]+)/([^/]+)(\.git)?$ ]]; then
    REPO_SLUG="${BASH_REMATCH[1]}/${BASH_REMATCH[2]%.git}"
  elif [[ "${origin_url}" =~ ^git@github.com:([^/]+)/([^/]+)(\.git)?$ ]]; then
    REPO_SLUG="${BASH_REMATCH[1]}/${BASHREMATCH[2]%.git}"
  else
    echo "[ERR] Unsupported remote URL: ${origin_url}" >&2
    exit 1
  fi
fi

echo "[INFO] Target repo: ${REPO_SLUG}"

# Load from .env file if provided
SECRETS_FILE=${SECRETS_FILE:-scripts/secrets/.env.secrets}
if [[ -f "${SECRETS_FILE}" ]]; then
  echo "[INFO] Loading secrets from ${SECRETS_FILE}"
  set -a
  # shellcheck disable=SC1090
  source "${SECRETS_FILE}"
  set +a
else
  echo "[INFO] ${SECRETS_FILE} not found. Expecting values from current environment."
fi

required=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  DEMO_SETUP_TOKEN
  VERCEL_TOKEN
  VERCEL_ORG_ID
  VERCEL_PROJECT_ID
)

missing=()
for key in "${required[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    missing+=("${key}")
  fi
done

if (( ${#missing[@]} > 0 )); then
  echo "[WARN] Missing values for: ${missing[*]}"
  echo "       Populate them in ${SECRETS_FILE} or export in your shell."
fi

set_secret() {
  local name="$1"; shift
  local value="${!name:-}"
  if [[ -z "${value}" ]]; then
    echo "[SKIP] ${name} is empty. Skipping."
    return 0
  fi
  if [[ -n "${DRY_RUN:-}" ]]; then
    echo "[DRY] gh secret set ${name} --repo ${REPO_SLUG} --body ********"
    return 0
  fi
  echo "[SET ] ${name}"
  local out
  if ! out=$(printf "%s" "${value}" | gh secret set "${name}" --repo "${REPO_SLUG}" --body - 2>&1 >/dev/null); then
    if [[ "$out" == *"HTTP 403: Resource not accessible by integration"* ]]; then
      echo "[ERR] 403 while setting ${name}: Current token lacks permission to write repo Actions secrets." >&2
      echo "     Fix: Use gh auth login with a Personal Access Token (classic) with scopes: repo, workflow (or a fine-grained token with repo access and Actions/Admin write)." >&2
    else
      echo "[ERR] Failed to set ${name}: $out" >&2
    fi
    return 1
  fi
}

# Prefer credentials store over CI-provided env tokens
GH_CMD=(env -u GITHUB_TOKEN -u GH_TOKEN gh)

# Verify gh auth
if ! "${GH_CMD[@]}" auth status >/dev/null 2>&1; then
  echo "[ERR] gh CLI is not authenticated. Run: gh auth login" >&2
  exit 1
fi

# Apply all
for key in "${required[@]}"; do
  set_secret "${key}"

done

echo "[DONE] Secrets set (where values provided)."
