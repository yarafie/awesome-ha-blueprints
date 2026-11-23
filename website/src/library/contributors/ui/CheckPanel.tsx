/**
 * CheckPanel
 * ────────────────────────────────────────────────────────────────
 * Shows the result of the format check (rules C-01 to C-55) and what
 * was read from the YAML. It only displays; the check itself lives in
 * @library/format/controllerFormat.mjs.
 */

import React from 'react'
import styles from '../contributors.module.css'
import Message from './Message'
import type { FormatResult } from '@library/format/controllerFormat.mjs'

interface CheckPanelProps {
  check: FormatResult | null
  /** further problems found in the file while building the package */
  fileProblems: string[]
}

const FORMAT_PAGE = '/awesome-ha-blueprints/docs/controller-format'

const CheckPanel: React.FC<CheckPanelProps> = ({ check, fileProblems }) => {
  if (!check) {
    return (
      <p className={styles.hint}>
        Add your YAML and the check runs right away. The rules are described in
        the <a href={FORMAT_PAGE}>Controller YAML format</a>.
      </p>
    )
  }

  if (check.status === 'legacy') {
    return (
      <p className={`${styles.finding} ${styles.findingError}`}>
        This blueprint lets the user pick the integration from a dropdown. New
        controllers detect the integration from the trigger. See the{' '}
        <a href={FORMAT_PAGE}>Controller YAML format</a> and its starter
        template.
      </p>
    )
  }

  if (check.status === 'free-form') {
    return (
      <p className={`${styles.finding} ${styles.findingNote}`}>
        This looks like a standalone blueprint: it has no{' '}
        <code>controller_device</code> input and no <code>actions_mapping</code>
        , so it is not built on the controller layout. Nothing is wrong with it,
        but this page cannot prepare a package for it yet. To add a controller,
        see the <a href={FORMAT_PAGE}>Controller YAML format</a> and its starter
        template.
      </p>
    )
  }

  const { errors, warnings, info } = check
  const features = info.features
  const chips = [
    info.model_name,
    ...(info.integrations ?? []),
    info.events ? `${info.events.length} events` : undefined,
    info.sends_hook_events === undefined
      ? undefined
      : info.sends_hook_events
        ? 'works with hooks'
        : 'no hooks',
    features?.long_press_loop ? 'long press loop' : undefined,
    features?.virtual_double_press ? 'virtual double press' : undefined,
    features?.text_helper ? 'text helper' : undefined,
  ].filter(Boolean) as string[]

  return (
    <div>
      {errors.length === 0 && fileProblems.length === 0 && (
        <p className={`${styles.finding} ${styles.findingOk}`}>
          Your blueprint follows the format.
        </p>
      )}

      {errors.map((e, i) => (
        <p key={`e${i}`} className={`${styles.finding} ${styles.findingError}`}>
          <span className={styles.rule}>{e.rule}</span>
          <Message text={e.msg} />
        </p>
      ))}

      {fileProblems.map((problem) => (
        <p key={problem} className={`${styles.finding} ${styles.findingError}`}>
          <Message text={problem} />
        </p>
      ))}

      {warnings.map((w, i) => (
        <p
          key={`w${i}`}
          className={`${styles.finding} ${styles.findingWarning}`}
        >
          <span className={styles.rule}>{w.rule}</span>
          <Message text={w.msg} />
        </p>
      ))}

      {chips.length > 0 && (
        <div className={styles.section}>
          <p className={styles.hint}>Read from your file</p>
          <div className={styles.chips}>
            {chips.map((chip) => (
              <span key={chip} className={styles.chip}>
                {chip}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckPanel
