/**
 * Component: ContributorsApp
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Single source of truth for contributor page state
 *  - Owns reducers and passes state/dispatch to UI blocks
 *  - Hydrates contributor auth state from Supabase session
 *
 * IMPORTANT:
 *  - No application backend calls (Supabase auth only)
 *  - SSR/SSG safe (no window access during render)
 *
 * Phase 3:
 *  - Wire full Blueprint Metadata UI fields (automation)
 *  - Submit shows Phase 6 payload preview ONLY
 */
import React, { useEffect, useMemo, useReducer, useState } from 'react'
import { createClient, Session } from '@supabase/supabase-js'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import ContributorHeader from './ContributorHeader'
import ContributionTypeSelector from './ContributionTypeSelector'
import YamlUpload from './YamlUpload'
import YamlPreview from './YamlPreview'
import { authReducer, initialAuthState } from '../state/authState'
import {
  contributionReducer,
  initialContributionState,
} from '../state/contributionState'
import BlueprintMetadataForm from './BlueprintMetadataForm'
import PayloadPreview from './PayloadPreview'
import {
  deriveBlueprintMetadataDraft,
  type BlueprintMetadataDraft,
} from '../state/deriveBlueprintMetadata'

const ContributorsApp: React.FC = () => {
  const { siteConfig } = useDocusaurusContext()

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = (siteConfig.customFields.env ||
    {}) as {
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase environment variables are not configured')
  }

  const supabase = useMemo(
    () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY),
    [SUPABASE_URL, SUPABASE_ANON_KEY],
  )

  const [authState, authDispatch] = useReducer(authReducer, initialAuthState)
  const [contributionState, contributionDispatch] = useReducer(
    contributionReducer,
    initialContributionState,
  )

  /**
   * Hydrate auth reducer from Supabase session
   */
  const hydrateFromSession = (session: Session) => {
    const meta = session.user.user_metadata || {}

    if (!meta.user_name || !meta.provider_id) return

    authDispatch({
      type: 'AUTH_SUCCESS',
      user: {
        id: Number(meta.provider_id),
        login: meta.user_name,
        name: meta.full_name,
        avatar_url: meta.avatar_url,
        html_url: `https://github.com/${meta.user_name}`,
      },
    })
  }

  /**
   * Supabase auth session lifecycle
   */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        hydrateFromSession(data.session)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        authDispatch({ type: 'AUTH_LOGOUT' })
        return
      }
      hydrateFromSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const loggedIn = authState.user?.login ?? ''
  const isOwnerOverride = loggedIn === 'yarafie'

  const [blueprintDraft, setBlueprintDraft] =
    useState<BlueprintMetadataDraft | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // When YAML becomes available, derive initial Blueprint Metadata draft once
  useEffect(() => {
    if (contributionState.status !== 'yaml_parsed') return
    if (!contributionState.yaml) return
    if (!loggedIn) return

    const d = deriveBlueprintMetadataDraft({
      yamlName: contributionState.yaml.name,
      yamlDescription: contributionState.yaml.description,
      loggedInUser: loggedIn,
    })

    setBlueprintDraft(d)
    setSubmitted(false)
  }, [contributionState.status, contributionState.yaml, loggedIn])

  const canShowYamlPreview = useMemo(() => {
    return (
      contributionState.status === 'yaml_parsed' && !!contributionState.yaml
    )
  }, [contributionState.status, contributionState.yaml])

  // Phase 6 payload preview requires YAML + derived draft
  const canSubmit = useMemo(() => {
    if (!contributionState.yaml) return false
    if (!blueprintDraft) return false
    if (!blueprintDraft.blueprint_id.trim()) return false
    if (!blueprintDraft.name.trim()) return false
    if (!blueprintDraft.description.trim()) return false
    // Images are required by your locked rule (uploaded + renamed)
    if (!blueprintDraft.images.length) return false
    return true
  }, [contributionState.yaml, blueprintDraft])

  return (
    <>
      <ContributorHeader authState={authState} authDispatch={authDispatch} />

      {authState.status === 'authenticated' && (
        <>
          {/* Phase 1: Contribution type */}
          {contributionState.status === 'idle' && (
            <ContributionTypeSelector
              disabled={false}
              onSelect={(type) =>
                contributionDispatch({
                  type: 'SELECT_TYPE',
                  contribution: type,
                })
              }
            />
          )}

          {/* Phase 2: YAML upload */}
          {contributionState.status === 'yaml_required' && (
            <YamlUpload
              onParsed={(payload) =>
                contributionDispatch({ type: 'YAML_UPLOADED', payload })
              }
              onError={(error) =>
                contributionDispatch({ type: 'YAML_ERROR', error })
              }
            />
          )}

          {/* Error */}
          {contributionState.status === 'error' && (
            <section className='container padding-vert--lg'>
              <h2>Upload Error</h2>
              <p style={{ color: 'var(--ifm-color-danger)' }}>
                {contributionState.error}
              </p>
              <button
                className='button button--secondary'
                onClick={() => contributionDispatch({ type: 'RESET' })}
              >
                Start Over
              </button>
            </section>
          )}

          {/* Phase 3: Blueprint Metadata UI + YAML Preview + Submit -> Phase6 payload preview ONLY */}
          {canShowYamlPreview && contributionState.yaml && blueprintDraft && (
            <>
              {submitted ? (
                <PayloadPreview
                  draft={blueprintDraft}
                  yaml={contributionState.yaml}
                />
              ) : (
                <>
                  {/* ORDER LOCK: Complete Metadata THEN YAML Preview */}
                  <BlueprintMetadataForm
                    draft={blueprintDraft}
                    setDraft={setBlueprintDraft}
                    isOwnerOverride={isOwnerOverride}
                  />
                  <YamlPreview yaml={contributionState.yaml} />
                  <section className='container padding-vert--lg'>
                    <button
                      className='button button--primary'
                      disabled={!canSubmit}
                      onClick={() => setSubmitted(true)}
                    >
                      Submit (Preview Phase 6 Payload)
                    </button>
                    {!canSubmit && (
                      <div
                        style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}
                      >
                        Submit is disabled until required Blueprint Metadata is
                        complete (name, description, blueprint_id, and PNG
                        image).
                      </div>
                    )}
                  </section>
                </>
              )}
            </>
          )}
        </>
      )}

      {authState.status !== 'authenticated' && (
        <section className='container padding-vert--lg'>
          <p style={{ opacity: 0.7 }}>
            Please authenticate with GitHub to begin contributing.
          </p>
        </section>
      )}
    </>
  )
}

export default ContributorsApp
