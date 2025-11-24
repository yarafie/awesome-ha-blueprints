import React, { useEffect, useState } from 'react'
import Layout from '@theme/Layout'
import yaml from 'js-yaml'

export default function DownloadBlueprintPage(props: any) {
  const { yamlPath, category, id, source } = props

  const [yamlContent, setYamlContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        // yamlPath is an absolute FS path inside build output
        const response = await fetch(yamlPath)
        if (!response.ok) {
          throw new Error(
            `Failed to fetch YAML: HTTP ${response.status} (${yamlPath})`,
          )
        }

        const text = await response.text()
        setYamlContent(text)
      } catch (err: any) {
        console.error('YAML load error:', err)
        setError(err.message)
      }
    }

    load()
  }, [yamlPath])

  function handleDownload() {
    if (!yamlContent) return

    const blob = new Blob([yamlContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `${id}.yaml`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout
      title='Download Blueprint'
      description='Download Home Assistant Blueprint'
    >
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1>Download Blueprint</h1>

        <p>
          <b>Category:</b> {category}
          <br />
          <b>ID:</b> {id}
          <br />
          <b>Source:</b>{' '}
          {source === 'library' ? 'New Library System' : 'Legacy Blueprints'}
        </p>

        {error && (
          <p style={{ color: 'red' }}>
            ❌ Error loading blueprint YAML: {error}
          </p>
        )}

        {!error && yamlContent === null && <p>Loading YAML…</p>}

        {yamlContent && (
          <>
            <button
              onClick={handleDownload}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'var(--ifm-color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '1.5rem',
              }}
            >
              Download YAML
            </button>

            <pre
              style={{
                background: '#f5f5f5',
                padding: '1rem',
                borderRadius: '6px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {yamlContent}
            </pre>
          </>
        )}
      </div>
    </Layout>
  )
}
