/**
 * Component: CategoryCard
 * ────────────────────────────────────────────────────────────────
 *
 * Changelog:
 *   • Initial Version (@EPMatt)
 *   - Updated 2025.12.29 (@yarafie):
 *     1. Renamed from BlueprintCategoryCard to CategoryCard
 *     2. Force equal-height cards within row
 *     3. UI/UX polish with dark/light mode safe colors
 *     4. Removed category label above title
 *   - Updated 2025.12.31:
 *     5. Proper height handling (no squishing, no minHeight hacks)
 *     6. Stable CTA sizing (no wrap, no clipping)
 *   - Updated 2026.01.04 (@yarafie):
 *     7. Unified CTA label to fixed "Explore" for visual consistency
 * ────────────────────────────────────────────────────────────────
 */
import React from 'react'
import * as Icons from 'react-bootstrap-icons'
import Link from '@docusaurus/Link'

interface CategoryCardProps {
  icon: string
  color: string
  name: string
  description: string
  id: string
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  icon,
  color,
  name,
  description,
  id,
}) => {
  const Icon = (
    Icons as unknown as Record<string, React.ComponentType<{ size?: number }>>
  )[icon]

  return (
    <div
      className='col col--4 padding-bottom--lg'
      // className='col col--12 col--6--md col--4--lg padding-bottom--lg'
      style={{ display: 'flex' }}
    >
      <div
        className='card shadow--md'
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          borderRadius: 14,
          background: 'var(--ifm-background-surface-color)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.25)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = ''
        }}
      >
        {/* Header */}
        <div
          className='card__header padding-vert--xl'
          style={{
            backgroundColor: color,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              background: 'var(--ifm-background-surface-color)',
              borderRadius: 999,
              padding: 14,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 0 1px var(--ifm-color-emphasis-300)',
            }}
            aria-hidden='true'
          >
            {Icon && <Icon size={36} color='var(--ifm-color-content)' />}
          </div>
        </div>

        {/* Body */}
        <div
          className='card__body'
          style={{
            flexGrow: 1,
            paddingTop: 20,
            paddingBottom: 20,
          }}
        >
          <h3 style={{ marginBottom: '0.5rem' }}>{name}</h3>
          <p
            style={{
              fontSize: '0.95rem',
              lineHeight: 1.6,
              color: 'var(--ifm-color-content-secondary)',
              marginBottom: 0,
            }}
          >
            {description}
          </p>
        </div>

        {/* Footer / CTA */}
        <div
          className='card__footer'
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingBottom: 20,
          }}
        >
          <Link
            to={`/docs/blueprints/${id}`}
            className='button button--primary'
            style={{
              fontWeight: 600,
              whiteSpace: 'nowrap',
              padding: '12px 28px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Explore
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CategoryCard
