/**
 * PageHeader
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Deterministic page header for application pages
 *  - Fully owns typography, alignment, and internal spacing
 *
 * Design guarantees:
 *  - Does NOT rely on Docusaurus h1 / p defaults
 *  - Does NOT assume page, feature, or auth context
 *  - Does NOT control spacing between sections (AppLayout does)
 *
 * Responsibilities:
 *  - Render title
 *  - Render optional subtitle
 *  - Render optional actions slot (buttons, links, badges, etc.)
 *
 * Usage:
 *  - Intended to be the FIRST child inside AppLayout
 */

import React from 'react'

interface PageHeaderProps {
  /** Primary page title */
  title: string

  /** Optional subtitle / description */
  subtitle?: string

  /** Optional actions (buttons, links, status chips, etc.) */
  actions?: React.ReactNode
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
}) => {
  return (
    <header>
      {/* Title + actions row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap', // mobile-safe
        }}
      >
        {/* Title block */}
        <div>
          {/* Title */}
          <div
            style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              lineHeight: 1.25,
              marginBottom: subtitle ? '0.75rem' : 0,
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div
              style={{
                fontSize: '1rem',
                lineHeight: 1.6,
                opacity: 0.8,
                maxWidth: 720,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Actions slot */}
        {actions && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexShrink: 0,
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

export default PageHeader
