/**
 * Plugin: libraryDownloaderPlugin
 * ────────────────────────────────────────────────────────────────
 * Docusaurus plugin that generates download routes for all
 * blueprints using the **v1.6 library → release → version**
 * architecture.
 *
 * Routes generated:
 *   /blueprints/<category>/<blueprint_id>
 *   /blueprints/<category>/<blueprint_id>/<library_id>
 *   /blueprints/<category>/<blueprint_id>/<library_id>/<release_id>
 *   /blueprints/<category>/<blueprint_id>/<library_id>/<release_id>/<YYYY.MM.DD>
 *
 * YAML location (v1.6 tree):
 *   docs/blueprints/<category>/<blueprint_id>/<library_id>/<release_id>/<YYYY.MM.DD>/<blueprint_id>.yaml
 *
 * IMPORTANT:
 * ----------
 * Route paths **MUST include library + release** to avoid
 * duplicate routes in Docusaurus.
 *
 * Backward compatible with hooks and automations categories.
 *
 * Changelog:
 *   - Initial version derived from blueprint-downloader-plugin.js (@yarafie)
 *   - Updated 2026.01.04 (@yarafie):
 *       1. Renamed plugin to library-downloader-plugin.js
 *       2. Terminology aligned: variant → library
 *       3. Added release dimension
 *       4. Unified routing across all categories
 *
 * ────────────────────────────────────────────────────────────────
 */
import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'

