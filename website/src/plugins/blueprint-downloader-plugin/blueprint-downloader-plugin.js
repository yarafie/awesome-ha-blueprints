/**
 * Plugin: blueprintRoutesPlugin
 * ────────────────────────────────────────────────────────────────
 * Docusaurus plugin that generates routes for all blueprints
 * Routes follow the pattern: category/id
 *
 * Changelog:
 *   - Updated 2026.12.03 (@yarafie):
 *        Now supports multi-variant controllers such as:
 *          controllers/ikea_e2001_e2002/EPMatt/ikea_e2001_e2002.yaml
 *          controllers/ikea_e2001_e2002/yarafie/ikea_e2001_e2002.yaml
 *
 *        IMPORTANT:
 *        ----------
 *        Route path **MUST depend on both ID + VARIANT** otherwise
 *        Docusaurus will produce duplicate routes:
 *          /blueprints/controllers/ikea_e2001_e2002
 *          /blueprints/controllers/ikea_e2001_e2002   ← duplicate
 *
 *        We now produce:
 *           /blueprints/controllers/ikea_e2001_e2002/EPMatt
 *           /blueprints/controllers/ikea_e2001_e2002/yarafie
 *
 *        Backward compatible with hooks and automation categories
 *
 * ────────────────────────────────────────────────────────────────
 */

import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'

export default function blueprintRoutesPlugin(context) {
  return {
    name: 'blueprint-routes-plugin',

    async loadContent() {
      const { siteDir } = context
      const blueprintsDir = path.resolve(siteDir, 'docs/blueprints')

      // Match ALL YAML files including variant subfolders
      const blueprintFiles = globSync('**/*.yaml', {
        cwd: blueprintsDir,
        absolute: true,
      })

      const blueprints = []

      // 🆕 Collect variant/version info per controller id to support per-variant/per-version downloads
      const variantsById = new Map() // key: id, value: { [variantName]: string[]versions }

      for (const file of blueprintFiles) {
        try {
          // Extract category and id from file path
          const relativePath = path.relative(blueprintsDir, file)
          const pathParts = relativePath.split(path.sep)

          // The first directory is the category
          const category = pathParts[0]

          // The second directory is the blueprint ID
          const id = pathParts[1]

          // Skip if not in the expected directory structure
          if (!category || !id) continue

          // Read blueprint content - only get the raw content
          const rawContent = fs.readFileSync(file, 'utf8')

          // 🆕 Derive variant/version for controllers:
          // Expected controller path example:
          // controllers/<id>/<variant>/<version>/<id>.yaml
          // For non-controller categories (automation/hooks), there is no variant folder.
          let variant = null
          let version = null

          if (category === 'controllers') {
            // Path format: controllers/<id>/<variant>/<version>/<file>
            // e.g. ["controllers","ikea_e2001_e2002","EPMatt","2025.11.16","ikea_e2001_e2002.yaml"]
            if (pathParts.length >= 4) {
              variant = pathParts[2] || null
              version = pathParts[3] || null
            }

            // Record variant/version into map for later use in contentLoaded
            if (variant) {
              const entry = variantsById.get(id) || {}
              const versions = entry[variant] || []
              if (version && !versions.includes(version)) {
                versions.push(version)
              }
              entry[variant] = versions
              variantsById.set(id, entry)
            }
          }

          // Print to log for debugging purposes
          // console.log(`✅    relativePath: ${relativePath}`)
          // console.log(`✅    pathParts   : ${pathParts}`)
          // console.log(`✅    category    : ${category}`)
          // console.log(`✅    id          : ${id}`)
          // console.log(`✅    variant     : ${variant}`)
          // console.log(`✅    version     : ${version}`)

          // Add blueprint metadata
          blueprints.push({
            id,
            category,
            path: relativePath,
            filePath: file,
            rawContent,
            // 🆕 extra data (safe to ignore downstream if unused)
            variant,
            version,
          })
        } catch (error) {
          console.error(`❌  Error processing blueprint file ${file}:`, error)
        }
      }

      // 🆕 Return both the flat list and the variants index so we can use it when creating routes
      return { blueprints, variantsIndex: Object.fromEntries(variantsById) }
    },
    async contentLoaded({ content, actions }) {
      const { addRoute } = actions

      // 🆕 Unpack what loadContent returned
      const { blueprints, variantsIndex } = content

      // For each blueprint, create a route
      // 🆕 De-duplicate controller routes by (category,id) so we don't attempt to add the same path twice
      const seen = new Set() // key: `${category}/${id}`

      for (const blueprint of blueprints) {
        const key = `${blueprint.category}/${blueprint.id}`

        // For controllers with multiple variants, only add ONE route per device id.
        // (Download page can accept ?variant=<name>&version=<name> to disambiguate.)
        if (blueprint.category === 'controllers') {
          const deviceId = blueprint.id
          const variantMap = variantsIndex[deviceId] || {}

          // 1) Base route (NO variant, required for ImportCard)
          const baseKey = `${blueprint.category}/${deviceId}`
          if (!seen.has(baseKey)) {
            seen.add(baseKey)
            addRoute({
              path: `/awesome-ha-blueprints/blueprints/${blueprint.category}/${deviceId}`,
              component:
                '../src/plugins/blueprint-downloader-plugin/download-blueprint.tsx',
              exact: true,
              category: blueprint.category,
              id: deviceId,
              variant: null,
              variantsById: variantMap,
            })
          }

          // 2) Per-variant routes (EPMatt, yarafie, etc.)
          const variantNames = Object.keys(variantMap)
          for (const variantName of variantNames) {
            const variantKey = `${blueprint.category}/${deviceId}/${variantName}`
            if (!seen.has(variantKey)) {
              seen.add(variantKey)
              addRoute({
                path: `/awesome-ha-blueprints/blueprints/${blueprint.category}/${deviceId}/${variantName}`,
                component:
                  '../src/plugins/blueprint-downloader-plugin/download-blueprint.tsx',
                exact: true,
                category: blueprint.category,
                id: deviceId,
                variant: variantName,
                variantsById: variantMap,
              })
            }
          }

          // 3) Per-version routes (variant + version)
          for (const variantName of variantNames) {
            const versionList = variantMap[variantName] || []
            for (const version of versionList) {
              const versionKey = `${blueprint.category}/${deviceId}/${variantName}/${version}`
              if (!seen.has(versionKey)) {
                seen.add(versionKey)
                addRoute({
                  path: `/awesome-ha-blueprints/blueprints/${blueprint.category}/${deviceId}/${variantName}/${version}`,
                  component:
                    '../src/plugins/blueprint-downloader-plugin/download-blueprint.tsx',
                  exact: true,
                  category: blueprint.category,
                  id: deviceId,
                  variant: variantName,
                  version,
                  variantsById: variantMap,
                })
              }
            }
          }

          continue
        }

        // Non-controller categories (automation, hooks, etc.) keep 1:1 route behavior
        if (seen.has(key)) {
          continue
        }
        seen.add(key)

        // Add download route for this blueprint
        addRoute({
          path: `/awesome-ha-blueprints/blueprints/${blueprint.category}/${blueprint.id}`,
          component:
            '../src/plugins/blueprint-downloader-plugin/download-blueprint.tsx',
          exact: true,
          // extra props
          category: blueprint.category,
          id: blueprint.id,
          variant: null,
          variantsById: variantsIndex[blueprint.id] || {},
        })
      }
      console.log('✅ blueprintRoutesPlugin: Blueprint Download Routes Created')
    },
  }
}
