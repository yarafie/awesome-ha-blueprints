/**
 * SubmitPanel
 * ────────────────────────────────────────────────────────────────
 * The last part of the package card: sends the update to GitHub as a
 * pull request in the contributor's name.
 *
 * The page needs a permission from GitHub for that. It is asked for
 * here, at the moment it is needed, and what the page does with it is
 * said before. Downloading the package needs no permission.
 */

import React, { useEffect, useState } from 'react'
import styles from '../contributors.module.css'
import {
  canSubmit,
  SubmitError,
  SUBMIT_STEPS,
  submitUpdate,
  WRITE_SCOPE,
  type SubmitResult,
  type UpdateSubmission,
} from '../services/github'

interface SubmitPanelProps {
  /** everything to send, or null while the package is not ready */
  submission: Omit<UpdateSubmission, 'token'> | null
  /** GitHub token of the signed-in contributor, if the page has one */
  token: string | null
  /** called just before the browser leaves for GitHub */
  onLeave: () => void
  /** asks GitHub for the permission; the browser leaves the page */
  requestAccess: (scopes: string) => Promise<void>
  /** called once the pull request exists */
  onSubmitted: (result: SubmitResult) => void
}

type Permission = 'unknown' | 'granted' | 'needed'

// The page of this site's sign-in app in the contributor's own GitHub
// settings, where its permission can be withdrawn. The id in it is the
// public Client ID of the GitHub OAuth app behind the sign-in, not a secret.
const REVOKE_PAGE =
  'https://github.com/settings/connections/applications/Ov23liveEDchLGieRirJ'
// where the contributing guide explains the permission
const ABOUT_PAGE =
  '/awesome-ha-blueprints/docs/contributing#the-contribute-page-and-your-github-account'

const SubmitPanel: React.FC<SubmitPanelProps> = ({
  submission,
  token,
  onLeave,
  requestAccess,
  onSubmitted,
}) => {
  const [permission, setPermission] = useState<Permission>('unknown')
  const [step, setStep] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<SubmitError | null>(null)
  const [result, setResult] = useState<SubmitResult | null>(null)

  // does GitHub already allow the page to submit?
  useEffect(() => {
    let current = true
    if (!token) {
      setPermission('needed')
      return
    }
    setPermission('unknown')
    canSubmit(token)
      .then((yes) => current && setPermission(yes ? 'granted' : 'needed'))
      .catch(() => current && setPermission('needed'))
    return () => {
      current = false
    }
  }, [token])

  const handleAllow = async () => {
    setFailure(null)
    onLeave()
    try {
      await requestAccess(WRITE_SCOPE)
    } catch (err) {
      setFailure(
        new SubmitError(
          err instanceof Error ? err.message : 'GitHub could not be opened.',
        ),
      )
    }
  }

  const handleSubmit = async () => {
    if (!submission || !token || busy) return
    setBusy(true)
    setFailure(null)
    try {
      const done = await submitUpdate({ ...submission, token }, setStep)
      setResult(done)
      onSubmitted(done)
    } catch (err) {
      const problem =
        err instanceof SubmitError
          ? err
          : new SubmitError('Something went wrong while submitting.')
      if (problem.needsPermission) setPermission('needed')
      setFailure(problem)
    } finally {
      setBusy(false)
    }
  }

  if (result) {
    return (
      <div className={styles.section}>
        <p className={`${styles.finding} ${styles.findingOk}`}>
          Pull request #{result.number} is open.{' '}
          <a href={result.url} target='_blank' rel='noreferrer'>
            Look at it on GitHub
          </a>
          . Its checks start by themselves.
        </p>
        <p className={styles.hint}>
          This page has let go of its access to your GitHub account. The
          permission itself stays until you withdraw it:{' '}
          <a href={REVOKE_PAGE} target='_blank' rel='noreferrer'>
            open the page of this site in your GitHub settings
          </a>{' '}
          and press Revoke access. You can allow it again the next time you
          submit.
        </p>
      </div>
    )
  }

  const ready = submission !== null

  return (
    <div className={styles.section}>
      <p className={styles.hint} style={{ marginBottom: '0.5rem' }}>
        Or submit it from here as a pull request. In your name, the page creates
        a copy of the repository in your GitHub account if you have none, adds
        one branch with two commits (the version you started from, then your
        update) and opens one pull request. Nothing else is changed.
      </p>

      {permission !== 'granted' && (
        <div className={`${styles.finding} ${styles.findingNote}`}>
          <strong>Before you allow.</strong> Signing in gave this page only your
          GitHub name. To submit for you, GitHub asks you to let{' '}
          <strong>Awesome HA Library Authentication</strong> write to your
          public repositories; GitHub offers no narrower permission for this,
          and it sends you an email when you grant it. The page uses the
          permission only for the steps above and lets go of it as soon as the
          pull request is open. You can{' '}
          <a href={REVOKE_PAGE} target='_blank' rel='noreferrer'>
            withdraw it in your GitHub settings
          </a>{' '}
          at any time. If you would rather not grant it, download the package
          instead. <a href={ABOUT_PAGE}>More about this permission</a>
        </div>
      )}

      {step !== null && (
        <ol className={styles.progress}>
          {SUBMIT_STEPS.map((label, i) => (
            <li
              key={label}
              className={
                i < step
                  ? styles.progressDone
                  : i === step
                    ? failure
                      ? styles.progressFailed
                      : styles.progressNow
                    : styles.muted
              }
            >
              {label}
            </li>
          ))}
        </ol>
      )}

      {failure && (
        <p className={`${styles.finding} ${styles.findingError}`}>
          {failure.message}
          {failure.link && (
            <>
              {' '}
              <a href={failure.link} target='_blank' rel='noreferrer'>
                Open it on GitHub
              </a>
            </>
          )}
        </p>
      )}

      <div className={styles.actions}>
        {permission === 'granted' ? (
          <button
            type='button'
            className='button button--primary'
            disabled={!ready || busy}
            onClick={handleSubmit}
          >
            {busy ? 'Submitting…' : 'Submit pull request'}
          </button>
        ) : (
          <button
            type='button'
            className='button button--secondary'
            disabled={!ready || permission === 'unknown'}
            onClick={handleAllow}
          >
            Allow on GitHub and continue
          </button>
        )}
        {ready && permission === 'needed' && (
          <span className={styles.hint}>
            You come back here with everything you entered.
          </span>
        )}
      </div>
    </div>
  )
}

export default SubmitPanel
