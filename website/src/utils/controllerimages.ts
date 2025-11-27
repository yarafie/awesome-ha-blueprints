// website/src/utils/controllerimages.ts

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - file is generated at build time
import controllerImagesData from '@generated/controllerimages'

export type ControllerImagesMap = Record<string, string>

const controllerImages: ControllerImagesMap =
  controllerImagesData as ControllerImagesMap

export function getControllerImageUrl(id: string): string | undefined {
  return controllerImages[id]
}

export default controllerImages
