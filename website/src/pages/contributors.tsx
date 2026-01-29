/**
 * Page: Contributors
 * ────────────────────────────────────────────────────────────────
 *
 * Docusaurus routing entrypoint:
 *  - File path == route path
 *  - Keep this file thin
 *
 * Responsibilities:
 *  - Select page-level layout
 *  - Define page header (title / subtitle / actions)
 *  - Mount ContributorsApp
 */

import React from 'react'

import AppLayout from '@library/layout/AppLayout'
import PageHeader from '@library/layout/PageHeader'
import ContributorsApp from '@library/contributors/ContributorsApp'

const ContributorsPage: React.FC = () => {
  return (
    <AppLayout>
      <PageHeader title='Welcome to Awesome HA Library Contributors Page' />
      <ContributorsApp />
    </AppLayout>
  )
}

export default ContributorsPage
