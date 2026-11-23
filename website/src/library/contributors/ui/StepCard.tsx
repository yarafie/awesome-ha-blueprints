/**
 * StepCard
 * ────────────────────────────────────────────────────────────────
 * One card of the Contributors page, with a status badge:
 *  - done:  a tick
 *  - fix:   a red exclamation mark
 *  - todo:  the step number, in grey
 * A locked card is dimmed: it cannot be used yet.
 */

import React from 'react'
import styles from '../contributors.module.css'

export type StepStatus = 'done' | 'fix' | 'todo'

interface StepCardProps {
  step: number
  title: string
  status: StepStatus
  hint?: string
  locked?: boolean
  children: React.ReactNode
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  title,
  status,
  hint,
  locked,
  children,
}) => {
  const badgeClass =
    status === 'done'
      ? styles.badgeDone
      : status === 'fix'
        ? styles.badgeFix
        : styles.badgeTodo
  const label = status === 'done' ? '✓' : status === 'fix' ? '!' : step

  return (
    <section className={`${styles.card} ${locked ? styles.cardLocked : ''}`}>
      <div className={styles.cardHead}>
        <div className={`${styles.badge} ${badgeClass}`} aria-hidden='true'>
          {label}
        </div>
        <h2 className={styles.cardTitle}>{title}</h2>
        {hint && <p className={styles.hint}>{hint}</p>}
      </div>
      {children}
    </section>
  )
}

export default StepCard
