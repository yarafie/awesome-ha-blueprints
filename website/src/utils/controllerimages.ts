// website/src/utils/controllerimages.ts

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - generated at build time by controller-images-plugin.js
import controllerImagesData from '@generated/controllerimages.json'

export type ControllerImagesMap = Record<string, string>

const controllerImages: ControllerImagesMap =
  controllerImagesData as ControllerImagesMap

export function getControllerImageUrl(id: string): string | undefined {
  return controllerImages[id]
}

export default controllerImages
