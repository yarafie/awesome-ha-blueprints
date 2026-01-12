// website/src/utils/blueprintimages.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - file is generated at build time
import blueprintImagesData from '@generated/blueprint-images-plugin/default/blueprintimages.json'

export type BlueprintImagesMap = Record<string, string>

const blueprintImages: BlueprintImagesMap =
  blueprintImagesData as BlueprintImagesMap

export function getBlueprintImageUrl(id: string): string | undefined {
  return blueprintImages[id]
}

export default blueprintImages
