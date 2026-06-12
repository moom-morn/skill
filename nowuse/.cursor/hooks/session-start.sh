#!/usr/bin/env bash
# SessionStart hook for superpowers plugin (Cursor project-level)

set -euo pipefail

# Determine project root (this script is at .cursor/hooks/session-start.sh)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

SKILL_FILE="${PROJECT_ROOT}/agents/skills/using-superpowers/SKILL.md"

using_superpowers_content=$(cat "${SKILL_FILE}" 2>&1 || echo '')

# Escape string for JSON embedding
escape_for_json() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    s="${s//$'\n'/\\n}"
    s="${s//$'\r'/\\r}"
    s="${s//$'\t'/\\t}"
    printf '%s' "$s"
}

escaped_skill=$(escape_for_json "$using_superpowers_content")

session_context="<EXTREMELY_IMPORTANT>\nYou have superpowers.\n\n**Below is the full content of your 'superpowers:using-superpowers' skill - your introduction to using skills. For all other skills, use the 'Skill' tool:**\n\n${escaped_skill}\n</EXTREMELY_IMPORTANT>"

# Cursor uses additional_context
printf '{\n  "additional_context": "%s"\n}\n' "$session_context"

exit 0