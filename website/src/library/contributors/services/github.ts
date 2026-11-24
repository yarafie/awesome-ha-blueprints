/**
 * Submitting to GitHub
 * ────────────────────────────────────────────────────────────────
 * Sends an update as a pull request, in the name of the signed-in
 * contributor and with the permission they gave on GitHub. It does
 * what `pnpm contribute` does on a computer:
 *
 *   - uses the contributor's copy (fork) of the repository, creating
 *     it when there is none; a maintainer works in the repository
 *     itself
 *   - one branch with the name the checks expect
 *   - two commits: the version the update is based on, copied without
 *     changes, then the update
 *   - one pull request, with the second commit message as its title
 *
 * Nothing is written before every check has passed, and nothing that
 * exists is changed: the branch and the files must be new.
 */

import { REPO_URL } from '@library/format/controllerFormat.mjs'

const API = 'https://api.github.com'
const UPSTREAM = REPO_URL.replace('https://github.com/', '')
const ROOT = 'website/docs/blueprints/'
/** the permission the page asks for on GitHub */
export const WRITE_SCOPE = 'public_repo'

export const SUBMIT_STEPS = [
  'Checking your permission on GitHub',
  'Checking the library on GitHub',
  'Preparing your copy of the repository',
  'Creating the branch with two commits',
  'Opening the pull request',
] as const

export interface UpdateSubmission {
  token: string
  /** GitHub name of the signed-in contributor */
  login: string
  id: string
  /** where the new version goes */
  location: { library: string; release: string; version: string }
  /** the stated base */
  base: { library: string; release: string; version: string }
  /** path and text of the base, as known to this page */
  basePath: string
  baseText: string
  /** commit 1: the base under the new path */
  baseCopy: { path: string; text: string }
  /** commit 2: the update and the changelog */
  files: { path: string; text: string }[]
  /** changelog of the release as known to this page, and its path */
  changelogPath: string
  changelogText: string
  kind: 'fix' | 'improvement'
  description: string
}

export interface SubmitResult {
  url: string
  number: number
  branch: string
}

/** a failure with a message that can be shown as it is */
export class SubmitError extends Error {
  /** permission is missing: asking for it again can help */
  needsPermission: boolean
  /** a page on GitHub where the contributor can carry on by hand */
  link?: string
  constructor(
    message: string,
    extra: { needsPermission?: boolean; link?: string } = {},
  ) {
    super(message)
    this.name = 'SubmitError'
    this.needsPermission = Boolean(extra.needsPermission)
    this.link = extra.link
  }
}

