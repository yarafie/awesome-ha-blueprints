/**
 * AppLayout
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Single layout shell for application pages
 *  - Owns horizontal centering and vertical spacing
 */

import React from 'react'

interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <main
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1100,
          paddingInline: '24px',
          paddingTop: '64px', // accounts for navbar
          paddingBottom: '96px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '48px', // spacing BETWEEN PageHeader and app content
          }}
        >
          {children}
        </div>
      </div>
    </main>
  )
}

export default AppLayout
