/**
 * MaintainerPage
 *
 * Internal maintainer console entry point.
 *
 * Handles:
 * - GitHub OAuth authentication via Supabase
 * - client-side authorization using an allow-listed GitHub username set
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
import MaintainerContextPanel from '@library/maintainer/MaintainerContextPanel'
import MaintainerNavPanel from '@library/maintainer/MaintainerNavPanel'
import SystemStatusPanel from '@library/maintainer/SystemStatusPanel'
import SafeActionsPanel from '@library/maintainer/SafeActionsPanel'

// Main
export default function MaintainerPage(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()

  // 1️⃣ Destructure env variables safely
  const { SUPABASE_URL, SUPABASE_ANON_KEY, ALLOWED_MAINTAINERS } = (siteConfig
    .customFields.env || {}) as {
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
    ALLOWED_MAINTAINERS: string[] | string
  }

  // 2️⃣ Normalize allowed maintainers list (GitHub usernames)
  const allowedMaintainers: string[] = Array.isArray(ALLOWED_MAINTAINERS)
    ? ALLOWED_MAINTAINERS.map((u) => u.toLowerCase()).filter(Boolean)
    : typeof ALLOWED_MAINTAINERS === 'string'
      ? ALLOWED_MAINTAINERS.split(',')
          .map((u) => u.trim().toLowerCase())
          .filter(Boolean)
      : []

  // 3️⃣ Create Supabase client lazily
  const supabase = useMemo(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return null
    }
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }, [SUPABASE_URL, SUPABASE_ANON_KEY])

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogin = async () => {
    if (!supabase) return

    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin + siteConfig.baseUrl + 'maintainer',
      },
    })
  }

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
  }

  // VIEW: Env misconfigured (safe, non-fatal)
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return (
      <Layout title='Configuration Error'>
        <div style={{ padding: '5rem', textAlign: 'center' }}>
          <h1>Configuration Error</h1>
          <p>Supabase environment variables are not configured.</p>
        </div>
      </Layout>
    )
  }

  // VIEW: Loading
  if (loading) {
    return (
      <Layout title='Loading...'>
        <div style={{ padding: '5rem', textAlign: 'center' }}>
          <div className='loader'>Verifying permissions...</div>
        </div>
      </Layout>
    )
  }

  // 4️⃣ GitHub username from Supabase session
  const githubLogin =
    session?.user?.user_metadata?.user_name?.toLowerCase() || null

  const isAuthorized = !!githubLogin && allowedMaintainers.includes(githubLogin)

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
            The GitHub account <strong>{githubLogin ?? 'unknown'}</strong> does
            not have maintainer privileges.
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
