/**
 * Plugin: DownloadBlueprint
 * ────────────────────────────────────────────────────────────────
 * Docusaurus route component used by blueprintRoutesPlugin.
 *
 * Routes:
 *   /blueprints/<category>/<blueprint_id>
 *   /blueprints/<category>/<blueprint_id>/<library_id>
 *   /blueprints/<category>/<blueprint_id>/<library_id>/<release_id>
 *   /blueprints/<category>/<blueprint_id>/<library_id>/<release_id>/<YYYY.MM.DD>
 *
 * YAML location (v1.6 tree):
 *   docs/blueprints/<category>/<blueprint_id>/<library_id>/<release_id>/<YYYY.MM.DD>/<blueprint_id>.yaml
 *
 * ────────────────────────────────────────────────────────────────
 */
import React, { useEffect } from 'react'
// @ts-expect-error no types for this
import Head from '@docusaurus/Head'
import { useConsent } from '@src/contexts/ConsentContext'
import { trackEvent } from '@src/utils/analytics'
import { recordBlueprintDownload } from '@src/services/supabase/librarySupabase'

export default function DownloadBlueprint(props: {
  route: {
    category: string
    id: string
    library_id?: string | null
    release_id?: string | null
    version?: string | null
    releasesIndex?: Record<string, Record<string, string[]>> // { [library_id]: { [release_id]: versions[] } }
  }
}) {
  const category = props.route.category
  const id = props.route.id
  const { consent } = useConsent()

  // -------------------------------
  //  SAFE REDIRECT VALIDATOR
  // -------------------------------
  const safeRedirect = (url: string) => {
    try {
      const allowedHost = 'my.home-assistant.io'
      const parsed = new URL(url)
      if (parsed.hostname === allowedHost) {
        window.location.href = url
      } else {
        console.error('❌ Unsafe redirect blocked:', url)
      }
    } catch {
      console.error('❌ Invalid redirect URL:', url)
    }
  }

  // -------------------------------
  //  GET VERSION (default = latest)
  // 'latest' is a transient UI token, never persisted
  // -------------------------------
  const getVersion = (): string => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const fromQuery = urlParams.get('version')
      if (fromQuery && fromQuery.trim().length > 0) {
        return fromQuery
      }
    }
    if (props.route.version && props.route.version.trim().length > 0) {
      return props.route.version
    }
    return 'latest'
  }
  const version = getVersion()

  // -------------------------------
  //  GET LIBRARY (default = route.library_id)
  // -------------------------------
  const getLibraryId = (): string | null => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const v = urlParams.get('library')
      return v && v.trim().length > 0 ? v : props.route.library_id || null
    }
    return props.route.library_id || null
  }
  const library_id = getLibraryId()

  // -------------------------------
  //  GET RELEASE (default = route.release_id)
  // -------------------------------
  const getReleaseId = (): string | null => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const v = urlParams.get('release')
      return v && v.trim().length > 0 ? v : props.route.release_id || null
    }
    return props.route.release_id || null
  }
  const release_id = getReleaseId()

  // --------------------------------------------------------------------
  //  RESOLVE EFFECTIVE LIBRARY + RELEASE + VERSION
  // --------------------------------------------------------------------
  let effectiveLibraryId: string | null = library_id
  let effectiveReleaseId: string | null = release_id
  const indexForId = props.route.releasesIndex || {}

  // 1) Fallback to single library if none provided
  if (!effectiveLibraryId && Object.keys(indexForId).length === 1) {
    effectiveLibraryId = Object.keys(indexForId)[0]
  }

  // 2) Fallback to single release if none provided
  if (
    effectiveLibraryId &&
    !effectiveReleaseId &&
    indexForId[effectiveLibraryId] &&
    Object.keys(indexForId[effectiveLibraryId]).length === 1
  ) {
    effectiveReleaseId = Object.keys(indexForId[effectiveLibraryId])[0]
  }

  // 3) Resolve "latest" → real YYYY.MM.DD version if we can
  let effectiveVersion: string = version
  if (
    effectiveLibraryId &&
    effectiveReleaseId &&
    effectiveVersion === 'latest' &&
    indexForId?.[effectiveLibraryId]?.[effectiveReleaseId]?.length
  ) {
    const versions = [
      ...indexForId[effectiveLibraryId][effectiveReleaseId],
    ].sort((a, b) => b.localeCompare(a))
    effectiveVersion = versions[0]
  }

  // --------------------------------------------------------------------
  //  BUILD RAW GITHUB URL FOR YAML
  // --------------------------------------------------------------------
  //if (!effectiveLibraryId || !effectiveReleaseId) {
  //  console.error('❌ Missing library_id/release_id for blueprint download route.')
  //}

  const versionPath = `${effectiveLibraryId}/${effectiveReleaseId}/${effectiveVersion}/${id}.yaml`
  const githubUrl = `https://raw.githubusercontent.com/yarafie/awesome-ha-blueprints/main/website/docs/blueprints/${category}/${id}/${versionPath}`

  const myHomeAssistantURL =
    `https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=` +
    encodeURIComponent(githubUrl)

  // Ensure Supabase always gets physical version + correct library/release
  const versionToRecord = effectiveVersion

  // -------------------------------
  //  USE EFFECT: RECORD + REDIRECT
  // -------------------------------

  useEffect(() => {
    // -------------------------------------------------
    //  FIX: Prevent duplicated runs (back navigation)
    // -------------------------------------------------
    if (typeof window !== 'undefined') {
      if ((window as any).__blueprintDownloadHandled) {
        return
      }
      ;(window as any).__blueprintDownloadHandled = true
    }

    // -------------------------------
    //  VALIDATION GUARD (preserved)
    // -------------------------------
    if (
      !category ||
      !id ||
      !effectiveLibraryId ||
      !effectiveReleaseId ||
      !versionToRecord
    ) {
      console.error('❌ Invalid blueprint download record — aborting insert')
      safeRedirect(myHomeAssistantURL)
      return
    }

    // Track the blueprint download event if user has given consent
    if (consent) {
      trackEvent(
        'blueprint',
        'download',
        `${category}/${id}/${effectiveLibraryId}/${effectiveReleaseId}/${versionToRecord}`,
        undefined,
      )
    }

    // Write to supabase (DB-strict)
    recordBlueprintDownload(
      category,
      id,
      effectiveLibraryId,
      effectiveReleaseId,
      versionToRecord,
    )
      .catch((error) => {
        console.error('❌ Error recording blueprint download:', error)
      })
      .finally(() => {
        // Redirect to HA to download the blueprint
        safeRedirect(myHomeAssistantURL)
      })
  }, [
    consent,
    category,
    id,
    effectiveLibraryId,
    effectiveReleaseId,
    versionToRecord,
    myHomeAssistantURL,
  ])

  // -------------------------------
  //  PAGE DISPLAY DURING REDIRECT
  // -------------------------------
  return (
    <>
      <Head>
        <title>
          Download {category}/{id}
          {effectiveLibraryId ? `/${effectiveLibraryId}` : ''}
          {effectiveReleaseId ? `/${effectiveReleaseId}` : ''}
          {effectiveVersion ? `/${effectiveVersion}` : ''}
        </title>
      </Head>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontSize: '20px',
        }}
      >
        <h1>Thanks for downloading!</h1>
        <p>Redirecting to your Home Assistant instance...</p>
      </div>
    </>
  )
}
