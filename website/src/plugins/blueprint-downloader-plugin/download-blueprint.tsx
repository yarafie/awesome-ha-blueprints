import React, { useEffect } from 'react'
// @ts-expect-error no types for this
import Head from '@docusaurus/Head'
import { useConsent } from '../../contexts/ConsentContext'
import { trackEvent } from '../../utils/analytics'
import { recordBlueprintDownload } from '../../services/supabase'

export default function DownloadBlueprint(props: {
  route: { category: string; id: string }
}) {
  const category = props.route.category
  const id = props.route.id
  const { consent } = useConsent()

  // Safe redirect validator
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

  // Get the version from URL parameters (defaults to 'latest')
  const getVersion = (): string => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get('version') || 'latest'
    }
    return 'latest'
  }

  const version = getVersion()

  // Blueprint YAML now stored in: website/docs/blueprints/<category>/<id>/<id>.yaml
  const githubUrl = `https://raw.githubusercontent.com/yarafie/awesome-ha-blueprints/main/website/docs/blueprints/${category}/${id}/${id}.yaml`
  const myHomeAssistantURL = `https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=${encodeURIComponent(githubUrl)}`

  useEffect(() => {
    // Track the blueprint download event if user has given consent
    if (consent) {
      // Track in Google Analytics
      trackEvent('blueprint', 'download', `${category}/${id}`, undefined)
    }

    // Record download in Supabase
    // This is not personal information, so we can record it without explicit consent
    recordBlueprintDownload(category, id, version)
      .then((success) => {
        if (!success) {
          console.error('Failed to record blueprint download in database')
        }
      })
      .catch((error) => {
        console.error('Error recording blueprint download:', error)
      })
      .finally(() => {
        // Safe redirect (replaced direct assignment)
        // window.location.href = myHomeAssistantURL
        safeRedirect(myHomeAssistantURL)
      })
  }, [consent, category, id, version, myHomeAssistantURL])

  return (
    <>
      <Head>
        <title>
          Download {category}/{id}
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
