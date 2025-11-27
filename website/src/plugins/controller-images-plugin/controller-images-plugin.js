// website/src/plugins/controller-images-plugin/controller-images-plugin.js
import path from 'path'
import { globSync } from 'glob'

export default function controllerImagesPlugin(context) {
  return {
    name: 'controller-images-plugin',

    async loadContent() {
      const { siteDir } = context

      // All blueprint images live under:
      // website/docs/blueprints/{category}/{id}/{id}.png
      const blueprintsDir = path.join(siteDir, 'docs', 'blueprints')

      // Capture all PNG files
      const imageFiles = globSync('**/*.png', {
        cwd: blueprintsDir,
        absolute: false,
      })

      return { blueprintsDir, imageFiles }
    },

    async contentLoaded({ content, actions }) {
      const { blueprintsDir, imageFiles } = content
      const { createData } = actions

      const mapping = {}

      for (const imageRelPath of imageFiles) {
        // e.g. controllers/ikea_e2001_e2002/ikea_e2001_e2002.png
        const segments = imageRelPath.split('/')

        if (segments.length < 2) continue

        const blueprintId = segments[1]

        // Build final URL used in /static
        // Users must place fallback images into /static/assets/images/blueprints/
        const finalUrl = `/assets/images/blueprints/${blueprintId}.png`

        mapping[blueprintId] = finalUrl
      }

      // Write mapping to .json for controllerimages.ts
      await createData(
        'controllerimages.json',
        JSON.stringify(mapping, null, 2),
      )

      console.log(
        `✔ controller-images-plugin: Processed ${imageFiles.length} images.`,
      )
    },
  }
}
