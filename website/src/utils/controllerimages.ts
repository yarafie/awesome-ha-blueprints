// website/src/utils/controllerimages.ts

import controllerImagesData from '@generated/controllerimages.json'

export type ControllerImagesMap = Record<string, string>

const controllerImages: ControllerImagesMap =
  controllerImagesData as ControllerImagesMap

export function getControllerImageUrl(id: string): string | undefined {
  return controllerImages[id]
}

export default controllerImages
