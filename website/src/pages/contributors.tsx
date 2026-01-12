/**
 * Page: Contributors
 * ────────────────────────────────────────────────────────────────
 *
 * Docusaurus routing entrypoint:
 *  - File path == route path
 *  - Keep this file thin: render the Contributors feature shell only
 */
import React from 'react'
import ContributorsApp from '../contributors/ui/ContributorsApp'

const ContributorsPage: React.FC = () => {
  return (
    <main>
      <ContributorsApp />
    </main>
  )
}

export default ContributorsPage
