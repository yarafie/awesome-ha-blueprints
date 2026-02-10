/**
 * Plugin: DownloadBlueprint
 * ────────────────────────────────────────────────────────────────
 * Docusaurus function plugin that generates routes for all blueprints
 * Routes follow the pattern: category/id
 *
 * Changelog:
 *   - Updated 2026.12.03 (@yarafie):
 *        Now supports multi-variant controllers such as:
 *          controllers/ikea_e2001_e2002/EPMatt/ikea_e2001_e2002.yaml
 *          controllers/ikea_e2001_e2002/yarafie/ikea_e2001_e2002.yaml
 *
 *        IMPORTANT:
 *        ----------
 *        Route path **MUST depend on both ID + VARIANT** otherwise
 *        Docusaurus will produce duplicate routes:
 *          /blueprints/controllers/ikea_e2001_e2002
 *          /blueprints/controllers/ikea_e2001_e2002   ← duplicate
 *
 *        We now produce:
 *           /blueprints/controllers/ikea_e2001_e2002/EPMatt
 *           /blueprints/controllers/ikea_e2001_e2002/yarafie
 *
 *        Backward compatible with hooks and automations categories
 *
 * ────────────────────────────────────────────────────────────────
 */
import React, { useEffect } from 'react'
// @ts-expect-error no types for this
import Head from '@docusaurus/Head'
import { useConsent } from '@src/contexts/ConsentContext'
import { trackEvent } from '@src/utils/analytics'
import { recordBlueprintDownload } from '@src/services/supabase/supabase'

export default function DownloadBlueprint(props: {
  route: {
    category: string
    id: string
    variant?: string | null
    version?: string | null
    variantsById?: Record<string, string[]> // FIXED TYPING
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
        console.error('Unsafe redirect blocked:', url)
      }
    } catch {
      console.error('Invalid redirect URL:', url)
    }
  }

  // -------------------------------
  //  GET VERSION (default = latest)
  //  Order:
  //    1) ?version= query param
  //    2) route.version (for /:version routes)
  //    3) 'latest'
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
  //  GET VARIANT (controllers only)
  // -------------------------------
  const getVariant = (): string | null => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const v = urlParams.get('variant')
      return v && v.trim().length > 0 ? v : props.route.variant || null
    }
    return props.route.variant || null
  }
  const variant = getVariant()

  // --------------------------------------------------------------------
  //  RESOLVE EFFECTIVE VARIANT + VERSION (controllers only)
  // --------------------------------------------------------------------
  let effectiveVariant: string | null = variant

  // 1) Controllers — fallback to single variant if none provided
  if (
    category === 'controllers' &&
    !effectiveVariant &&
    props.route.variantsById &&
    Object.keys(props.route.variantsById).length === 1
  ) {
    effectiveVariant = Object.keys(props.route.variantsById)[0]
  }

  // 2) Hooks + Automations — enforce Variant = "EPMatt"
  if (category !== 'controllers') {
    effectiveVariant = 'EPMatt'
  }

  // 3) Resolve "latest" → real YYYY.MM.DD version for controllers
  let effectiveVersion: string = version
  if (
    category === 'controllers' &&
    effectiveVersion === 'latest' &&
    effectiveVariant &&
    props.route.variantsById?.[effectiveVariant]?.length
  ) {
    const versions = [...props.route.variantsById[effectiveVariant]].sort(
      (a, b) => b.localeCompare(a),
    )
    effectiveVersion = versions[0]
  }

  // --------------------------------------------------------------------
  //  BUILD RAW GITHUB URL FOR YAML
  // --------------------------------------------------------------------
  let githubUrl: string

  if (category === 'controllers') {
    if (!effectiveVariant && typeof window !== 'undefined') {
      console.error('Missing variant for controller download route.')
    }

    const versionPath = `${effectiveVariant}/${effectiveVersion}/${id}.yaml`

    githubUrl = `https://raw.githubusercontent.com/yarafie/awesome-ha-blueprints/main/website/docs/blueprints/${category}/${id}/${versionPath}`
  } else {
    // AUTOMATIONS + HOOKS
    githubUrl = `https://raw.githubusercontent.com/yarafie/awesome-ha-blueprints/main/website/docs/blueprints/${category}/${id}/${id}.yaml`
  }

  const myHomeAssistantURL =
    `https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=` +
    encodeURIComponent(githubUrl)

  // Ensure Supabase always gets physical version + correct variant
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
        return // Abort duplicate run (prevents bad DB inserts)
      }
      ;(window as any).__blueprintDownloadHandled = true
    }

    // Track the blueprint download event if user has given consent
    if (consent) {
      trackEvent(
        'blueprint',
        'download',
        category === 'controllers'
          ? `${category}/${id}/${effectiveVariant}/${versionToRecord}`
          : `${category}/${id}`,
        undefined,
      )
    }

    const record = {
      category,
      id,
      variant: effectiveVariant || null,
      version: versionToRecord,
    }

    // Write to supabase
    recordBlueprintDownload(
      record.category,
      record.id,
      record.variant,
      record.version,
    )
      .then((success) => {
        if (!success) {
          console.error('Failed to record blueprint download in database')
        }
      })
      .catch((error) => {
        console.error('Error recording blueprint download:', error)
      })
      .finally(() => {
        // Redirect to HA to download the blueprint
        safeRedirect(myHomeAssistantURL)
      })
  }, [
    consent,
    category,
    id,
    effectiveVariant,
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
          {effectiveVariant ? `/${effectiveVariant}` : ''}
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
