import React from 'react'
import Link from '@docusaurus/Link'
import { ChevronRight } from 'react-bootstrap-icons'

interface BlueprintItemProps {
  id: string
  title: string
  description: string
  category: string
  overrideUrl?: string
}

const BlueprintItem: React.FC<BlueprintItemProps> = ({
  id,
  title,
  description,
  category,
  overrideUrl,
}) => {
  // Default new system URL
  const libUrl = `/awesome-ha-blueprints/library/${category}/${id}`

  // Legacy fallback path
  const legacyUrl = `/awesome-ha-blueprints/docs/blueprints/${category}/${id}`

  // If overrideUrl exists, use it.
  // Otherwise use new-library URL.
  const finalUrl = overrideUrl ?? libUrl

  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
  }

  const footerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
  }

  return (
    <Link to={finalUrl} className='card margin-bottom--md'>
      <div style={cardStyle}>
        <div>
          <h3>{title}</h3>
        </div>

        <div className='card__body'>
          <p>{description}</p>
        </div>

        <div className='card__footer' style={footerStyle}>
          <ChevronRight size={20} />
        </div>
      </div>
    </Link>
  )
}

export default BlueprintItem
