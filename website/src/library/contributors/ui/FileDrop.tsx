/**
 * FileDrop
 * ────────────────────────────────────────────────────────────────
 * One drop area for all files. The files are sorted by type, so the
 * YAML, the picture and the manual can be dropped together. For an
 * update only the YAML is asked for.
 */

import React, { useState } from 'react'
import styles from '../contributors.module.css'
import { formatSize, type ContributionFiles } from '../services/files'

interface FileDropProps {
  files: ContributionFiles
  rejected: string[]
  /** only the YAML is needed: no rows for the picture and the manual */
  yamlOnly?: boolean
  onAdd: (files: File[]) => void
  onRemove: (kind: keyof ContributionFiles) => void
}

interface RowProps {
  label: string
  name?: string
  detail?: string
  optional?: boolean
  onRemove: () => void
}

const Row: React.FC<RowProps> = ({
  label,
  name,
  detail,
  optional,
  onRemove,
}) => (
  <div className={styles.fileRow}>
    <span className={`${styles.mark} ${name ? styles.markOk : styles.muted}`}>
      {name ? '✓' : '+'}
    </span>
    <span className={`${styles.fileName} ${name ? '' : styles.muted}`}>
      {name ?? label}
    </span>
    <span className={styles.hint}>
      {name ? detail : optional ? 'optional' : 'needed'}
    </span>
    {name && (
      <button type='button' className={styles.linkButton} onClick={onRemove}>
        Remove
      </button>
    )}
  </div>
)

const FileDrop: React.FC<FileDropProps> = ({
  files,
  rejected,
  yamlOnly,
  onAdd,
  onRemove,
}) => {
  const [dragging, setDragging] = useState(false)

  return (
    <div>
      <label
        className={`${styles.drop} ${dragging ? styles.dropActive : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          onAdd(Array.from(e.dataTransfer.files))
        }}
      >
        {yamlOnly
          ? 'Drop your updated YAML here, or tap to choose it'
          : 'Drop your files here, or tap to choose them'}
        <input
          className={styles.hiddenInput}
          type='file'
          multiple={!yamlOnly}
          accept={yamlOnly ? '.yaml,.yml' : '.yaml,.yml,.png,.pdf'}
          onChange={(e) => {
            onAdd(Array.from(e.target.files ?? []))
            e.target.value = ''
          }}
        />
      </label>

      <Row
        label='Blueprint, YAML'
        name={files.yaml?.name}
        detail={files.yaml ? formatSize(files.yaml.size) : undefined}
        onRemove={() => onRemove('yaml')}
      />
      {!yamlOnly && (
        <>
          <Row
            label='Picture of the device, PNG'
            name={files.png?.name}
            detail={
              files.png ? `${files.png.width} × ${files.png.height}` : undefined
            }
            onRemove={() => onRemove('png')}
          />
          <Row
            label='Device manual, PDF'
            name={files.pdf?.name}
            detail={files.pdf ? formatSize(files.pdf.size) : undefined}
            optional
            onRemove={() => onRemove('pdf')}
          />
        </>
      )}

      {rejected.length > 0 && (
        <div className={styles.section}>
          {rejected.map((message) => (
            <p
              key={message}
              className={`${styles.finding} ${styles.findingError}`}
            >
              {message}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileDrop
