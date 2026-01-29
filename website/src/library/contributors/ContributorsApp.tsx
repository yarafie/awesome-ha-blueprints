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
 * This file is the ROOT of the Contributors feature tree.
 */

import React, { useReducer, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import { useAuth } from '@library/auth/hooks/useAuth'
import AuthCard from '@library/auth/ui/AuthCard'

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

  const hasUploadedYaml = typeof contributionState.uploadedYaml === 'string'
  const hasExistingYaml = typeof contributionState.existingYaml === 'string'

  // ✅ Additive: explicit confirmation gate for showing UpdateTargetSummary
  const updateTypeConfirmed = Boolean(
    (contributionState as any)?.updateTypeConfirmed,
  )

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

      {/* Step 2.1 — Update target selection */}
      {authState.status === 'authenticated' &&
        contributionState.mode === 'update_blueprint' && (
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
        )}

      {/* Step 2.2.1 — YAML Upload */}
      {authState.status === 'authenticated' &&
        contributionState.mode === 'update_blueprint' &&
        showYamlStage && (
          <div>
            <YamlUploadCard
              value={contributionState.uploadedYaml ?? null}
              onChange={(yaml) =>
                dispatch({
                  type: 'SET_UPLOADED_YAML',
                  yaml,
                })
              }
            />
          </div>
        )}

      {/* Step 2.2.2 — YAML Analysis (full-width row) */}
      {authState.status === 'authenticated' &&
        contributionState.mode === 'update_blueprint' &&
        showYamlStage && (
          <div>
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
          </div>
        )}

      {/* Step 2.2.4 — Update Type Selector */}
      {authState.status === 'authenticated' &&
        contributionState.mode === 'update_blueprint' &&
        hasUploadedYaml &&
        hasExistingYaml && (
          <UpdateTypeSelector
            value={contributionState.updateType ?? null}
            onChange={(updateType) =>
              dispatch({
                type: 'SET_UPDATE_TYPE',
                updateType,
              })
            }
            // ✅ Additive: confirm step (button lives inside UpdateTypeSelector)
            // If UpdateTypeSelector doesn't accept this prop yet, it can be added as optional.
            onConfirm={() =>
              dispatch({
                type: 'CONFIRM_UPDATE_TYPE',
              })
            }
          />
        )}

      {/* Step 2.2.5 — Read-only Update Target Summary */}
      {authState.status === 'authenticated' &&
        contributionState.mode === 'update_blueprint' &&
        hasUploadedYaml &&
        hasExistingYaml &&
        contributionState.updateTarget &&
        updateTypeConfirmed && (
          <UpdateTargetSummaryCard target={contributionState.updateTarget} />
        )}
    </main>
  )
}

export default ContributorsApp
