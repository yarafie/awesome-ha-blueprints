import { AuthEvent } from './authState'

export function parseAuthRedirect(location: Location): AuthEvent | null {
  const params = new URLSearchParams(location.search)
  const code = params.get('code')
  const error = params.get('error')

  if (error) {
    return { type: 'AUTH_ERROR', error }
  }

  if (code) {
    return { type: 'AUTH_START' }
  }

  return null
}

export function clearAuthParams(location: Location) {
  const url = new URL(location.href)
  url.searchParams.delete('code')
  url.searchParams.delete('error')
  url.searchParams.delete('state')
  window.history.replaceState({}, document.title, url.toString())
}
