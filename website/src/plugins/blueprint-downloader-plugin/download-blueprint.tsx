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
 *        Backward compatible with hooks and automation categories
 *
 * ────────────────────────────────────────────────────────────────
 */

import React, { useEffect } from 'react'
// @ts-expect-error no types for this
import Head from '@docusaurus/Head'
import { useConsent } from '../../contexts/ConsentContext'
import { trackEvent } from '../../utils/analytics'
import { recordBlueprintDownload } from '../../services/supabase'

export default function DownloadBlueprint(props: {
  route: {
    category: string
    id: string
    variant?: string | null
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
  // -------------------------------
  const getVersion = (): string => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get('version') || 'latest'
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

  // ----------------------------------------------------------
  //  BUILD RAW GITHUB URL FOR YAML (depends on category)
  // ----------------------------------------------------------
  let githubUrl: string

  if (category === 'controllers') {
    if (!variant && typeof window !== 'undefined') {
      console.error('Missing variant for controller download route.')
    }

    // Resolve real latest version only if needed
    let effectiveVersion = version

    if (
      effectiveVersion === 'latest' &&
      variant &&
      props.route.variantsById?.[variant]
    ) {
      const versions = props.route.variantsById[variant].sort((a, b) =>
        b.localeCompare(a),
      )
      effectiveVersion = versions[0]
    }

    const versionPath = `${variant}/${effectiveVersion}/${id}.yaml`

    githubUrl = `https://raw.githubusercontent.com/yarafie/awesome-ha-blueprints/main/website/docs/blueprints/${category}/${id}/${versionPath}`
  } else {
    // AUTOMATION + HOOKS
    githubUrl = `https://raw.githubusercontent.com/yarafie/awesome-ha-blueprints/main/website/docs/blueprints/${category}/${id}/${id}.yaml`
  }

  const myHomeAssistantURL =
    `https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=` +
    encodeURIComponent(githubUrl)

  // Record download in Supabase
  // This is not personal information, so we can record it without explicit consent
  // Use effectiveVersion when controllers resolve "latest"
  let versionToRecord = version

  if (category === 'controllers') {
    if (
      version === 'latest' &&
      variant &&
      props.route.variantsById?.[variant]
    ) {
      const versions = props.route.variantsById[variant].sort((a, b) =>
        b.localeCompare(a),
      )
      versionToRecord = versions[0]
    }
  }

  // -------------------------------
  //  USE EFFECT: RECORD + REDIRECT
  // -------------------------------
  useEffect(() => {
    // Track the blueprint download event if user has given consent
    if (consent) {
      trackEvent(
        'blueprint',
        'download',
        category === 'controllers'
          ? `${category}/${id}/${variant}/${versionToRecord}`
          : `${category}/${id}`,
        undefined,
      )
    }

    // Build record
    const record = {
      category,
      id,
      variant: variant || null,
      version: versionToRecord,
    }

    // Write to supabase
    recordBlueprintDownload(
      record.category,
      record.id,
      record.version,
      record.variant,
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
  }, [consent, category, id, variant, version, myHomeAssistantURL])

  // -------------------------------
  //  PAGE DISPLAY DURING REDIRECT
  // -------------------------------
  return (
    <>
      <Head>
        <title>
          Download {category}/{id}
          {version ? `/${version}` : ''}
          {variant ? `/${variant}` : ''}
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
