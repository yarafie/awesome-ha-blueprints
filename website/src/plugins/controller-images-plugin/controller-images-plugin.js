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

      // Find all PNG files inside the tree
      const imageFiles = globSync('**/*.png', {
        cwd: blueprintsDir,
        absolute: false,
      })

      return { blueprintsDir, imageFiles }
    },

    async contentLoaded({ content, actions }) {
      const { blueprintsDir, imageFiles } = content
      const { createData } = actions

      // JSON map that will become @generated/controllerimages.json
      const mapping = {}

      for (const relPath of imageFiles) {
        // Example relPath:
        //   controllers/ikea_e2001_e2002/ikea_e2001_e2002.png
        //   automation/simple_safe_scheduler/simple_safe_scheduler.png
        const segments = relPath.split('/')

        if (segments.length < 2) {
          continue
        }

        const blueprintId = segments[1]

        // Final URL used by the website
        mapping[blueprintId] = `/img/controllers/${blueprintId}.png`
      }

      await createData(
        'controllerimages.json',
        JSON.stringify(mapping, null, 2),
      )

      console.log(
        `✅ controllerImagesPlugin: generated controllerimages.json for ${imageFiles.length} images`,
      )
    },
  }
}
