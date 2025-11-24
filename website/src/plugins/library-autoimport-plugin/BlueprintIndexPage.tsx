import React from 'react'
import Layout from '@theme/Layout'

export default function BlueprintIndexPage(props: any) {
  // Docusaurus passes module data under route.modules
  const modules = props?.route?.modules || {}
  const rawBlueprints = modules.blueprints

  // Support both “module with .default” and plain array
  const blueprints: any[] = rawBlueprints?.default ?? rawBlueprints ?? []

  return (
    <Layout title='Blueprint Library' description='All Blueprint Packages'>
      <div
        style={{
          padding: '2rem',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <h1>Blueprint Library</h1>
        <p>These blueprints are loaded from the new library/ architecture.</p>

        {blueprints.length === 0 ? (
          <p>No blueprints found in the library/ folder.</p>
        ) : (
          <ul style={{ marginTop: '2rem' }}>
            {blueprints.map((bp) => (
              <li key={`${bp.category}-${bp.slug}`}>
                <a
                  href={`/awesome-ha-blueprints/library/${bp.category}/${bp.slug}`}
                >
                  {bp.metadata?.title ?? `${bp.category} / ${bp.slug}`}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  )
}
