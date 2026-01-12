/**
 * Plugin: blueprintImagesPlugin
 * ────────────────────────────────────────────────────────────────
 * Docusaurus plugin responsible for discovering, copying, and
 * exposing blueprint image assets for use across the website.
 *
 * Purpose:
 *   - Locate blueprint PNG images under docs/blueprints
 *   - Copy them into the static/img directory at build time
 *   - Expose virtual routes so Webpack tracks the assets
 *   - Generate a JSON mapping for runtime image lookup
 *
 * Expected source structure:
 *   docs/blueprints/<category>/<blueprint_id>/<blueprint_id>.png
 *
 * Resulting static asset location:
 *   static/img/<category>/<blueprint_id>.png
 *
 * Public URL used by the site:
 *   /awesome-ha-blueprints/img/<category>/<blueprint_id>/<blueprint_id>.png
 *
 * Notes:
 *   - This plugin is intentionally independent of library / release / version.
 *   - One image per blueprint ID is assumed.
 *
 * Changelog:
 *   - Initial implementation (@yarafie)
 *   - Updated 2026.01.04 (@yarafie):
 *       1. Comment alignment with actual behavior
 *       2. Added formal header documentation
 *       3. Removed unused variable re-declaration
 *
 * ────────────────────────────────────────────────────────────────
 */
// website/src/plugins/blueprint-images-plugin/blueprint-images-plugin.js
import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'

export default function blueprintImagesPlugin(context) {
  return {
    name: 'blueprint-images-plugin',

    async loadContent() {
      const { siteDir } = context

      // Root directory containing all blueprint definitions and assets
      const blueprintsDir = path.join(siteDir, 'docs', 'blueprints')

      // Find all PNG images under the blueprints tree
      const imageFiles = globSync('**/*.png', {
        cwd: blueprintsDir,
        absolute: false,
      })

      return { blueprintsDir, imageFiles }
    },

    async contentLoaded({ content, actions }) {
      const { blueprintsDir, imageFiles } = content
      const { createData, addRoute } = actions

      // Mapping: blueprintId → public image URL
      const mapping = {}

      for (const imageRelPath of imageFiles) {
        const absPath = path.join(blueprintsDir, imageRelPath)
        const segments = imageRelPath.split('/')

        // Expected structure: <category>/<blueprint_id>/<blueprint_id>.png
        if (segments.length < 3) {
          continue
        }

        const category = segments[0] // e.g. automations, controllers, hooks
        const blueprintId = segments[1] // e.g. light, ikea_e2001_e2002
        const imageFile = segments[2] // e.g. light.png

        // Expose a virtual route so Webpack tracks the image asset
        addRoute({
          path: `/assets/images/blueprints/${blueprintId}.png`,
          component: '@theme/NotFound', // placeholder component
          exact: true,
          modules: {
            image: absPath,
          },
        })

        // Resolve static directory (usually "static/")
        const staticDir = path.join(
          context.siteDir,
          context.siteConfig.staticDirectories[0] || 'static',
        )

        // Copy image into static/img/<category>/<blueprint_id>.png
        const destinationAssetPath = path.join(
          staticDir,
          'img',
          category,
          imageFile,
        )

        // Ensure destination directory exists
        fs.mkdirSync(path.dirname(destinationAssetPath), { recursive: true })

        // Copy the asset
        fs.copyFileSync(absPath, destinationAssetPath)

        // Record public URL mapping
        mapping[blueprintId] =
          `/awesome-ha-blueprints/img/${category}/${blueprintId}/${blueprintId}.png`
      }

      // Persist mapping for runtime lookup
      // Output location:
      // .docusaurus/blueprint-images-plugin/default/blueprintimages.json
      await createData('blueprintimages.json', JSON.stringify(mapping, null, 2))

      console.log(
        `✅ blueprintImagesPlugin: Processed ${imageFiles.length} blueprint images`,
      )
    },
  }
}
