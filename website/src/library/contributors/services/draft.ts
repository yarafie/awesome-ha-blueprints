/**
 * Keeping the work across a visit to GitHub
 * ────────────────────────────────────────────────────────────────
 * To give the page the permission to submit, the browser goes to
 * GitHub and comes back. What was entered is put aside in the tab's
 * own storage just before, and taken out again on return. It is used
 * once and never leaves the browser.
 */

import type { YamlFile } from './files'

const KEY = 'ahb-contributors-update'

export interface UpdateDraft {
  id: string
  baseName: string | null
  yaml: YamlFile | null
  confirmed: string | null
  kind: 'fix' | 'improvement' | null
  description: string
  breaking: boolean | null
}

export function saveDraft(draft: UpdateDraft): boolean {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(draft))
    return true
  } catch {
    return false
  }
}

/** the draft that was put aside, if any; it is removed when read */
export function takeDraft(): UpdateDraft | null {
  try {
    const text = window.sessionStorage.getItem(KEY)
    if (!text) return null
    window.sessionStorage.removeItem(KEY)
    const draft = JSON.parse(text) as UpdateDraft
    return typeof draft?.id === 'string' ? draft : null
  } catch {
    return null
  }
}
