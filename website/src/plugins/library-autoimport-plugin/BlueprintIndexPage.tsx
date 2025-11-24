import React from 'react'
import Layout from '@theme/Layout'

export default function BlueprintIndexPage(props: any) {
  const modules = props?.route?.modules || {}
  const rawBlueprints = modules.blueprints
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
        <p>
          These blueprints are loaded from the new <code>library/</code>{' '}
          architecture.
        </p>

        {blueprints.length === 0 ? (
          <p>No blueprints found in the library.</p>
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
