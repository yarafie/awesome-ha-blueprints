import * as Icons from 'react-bootstrap-icons'
import Link from '@docusaurus/Link'
import React from 'react'

interface BlueprintCategoryCardProps {
  icon: string
  color: string
  name: string
  description: string
  id: string
}

/**
 * Determine if category exists in the new /library system.
 * This global comes from library-autoimport-plugin.
 */
function resolveCategoryLink(categoryId: string): string {
  if (typeof window !== 'undefined') {
    const categories = (window as any).__AHB_LIBRARY_CATEGORIES__ as
      | string[]
      | undefined

    if (categories && categories.includes(categoryId)) {
      return `/awesome-ha-blueprints/library/${categoryId}`
    }
  }
  // fallback → old docs system
  return `/docs/blueprints/${categoryId}`
}

const BlueprintCategoryCard: React.FC<BlueprintCategoryCardProps> = ({
  icon,
  color,
  name,
  description,
  id,
}) => {
  const IconComponent = (Icons as any)[icon] || Icons.InfoCircle
  const link = resolveCategoryLink(id)

  return (
    <div className='col col--4 margin-bottom--lg'>
      <div className='card'>
        <div className='card__header'>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <IconComponent size={28} color={color} />
            <h3>{name}</h3>
          </div>
        </div>

        <div className='card__body'>
          <p>{description}</p>
        </div>

        <div className='card__footer'>
          <Link to={link} className='button button--primary button--block'>
            Explore
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BlueprintCategoryCard
