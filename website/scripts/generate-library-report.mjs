#!/usr/bin/env node

/**
 * Writes library_report.md in the repository root: a summary of every
 * blueprint, its libraries, releases and versions, and the breaking changes.
 *
 * It reads the JSON files that generate.mjs produces, so it must run after
 * generate.mjs. `pnpm build` in website/ runs it as its last step.
 *
 * The report is formatted with the Prettier installed in this repository, so
 * the committed file always passes the formatting check.
 *
 * The file is only rewritten when its content changes. The "Generated on"
 * date alone never causes a rewrite, so a build on a new day does not show up
 * as a change in git.
 *
 * A problem here never fails the build: it prints a warning and leaves the
 * existing report as it is.
 */

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '../..')
const BLUEPRINTS_DIR = path.join(ROOT, 'website', 'docs', 'blueprints')
const OUTPUT = path.join(ROOT, 'library_report.md')
const CATEGORIES = ['controllers', 'automations', 'hooks']

// ── Helpers ─────────────────────────────────────────────────────────────────

const loadJson = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'))

/** Sub-directories of a directory, sorted by name. */
function subDirs(dir) {
  return fs
    .readdirSync(dir)
    .filter((name) => fs.statSync(path.join(dir, name)).isDirectory())
    .sort()
    .map((name) => path.join(dir, name))
}

/** Names from a list of people given as strings or as {id, name} objects. */
function personList(value) {
  if (!Array.isArray(value)) return []
  return value
    .map((v) => (v && typeof v === 'object' ? v.name || v.id : v))
    .filter((v) => typeof v === 'string' && v)
}

const capitalize = (text) =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()

const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

function localDate() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Descriptions of the breaking changes of one version, from changelog.json. */
function breakingChangesForVersion(releaseDir, version) {
  const changelog = path.join(releaseDir, 'changelog.json')
  if (!fs.existsSync(changelog)) return []
  const data = loadJson(changelog)
  const reasons = []
  for (const entry of Array.isArray(data) ? data : []) {
    if (entry.date !== version) continue
    for (const change of entry.changes ?? []) {
      if (change.breaking !== true) continue
      const reason = (change.description ?? '').trim()
      if (reason) reasons.push(reason)
    }
  }
  return reasons
}

// ── Report ──────────────────────────────────────────────────────────────────

