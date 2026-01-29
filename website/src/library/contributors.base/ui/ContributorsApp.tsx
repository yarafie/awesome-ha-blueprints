import React, { useEffect, useMemo, useReducer, useState } from 'react'
import { createClient, Session } from '@supabase/supabase-js'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import ContributorHeader from './ContributorHeader'
import ContributionTypeSelector from './ContributionTypeSelector'
import UpdateTargetSelector from './UpdateTargetSelector'
import ResolvedUpdateTargetCard from './ResolvedUpdateTargetCard'
import YamlUpload from './YamlUpload'
import YamlAnalysis from './YamlAnalysis'
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
} from '../services/deriveBlueprintMetadata'

type UpdateIntent = 'version' | 'release'
type ContributorMode = 'contributor' | 'owner'

/**
 * Shared Wrapper for UI Consistency
 */
const StepCard: React.FC<{
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
}> = ({ title, children, footer }) => (
  <section className='container padding-vert--lg'>
    <div className='card'>
      {title && (
        <div className='card__header'>
          <h3>{title}</h3>
        </div>
      )}
      <div className='card__body'>{children}</div>
      {footer && <div className='card__footer'>{footer}</div>}
    </div>
  </section>
)

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
  const [contributorMode, setContributorMode] =
    useState<ContributorMode>('contributor')
  const [updateIntent, setUpdateIntent] = useState<UpdateIntent>('version')
  const [blueprintDraft, setBlueprintDraft] =
    useState<BlueprintMetadataDraft | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [showRawDiff, setShowRawDiff] = useState(false)

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) hydrateFromSession(data.session)
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
  const isOwnerIdentity = loggedIn === 'yarafie'
  const isOwnerOverride = isOwnerIdentity && contributorMode === 'owner'
  const isUpdateFlow = contributionState.contribution === 'blueprint:update'

  const updateTargetComplete =
    !!contributionState.updateTarget &&
    !!contributionState.updateTarget.category &&
    !!contributionState.updateTarget.blueprintId &&
    !!contributionState.updateTarget.libraryId &&
    !!contributionState.updateTarget.releaseId &&
    !!contributionState.updateTarget.version

  useEffect(() => {
    if (
      contributionState.status !== 'yaml_parsed' ||
      !contributionState.yaml ||
      !loggedIn
    )
      return
    setBlueprintDraft(
      deriveBlueprintMetadataDraft({
        yamlName: contributionState.yaml.name,
        yamlDescription: contributionState.yaml.description,
        loggedInUser: loggedIn,
        updateTarget: isUpdateFlow ? contributionState.updateTarget : null,
      }),
    )
    setSubmitted(false)
  }, [contributionState.status, contributionState.yaml, loggedIn, isUpdateFlow])

  const canShowYamlPreview =
    contributionState.status === 'yaml_parsed' && !!contributionState.yaml
  const hasProposedYaml =
    contributionState.status === 'yaml_parsed' && !!contributionState.yaml
  const hasExistingYaml = !isUpdateFlow || !!contributionState.existingYaml
  const canShowYamlAnalysis = hasProposedYaml && hasExistingYaml

  const canSubmit = useMemo(() => {
    if (!contributionState.yaml || !blueprintDraft) return false
    return (
      blueprintDraft.blueprint_id.trim() !== '' &&
      blueprintDraft.name.trim() !== '' &&
      blueprintDraft.description.trim() !== '' &&
      blueprintDraft.images.length > 0
    )
  }, [contributionState.yaml, blueprintDraft])

  return (
    <>
      <section className='container padding-vert--lg'>
        <ContributorHeader
          authState={authState}
          authDispatch={authDispatch}
          isOwnerIdentity={isOwnerIdentity}
          contributorMode={contributorMode}
          setContributorMode={setContributorMode}
        />
      </section>

      {authState.status === 'authenticated' ? (
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

          {/* Phase A: Update target drill-down */}
          {isUpdateFlow && contributionState.status === 'yaml_required' && (
            <UpdateTargetSelector
              value={contributionState.updateTarget}
              onChange={(target) =>
                contributionDispatch({ type: 'SET_UPDATE_TARGET', target })
              }
            />
          )}

          {/* Phase 2: YAML upload */}
          {contributionState.status === 'yaml_required' &&
            (!isUpdateFlow || updateTargetComplete) && (
              <YamlUpload
                onParsed={(payload) =>
                  contributionDispatch({ type: 'YAML_UPLOADED', payload })
                }
                onError={(error) =>
                  contributionDispatch({ type: 'YAML_ERROR', error })
                }
              />
            )}

          {/* Phase 2b: Target Confirmation */}
          {contributionState.status === 'yaml_required' &&
            isUpdateFlow &&
            updateTargetComplete && (
              <section className='container padding-vert--lg'>
                <ResolvedUpdateTargetCard
                  updateTarget={contributionState.updateTarget}
                />
              </section>
            )}

          {/* Error State - Unified into Card */}
          {contributionState.status === 'error' && (
            <StepCard title='Upload Error'>
              <p style={{ color: 'var(--ifm-color-danger)' }}>
                {contributionState.error}
              </p>
              <button
                className='button button--secondary'
                onClick={() => contributionDispatch({ type: 'RESET' })}
              >
                Start Over
              </button>
            </StepCard>
          )}

          {/* Phase 3: Submitted */}
          {submitted && blueprintDraft && contributionState.yaml && (
            <PayloadPreview
              draft={blueprintDraft}
              yaml={contributionState.yaml}
              updateIntent={updateIntent}
            />
          )}

          {/* Phase 3: Preview/Analysis */}
          {!submitted && blueprintDraft && (
            <>
              {isUpdateFlow && hasProposedYaml && (
                <>
                  {canShowYamlAnalysis ? (
                    <>
                      <YamlAnalysis
                        existingYaml={contributionState.existingYaml!}
                        proposedYaml={contributionState.yaml!.raw}
                      />

                      <StepCard title='Raw diff'>
                        <label style={{ display: 'block' }}>
                          <input
                            type='checkbox'
                            checked={showRawDiff}
                            onChange={() => setShowRawDiff(!showRawDiff)}
                          />{' '}
                          Show raw diff (-y)
                        </label>
                        {showRawDiff && (
                          <pre
                            style={{
                              marginTop: 12,
                              maxHeight: 320,
                              overflow: 'auto',
                              background: 'var(--ifm-background-surface-color)',
                              padding: 12,
                              borderRadius: 6,
                            }}
                          >
                            {contributionState.rawDiff ||
                              '(rawDiff not available)'}
                          </pre>
                        )}
                      </StepCard>
                    </>
                  ) : (
                    <StepCard title='Resolution Error'>
                      <p style={{ color: 'var(--ifm-color-danger)' }}>
                        Existing YAML could not be resolved.
                      </p>
                    </StepCard>
                  )}

                  <StepCard title='Update type'>
                    <label style={{ display: 'block' }}>
                      <input
                        type='radio'
                        checked={updateIntent === 'version'}
                        onChange={() => setUpdateIntent('version')}
                      />{' '}
                      New Version (bug fixes, minor improvements)
                    </label>
                    <label style={{ display: 'block' }}>
                      <input
                        type='radio'
                        checked={updateIntent === 'release'}
                        onChange={() => setUpdateIntent('release')}
                      />{' '}
                      New Release (major or breaking changes)
                    </label>
                    <button
                      className='button button--primary margin-top--md'
                      disabled={!canSubmit}
                      onClick={() => setSubmitted(true)}
                    >
                      Submit (Preview Phase 6 Payload)
                    </button>
                  </StepCard>
                </>
              )}

              {!isUpdateFlow &&
                canShowYamlPreview &&
                contributionState.yaml && (
                  <>
                    <BlueprintMetadataForm
                      draft={blueprintDraft}
                      setDraft={setBlueprintDraft}
                      isOwnerOverride={isOwnerOverride}
                    />
                    <YamlPreview yaml={contributionState.yaml} />

                    <StepCard title='Update type'>
                      <label style={{ display: 'block' }}>
                        <input
                          type='radio'
                          checked={updateIntent === 'version'}
                          onChange={() => setUpdateIntent('version')}
                        />{' '}
                        New Version (bug fixes, minor improvements)
                      </label>
                      <label style={{ display: 'block' }}>
                        <input
                          type='radio'
                          checked={updateIntent === 'release'}
                          onChange={() => setUpdateIntent('release')}
                        />{' '}
                        New Release (major or breaking changes)
                      </label>
                      <button
                        className='button button--primary margin-top--md'
                        disabled={!canSubmit}
                        onClick={() => setSubmitted(true)}
                      >
                        Submit (Preview Phase 6 Payload)
                      </button>
                    </StepCard>
                  </>
                )}
            </>
          )}
        </>
      ) : (
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
