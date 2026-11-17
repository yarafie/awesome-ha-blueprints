#!/usr/bin/env bash
#
# Commits library_report.md to the branch that was pushed, when the website
# build changed it. Used by .github/workflows/ci.yml after the deploy step.
#
# Only library_report.md is ever committed. Nothing is force pushed. This
# script never fails the job: if the commit cannot be pushed (for example
# because the branch moved in the meantime) it prints a warning and the next
# build takes care of it.
#
# It runs in the repository checked out by actions/checkout and uses the
# credentials that step stored. A commit pushed this way does not start
# another workflow run.

set -uo pipefail

FILE="library_report.md"
BRANCH="${GITHUB_REF_NAME:?GITHUB_REF_NAME is not set}"

step() { echo "[$1/3] $2"; }
give_up() {
  echo "::warning::${FILE} was not committed: $1"
  exit 0
}

step 1 "Checking whether the build changed ${FILE}"
if [[ ! -f "${FILE}" ]]; then
  give_up "the file does not exist"
fi
if git diff --quiet -- "${FILE}"; then
  echo "      Unchanged, nothing to commit."
  exit 0
fi
git diff --shortstat -- "${FILE}" | sed 's/^ */      /'

step 2 "Committing ${FILE}"
git -c user.name="github-actions[bot]" \
  -c user.email="41898282+github-actions[bot]@users.noreply.github.com" \
  commit --quiet --no-verify -m "[Docs] Update library report" -- "${FILE}" ||
  give_up "git commit failed"
NEW="$(git rev-parse HEAD)"

step 3 "Pushing to ${BRANCH}"
if ! git push --quiet origin "${NEW}:refs/heads/${BRANCH}"; then
  give_up "the push to ${BRANCH} was rejected (the branch probably moved)"
fi
echo "      ${BRANCH} is now at ${NEW:0:7}"
