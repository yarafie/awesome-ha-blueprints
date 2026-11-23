/**
 * ContributorsApp
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Root feature orchestrator for the Contributors flow
 *  - Consumes shared authentication module
 *  - Decides what feature UI to render based on auth state
 *
 * Design constraints:
 *  - NO page-level layout (handled by AppLayout)
 *  - NO page headers or titles (handled by PageHeader)
 *  - NO auth logic (delegated to useAuth)
 *  - NO CSS assumptions
 *
 * Step 1:
 *  - Contribution role override (pre-selection only)
 *  - Contribution type selection (post-auth)
 *
 * Step 2.1:
 *  - Update blueprint target selection
 *
 * Step 2.2:
 *  - YAML upload + analysis
 *  - Update type selection
 *  - Read-only target summary
 *
 * Step 3:
 *  - Update Form (author attribution + fixed context)
 *
 * This file is the ROOT of the Contributors feature tree.
 */

import React, { useReducer, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import { useAuth } from '@library/auth/hooks/useAuth'
import AuthCard from '@library/auth/ui/AuthCard'

import type { AuthorAttribution } from './state/contributionTypes'
import {
  contributionReducer,
  initialContributionState,
} from './state/contributionReducer'

import ContributionTypeStep from './ui/ContributionTypeStep'
import UpdateBlueprintSelector from './ui/UpdateBlueprintSelector'
import YamlUploadCard from './ui/YamlUploadCard'
import YamlAnalysis from './ui/YamlAnalysis'
import UpdateTypeSelector from './ui/UpdateTypeSelector'
import UpdateTargetSummaryCard from './ui/UpdateTargetSummaryCard'
import UpdateForm from './ui/UpdateForm'

// ────────────────────────────────────────────────────────────────
// H.2 — GitHub author resolution (shared service)
// ────────────────────────────────────────────────────────────────
import {
  resolveGithubAuthor,
  type ResolvedGithubAuthor,
} from '@site/src/services/github/resolveGithubAuthor'

const ContributorsApp: React.FC = () => {
  const { state: authState, login, logout } = useAuth('/contributors')

  const { siteConfig } = useDocusaurusContext()
  const allowedMaintainers = (
    siteConfig.customFields?.env?.LIBRARY_MAINTAINERS ?? ''
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const isRoleOverrideAllowed =
    authState.status === 'authenticated' &&
    authState.user &&
    allowedMaintainers.includes(authState.user.login)

  const [contributionState, dispatch] = useReducer(
    contributionReducer,
    initialContributionState,
  )

  const showRoleToggle =
    authState.status === 'authenticated' &&
    contributionState.mode === null &&
    isRoleOverrideAllowed

  const isUpdateTargetComplete =
    contributionState.updateTarget !== null &&
    contributionState.updateTarget !== undefined &&
    contributionState.updateTarget.category &&
    contributionState.updateTarget.blueprintId &&
    contributionState.updateTarget.libraryId &&
    contributionState.updateTarget.releaseId &&
    contributionState.updateTarget.version

  const [showYamlStage, setShowYamlStage] = useState(false)

  // ────────────────────────────────────────────────────────────────
  // Step 2.2.5 → Update Form Mode gate (ADDITIVE)
  // ────────────────────────────────────────────────────────────────
  const [isUpdateFormMode, setIsUpdateFormMode] = useState(false)

  const hasUploadedYaml = typeof contributionState.uploadedYaml === 'string'
  const hasExistingYaml = typeof contributionState.existingYaml === 'string'

  // ✅  Explicit confirmation gate
  const updateTypeConfirmed = Boolean(contributionState.updateTypeConfirmed)

  // ────────────────────────────────────────────────────────────────
  // H.2 — Author attribution (REDUCER-DRIVEN)
  // ────────────────────────────────────────────────────────────────

  function buildAuthorFromAuthUser(): AuthorAttribution | null {
    if (authState.status !== 'authenticated' || !authState.user) return null

    const login = authState.user.login
    const name = authState.user.name ?? login

    // GitHub OAuth payloads often include avatar_url and html_url.
    // If html_url is missing, we fall back to the canonical GitHub profile.
    const avatarUrl = (authState.user as any)?.avatar_url as string | undefined
    const profileUrl =
      ((authState.user as any)?.html_url as string | undefined) ??
      `https://github.com/${login}`

    return {
      id: login,
      name,
      avatarUrl,
      profileUrl,
    }
  }

  async function handleAuthorCheck(next: { id: string }) {
    const requestedId = next.id.trim()

    // Persist what the user typed (draft) and reset status to idle via reducer.
    dispatch({ type: 'SET_AUTHOR_DRAFT_ID', id: requestedId })

    if (!requestedId) {
      dispatch({ type: 'AUTHOR_LOOKUP_ERROR', error: 'Empty GitHub username' })
      return
    }

    dispatch({ type: 'AUTHOR_LOOKUP_START' })

    try {
      const resolved: ResolvedGithubAuthor =
        await resolveGithubAuthor(requestedId)

      dispatch({
        type: 'AUTHOR_LOOKUP_SUCCESS',
        author: {
          id: resolved.id,
          name: resolved.name,
          avatarUrl: resolved.avatarUrl,
          profileUrl: resolved.profileUrl,
        },
      })
    } catch (err: any) {
      dispatch({
        type: 'AUTHOR_LOOKUP_ERROR',
        error: err?.message ?? 'Unable to resolve GitHub user',
      })
    }
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}
    >
      <AuthCard
        authState={authState}
        onLogin={login}
        onLogout={logout}
        effectiveRole={contributionState.effectiveRole}
        showRoleToggle={showRoleToggle}
        onRoleChange={(role) =>
          dispatch({
            type: 'SET_EFFECTIVE_ROLE',
            role,
          })
        }
      />

      {/* Step 1 — Contribution type */}
      {authState.status === 'authenticated' &&
        contributionState.mode === null && (
          <ContributionTypeStep
            onSelect={(mode) =>
              dispatch({
                type: 'SELECT_CONTRIBUTION_MODE',
                mode,
              })
            }
          />
        )}

      {/* Step 2.x — Update Blueprint Flow */}
      {authState.status === 'authenticated' &&
        contributionState.mode === 'update_blueprint' &&
        !isUpdateFormMode && (
          <>
            {/* Step 2.1 — Update target selection */}
            <div className='card'>
              <div className='card__body'>
                <UpdateBlueprintSelector
                  value={contributionState.updateTarget ?? null}
                  onChange={(target) => {
                    setShowYamlStage(false)
                    dispatch({
                      type: 'SET_UPDATE_TARGET',
                      target,
                    })
                  }}
                />

                {isUpdateTargetComplete && !showYamlStage && (
                  <div
                    style={{
                      marginTop: 24,
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button
                      className='button button--primary'
                      onClick={() => setShowYamlStage(true)}
                    >
                      Continue
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2.2.1 — YAML Upload */}
            {showYamlStage && (
              <YamlUploadCard
                value={contributionState.uploadedYaml ?? null}
                onChange={(yaml) =>
                  dispatch({
                    type: 'SET_UPLOADED_YAML',
                    yaml,
                  })
                }
              />
            )}

            {/* Step 2.2.2 — YAML Analysis */}
            {showYamlStage && (
              <>
                {hasUploadedYaml ? (
                  hasExistingYaml ? (
                    <YamlAnalysis
                      existingYaml={contributionState.existingYaml!}
                      uploadedYaml={contributionState.uploadedYaml!}
                    />
                  ) : (
                    <div className='card'>
                      <div className='card__body'>
                        <h3>YAML Analysis</h3>
                        <p style={{ color: 'var(--ifm-color-danger)' }}>
                          Unable to load existing YAML for the selected target.
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className='card'>
                    <div className='card__body'>
                      <h3>YAML Analysis</h3>
                      <p>Analysis will appear after upload.</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Step 2.2.4 — Update Type Selector */}
            {hasUploadedYaml && hasExistingYaml && (
              <UpdateTypeSelector
                value={contributionState.updateType ?? null}
                onChange={(updateType) =>
                  dispatch({
                    type: 'SET_UPDATE_TYPE',
                    updateType,
                  })
                }
                // IMPORTANT:
                // - Only pass onConfirm BEFORE confirmed.
                // - This makes the "Continue" button disappear after confirmation.
                onConfirm={
                  !updateTypeConfirmed
                    ? () =>
                        dispatch({
                          type: 'CONFIRM_UPDATE_TYPE',
                        })
                    : undefined
                }
              />
            )}

            {/* Step 2.2.5 — Target Summary → gate */}
            {hasUploadedYaml &&
              hasExistingYaml &&
              contributionState.updateTarget &&
              updateTypeConfirmed && (
                <UpdateTargetSummaryCard
                  target={contributionState.updateTarget}
                  onContinue={() => {
                    // Enter form mode
                    setIsUpdateFormMode(true)

                    // Initialize author from authenticated user (no fetch required)
                    const initialAuthor = buildAuthorFromAuthUser()
                    if (initialAuthor) {
                      dispatch({
                        type: 'AUTHOR_LOOKUP_SUCCESS',
                        author: initialAuthor,
                      })
                    }
                  }}
                />
              )}
          </>
        )}

      {/* Step 3 — Update Form Mode */}
      {isUpdateFormMode &&
        contributionState.updateTarget &&
        contributionState.author &&
        authState.user && (
          <UpdateForm
            blueprint={{
              category: contributionState.updateTarget.category,
              blueprint_id: contributionState.updateTarget.blueprintId,
              library_id: contributionState.updateTarget.libraryId,
              release_id: contributionState.updateTarget.releaseId,
              version_id: contributionState.updateTarget.version,
              update_type:
                contributionState.updateType === 'release'
                  ? 'add_release'
                  : 'add_version',
            }}
            author={contributionState.author}
            release={contributionState.release}
            canOverrideAuthor={contributionState.effectiveRole === 'maintainer'}
            changelogDraft={contributionState.changelogDraft}
            onChangelogEvent={dispatch}
            onAuthorChange={(next) => handleAuthorCheck(next)}
            onBack={() => {
              setIsUpdateFormMode(false)
              dispatch({
                type: 'SET_UPDATE_TYPE',
                updateType: contributionState.updateType ?? null,
              })
            }}
          />
        )}
    </main>
  )
}

export default ContributorsApp
