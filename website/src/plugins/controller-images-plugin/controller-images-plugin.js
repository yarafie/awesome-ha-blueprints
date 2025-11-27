// website/src/plugins/controller-images-plugin/controller-images-plugin.js
import path from 'path'
import { globSync } from 'glob'

export default function controllerImagesPlugin(context) {
  // Docusaurus context provides the path where the plugin's generated data lives.
  // We use the plugin name 'controller-images-plugin' to get the specific directory.
  const generatedDataDir = path.join(
    context.generatedFilesDir,
    'controller-images-plugin',
  )

  return {
    name: 'controller-images-plugin',

    async loadContent() {
      const { siteDir } = context
      // All blueprint images live under: website/docs/blueprints/{category}/{id}/{id}.png
      const blueprintsDir = path.join(siteDir, 'docs', 'blueprints')
      // Find all PNG images
      const imageFiles = globSync('**/*.png', {
        cwd: blueprintsDir,
        absolute: false,
      })
      return { blueprintsDir, imageFiles }
    },

    async contentLoaded({ content, actions }) {
      const { blueprintsDir, imageFiles } = content
      const { createData, addRoute } = actions // FIX 1: remove addStaticAsset (not available in v3)
      const mapping = {}

      for (const imageRelPath of imageFiles) {
        const absPath = path.join(blueprintsDir, imageRelPath)
        const segments = imageRelPath.split('/')

        // Expect structure: category / blueprintId / blueprintId.png
        if (segments.length < 2) {
          continue
        }

        const blueprintId = segments[1]

        // FIX 2 — Docusaurus v3 does not support addStaticAsset()
        // Instead we must expose a route that serves the file.
        addRoute({
          path: `/assets/images/blueprints/${blueprintId}.png`,
          component: '@theme/NotFound', // unused, but required
          exact: true,
          modules: {
            image: absPath,
          },
        })
        mapping[blueprintId] = `/assets/images/blueprints/${blueprintId}.png`
      }

      // Create the JSON file with the mapping in the generated data directory
      await createData(
        'controllerimages.json',
        JSON.stringify(mapping, null, 2),
      )

      // Optional success log
      console.log(
        `✅  controllerImagesPlugin: processed ${imageFiles.length} controller images`,
      )
    },

    /**
     * Docusaurus Webpack Configuration Hook
     * Registers the alias @generated/controllerimages to point to the created JSON file.
     */
    configureWebpack(_, _isServer) {
      // Create the alias that maps the client import to the generated file.
      return {
        resolve: {
          alias: {
            // This fixes the "Module not found" error.
            '@generated/controllerimages': path.join(
              generatedDataDir,
              'controllerimages.json',
            ),
          },
        },
      }
    },
  }
}
