/**
 * PackagePreview
 * ────────────────────────────────────────────────────────────────
 * Shows the files of the finished package and offers it as a .zip.
 * The button stays off, with the reason next to it, until the package
 * is complete and passes every check.
 */

import React from 'react'
import styles from '../contributors.module.css'

interface PackagePreviewProps {
  files: { path: string }[]
  blocker: string | null
  onDownload: () => void
}

interface TreeNode {
  folders: Map<string, TreeNode>
  files: string[]
}

/**
 * Turns a list of paths into an indented tree. A folder that only holds
 * one other folder is shown on the same line, e.g. "octocat/awesome/".
 */
export function asTree(paths: string[]): string {
  const root: TreeNode = { folders: new Map(), files: [] }
  for (const path of paths) {
    const parts = path.split('/')
    let node = root
    for (const folder of parts.slice(0, -1)) {
      if (!node.folders.has(folder))
        node.folders.set(folder, { folders: new Map(), files: [] })
      node = node.folders.get(folder)!
    }
    node.files.push(parts[parts.length - 1])
  }

  const lines: string[] = []
  const draw = (node: TreeNode, depth: number) => {
    for (const file of node.files) lines.push(`${'  '.repeat(depth)}${file}`)
    for (const [name, child] of node.folders) {
      let label = name
      let inner = child
      while (inner.files.length === 0 && inner.folders.size === 1) {
        const [nextName, next] = [...inner.folders][0]
        label += `/${nextName}`
        inner = next
      }
      lines.push(`${'  '.repeat(depth)}${label}/`)
      draw(inner, depth + 1)
    }
  }
  draw(root, 0)
  return lines.join('\n')
}

const PackagePreview: React.FC<PackagePreviewProps> = ({
  files,
  blocker,
  onDownload,
}) => (
  <div>
    {files.length > 0 ? (
      <pre className={styles.tree}>{asTree(files.map((f) => f.path))}</pre>
    ) : (
      <p className={styles.hint} style={{ marginBottom: '0.9rem' }}>
        The files the library needs are listed here once your blueprint passes
        the check.
      </p>
    )}

    <div className={styles.actions}>
      <button
        type='button'
        className={`button ${blocker === null ? 'button--primary' : 'button--secondary'}`}
        disabled={blocker !== null}
        onClick={onDownload}
      >
        Download package
      </button>
      {blocker && <span className={styles.hint}>{blocker}</span>}
    </div>
  </div>
)

export default PackagePreview
