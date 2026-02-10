/**
 * resolveGithubAuthor
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Resolve a GitHub user by login
 *  - Used for author attribution and maintainer override
 *
 * Design constraints:
 *  - NO UI logic
 *  - NO caching
 *  - NO global state
 *  - Pure async resolver
 */

export interface ResolvedGithubAuthor {
  /** GitHub login */
  id: string
  /** Display name (fallback to login) */
  name: string
  /** Avatar URL */
  avatarUrl?: string
  /** Profile URL */
  profileUrl?: string
}

export async function resolveGithubAuthor(
  login: string,
): Promise<ResolvedGithubAuthor> {
  const normalized = login.trim()
  if (!normalized) {
    throw new Error('Empty GitHub username')
  }

  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(normalized)}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    },
  )

  if (res.status === 404) {
    throw new Error(`GitHub user not found: ${normalized}`)
  }

  if (!res.ok) {
    throw new Error(`GitHub lookup failed (${res.status})`)
  }

  const data = await res.json()

  return {
    id: data.login,
    name: data.name || data.login,
    avatarUrl: data.avatar_url,
    profileUrl: data.html_url,
  }
}
