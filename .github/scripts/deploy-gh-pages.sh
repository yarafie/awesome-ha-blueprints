#!/usr/bin/env bash
#
# Publishes a built folder to a branch of this repository (the live site).
# Used by .github/workflows/ci.yml in place of a third-party deploy action.
#
#   FOLDER        folder to publish, for example website/build
#   BRANCH        branch to publish to, for example gh-pages
#   COMMIT_NAME   author name for the deploy commit   (optional)
#   COMMIT_EMAIL  author email for the deploy commit  (optional)
#
# Behaviour, the same as the action it replaces:
#   - the branch ends up with exactly the content of FOLDER
#   - history is kept, one new commit per deploy, never a force push
#   - when nothing changed, no commit is made
#
# It runs in the repository checked out by actions/checkout and uses the
# credentials that step stored. It never reads a token itself.

set -euo pipefail

: "${FOLDER:?FOLDER is not set}"
: "${BRANCH:?BRANCH is not set}"
NAME="${COMMIT_NAME:-${GITHUB_ACTOR:-github-actions[bot]}}"
EMAIL="${COMMIT_EMAIL:-${GITHUB_ACTOR:-github-actions[bot]}@users.noreply.github.com}"

step() { echo "[$1/5] $2"; }

step 1 "Checking the folder to publish: ${FOLDER}"
if [[ ! -s "${FOLDER}/index.html" ]]; then
  echo "::error::${FOLDER}/index.html is missing or empty. Refusing to publish, the site was not touched."
  exit 1
fi
SOURCE="$(cd "${FOLDER}" && pwd)"
echo "      $(find "${SOURCE}" -type f | wc -l) files"

step 2 "Fetching the current ${BRANCH} branch"
git fetch --quiet --depth 1 origin "refs/heads/${BRANCH}"
OLD="$(git rev-parse FETCH_HEAD)"
echo "      ${BRANCH} is at ${OLD:0:7}"

step 3 "Replacing its content with ${FOLDER}"
WORK="$(mktemp -d "${RUNNER_TEMP:-/tmp}/deploy-XXXXXX")"
trap 'git worktree remove --force "${WORK}" >/dev/null 2>&1 || true' EXIT
git worktree add --quiet --detach "${WORK}" "${OLD}"
find "${WORK}" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -a "${SOURCE}/." "${WORK}/"
git -C "${WORK}" add -A .

step 4 "Comparing with what is published"
if git -C "${WORK}" diff --cached --quiet; then
  echo "      Nothing changed. The site is already up to date, no commit made."
  exit 0
fi
git -C "${WORK}" diff --cached --shortstat | sed 's/^ */      /'

step 5 "Committing and pushing to ${BRANCH}"
MESSAGE="🤖 Deploy static site for change: $(git log -1 --pretty=%B HEAD)"
git -C "${WORK}" -c user.name="${NAME}" -c user.email="${EMAIL}" \
  commit --quiet --no-verify -m "${MESSAGE}"
NEW="$(git -C "${WORK}" rev-parse HEAD)"
# Pushed from the main checkout, where actions/checkout stored the credentials.
# Not a force push: if the branch moved in the meantime this fails and the
# site is left as it was.
git push --quiet origin "${NEW}:refs/heads/${BRANCH}"
echo "      ${BRANCH}: ${OLD:0:7} -> ${NEW:0:7}"