export default function libraryDownloaderPlugin(context) {
  return {
    name: 'library-downloader-plugin',

    async loadContent() {
      const { siteDir } = context
      const blueprintsDir = path.resolve(siteDir, 'docs/blueprints')

      // Match ALL YAML files including library/release/version subfolders
      const blueprintFiles = globSync('**/*.yaml', {
        cwd: blueprintsDir,
        absolute: true,
      })

      const blueprints = []

      // 🆕 Collect library/release/version info per blueprint
      // key: "<category>/<id>"
      // value: { [library_id]: { [release_id]: string[]versions } }
      const releasesByBlueprint = new Map()

      for (const file of blueprintFiles) {
        try {
          // Extract relative path from blueprints root
          const relativePath = path.relative(blueprintsDir, file)
          const parts = relativePath.split(path.sep)

          // Expected v1.6 structure:
          // <category>/<id>/<library>/<release>/<version>/<id>.yaml
          if (parts.length < 6) continue

          // The first directory is the category
          const category = parts[0]
          // The second directory is the blueprint ID
          const id = parts[1]
          // The third directory is the library ID
          const library_id = parts[2]
          // The fourth directory is the release ID
          const release_id = parts[3]
          // The fifth directory is the physical version (YYYY.MM.DD)
          const version = parts[4]

          const key = `${category}/${id}`

          // Initialize index structure if missing
          const indexForBlueprint = releasesByBlueprint.get(key) || {}

          // Initialize library bucket if missing
          const libraryEntry = indexForBlueprint[library_id] || {}

          // Initialize version list for this release
          const versions = libraryEntry[release_id] || []

          // De-duplicate versions
          if (!versions.includes(version)) {
            versions.push(version)
          }

          libraryEntry[release_id] = versions
          indexForBlueprint[library_id] = libraryEntry
          releasesByBlueprint.set(key, indexForBlueprint)

          // Print to log for debugging purposes
          // console.log(`🪲 Debug for blueprints.push`)
          // console.log(`🪲    category      : ${category}`)
          // console.log(`🪲    id            : ${id}`)
          // console.log(`🪲    library_id    : ${library_id}`)
          // console.log(`🪲    release_id    : ${release_id}`)
          // console.log(`🪲    version       : ${version}`)
          // console.log(`🪲    relativePath  : ${relativePath}`)
          // console.log(`🪲    file          : ${file}`)

          // Store blueprint metadata (flat list)
          blueprints.push({
            category,
            id,
            library_id,
            release_id,
            version,
            path: relativePath,
            filePath: file,
          })
        } catch (error) {
          console.error(`❌ Error processing blueprint file ${file}:`, error)
        }
      }

      // Return both the flat list and the structured releases index
      // "latest" per release, as decided by the generator (release.json).
      // key: "<category>/<id>" -> { [library_id]: { [release_id]: version } }
      const latestIndex = {}
      for (const [key, libraries] of releasesByBlueprint) {
        latestIndex[key] = {}
        for (const library_id of Object.keys(libraries)) {
          latestIndex[key][library_id] = {}
          for (const release_id of Object.keys(libraries[library_id])) {
            try {
              const releaseJson = JSON.parse(
                fs.readFileSync(
                  path.join(
                    blueprintsDir,
                    key,
                    library_id,
                    release_id,
                    'release.json',
                  ),
                  'utf8',
                ),
              )
              if (releaseJson.latest_version) {
                latestIndex[key][library_id][release_id] =
                  releaseJson.latest_version
              }
            } catch {
              // No release.json: the download page falls back to the newest.
            }
          }
        }
      }

      return {
        blueprints,
        releasesIndex: Object.fromEntries(releasesByBlueprint),
        latestIndex,
      }
    },
    async contentLoaded({ content, actions }) {
      const { addRoute } = actions
      const { releasesIndex, latestIndex } = content

      // Track generated routes to prevent duplicates
      const seen = new Set()

      // Iterate over each blueprint key (<category>/<id>)
      for (const key of Object.keys(releasesIndex)) {
        const [category, id] = key.split('/')
        const indexForId = releasesIndex[key]

        // 1) Base route (no library / release)
        const basePath = `/awesome-ha-blueprints/blueprints/${category}/${id}`
        if (!seen.has(basePath)) {
          seen.add(basePath)
          addRoute({
            path: basePath,
            component:
              '../src/plugins/blueprint-downloader-plugin/library-download-blueprint.tsx',
            exact: true,
            category,
            id,
            library_id: null,
            release_id: null,
            releasesIndex: indexForId,
            latestIndex: latestIndex?.[key] || {},
          })
        }

        // 2) Per-library routes
        for (const library_id of Object.keys(indexForId)) {
          const libraryPath = `${basePath}/${library_id}`
          if (!seen.has(libraryPath)) {
            seen.add(libraryPath)
            addRoute({
              path: libraryPath,
              component:
                '../src/plugins/blueprint-downloader-plugin/library-download-blueprint.tsx',
              exact: true,
              category,
              id,
              library_id,
              release_id: null,
              releasesIndex: indexForId,
              latestIndex: latestIndex?.[key] || {},
            })
          }

          // 3) Per-release routes
          for (const release_id of Object.keys(indexForId[library_id])) {
            const releasePath = `${libraryPath}/${release_id}`
            if (!seen.has(releasePath)) {
              seen.add(releasePath)
              addRoute({
                path: releasePath,
                component:
                  '../src/plugins/blueprint-downloader-plugin/library-download-blueprint.tsx',
                exact: true,
                category,
                id,
                library_id,
                release_id,
                releasesIndex: indexForId,
                latestIndex: latestIndex?.[key] || {},
              })
            }

            // 4) Per-version routes (library + release + version)
            for (const version of indexForId[library_id][release_id]) {
              const versionPath = `${releasePath}/${version}`
              if (!seen.has(versionPath)) {
                seen.add(versionPath)
                addRoute({
                  path: versionPath,
                  component:
                    '../src/plugins/blueprint-downloader-plugin/library-download-blueprint.tsx',
                  exact: true,
                  category,
                  id,
                  library_id,
                  release_id,
                  version,
                  releasesIndex: indexForId,
                  latestIndex: latestIndex?.[key] || {},
                })
              }
            }
          }
        }
      }

      console.log(
        '✅ libraryDownloaderPlugin: Unified Blueprint Routes Created',
      )
    },
  }
}
