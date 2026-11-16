#!/usr/bin/env bash
# pr-status-comment.sh
#
# Bot comments on a pull request. The comment text is read from standard input.
#
#   pr-status-comment.sh status
#       The ONE status comment of the pull request: created once, then
#       updated in place (editing a comment sends no notification).
#
#   pr-status-comment.sh failure
#       Always a NEW comment, so every failure stays in the conversation
#       and the author is notified.
#
#   pr-status-comment.sh success
#       A NEW comment (the author is notified), unless the most recent
#       result comment is already a success: then that one is updated, so
#       repeated passes do not pile up.
#
# Needs: REPO (owner/name), NUMBER (pull request number), GH_TOKEN.
# Uses only GitHub's own `gh` tool and `jq`, both preinstalled on the runners.
set -euo pipefail

MODE="${1:-status}"
: "${REPO:?REPO is required}"
: "${NUMBER:?NUMBER is required}"

if ! [[ "$NUMBER" =~ ^[0-9]+$ ]]; then
  echo "Refusing to comment: '$NUMBER' is not a pull request number." >&2
  exit 1
fi

case "$MODE" in
  status) MARKER='<!-- ahb-ci-status: do not delete/edit this line -->' ;;
  failure) MARKER='<!-- ahb-ci-result failure: do not delete/edit this line -->' ;;
  success) MARKER='<!-- ahb-ci-result success: do not delete/edit this line -->' ;;
  *)
    echo "Unknown mode '$MODE' (use status, failure or success)." >&2
    exit 1
    ;;
esac

body="${MARKER}"$'\n'"$(cat)"

# Only comments written by the Actions bot are ever looked at or changed.
bot_comments="$(
  gh api "repos/${REPO}/issues/${NUMBER}/comments?per_page=100" --paginate |
    jq -s '[.[][] | select(.user.login == "github-actions[bot]")]'
)"

target_id=''
case "$MODE" in
  status)
    target_id="$(jq -r --arg m "$MARKER" \
      '[.[] | select(.body | startswith($m))][0].id // empty' <<<"$bot_comments")"
    ;;
  success)
    # The newest result comment, if (and only if) it is a success.
    target_id="$(jq -r --arg m "$MARKER" \
      '[.[] | select(.body | startswith("<!-- ahb-ci-result "))] | last
       | if . != null and (.body | startswith($m)) then .id else empty end' \
      <<<"$bot_comments")"
    ;;
esac

if [[ -n "$target_id" ]]; then
  gh api --method PATCH "repos/${REPO}/issues/comments/${target_id}" \
    -f body="$body" >/dev/null
  echo "Updated ${MODE} comment ${target_id} on #${NUMBER}."
else
  gh api --method POST "repos/${REPO}/issues/${NUMBER}/comments" \
    -f body="$body" >/dev/null
  echo "Posted a new ${MODE} comment on #${NUMBER}."
fi
