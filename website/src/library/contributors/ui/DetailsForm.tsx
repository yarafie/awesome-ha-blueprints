/**
 * DetailsForm
 * ────────────────────────────────────────────────────────────────
 * The few things that cannot be read from the YAML: manufacturer,
 * model number, a release name, tags and optional notes.
 */

import React from 'react'
import styles from '../contributors.module.css'

export interface Details {
  manufacturer: string | null
  model: string | null
  release: string
  tags: string[]
  notes: string
}

export const EMPTY_DETAILS: Details = {
  manufacturer: null,
  model: null,
  release: '',
  tags: [],
  notes: '',
}

export const SUGGESTED_TAGS = [
  'remote',
  'button',
  'dimmer',
  'switch',
  'rotary',
  'knob',
  'light',
  'media',
  'sensor',
  'wall-switch',
]

interface DetailsFormProps {
  details: Details
  library: string
  guess: { manufacturer: string; model: string }
  blueprintId: string
  problems: string[]
  onChange: (details: Details) => void
}

const DetailsForm: React.FC<DetailsFormProps> = ({
  details,
  library,
  guess,
  blueprintId,
  problems,
  onChange,
}) => {
  const toggleTag = (tag: string) =>
    onChange({
      ...details,
      tags: details.tags.includes(tag)
        ? details.tags.filter((t) => t !== tag)
        : [...details.tags, tag],
    })

  // an empty release name is explained by the hint under its field; it is
  // not shown as an error before the contributor has typed anything
  const shown = problems.filter(
    (problem) => !problem.startsWith('the release name is missing'),
  )

  return (
    <div>
      <div className={styles.fields}>
        <label className={styles.field}>
          Manufacturer
          <input
            className={styles.input}
            type='text'
            value={details.manufacturer ?? guess.manufacturer}
            placeholder='IKEA'
            onChange={(e) =>
              onChange({ ...details, manufacturer: e.target.value })
            }
          />
        </label>
        <label className={styles.field}>
          Model number
          <input
            className={styles.input}
            type='text'
            value={details.model ?? guess.model}
            placeholder='E2489'
            onChange={(e) => onChange({ ...details, model: e.target.value })}
          />
        </label>
      </div>

      <label className={`${styles.field} ${styles.section}`}>
        Release name (required)
        <input
          className={styles.input}
          type='text'
          value={details.release}
          placeholder='anything'
          autoCapitalize='none'
          autoCorrect='off'
          spellCheck={false}
          onChange={(e) =>
            onChange({
              ...details,
              release: e.target.value.toLowerCase().replace(/[\s-]+/g, '_'),
            })
          }
        />
      </label>
      <p className={styles.hint}>
        A short name for what your blueprint handles: <code>anything</code> for
        general purpose, or for example <code>lights</code> or{' '}
        <code>cover</code>. It is published under your name
        {library && details.release
          ? ` as ${library}/${details.release}.`
          : '.'}
      </p>

      <p className={styles.hint}>
        Tags
        {blueprintId ? ` · blueprint id ${blueprintId}` : ''}
      </p>
      <div className={styles.chips}>
        {SUGGESTED_TAGS.map((tag) => (
          <button
            key={tag}
            type='button'
            aria-pressed={details.tags.includes(tag)}
            className={`${styles.chip} ${styles.chipButton} ${
              details.tags.includes(tag) ? styles.chipOn : ''
            }`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <label className={`${styles.field} ${styles.section}`}>
        Notes for the page, optional
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          value={details.notes}
          placeholder='Pairing steps, known limits, firmware requirements.'
          onChange={(e) => onChange({ ...details, notes: e.target.value })}
        />
      </label>

      {shown.length > 0 && (
        <div className={styles.section}>
          {shown.map((problem) => (
            <p
              key={problem}
              className={`${styles.finding} ${styles.findingError}`}
            >
              {problem.charAt(0).toUpperCase() + problem.slice(1)}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default DetailsForm
