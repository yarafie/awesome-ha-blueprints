// website/src/plugins/controller-images-plugin/controller-images-plugin.js

import path from 'path'
import { globSync } from 'glob'

export default function controllerImagesPlugin(context) {
  return {
    name: 'controller-images-plugin',

    async loadContent() {
      const { siteDir } = context

      // All blueprint images live under: website/docs/blueprints/{category}/{id}/{id}.png
      const blueprintsDir = path.join(siteDir, 'docs', 'blueprints')

      // Find all PNG images inside the blueprints tree
      const imageFiles = globSync('**/*.png', {
        cwd: blueprintsDir,
        absolute: false,
      })

      return { blueprintsDir, imageFiles }
    },

    async contentLoaded({ content, actions }) {
      const { blueprintsDir, imageFiles } = content
      const { createData, addStaticAsset } = actions

      const mapping = {}

      for (const imageRelPath of imageFiles) {
        // e.g. "controllers/ikea_e2001_e2002/ikea_e2001_e2002.png"
        // or   "automation/simple_safe_scheduler/simple_safe_scheduler.png"
        const absPath = path.join(blueprintsDir, imageRelPath)
        const segments = imageRelPath.split('/')

        // Expect at least: [category, blueprintId, fileName]
        if (segments.length < 2) {
          continue
        }

        const blueprintId = segments[1]

        const finalUrl = await addStaticAsset({
          filepath: absPath,
          // Put everything under a predictable folder in the built site
          permalink: `/assets/images/blueprints/${blueprintId}.png`,
        })

        mapping[blueprintId] = finalUrl
      }

      await createData(
        'controllerimages.json',
        JSON.stringify(mapping, null, 2),
      )

      // LOG SUCCESS
      console.log(
        `✅ controllerImagesPlugin: Processed ${imageFiles.length} images`,
      )
    },
  }
}
