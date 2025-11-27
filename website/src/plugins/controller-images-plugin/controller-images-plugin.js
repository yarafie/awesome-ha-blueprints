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

      // Find all PNG images
      const imageFiles = globSync('**/*.png', {
        cwd: blueprintsDir,
        absolute: false,
      })

      return { blueprintsDir, imageFiles }
    },

    async contentLoaded({ content, actions }) {
      const { blueprintsDir, imageFiles } = content
      const { createData, addRoute } = actions
      const mapping = {}

      for (const imageRelPath of imageFiles) {
        const absPath = path.join(blueprintsDir, imageRelPath)
        const segments = imageRelPath.split('/')

        // Expect structure: category / blueprintId / blueprintId.png
        if (segments.length < 2) {
          continue
        }

        const blueprintId = segments[1]

        // Expose a route so Webpack knows about the image asset
        addRoute({
          path: `/assets/images/blueprints/${blueprintId}.png`,
          component: '@theme/NotFound', // required placeholder
          exact: true,
          modules: {
            image: absPath,
          },
        })

        mapping[blueprintId] = `/assets/images/blueprints/${blueprintId}.png`
      }

      // This will end up at:
      // .docusaurus/controller-images-plugin/default/controllerimages.json
      await createData(
        'controllerimages.json',
        JSON.stringify(mapping, null, 2),
      )

      console.log(
        `✅  controllerImagesPlugin: processed ${imageFiles.length} controller images`,
      )
    },
  }
}
