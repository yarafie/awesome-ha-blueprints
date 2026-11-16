#!/usr/bin/env bash
# pr-status-comment.sh
#
# Keeps ONE status comment per pull request and updates it in place.
# The comment text is read from standard input.
#
# Needs: REPO (owner/name), NUMBER (pull request number), GH_TOKEN.
# Uses only GitHub's own `gh` tool and `jq`, both preinstalled on the runners.
set -euo pipefail

: "${REPO:?REPO is required}"
: "${NUMBER:?NUMBER is required}"

if ! [[ "$NUMBER" =~ ^[0-9]+$ ]]; then
  echo "Refusing to comment: '$NUMBER' is not a pull request number." >&2
  exit 1
fi

MARKER='<!-- ahb-ci-status: do not delete/edit this line -->'
body="${MARKER}"$'\n'"$(cat)"

# The status comment is the one written by the Actions bot that starts with
# the marker. Comments by anyone else are never touched.
comment_id="$(
  gh api "repos/${REPO}/issues/${NUMBER}/comments?per_page=100" --paginate |
    jq -r --arg marker "$MARKER" \
      '.[] | select(.user.login == "github-actions[bot]" and (.body | startswith($marker))) | .id' |
    head -n 1
)"

if [[ -n "$comment_id" ]]; then
  gh api --method PATCH "repos/${REPO}/issues/comments/${comment_id}" \
    -f body="$body" >/dev/null
  echo "Updated status comment ${comment_id} on #${NUMBER}."
else
  gh api --method POST "repos/${REPO}/issues/${NUMBER}/comments" \
    -f body="$body" >/dev/null
  echo "Created the status comment on #${NUMBER}."
fi