/** The report as plain Markdown, before formatting. */
export function buildReport(
  blueprintsDir = BLUEPRINTS_DIR,
  today = localDate(),
) {
  const lines = []
  const breakingByCategory = {}
  const stats = {}
  let totalBreakingVersions = 0

  for (const category of CATEGORIES) {
    stats[category] = { blueprints: 0, versions: 0 }
    const categoryDir = path.join(blueprintsDir, category)
    if (!fs.existsSync(categoryDir)) continue

    lines.push(`## ${capitalize(category)}\n`)

    for (const blueprintDir of subDirs(categoryDir)) {
      const blueprintJson = path.join(blueprintDir, 'blueprint.json')
      if (!fs.existsSync(blueprintJson)) continue

      const blueprint = loadJson(blueprintJson)
      const blueprintId = blueprint.blueprint_id ?? path.basename(blueprintDir)
      const title =
        blueprint.name ||
        blueprint.title ||
        blueprint.blueprint_id ||
        '<unknown>'
      const tags = blueprint.tags ?? []
      const librarians = personList(blueprint.librarians)

      const allVersions = []
      const libraryMaintainers = new Set()

      for (const libraryDir of subDirs(blueprintDir)) {
        const libraryJson = path.join(libraryDir, 'library.json')
        if (!fs.existsSync(libraryJson)) continue
        const library = path.basename(libraryDir)
        for (const name of personList(loadJson(libraryJson).maintainers)) {
          libraryMaintainers.add(name)
        }

        for (const releaseDir of subDirs(libraryDir)) {
          if (!fs.existsSync(path.join(releaseDir, 'release.json'))) continue
          const release = path.basename(releaseDir)

          for (const versionDir of subDirs(releaseDir)) {
            const versionJson = path.join(versionDir, 'version.json')
            if (!fs.existsSync(versionJson)) continue

            const data = loadJson(versionJson)
            const version = data.version ?? path.basename(versionDir)
            const status = data.status || 'active'
            const reasons = breakingChangesForVersion(releaseDir, version)
            const breaking = reasons.length > 0

            if (breaking) {
              totalBreakingVersions += 1
              ;(breakingByCategory[category] ??= []).push({
                blueprint: blueprintId,
                library,
                release,
                version,
                status,
                reasons,
              })
            }
            allVersions.push({
              library,
              release,
              version,
              status,
              breaking,
              reasons,
            })
          }
        }
      }

      if (allVersions.length === 0) continue

      stats[category].blueprints += 1
      stats[category].versions += allVersions.length

      allVersions.sort(
        (a, b) =>
          compare(a.version, b.version) ||
          compare(a.library, b.library) ||
          compare(a.release, b.release),
      )
      const latest = allVersions[allVersions.length - 1]
      const maintainers = [...libraryMaintainers].sort()

      lines.push(`### ${blueprintId}`)
      lines.push(`- **Title:** ${title}`)
      lines.push(
        `- **Librarians:** ${librarians.length ? librarians.join(', ') : '(none)'}`,
      )
      lines.push(
        `- **Library Maintainers:** ${maintainers.length ? maintainers.join(', ') : '(none)'}`,
      )
      lines.push(
        `- **Latest Version:** ${latest.version}` +
          (latest.breaking ? ' (**🚨 Breaking Change**)' : ''),
      )
      if (tags.length) lines.push(`- **Tags:** ${tags.join(', ')}`)

      lines.push('<details>')
      lines.push('<summary>Versions</summary>\n')
      lines.push('| Library | Release | Version | Status | Breaking |')
      lines.push('|--------|---------|--------|--------|----------|')
      for (const v of allVersions) {
        lines.push(
          `| ${v.library} | ${v.release} | ${v.version} | ${v.status} | ` +
            `${v.breaking ? '**🚨 Breaking Change**' : 'no'} |`,
        )
      }

      const breakingVersions = allVersions.filter((v) => v.breaking)
      if (breakingVersions.length) {
        lines.push('')
        lines.push('**Breaking change reasons:**')
        lines.push('')
        for (const v of breakingVersions) {
          lines.push(`- **${v.library} / ${v.release} / ${v.version}**`)
          for (const reason of v.reasons) lines.push(`  - ${reason}`)
        }
        lines.push('')
      }

      lines.push('</details>\n')
    }
  }

  const out = []
  out.push('# Awesome HA Blueprints – Library Report')
  out.push(`_Generated on ${today}_`)
  out.push('---')
  out.push('## Summary')
  out.push(
    `- **Controllers:** ${stats.controllers.blueprints} blueprints, ${stats.controllers.versions} versions`,
  )
  out.push(
    `- **Automations:** ${stats.automations.blueprints} blueprints, ${stats.automations.versions} versions`,
  )
  out.push(
    `- **Hooks:** ${stats.hooks.blueprints} blueprints, ${stats.hooks.versions} versions`,
  )
  out.push(`- **Breaking versions:** ${totalBreakingVersions}`)
  out.push('---')

  if (Object.keys(breakingByCategory).length) {
    out.push('## 🚨 Breaking Changes Summary (by Category)\n')
    for (const category of CATEGORIES) {
      const entries = breakingByCategory[category]
      if (!entries) continue
      out.push(`### ${capitalize(category)}`)
      for (const b of entries) {
        out.push(
          `- **${b.blueprint}** – ${b.library} / ${b.release} / ${b.version} (${b.status})`,
        )
        for (const reason of b.reasons) out.push(`  - ${reason}`)
      }
      out.push('')
    }
  }

  return [...out, ...lines].join('\n') + '\n'
}

/** The report text without its date, to tell real changes from a new day. */
export const withoutDate = (text) =>
  text.replace(/_Generated on \d{4}-\d{2}-\d{2}_/, '_Generated on (date)_')

/** True when generate.mjs has produced its JSON files. */
function hasGeneratedData() {
  return CATEGORIES.some((category) => {
    const categoryDir = path.join(BLUEPRINTS_DIR, category)
    return (
      fs.existsSync(categoryDir) &&
      subDirs(categoryDir).some((dir) =>
        fs.existsSync(path.join(dir, 'blueprint.json')),
      )
    )
  })
}

async function main() {
  if (!hasGeneratedData()) {
    throw new Error('no generated blueprint.json found, run generate.mjs first')
  }
  const raw = buildReport()

  const prettier = await import('prettier')
  const options = (await prettier.resolveConfig(OUTPUT)) ?? {}
  const formatted = await prettier.format(raw, { ...options, filepath: OUTPUT })

  const current = fs.existsSync(OUTPUT)
    ? fs.readFileSync(OUTPUT, 'utf-8')
    : null
  if (current !== null && withoutDate(current) === withoutDate(formatted)) {
    console.log('library_report.md is up to date')
    return
  }
  fs.writeFileSync(OUTPUT, formatted, 'utf-8')
  console.log('library_report.md updated')
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.warn(
      `Warning: library_report.md was not updated (${error?.message ?? error})`,
    )
  })
}
