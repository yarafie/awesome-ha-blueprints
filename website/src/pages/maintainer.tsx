import React, { useEffect, useState, useMemo } from 'react'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { createClient, Session } from '@supabase/supabase-js'

export default function MaintainPage(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()

  // 1. Destructure env variables safely
  const { SUPABASE_URL, SUPABASE_ANON_KEY, ALLOWED_MAINTAINERS } = (siteConfig
    .customFields.env || {}) as {
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
    ALLOWED_MAINTAINERS: string[]
  }

  // 2. Prevent client recreation using useMemo
  // This ensures the Supabase instance is only created once.
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
        // Ensuring the redirect path is clean
        redirectTo: window.location.origin + siteConfig.baseUrl + 'maintain',
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null) // Clear local state immediately
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
  const isAuthorized =
    userEmail &&
    ALLOWED_MAINTAINERS?.some((email) => email.toLowerCase() === userEmail)

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
        <h1>Maintenance Dashboard</h1>
        <div className='alert alert--success' role='alert'>
          Logged in as: <strong>{userEmail}</strong>
        </div>

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
