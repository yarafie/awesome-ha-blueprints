/**
 * Page: Contributors
 * ────────────────────────────────────────────────────────────────
 * Docusaurus routing entrypoint (file path == route path).
 * Keeps to the site layout and mounts the ContributorsApp.
 */

import React from 'react'
import Layout from '@theme/Layout'

import ContributorsApp from '@library/contributors/ContributorsApp'

export default function ContributorsPage(): React.ReactElement {
  return (
    <Layout
      title='Contribute'
      description='Add a controller blueprint to the Awesome HA Library.'
    >
      <ContributorsApp />
    </Layout>
  )
}
