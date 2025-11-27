// website/src/plugins/controller-images-plugin/controller-images-plugin.js

import path from 'path'
import { globSync } from 'glob'

export default function controllerImagesPlugin(context) {
  return {
    name: 'controller-images-plugin',

    async loadContent() {
      const { siteDir } = context

      // Search for all PNG images inside docs/blueprints
      const blueprintsDir = path.join(siteDir, 'docs', 'blueprints')

      const imageFiles = globSync('**/*.png', {
        cwd: blueprintsDir,
        absolute: false,
      })

      return { imageFiles, blueprintsDir }
    },

    async contentLoaded({ content, actions }) {
      const { imageFiles, blueprintsDir } = content
      const { createData, addRoute } = actions

      const mapping = {}

      for (const relPath of imageFiles) {
        const absPath = path.join(blueprintsDir, relPath)
        const parts = relPath.split('/')

        // Expect: category / id / id.png
        if (parts.length < 2) continue

        const blueprintId = parts[1]

        // Register a route that serves the image
        addRoute({
          path: `/assets/images/blueprints/${blueprintId}.png`,
          component: '@theme/NotFound',
          exact: true,
          modules: {
            image: absPath,
          },
        })

        mapping[blueprintId] = `/assets/images/blueprints/${blueprintId}.png`
      }

      // Write JSON file consumed at build time by controllerimages.ts
      await createData(
        'controllerimages.json',
        JSON.stringify(mapping, null, 2),
      )

      console.log(
        `✅ controllerImagesPlugin: processed ${imageFiles.length} controller images`,
      )
    },
  }
}
