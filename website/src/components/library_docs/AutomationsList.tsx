import React from 'react'
import Link from '@docusaurus/Link'
import styles from '../../css/AutomationsList.module.css'
import { loadAutomations } from '../../lib/library/loadAutomations'

export default function AutomationsList(): JSX.Element {
  const automations = loadAutomations()

  if (!automations.length) {
    return <div className={styles.empty}>No automations found.</div>
  }

  return (
    <div className={styles.grid}>
      {automations.map((a) => (
        <Link
          key={a.automation_id}
          to={`/library/blueprints/automations/${a.automation_id}`}
          className={styles.cardLink}
        >
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <img
                src={`/awesome-ha-blueprints/img/library/automations/${a.automation_id}.png`}
                alt={`${a.name} icon`}
                className={styles.icon}
                loading='lazy'
              />
            </div>

            <div className={styles.content}>
              <h3 className={styles.title}>{a.name}</h3>
              <p className={styles.summary}>{a.summary}</p>

              <div className={styles.meta}>
                <span>{a.category}</span>
                <span>·</span>
                <span>{a.maintainers.join(', ')}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
