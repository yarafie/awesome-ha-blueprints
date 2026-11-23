/**
 * StepCard
 * ────────────────────────────────────────────────────────────────
 * One card of the Contributors page, with a status badge:
 *  - done:  a tick
 *  - fix:   a red count of things to fix
 *  - todo:  the step number, in grey
 */

import React from 'react'
import styles from '../contributors.module.css'

export type StepStatus = 'done' | 'fix' | 'todo'

interface StepCardProps {
  step: number
  title: string
  status: StepStatus
  count?: number
  hint?: string
  children: React.ReactNode
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  title,
  status,
  count,
  hint,
  children,
}) => {
  const badgeClass =
    status === 'done'
      ? styles.badgeDone
      : status === 'fix'
        ? styles.badgeFix
        : styles.badgeTodo
  const label =
    status === 'done' ? '✓' : status === 'fix' ? String(count ?? '!') : step

  return (
    <section className={styles.card}>
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
