#!/usr/bin/env node
import fs from 'node:fs'

/* =========================================================
   Helpers
   ========================================================= */
function ok(msg) {
  console.log(`✅    ${msg}`)
  process.exit(0)
}

function fail(msg) {
  console.error(`❌    ${msg}`)
  process.exit(1)
}

function readLines(file) {
  if (!fs.existsSync(file)) return []
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

function isDate(v) {
  return /^\d{4}\.\d{2}\.\d{2}$/.test(v)
}

function isSimpleId(v) {
  return /^[a-z0-9_]+$/.test(v)
}

function isLibId(v) {
  return /^[a-zA-Z0-9_-]+$/.test(v)
}

/* =========================================================
   Entry
   ========================================================= */
const [, , branchName, diffFile] = process.argv

if (!branchName || !diffFile) {
  fail(
    `Internal validation error.
This is not your fault.
Please report this to the maintainers.`,
  )
}

/* =========================================================
   Contributors only (maintainers never reach this file)
   ========================================================= */
if (!branchName.startsWith('ahb_contrib/')) {
  ok('Non-contributor branch – branch-scope validation skipped')
}

/* =========================================================
   Changed files (already library-filtered upstream)
   ========================================================= */
const changedFiles = readLines(diffFile)

if (changedFiles.length === 0) {
  fail(
    `No blueprint files were detected in this pull request.

AHB validation only runs when files under:
  website/docs/blueprints/<category>/**

are modified.`,
  )
}

/* =========================================================
   Branch parsing — Library Tree v2.0
   ========================================================= */
/*
  Required format:
  ahb_contrib/<category>/<blueprint_id>/<library_id>/<release_id>/<YYYY.MM.DD>/author-<user>
*/
const parts = branchName.split('/')

if (parts.length !== 7) {
  fail(
    `Invalid branch name format.

Your branch:
  ${branchName}

Expected format:
  ahb_contrib/<category>/<blueprint_id>/<library_id>/<release_id>/<YYYY.MM.DD>/author-<your-github-username>

Example:
  ahb_contrib/controllers/ikea_e2001_e2002/EPMatt/awesome/2025.11.16/author-epmatt`,
  )
}

const [, category, blueprintId, libraryId, releaseId, version, author] = parts

if (!['controllers', 'hooks', 'automations'].includes(category)) {
  fail(
    `Invalid blueprint category.

Found:
  ${category}

Allowed values:
  controllers
  hooks
  automations`,
  )
}

if (!isSimpleId(blueprintId)) {
  fail(
    `Invalid blueprint_id.

Found:
  ${blueprintId}

Rules:
  - lowercase letters
  - numbers
  - underscores only

Example:
  ikea_e2001_e2002`,
  )
}

if (!isLibId(libraryId)) {
  fail(
    `Invalid library_id.

Found:
  ${libraryId}

Rules:
  - letters, numbers
  - dashes and underscores allowed

Example:
  EPMatt`,
  )
}

if (!isLibId(releaseId)) {
  fail(
    `Invalid release_id.

Found:
  ${releaseId}

Rules:
  - letters, numbers
  - dashes and underscores allowed

Example:
  awesome`,
  )
}

if (!isDate(version)) {
  fail(
    `Invalid version folder.

Found:
  ${version}

Expected format:
  YYYY.MM.DD

Example:
  2025.11.16`,
  )
}

if (!author.startsWith('author-')) {
  fail(
    `Invalid author segment.

Found:
  ${author}

Expected format:
  author-<your-github-username>

Example:
  author-yarafie`,
  )
}

/* =========================================================
   Filesystem scope — single blueprint only
   ========================================================= */
const expectedPrefix = `website/docs/blueprints/${category}/${blueprintId}/`

for (const file of changedFiles) {
  if (!file.startsWith(expectedPrefix)) {
    fail(
      `File outside allowed blueprint scope.

File:
  ${file}

This contributor branch is only allowed to modify files under:
  ${expectedPrefix}

If you need to modify multiple blueprints,
please open separate pull requests.`,
    )
  }
}

ok('Contributor branch name and single-blueprint scope validated')
