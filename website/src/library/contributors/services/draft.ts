/**
 * Keeping the work across a visit to GitHub
 * ────────────────────────────────────────────────────────────────
 * To give the page the permission to submit, the browser goes to
 * GitHub and comes back. What was entered is put aside in the tab's
 * own storage just before, and taken out again on return. It is used
 * once and never leaves the browser.
 *
 * An update is a little text and goes into the tab's session storage.
 * A new controller comes with a picture and maybe a manual, which are
 * too large for that: it goes into the browser's database, with a mark
 * in the tab so that only this tab takes it back, and only for a while.
 */

import type { ContributionFiles, YamlFile } from './files'

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

// ── a new controller ───────────────────────────────────────────────

const NEW_KEY = 'ahb-contributors-new'
const DATABASE = 'ahb-contributors'
const STORE = 'drafts'
/** a draft that was not taken back within this time is thrown away */
const KEEP_MS = 15 * 60 * 1000

export interface NewDraft<Details> {
  files: ContributionFiles
  details: Details
  detailsFor: string | null
}

interface StoredDraft {
  mark: string
  savedAt: number
  draft: unknown
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function inStore<T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(STORE, mode)
        const request = work(transaction.objectStore(STORE))
        transaction.oncomplete = () => {
          database.close()
          resolve(request.result)
        }
        transaction.onerror = () => {
          database.close()
          reject(transaction.error)
        }
      }),
  )
}

export async function saveNewDraft<Details>(
  draft: NewDraft<Details>,
): Promise<boolean> {
  try {
    const mark = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const stored: StoredDraft = { mark, savedAt: Date.now(), draft }
    await inStore('readwrite', (store) => store.put(stored, NEW_KEY))
    window.sessionStorage.setItem(NEW_KEY, mark)
    return true
  } catch {
    return false
  }
}

/** the new-controller draft of this tab, if any; it is removed when read */
export async function takeNewDraft<
  Details,
>(): Promise<NewDraft<Details> | null> {
  try {
    const mark = window.sessionStorage.getItem(NEW_KEY)
    if (!mark) return null
    window.sessionStorage.removeItem(NEW_KEY)
    const stored = (await inStore('readonly', (store) =>
      store.get(NEW_KEY),
    )) as StoredDraft | undefined
    await inStore('readwrite', (store) => store.delete(NEW_KEY))
    if (!stored || stored.mark !== mark) return null
    if (Date.now() - stored.savedAt > KEEP_MS) return null
    return stored.draft as NewDraft<Details>
  } catch {
    return null
  }
}
