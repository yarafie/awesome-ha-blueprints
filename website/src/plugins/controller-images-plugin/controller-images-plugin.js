// website/src/plugins/controller-images-plugin/controller-images-plugin.js
//const fs = require('fs');
import fs from 'fs'
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

        console.log(
          `✅ S==============================================================`,
        )

        // Expect structure: category / blueprintId / blueprintId.png
        if (segments.length < 2) {
          continue
        }

        const category = segments[0] // eg. automations, controllers, hook
        const blueprintId = segments[1] // eg. light, ikea_e2001_e2002
        const imageFile = segments[2] // eg. light.png, ikea_e2001_e2002.png

        // Check if the file exists
        if (fs.existsSync(absPath)) {
          console.log(`File absPath exists at: ${absPath}`)
        } else {
          console.log(`File absPath does not exist: ${absPath}`)
        }

        // Expose a route so Webpack knows about the image asset
        addRoute({
          path: `/assets/images/blueprints/${blueprintId}.png`,
          component: '@theme/NotFound', // required placeholder
          exact: true,
          modules: {
            image: absPath,
          },
        })

        const assetPath = `/assets/images/blueprints/${blueprintId}.png`
        // Check if the file exists
        if (fs.existsSync(assetPath)) {
          console.log(`File assetPath exists at: ${assetPath}`)
        } else {
          console.log(`File assetPath does not exist: ${assetPath}`)
        }

        console.log(`✅ controllerImagesPlugin: category   : ${category}`)
        console.log(`✅ controllerImagesPlugin: blueprintId: ${blueprintId}`)
        console.log(`✅ controllerImagesPlugin: imageFile  : ${imageFile}`)

        const { siteDir, siteConfig } = context

        const staticDir = path.join(
          siteDir,
          siteConfig.staticDirectories[0] || 'static',
        ) // Get the static directory path

        // Define the source and destination paths for your asset
        //const sourceAssetPath = path.join(__dirname, 'assets', 'my-image.png'); // Asset within your plugin
        const sourceAssetPath = absPath // Asset within your plugin
        const destinationAssetPath = path.join(
          staticDir,
          'img/blueprints',
          category,
          imageFile,
        ) // Target in static/img

        console.log(
          `✅ controllerImagesPlugin: siteDir            : ${siteDir}`,
        )
        console.log(
          `✅ controllerImagesPlugin: staticDir          : ${staticDir}`,
        )
        console.log(
          `✅ controllerImagesPlugin: sourceAssetPath    : ${sourceAssetPath}`,
        )
        console.log(
          `✅ controllerImagesPlugin: destinationAssetPat: ${destinationAssetPath}`,
        )

        // Ensure the target directory exists
        fs.mkdirSync(path.dirname(destinationAssetPath), { recursive: true })
        // Copy the asset
        fs.copyFileSync(sourceAssetPath, destinationAssetPath)

        console.log(
          `✅ controllerImagesPlugin: Copied ${sourceAssetPath} to ${destinationAssetPath}`,
        )
        console.log(
          `✅ E==============================================================`,
        )

        mapping[blueprintId] =
          `/awesome-ha-blueprints/img/blueprints/${category}/${blueprintId}/${blueprintId}.png`
      }

      // This will end up at:
      // .docusaurus/controller-images-plugin/default/controllerimages.json
      await createData(
        'controllerimages.json',
        JSON.stringify(mapping, null, 2),
      )

      console.log(
        `✅ controllerImagesPlugin: Processed ${imageFiles.length} controller images`,
      )
    },
  }
}
