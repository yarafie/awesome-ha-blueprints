/**
 * Reading the contributor's files
 * ────────────────────────────────────────────────────────────────
 * Sorts dropped files by type and checks the picture and the manual
 * before they are accepted.
 */

export interface YamlFile {
  name: string
  size: number
  text: string
}

export interface PngFile {
  name: string
  size: number
  bytes: Uint8Array
  width: number
  height: number
}

export interface PdfFile {
  name: string
  size: number
  bytes: Uint8Array
}

export interface ContributionFiles {
  yaml: YamlFile | null
  png: PngFile | null
  pdf: PdfFile | null
}

export const EMPTY_FILES: ContributionFiles = {
  yaml: null,
  png: null,
  pdf: null,
}

export const LIMITS = {
  yaml: 200 * 1024,
  png: 1024 * 1024,
  pdf: 10 * 1024 * 1024,
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function tooLarge(file: File, limit: number): string | null {
  return file.size > limit
    ? `${file.name} is ${formatSize(file.size)}; the limit is ${formatSize(limit)}.`
    : null
}

/**
 * Adds the given files to what was already chosen.
 * Returns the new set and one message per file that was not accepted.
 */
export async function addFiles(
  current: ContributionFiles,
  incoming: File[],
): Promise<{ files: ContributionFiles; rejected: string[] }> {
  const files = { ...current }
  const rejected: string[] = []

  for (const file of incoming) {
    const name = file.name.toLowerCase()

    if (name.endsWith('.yaml') || name.endsWith('.yml')) {
      const problem = tooLarge(file, LIMITS.yaml)
      if (problem) rejected.push(problem)
      else
        files.yaml = {
          name: file.name,
          size: file.size,
          text: await file.text(),
        }
    } else if (name.endsWith('.png')) {
      const problem = tooLarge(file, LIMITS.png)
      if (problem) {
        rejected.push(problem)
        continue
      }
      const bytes = new Uint8Array(await file.arrayBuffer())
      if (bytes.length < 24 || PNG_SIGNATURE.some((b, i) => bytes[i] !== b)) {
        rejected.push(`${file.name} is not a PNG picture.`)
        continue
      }
      const view = new DataView(bytes.buffer)
      files.png = {
        name: file.name,
        size: file.size,
        bytes,
        width: view.getUint32(16),
        height: view.getUint32(20),
      }
    } else if (name.endsWith('.pdf')) {
      const problem = tooLarge(file, LIMITS.pdf)
      if (problem) {
        rejected.push(problem)
        continue
      }
      const bytes = new Uint8Array(await file.arrayBuffer())
      const head = String.fromCharCode(...bytes.slice(0, 5))
      if (head !== '%PDF-') rejected.push(`${file.name} is not a PDF file.`)
      else files.pdf = { name: file.name, size: file.size, bytes }
    } else {
      rejected.push(
        `${file.name} was not added. Use a .yaml file, a .png picture and optionally a .pdf manual.`,
      )
    }
  }

  return { files, rejected }
}
