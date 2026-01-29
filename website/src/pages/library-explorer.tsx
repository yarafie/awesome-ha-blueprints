/**
 * LibraryExplorerPage
 *
 * Read-only schema-driven explorer for the Awesome HA Library.
 *
 * This page assumes authentication/authorization has already
 * been handled upstream (e.g. maintainer access).
 *
 * No mutation, no side effects.
 */

import React from 'react'
import Layout from '@theme/Layout'
import LibrarySelectorStrip from '@library/maintainer/LibrarySelectorStrip'

export default function LibraryExplorerPage(): JSX.Element {
  return (
    <Layout title='Library Explorer'>
      <main
        style={{
          padding: '2rem',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <h1 style={{ marginBottom: '1.5rem' }}>Library Explorer</h1>

        <LibrarySelectorStrip />
      </main>
    </Layout>
  )
}
