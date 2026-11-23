/**
 * DetailsForm
 * ────────────────────────────────────────────────────────────────
 * The few things that cannot be read from the YAML: manufacturer,
 * model number, tags and optional notes.
 */

import React from 'react'
import styles from '../contributors.module.css'

export interface Details {
  manufacturer: string | null
  model: string | null
  tags: string[]
  notes: string
}

export const EMPTY_DETAILS: Details = {
  manufacturer: null,
  model: null,
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
  guess: { manufacturer: string; model: string }
  blueprintId: string
  problems: string[]
  onChange: (details: Details) => void
}

const DetailsForm: React.FC<DetailsFormProps> = ({
  details,
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

      {problems.length > 0 && (
        <div className={styles.section}>
          {problems.map((problem) => (
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