interface Reply {
  status: number
  ok: boolean
  scopes: string[]
  // the data GitHub sent: an object, or text when text was asked for
  data: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

async function call(
  token: string,
  method: string,
  path: string,
  body?: unknown,
  raw = false,
): Promise<Reply> {
  let response: Response
  try {
    response = await fetch(`${API}${path}`, {
      method,
      headers: {
        Accept: raw
          ? 'application/vnd.github.raw+json'
          : 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new SubmitError(
      'GitHub could not be reached. Check your connection and try again.',
    )
  }
  const text = await response.text()
  let data: unknown = text
  if (!raw || !response.ok) {
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = text
    }
  }
  return {
    status: response.status,
    ok: response.ok,
    scopes: (response.headers.get('x-oauth-scopes') ?? '')
      .split(',')
      .map((scope) => scope.trim())
      .filter(Boolean),
    data,
  }
}

function refused(reply: Reply, doing: string): SubmitError {
  const reason =
    reply.data && typeof reply.data === 'object' && reply.data.message
      ? String(reply.data.message)
      : `status ${reply.status}`
  if (reply.status === 401)
    return new SubmitError(
      'GitHub no longer accepts the permission of this page. Allow it again and submit once more.',
      { needsPermission: true },
    )
  return new SubmitError(`GitHub refused ${doing}: ${reason}`)
}

/** true when GitHub has given the page the permission to submit */
export async function canSubmit(token: string): Promise<boolean> {
  const reply = await call(token, 'GET', '/user')
  return (
    reply.ok &&
    (reply.scopes.includes(WRITE_SCOPE) || reply.scopes.includes('repo'))
  )
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const encoded = (path: string) =>
  path.split('/').map(encodeURIComponent).join('/')

export function updateMessages(s: UpdateSubmission): [string, string] {
  const { id, base, location } = s
  const label = s.kind === 'fix' ? '[Bug Fix]' : '[Enhancement]'
  const description = s.description.replace(/\s+/g, ' ').trim()
  return [
    `[${id}] Copy ${base.library}/${base.release} ${base.version} as ${location.version} (no changes)`,
    `[${id}] ${location.library}/${location.release} ${location.version}: ${label} ${description}`,
  ]
}

/**
 * Sends the update. `onStep` is called with the number of the step that
 * starts (see SUBMIT_STEPS).
 */
export async function submitUpdate(
  s: UpdateSubmission,
  onStep: (step: number) => void,
): Promise<SubmitResult> {
  const { token } = s
  const get = (path: string, raw = false) =>
    call(token, 'GET', path, undefined, raw)
  const post = (path: string, body: unknown) => call(token, 'POST', path, body)

  // ── 1. permission ────────────────────────────────────────────────
  onStep(0)
  const me = await get('/user')
  if (!me.ok) throw refused(me, 'to say who you are')
  if (!me.scopes.includes(WRITE_SCOPE) && !me.scopes.includes('repo'))
    throw new SubmitError(
      'GitHub has not given this page the permission to submit for you yet.',
      { needsPermission: true },
    )
  if (String(me.data.login).toLowerCase() !== s.login.toLowerCase())
    throw new SubmitError(
      `You are signed in here as ${s.login}, but GitHub answers for ${me.data.login}. Sign out, sign in again and submit once more.`,
    )
  const login = String(me.data.login)
  const upstream = await get(`/repos/${UPSTREAM}`)
  if (!upstream.ok) throw refused(upstream, 'to show the repository')
  const main = String(upstream.data.default_branch)
  const maintainer = Boolean(upstream.data.permissions?.push)

  // ── 2. the library as it is now on GitHub ────────────────────────
  onStep(1)
  const ref = await get(`/repos/${UPSTREAM}/git/ref/heads/${encoded(main)}`)
  if (!ref.ok) throw refused(ref, `to show the ${main} branch`)
  const mainSha = String(ref.data.object.sha)
  const content = (path: string) =>
    get(
      `/repos/${UPSTREAM}/contents/${encoded(ROOT + path)}?ref=${mainSha}`,
      true,
    )
  const stale =
    'The library on GitHub is not the same as on this page. Reload the page and start again.'
  const baseNow = await content(s.basePath)
  if (!baseNow.ok || baseNow.data !== s.baseText) throw new SubmitError(stale)
  const changelogNow = await content(s.changelogPath)
  const changelogKnown = s.changelogText === '[]' ? null : s.changelogText
  if (
    changelogNow.status === 404
      ? changelogKnown !== null
      : changelogNow.data !== changelogKnown
  )
    throw new SubmitError(stale)
  const taken = await content(s.baseCopy.path)
  if (taken.status !== 404)
    throw new SubmitError(
      `Version ${s.location.version} of this blueprint already exists on GitHub. Reload the page and start again.`,
    )

  // ── 3. where the branch goes ─────────────────────────────────────
  onStep(2)
  let head = UPSTREAM
  if (!maintainer) {
    const fork = await post(`/repos/${UPSTREAM}/forks`, {
      default_branch_only: true,
    })
    if (!fork.ok) throw refused(fork, 'to create your copy of the repository')
    head = String(fork.data.full_name)
    // a new copy takes a moment; it is ready when it has the commit
    let ready = false
    for (let i = 0; i < 20 && !ready; i++) {
      if (i > 0) await wait(2000)
      ready = (await get(`/repos/${head}/git/commits/${mainSha}`)).ok
    }
    if (!ready)
      throw new SubmitError(
        `Your copy of the repository (${head}) does not have the newest state of the library yet. Open it on GitHub, press "Sync fork", and submit once more.`,
        { link: `https://github.com/${head}` },
      )
  }
  const branch = `${maintainer ? 'ahb_maintain' : 'ahb_contrib'}/controllers/${s.id}/${s.location.library}/${s.location.release}/${s.location.version}/author-${login}`
  const exists = await get(`/repos/${head}/git/ref/heads/${encoded(branch)}`)
  if (exists.ok)
    throw new SubmitError(
      `The branch for this update already exists in ${head}. If a pull request was opened from it before, use that one; otherwise delete the branch on GitHub and submit once more.`,
      { link: `https://github.com/${head}/tree/${encoded(branch)}` },
    )
  if (exists.status !== 404) throw refused(exists, 'to look for the branch')

  // ── 4. two commits and the branch ────────────────────────────────
  onStep(3)
  const [firstMessage, secondMessage] = updateMessages(s)
  const mainCommit = await get(`/repos/${head}/git/commits/${mainSha}`)
  if (!mainCommit.ok) throw refused(mainCommit, 'to read the newest commit')
  const commit = async (
    parent: string,
    parentTree: string,
    files: { path: string; text: string }[],
    message: string,
  ) => {
    const tree = await post(`/repos/${head}/git/trees`, {
      base_tree: parentTree,
      tree: files.map((file) => ({
        path: ROOT + file.path,
        mode: '100644',
        type: 'blob',
        content: file.text,
      })),
    })
    if (!tree.ok) throw refused(tree, 'to store the files')
    const made = await post(`/repos/${head}/git/commits`, {
      message,
      tree: tree.data.sha,
      parents: [parent],
    })
    if (!made.ok) throw refused(made, 'to create the commit')
    return { sha: String(made.data.sha), tree: String(tree.data.sha) }
  }
  const first = await commit(
    mainSha,
    String(mainCommit.data.tree.sha),
    [s.baseCopy],
    firstMessage,
  )
  const second = await commit(first.sha, first.tree, s.files, secondMessage)
  const created = await post(`/repos/${head}/git/refs`, {
    ref: `refs/heads/${branch}`,
    sha: second.sha,
  })
  if (!created.ok) throw refused(created, 'to create the branch')

  // ── 5. the pull request ──────────────────────────────────────────
  onStep(4)
  const owner = head.split('/')[0]
  const pull = await post(`/repos/${UPSTREAM}/pulls`, {
    title: secondMessage,
    head: `${owner}:${branch}`,
    base: main,
    body: '',
  })
  if (!pull.ok) {
    const failure = refused(pull, 'to open the pull request')
    throw new SubmitError(
      `${failure.message}. The branch with both commits was created; you can open the pull request yourself.`,
      {
        link: `https://github.com/${UPSTREAM}/compare/${encoded(main)}...${owner}:${encoded(branch)}?expand=1`,
      },
    )
  }
  return {
    url: String(pull.data.html_url),
    number: Number(pull.data.number),
    branch,
  }
}
