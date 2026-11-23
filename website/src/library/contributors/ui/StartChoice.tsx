/**
 * StartChoice
 * ────────────────────────────────────────────────────────────────
 * The first card of the Contributors page. Two questions, asked one
 * after the other in the same card:
 *
 *   1. which part of the library  (Controllers, Hooks, Automations:
 *      the same three categories the library itself shows)
 *   2. what the contributor intends to add to it
 *
 * Once both are answered the card folds to one line with a "Change"
 * link, so the steps below it stay close to the top of the page.
 */

import React from 'react'
import { GearWideConnected, Joystick, PlugFill } from 'react-bootstrap-icons'
import styles from '../contributors.module.css'

export type Category = 'controllers' | 'hooks' | 'automations'
export type Intent = 'new' | 'update' | 'variant'

interface CategoryOption {
  id: Category
  name: string
  text: string
  color: string
  Icon: React.ComponentType<{ size?: number }>
  ready: boolean
}

interface IntentOption {
  id: Intent
  name: string
  text: string
  ready: boolean
}

// same names, colours and icons as the Library Overview page
export const CATEGORIES: CategoryOption[] = [
  {
    id: 'controllers',
    name: 'Controllers',
    text: 'Blueprints for remotes, buttons, dimmers and switches.',
    color: '#b5ffba',
    Icon: Joystick,
    ready: true,
  },
  {
    id: 'hooks',
    name: 'Hooks',
    text: 'Blueprints that connect controllers to lights, covers and media players.',
    color: '#c9f3ff',
    Icon: PlugFill,
    ready: false,
  },
  {
    id: 'automations',
    name: 'Automations',
    text: 'Generic automation blueprints for other use cases.',
    color: '#ffe7c9',
    Icon: GearWideConnected,
    ready: false,
  },
]

export const INTENTS: IntentOption[] = [
  {
    id: 'new',
    name: 'A blueprint for a new device',
    text: 'The device is not in the library yet.',
    ready: true,
  },
  {
    id: 'update',
    name: 'An update to a blueprint',
    text: 'A fix or an improvement for a blueprint that is already in the library. It becomes a new version.',
    ready: false,
  },
  {
    id: 'variant',
    name: 'Your own version',
    text: 'Your own take on a device that is already in the library. It is published under your name, beside the existing one.',
    ready: false,
  },
]

interface StartChoiceProps {
  category: Category | null
  intent: Intent | null
  onCategory: (category: Category | null) => void
  onIntent: (intent: Intent | null) => void
}

const StartChoice: React.FC<StartChoiceProps> = ({
  category,
  intent,
  onCategory,
  onIntent,
}) => {
  const chosenCategory = CATEGORIES.find((c) => c.id === category)
  const chosenIntent = INTENTS.find((i) => i.id === intent)

  // both answered: one line and a way back
  if (chosenCategory && chosenIntent) {
    return (
      <div className={styles.actions}>
        <span className={styles.grow}>
          <strong>{chosenCategory.name}</strong> · {chosenIntent.name}
        </span>
        <button
          type='button'
          className={styles.linkButton}
          onClick={() => onIntent(null)}
        >
          Change
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className={styles.tiles}>
        {CATEGORIES.map(({ id, name, text, color, Icon, ready }) => (
          <button
            key={id}
            type='button'
            disabled={!ready}
            aria-pressed={category === id}
            className={`${styles.tile} ${
              category === id ? styles.tileSelected : ''
            }`}
            onClick={() => onCategory(id)}
          >
            <span className={styles.tileIcon} style={{ background: color }}>
              <Icon size={20} />
            </span>
            <span className={styles.tileText}>
              <span className={styles.tileName}>
                {name}
                {!ready && <span className={styles.soon}>Coming soon</span>}
              </span>
              <span className={styles.tileHint}>{text}</span>
            </span>
          </button>
        ))}
      </div>

      {chosenCategory && (
        <div className={styles.section}>
          <p className={styles.hint}>What would you like to add?</p>
          <div className={styles.options}>
            {INTENTS.map(({ id, name, text, ready }) => (
              <button
                key={id}
                type='button'
                disabled={!ready}
                className={styles.option}
                onClick={() => onIntent(id)}
              >
                <span className={styles.tileName}>
                  {name}
                  {!ready && <span className={styles.soon}>Coming soon</span>}
                </span>
                <span className={styles.tileHint}>{text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default StartChoice
