/**
 * Reading the library
 * ────────────────────────────────────────────────────────────────
 * What the Contributors page needs to know about the controllers that
 * are already in the library: their ids, their versions with the YAML
 * text, the manifest and the changelog of a release. Everything comes
 * from the files that are built into the site; nothing is fetched.
 */

import {
  blueprintsContext,
  changelogsContext,
} from '@site/src/utils/libraryContexts'
import type { ExistingVersion } from '@library/format/controllerUpdate.mjs'

const VERSION_FILE =
  /^\.\/controllers\/([^/]+)\/([^/]+)\/([^/]+)\/(\d{4}\.\d{2}\.\d{2})\/([^/]+)\.ya?ml$/

const has = (context: { keys(): string[] }, key: string) =>
  context.keys().includes(key)

/** ids of the controllers that are already in the library, sorted */
export function controllerIds(): string[] {
  const ids = new Set<string>()
  for (const key of blueprintsContext.keys()) {
    const match = /^\.\/controllers\/([^/]+)\//.exec(key)
    if (match) ids.add(match[1])
  }
  return [...ids].sort()
}

/** every version of a controller, in the same order as the command line */
export function versionsOf(id: string): ExistingVersion[] {
  const out: ExistingVersion[] = []
  for (const key of blueprintsContext.keys()) {
    const match = VERSION_FILE.exec(key)
    if (!match || match[1] !== id || match[5] !== id) continue
    out.push({
      library: match[2],
      release: match[3],
      version: match[4],
      text: String(blueprintsContext(key)),
    })
  }
  const order = (v: ExistingVersion) => [v.library, v.release, v.version]
  return out.sort((a, b) => {
    const [x, y] = [order(a), order(b)]
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1
    return 0
  })
}

/** manifest.yaml of a controller, or an empty text */
export function manifestTextOf(id: string): string {
  const key = `./controllers/${id}/manifest.yaml`
  return has(blueprintsContext, key) ? String(blueprintsContext(key)) : ''
}

/**
 * changelog.json of a release, as text. The site holds it as data; written
 * out again with two spaces it is the same text as the file in the library.
 */
export function changelogTextOf(
  id: string,
  library: string,
  release: string,
): string {
  const key = `./controllers/${id}/${library}/${release}/changelog.json`
  if (!has(changelogsContext, key)) return '[]'
  return `${JSON.stringify(changelogsContext(key), null, 2)}\n`
}
