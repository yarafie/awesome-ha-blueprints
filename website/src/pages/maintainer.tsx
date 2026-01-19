/**
 * MaintainerPage
 *
 * Internal maintainer console entry point.
 *
 * Handles:
 * - GitHub OAuth authentication via Supabase
 * - client-side authorization using an allow-listed email set
 * - guarded rendering of maintainer-only tooling
 *
 * This page acts as a UI access gate and orchestration shell.
 * It is not a security boundary and must not be relied upon for
 * server-side authorization or data protection.
 *
 * All privileged operations exposed through this page must be
 * validated independently on the backend or external systems.
 */
import React, { useEffect, useState, useMemo } from 'react'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { createClient, Session } from '@supabase/supabase-js'

// Maintainer Imports
import MaintainerContextPanel from '../maintainer/MaintainerContextPanel'
import MaintainerNavPanel from '../maintainer/MaintainerNavPanel'
import SystemStatusPanel from '../maintainer/SystemStatusPanel'
import SafeActionsPanel from '../maintainer/SafeActionsPanel'

//Main
export default function MaintainerPage(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()

  // 1. Destructure env variables safely
  const { SUPABASE_URL, SUPABASE_ANON_KEY, ALLOWED_MAINTAINERS } = (siteConfig
    .customFields.env || {}) as {
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
    ALLOWED_MAINTAINERS: string[]
  }

  // 5️⃣ Fail fast if Supabase env vars are missing
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase environment variables are not configured') // ← added
  }

  // 6️⃣ Normalize allowed maintainers list
  const allowedMaintainers = Array.isArray(ALLOWED_MAINTAINERS)
    ? ALLOWED_MAINTAINERS
    : [] // ← added

  // 2. Prevent client recreation using useMemo
  const supabase = useMemo(
    () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY),
    [SUPABASE_URL, SUPABASE_ANON_KEY],
  )

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes (Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin + siteConfig.baseUrl + 'maintainer',
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (loading) {
    return (
      <Layout title='Loading...'>
        <div style={{ padding: '5rem', textAlign: 'center' }}>
          <div className='loader'>Verifying permissions...</div>
        </div>
      </Layout>
    )
  }

  const userEmail = session?.user?.email?.toLowerCase()

  // 7️⃣ Explicit boolean authorization check
  const isAuthorized =
    !!userEmail &&
    allowedMaintainers.some((email) => email.toLowerCase() === userEmail) // ← updated

  // VIEW: Unauthenticated
  if (!session) {
    return (
      <Layout title='Maintainer Access'>
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <h1>Maintainer Access</h1>
          <p>Please log in with an authorized GitHub account.</p>
          <button
            onClick={handleLogin}
            className='button button--primary button--lg'
          >
            Login with GitHub
          </button>
        </div>
      </Layout>
    )
  }

  // VIEW: Authenticated but Unauthorized
  if (!isAuthorized) {
    return (
      <Layout title='Access Denied'>
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <h1 style={{ color: 'var(--ifm-color-danger)' }}>Unauthorized</h1>
          <p>
            The account <strong>{userEmail}</strong> does not have maintainer
            privileges.
          </p>
          <button onClick={handleLogout} className='button button--secondary'>
            Sign Out
          </button>
        </div>
      </Layout>
    )
  }

  // VIEW: Authorized Dashboard
  return (
    <Layout title='Maintainer Dashboard'>
      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Maintenance Dashboard</h1>

        <section>
          <MaintainerContextPanel session={session} />
        </section>

        <MaintainerNavPanel />

        <SystemStatusPanel />

        <SafeActionsPanel />

        <section
          style={{
            marginTop: '2rem',
            border: '1px solid var(--ifm-color-emphasis-300)',
            padding: '1rem',
            borderRadius: '8px',
          }}
        >
          <h3>Admin Actions</h3>
          <p>
            Welcome to the control panel. Use the tools below to manage the
            library.
          </p>

          {/* Add your custom management components here */}

          <hr />

          <button
            onClick={handleLogout}
            className='button button--outline button--danger'
          >
            Logout
          </button>
        </section>
      </main>
    </Layout>
  )
}
